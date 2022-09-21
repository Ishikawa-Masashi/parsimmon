import * as Parsimmon from '../../src';

describe('alt', () => {
  test('Parsimmon.alt', () => {
    const toNode = (nodeType: string) => {
      return function (value: any) {
        return { type: nodeType, value: value };
      };
    };

    const stringParser = Parsimmon.seq(
      Parsimmon.string('"'),
      Parsimmon.regexp(/[^"]*/),
      Parsimmon.string('"')
    ).map(toNode('string'));

    const identifierParser = Parsimmon.regexp(/[a-zA-Z]*/).map(
      toNode('identifier')
    );

    const parser = Parsimmon.alt(stringParser, identifierParser);

    //   assert.deepEqual(parser.parse('"a string, to be sure"').value, {
    //     type: 'string',
    //     value: ['"', 'a string, to be sure', '"'],
    //   });

    expect(parser.parse('"a string, to be sure"').value).toEqual({
      type: 'string',
      value: ['"', 'a string, to be sure', '"'],
    });

    //   assert.deepEqual(parser.parse('anIdentifier').value, {
    //     type: 'identifier',
    //     value: 'anIdentifier',
    //   });

    expect(parser.parse('anIdentifier').value).toEqual({
      type: 'identifier',
      value: 'anIdentifier',
    });

    //   assert.throws(function () {
    //     Parsimmon.alt('not a parser');
    //   });

    expect(() => {
      Parsimmon.alt('not a parser');
    }).toThrow();

    //   assert.strictEqual(Parsimmon.alt().parse('').status, false);

    expect(Parsimmon.alt().parse('').status).toBeFalsy();
  });
});
