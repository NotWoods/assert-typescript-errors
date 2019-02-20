import { Transform, Writable, Readable } from 'stream';
import { copy, ExpectedErrors, parse, ParsedExpectedErrors } from './whitelist';

const NEWLINE_REGEX = /\r?\n/;

/**
 * Regex for lines outputted by `tsc`.
 * 1st capture group: filename
 * 2nd capture group: line number
 */
const TS_ERROR_REGEX = /^(.+)\((\d+),\d+\):/;

export class TSError extends Error {}

export class Split extends Transform {
    soFar?: string;

    /**
     * @param chunk is the data from the Readable Stream.
     * @param _encoding is the string encoding, but isn't used here.
     * @param next is a callback function called when you finish working
     * with this chunk.
     */
    _transform(
        chunk: Buffer | string,
        _encoding: string,
        next: (error?: Error | null) => void,
    ) {
        /*
         * this.soFar represents the current line so far.
         * First, this.soFar is replaced with "" if it is null or undefined.
         *   This happens with the first chunk and if Array.pop() is called
         *   on an empty array.
         * Next, the soFar string is combined with the string provided by
         *   the stream ("chunk"). .toString() converts buffers to strings.
         * Finally, the string is split at the newline character defined
         *   by the \r?\n RegEx. This RegEx translates to either
         *   "\r\n" or "\n", which are the two end of line characters used by
         *   Windows and Unix respectively.
         */
        const lines = (
            (this.soFar != null ? this.soFar : '') + chunk.toString()
        ).split(NEWLINE_REGEX);

        /*
         * The last element of the array, aka data after the last complete line,
         *   is removed with Array.pop() and stored in this.soFar for future
         */
        this.soFar = lines.pop();

        /*
         * Each complete line is sent as a seperate push. If no line is
         *   completed, this.push isn't called so nothing is outputted that time.
         */
        for (const line of lines) {
            this.push(line);
        }

        /* next() indicates that operations on this chunk are done. */
        next();
    }

    /**
     * If the file does not end in a newline, flush will output the
     * remaining this.soFar data from the last line.
     */
    _flush(done: (error?: Error | null) => void) {
        if (this.soFar) {
            this.push(this.soFar);
        }

        /* done() indicates that operations are done. */
        done();
    }
}

/**
 * Writable stream that expects strings split by newlines as input.
 */
export class AssertTypeScriptErrors extends Writable {
    /** Parsed whitelist */
    readonly whitelist: ParsedExpectedErrors;
    /** Whitelist that contains lines that have not been seen by the stream. */
    readonly copy: ParsedExpectedErrors;
    constructor(whitelist: ExpectedErrors) {
        super({ decodeStrings: false });
        this.whitelist = parse(whitelist);
        this.copy = copy(this.whitelist);
    }

    _write(
        line: Buffer | string,
        encoding: string,
        next: (error?: Error | null) => void,
    ) {
        line = line.toString();
        if (encoding !== 'utf8' && encoding !== 'buffer') {
            next(new TypeError(`Wrong encoding ${encoding}`));
            return;
        }

        const matches = line.match(TS_ERROR_REGEX);
        if (matches != null) {
            const filename = matches[1];
            const lineNumber = parseInt(matches[2], 10);

            const linesToAssert = this.whitelist[filename];
            if (linesToAssert != null && linesToAssert.has(lineNumber)) {
                this.copy[filename].delete(lineNumber);
                next();
            } else {
                next(new TSError(line));
            }
        } else {
            // Line does not contain an error message
            next();
        }
    }

    _final(done: (error?: Error | null) => void) {
        // Check if any of the sets are not empty
        const failedAssertionFiles = Object.keys(this.copy).filter(
            key => this.copy[key].size > 0,
        );

        if (failedAssertionFiles.length === 0) {
            // Everything is empty, all good!
            done();
        } else {
            let errorMessage = 'Some lines did not have a type error:';
            failedAssertionFiles.forEach(file => {
                const lines = Array.from(this.copy[file]).join();
                errorMessage += `\n  ${file}: ${lines}`;
            });
            done(new Error(errorMessage));
        }
    }
}

export class StringToStream extends Readable {
    constructor(str: string) {
        super();
        this.push(str);
        this.push(null);
    }

    _read() {}
}
