import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('Fantasy Land Applicative', () => {
  const equivalentParsers = (p1, p2, inputs) => {
    for (let i = 0; i < inputs.length; i++) {
      // assert.deepEqual(p1.parse(inputs[i]), p2.parse(inputs[i]));
      expect(p1.parse(inputs[i])).toEqual(p2.parse(inputs[i]));
    }
  };

  it('identity', function () {
    const p1 = Parsimmon.any;
    const p2 = p1.ap(
      Parsimmon.of(function (x) {
        return x;
      })
    );
    equivalentParsers(p1, p2, ['x', 'z', 'æ', '1', '']);
  });

  it('homomorphism', function () {
    function fn(s) {
      return s.toUpperCase();
    }
    let input = 'nice';
    var p1 = Parsimmon.of(input).ap(Parsimmon.of(fn));
    var p2 = Parsimmon.of(fn(input));
    // assert.deepEqual(p1.parse(""), p2.parse(""));
    expect(p1.parse('')).toEqual(p2.parse(''));
  });

  it('interchange', function () {
    function increment(x) {
      return x + 1;
    }
    var input = 3;
    var p1 = Parsimmon.of(input).ap(Parsimmon.of(increment));
    var p2 = Parsimmon.of(increment).ap(
      Parsimmon.of(function (f) {
        return f(input);
      })
    );
    // assert.deepEqual(p1.parse(""), p2.parse(""));
    expect(p1.parse('')).toEqual(p2.parse(''));
  });
});
