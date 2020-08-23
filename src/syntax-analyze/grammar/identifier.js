"use strict"

const astNodeTypes = require("../../ast/ast-node-types")
const tokenTypes = require("../../token-analyze/token-types")
const { astNode, nt } = require("../blocks")

const identifier = (state) => {
  let tmp

  return (tmp = nt(state, tokenTypes.IDENT)) && astNode(astNodeTypes.IDENT, tmp)
}

module.exports = identifier