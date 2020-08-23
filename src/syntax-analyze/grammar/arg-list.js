"use strict"

const astNodeTypes = require("../../ast/ast-node-types")
const tokenTypes = require("../../token-analyze/token-types")
const { astNode, nt } = require("../blocks")

const dStarItem = (state) => {
  const orTest = require("./expr")
  let tmp

  return (
    nt(state, tokenTypes.D_STAR) &&
    (tmp = orTest(state)) &&
    astNode(astNodeTypes.D_STAR_ARG, tmp)
  )
}

const keyItem = (state, ident) => {
  const orTest = require("./expr")
  let tmp

  return (
    nt(state, tokenTypes.EQUALS) &&
    (tmp = orTest(state)) &&
    astNode(astNodeTypes.KEY_ARG, ident, tmp)
  )
}

const starItem = (state) => {
  const orTest = require("./expr")
  let tmp

  return (
    nt(state, tokenTypes.STAR) &&
    (tmp = orTest(state)) &&
    astNode(astNodeTypes.STAR_ARG, tmp)
  )
}

const posItem = (state, ident) => {
  const orTest = require("./expr")
  let tmp

  return (
    (ident && astNode(astNodeTypes.POS_ARG, ident)) ||
    ((tmp = orTest(state)) && astNode(astNodeTypes.POS_ARG, tmp))
  )
}

const argItem = (state) => {
  const identifier = require("./identifier")
  const ident = identifier(state)

  return (
    (ident && (keyItem(state, ident) || posItem(state, ident))) ||
    posItem(state) ||
    starItem(state) ||
    dStarItem(state)
  )
}

const argList = (state, argListParam) => {
  let tmp
  argListParam = argListParam || astNode(astNodeTypes.ARG_LIST)

  return (
    (tmp = argItem(state)) &&
    argListParam.addChild(tmp) &&
    ((nt(state, tokenTypes.COMMA) && argList(state, argListParam)) ||
      argListParam)
  )
}

module.exports = argList
