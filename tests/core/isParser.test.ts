import * as Parsimmon from '../../src';

it('Parsimmon.isParser', () => {
  //   assert.strictEqual(Parsimmon.isParser(undefined), false);
  expect(Parsimmon.isParser(undefined)).toBeFalsy();
  //   assert.strictEqual(Parsimmon.isParser({}), false);
  expect(Parsimmon.isParser({})).toBeFalsy();
  //   assert.strictEqual(Parsimmon.isParser(null), false);
  expect(Parsimmon.isParser(null)).toBeFalsy();
  //   assert.strictEqual(Parsimmon.isParser(Parsimmon.string('x')), true);
  expect(Parsimmon.isParser(Parsimmon.string('x'))).toBeTruthy();
  //   assert.strictEqual(Parsimmon.isParser(Parsimmon.regexp(/[0-9]/)), true);
  expect(Parsimmon.isParser(Parsimmon.regexp(/[0-9]/))).toBeTruthy();
});
