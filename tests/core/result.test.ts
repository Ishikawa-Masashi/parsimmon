import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('result', () => {
  it('returns a constant result', () => {
    const oneParser = Parsimmon.string('x').result(1);
    // assert.deepEqual(oneParser.parse("x"), { status: true, value: 1 });
    expect(oneParser.parse('x')).toEqual({ status: true, value: 1 });
  });
});
