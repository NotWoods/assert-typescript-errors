# assert-typescript-errors

Automatically verify that certain test files **fail** to pass TypeScript type
checks.

## Usage

### As a module

```js
import { exec } from 'child_process';
import { assertTypeScriptErrors } from 'assert-typescript-errors';

/**
 * Specify the lines that should have errors in your test files.
 */
const assertions = {
    'test/type-test.ts': [
        29, // Individual line numbers can be used
        '57-58', // Ranges of line numbers can also be specified. Equivalent to 57, 58.
    ],
    'test/type-test-two.ts': [31, 39, '45-51'],
};

exec('tsc', (err, stdout) => {
    assertTypeScriptErrors(stdout, assertions).catch(console.error);
});
```

### From the command line

```sh
tsc | assert-ts-errors
```
