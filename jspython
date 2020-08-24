#!/usr/bin/env node
"use strict"

const fs = require("fs")
const SyntaxAnalyzer = require("./src/syntax-analyze/syntax-analyzer")
const Tokenizer = require("./src/token-analyze/tokenizer")
const Executor = require("./src/execution/executor")

let srcFilePath = process.argv[2]

if (srcFilePath === undefined) {
  // code from stdin

  srcFilePath = "<stdin>"
  const srcCode = fs.readFileSync(0, "utf-8")
  interpret(srcCode, srcFilePath)
} else {
  if (fs.existsSync(srcFilePath)) {
    const srcCode = fs.readFileSync(srcFilePath, "utf-8")
    interpret(srcCode, srcFilePath)
  } else {
    process.stdout.write("file not exists: " + srcFilePath + "\n")
  }
}

function interpret(code, fileName) {
  const syntaxAnalyzer = new SyntaxAnalyzer(
    new Tokenizer(code, fileName).prepare()
  )

  const programNode = syntaxAnalyzer.parse()

  programNode.print()

  console.log(new Executor(programNode).exec())
}
