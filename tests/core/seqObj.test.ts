import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';
// testSetScenario(function() {
describe('Parsimmon.seqObj', function () {
  beforeAll(function () {
    Parsimmon._supportsSet = false;
  });

  afterAll(function () {
    Parsimmon._supportsSet = undefined;
  });
  it('does not accept duplicate keys', function () {
    // assert.throws(function() {
    //   Parsimmon.seqObj(
    //     ["a", Parsimmon.of(1)],
    //     ["b", Parsimmon.of(2)],
    //     ["a", Parsimmon.of(3)]
    //   );
    // });
    expect(function () {
      Parsimmon.seqObj(
        ['a', Parsimmon.of(1)],
        ['b', Parsimmon.of(2)],
        ['a', Parsimmon.of(3)]
      );
    }).toThrow();
  });

  it('requires at least one key', function () {
    // assert.throws(function() {
    //   Parsimmon.seqObj();
    // });
    expect(function () {
      Parsimmon.seqObj();
    }).toThrow();
  });

  it('every key is present in the result object', function () {
    var parser = Parsimmon.seqObj(
      ['a', Parsimmon.of(1)],
      ['b', Parsimmon.of(2)],
      ['c', Parsimmon.of(3)]
    );
    var result = parser.tryParse('');
    // assert.deepStrictEqual(result, {
    //   a: 1,
    //   b: 2,
    //   c: 3
    // });
    expect(result).toEqual({
      a: 1,
      b: 2,
      c: 3,
    });
  });

  it('every parser is used', function () {
    var parser = Parsimmon.seqObj(
      ['a', Parsimmon.of(1)],
      ['b', Parsimmon.of(2)],
      ['c', Parsimmon.fail('oopsy')]
    );
    var result = parser.parse('');
    // assert.strictEqual(result.status, false);
    expect(result.status).toStrictEqual(false);
  });

  it('every parser is used', function () {
    var parser = Parsimmon.seqObj(
      Parsimmon.string('a'),
      ['b', Parsimmon.string('b')],
      Parsimmon.string('c'),
      ['d', Parsimmon.string('d')],
      Parsimmon.string('e')
    );
    var result = parser.tryParse('abcde');
    // assert.deepStrictEqual(result, {
    //   b: "b",
    //   d: "d"
    // });
    expect(result).toEqual({
      b: 'b',
      d: 'd',
    });
  });

  it('named parser arrays are formed properly', function () {
    // assert.throws(function() {
    //   Parsimmon.seqObj([]);
    // });
    expect(function () {
      Parsimmon.seqObj([]);
    }).toThrow();
    // assert.throws(function() {
    //   Parsimmon.seqObj(["a", Parsimmon.of(1), "oops extra"]);
    // });
    expect(function () {
      Parsimmon.seqObj(['a', Parsimmon.of(1), 'oops extra']);
    }).toThrow();
    // assert.throws(function() {
    //   Parsimmon.seqObj([123, Parsimmon.of(1)]);
    // });
    expect(function () {
      Parsimmon.seqObj([123, Parsimmon.of(1)]);
    }).toThrow();
    // assert.throws(function() {
    //   Parsimmon.seqObj(["cool", "potato"]);
    // });
    expect(function () {
      Parsimmon.seqObj(['cool', 'potato']);
    }).toThrow();
    // assert.throws(function() {
    //   Parsimmon.seqObj(0);
    // });
    expect(function () {
      Parsimmon.seqObj(0);
    }).toThrow();
  });

  it("accepts 'constructor' as a key", function () {
    var parser = Parsimmon.seqObj(['constructor', Parsimmon.of(1)]);
    var result = parser.tryParse('');
    // assert.deepStrictEqual(result, {
    //   constructor: 1
    // });
    expect(result).toEqual({
      constructor: 1,
    });
  });
});
// });
