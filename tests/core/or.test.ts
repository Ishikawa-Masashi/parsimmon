import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('or', () => {
  it('two parsers', () => {
    var parser = Parsimmon.string('x').or(Parsimmon.string('y'));
    // assert.equal(parser.parse("x").value, "x");
    expect(parser.parse('x').value).toBe('x');
    // assert.equal(parser.parse("y").value, "y");
    expect(parser.parse('y').value).toBe('y');
    // assert.ok(!parser.parse("z").status);
    expect(!parser.parse('z').status).toBeTruthy();
  });

  it('with chain', function () {
    var parser = Parsimmon.string('\\')
      .chain(function () {
        return Parsimmon.string('y');
      })
      .or(Parsimmon.string('z'));
    // assert.equal(parser.parse("\\y").value, "y");
    expect(parser.parse('\\y').value).toBe('y');
    // assert.equal(parser.parse("z").value, "z");
    expect(parser.parse('z').value).toBe('z');
    // assert.ok(!parser.parse("\\z").status);
    expect(!parser.parse('\\z').status).toBeTruthy();
  });

  it('asserts that a parser was given', function () {
    // assert.throws(function() {
    //   Parsimmon.string("x").or("not a parser");
    // });
    expect(function () {
      Parsimmon.string('x').or('not a parser');
    }).toThrow();
  });

  it('prefer longest branch', function () {
    var parser = Parsimmon.string('abc')
      .then(Parsimmon.string('def'))
      .or(Parsimmon.string('ab').then(Parsimmon.string('cd')));

    // assert.deepEqual(parser.parse("abc"), {
    //   status: false,
    //   index: {
    //     offset: 3,
    //     line: 1,
    //     column: 4
    //   },
    //   expected: ["'def'"]
    // });

    expect(parser.parse('abc')).toEqual({
      status: false,
      index: {
        offset: 3,
        line: 1,
        column: 4,
      },
      expected: ["'def'"],
    });
  });

  it('prefer last of equal length branches', function () {
    var parser = Parsimmon.string('abc')
      .then(Parsimmon.string('def'))
      .or(Parsimmon.string('abc').then(Parsimmon.string('d')));

    // assert.deepEqual(parser.parse("abc"), {
    //   status: false,
    //   index: {
    //     offset: 3,
    //     line: 1,
    //     column: 4
    //   },
    //   expected: ["'d'", "'def'"]
    // });
    expect(parser.parse('abc')).toEqual({
      status: false,
      index: {
        offset: 3,
        line: 1,
        column: 4,
      },
      expected: ["'d'", "'def'"],
    });
  });

  it('prefer longest branch even after a success', function () {
    var parser = Parsimmon.string('abcdef')
      .then(Parsimmon.string('g'))
      .or(Parsimmon.string('ab'))
      .then(Parsimmon.string('cd'))
      .then(Parsimmon.string('xyz'));

    // assert.deepEqual(parser.parse("abcdef"), {
    //   status: false,
    //   index: {
    //     offset: 6,
    //     line: 1,
    //     column: 7
    //   },
    //   expected: ["'g'"]
    // });

    expect(parser.parse('abcdef')).toEqual({
      status: false,
      index: {
        offset: 6,
        line: 1,
        column: 7,
      },
      expected: ["'g'"],
    });
  });

  it('prefer longest branch even in a .many()', function () {
    var list = Parsimmon.lazy(function () {
      return atom.or(sexpr).trim(Parsimmon.optWhitespace).many();
    });
    var atom = Parsimmon.regexp(/[^()\s]+/).desc('an atom');
    var sexpr = list.wrap(Parsimmon.string('('), Parsimmon.string(')'));

    // assert.deepEqual(list.parse("(a b) (c ((() d)))").value, [
    //   ["a", "b"],
    //   ["c", [[[], "d"]]]
    // ]);
    expect(list.parse('(a b) (c ((() d)))').value).toEqual([
      ['a', 'b'],
      ['c', [[[], 'd']]],
    ]);

    // assert.deepEqual(list.parse("(a b ()) c)"), {
    //   status: false,
    //   index: {
    //     offset: 10,
    //     line: 1,
    //     column: 11
    //   },
    //   expected: ["'('", "EOF", "an atom"]
    // });
    expect(list.parse('(a b ()) c)')).toEqual({
      status: false,
      index: {
        offset: 10,
        line: 1,
        column: 11,
      },
      expected: ["'('", 'EOF', 'an atom'],
    });

    // assert.deepEqual(list.parse("(a (b)) (() c"), {
    //   status: false,
    //   index: {
    //     offset: 13,
    //     line: 1,
    //     column: 14
    //   },
    //   expected: ["'('", "')'", "an atom"]
    // });
    expect(list.parse('(a (b)) (() c')).toEqual({
      status: false,
      index: {
        offset: 13,
        line: 1,
        column: 14,
      },
      expected: ["'('", "')'", 'an atom'],
    });
  });

  it('prefer longest branch in .or() nested in .many()', function () {
    var parser = Parsimmon.string('abc')
      .then(Parsimmon.string('def'))
      .or(Parsimmon.string('a'))
      .many();

    // assert.deepEqual(parser.parse("aaabcdefaa").value, [
    //   "a",
    //   "a",
    //   "def",
    //   "a",
    //   "a"
    // ]);
    expect(parser.parse('aaabcdefaa').value).toEqual([
      'a',
      'a',
      'def',
      'a',
      'a',
    ]);

    // assert.deepEqual(parser.parse("aaabcde"), {
    //   status: false,
    //   index: {
    //     offset: 5,
    //     line: 1,
    //     column: 6
    //   },
    //   expected: ["'def'"]
    // });
    expect(parser.parse('aaabcde')).toEqual({
      status: false,
      index: {
        offset: 5,
        line: 1,
        column: 6,
      },
      expected: ["'def'"],
    });
  });
});
