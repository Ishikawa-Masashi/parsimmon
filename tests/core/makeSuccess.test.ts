import * as Parsimmon from '../../src';

it('Parsimmon.makeSuccess', () => {
  const index = 11;
  const value = 'a lucky number';
  const result = Parsimmon.makeSuccess(index, value);
  //   assert.deepEqual(result, {
  //     status: true,
  //     index: index,
  //     value: value,
  //     furthest: -1,
  //     expected: [],
  //   });
  expect(result).toEqual({
    status: true,
    index: index,
    value: value,
    furthest: -1,
    expected: [],
  });
});
