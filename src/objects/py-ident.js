const PyObject = require("./py-object")

module.exports = class PyIdent extends PyObject {
  constructor(identVal) {
    super()
    this.identVal = identVal
  }

  __add__() {}

  __sub__() {}

  __class__() {
    return "ident"
  }
}
