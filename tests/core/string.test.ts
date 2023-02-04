import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

it('Parsimmon.string', () => {
  const parser = Parsimmon.string('x');
  let res = parser.parse('x');
  // assert.ok(res.status);
  expect(res.status).toBeTruthy();
  // assert.equal(res.value, "x");
  expect(res.value).toBe('x');

  res = parser.parse('y');
  // assert.deepEqual(res, {
  //   status: false,
  //   index: {
  //     offset: 0,
  //     line: 1,
  //     column: 1
  //   },
  //   expected: ["'x'"]
  // });
  expect(res).toEqual({
    status: false,
    index: {
      offset: 0,
      line: 1,
      column: 1,
    },
    expected: ["'x'"],
  });

  // assert.equal(
  //   "\n-- PARSING FAILED --------------------------------------------------\n" +
  //     "\n" +
  //     "> 1 | y\n" +
  //     "    | ^\n" +
  //     "\n" +
  //     "Expected:\n" +
  //     "\n" +
  //     "'x'\n",
  //   Parsimmon.formatError("y", res)
  // );
  expect(
    '\n-- PARSING FAILED --------------------------------------------------\n' +
      '\n' +
      '> 1 | y\n' +
      '    | ^\n' +
      '\n' +
      'Expected:\n' +
      '\n' +
      "'x'\n"
  ).toEqual(Parsimmon.formatError('y', res));

  // assert.throws(function() {
  //   Parsimmon.string(34);
  // });
  expect(() => {
    Parsimmon.string(34);
  }).toThrow();
});
