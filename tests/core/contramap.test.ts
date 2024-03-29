import * as Parsimmon from '../../src';

describe('contramap', () => {
  it('with a function, transforms the input and parses that', () => {
    const parser = Parsimmon.string('x').contramap((x: string) => {
      return x.toLowerCase();
    });
    // assert.deepEqual(parser.parse('X'), { status: true, value: 'x' });
    expect(parser.parse('X')).toEqual({ status: true, value: 'x' });
  });

  it('asserts that a function was given', () => {
    // assert.throws(function () {
    //   Parsimmon.string('x').contramap('not a function');
    // });
    expect(() => {
      Parsimmon.string('x').contramap('not a function');
    }).toThrow();
  });

  it('embedded contramaps make sense', () => {
    const parser = Parsimmon.seq(
      Parsimmon.string('a'),
      Parsimmon.seq(Parsimmon.string('c'), Parsimmon.string('d'))
        .tie()
        .contramap((x: string) => {
          return x.slice(1);
        })
    ).tie();

    // assert.deepEqual(parser.parse('abcd'), { status: true, value: 'acd' });
    expect(parser.parse('abcd')).toEqual({ status: true, value: 'acd' });
  });

  it('backtracking with contramaps works', () => {
    const parser = Parsimmon.seq(
      Parsimmon.string('a'),
      Parsimmon.seq(Parsimmon.string('c'), Parsimmon.string('d'))
        .tie()
        .contramap((x: string) => {
          return x.slice(1);
        })
    )
      .tie()
      .or(Parsimmon.all);

    // assert.deepEqual(parser.parse('abcde'), { status: true, value: 'abcde' });
    expect(parser.parse('abcde')).toEqual({ status: true, value: 'abcde' });
  });
});
