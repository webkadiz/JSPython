"use strict"

const astNodeTypes = require("../../ast/ast-node-types")
const tokenTypes = require("../../token-analyze/token-types")
const {
  astNode,
  nt,
  binExprGen,
  unaryExprGen,
  getTokenizerState,
  secureTokenizer,
} = require("../blocks")
const identifier = require("./identifier")

const literal = () => {
  let tmp

  return (
    ((tmp = nt(tokenTypes.INT)) && astNode(astNodeTypes.INT, tmp)) ||
    ((tmp = nt(tokenTypes.FLOAT)) && astNode(astNodeTypes.FLOAT, tmp))
  )
}

const atom = () => {
  let tmp

  return (
    identifier() ||
    literal() ||
    (nt(tokenTypes.OR_BRACKET) &&
      (tmp = orTest()) &&
      nt(tokenTypes.CR_BRACKET) &&
      tmp)
  )
}

const call = (atom) => {
  const argList = require("./arg-list")
  let tmp, args

  return (
    atom &&
    nt(tokenTypes.OR_BRACKET) &&
    ((args = argList()) || true) &&
    nt(tokenTypes.CR_BRACKET) &&
    (tmp = astNode(astNodeTypes.CALL, atom, args)) &&
    (call(tmp) || tmp)
  )
}

const primary = () => {
  const atom_ = atom()

  return call(atom_) || atom_
}

const power = () => {
  let tmp, tmp2

  return (
    (tmp = primary()) &&
    ((nt(tokenTypes.D_STAR) &&
      (tmp2 = uExpr()) &&
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

const condExpr = () => {
  let orTestVar, orTestIf, expr

  return (
    ((orTestVar = orTest()) &&
      nt(tokenTypes.IF) &&
      (orTestIf = orTest()) &&
      nt(tokenTypes.ELSE) &&
      (expr = condExpr()) &&
      astNode(astNodeTypes.COND_EXPR, orTestVar, orTestIf, expr)) ||
    orTestVar
  )
}

function expr() {
  return condExpr()
}

function exprStmt() {
  return expr()
}

function target() {
  return identifier()
}

function targetList(tlNode = astNode(astNodeTypes.TARGET_LIST)) {
  let target_

  return (
    (target_ = target()) &&
    tlNode.addChild(target_) &&
    ((nt(tokenTypes.COMMA) && targetList(tlNode)) || tlNode)
  )
}

function assignmentStmt(assignNode = astNode(astNodeTypes.ASSIGN_STMT)) {
  let tList, eStmt

  return secureTokenizer(
    getTokenizerState(),
    (tList = targetList()) &&
      nt(tokenTypes.EQUALS) &&
      assignNode.addChild(tList) &&
      (assignmentStmt(assignNode) ||
        ((eStmt = exprStmt()) && assignNode.addChild(eStmt)))
  )
}

function simpleExpr() {
  return assignmentStmt() || exprStmt()
}

module.exports = simpleExpr
