/*!
 * parse-function <https://github.com/tunnckoCore/parse-function>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://i.am.charlike.online)
 * Released under the MIT license.
 */

'use strict'

const babylon = require('babylon')
const define = require('define-property')

module.exports = function parseFunction (code, options) {
  let result = getDefaults(code)

  if (!result.valid) {
    return result
  }
  options = options && typeof options === 'object' ? options : {}
  options.parser = typeof options.parser === 'function'
    ? options.parser
    : babylon.parse

  const ast = options.parser(result.orig, options)(ast.program ? ast.program : ast).body.forEach((node) => {
    if (node.type !== 'ExpressionStatement' && node.type !== 'FunctionDeclaration') {
      return
    }

    node = update(node, result)
    node = visitArrows(node, result)
    node = visitFunctions(node, result)

    if (!node.body && !node.params) {
      return
    }

    result = visitParams(node, result)
    result = fixBody(node, result)
  })

  result = fixName(result)
  return result
}

function getDefaults (code) {
  const result = {
    name: 'anonymous',
    body: '',
    args: [],
    params: ''
  }

  code = typeof code === 'function' ? code.toString('utf8') : code
  code = typeof code === 'string'
    ? code.replace(/function *\(/, 'function ____foo$1o__i3n8v$al4i1d____(')
    : false

  return hiddens(result, code)
}

function hiddens (result, code) {
  define(result, 'defaults', {})
  define(result, 'orig', code || '')
  define(result, 'valid', code && code.length > 0)
  define(result, 'isArrow', false)
  define(result, 'isAsync', false)
  define(result, 'isNamed', false)
  define(result, 'isAnonymous', false)
  define(result, 'isGenerator', false)
  define(result, 'isExpression', false)

  return result
}

function update (node, result) {
  const asyncExpr = node.expression && node.expression.async
  const genExpr = node.expression && node.expression.generator

  define(result, 'isAsync', node.async || asyncExpr || false)
  define(result, 'isGenerator', node.generator || genExpr || false)
  define(result, 'isExpression', !node.expression || false)

  return node
}

function visitArrows (node, result) {
  const isArrow = node.expression.type === 'ArrowFunctionExpression'

  if (node.type === 'ExpressionStatement' && isArrow) {
    define(result, 'isArrow', true)
    node = node.expression
  }

  return node
}

function visitFunctions (node, result) {
  if (node.type === 'FunctionDeclaration') {
    result.name = node.id.start === node.id.end
      ? 'anonymous'
      : node.id.name
  }

  return node
}

function visitParams (node, result) {
  if (node.params.length) {
    node.params.forEach(function (param) {
      const defaultArgsName = param.type === 'AssignmentPattern' &&
        param.left &&
        param.left.name

      const restArgName = param.type === 'RestElement' &&
        param.argument &&
        param.argument.name

      const name = param.name || defaultArgsName || restArgName

      result.args.push(name)
      result.defaults[name] = param.right
        ? result.orig.slice(param.right.start, param.right.end)
        : undefined
    })
    result.params = result.args.join(', ')
  } else {
    result.params = ''
    result.args = []
  }

  return result
}

function fixBody (node, result) {
  result.body = result.orig.slice(node.body.start, node.body.end)

  const openCurly = result.body.charCodeAt(0) === 123
  const closeCurly = result.body.charCodeAt(result.body.length - 1) === 125

  if (openCurly && closeCurly) {
    result.body = result.body.slice(1, -1)
  }

  return result
}

function fixName (result) {
  // tweak throwing if anonymous function
  const isAnon = result.name === '____foo$1o__i3n8v$al4i1d____'
  result.name = isAnon ? 'anonymous' : result.name

  // more checking stuff
  define(result, 'isAnonymous', result.name === 'anonymous')
  define(result, 'isNamed', result.name !== 'anonymous')

  return result
}
