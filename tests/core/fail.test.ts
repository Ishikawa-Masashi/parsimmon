import * as Parsimmon from '../../src';

describe('fail', () => {
  const fail = Parsimmon.fail;
  const succeed = Parsimmon.succeed;

  it('use Parsimmon.fail to fail dynamically', () => {
    const parser = Parsimmon.any
      .chain((ch: string) => {
        return fail('a character besides ' + ch);
      })
      .or(Parsimmon.string('x'));

    // assert.deepEqual(parser.parse('y'), {
    //   status: false,
    //   index: {
    //     offset: 1,
    //     line: 1,
    //     column: 2,
    //   },
    //   expected: ['a character besides y'],
    // });
    expect(parser.parse('y')).toEqual({
      status: false,
      index: {
        offset: 1,
        line: 1,
        column: 2,
      },
      expected: ['a character besides y'],
    });
    // assert.equal(parser.parse('x').value, 'x');
    expect(parser.parse('x').value).toBe('x');
  });

  it('use Parsimmon.succeed or Parsimmon.fail to branch conditionally', () => {
    let allowedOperator: string;

    const parser = Parsimmon.string('x')
      .then(Parsimmon.string('+').or(Parsimmon.string('*')))
      .chain((operator: string) => {
        if (operator === allowedOperator) {
          return succeed(operator);
        }
        return fail(allowedOperator);
      })
      .skip(Parsimmon.string('y'));

    allowedOperator = '+';
    // assert.equal(parser.parse('x+y').value, '+');
    expect(parser.parse('x+y').value).toBe('+');
    // assert.deepEqual(parser.parse('x*y'), {
    //   status: false,
    //   index: {
    //     offset: 2,
    //     line: 1,
    //     column: 3,
    //   },
    //   expected: ['+'],
    // });
    expect(parser.parse('x*y')).toEqual({
      status: false,
      index: {
        offset: 2,
        line: 1,
        column: 3,
      },
      expected: ['+'],
    });

    allowedOperator = '*';
    // assert.equal(parser.parse('x*y').value, '*');
    expect(parser.parse('x*y').value).toBe('*');
    // assert.deepEqual(parser.parse('x+y'), {
    //   status: false,
    //   index: {
    //     offset: 2,
    //     line: 1,
    //     column: 3,
    //   },
    //   expected: ['*'],
    // });
    expect(parser.parse('x+y')).toEqual({
      status: false,
      index: {
        offset: 2,
        line: 1,
        column: 3,
      },
      expected: ['*'],
    });
  });
});
