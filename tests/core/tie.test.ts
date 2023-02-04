import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

// testSetScenario(function() {
describe('parser.tie()', function () {
  beforeAll(function () {
    Parsimmon._supportsSet = false;
  });

  afterAll(function () {
    Parsimmon._supportsSet = undefined;
  });
  it('concatenates all the results', function () {
    var parser = Parsimmon.seq(
      Parsimmon.string('<| '),
      Parsimmon.letter,
      Parsimmon.digit,
      Parsimmon.string(' |>')
    ).tie();
    var text = '<| o7 |>';
    var result = parser.tryParse(text);
    // assert.strictEqual(result, text);
    expect(result).toBe(text);
  });

  it('only accept array of string parsers', function () {
    // assert.throws(function() {
    //   Parsimmon.of(1)
    //     .tie()
    //     .tryParse("");
    // });
    expect(function () {
      Parsimmon.of(1).tie().tryParse('');
    }).toThrow();
    // assert.throws(function() {
    //   Parsimmon.of([1])
    //     .tie()
    //     .tryParse("");
    // });
    expect(function () {
      Parsimmon.of([1]).tie().tryParse('');
    }).toThrow();
    // assert.throws(function() {
    //   Parsimmon.of(["1", 2])
    //     .tie()
    //     .tryParse("");
    // });
    expect(function () {
      Parsimmon.of(['1', 2]).tie().tryParse('');
    }).toThrow();
    // assert.doesNotThrow(function() {
    //   Parsimmon.of(["1"])
    //     .tie()
    //     .tryParse("");
    // });
    expect(function () {
      Parsimmon.of(['1']).tie().tryParse('');
    }).not.toThrow();
  });
});
// });
