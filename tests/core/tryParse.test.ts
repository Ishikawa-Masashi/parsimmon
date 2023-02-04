import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

// testSetScenario(function() {
describe('.tryParse', () => {
  beforeAll(function () {
    Parsimmon._supportsSet = false;
  });

  afterAll(function () {
    Parsimmon._supportsSet = undefined;
  });

  it('returns just the value', function () {
    const x = 4;
    // assert.equal(Parsimmon.of(x).tryParse(""), x);
    expect(Parsimmon.of(x).tryParse('')).toBe(x);
  });

  it('returns throws on a bad parse', function () {
    // assert.throws(function() {
    //   Parsimmon.digit.tryParse("a");
    // });
    expect(function () {
      Parsimmon.digit.tryParse('a');
    }).toThrow();
  });

  it('thrown error message is equal to formatError', function () {
    var input = 'a';
    var parser = Parsimmon.digit;
    var result = parser.parse(input);
    var errMsg = Parsimmon.formatError(input, result);
    try {
      parser.tryParse(input);
    } catch (err) {
      // assert.equal(err.message, errMsg);
      expect(err.message).toBe(errMsg);
    }
  });

  it('thrown error contains full result object', function () {
    var input = 'a';
    var parser = Parsimmon.digit;
    var result = parser.parse(input);
    try {
      parser.tryParse(input);
    } catch (err) {
      // assert.deepEqual(err.result, result);
      expect(err.result).toEqual(result);
    }
  });

  it('thrown error message is equal to formatError', function () {
    var input = 'a';
    var parser = Parsimmon.digit;
    try {
      parser.tryParse(input);
    } catch (err) {
      // assert.deepEqual(err.result, parser.parse(input));
      expect(err.result).toEqual(parser.parse(input));
    }
  });
});
// });
