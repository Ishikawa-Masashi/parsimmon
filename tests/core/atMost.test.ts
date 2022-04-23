import * as Parsimmon from '../../src';

it('atMost', function () {
  const atMostTwo = Parsimmon.letter.atMost(2);
  //   assert.deepEqual(atMostTwo.parse('').value, []);
  expect(atMostTwo.parse('').value).toEqual([]);
  //   assert.deepEqual(atMostTwo.parse('a').value, ['a']);
  expect(atMostTwo.parse('a').value).toEqual(['a']);
  //   assert.deepEqual(atMostTwo.parse('ab').value, ['a', 'b']);
  expect(atMostTwo.parse('ab').value).toEqual(['a', 'b']);
  //   assert.ok(!atMostTwo.parse('abc').status);
  expect(!atMostTwo.parse('abc').status).toBeTruthy();
});
