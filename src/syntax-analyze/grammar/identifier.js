"use strict"

const astNodeTypes = require("../../ast/ast-node-types")
const tokenTypes = require("../../token-analyze/token-types")
const { astNode, nt } = require("../blocks")

const identifier = () => {
  let tmp

  return (tmp = nt(tokenTypes.IDENT)) && astNode(astNodeTypes.IDENT, tmp)
}

module.exports = identifier