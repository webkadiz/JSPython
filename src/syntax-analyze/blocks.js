"use strict"

const AstNode = require("../ast/ast-node")

function main(mainFunc, tokenizer) {
  return state(mainFunc, tokenizer)
}

function state(func, tokenizer) {
  const state = {
    stack: [],
    error: null,
    cursorMax: -1,
    tokenizer: tokenizer,
  }

  nt.state = state
  getTokenizerState.state = state
  secureTokenizer.state = state

  return [func(state), state]
}

function astNode(nodeType, ...childs) {
  const trueChilds = childs.filter(Boolean)
  return new AstNode(nodeType, ...trueChilds)
}

function nt(tokenType) {
  const token = nt.state.tokenizer.matchNextToken(tokenType)

  if (token instanceof Error) {
    if (nt.state.tokenizer.cursorIndex > nt.state.cursorMax) {
      nt.state.cursorMax = nt.state.tokenizer.cursorIndex
      nt.state.error = token
    }
    return false
  } else return token
}

function binExprGen(funcName, subExpr, operators) {
  function binExpr(leftExpr) {
    let node, rightExpr
    leftExpr = leftExpr || subExpr()

    return (
      (leftExpr &&
        operators.reduce(
          (prev, [operType, nodeType]) =>
            prev ||
            (nt(operType) &&
              (rightExpr = subExpr()) &&
              (node = astNode(nodeType, leftExpr, rightExpr)) &&
              binExpr(node)),
          false
        )) ||
      leftExpr
    )
  }

  binExpr.funcName = funcName

  return binExpr
}

function unaryExprGen(funcName, subExpr, operators) {
  function unaryExpr() {
    let rightExpr

    return (
      operators.reduce((prev, [operType, nodeType]) => {
        return (
          prev ||
          (nt(operType) &&
            (rightExpr = unaryExpr()) &&
            astNode(nodeType, rightExpr))
        )
      }, false) || subExpr()
    )
  }

  unaryExpr.funcName = funcName

  return unaryExpr
}

function getTokenizerState() {
  return getTokenizerState.state.tokenizer.getState()
}

function secureTokenizer(tokenizerState, grammar) {
  if (grammar === false) secureTokenizer.state.tokenizer.setState(tokenizerState)
  return grammar
}

module.exports = {
  main,
  state,
  astNode,
  nt,
  binExprGen,
  unaryExprGen,
  getTokenizerState,
  secureTokenizer
}
