const { execNode } = require("./blocks")
const PyInt = require("../objects/py-int")
const PyFloat = require("../objects/py-float")
const PyIdent = require("../objects/py-ident")

function ident(node) {
  return new PyIdent(node.getFirstChild())
}

function int(node) {
  return new PyInt(node.getFirstChild())
}

function float(node) {
  return new PyFloat(node.getFirstChild())
}

function add(node) {
  const left = execNode(node.getFirstChild())
  const right = execNode(node.getSecondChild())

  return left.__add__(right)
}

function sub(node) {
  const left = execNode(node.getFirstChild())
  const right = execNode(node.getSecondChild())

  return left.__sub__(right)
}

function stmtList(node) {
  return node.getChilds().map((childNode) => execNode(childNode))
}

function fileInput(node) {
  return node.getChilds().map((childNode) => execNode(childNode))
}

module.exports = {
  ident,
  int,
  float,
  add,
  sub,
  stmtList,
  fileInput,
}
