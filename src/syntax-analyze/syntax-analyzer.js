"use strict"

const main = require("./blocks").main
const expr = require("./grammar/expr")

module.exports = class SyntaxAnalyzer {
  constructor(tokenizer) {
    this.tokenizer = tokenizer
  }

  parse() {
    global.state = {
      stack: [],
      error: null,
      cursorMax: -1,
      tokenizer: this.tokenizer,
    }

    const [programmNode, state] = main(expr, this.tokenizer)

    if (programmNode) return programmNode

    console.log(programmNode)
    throw state.error
  }
}
