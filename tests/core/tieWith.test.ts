import * as Parsimmon from '../../src';

describe('parser.tieWith()', function () {
  it('handles empty args', function () {
    const parser = Parsimmon.of([]).tieWith('');
    const result = parser.tryParse('');
    expect(result).toBe('');
  });

  it('concatenates all the results', function () {
    const parser = Parsimmon.seq(
      Parsimmon.string('<| '),
      Parsimmon.letter,
      Parsimmon.digit,
      Parsimmon.string(' |>')
    ).tieWith('+');
    const text = '<| o7 |>';
    const result = parser.tryParse(text);
    expect(result).toBe('<| +o+7+ |>');
  });

  it('only accept array of string parsers', function () {
    expect(function () {
      Parsimmon.of(1).tieWith('').tryParse('');
    }).toThrow();
    expect(function () {
      Parsimmon.of([1]).tieWith('').tryParse('');
    }).toThrow();
    expect(function () {
      Parsimmon.of(['1', 2]).tieWith('').tryParse('');
    }).toThrow();
    expect(function () {
      Parsimmon.of(['1']).tieWith('').tryParse('');
    }).not.toThrow();
  });
});
