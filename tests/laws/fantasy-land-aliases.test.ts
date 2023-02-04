import { describe, it, expect } from 'vitest';
import * as Parsimmon from '../../src/parsimmon';

describe('fantasy-land/* method aliases', () => {
  function makeTester(name: string) {
    return () => {
      const flName = 'fantasy-land/' + name;
      const parser = Parsimmon.of('burrito');
      // assert.equal(parser[name], parser[flName]);
      expect(parser[name]).toEqual(parser[flName]);
    };
  }
  const methods = ['ap', 'chain', 'concat', 'empty', 'map', 'of'];
  for (let i = 0; i < methods.length; i++) {
    it('fantasy-land/' + methods[i] + ' alias', makeTester(methods[i]));
  }

  //   it('Fantasy Land Parsimmon.empty alias', function () {
  //     // assert.equal(Parsimmon.empty, Parsimmon["fantasy-land/empty"]);
  //     expect(Parsimmon.empty).toEqual(Parsimmon['fantasy-land/empty']);
  //     expect(Parsimmon.empty).toEqual(Parsimmon['fantasy-land/empty']);
  //   });

  //   it('Fantasy Land Parsimmon.of alias', function () {
  //     // assert.equal(Parsimmon.of, Parsimmon["fantasy-land/of"]);
  //     expect(Parsimmon.of).toEqual(Parsimmon['fantasy-land/of']);
  //     // assert.equal(Parsimmon.of, Parsimmon.any.of);
  //     expect(Parsimmon.of).toEqual(Parsimmon.any.of);
  //   });
});
