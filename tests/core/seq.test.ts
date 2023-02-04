import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('Parsimmon.seq', function () {
  beforeAll(() => {
    Parsimmon._supportsSet = false;
  });

  afterAll(function () {
    Parsimmon._supportsSet = undefined;
  });
  it('Parsimmon.seq', () => {
    const parser = Parsimmon.seq(
      Parsimmon.string('('),
      Parsimmon.regexp(/[^)]/)
        .many()
        .map(function (xs) {
          return xs.join('');
        }),
      Parsimmon.string(')')
    );

    // assert.deepEqual(parser.parse("(string between parens)").value, [
    //   "(",
    //   "string between parens",
    //   ")"
    // ]);
    expect(parser.parse('(string between parens)').value).toEqual([
      '(',
      'string between parens',
      ')',
    ]);

    // assert.deepEqual(parser.parse("(string"), {
    //   status: false,
    //   index: {
    //     offset: 7,
    //     line: 1,
    //     column: 8
    //   },
    //   expected: ["')'", "/[^)]/"]
    // });
    expect(parser.parse('(string')).toEqual({
      status: false,
      index: {
        offset: 7,
        line: 1,
        column: 8,
      },
      expected: ["')'", '/[^)]/'],
    });

    // assert.deepEqual(parser.parse("starts wrong (string between parens)"), {
    //   status: false,
    //   index: {
    //     offset: 0,
    //     line: 1,
    //     column: 1
    //   },
    //   expected: ["'('"]
    // });
    expect(parser.parse('starts wrong (string between parens)')).toEqual({
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1,
      },
      expected: ["'('"],
    });

    // assert.throws(function() {
    //   Parsimmon.seq("not a parser");
    // });
    expect(function () {
      Parsimmon.seq('not a parser');
    }).toThrow();
  });
});
