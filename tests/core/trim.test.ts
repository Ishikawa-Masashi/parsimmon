import { describe, it, beforeAll, afterAll, expect, test } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

test('', () => {
  beforeAll(function () {
    Parsimmon._supportsSet = false;
  });

  afterAll(function () {
    Parsimmon._supportsSet = undefined;
  });
  describe('parser.trim', () => {
    it('should remove stuff from the begin and end', () => {
      const parser = Parsimmon.letters.trim(Parsimmon.whitespace);
      const value = parser.tryParse('\t\n NICE    \t\t ');
      // assert.strictEqual(value, "NICE");
      expect(value).toBe('NICE');
    });
  });
});
