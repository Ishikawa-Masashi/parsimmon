import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('Fantasy Land Semigroup', function () {
  it('associativity', function () {
    const a = Parsimmon.string('a');
    const b = Parsimmon.string('b');
    const c = Parsimmon.string('c');
    const abc1 = a.concat(b).concat(c);
    const abc2 = a.concat(b.concat(c));

    const equivalentParsers = (p1, p2, inputs) => {
      for (let i = 0; i < inputs.length; i++) {
        // assert.deepEqual(p1.parse(inputs[i]), p2.parse(inputs[i]));
        expect(p1.parse(inputs[i])).toEqual(p2.parse(inputs[i]));
      }
    };
    equivalentParsers(abc1, abc2, ['abc', 'ac']);
  });
});
