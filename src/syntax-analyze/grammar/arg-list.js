"use strict"

const astNodeTypes = require("../../ast/ast-node-types")
const tokenTypes = require("../../token-analyze/token-types")
const { astNode, nt } = require("../blocks")

const dStarItem = () => {
  const orTest = require("./expr")
  let tmp

  return (
    nt(tokenTypes.D_STAR) &&
    (tmp = orTest()) &&
    astNode(astNodeTypes.D_STAR_ARG, tmp)
  )
}

const keyItem = (ident) => {
  const orTest = require("./expr")
  let tmp

  return (
    nt(tokenTypes.EQUALS) &&
    (tmp = orTest()) &&
    astNode(astNodeTypes.KEY_ARG, ident, tmp)
  )
}

const starItem = () => {
  const orTest = require("./expr")
  let tmp

  return (
    nt(tokenTypes.STAR) &&
    (tmp = orTest()) &&
    astNode(astNodeTypes.STAR_ARG, tmp)
  )
}

const posItem = (ident) => {
  const orTest = require("./expr")
  let tmp

  return (
    (ident && astNode(astNodeTypes.POS_ARG, ident)) ||
    ((tmp = orTest()) && astNode(astNodeTypes.POS_ARG, tmp))
  )
}

const argItem = () => {
  const identifier = require("./identifier")
  const ident = identifier()

  return (
    (ident && (keyItem(ident) || posItem(ident))) ||
    posItem() ||
    starItem() ||
    dStarItem()
  )
}

const argList = (argListParam) => {
  let tmp
  argListParam = argListParam || astNode(astNodeTypes.ARG_LIST)

  return (
    (tmp = argItem()) &&
    argListParam.addChild(tmp) &&
    ((nt(tokenTypes.COMMA) && argList(argListParam)) ||
      argListParam)
  )
}

module.exports = argList
