import { createReadStream, readFile } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { assertTypeScriptErrors } from '../index';
import { ExpectedErrors } from '../whitelist';

const readFileAsync = promisify(readFile);

describe('assertTypeScriptErrors', () => {
    test('throws if error did not occur', async () => {
        const assertions: ExpectedErrors = {
            'test.ts': [29],
        };
        await expect(assertTypeScriptErrors('', assertions)).rejects.toThrow(
            'Some lines did not have a type error',
        );
    });

    test('throws on unwanted errors', async () => {
        const output = `test/type-test.ts(57,13): error TS2345: Argument of type '"213"' is not assignable to parameter of type 'number'.`;
        await expect(assertTypeScriptErrors(output, {})).rejects.toThrow(
            output,
        );
    });

    test('asserts on errors from tsc', async () => {
        const output = await readFileAsync(
            join(__dirname, 'tsc-output.txt'),
            'utf8',
        );
        const assertions: ExpectedErrors = {
            'test/type-test.ts': [
                29,
                31,
                39,
                '45-51',
                50,
                51,
                '57-58',
                '74-75',
                '91-92',
                '97-103',
            ],
        };
        await assertTypeScriptErrors(output, assertions);
    });

    test('asserts on streamed errors from tsc', async () => {
        const output = createReadStream(
            join(__dirname, 'tsc-output.txt'),
            'utf8',
        );
        const assertions: ExpectedErrors = {
            'test/type-test.ts': [
                29,
                31,
                39,
                '45-51',
                50,
                51,
                '57-58',
                '74-75',
                '91-92',
                '97-103',
            ],
        };
        await assertTypeScriptErrors(output, assertions);
    });
});
