/*!
 * parse-function <https://github.com/tunnckoCore/parse-function>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://i.am.charlike.online)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

const test = require('mukla')
const forIn = require('for-in')
const parseFunction = require('./index')

const actuals = {
  regulars: [
    'function (a = {foo: "ba)r", baz: 123}, cb, ...restArgs) {return a * 3}',
    'function (b, callback, ...restArgs) {callback(null, b + 3)}',
    'function (c) {return c * 3}',
    'function (...restArgs) {return 321}',
    'function () {}'
  ],
  named: [
    'function namedFn (a = {foo: "ba)r", baz: 123}, cb, ...restArgs) {return a * 3}',
    'function namedFn (b, callback, ...restArgs) {callback(null, b + 3)}',
    'function namedFn (c) {return c * 3}',
    'function namedFn (...restArgs) {return 321}',
    'function namedFn () {}'
  ],
  arrows: [
    '(a = {foo: "ba)r", baz: 123}, cb, ...restArgs) => {return a * 3}',
    '(b, callback, ...restArgs) => {callback(null, b + 3)}',
    '(c) => {return c * 3}',
    '(...restArgs) => {return 321}',
    '() => {}'
    // '(a) => a * 3 * a',
    // 'd => d * 3 * d',
    // 'e => {return e * 3 * e}',
    // '(a, b) => a + 3 + b',
    // '(x, y, ...restArgs) => console.log({ value: x * y })'
  ]
  // asyncs: [
  //   'async function (a = {foo: "ba)r", baz: 123}, cb, ...restArgs) {return a * 3}',
  //   'async function (b, callback, ...restArgs) {callback(null, b + 3)}',
  //   'async function (c) {return c * 3}',
  //   'async function (...restArgs) {return 321}',
  //   'async function () {}',
  //   'async function namedFn (a = {foo: "ba)r", baz: 123}, cb, ...restArgs) {return a * 3}',
  //   'async function namedFn (b, callback, ...restArgs) {callback(null, b + 3)}',
  //   'async function namedFn (c) {return c * 3}',
  //   'async function namedFn (...restArgs) {return 321}',
  //   'async function namedFn () {}',
  //   'async (a = {foo: "ba)r", baz: 123}, cb, ...restArgs) {return a * 3}',
  //   'async (b, callback, ...restArgs) {callback(null, b + 3)}',
  //   'async (c) {return c * 3}',
  //   'async (...restArgs) {return 321}',
  //   'async () {}',
  //   'async (a) => a * 3 * a',
  //   'async (a, b) => a + 3 + b',
  //   'async (x, y, ...restArgs) => console.log({ value: x * y })'
  // ]
}

const expected = {
  regulars: [{
    name: 'anonymous',
    params: 'a, cb, restArgs',
    args: ['a', 'cb', 'restArgs'],
    body: 'return a * 3',
    defaults: { a: '{foo: "ba)r", baz: 123}', cb: undefined, restArgs: undefined }
  }, {
    name: 'anonymous',
    params: 'b, callback, restArgs',
    args: ['b', 'callback', 'restArgs'],
    body: 'callback(null, b + 3)',
    defaults: { b: undefined, callback: undefined, restArgs: undefined }
  }, {
    name: 'anonymous',
    params: 'c',
    args: ['c'],
    body: 'return c * 3',
    defaults: { c: undefined }
  }, {
    name: 'anonymous',
    params: 'restArgs',
    args: ['restArgs'],
    body: 'return 321',
    defaults: { restArgs: undefined }
  }, {
    name: 'anonymous',
    params: '',
    args: [],
    body: '',
    defaults: {}
  }],
  named: [{
    name: 'namedFn',
    params: 'a, cb, restArgs',
    args: ['a', 'cb', 'restArgs'],
    body: 'return a * 3',
    defaults: { a: '{foo: "ba)r", baz: 123}', cb: undefined, restArgs: undefined }
  }, {
    name: 'namedFn',
    params: 'b, callback, restArgs',
    args: ['b', 'callback', 'restArgs'],
    body: 'callback(null, b + 3)',
    defaults: { b: undefined, callback: undefined, restArgs: undefined }
  }, {
    name: 'namedFn',
    params: 'c',
    args: ['c'],
    body: 'return c * 3',
    defaults: { c: undefined }
  }, {
    name: 'namedFn',
    params: 'restArgs',
    args: ['restArgs'],
    body: 'return 321',
    defaults: { restArgs: undefined }
  }, {
    name: 'namedFn',
    params: '',
    args: [],
    body: '',
    defaults: {}
  }],
  arrows: [{
    name: 'anonymous',
    params: 'a, cb, restArgs',
    args: ['a', 'cb', 'restArgs'],
    body: 'return a * 3',
    defaults: { a: '{foo: "ba)r", baz: 123}', cb: undefined, restArgs: undefined }
  }, {
    name: 'anonymous',
    params: 'b, callback, restArgs',
    args: ['b', 'callback', 'restArgs'],
    body: 'callback(null, b + 3)',
    defaults: { b: undefined, callback: undefined, restArgs: undefined }
  }, {
    name: 'anonymous',
    params: 'c',
    args: ['c'],
    body: 'return c * 3',
    defaults: { c: undefined }
  }, {
    name: 'anonymous',
    params: 'restArgs',
    args: ['restArgs'],
    body: 'return 321',
    defaults: { restArgs: undefined }
  }, {
    name: 'anonymous',
    params: '',
    args: [],
    body: '',
    defaults: {}
  }]
}

forIn(actuals, (values, key) => {
  values.forEach((val, i) => {
    const actual = parseFunction(val)
    const expect = expected[key === 'named' ? 'regulars' : key][i]

    if (key === 'named') {
      expect.name = 'namedFn'
    }

    const value = actual.orig.replace('____foo$1o__i3n8v$al4i1d____', '')

    test(value, (done) => {
      test.strictEqual(actual.valid, true)
      test.strictEqual(actual.name, expect.name)
      test.strictEqual(actual.body, expect.body)
      test.strictEqual(actual.params, expect.params)
      test.deepEqual(actual.args, expect.args)
      test.deepEqual(actual.defaults, expect.defaults)
      test.ok(actual.orig)
      done()
    })
  })
})
