import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

it('.node(name)', () => {
  const ys = Parsimmon.regexp(/^y*/).node('Y');
  const parser = ys.trim(Parsimmon.optWhitespace);
  // assert.deepEqual(parser.parse("").value, {
  //   name: "Y",
  //   value: "",
  //   start: { offset: 0, line: 1, column: 1 },
  //   end: { offset: 0, line: 1, column: 1 }
  // });
  expect(parser.parse('').value).toEqual({
    name: 'Y',
    value: '',
    start: { offset: 0, line: 1, column: 1 },
    end: { offset: 0, line: 1, column: 1 },
  });
  // assert.deepEqual(parser.parse(" yy ").value, {
  //   name: "Y",
  //   value: "yy",
  //   start: { offset: 1, line: 1, column: 2 },
  //   end: { offset: 3, line: 1, column: 4 }
  // });
  expect(parser.parse(' yy ').value).toEqual({
    name: 'Y',
    value: 'yy',
    start: { offset: 1, line: 1, column: 2 },
    end: { offset: 3, line: 1, column: 4 },
  });
  // assert.deepEqual(parser.parse("\nyy ").value, {
  //   name: "Y",
  //   value: "yy",
  //   start: { offset: 1, line: 2, column: 1 },
  //   end: { offset: 3, line: 2, column: 3 }
  // });
  expect(parser.parse('\nyy ').value).toEqual({
    name: 'Y',
    value: 'yy',
    start: { offset: 1, line: 2, column: 1 },
    end: { offset: 3, line: 2, column: 3 },
  });
});
