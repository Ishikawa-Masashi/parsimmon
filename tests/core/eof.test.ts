import * as Parsimmon from '../../src';

it('eof', () => {
  const parser = Parsimmon.optWhitespace
    .skip(Parsimmon.eof)
    .or(Parsimmon.all.result('default'));

  //   assert.equal(parser.parse('  ').value, '  ');
  expect(parser.parse('  ').value).toEqual('  ');
  //   assert.equal(parser.parse('x').value, 'default');
  expect(parser.parse('x').value).toEqual('default');
});
