import * as Parsimmon from '../../src';

describe('Parsimmon.custom', () => {
  it('simple parser definition', () => {
    function customAny() {
      return Parsimmon.custom(function (success: any) {
        return function (input: string, i: number) {
          return success(i + 1, input.charAt(i));
        };
      });
    }

    const letters = [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
    ];
    const parser = customAny();

    for (let i = 0; i < letters.length; i++) {
      //   assert.deepEqual(parser.parse(letters[i]), {
      //     status: true,
      //     value: letters[i],
      //   });
      expect(parser.parse(letters[i])).toEqual({
        status: true,
        value: letters[i],
      });
    }
  });

  it('failing parser', () => {
    function failer() {
      return Parsimmon.custom(function (success: any, failure: any) {
        return function (input: string, i: number) {
          return failure(i, 'nothing');
        };
      });
    }

    // assert.deepEqual(failer().parse('a'), {
    //   status: false,
    //   index: {
    //     offset: 0,
    //     line: 1,
    //     column: 1,
    //   },
    //   expected: ['nothing'],
    // });
    expect(failer().parse('a')).toEqual({
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1,
      },
      expected: ['nothing'],
    });
  });

  it('composes with existing parsers', () => {
    function notChar(char: string) {
      return Parsimmon.custom((success: any, failure: any) => {
        return function (input: string, i: number) {
          if (input.charCodeAt(i) !== char.charCodeAt(0)) {
            return success(i + 1, input.charAt(i));
          }
          return (
            failure(i, 'something different than "' + input.charAt(i)) + '"'
          );
        };
      });
    }

    function join(array: string[]) {
      return array.join('');
    }

    const parser = Parsimmon.seq(
      Parsimmon.string('a'),
      notChar('b').times(5).map(join),
      notChar('b').or(Parsimmon.string('b'))
    ).map(join);

    // assert.deepEqual(parser.parse('acccccb'), {
    //   status: true,
    //   value: 'acccccb',
    // });
    expect(parser.parse('acccccb')).toEqual({
      status: true,
      value: 'acccccb',
    });
  });
});
