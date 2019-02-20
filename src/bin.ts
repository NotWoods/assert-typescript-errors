import { assertTypeScriptErrors } from './index';
import { readFileSync } from 'fs';

if (process.argv.length !== 3) {
    throw new TypeError(`Expected 1 argument, got ${process.argv.length - 2}`);
}

const whitelistPath = process.argv[2];
const whitelist = JSON.parse(readFileSync(whitelistPath, 'utf8'));

assertTypeScriptErrors(process.stdin, whitelist).catch(console.error);
