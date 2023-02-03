import * as Parsimmon from '../../src';

describe('chain', () => {
  it('asserts that a parser is returned', () => {
    const parser1 = Parsimmon.letter.chain(() => 'not a parser');
    // assert.throws(function () {
    //   parser1.parse('x');
    // });
    expect(() => {
      parser1.parse('x');
    }).toThrow();

    // assert.throws(function () {
    //   Parsimmon.letter.then('x');
    // });
    expect(() => {
      Parsimmon.letter.then('x');
    }).toThrow();
  });

  it('with a function that returns a parser, continues with that parser', () => {
    let piped = '';
    const parser = Parsimmon.string('x').chain((x: string) => {
      piped = x;
      return Parsimmon.string('y');
    });

    // assert.deepEqual(parser.parse('xy'), { status: true, value: 'y' });
    expect(parser.parse('xy')).toEqual({ status: true, value: 'y' });
    // assert.equal(piped, 'x');
    expect(piped).toEqual('x');
    // assert.ok(!parser.parse('x').status);
    expect(!parser.parse('x').status).toBeTruthy();
  });
});
