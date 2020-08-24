const PyObject = require("./py-object")

module.exports = class PyFloat extends PyObject {
  constructor(floatVal) {
    super()
    this.floatVal = Number(floatVal)
  }

  __add__() {}

  __sub__() {}

  __class__() {
    return "float"
  }
}
