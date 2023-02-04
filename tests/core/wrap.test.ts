import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

// testSetScenario(function() {
describe('parser.wrap', () => {
  // globalThis.testSetScenario = function testSetScenario(fn) {
  // describe("", function() {
  // fn();

  // if (typeof Set !== "undefined") {
  // describe("no Set", function() {
  beforeAll(function () {
    Parsimmon._supportsSet = false;
  });

  afterAll(function () {
    Parsimmon._supportsSet = undefined;
  });

  // fn();
  // });
  // }
  // });
  // };
  it('should remove different stuff from the begin and end', () => {
    const lParen = Parsimmon.string('(');
    const rParen = Parsimmon.string(')');
    const parser = Parsimmon.letters.wrap(lParen, rParen);
    const value = parser.tryParse('(heyyy)');
    // assert.strictEqual(value, "heyyy");
    expect(value).toBe('heyyy');
  });
});
// });
