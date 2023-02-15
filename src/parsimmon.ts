export type StreamType = string;

interface Index {
  /** zero-based character offset */
  offset: number;
  /** one-based line offset */
  line: number;
  /** one-based column offset */
  column: number;
}

interface Mark<T> {
  start: Index;
  end: Index;
  value: T;
}

interface Node<Name extends string, T> extends Mark<T> {
  name: Name;
}

export interface Success<T> {
  status: true;
  value: T;
}

export interface Failure {
  status: false;
  expected: string[];
  index: Index;
}

export interface Language {
  [key: string]: Parser<any>;
}

interface Rule {
  [key: string]: (r: Language) => Parser<any>;
}

export interface FailureReply {
  status: false;
  index: -1;
  value: null;
  furthest: number;
  expected: string[];
}

export type Reply<T> = SuccessReply<T> | FailureReply;

export type Result<T> = Success<T> | Failure;

export interface SuccessReply<T> {
  status: true;
  index: number;
  value: T;
  furthest: -1;
  expected: string[];
}

export type TypedLanguage<TLanguageSpec> = {
  [P in keyof TLanguageSpec]: Parser<TLanguageSpec[P]>;
};

export type TypedRule<TLanguageSpec> = {
  [P in keyof TLanguageSpec]: (
    r: TypedLanguage<TLanguageSpec>
  ) => Parser<TLanguageSpec[P]>;
};

export class Parser<T = unknown> {
  _: (input: string, i: number) => Reply<T>;
  static _supportsSet: boolean;
  constructor(fn: (input: string, i: number) => Reply<T>) {
    this._ = fn;
  }

  // -*- Core Parsing Methods -*-

  /**
   * parse the string
   */
  parse(input: string | Buffer): Result<T> {
    if (typeof input !== 'string' && !isBuffer(input)) {
      throw new Error(
        '.parse must be called with a string or Buffer as its argument'
      );
    }
    const parseResult = this.skip(eof)._(input, 0);

    let result: Result<T>;
    if (parseResult.status) {
      result = {
        status: true,
        value: parseResult.value,
      };
    } else {
      result = {
        status: false,
        index: makeLineColumnIndex(input, parseResult.furthest),
        expected: parseResult.expected,
      };
    }

    // release memory from lineColumnIndex now we are done parsing
    delete lineColumnIndex[input];

    return result;
  }

  // -*- Other Methods -*-

  /**
   * Like parser.parse(input) but either returns the parsed value or throws
   * an error on failure. The error object contains additional properties
   * about the error.
   */
  tryParse(str: string): T {
    const result = this.parse(str);
    if (result.status) {
      return result.value;
    } else {
      const msg = formatError(str, result);
      const err: any = new Error(msg);
      err.type = 'ParsimmonError';
      err.result = result;
      throw err;
    }
  }

  /**
   * Passes the result of `parser` to the function `condition`,
   * which returns a boolean. If the the condition is false, returns
   * a failed parse with the given `message`. Else it returns the
   * original result of `parser`.
   */
  assert(condition: (result: T) => boolean, errorMessage: string): Parser<T> {
    return this.chain((value) =>
      condition(value) ? succeed(value) : fail(errorMessage)
    );
  }

  /**
   * returns a new parser which tries parser, and if it fails uses otherParser.
   */
  or(alternative: Parser<T>): Parser<T> {
    return alt(this, alternative);
  }

  /**
   * expects anotherParser before and after parser, yielding the result of parser
   */
  trim<U>(parser: Parser<U>): Parser<T> {
    return this.wrap(parser, parser);
  }

  /**
   * Expects the parser before before parser and after after parser.
   */
  wrap(leftParser: Parser<any>, rightParser: Parser<any>): Parser<T> {
    return seqMap(leftParser, this, rightParser, (left, middle) => middle);
  }

  /**
   * returns wrapper(this) from the parser. Useful for custom functions used
   * to wrap your parsers, while keeping with Parsimmon chaining style.
   */
  thru<U>(call: (wrapper: Parser<T>) => Parser<U>): Parser<U> {
    return call(this);
  }

  /**
   * returns a new parser which tries parser, and on success calls the given function
   * with the result of the parse, which is expected to return another parser.
   */
  then<U>(call: (result: T) => Parser<U>): Parser<U>;

  /**
   * expects anotherParser to follow parser, and yields the result of anotherParser.
   * NB: the result of parser here is ignored.
   */
  then<U>(anotherParser: Parser<U>): Parser<U>;
  then(next: any) {
    assertParser(next);
    return seq(this, next).map(function (results: any) {
      return results[1];
    });
  }

  /**
   * expects parser zero or more times, and yields an array of the results.
   */
  many(): Parser<T[]> {
    return new Parser((input, i) => {
      const accum = [];
      let result = undefined;

      for (;;) {
        result = mergeReplies(this._(input, i), result);
        if (result.status) {
          if (i === result.index) {
            throw new Error(
              'infinite loop detected in .many() parser --- calling .many() on ' +
                'a parser which can accept zero characters is usually the cause'
            );
          }
          i = result.index;
          accum.push(result.value);
        } else {
          return mergeReplies(makeSuccess(i, accum), result);
        }
      }
    });
  }

  /**
   * When called on a parser yielding an array of strings, yields all their strings
   * concatenated with the separator. Asserts that its input is actually an array of strings.
   */
  tieWith(separator: string): Parser<string> {
    assertString(separator);
    return this.map(function (args: string[]) {
      assertArray(args);
      if (args.length) {
        assertString(args[0]);
        let s = args[0];
        for (let i = 1; i < args.length; i++) {
          assertString(args[i]);
          s += separator + args[i];
        }
        return s;
      } else {
        return '';
      }
    });
  }

  /**
   * Equivalent to parser.tieWith("").
   *
   * Note: parser.tie() is usually used after Parsimmon.seq(...parsers) or parser.many().
   */
  tie() {
    return this.tieWith('');
  }

  /**
   * expects parser exactly n times, and yields an array of the results.
   */
  times(n: number): Parser<T[]>;
  /**
   * expects parser between min and max times, and yields an array of the results.
   */
  // tslint:disable-next-line:unified-signatures
  times(min: number, max?: number): Parser<T[]> {
    if (arguments.length < 2) {
      max = min;
    }
    assertNumber(min);
    assertNumber(max);
    return new Parser((input, i) => {
      const accum = [];
      let result = undefined;
      let prevResult = undefined;
      let times = 0;
      for (; times < min; times += 1) {
        result = this._(input, i);
        prevResult = mergeReplies(result, prevResult);
        if (result.status) {
          i = result.index;
          accum.push(result.value);
        } else {
          return prevResult;
        }
      }
      for (; times < max; times += 1) {
        result = this._(input, i);
        prevResult = mergeReplies(result, prevResult);
        if (result.status) {
          i = result.index;
          accum.push(result.value);
        } else {
          break;
        }
      }
      return mergeReplies(makeSuccess(i, accum), prevResult);
    });
  }

  result<U>(res: U) {
    return this.map(() => res);
  }

  atMost(n: number) {
    return this.times(0, n);
  }

  atLeast(n: number) {
    return seqMap(this.times(n), this.many(), function (init: any, rest: any) {
      return init.concat(rest);
    });
  }

  /**
   * transforms the output of parser with the given function.
   */
  map<U>(fn: (result: T) => U): Parser<U>;
  map<U>(fn: (result: string[]) => U): Parser<U>;
  map<U>(fn: (result: any) => U): Parser<U> {
    assertFunction(fn);
    const self = this;
    return new Parser(function (input: any, i: any) {
      const result = self._(input, i);
      if (!result.status) {
        return result;
      }
      return mergeReplies(makeSuccess(result.index, fn(result.value)), result);
    });
  }

  contramap(fn: any) {
    assertFunction(fn);
    const self = this;
    return new Parser(function (input: any, i: any) {
      const result = self.parse(fn(input.slice(i)));
      if (!result.status) {
        return result;
      }
      return makeSuccess(i + input.length, result.value);
    });
  }

  promap(f: any, g: any) {
    assertFunction(f);
    assertFunction(g);
    return this.contramap(f).map(g);
  }

  skip(next: any) {
    return seq(this, next).map(function (results: any) {
      return results[0];
    });
  }

  mark() {
    return seqMap(
      index,
      this,
      index,
      function (start: any, value: any, end: any) {
        return {
          start: start,
          value: value,
          end: end,
        };
      }
    );
  }

  node(name: any) {
    return seqMap(
      index,
      this,
      index,
      function (start: any, value: any, end: any) {
        return {
          name: name,
          value: value,
          start: start,
          end: end,
        };
      }
    );
  }

  sepBy(separator: any) {
    return sepBy(this, separator);
  }

  sepBy1(separator: any) {
    return sepBy1(this, separator);
  }

  lookahead(x: any) {
    return this.skip(lookahead(x));
  }

  notFollowedBy(x: any) {
    return this.skip(notFollowedBy(x));
  }

  desc(expected: any) {
    if (!isArray(expected)) {
      expected = [expected];
    }
    const self = this;
    return new Parser(function (input: any, i: any) {
      const reply = self._(input, i);
      if (!reply.status) {
        reply.expected = expected;
      }
      return reply;
    });
  }

  fallback(result: any) {
    return this.or(succeed(result));
  }

  ap(other: any) {
    return seqMap(other, this, function (f: any, x: any) {
      return f(x);
    });
  }

  chain<U>(f: (next: T) => Parser<U>): Parser<U> {
    const self = this;
    return new Parser(function (input: any, i: any) {
      const result = self._(input, i);
      if (!result.status) {
        return result;
      }
      const nextParser = f(result.value);
      return mergeReplies(nextParser._(input, result.index), result);
    });
  }

  concat = this.or;
  empty = empty;
  of = succeed;
  ['fantasy-land/ap'] = this.ap;
  ['fantasy-land/chain'] = this.chain;
  ['fantasy-land/concat'] = this.concat;
  ['fantasy-land/empty'] = this.empty;
  ['fantasy-land/of'] = this.of;
  ['fantasy-land/map'] = this.map;
}

const _ = Parser.prototype;

function times(n: any, f: any) {
  let i = 0;
  for (i; i < n; i++) {
    f(i);
  }
}

function forEach(f: any, arr: any) {
  times(arr.length, function (i: any) {
    f(arr[i], i, arr);
  });
}

function reduce(f: any, seed: any, arr: any) {
  forEach(function (elem: any, i: any, arr: any) {
    seed = f(seed, elem, i, arr);
  }, arr);
  return seed;
}

function map(f: any, arr: any) {
  return reduce(
    function (acc: any, elem: any, i: any, a: any) {
      return acc.concat([f(elem, i, a)]);
    },
    [],
    arr
  );
}

function lshiftBuffer(input: any) {
  const asTwoBytes = reduce(
    function (a: any, v: any, i: any, b: any) {
      return a.concat(
        i === b.length - 1
          ? Buffer.from([v, 0]).readUInt16BE(0)
          : b.readUInt16BE(i)
      );
    },
    [],
    input
  );
  return Buffer.from(
    map(function (x: any) {
      return ((x << 1) & 0xffff) >> 8;
    }, asTwoBytes)
  );
}

function consumeBitsFromBuffer(n: any, input: any) {
  let state = { v: 0, buf: input };
  times(n, function () {
    state = {
      v: (state.v << 1) | bitPeekBuffer(state.buf),
      buf: lshiftBuffer(state.buf),
    };
  });
  return state;
}

function bitPeekBuffer(input: any) {
  return input[0] >> 7;
}

function sum(numArr: any) {
  return reduce(
    function (x: any, y: any) {
      return x + y;
    },
    0,
    numArr
  );
}

function find(pred: any, arr: any) {
  return reduce(
    function (found: any, elem: any) {
      return found || (pred(elem) ? elem : found);
    },
    null,
    arr
  );
}

function bufferExists() {
  return typeof Buffer !== 'undefined';
}

function setExists() {
  if (Parser._supportsSet !== undefined) {
    return Parser._supportsSet;
  }
  const exists = typeof Set !== 'undefined';
  Parser._supportsSet = exists;
  return exists;
}

function ensureBuffer() {
  if (!bufferExists()) {
    throw new Error(
      'Buffer global does not exist; please use webpack if you need to parse Buffers in the browser.'
    );
  }
}

function bitSeq(alignments: any) {
  ensureBuffer();
  const totalBits = sum(alignments);
  if (totalBits % 8 !== 0) {
    throw new Error(
      'The bits [' +
        alignments.join(', ') +
        '] add up to ' +
        totalBits +
        ' which is not an even number of bytes; the total should be divisible by 8'
    );
  }
  const bytes = totalBits / 8;

  const tooBigRange = find(function (x: any) {
    return x > 48;
  }, alignments);
  if (tooBigRange) {
    throw new Error(
      tooBigRange + ' bit range requested exceeds 48 bit (6 byte) Number max.'
    );
  }

  return new Parser<Buffer>(function (input: any, i: any) {
    const newPos = bytes + i;
    if (newPos > input.length) {
      return makeFailure(i, bytes.toString() + ' bytes');
    }
    return makeSuccess(
      newPos,
      reduce(
        function (acc: any, bits: any) {
          const state = consumeBitsFromBuffer(bits, acc.buf);
          return {
            coll: acc.coll.concat(state.v),
            buf: state.buf,
          };
        },
        { coll: [], buf: input.slice(i, newPos) },
        alignments
      ).coll
    );
  });
}

function bitSeqObj(namedAlignments: any) {
  ensureBuffer();
  const seenKeys: any = {};
  let totalKeys = 0;
  const fullAlignments = map(function (item: any) {
    if (isArray(item)) {
      const pair = item;
      if (pair.length !== 2) {
        throw new Error(
          '[' +
            pair.join(', ') +
            '] should be length 2, got length ' +
            pair.length
        );
      }
      assertString(pair[0]);
      assertNumber(pair[1]);
      if (Object.prototype.hasOwnProperty.call(seenKeys, pair[0])) {
        throw new Error('duplicate key in bitSeqObj: ' + pair[0]);
      }
      seenKeys[pair[0]] = true;
      totalKeys++;
      return pair;
    } else {
      assertNumber(item);
      return [null, item];
    }
  }, namedAlignments);
  if (totalKeys < 1) {
    throw new Error(
      'bitSeqObj expects at least one named pair, got [' +
        namedAlignments.join(', ') +
        ']'
    );
  }
  const namesOnly = map(function (pair: any) {
    return pair[0];
  }, fullAlignments);
  const alignmentsOnly = map(function (pair: any) {
    return pair[1];
  }, fullAlignments);

  return bitSeq(alignmentsOnly).map(function (parsed: any) {
    const namedParsed = map(function (name: any, i: any) {
      return [name, parsed[i]];
    }, namesOnly);

    return reduce(
      function (obj: any, kv: any) {
        if (kv[0] !== null) {
          obj[kv[0]] = kv[1];
        }
        return obj;
      },
      {},
      namedParsed
    );
  });
}

function parseBufferFor(other: any, length: any) {
  return new Parser(function (input: string, i: number) {
    ensureBuffer();
    if (i + length > input.length) {
      return makeFailure(i, length + ' bytes for ' + other);
    }
    return makeSuccess(i + length, input.slice(i, i + length));
  });
}

function parseBuffer(length: any) {
  return parseBufferFor('buffer', length).map(function (unsafe: any) {
    return Buffer.from(unsafe);
  });
}

function encodedString(encoding: any, length: any) {
  return parseBufferFor('string', length).map(function (buff: any) {
    return buff.toString(encoding);
  });
}

function isInteger(value: any) {
  return typeof value === 'number' && Math.floor(value) === value;
}

function assertValidIntegerByteLengthFor(who: any, length: any) {
  if (!isInteger(length) || length < 0 || length > 6) {
    throw new Error(who + ' requires integer length in range [0, 6].');
  }
}

function uintBE(length: number) {
  assertValidIntegerByteLengthFor('uintBE', length);
  return parseBufferFor('uintBE(' + length + ')', length).map(function (
    buff: any
  ) {
    return buff.readUIntBE(0, length);
  });
}

function uintLE(length: number) {
  assertValidIntegerByteLengthFor('uintLE', length);
  return parseBufferFor('uintLE(' + length + ')', length).map(function (
    buff: any
  ) {
    return buff.readUIntLE(0, length);
  });
}

function intBE(length: any) {
  assertValidIntegerByteLengthFor('intBE', length);
  return parseBufferFor('intBE(' + length + ')', length).map(function (
    buff: any
  ) {
    return buff.readIntBE(0, length);
  });
}

function intLE(length: number) {
  assertValidIntegerByteLengthFor('intLE', length);
  return parseBufferFor('intLE(' + length + ')', length).map(function (
    buff: any
  ) {
    return buff.readIntLE(0, length);
  });
}

function floatBE() {
  return parseBufferFor('floatBE', 4).map(function (buff: any) {
    return buff.readFloatBE(0);
  });
}

function floatLE() {
  return parseBufferFor('floatLE', 4).map(function (buff: any) {
    return buff.readFloatLE(0);
  });
}

function doubleBE() {
  return parseBufferFor('doubleBE', 8).map(function (buff: any) {
    return buff.readDoubleBE(0);
  });
}

function doubleLE() {
  return parseBufferFor('doubleLE', 8).map(function (buff: any) {
    return buff.readDoubleLE(0);
  });
}

function toArray(arrLike: any) {
  return Array.prototype.slice.call(arrLike);
}
// -*- Helpers -*-

export function isParser(obj: unknown): obj is Parser {
  return obj instanceof Parser;
}

function isArray(x: any) {
  return {}.toString.call(x) === '[object Array]';
}

function isBuffer(x: any): x is Buffer {
  /* global Buffer */
  return bufferExists() && Buffer.isBuffer(x);
}

export function makeSuccess<T>(index: number, value: T): SuccessReply<T> {
  return {
    status: true,
    index: index,
    value: value,
    furthest: -1,
    expected: [],
  };
}

/**
 * To be used inside of Parsimmon(fn). Generates an object describing how
 * far the unsuccessful parse went (index), and what kind of syntax it
 * expected to see (expectation). See documentation for Parsimmon(fn).
 */
export function makeFailure(index: any, expected: any): FailureReply {
  if (!isArray(expected)) {
    expected = [expected];
  }
  return {
    status: false,
    index: -1,
    value: null,
    furthest: index,
    expected: expected,
  };
}

function mergeReplies(result: any, last: any) {
  if (!last) {
    return result;
  }
  if (result.furthest > last.furthest) {
    return result;
  }
  const expected =
    result.furthest === last.furthest
      ? union(result.expected, last.expected)
      : last.expected;
  return {
    status: result.status,
    index: result.index,
    value: result.value,
    furthest: last.furthest,
    expected: expected,
  };
}

// index of { input => { index => { lineNumber, startOfLine } } }
// when we see a new index we just walk backwards to the last seen index and
// compute the new lineNumber and startOfLine from there so we don't have to
// recompute from the whole input
const lineColumnIndex: any = {};
function makeLineColumnIndex(input: string, i: number) {
  if (isBuffer(input)) {
    return {
      offset: i,
      line: -1,
      column: -1,
    };
  }

  // initialize if we haven't seen this input yet
  if (!(input in lineColumnIndex)) {
    lineColumnIndex[input] = {};
  }

  const inputIndex = lineColumnIndex[input];

  let prevLine = 0;
  let newLines = 0;
  let lineStart = 0;
  let j = i;
  while (j >= 0) {
    if (j in inputIndex) {
      prevLine = inputIndex[j].line;
      // lineStart === 0 when we haven't found a new line on the walk
      // back from i, so we are on the same line as the previously cached
      // index
      if (lineStart === 0) {
        lineStart = inputIndex[j].lineStart;
      }
      break;
    }

    if (
      // Unix LF (\n) or Windows CRLF (\r\n) line ending
      input.charAt(j) === '\n' ||
      // Old Mac CR (\r) line ending
      (input.charAt(j) === '\r' && input.charAt(j + 1) !== '\n')
    ) {
      newLines++;
      // lineStart === 0 when this is the first new line we have found
      if (lineStart === 0) {
        lineStart = j + 1;
      }
    }
    j--;
  }

  const lineWeAreUpTo = prevLine + newLines;
  const columnWeAreUpTo = i - lineStart;

  inputIndex[i] = { line: lineWeAreUpTo, lineStart: lineStart };

  // lines and columns are 1-indexed
  return {
    offset: i,
    line: lineWeAreUpTo + 1,
    column: columnWeAreUpTo + 1,
  };
}

// Returns the sorted set union of two arrays of strings
function union(xs: any, ys: any) {
  // for newer browsers/node we can improve performance by using
  // modern JS
  if (setExists() && Array.from) {
    // eslint-disable-next-line no-undef
    const set = new Set(xs);
    for (let y = 0; y < ys.length; y++) {
      set.add(ys[y]);
    }
    const arr = Array.from(set);
    arr.sort();
    return arr;
  }
  const obj: any = {};
  for (let i = 0; i < xs.length; i++) {
    obj[xs[i]] = true;
  }
  for (let j = 0; j < ys.length; j++) {
    obj[ys[j]] = true;
  }
  const keys = [];
  for (const k in obj) {
    if ({}.hasOwnProperty.call(obj, k)) {
      keys.push(k);
    }
  }
  keys.sort();
  return keys;
}

function assertParser(p: any) {
  if (!isParser(p)) {
    throw new Error('not a parser: ' + p);
  }
}

function get(input: any, i: any) {
  if (typeof input === 'string') {
    return input.charAt(i);
  }
  return input[i];
}

// TODO[ES5]: Switch to Array.isArray eventually.
function assertArray(x: any) {
  if (!isArray(x)) {
    throw new Error('not an array: ' + x);
  }
}

function assertNumber(x: any): x is number {
  if (typeof x !== 'number') {
    throw new Error('not a number: ' + x);
  }
}

function assertRegexp(x: any) {
  if (!(x instanceof RegExp)) {
    throw new Error('not a regexp: ' + x);
  }
  const f = flags(x);
  for (let i = 0; i < f.length; i++) {
    const c = f.charAt(i);
    // Only allow regexp flags [imus] for now, since [g] and [y] specifically
    // mess up Parsimmon. If more non-stateful regexp flags are added in the
    // future, this will need to be revisited.
    if (c !== 'i' && c !== 'm' && c !== 'u' && c !== 's') {
      throw new Error('unsupported regexp flag "' + c + '": ' + x);
    }
  }
}

function assertFunction(x: any) {
  if (typeof x !== 'function') {
    throw new Error('not a function: ' + x);
  }
}

function assertString(x: any) {
  if (typeof x !== 'string') {
    throw new Error('not a string: ' + x);
  }
}

// -*- Error Formatting -*-

const linesBeforeStringError = 2;
const linesAfterStringError = 3;
const bytesPerLine = 8;
const bytesBefore = bytesPerLine * 5;
const bytesAfter = bytesPerLine * 4;
const defaultLinePrefix = '  ';

function repeat(string: any, amount: any) {
  return new Array(amount + 1).join(string);
}

function formatExpected(expected: any) {
  if (expected.length === 1) {
    return 'Expected:\n\n' + expected[0];
  }
  return 'Expected one of the following: \n\n' + expected.join(', ');
}

function leftPad(str: any, pad: any, char: any) {
  const add = pad - str.length;
  if (add <= 0) {
    return str;
  }
  return repeat(char, add) + str;
}

function toChunks(arr: any, chunkSize: any) {
  const length = arr.length;
  const chunks: any = [];
  let chunkIndex = 0;

  if (length <= chunkSize) {
    return [arr.slice()];
  }

  for (let i = 0; i < length; i++) {
    if (!chunks[chunkIndex]) {
      chunks.push([]);
    }

    chunks[chunkIndex].push(arr[i]);

    if ((i + 1) % chunkSize === 0) {
      chunkIndex++;
    }
  }

  return chunks;
}

// Get a range of indexes including `i`-th element and `before` and `after` amount of elements from `arr`.
function rangeFromIndexAndOffsets(
  i: any,
  before: any,
  after: any,
  length: any
) {
  return {
    // Guard against the negative upper bound for lines included in the output.
    from: i - before > 0 ? i - before : 0,
    to: i + after > length ? length : i + after,
  };
}

function byteRangeToRange(byteRange: any) {
  // Exception for inputs smaller than `bytesPerLine`
  if (byteRange.from === 0 && byteRange.to === 1) {
    return {
      from: byteRange.from,
      to: byteRange.to,
    };
  }

  return {
    from: byteRange.from / bytesPerLine,
    // Round `to`, so we don't get float if the amount of bytes is not divisible by `bytesPerLine`
    to: Math.floor(byteRange.to / bytesPerLine),
  };
}

function formatGot(input: any, error: any) {
  const index = error.index;
  const i = index.offset;

  let verticalMarkerLength = 1;
  let column: any;
  let lineWithErrorIndex;
  let lines;
  let lineRange: any;
  let lastLineNumberLabelLength: any;

  if (i === input.length) {
    return 'Got the end of the input';
  }

  if (isBuffer(input)) {
    const byteLineWithErrorIndex = i - (i % bytesPerLine);
    const columnByteIndex = i - byteLineWithErrorIndex;
    const byteRange = rangeFromIndexAndOffsets(
      byteLineWithErrorIndex,
      bytesBefore,
      bytesAfter + bytesPerLine,
      input.length
    );
    const bytes = input.slice(byteRange.from, byteRange.to);
    const bytesInChunks = toChunks(bytes.toJSON().data, bytesPerLine);

    const byteLines = map(function (byteRow: any) {
      return map(function (byteValue: any) {
        // Prefix byte values with a `0` if they are shorter than 2 characters.
        return leftPad(byteValue.toString(16), 2, '0');
      }, byteRow);
    }, bytesInChunks);

    lineRange = byteRangeToRange(byteRange);
    lineWithErrorIndex = byteLineWithErrorIndex / bytesPerLine;
    column = columnByteIndex * 3;

    // Account for an extra space.
    if (columnByteIndex >= 4) {
      column += 1;
    }

    verticalMarkerLength = 2;
    lines = map(function (byteLine: any) {
      return byteLine.length <= 4
        ? byteLine.join(' ')
        : byteLine.slice(0, 4).join(' ') + '  ' + byteLine.slice(4).join(' ');
    }, byteLines);
    lastLineNumberLabelLength = (
      (lineRange.to > 0 ? lineRange.to - 1 : lineRange.to) * 8
    ).toString(16).length;

    if (lastLineNumberLabelLength < 2) {
      lastLineNumberLabelLength = 2;
    }
  } else {
    const inputLines = input.split(/\r\n|[\n\r\u2028\u2029]/);
    column = index.column - 1;
    lineWithErrorIndex = index.line - 1;
    lineRange = rangeFromIndexAndOffsets(
      lineWithErrorIndex,
      linesBeforeStringError,
      linesAfterStringError,
      inputLines.length
    );

    lines = inputLines.slice(lineRange.from, lineRange.to);
    lastLineNumberLabelLength = lineRange.to.toString().length;
  }

  const lineWithErrorCurrentIndex = lineWithErrorIndex - lineRange.from;

  if (isBuffer(input)) {
    lastLineNumberLabelLength = (
      (lineRange.to > 0 ? lineRange.to - 1 : lineRange.to) * 8
    ).toString(16).length;

    if (lastLineNumberLabelLength < 2) {
      lastLineNumberLabelLength = 2;
    }
  }

  const linesWithLineNumbers = reduce(
    function (acc: any, lineSource: any, index: any) {
      const isLineWithError = index === lineWithErrorCurrentIndex;
      const prefix = isLineWithError ? '> ' : defaultLinePrefix;
      let lineNumberLabel;

      if (isBuffer(input)) {
        lineNumberLabel = leftPad(
          ((lineRange.from + index) * 8).toString(16),
          lastLineNumberLabelLength,
          '0'
        );
      } else {
        lineNumberLabel = leftPad(
          (lineRange.from + index + 1).toString(),
          lastLineNumberLabelLength,
          ' '
        );
      }

      return [].concat(
        acc,
        [prefix + lineNumberLabel + ' | ' + lineSource] as any,
        isLineWithError
          ? [
              defaultLinePrefix +
                repeat(' ', lastLineNumberLabelLength) +
                ' | ' +
                leftPad('', column, ' ') +
                repeat('^', verticalMarkerLength),
            ]
          : ([] as any)
      );
    },
    [],
    lines
  );

  return linesWithLineNumbers.join('\n');
}

export function formatError(input: string, error: any) {
  return [
    '\n',
    '-- PARSING FAILED ' + repeat('-', 50),
    '\n\n',
    formatGot(input, error),
    '\n\n',
    formatExpected(error.expected),
    '\n',
  ].join('');
}

function flags(re: RegExp) {
  if (re.flags !== undefined) {
    return re.flags;
  }
  // legacy browser support
  return [
    re.global ? 'g' : '',
    re.ignoreCase ? 'i' : '',
    re.multiline ? 'm' : '',
    re.unicode ? 'u' : '',
    re.sticky ? 'y' : '',
  ].join('');
}

function anchoredRegexp(re: RegExp) {
  return RegExp('^(?:' + re.source + ')', flags(re));
}

// -*- Combinators -*-

type UnParser<T> = T extends Parser<infer U> ? U : never;

/**
 * accepts a variable number of parsers that it expects to find in order, yielding an array of the results.
 */
export function seq<T>(p1: Parser<T>): Parser<[T]>;
export function seq<T, U>(p1: Parser<T>, p2: Parser<U>): Parser<[T, U]>;
export function seq<T, U, V>(
  p1: Parser<T>,
  p2: Parser<U>,
  p3: Parser<V>
): Parser<[T, U, V]>;
export function seq<T, U, V, W>(
  p1: Parser<T>,
  p2: Parser<U>,
  p3: Parser<V>,
  p4: Parser<W>
): Parser<[T, U, V, W]>;
export function seq<T, U, V, W, X>(
  p1: Parser<T>,
  p2: Parser<U>,
  p3: Parser<V>,
  p4: Parser<W>,
  p5: Parser<X>
): Parser<[T, U, V, W, X]>;
export function seq<T, U, V, W, X, Y>(
  p1: Parser<T>,
  p2: Parser<U>,
  p3: Parser<V>,
  p4: Parser<W>,
  p5: Parser<X>,
  p6: Parser<Y>
): Parser<[T, U, V, W, X, Y]>;
export function seq<T, U, V, W, X, Y, Z>(
  p1: Parser<T>,
  p2: Parser<U>,
  p3: Parser<V>,
  p4: Parser<W>,
  p5: Parser<X>,
  p6: Parser<Y>,
  p7: Parser<Z>
): Parser<[T, U, V, W, X, Y, Z]>;
export function seq<T>(...parsers: Array<Parser<T>>): Parser<T[]>;
export function seq<T extends any[]>(...parsers: T): Parser<UnParser<T>>;
export function seq(...args: any[]) {
  const parsers: any = [].slice.call(arguments);
  const numParsers = parsers.length;
  for (let j = 0; j < numParsers; j += 1) {
    assertParser(parsers[j]);
  }
  return new Parser(function (input, i) {
    let result;
    const accum = new Array(numParsers);
    for (let j = 0; j < numParsers; j += 1) {
      result = mergeReplies(parsers[j]._(input, i), result);
      if (!result.status) {
        return result;
      }
      accum[j] = result.value;
      i = result.index;
    }
    return mergeReplies(makeSuccess(i, accum), result);
  });
}

export function seqObj() {
  const seenKeys: any = {};
  let totalKeys = 0;
  const parsers = toArray(arguments);
  const numParsers = parsers.length;
  for (let j = 0; j < numParsers; j += 1) {
    const p = parsers[j];
    if (isParser(p)) {
      continue;
    }
    if (isArray(p)) {
      const isWellFormed =
        p.length === 2 && typeof p[0] === 'string' && isParser(p[1]);
      if (isWellFormed) {
        const key = p[0];
        if (Object.prototype.hasOwnProperty.call(seenKeys, key)) {
          throw new Error('seqObj: duplicate key ' + key);
        }
        seenKeys[key] = true;
        totalKeys++;
        continue;
      }
    }
    throw new Error(
      'seqObj arguments must be parsers or [string, parser] array pairs.'
    );
  }
  if (totalKeys === 0) {
    throw new Error('seqObj expects at least one named parser, found zero');
  }
  return new Parser(function (input: any, i: any) {
    let result;
    const accum: any = {};
    for (let j = 0; j < numParsers; j += 1) {
      let name: string | null;
      var parser;
      if (isArray(parsers[j])) {
        name = parsers[j][0];
        parser = parsers[j][1];
      } else {
        name = null;
        parser = parsers[j];
      }
      result = mergeReplies(parser._(input, i), result);
      if (!result.status) {
        return result;
      }
      if (name) {
        accum[name] = result.value;
      }
      i = result.index;
    }
    return mergeReplies(makeSuccess(i, accum), result);
  });
}

/**
 * Matches all parsers sequentially, and passes their results as the arguments to a function.
 * Similar to calling Parsimmon.seq and then .map, but the values are not put in an array.
 */
export function seqMap<T, U>(p1: Parser<T>, cb: (a1: T) => U): Parser<U>;
export function seqMap<T, U, V>(
  p1: Parser<T>,
  p2: Parser<U>,
  cb: (a1: T, a2: U) => V
): Parser<V>;
export function seqMap<T, U, V, W>(
  p1: Parser<T>,
  p2: Parser<U>,
  p3: Parser<V>,
  cb: (a1: T, a2: U, a3: V) => W
): Parser<W>;
export function seqMap<T, U, V, W, X>(
  p1: Parser<T>,
  p2: Parser<U>,
  p3: Parser<V>,
  p4: Parser<W>,
  cb: (a1: T, a2: U, a3: V, a4: W) => X
): Parser<X>;
export function seqMap<T, U, V, W, X, Y>(
  p1: Parser<T>,
  p2: Parser<U>,
  p3: Parser<V>,
  p4: Parser<W>,
  p5: Parser<X>,
  cb: (a1: T, a2: U, a3: V, a4: W, a5: X) => Y
): Parser<Y>;
export function seqMap<T, U, V, W, X, Y, Z>(
  p1: Parser<T>,
  p2: Parser<U>,
  p3: Parser<V>,
  p4: Parser<W>,
  p5: Parser<X>,
  p6: Parser<Y>,
  cb: (a1: T, a2: U, a3: V, a4: W, a5: X, a6: Y) => Z
): Parser<Z>;
export function seqMap<T, U, V, W, X, Y, Z, A>(
  p1: Parser<T>,
  p2: Parser<U>,
  p3: Parser<V>,
  p4: Parser<W>,
  p5: Parser<X>,
  p6: Parser<Y>,
  p7: Parser<Z>,
  cb: (a1: T, a2: U, a3: V, a4: W, a5: X, a6: Y, a7: Z) => A
): Parser<A>;
export function seqMap<T, U, V, W, X, Y, Z, A, B>(
  p1: Parser<T>,
  p2: Parser<U>,
  p3: Parser<V>,
  p4: Parser<W>,
  p5: Parser<X>,
  p6: Parser<Y>,
  p7: Parser<Z>,
  p8: Parser<A>,
  cb: (a1: T, a2: U, a3: V, a4: W, a5: X, a6: Y, a7: Z, a8: A) => B
): Parser<B>;
export function seqMap<T, U, V, W, X, Y, Z, A, B, C>(
  p1: Parser<T>,
  p2: Parser<U>,
  p3: Parser<V>,
  p4: Parser<W>,
  p5: Parser<X>,
  p6: Parser<Y>,
  p7: Parser<Z>,
  p8: Parser<A>,
  p9: Parser<B>,
  cb: (a1: T, a2: U, a3: V, a4: W, a5: X, a6: Y, a7: Z, a8: A, a9: B) => C
): Parser<C>;
export function seqMap<T, U, V, W, X, Y, Z, A, B, C, D>(
  p1: Parser<T>,
  p2: Parser<U>,
  p3: Parser<V>,
  p4: Parser<W>,
  p5: Parser<X>,
  p6: Parser<Y>,
  p7: Parser<Z>,
  p8: Parser<A>,
  p9: Parser<B>,
  p10: Parser<C>,
  cb: (
    a1: T,
    a2: U,
    a3: V,
    a4: W,
    a5: X,
    a6: Y,
    a7: Z,
    a8: A,
    a9: B,
    a10: C
  ) => D
): Parser<D>;
export function seqMap(...args2: any[]) {
  const args = [].slice.call(arguments);
  if (args.length === 0) {
    throw new Error('seqMap needs at least one argument');
  }
  const mapper: any = args.pop()!;
  assertFunction(mapper);
  return seq.apply(null, args).map(function (results: any) {
    return mapper.apply(null, results);
  });
}

// TODO[ES5]: Revisit this with Object.keys and .bind.
export function createLanguage<TLanguageSpec>(
  rules: TypedRule<TLanguageSpec>
): TypedLanguage<TLanguageSpec> {
  const language: any = {};
  for (const key in rules) {
    if ({}.hasOwnProperty.call(rules, key)) {
      (function (key) {
        const func = function () {
          return rules[key](language);
        };
        language[key] = lazy(func);
      })(key);
    }
  }
  return language;
}

//     function alt<U>(...parsers: Array<Parser<U>>): Parser<U>;
export function alt<U>(...args: Array<Parser<U>>) {
  const parsers: any = [].slice.call(arguments);
  const numParsers = parsers.length;
  if (numParsers === 0) {
    return fail('zero alternates');
  }
  for (let j = 0; j < numParsers; j += 1) {
    assertParser(parsers[j]);
  }
  return new Parser<U>((input, i) => {
    let result;
    for (let j = 0; j < parsers.length; j += 1) {
      result = mergeReplies(parsers[j]._(input, i), result);
      if (result.status) {
        return result;
      }
    }
    return result;
  });
}

export function sepBy(parser: any, separator: any) {
  // Argument asserted by sepBy1
  return sepBy1(parser, separator).or(succeed([]));
}

export function sepBy1(parser: any, separator: any) {
  assertParser(parser);
  assertParser(separator);
  const pairs = separator.then(parser).many();
  return seqMap(parser, pairs, function (r: any, rs: any) {
    return [r].concat(rs);
  });
}

// -*- Constructors -*-

export function string(str: string) {
  assertString(str);
  const expected = "'" + str + "'";
  return new Parser(function (input: any, i: any) {
    const j = i + str.length;
    const head = input.slice(i, j);
    if (head === str) {
      return makeSuccess(j, head);
    } else {
      return makeFailure(i, expected);
    }
  });
}

function byte(b: any) {
  ensureBuffer();
  assertNumber(b);
  if (b > 0xff) {
    throw new Error(
      'Value specified to byte constructor (' +
        b +
        '=0x' +
        b.toString(16) +
        ') is larger in value than a single byte.'
    );
  }
  const expected = (b > 0xf ? '0x' : '0x0') + b.toString(16);
  return new Parser(function (input: any, i: any) {
    const head = get(input, i);
    if (head === b) {
      return makeSuccess(i + 1, head);
    } else {
      return makeFailure(i, expected);
    }
  });
}

export function regexp(re: RegExp, group = 0) {
  assertRegexp(re);
  if (arguments.length >= 2) {
    assertNumber(group);
  } else {
    //   group = 0;
  }
  const anchored = anchoredRegexp(re);
  const expected = '' + re;
  return new Parser(function (input: any, i: any) {
    const match = anchored.exec(input.slice(i));
    if (match) {
      if (0 <= group && group <= match.length) {
        const fullMatch = match[0];
        const groupMatch = match[group];
        return makeSuccess(i + fullMatch.length, groupMatch);
      }
      const message =
        'valid match group (0 to ' + match.length + ') in ' + expected;
      return makeFailure(i, message);
    }
    return makeFailure(i, expected);
  });
}

export function succeed(value: any) {
  return new Parser(function (input: any, i: any) {
    return makeSuccess(i, value);
  });
}

export function fail(expected: any) {
  return new Parser<never>(function (input: any, i: any) {
    return makeFailure(i, expected);
  });
}

export function lookahead(x: any): any {
  if (isParser(x)) {
    return new Parser(function (input: any, i: any) {
      const result = x._(input, i);
      result.index = i;
      result.value = '';
      return result;
    });
  } else if (typeof x === 'string') {
    return lookahead(string(x));
  } else if (x instanceof RegExp) {
    return lookahead(regexp(x));
  }
  throw new Error('not a string, regexp, or parser: ' + x);
}

export function notFollowedBy(parser: any) {
  assertParser(parser);
  return new Parser(function (input: any, i: any) {
    const result = parser._(input, i);
    const text = input.slice(i, result.index);
    return result.status
      ? makeFailure(i, 'not "' + text + '"')
      : makeSuccess(i, null);
  });
}

/**
 * Returns a parser that yield a single character if it passes the predicate
 */
export function test(predicate: (char: string) => boolean): Parser<string> {
  assertFunction(predicate);
  return new Parser((input, i) => {
    const char = get(input, i);
    if (i < input.length && predicate(char)) {
      return makeSuccess(i + 1, char);
    } else {
      return makeFailure(i, 'a character/byte matching ' + predicate);
    }
  });
}

/**
 * Returns a parser that looks for exactly one character from string, and yields that character.
 */
export function oneOf(str: string): Parser<string> {
  const expected = str.split('');
  for (let idx = 0; idx < expected.length; idx++) {
    expected[idx] = "'" + expected[idx] + "'";
  }
  return test((ch) => str.indexOf(ch) >= 0).desc(expected);
}

export function noneOf(str: any) {
  return test(function (ch: any) {
    return str.indexOf(ch) < 0;
  }).desc("none of '" + str + "'");
}

export function custom(parsingFunction: any) {
  return new Parser(parsingFunction(makeSuccess, makeFailure));
}

// TODO[ES5]: Improve error message using JSON.stringify eventually.
export function range(begin: any, end: any) {
  return test(function (ch: any) {
    return begin <= ch && ch <= end;
  }).desc(begin + '-' + end);
}

export function takeWhile(predicate: (char: string) => boolean) {
  assertFunction(predicate);

  return new Parser((input, i) => {
    let j = i;
    while (j < input.length && predicate(get(input, j))) {
      j++;
    }
    return makeSuccess(j, input.slice(i, j));
  });
}

/**
 * accepts a function that returns a parser, which is evaluated the first time the parser is used.
 * This is useful for referencing parsers that haven't yet been defined.
 */
export function lazy<U>(f: () => Parser<U>): Parser<U>;
export function lazy<U>(description: string, f: () => Parser<U>): Parser<U>;
export function lazy<U>(desc: any, f?: any): Parser<U> {
  if (arguments.length < 2) {
    f = desc;
    desc = undefined;
  }

  const parser: Parser<U> = new Parser(function (input, i) {
    parser._ = f()._;
    return parser._(input, i);
  });

  if (desc) {
    return parser.desc(desc);
  } else {
    return parser;
  }
}

// -*- Fantasy Land Extras -*-

export function empty() {
  return fail('fantasy-land/empty');
}

// -*- Base Parsers -*-

export const index = new Parser(function (input: any, i: any) {
  return makeSuccess(i, makeLineColumnIndex(input, i));
});

export const any = new Parser(function (input: any, i: any) {
  if (i >= input.length) {
    return makeFailure(i, 'any character/byte');
  }
  return makeSuccess(i + 1, get(input, i));
});

export const all = new Parser(function (input: any, i: any) {
  return makeSuccess(input.length, input.slice(i));
});

export const eof = new Parser(function (input: any, i: any) {
  if (i < input.length) {
    return makeFailure(i, 'EOF');
  }
  return makeSuccess(i, null);
});

export const digit = regexp(/[0-9]/).desc('a digit');
export const digits = regexp(/[0-9]*/).desc('optional digits');
export const letter = regexp(/[a-z]/i).desc('a letter');
export const letters = regexp(/[a-z]*/i).desc('optional letters');
export const optWhitespace = regexp(/\s*/).desc('optional whitespace');
export const whitespace = regexp(/\s+/).desc('whitespace');
export const cr = string('\r');
export const lf = string('\n');
export const crlf = string('\r\n');
export const newline = alt(crlf, lf, cr).desc('newline');
export const end = alt(newline, eof);

// Parsimmon.all = all;
// Parsimmon.alt = alt;
// Parsimmon.any = any;
// Parsimmon.cr = cr;
// Parsimmon.createLanguage = createLanguage;
// Parsimmon.crlf = crlf;
// Parsimmon.custom = custom;
// Parsimmon.digit = digit;
// Parsimmon.digits = digits;
// Parsimmon.empty = empty;
// Parsimmon.end = end;
// Parsimmon.eof = eof;
// Parsimmon.fail = fail;
// Parsimmon.formatError = formatError;
// Parsimmon.index = index;
// Parsimmon.isParser = isParser;
// Parsimmon.lazy = lazy;
// Parsimmon.letter = letter;
// Parsimmon.letters = letters;
// Parsimmon.lf = lf;
// Parsimmon.lookahead = lookahead;
// Parsimmon.makeFailure = makeFailure;
// Parsimmon.makeSuccess = makeSuccess;
// Parsimmon.newline = newline;
// Parsimmon.noneOf = noneOf;
// Parsimmon.notFollowedBy = notFollowedBy;
// Parsimmon.of = succeed;
export const of = succeed;
// Parsimmon.oneOf = oneOf;
// Parsimmon.optWhitespace = optWhitespace;
// Parsimmon.Parser = Parsimmon;
// Parsimmon.range = range;
export const regex = regexp;
// Parsimmon.regexp = regexp;
// Parsimmon.sepBy = sepBy;
// Parsimmon.sepBy1 = sepBy1;
// Parsimmon.seq = seq;
// Parsimmon.seqMap = seqMap;
// Parsimmon.seqObj = seqObj;
// Parsimmon.string = string;
// Parsimmon.succeed = succeed;
// Parsimmon.takeWhile = takeWhile;
// Parsimmon.test = test;
// Parsimmon.whitespace = whitespace;
// Parsimmon['fantasy-land/empty'] = empty;
// Parsimmon['fantasy-land/of'] = succeed;

export const Binary = {
  bitSeq,
  bitSeqObj,
  byte,
  buffer: parseBuffer,
  encodedString,
  uintBE,
  uint8BE: uintBE(1),
  uint16BE: uintBE(2),
  uint32BE: uintBE(4),
  uintLE: uintLE,
  uint8LE: uintLE(1),
  uint16LE: uintLE(2),
  uint32LE: uintLE(4),
  intBE: intBE,
  int8BE: intBE(1),
  int16BE: intBE(2),
  int32BE: intBE(4),
  intLE: intLE,
  int8LE: intLE(1),
  int16LE: intLE(2),
  int32LE: intLE(4),
  floatBE: floatBE(),
  floatLE: floatLE(),
  doubleBE: doubleBE(),
  doubleLE: doubleLE(),
};
