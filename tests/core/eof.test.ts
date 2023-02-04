import * as Parsimmon from '../../src';

it('eof', () => {
  const parser = Parsimmon.optWhitespace
    .skip(Parsimmon.eof)
    .or(Parsimmon.all.result('default'));

  expect(parser.parse('  ').value).toEqual('  ');
  expect(parser.parse('x').value).toEqual('default');
});
