function execNode(node) {
  const execTable = require("./exec-table")

  return execTable[node.type](node)
}

module.exports = {
  execNode,
}
