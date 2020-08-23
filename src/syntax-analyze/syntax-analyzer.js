"use strict"

const { main } = require("./blocks")
const expr = require("./grammar/expr")

module.exports = class SyntaxAnalyzer {
  constructor(tokenizer) {
    this.tokenizer = tokenizer
  }

  parse() {
    const [programmNode, state] = main(expr, this.tokenizer)

    if (programmNode) return programmNode

    console.log(programmNode)
    throw state.error
  }
}
