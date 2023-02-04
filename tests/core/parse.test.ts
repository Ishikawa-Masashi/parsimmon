import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('.parse', () => {
  it('Unique and sorted .expected array', () => {
    const parser = Parsimmon.alt(
      Parsimmon.fail('c'),
      Parsimmon.fail('a'),
      Parsimmon.fail('a'),
      Parsimmon.fail('b'),
      Parsimmon.fail('b'),
      Parsimmon.fail('b'),
      Parsimmon.fail('a')
    );
    const result = parser.parse('');
    // assert.deepEqual(result.expected, ["a", "b", "c"]);
    expect(result.expected).toEqual(['a', 'b', 'c']);
  });

  it('throws when given a non-string argument', function () {
    // assert.throws(function() {
    //   Parsimmon.of("kaboom").parse(0);
    // });
    expect(function () {
      Parsimmon.of('kaboom').parse(0);
    }).toThrow();
    // assert.throws(function() {
    //   Parsimmon.of("kaboom").parse();
    // });
    expect(function () {
      Parsimmon.of('kaboom').parse();
    }).toThrow();
  });
});
