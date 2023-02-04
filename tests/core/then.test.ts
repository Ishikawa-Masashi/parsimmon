import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

// testSetScenario(function() {
describe('.then', function () {
  beforeAll(function () {
    Parsimmon._supportsSet = false;
  });

  afterAll(function () {
    Parsimmon._supportsSet = undefined;
  });
  it('with a parser, uses the last return value', function () {
    var parser = Parsimmon.string('x').then(Parsimmon.string('y'));
    // assert.deepEqual(parser.parse("xy"), { status: true, value: "y" });
    expect(parser.parse('xy')).toEqual({ status: true, value: 'y' });
    // assert.deepEqual(parser.parse("y"), {
    //   status: false,
    //   expected: ["'x'"],
    //   index: {
    //     offset: 0,
    //     line: 1,
    //     column: 1
    //   }
    // });
    expect(parser.parse('y')).toEqual({
      status: false,
      expected: ["'x'"],
      index: {
        offset: 0,
        line: 1,
        column: 1,
      },
    });
    // assert.deepEqual(parser.parse("xz"), {
    //   status: false,
    //   expected: ["'y'"],
    //   index: {
    //     offset: 1,
    //     line: 1,
    //     column: 2
    //   }
    // });
    expect(parser.parse('xz')).toEqual({
      status: false,
      expected: ["'y'"],
      index: {
        offset: 1,
        line: 1,
        column: 2,
      },
    });
  });

  it('errors when argument is not a parser', function () {
    // assert.throws(function() {
    //   Parsimmon.string("x").then("not a parser");
    // });
    expect(function () {
      Parsimmon.string('x').then('not a parser');
    }).toThrow();
  });
});
// });
