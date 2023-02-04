import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src';

describe('bitSeq', () => {
  it('consumes bits into a sequence from a buffer', () => {
    const b = Buffer.from([0xff, 0xff]);
    const p = Parsimmon.Binary.bitSeq([3, 5, 5, 3]);
    // assert.deepEqual(p.parse(b).value, [7, 31, 31, 7]);
    expect(p.parse(b).value).toEqual([7, 31, 31, 7]);
  });

  it("disallows construction of parsers that don't align to byte boundaries", function () {
    // assert.throws(function () {
    //   Parsimmon.Binary.bitSeq([1, 2]);
    // }, /add up to 3/);
    expect(() => Parsimmon.Binary.bitSeq([1, 2])).toThrowError();
  });

  it('fails if requesting too much', () => {
    const b = Buffer.from([]);
    const p = Parsimmon.Binary.bitSeq([3, 5, 5, 3]);
    // assert.deepEqual(p.parse(b).expected, ['2 bytes']);
    expect(p.parse(b).expected).toEqual(['2 bytes']);
  });

  //   it('throws an exception for too large of a range request', function () {
  //     assert.throws(function () {
  //       Parsimmon.Binary.bitSeq([1, 2, 4, 49]);
  //     }, /49 bit range/);
  //   });

  //   context('Buffer is not present.', function () {
  //     var buff;
  //     before(function () {
  //       buff = global.Buffer;
  //       global.Buffer = undefined;
  //     });

  //     after(function () {
  //       global.Buffer = buff;
  //     });

  //     it('Disallows construction.', function () {
  //       assert.throws(function () {
  //         Parsimmon.Binary.bitSeq(0xf);
  //       }, /buffer global/i);
  //     });
  //   });

  //   context("We are bitSeq'ing not at the beginning.", function () {
  //     it('Should still work.', function () {
  //       var b = Buffer.from([0x10, 0xff, 0xff]);
  //       var p = Parsimmon.seqObj(Parsimmon.any, [
  //         'data',
  //         Parsimmon.Binary.bitSeq([3, 5, 5, 3]),
  //       ]);
  //       assert.deepEqual(p.parse(b).value.data, [7, 31, 31, 7]);
  //     });
  //   });
});
