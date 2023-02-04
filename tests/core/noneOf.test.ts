import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('noneOf', () => {
  it('matches EVERYTHING BUT the characters specified', () => {
    const parser = Parsimmon.noneOf('abc');
    const a = 'a'.charCodeAt(0);
    const c = 'c'.charCodeAt(0);
    for (let i = 0; i < 255; i++) {
      const s = String.fromCharCode(i);
      if (a <= i && i <= c) {
        // assert.strictEqual(parser.parse(s).status, false);
        expect(parser.parse(s).status).toStrictEqual(false);
      } else {
        // assert.strictEqual(parser.parse(s).status, true);
        expect(parser.parse(s).status).toStrictEqual(true);
      }
    }
  });
});
