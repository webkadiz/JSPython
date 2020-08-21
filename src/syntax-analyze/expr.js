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
  blockStateSave,
  astNode,
  nt,
} = require("./blocks")

global.call = call
global.power = power
global.primary = primary

function notTest() {
  debugger
  return alts(
    block(nt(tokenTypes.NOT), astNode(astNodeTypes.BOOL_NOT, db(notTest))),
    comparison()
  )
}

function comparison() {
  return alts(
    block(
      push(orExpr()),
      loop(
        alts(
          exprLoopTemplate(tokenTypes.LESS, astNodeTypes.COMP_LESS, orExpr()),
          exprLoopTemplate(tokenTypes.MORE, astNodeTypes.COMP_MORE, orExpr()),
          exprLoopTemplate(
            tokenTypes.D_EQUALS,
            astNodeTypes.COMP_EQUALS,
            orExpr()
          ),
          exprLoopTemplate(
            tokenTypes.LESS_EQUALS,
            astNodeTypes.COMP_LESS_EQUALS,
            orExpr()
          ),
          exprLoopTemplate(
            tokenTypes.MORE_EQUALS,
            astNodeTypes.COMP_MORE_EQUALS,
            orExpr()
          ),
          exprLoopTemplate(
            tokenTypes.NOT_EQUALS,
            astNodeTypes.COMP_NOT_EQUALS,
            orExpr()
          ),
          block(
            nt(tokenTypes.NOT),
            exprLoopTemplate(tokenTypes.IN, astNodeTypes.COMP_NOT_IN, orExpr())
          ),
          exprLoopTemplate(tokenTypes.IN, astNodeTypes.COMP_IN, orExpr()),
          block(
            nt(tokenTypes.IS),
            exprLoopTemplate(tokenTypes.NOT, astNodeTypes.COMP_IS_NOT, orExpr())
          ),
          exprLoopTemplate(tokenTypes.IS, astNodeTypes.COMP_IS, orExpr())
        )
      ),
      pop()
    ),
    pop()
  )
}

function orExpr() {
  return alts(
    block(
      push(xorExpr()),
      loop(
        alts(exprLoopTemplate(tokenTypes.PIPE, astNodeTypes.BIN_OR, xorExpr()))
      ),
      pop()
    ),
    pop()
  )
}

function xorExpr() {
  return alts(
    block(
      push(andExpr()),
      loop(
        alts(
          exprLoopTemplate(tokenTypes.CARET, astNodeTypes.BIN_XOR, andExpr())
        )
      ),
      pop()
    ),
    pop()
  )
}

function andExpr() {
  return alts(
    block(
      push(shiftExpr()),
      loop(
        alts(
          exprLoopTemplate(
            tokenTypes.AMPERSAND,
            astNodeTypes.BIN_AND,
            shiftExpr()
          )
        )
      ),
      pop()
    ),
    pop()
  )
}

function shiftExpr() {
  return alts(
    block(
      push(aExpr()),
      loop(
        alts(
          exprLoopTemplate(tokenTypes.D_LESS, astNodeTypes.SHL, aExpr()),
          exprLoopTemplate(tokenTypes.D_MORE, astNodeTypes.SHR, aExpr())
        )
      ),
      pop()
    ),
    pop()
  )
}

function aExpr() {
  return alts(
    block(
      push(mExpr()),
      loop(
        alts(
          exprLoopTemplate(tokenTypes.PLUS, astNodeTypes.ADD, mExpr()),
          exprLoopTemplate(tokenTypes.MINUS, astNodeTypes.SUB, mExpr())
        )
      ),
      pop()
    ),
    pop()
  )
}

function mExpr() {
  return alts(
    block(
      push(uExpr()),
      loop(
        alts(
          exprLoopTemplate(tokenTypes.STAR, astNodeTypes.MUL, uExpr()),
          exprLoopTemplate(tokenTypes.SLASH, astNodeTypes.DIV, uExpr()),
          exprLoopTemplate(tokenTypes.D_SLASH, astNodeTypes.DIVINT, uExpr()),
          exprLoopTemplate(tokenTypes.PERCENT, astNodeTypes.REMAINDER, uExpr())
        )
      ),
      pop()
    ),
    pop()
  )
}

function uExpr() {
  debugger
  return alts(
    block(nt(tokenTypes.PLUS), astNode(astNodeTypes.U_ADD, db(uExpr))),
    block(nt(tokenTypes.MINUS), astNode(astNodeTypes.U_SUB, db(uExpr))),
    power()
  )
}

function power() {
  debugger
  return alts(
    block(
      push(primary()),
      nt(tokenTypes.D_STAR),
      astNode(astNodeTypes.POWER, pop(), db(uExpr))
    ),
    pop()
  )
}

function primary() {
  debugger
  return alts(call(), atom())
}

function call() {
  debugger
  return blockStateSave(
    push(atom()),
    nt(tokenTypes.OR_BRACKET),
    nt(tokenTypes.CR_BRACKET),
    astNode(astNodeTypes.CALL, pop())
  )
}

function atom() {
  debugger
  return alts(
    identifier(),
    block(
      nt(tokenTypes.OR_BRACKET),
      push(db(notTest)),
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

function exprLoopTemplate(tokenOperator, astNodeType, subExpr) {
  return block(nt(tokenOperator), push(astNode(astNodeType, pop(), subExpr)))
}

module.exports = notTest
