import * as Parsimmon from '../../src';

it('.empty()', () => {
  const emptyParse = {
    status: false,
    expected: ['fantasy-land/empty'],
    index: { offset: 0, line: 1, column: 1 },
  };
  //   assert.deepEqual(Parsimmon.digit.empty, Parsimmon.empty);
  expect(Parsimmon.digit.empty).toEqual(Parsimmon.empty);
  //   assert.deepEqual(Parsimmon.empty().parse(''), emptyParse);
  expect(Parsimmon.empty().parse('')).toEqual(emptyParse);
});
