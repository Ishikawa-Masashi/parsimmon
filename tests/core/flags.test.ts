import * as Parsimmon from '../../src';

describe('flags()', () => {
  it('works in modern browsers', () => {
    // assert.throws(function () {
    //   Parsimmon.regexp(new RegExp('a', 'g'));
    // });
    expect(() => {
      Parsimmon.regexp(new RegExp('a', 'g'));
    }).toThrow();
    // assert.doesNotThrow(function () {
    //   Parsimmon.regexp(new RegExp('a', 'i'));
    // });
    expect(() => {
      Parsimmon.regexp(new RegExp('a', 'i'));
    }).not.toThrow();
    // assert.doesNotThrow(function () {
    //   Parsimmon.regexp(new RegExp('a', 'm'));
    // });
    expect(() => {
      Parsimmon.regexp(new RegExp('a', 'm'));
    }).not.toThrow();
    // assert.doesNotThrow(function () {
    //   Parsimmon.regexp(new RegExp('a', 'u'));
    // });
    expect(() => {
      Parsimmon.regexp(new RegExp('a', 'u'));
    }).not.toThrow();
    // assert.throws(function () {
    //   Parsimmon.regexp(new RegExp('a', 'y'));
    // });
    expect(() => {
      Parsimmon.regexp(new RegExp('a', 'y'));
    }).toThrow();
  });

  it('works on legacy browsers without Regexp.flags property with flags', () => {
    const oldRegExpG = new RegExp('a', 'g');
    const oldRegExpI = new RegExp('a', 'i');
    const oldRegExpM = new RegExp('a', 'm');
    const oldRegExpU = new RegExp('a', 'u');
    const oldRegExpY = new RegExp('a', 'y');
    const oldRegExps = [
      oldRegExpG,
      oldRegExpI,
      oldRegExpM,
      oldRegExpU,
      oldRegExpY,
    ];
    // Simulate old RegExp without the flags property
    oldRegExps.forEach((r) => {
      Object.defineProperty(r, 'flags', { value: undefined });
      //   assert.strictEqual(r.flags, undefined);
      expect(r.flags).toBeUndefined();
    });
    //     assert.throws(function () {
    //       Parsimmon.regexp(oldRegExpG);
    //     });
    expect(() => {
      Parsimmon.regexp(oldRegExpG);
    }).toThrow();
    //     assert.doesNotThrow(function () {
    //       Parsimmon.regexp(oldRegExpI);
    //     });
    expect(() => {
      Parsimmon.regexp(oldRegExpI);
    }).not.toThrow();
    //     assert.doesNotThrow(function () {
    //       Parsimmon.regexp(oldRegExpM);
    //     });
    expect(() => {
      Parsimmon.regexp(oldRegExpM);
    }).not.toThrow();
    //     assert.doesNotThrow(function () {
    //       Parsimmon.regexp(oldRegExpU);
    //     });
    expect(() => {
      Parsimmon.regexp(oldRegExpU);
    }).not.toThrow();
    //     assert.throws(function () {
    //       Parsimmon.regexp(oldRegExpY);
    //     });
    expect(() => {
      Parsimmon.regexp(oldRegExpY);
    }).toThrow();
  });

  it('works on legacy browsers without Regexp.flags property without flags', () => {
    const oldRegExp = new RegExp('a', '');

    // Simulate old RegExp without the flags property
    Object.defineProperty(oldRegExp, 'flags', { value: undefined });
    // assert.strictEqual(oldRegExp.flags, undefined);
    expect(oldRegExp.flags).toBeUndefined();

    // assert.doesNotThrow(function () {
    //   Parsimmon.regexp(oldRegExp);
    // });
    expect(() => {
      Parsimmon.regexp(oldRegExp);
    }).not.toThrow();
  });
});
