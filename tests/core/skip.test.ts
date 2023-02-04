import { describe, it, afterAll, beforeAll, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

// testSetScenario(function() {
describe('skip', () => {
  beforeAll(function () {
    Parsimmon._supportsSet = false;
  });

  afterAll(function () {
    Parsimmon._supportsSet = undefined;
  });
  it('uses the previous return value', function () {
    var parser = Parsimmon.string('x').skip(Parsimmon.string('y'));
    // assert.deepStrictEqual(parser.parse("xy"), { status: true, value: "x" });
    expect(parser.parse('xy')).toEqual({ status: true, value: 'x' });
    // assert.strictEqual(parser.parse("x").status, false);
    expect(parser.parse('x').status).toStrictEqual(false);
  });

  it('asserts that a parser was given', function () {
    // assert.throws(function() {
    //   Parsimmon.string("x").skip("not a parser");
    // });
    expect(function () {
      Parsimmon.string('x').skip('not a parser');
    }).toThrow();
  });
});
// });
