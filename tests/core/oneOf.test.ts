import * as Parsimmon from '../../src';

it('matches ONLY the characters specified', () => {
  const parser = Parsimmon.oneOf('abc');
  const a = 'a'.charCodeAt(0);
  const c = 'c'.charCodeAt(0);
  for (let i = 0; i < 255; i++) {
    const s = String.fromCharCode(i);
    if (a <= i && i <= c) {
      expect(parser.parse(s).status).toBeTruthy();
    } else {
      expect(parser.parse(s).status).toBeFalsy();
    }
  }
});
