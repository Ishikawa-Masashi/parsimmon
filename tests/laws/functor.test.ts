import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('Fantasy Land Functor', () => {
  const equivalentParsers = (p1, p2, inputs) => {
    for (let i = 0; i < inputs.length; i++) {
      // assert.deepEqual(p1.parse(inputs[i]), p2.parse(inputs[i]));
      expect(p1.parse(inputs[i])).toEqual(p2.parse(inputs[i]));
    }
  };

  it('identity', () => {
    const p1 = Parsimmon.digits;
    const p2 = Parsimmon.digits.map((x) => x);
    equivalentParsers(p1, p2, ['091', '111111', '46782792', 'oops']);
  });

  it('composition', function () {
    function increment(x) {
      return x + 1;
    }
    var p1 = Parsimmon.digits.map(function (x) {
      return increment(Number(x));
    });
    var p2 = Parsimmon.digits.map(Number).map(increment);

    equivalentParsers(p1, p2, [
      '12',
      '98789',
      '89772371298389217387128937979839821738',
      'oh no!',
    ]);
  });
});
