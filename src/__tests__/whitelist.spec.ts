import { parse } from '../whitelist';

describe('parse', () => {
    test('should convert iterables', () => {
        expect(
            parse({ 'foo.ts': [1, 3, 4], 'bar.ts': new Set([3, 1, 5]) }),
        ).toEqual({
            'foo.ts': new Set([1, 3, 4]),
            'bar.ts': new Set([3, 1, 5]),
        });
    });

    test('should convert ranges', () => {
        expect(
            parse({
                'foo.ts': [1, 3, '4-6'],
                'bar.ts': new Set(['1-6', 1, 5]),
            }),
        ).toEqual({
            'foo.ts': new Set([1, 3, 4, 5, 6]),
            'bar.ts': new Set([1, 2, 3, 4, 5, 6]),
        });
    });

    test('should throw for bad ranges', () => {
        expect(() => parse({ 'foo.ts': ['46'] })).toThrow(TypeError);
        expect(() => parse({ 'bar.ts': new Set(['app-6', 1, 5]) })).toThrow(
            TypeError,
        );
    });
});
