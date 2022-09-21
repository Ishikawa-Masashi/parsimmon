import * as Parsimmon from '../../src';

describe('map', () => {
  it('with a function, pipes the value in and uses that return value', function () {
    let piped: string;
    const parser = Parsimmon.string('x').map(function (x) {
      piped = x;
      return 'y';
    });

    expect(parser.parse('x')).toEqual({ status: true, value: 'y' });
    expect(piped).toBe('x');
  });

  it('asserts that a function was given', function () {
    expect(function () {
      Parsimmon.string('x').map('not a function');
    }).toThrow();
  });
});
