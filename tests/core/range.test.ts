import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('Parsimmon.range', () => {
  const codes = {
    a: 'a'.charCodeAt(0),
    z: 'z'.charCodeAt(0),
    MIN: 0,
    MAX: 255,
  };
  const a2z = Parsimmon.range('a', 'z');

  it('should reject characters before the range', function () {
    for (var i = codes.MIN; i < codes.a; i++) {
      var s = String.fromCharCode(i);
      // assert.strictEqual(a2z.parse(s).status, false);
      expect(a2z.parse(s).status).toStrictEqual(false);
    }
  });

  it('should reject characters after the range', function () {
    for (var i = codes.z + 1; i <= codes.MAX; i++) {
      var s = String.fromCharCode(i);
      // assert.strictEqual(a2z.parse(s).status, false);
      expect(a2z.parse(s).status).toStrictEqual(false);
    }
  });

  it('should accept characters in the range', function () {
    for (var i = codes.a; i <= codes.z; i++) {
      var s = String.fromCharCode(i);
      // assert.strictEqual(a2z.parse(s).status, true);
      expect(a2z.parse(s).status).toStrictEqual(true);
    }
  });
});
