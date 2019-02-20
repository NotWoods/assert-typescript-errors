import { Readable } from 'stream';
import { AssertTypeScriptErrors, Split, StringToStream } from './streams';
import { ExpectedErrors } from './whitelist';

export function assertTypeScriptErrors(
    stdin: string | Readable,
    whitelist: ExpectedErrors,
): Promise<void> {
    // Convert string to stream
    if (typeof stdin === 'string') {
        stdin = new StringToStream(stdin);
    }

    const stream = stdin
        .pipe(new Split())
        .pipe(new AssertTypeScriptErrors(whitelist));
    return new Promise((resolve, reject) => {
        stream.once('finish', resolve).once('error', reject);
    });
}
