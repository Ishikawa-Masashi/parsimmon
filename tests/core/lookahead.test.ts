import * as Parsimmon from '../../src';

describe('Parsimmon.lookahead', () => {
  it('should handle a string', () => {
    Parsimmon.lookahead('');
  });

  it('should handle a regexp', function () {
    Parsimmon.lookahead(/./);
  });

  it('should handle a parser', function () {
    Parsimmon.lookahead(Parsimmon.digit);
  });

  it('can be chained as prototype', function () {
    const parser = Parsimmon.seq(
      Parsimmon.string('abc').lookahead('d'),
      Parsimmon.string('d')
    );
    const answer = parser.parse('abcd');
    // assert.deepEqual(answer.value, ['abc', 'd']);
    expect(answer.value).toEqual(['abc', 'd']);
  });

  it('does not consume from a string', () => {
    const parser = Parsimmon.seq(
      Parsimmon.string('abc'),
      Parsimmon.lookahead('d'),
      Parsimmon.string('d')
    );
    const answer = parser.parse('abcd');
    // assert.deepEqual(answer.value, ['abc', '', 'd']);
    expect(answer.value).toEqual(['abc', '', 'd']);
  });

  it('does not consume from a regexp', () => {
    const parser = Parsimmon.seq(
      Parsimmon.string('abc'),
      Parsimmon.lookahead(/d/),
      Parsimmon.string('d')
    );
    const answer = parser.parse('abcd');
    // assert.deepEqual(answer.value, ['abc', '', 'd']);
    expect(answer.value).toEqual(['abc', '', 'd']);
  });

  it('does not consume from a parser', () => {
    const weirdParser = Parsimmon.string('Q').or(Parsimmon.string('d'));
    const parser = Parsimmon.seq(
      Parsimmon.string('abc'),
      Parsimmon.lookahead(weirdParser),
      Parsimmon.string('d')
    );
    const answer = parser.parse('abcd');
    // assert.deepEqual(answer.value, ['abc', '', 'd']);
    expect(answer.value).toEqual(['abc', '', 'd']);
  });

  it('raises error if argument is not a string, regexp, or parser', () => {
    // assert.throws(function () {
    //   Parsimmon.lookahead({});
    // });
    expect(() => {
      Parsimmon.lookahead({});
    }).toThrow();
    // assert.throws(function () {
    //   Parsimmon.lookahead([]);
    // });
    expect(() => {
      Parsimmon.lookahead([]);
    }).toThrow();
    // assert.throws(function () {
    //   Parsimmon.lookahead(true);
    // });
    expect(() => {
      Parsimmon.lookahead(true);
    }).toThrow();
    // assert.throws(function () {
    //   Parsimmon.lookahead(12);
    // });
    expect(() => {
      Parsimmon.lookahead(12);
    }).toThrow();
  });
});
