import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

// testSetScenario(function() {
describe('times', function () {
  beforeAll(function () {
    Parsimmon._supportsSet = false;
  });

  afterAll(function () {
    Parsimmon._supportsSet = undefined;
  });

  it('zero case', function () {
    var zeroLetters = Parsimmon.letter.times(0);
    // assert.deepEqual(zeroLetters.parse("").value, []);
    expect(zeroLetters.parse('').value).toEqual([]);
    // assert.ok(!zeroLetters.parse("x").status);
    expect(!zeroLetters.parse('x').status).toBeTruthy();
  });

  it('nonzero case', function () {
    var threeLetters = Parsimmon.letter.times(3);
    // assert.deepEqual(threeLetters.parse("xyz").value, ["x", "y", "z"]);
    expect(threeLetters.parse('xyz').value).toEqual(['x', 'y', 'z']);
    // assert.ok(!threeLetters.parse("xy").status);
    expect(!threeLetters.parse('xy').status).toBeTruthy();
    // assert.ok(!threeLetters.parse("xyzw").status);
    expect(!threeLetters.parse('xyzw').status).toBeTruthy();
    var thenDigit = threeLetters.then(Parsimmon.digit);
    // assert.equal(thenDigit.parse("xyz1").value, "1");
    expect(thenDigit.parse('xyz1').value).toBe('1');
    // assert.ok(!thenDigit.parse("xy1").status);
    expect(!thenDigit.parse('xy1').status).toBeTruthy();
    // assert.ok(!thenDigit.parse("xyz").status);
    expect(!thenDigit.parse('xyz').status).toBeTruthy();
    // assert.ok(!thenDigit.parse("xyzw").status);
    expect(!thenDigit.parse('xyzw').status).toBeTruthy();
  });

  it('with a min and max', function () {
    var someLetters = Parsimmon.letter.times(2, 4);
    // assert.deepEqual(someLetters.parse("xy").value, ["x", "y"]);
    expect(someLetters.parse('xy').value).toEqual(['x', 'y']);
    // assert.deepEqual(someLetters.parse("xyz").value, ["x", "y", "z"]);
    expect(someLetters.parse('xyz').value).toEqual(['x', 'y', 'z']);
    // assert.deepEqual(someLetters.parse("xyzw").value, ["x", "y", "z", "w"]);
    expect(someLetters.parse('xyzw').value).toEqual(['x', 'y', 'z', 'w']);
    // assert.ok(!someLetters.parse("xyzwv").status);
    expect(!someLetters.parse('xyzwv').status).toBeTruthy();
    // assert.ok(!someLetters.parse("x").status);
    expect(!someLetters.parse('x').status).toBeTruthy();
    var thenDigit = someLetters.then(Parsimmon.digit);
    // assert.equal(thenDigit.parse("xy1").value, "1");
    expect(thenDigit.parse('xy1').value).toBe('1');
    // assert.equal(thenDigit.parse("xyz1").value, "1");
    expect(thenDigit.parse('xyz1').value).toBe('1');
    // assert.equal(thenDigit.parse("xyzw1").value, "1");
    expect(thenDigit.parse('xyzw1').value).toBe('1');
    // assert.ok(!thenDigit.parse("xy").status);
    expect(!thenDigit.parse('xy').status).toBeTruthy();
    // assert.ok(!thenDigit.parse("xyzw").status);
    expect(!thenDigit.parse('xyzw').status).toBeTruthy();
    // assert.ok(!thenDigit.parse("xyzwv1").status);
    expect(!thenDigit.parse('xyzwv1').status).toBeTruthy();
    // assert.ok(!thenDigit.parse("x1").status);
    expect(!thenDigit.parse('x1').status).toBeTruthy();
  });

  it('checks that argument types are correct', function () {
    // assert.throws(function() {
    //   Parsimmon.string("x").times("not a number");
    // });
    expect(function () {
      Parsimmon.string('x').times('not a number');
    }).toThrow();
    // assert.throws(function() {
    //   Parsimmon.string("x").times(1, "not a number");
    // });
    expect(function () {
      Parsimmon.string('x').times(1, 'not a number');
    }).toThrow();
    // assert.throws(function() {
    //   Parsimmon.string("x").atLeast("not a number");
    // });
    expect(function () {
      Parsimmon.string('x').atLeast('not a number');
    }).toThrow();
    // assert.throws(function() {
    //   Parsimmon.string("x").atMost("not a number");
    // });
    expect(function () {
      Parsimmon.string('x').atMost('not a number');
    }).toThrow();
  });

  it('prefer longest branch in .times() too', function () {
    var parser = Parsimmon.string('abc')
      .then(Parsimmon.string('def'))
      .or(Parsimmon.string('a'))
      .times(3, 6);

    // assert.deepEqual(parser.parse("aabcde"), {
    //   status: false,
    //   index: {
    //     offset: 4,
    //     line: 1,
    //     column: 5
    //   },
    //   expected: ["'def'"]
    // });
    expect(parser.parse('aabcde')).toEqual({
      status: false,
      index: {
        offset: 4,
        line: 1,
        column: 5,
      },
      expected: ["'def'"],
    });

    // assert.deepEqual(parser.parse("aaaaabcde"), {
    //   status: false,
    //   index: {
    //     offset: 7,
    //     line: 1,
    //     column: 8
    //   },
    //   expected: ["'def'"]
    // });
    expect(parser.parse('aaaaabcde')).toEqual({
      status: false,
      index: {
        offset: 7,
        line: 1,
        column: 8,
      },
      expected: ["'def'"],
    });
  });
});
// });
