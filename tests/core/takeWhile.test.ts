import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

it('takeWhile', () => {
  const parser = Parsimmon.takeWhile((ch) => {
    return ch !== '.';
  }).skip(Parsimmon.all);
  // assert.equal(parser.parse("abc").value, "abc");
  expect(parser.parse('abc').value).toBe('abc');
  // assert.equal(parser.parse("abc.").value, "abc");
  expect(parser.parse('abc.').value).toBe('abc');
  // assert.equal(parser.parse(".").value, "");
  expect(parser.parse('abc.').value).toBe('abc');
  // assert.equal(parser.parse("").value, "");
  expect(parser.parse('').value).toBe('');
  // assert.throws(function() {
  //   Parsimmon.takeWhile("not a function");
  // });
  expect(() => {
    Parsimmon.takeWhile('not a function');
  }).toThrow();
});
