import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('Fantasy Land Chain', () => {
  it('associativity', () => {
    function appender(x) {
      return function (xs) {
        return Parsimmon.of(xs.concat(x));
      };
    }
    function reverse(xs) {
      return Parsimmon.of(xs.slice().reverse());
    }
    const list = Parsimmon.sepBy(Parsimmon.letters, Parsimmon.whitespace);
    const input = 'quuz foo bar baz';
    const output = {
      status: true,
      value: ['baz', 'bar', 'foo', 'quuz', 'aaa'],
    };
    const p1 = list.chain(reverse).chain(appender('aaa'));
    const p2 = list.chain(function (x) {
      return reverse(x).chain(appender('aaa'));
    });
    const out1 = p1.parse(input);
    const out2 = p2.parse(input);
    // assert.deepEqual(out1, out2);
    expect(out1).toEqual(out2);
    // assert.deepEqual(out1, output);
    expect(out1).toEqual(output);
  });
});
