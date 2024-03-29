import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('Fantasy Land Monad', function () {
  it('left identity', function () {
    function upperCase(x) {
      return Parsimmon.of(x.toUpperCase());
    }
    var input = 'foo';
    var output = {
      status: true,
      value: 'FOO',
    };
    var p1 = Parsimmon.of(input).chain(upperCase);
    var p2 = upperCase(input);
    var out1 = p1.parse('');
    var out2 = p2.parse('');
    // assert.deepEqual(out1, out2);
    expect(out1).toEqual(out2);
    // assert.deepEqual(out1, output);
    expect(out1).toEqual(output);
  });

  it('right identity', function () {
    var input = 'monad burrito';
    var output = {
      status: true,
      value: input,
    };
    var p1 = Parsimmon.all.chain(Parsimmon.of);
    var p2 = Parsimmon.all;
    var out1 = p1.parse(input);
    var out2 = p2.parse(input);
    // assert.deepEqual(out1, out2);
    expect(out1).toEqual(out2);
    // assert.deepEqual(out1, output);
    expect(out1).toEqual(output);
  });
});
