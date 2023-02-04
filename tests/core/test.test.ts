import { it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

it('test', () => {
  const parser = Parsimmon.test((ch) => {
    return ch !== '.';
  });
  // assert.equal(parser.parse("x").value, "x");
  expect(parser.parse('x').value).toBe('x');
  // assert.equal(parser.parse(".").status, false);
  expect(parser.parse('.').status).toBe(false);
  // assert.throws(function() {
  //   Parsimmon.test("not a function");
  // });
  expect(() => {
    Parsimmon.test('not a function');
  }).toThrow();
});
