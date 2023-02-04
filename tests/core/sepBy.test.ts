import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';
describe('Parsimmon.sepBy/sepBy1', function () {
  const chars = Parsimmon.regexp(/[a-zA-Z]+/);
  const comma = Parsimmon.string(',');
  const csvSep = Parsimmon.sepBy(chars, comma);
  const csvSep1 = Parsimmon.sepBy1(chars, comma);
  const csvSepB = chars.sepBy(comma);
  const csvSep1B = chars.sepBy1(comma);

  it('successful, returns an array of parsed elements', () => {
    const input = 'Heres,a,csv,string,in,our,restrictive,dialect';
    const output = [
      'Heres',
      'a',
      'csv',
      'string',
      'in',
      'our',
      'restrictive',
      'dialect',
    ];
    // assert.deepEqual(csvSep.parse(input).value, output);
    expect(csvSep.parse(input).value).toEqual(output);
    // assert.deepEqual(csvSep1.parse(input).value, output);
    expect(csvSep1.parse(input).value).toEqual(output);
    // assert.deepEqual(csvSepB.parse(input).value, output);
    expect(csvSepB.parse(input).value).toEqual(output);
    // assert.deepEqual(csvSep1B.parse(input).value, output);
    expect(csvSep1B.parse(input).value).toEqual(output);
    // assert.throws(function() {
    //   Parsimmon.sepBy("not a parser");
    // });
    expect(function () {
      Parsimmon.sepBy('not a parser');
    }).toThrow();
    // assert.throws(function() {
    //   Parsimmon.sepBy(Parsimmon.string("a"), "not a parser");
    // });
    expect(function () {
      Parsimmon.sepBy(Parsimmon.string('a'), 'not a parser');
    }).toThrow();
    // assert.throws(function() {
    //   Parsimmon.string("a").sepBy("not a parser");
    // });
    expect(function () {
      Parsimmon.string('a').sepBy('not a parser');
    }).toThrow();
  });

  it('sepBy succeeds with the empty list on empty input, sepBy1 fails', function () {
    // assert.deepEqual(csvSep.parse("").value, []);
    expect(csvSep.parse('').value).toEqual([]);
    // assert.deepEqual(csvSepB.parse("").value, []);
    expect(csvSepB.parse('').value).toEqual([]);
    var failure = {
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1,
      },
      expected: ['/[a-zA-Z]+/'],
    };
    // assert.deepEqual(csvSep1.parse(""), failure);
    expect(csvSep1.parse('')).toEqual(failure);
    // assert.deepEqual(csvSep1B.parse(""), failure);
    expect(csvSep1B.parse('')).toEqual(failure);
  });

  it('does not tolerate trailing separators', () => {
    const input = 'Heres,a,csv,with,a,trailing,comma,';
    const output = {
      status: false,
      index: {
        offset: 34,
        line: 1,
        column: 35,
      },
      expected: ['/[a-zA-Z]+/'],
    };
    // assert.deepEqual(csvSep.parse(input), output);
    expect(csvSep.parse(input)).toEqual(output);
    // assert.deepEqual(csvSep1.parse(input), output);
    expect(csvSep1.parse(input)).toEqual(output);
    // assert.deepEqual(csvSepB.parse(input), output);
    expect(csvSepB.parse(input)).toEqual(output);
    // assert.deepEqual(csvSep1B.parse(input), output);
    expect(csvSep1B.parse(input)).toEqual(output);
  });
});
