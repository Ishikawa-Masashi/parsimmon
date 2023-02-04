import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('Fantasy Land Apply', () => {
  const equivalentParsers = (p1, p2, inputs) => {
    for (let i = 0; i < inputs.length; i++) {
      // assert.deepEqual(p1.parse(inputs[i]), p2.parse(inputs[i]));
      expect(p1.parse(inputs[i])).toEqual(p2.parse(inputs[i]));
    }
  };

  it('composition', function () {
    function reverse(s) {
      return s.split('').reverse().join('');
    }

    function upperCase(s) {
      return s.toUpperCase();
    }

    function compose(f) {
      return function (g) {
        return function (x) {
          return f(g(x));
        };
      };
    }

    var p1 = Parsimmon.all
      .ap(Parsimmon.of(reverse))
      .ap(Parsimmon.of(upperCase));

    var p2 = Parsimmon.all.ap(
      Parsimmon.of(reverse).ap(Parsimmon.of(upperCase).map(compose))
    );

    equivalentParsers(p1, p2, ['ok cool']);
  });
});
