"use strict"

module.exports = class AstNodePrinter {
  constructor(rootNode) {
    this.root = rootNode
    this.indent = 0
  }

  print() {
    this.printNode(this.root)
    process.stdout.write("\n")
  }

  printNode(node) {
    this.printIndent()
    process.stdout.write(node.type)

    for (const child of node.childs) {
      this.indent++

      if (child.constructor.name === "AstNode") this.printNode(child)
      else process.stdout.write("(" + child + ")")

      this.indent--
    }
  }

  printIndent() {
    if (this.indent > 0) process.stdout.write("\n")

    for (let i = 0; i < this.indent; i++) {
      process.stdout.write("|")
      if (i === this.indent - 1) process.stdout.write("--")
      else process.stdout.write("  ")
    }
  }
}
