/**
 * An expected errors object contains file path keys with line number arrays as values.
 * Each array may contain either individual line numbers or a range of numbers
 * such as `"1-5"`, as a string with two numbers separated by a dash. Ranges
 * are inclusive, so both the start line and end line will be counted.
 */
export interface ExpectedErrors {
    [filename: string]: Iterable<string | number>;
}

/**
 * Internally the whitelist is represented as a set of line numbers.
 * Ranges are automatically converted into separate numbers.
 */
export interface ParsedExpectedErrors extends ExpectedErrors {
    [filename: string]: Set<number>;
}

/**
 * Parse a whitelist and convert it to a ParsedErrorWhitelist.
 */
export function parse(whitelist: ExpectedErrors) {
    return Object.keys(whitelist).reduce<ParsedExpectedErrors>(
        (processed, filename) => {
            const lineNumbers = new Set<number>();
            for (const line of whitelist[filename]) {
                if (typeof line === 'string') {
                    // Convert range to numbers
                    const [start, end] = line
                        .split('-', 2)
                        .map(n => parseInt(n, 10));
                    if (isNaN(start) || isNaN(end)) {
                        throw new TypeError(`Invalid range ${line}`);
                    }

                    for (let i = start; i <= end; i++) {
                        lineNumbers.add(i);
                    }
                } else {
                    // Add number
                    lineNumbers.add(line);
                }
            }
            processed[filename] = lineNumbers;
            return processed;
        },
        {},
    );
}

/**
 * Duplicate a whitelist.
 */
export function copy(whitelist: ParsedExpectedErrors) {
    return Object.keys(whitelist).reduce<ParsedExpectedErrors>(
        (processed, filename) => {
            processed[filename] = new Set(whitelist[filename]);
            return processed;
        },
        {},
    );
}
