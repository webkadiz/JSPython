const PyObject = require("./py-object")

module.exports = class PyInt extends PyObject {
  constructor(intVal) {
    super()
    this.intVal = Number(intVal)
  }

  __add__(argument) {
    if (argument.__class__() !== "int") {
      throw new Error("Not support + for: " + argument.intVal)
    }

    return new PyInt(this.intVal + argument.intVal)
  }

  __sub__(argument) {
    if (argument.__class__() !== "int") {
      throw new Error("Not support + for: " + argument.intVal)
    }

    return new PyInt(this.intVal - argument.intVal)
  }

  __class__() {
    return "int"
  }
}
