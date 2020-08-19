"use strict"

const astNodeTypes = require("../ast/ast-node-types")
const tokenTypes = require("../token-analyze/token-types")
const {
  db,
  push,
  pop,
  loop,
  alts,
  block,
  astNode,
  nt,
  debug,
} = require("./blocks")

function aExpr() {
  debugger
  return alts(
    block(
      push(mExpr()),
      loop(
        alts(
          aExprGen(tokenTypes.PLUS, astNodeTypes.ADD),
          aExprGen(tokenTypes.MINUS, astNodeTypes.SUB)
        )
      ),
      pop()
    ),
    mExpr()
  )
}

function aExprGen(tokenOperator, astNodeType) {
  return block(nt(tokenOperator), push(astNode(astNodeType, pop(), mExpr())))
}

function mExpr() {
  return alts(
    block(
      push(uExpr()),
      loop(
        alts(
          mExprGen(tokenTypes.STAR, astNodeTypes.MUL),
          mExprGen(tokenTypes.SLASH, astNodeTypes.DIV),
          mExprGen(tokenTypes.D_SLASH, astNodeTypes.DIVINT),
          mExprGen(tokenTypes.PERCENT, astNodeTypes.REMAINDER)
        )
      ),
      pop()
    ),
    uExpr()
  )
}

function mExprGen(tokenOperator, astNodeType) {
  return block(nt(tokenOperator), push(astNode(astNodeType, pop(), uExpr())))
}

function uExpr() {
  return alts(
    block(
      nt(tokenTypes.PLUS),
      push(db(uExpr)),
      astNode(astNodeTypes.U_ADD, pop())
    ),
    block(
      nt(tokenTypes.MINUS),
      push(db(uExpr)),
      astNode(astNodeTypes.U_SUB, pop())
    ),
    power()
  )
}

function power() {
  return alts(
    block(
      debug(push(primary())),
      nt(tokenTypes.D_STAR),
      push(db(uExpr)),
      astNode(astNodeTypes.POWER, pop(-1), pop())
    ),
    primary()
  )
}

function primary() {
  return alts(call(), atom())
}

function call() {
  return block(
    push(atom()),
    nt(tokenTypes.OR_BRACKET),
    nt(tokenTypes.CR_BRACKET),
    astNode(astNodeTypes.CALL, pop())
  )
}

function atom() {
  return alts(
    identifier(),
    block(
      nt(tokenTypes.OR_BRACKET),
      push(db(uExpr)),
      nt(tokenTypes.CR_BRACKET),
      pop()
    ),
    literal()
  )
}

function literal() {
  return alts(
    block(astNode(astNodeTypes.INT, nt(tokenTypes.INT))),
    block(astNode(astNodeTypes.FLOAT, nt(tokenTypes.FLOAT)))
  )
}

function identifier() {
  return block(astNode(astNodeTypes.IDENT, nt(tokenTypes.IDENT)))
}

module.exports = aExpr
