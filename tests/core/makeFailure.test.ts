import * as Parsimmon from '../../src';

describe('Parsimmon.makeFailure', () => {
  it('creates a failure result', function () {
    const furthest = 4444;
    const expected = 'waiting in the clock tower';
    const result = Parsimmon.makeFailure(furthest, expected);
    // assert.deepEqual(result, {
    //   status: false,
    //   index: -1,
    //   value: null,
    //   furthest: furthest,
    //   expected: [expected],
    // });
    expect(result).toEqual({
      status: false,
      index: -1,
      value: null,
      furthest: furthest,
      expected: [expected],
    });
  });
  it('creates a result with multiple expected values', () => {
    const furthest = 4444;
    const expected = ['once', 'twice', 'three times a lady'];
    const result = Parsimmon.makeFailure(furthest, expected);
    // assert.deepEqual(result, {
    //   status: false,
    //   index: -1,
    //   value: null,
    //   furthest: furthest,
    //   expected: expected,
    // });
    expect(result).toEqual({
      status: false,
      index: -1,
      value: null,
      furthest: furthest,
      expected: expected,
    });
  });
});
