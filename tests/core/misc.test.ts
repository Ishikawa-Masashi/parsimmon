import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

function ezTest(options) {
  var name = options.name;
  var parser = options.parser;
  var good = options.good;
  var bad = options.bad;
  describe(name, function () {
    good.forEach(function (c) {
      it('should parse "' + c + '"', function () {
        // assert.strictEqual(parser.tryParse(c), c);
        expect(parser.tryParse(c)).toBe(c);
      });
    });
    bad.forEach(function (c) {
      it('should not parse "' + c + '"', function () {
        // assert.strictEqual(parser.parse(c).status, false);
        expect(parser.parse(c).status).toStrictEqual(false);
      });
    });
  });
}

const whitespace = [
  ' ',
  '\f',
  '\n',
  '\r',
  '\t',
  '\v',
  '\u00a0',
  '\u1680',
  '\u2000',
  '\u2001',
  '\u2002',
  '\u2003',
  '\u2004',
  '\u2005',
  '\u2006',
  '\u2007',
  '\u2008',
  '\u2009',
  '\u200a',
  '\u2028',
  '\u2029',
  '\u202f',
  '\u205f',
  '\u3000',
  '\ufeff',
];

const whitespaces = whitespace.concat([
  '\f\f',
  '   ',
  '\r\n',
  '\v\v\t',
  ' \t \t ',
]);

// testSetScenario(function() {
describe('(misc)', function () {
  beforeAll(function () {
    Parsimmon._supportsSet = false;
  });

  afterAll(function () {
    Parsimmon._supportsSet = undefined;
  });
  describe('Parsimmon.end', function () {
    var newlineSequences = ['\n', '\r', '\r\n'];

    it('should parse a newline', function () {
      newlineSequences.forEach(function (c) {
        // assert.strictEqual(Parsimmon.end.tryParse(c), c);
        expect(Parsimmon.end.tryParse(c)).toBe(c);
      });
      // assert.strictEqual(Parsimmon.end.tryParse(""), null);
      expect(Parsimmon.end.tryParse('')).toStrictEqual(null);
    });

    it('should not parse the letter A', function () {
      // assert.deepStrictEqual(Parsimmon.end.parse("A"), {
      //   status: false,
      //   index: { offset: 0, line: 1, column: 1 },
      //   expected: ["EOF", "newline"]
      // });
      expect(Parsimmon.end.parse('A')).toEqual({
        status: false,
        index: { offset: 0, line: 1, column: 1 },
        expected: ['EOF', 'newline'],
      });
    });
  });

  ezTest({
    name: 'Parsimmon.cr',
    parser: Parsimmon.cr,
    good: ['\r'],
    bad: ['\n', '\r\n', ''],
  });

  ezTest({
    name: 'Parsimmon.lf',
    parser: Parsimmon.lf,
    good: ['\n'],
    bad: ['\r', '\r\n', ''],
  });

  ezTest({
    name: 'Parsimmon.crlf',
    parser: Parsimmon.crlf,
    good: ['\r\n'],
    bad: ['\r', '\n', ''],
  });

  describe('Parsimmon.digit', function () {
    it('should parse exactly one 0-9 character', function () {
      // assert.strictEqual(Parsimmon.digit.tryParse("4"), "4");
      expect(Parsimmon.digit.tryParse('4')).toBe('4');
    });
  });
  ezTest({
    name: 'Parsimmon.digit',
    parser: Parsimmon.digit,
    good: '0 1 2 3 4 5 6 7 8 9'.split(' '),
    bad: ['a', '', '-'],
  });

  ezTest({
    name: 'Parsimmon.digits',
    parser: Parsimmon.digits,
    good: ['', '007', '420', '69', '1337', '666'],
    bad: ['a', '-', '1 2 3 4', '-4', '0xcafe'],
  });

  ezTest({
    name: 'Parsimmon.letter',
    parser: Parsimmon.letter,
    good: 'a b Z c d e A G h z'.split(' '),
    bad: ['9', '.', '-', ''],
  });

  ezTest({
    name: 'Parsimmon.letters',
    parser: Parsimmon.letters,
    good: [''].concat('aAa bbbB Zzzz cc d e A G h z'.split(' ')),
    bad: ['9', '.', '-'],
  });

  ezTest({
    name: 'Parsimmon.optWhitespace',
    parser: Parsimmon.optWhitespace,
    good: [''].concat(whitespace),
    bad: ['a', '-', '1 2 3 4', '-4', '0xcafe'],
  });

  ezTest({
    name: 'Parsimmon.whitespace',
    parser: Parsimmon.whitespace,
    good: whitespaces,
    bad: ['a', '', '-', '1 2 3 4', '-4', '0xcafe'],
  });
});
