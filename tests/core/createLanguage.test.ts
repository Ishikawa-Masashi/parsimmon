import * as Parsimmon from '../../src';
import { Parser } from '../../src/types';

describe('Parsimmon.createLanguage', () => {
  //   beforeEach(() => {
  //     Object.prototype.NASTY = 'dont extend Object.prototype please';
  //   });

  //   afterEach(() => {
  //     delete Object.prototype.NASTY;
  //   });

  it('should return an object of parsers', function () {
    const lang = Parsimmon.createLanguage({
      a: function () {
        return Parsimmon.string('a');
      },
      b: function () {
        return Parsimmon.string('b');
      },
    });
    // assert.ok(Parsimmon.isParser(lang.a));
    expect(Parsimmon.isParser(lang.a)).toBeTruthy();
    // assert.ok(Parsimmon.isParser(lang.b));
    expect(Parsimmon.isParser(lang.b)).toBeTruthy();
  });

  it('should allow direct recursion in parsers', () => {
    const lang = Parsimmon.createLanguage({
      Parentheses: function (r: any) {
        return Parsimmon.alt(
          Parsimmon.string('()'),
          Parsimmon.string('(').then(r.Parentheses).skip(Parsimmon.string(')'))
        );
      },
    });
    lang.Parentheses.tryParse('(((())))');
  });

  it('should ignore non-own properties', () => {
    const obj = Object.create({
      foo: function () {
        return Parsimmon.of(1);
      },
    });
    const lang = Parsimmon.createLanguage(obj);
    // assert.strictEqual(lang.foo, undefined);
    expect(lang.foo).toBeUndefined();
  });

  it('should allow indirect recursion in parsers', () => {
    const rules = {
      Value: function (r: any) {
        return Parsimmon.alt(r.Number, r.Symbol, r.List);
      },
      Number: function () {
        return Parsimmon.regexp(/[0-9]+/).map(Number);
      },
      Symbol: function () {
        return Parsimmon.regexp(/[a-z]+/);
      },
      List: function (r: any) {
        return Parsimmon.string('(')
          .then(Parsimmon.sepBy(r.Value, r._))
          .skip(Parsimmon.string(')'));
      },
      _: function () {
        return Parsimmon.optWhitespace;
      },
    };
    const lang = Parsimmon.createLanguage({
      Value: function (r: any) {
        return Parsimmon.alt(r.Number, r.Symbol, r.List);
      },
      Number: function () {
        return Parsimmon.regexp(/[0-9]+/).map(Number);
      },
      Symbol: function () {
        return Parsimmon.regexp(/[a-z]+/);
      },
      List: function (r: any) {
        return Parsimmon.string('(')
          .then(Parsimmon.sepBy(r.Value, r._))
          .skip(Parsimmon.string(')'));
      },
      _: function () {
        return Parsimmon.optWhitespace;
      },
    });
    const lang2 = Parsimmon.createLanguage(rules);
    lang.Value.tryParse('(list 1 2 foo (list nice 3 56 989 asdasdas))');
  });
});
