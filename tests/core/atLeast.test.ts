import * as Parsimmon from '../../src';

it('atLeast', () => {
  const atLeastTwo = Parsimmon.letter.atLeast(2);
  //   assert.deepEqual(atLeastTwo.parse('xy').value, ['x', 'y']);
  expect(atLeastTwo.parse('xy').value).toEqual(['x', 'y']);
  //   assert.deepEqual(atLeastTwo.parse('xyzw').value, ['x', 'y', 'z', 'w']);
  expect(atLeastTwo.parse('xyzw').value).toEqual(['x', 'y', 'z', 'w']);
  //   assert.ok(!atLeastTwo.parse('x').status);
  expect(!atLeastTwo.parse('x').status).toBeTruthy();
});
