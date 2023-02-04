import { describe, it, afterAll, beforeAll, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('many', () => {
  beforeAll(() => {
    Parsimmon._supportsSet = false;
  });

  afterAll(function () {
    Parsimmon._supportsSet = undefined;
  });

  it('simple case', () => {
    const letters = Parsimmon.letter.many();
    // assert.deepEqual(letters.parse("x").value, ["x"]);
    expect(letters.parse('x').value).toEqual(['x']);
    // assert.deepEqual(letters.parse("xyz").value, ["x", "y", "z"]);
    expect(letters.parse('xyz').value).toEqual(['x', 'y', 'z']);
    // assert.deepEqual(letters.parse("").value, []);
    expect(letters.parse('').value).toEqual([]);
    // assert.ok(!letters.parse("1").status);
    expect(!letters.parse('1').status).toBeTruthy();
    // assert.ok(!letters.parse("xyz1").status);
    expect(!letters.parse('xyz1').status).toBeTruthy();
  });

  it('followed by then', () => {
    const parser = Parsimmon.string('x').many().then(Parsimmon.string('y'));
    // assert.equal(parser.parse("y").value, "y");
    expect(parser.parse('y').value).toBe('y');
    // assert.equal(parser.parse("xy").value, "y");
    expect(parser.parse('xy').value).toBe('y');
    // assert.equal(parser.parse("xxxxxy").value, "y");
    expect(parser.parse('xxxxxy').value).toBe('y');
  });

  it('throws on parsers that accept zero characters', function () {
    const parser = Parsimmon.regexp(/a*/).many();
    // assert.throws(function() {
    //   parser.parse("a");
    // });
    expect(function () {
      parser.parse('a');
    }).toThrow();
    // assert.throws(function() {
    //   parser.parse("b");
    // });
    expect(function () {
      parser.parse('b');
    }).toThrow();
    // assert.throws(function() {
    //   parser.parse("");
    // });
    expect(function () {
      parser.parse('');
    }).toThrow();
  });
});
