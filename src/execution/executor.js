const { execNode } = require("./blocks")

module.exports = class Executor {
  constructor(rootProgramNode) {
    this.rootProgramNode = rootProgramNode
  }

  exec() {
    return execNode(this.rootProgramNode)
  }
}
