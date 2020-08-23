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

  return [func(state), state]
}

function astNode(nodeType, ...childs) {
  const trueChilds = childs.filter(Boolean)
  return new AstNode(nodeType, ...trueChilds)
}

function nt(state, ...tokenTypes) {
  const token = state.tokenizer.matchNextToken(...tokenTypes)

  if (token instanceof Error) {
    if (state.tokenizer.cursorIndex > state.cursorMax) {
      state.cursorMax = state.tokenizer.cursorIndex
      state.error = token
    }
    return false
  } else return token
}

function binExprGen(funcName, subExpr, operators) {
  function binExpr(state, leftExpr) {
    let node, rightExpr
    leftExpr = leftExpr || subExpr(state)

    return (
      (leftExpr &&
        operators.reduce(
          (prev, [operType, nodeType]) =>
            prev ||
            (nt(state, operType) &&
              (rightExpr = subExpr(state)) &&
              (node = astNode(nodeType, leftExpr, rightExpr)) &&
              binExpr(state, node)),
          false
        )) ||
      leftExpr
    )
  }

  binExpr.funcName = funcName

  return binExpr
}

function unaryExprGen(funcName, subExpr, operators) {
  function unaryExpr(state) {
    let rightExpr

    return (
      operators.reduce((prev, [operType, nodeType]) => {
        return (
          prev ||
          (nt(state, operType) &&
            (rightExpr = unaryExpr(state)) &&
            astNode(nodeType, rightExpr))
        )
      }, false) || subExpr(state)
    )
  }

  unaryExpr.funcName = funcName

  return unaryExpr
}

module.exports = {
  main,
  state,
  astNode,
  nt,
  binExprGen,
  unaryExprGen,
}
