"use strict"

const AstNode = require("../ast/ast-node")

function main(mainFunc, tokenizer) {
  return state(mainFunc, tokenizer)()
}

function state(func, tokenizer) {
  return () => {
    const state = {
      stack: [],
      error: null,
      cursorMax: -1,
      tokenizer: tokenizer,
    }

    debugger
    return [func(state), state]
  }
}

function db(func) {
  return (state) => {
    return func()(state)
  }
}

function debug(func) {
  return (state) => {
    debugger
    return func(state)
  }
}

function push(child) {
  return (state) => {
    const res = child(state)

    state.stack.push(res)
    return res
  }
}

function pop(offset = 0) {
  return (state) => {
    return state.stack.splice(offset - 1, 1).pop()
  }
}

function loop(func) {
  return (state) => {
    let res,
      savedRes = false

    while (true) {
      res = func(state)

      if (res) {
        savedRes = res
      } else {
        break
      }
    }

    return savedRes
  }
}

function alts(...alts) {
  return (state) => {
    let res

    for (const alt of alts) {
      res = alt(state)
      if (res) return res
    }

    return res
  }
}

function block(...elems) {
  return (state) => {
    const savedStack = state.stack.slice()
    const savedTokenizerState = state.tokenizer.getState()
    let res

    for (const el of elems) {
      res = el(state)
      if (res === false) {
        state.stack = savedStack
        state.tokenizer.setState(savedTokenizerState)
        return res
      }
    }

    return res
  }
}

function astNode(nodeType, ...childs) {
  return (state) => {
    const execChilds = childs.map((child) => child(state))
    const isEvery = execChilds.every(Boolean)

    if (isEvery) {
      const astNode = new AstNode(nodeType, ...execChilds)
      state.lastAstNode = astNode
      return astNode
    } else return false
  }
}

function nt(...tokenTypes) {
  return (state) => {
    const token = state.tokenizer.matchNextToken(...tokenTypes)

    if (token instanceof Error) {
      if (state.tokenizer.cursorIndex > state.cursorMax) {
        state.cursorMax = state.tokenizer.cursorIndex
        state.error = token
      }
      return false
    } else return token
  }
}

module.exports = {
  main,
  state,
  db,
  push,
  pop,
  loop,
  alts,
  block,
  astNode,
  nt,
  debug,
}
