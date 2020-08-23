"use strict"

const AstNodePrinter = require("./ast-node-printer")

module.exports = class AstNode {
  constructor(type, ...childs) {
    this.type = type
    this.parent = null
    this.childs = []

    for (const child of childs) {
      this.addChild(child)
    }
  }

  addChild(astNode) {
    if (astNode instanceof AstNode) {
      astNode.parent = this
    }
    
    this.childs.push(astNode)
    return this
  }

  getChild(idx) {
    return this.childs[idx]
  }

  getFirstChild() {
    return this.getChild(0)
  }

  getSecondChild() {
    return this.getChild(1)
  }

  getChilds() {
    return this.childs
  }

  countChild() {
    return this.childs.length
  }

  print() {
    new AstNodePrinter(this).print()
  }
}