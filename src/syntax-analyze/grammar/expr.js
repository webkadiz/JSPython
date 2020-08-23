"use strict"

const astNodeTypes = require("../../ast/ast-node-types")
const tokenTypes = require("../../token-analyze/token-types")
const { astNode, nt, binExprGen, unaryExprGen } = require("../blocks")

const literal = (state) => {
  let tmp

  return (
    ((tmp = nt(state, tokenTypes.INT)) && astNode(astNodeTypes.INT, tmp)) ||
    ((tmp = nt(state, tokenTypes.FLOAT)) && astNode(astNodeTypes.FLOAT, tmp))
  )
}

const atom = (state) => {
  const identifier = require("./identifier")
  let tmp

  return (
    identifier(state) ||
    literal(state) ||
    (nt(state, tokenTypes.OR_BRACKET) &&
      (tmp = orTest(state)) &&
      nt(state, tokenTypes.CR_BRACKET) &&
      tmp)
  )
}

const call = (state, atom) => {
  const argList = require("./arg-list")
  let tmp, args

  return (
    atom &&
    nt(state, tokenTypes.OR_BRACKET) &&
    ((args = argList(state)) || true) &&
    nt(state, tokenTypes.CR_BRACKET) &&
    (tmp = astNode(astNodeTypes.CALL, atom, args)) &&
    (call(state, tmp) || tmp)
  )
}

const primary = (state) => {
  const atom_ = atom(state)

  return call(state, atom_) || atom_
}

const power = (state) => {
  let tmp, tmp2

  return (
    (tmp = primary(state)) &&
    ((nt(state, tokenTypes.D_STAR) &&
      (tmp2 = uExpr(state)) &&
      astNode(astNodeTypes.POWER, tmp, tmp2)) ||
      tmp)
  )
}

const uExpr = unaryExprGen("uExpr", power, [
  [tokenTypes.PLUS, astNodeTypes.U_ADD],
  [tokenTypes.MINUS, astNodeTypes.U_SUB],
])

const mExpr = binExprGen("mExpr", uExpr, [
  [tokenTypes.STAR, astNodeTypes.MUL],
  [tokenTypes.SLASH, astNodeTypes.DIV],
  [tokenTypes.D_SLASH, astNodeTypes.DIVINT],
  [tokenTypes.PERCENT, astNodeTypes.REMAINDER],
])

const aExpr = binExprGen("aExpr", mExpr, [
  [tokenTypes.PLUS, astNodeTypes.ADD],
  [tokenTypes.MINUS, astNodeTypes.SUB],
])

const shiftExpr = binExprGen("shiftExpr", aExpr, [
  [tokenTypes.D_LESS, astNodeTypes.SHL],
  [tokenTypes.D_MORE, astNodeTypes.SHR],
])

const andExpr = binExprGen("andExpr", shiftExpr, [
  [tokenTypes.AMPERSAND, astNodeTypes.BIN_AND],
])

const xorExpr = binExprGen("xorExpr", andExpr, [
  [tokenTypes.CARET, astNodeTypes.BIN_XOR],
])

const orExpr = binExprGen("orExpr", xorExpr, [
  [tokenTypes.PIPE, astNodeTypes.BIN_OR],
])

const comparison = binExprGen("comparison", orExpr, [
  [tokenTypes.LESS, astNodeTypes.COMP_LESS],
  [tokenTypes.MORE, astNodeTypes.COMP_MORE],
  [tokenTypes.D_LESS, astNodeTypes.COMP_LESS_EQUALS],
  [tokenTypes.D_MORE, astNodeTypes.COMP_MORE_EQUALS],
  [tokenTypes.D_EQUALS, astNodeTypes.COMP_EQUALS],
  [tokenTypes.NOT_EQUALS, astNodeTypes.COMP_NOT_EQUALS],
  [tokenTypes.IS_NOT, astNodeTypes.COMP_IS_NOT],
  [tokenTypes.NOT_IN, astNodeTypes.COMP_NOT_IN],
  [tokenTypes.IS, astNodeTypes.COMP_IS],
  [tokenTypes.IN, astNodeTypes.COMP_IN],
])

const notTest = unaryExprGen("notTest", comparison, [
  [tokenTypes.NOT, astNodeTypes.BOOL_NOT],
])

const andTest = binExprGen("andTest", notTest, [
  [tokenTypes.AND, astNodeTypes.BOOL_AND],
])

const orTest = binExprGen("orTest", andTest, [
  [tokenTypes.OR, astNodeTypes.BOOL_OR],
])

const condExpr = (state) => {
  let orTestVar, orTestIf, expr

  return (
    ((orTestVar = orTest(state)) &&
      nt(state, tokenTypes.IF) &&
      (orTestIf = orTest(state)) &&
      nt(state, tokenTypes.ELSE) &&
      (expr = condExpr(state)) && astNode(astNodeTypes.COND_EXPR, orTestVar, orTestIf, expr)) ||
    orTestVar
  )
}

module.exports = condExpr
