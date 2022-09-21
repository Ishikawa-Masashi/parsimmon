import * as Parsimmon from '../../src';

describe('fallback', () => {
  it('allows fallback result if no match is found', () => {
    const parser = Parsimmon.string('a').fallback('nothing');
    // assert.deepEqual(parser.parse('a').value, 'a');
    expect(parser.parse('a').value).toBe('a');
    // assert.deepEqual(parser.parse('').value, 'nothing');
    expect(parser.parse('').value).toEqual('nothing');
  });
});
