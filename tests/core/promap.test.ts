import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('promap', () => {
  function toLower(x) {
    return x.toLowerCase();
  }

  function ord(chr) {
    return chr.charCodeAt(0);
  }

  it('with a function, transforms the input and parses that, and transforms the output', () => {
    const parser = Parsimmon.string('a').promap(toLower, ord);
    // assert.deepEqual(parser.parse("A"), { status: true, value: 0x61 });
    expect(parser.parse('A')).toEqual({ status: true, value: 0x61 });
  });

  it('asserts that a function was given', function () {
    // assert.throws(function() {
    //   Parsimmon.string("x").promap("not a function", toLower);
    // });
    expect(function () {
      Parsimmon.string('x').promap('not a function', toLower);
    }).toThrow();

    // assert.throws(function() {
    //   Parsimmon.string("x").promap(toLower, "not a function");
    // });
    expect(function () {
      Parsimmon.string('x').promap(toLower, 'not a function');
    }).toThrow();
  });
});
