import { Parsimmon, makeSuccess, makeFailure, string, alt } from '../../src';

describe('Parsimmon()', () => {
  it('should work in general', () => {
    const good = 'just a Q';
    const bad = 'all I wanted was a Q';
    const justQ = new Parsimmon((str: string, i: number) => {
      if (str.charAt(i) === 'Q') {
        return makeSuccess(i + 1, good);
      } else {
        return makeFailure(i, bad);
      }
    });
    const result1 = justQ.parse('Q');
    const result2 = justQ.parse('x');
    // assert.deepEqual(result1, {
    //   status: true,
    //   value: good,
    // });
    expect(result1).toEqual({
      status: true,
      value: good,
    });
    // assert.deepEqual(result2, {
    //   status: false,
    //   index: {
    //     offset: 0,
    //     line: 1,
    //     column: 1,
    //   },
    //   expected: [bad],
    // });
    expect(result2).toEqual({
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1,
      },
      expected: [bad],
    });
  });

  it('unsafeUnion works on poorly formatted custom parser', () => {
    const p1 = string('a').or(string('b'));
    const p2 = new Parsimmon((str: string, i: number) => {
      return {
        status: false,
        index: -1,
        value: null,
        furthest: i,
        expected: [],
      };
    });
    const p3 = alt(p2, p1);
    const result = p3.parse('x');
    //     assert.deepStrictEqual(result.expected, ["'a'", "'b'"]);
    expect(result.expected).toEqual(["'a'", "'b'"]);
  });
});
