/*!
 * parse-function <https://github.com/tunnckoCore/parse-function>
 *
 * Copyright (c) 2017 Charlike Mike Reagent <open.source.charlike@gmail.com> (https://i.am.charlike.online)
 * Released under the MIT license.
 */

/* eslint-disable jsdoc/require-param-description, jsdoc/check-param-names */

import { parseFnParams, toValues } from 'func-args'

/**
 * > Micro plugin to visit each of the params
 * in the given function and collect them into
 * an `result.args` array and `result.params` string.
 *
 * @param  {Object} node
 * @param  {Object} result
 * @return {Object} result
 * @private
 */
export default (app) => (node, result) => {
  if (!node.params.length) {
    return result
  }

  // @todo im not sure what style here need
  result.params = toValues(parseFnParams(node.params)).join(', ')

  return result
}
