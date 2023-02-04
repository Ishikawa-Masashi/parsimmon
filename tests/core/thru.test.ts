import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('parser.thru', () => {
  it('should return wrapper(this)', function () {
    function arrayify(x) {
      return [x];
    }
    const parser = Parsimmon.string('');
    const array = parser.thru(arrayify);
    // assert.strictEqual(array[0], parser);
    expect(array[0]).toBe(parser);
  });
});
