"use strict"

const main = require("./blocks").main
const expr = require("./expr")

module.exports = class SyntaxAnalyzer {
  constructor(tokenizer) {
    this.tokenizer = tokenizer
  }

  parse() {
    global.state  = {
      stack: [],
      error: null,
      cursorMax: -1,
      tokenizer: this.tokenizer,
    }

    const [programmNode, state] = main(expr, this.tokenizer)

    if (programmNode) return programmNode

    console.log(programmNode)
    throw state.error
  }
}

// module.exports = class SyntaxAnalyzer {
//   constructor(tokenizer) {
//     this.tokenizer = tokenizer
//     this.maxLenCursor = -1
//     this.realError = null
//   }

//   parse() {
//     let programmNode

//     try {
//       programmNode = this.matchNextGrammar(this.programm)
//     } catch (e) {
//       debugger
//       throw e
//     }

//     return programmNode
//   }

//   alternatives(...alts) {
//     for (const alt of alts) {
//       try {
//         return alt.bind(this)()
//       } catch (e) {}
//     }
//   }

//   loop() {}

//   isMatchNextGrammar(grammarFunc) {
//     const savedCursor = this.tokenizer.getCursor()
//     let isMatch = false

//     try {
//       grammarFunc.bind(this)()
//       isMatch = true
//     } catch (e) {
//       if (savedCursor > this.maxLenCursor) {
//         this.maxLenCursor = savedCursor
//         this.realError = e
//       }
//       isMatch = false
//     }

//     this.tokenizer.setCursor(savedCursor)
//     return isMatch
//   }

//   matchNextGrammar(grammarFunc) {
//     const savedCursor = this.tokenizer.getCursor()
//     let match

//     try {
//       match = grammarFunc.bind(this)()
//     } catch (e) {
//       if (savedCursor > this.maxLenCursor) {
//         this.maxLenCursor = savedCursor
//         this.realError = e
//       }
//       this.tokenizer.setCursor(savedCursor)
//       throw e
//     }

//     return match
//   }

//   programm() {
//     const programmNode = new AstNode(astNodeTypes.PROGRAMM)

//     while (!this.tokenizer.isMatchNextToken(tokenTypes.END)) {
//       programmNode.addChild(this.matchNextGrammar(this.simpleStmt))
//       if (!this.tokenizer.isMatchNextToken(tokenTypes.END))
//         this.tokenizer.matchNextToken(tokenTypes.NEWLINE, tokenTypes.SEMICOLON)
//     }

//     return programmNode
//   }

//   simpleStmt() {
//     return this.alternatives(this.assignmentStmt, this.exprStmt)
//   }

//   assignmentStmt() {
//     let assignmentStmt = new AstNode(astNodeTypes.ASSIGN_STMT)
//     let targetList
//     let expr

//     while (true) {
//       const cursor = this.tokenizer.getCursor()

//       try {
//         targetList = this.targetList()
//         this.tokenizer.matchNextToken(tokenTypes.EQUALS)
//         assignmentStmt.addChild(targetList)
//       } catch (e) {
//         this.tokenizer.setCursor(cursor)
//         break
//       }
//     }

//     if (assignmentStmt.countChild() > 0) {
//       expr = this.expr()
//       assignmentStmt.addChild(expr)

//       return assignmentStmt
//     }

//     throw new Error("assignmentStmt")
//   }

//   targetList() {
//     const targetList = new AstNode(astNodeTypes.TARGET_LIST)

//     while (true) {
//       try {
//         const target = this.target()
//         targetList.addChild(target)
//         this.tokenizer.matchNextToken(tokenTypes.COMMA)
//       } catch (e) {
//         break
//       }
//     }

//     if (targetList.countChild() === 0) throw new Error("targetList: childs = 0")

//     return targetList
//   }

//   target() {
//     const target = this.identifier()

//     return target
//   }

//   exprStmt() {
//     return this.expr()
//   }

//   expr() {
//     return this.cond_expr()
//   }

//   cond_expr() {
//     let cond_expr = this.matchNextGrammar(this.or_test)

//     if (this.tokenizer.isMatchNextToken(tokenTypes.IF)) {
//       this.tokenizer.matchNextToken(tokenTypes.IF)
//       const or_test = this.matchNextGrammar(this.or_test)
//       this.tokenizer.matchNextToken(tokenTypes.ELSE)
//       const expr = this.matchNextGrammar(this.expr)

//       cond_expr = new AstNode(astNodeTypes.COND_EXPR, cond_expr, or_test, expr)
//     }

//     return cond_expr
//   }

//   or_test() {
//     let or_test = this.matchNextGrammar(this.and_test)

//     debugger
//     while (this.tokenizer.matchNextToken(tokenTypes.OR)) {
//       const and_test = this.matchNextGrammar(this.and_test)

//       or_test = new AstNode(astNodeTypes.BOOL_OR, or_test, and_test)
//     }

//     return or_test
//   }

//   and_test() {
//     let and_test = this.matchNextGrammar(this.not_test)

//     while (this.tokenizer.isMatchNextToken(tokenTypes.AND)) {
//       this.tokenizer.matchNextToken(tokenTypes.AND)
//       const not_test = this.matchNextGrammar(this.not_test)

//       and_test = new AstNode(astNodeTypes.BOOL_AND, and_test, not_test)
//     }

//     return and_test
//   }

//   not_test() {
//     let not_test

//     if (this.tokenizer.isMatchNextToken(tokenTypes.NOT)) {
//       this.tokenizer.matchNextToken(tokenTypes.NOT)
//       const not_test_nested = this.matchNextGrammar(this.not_test)

//       not_test = new AstNode(astNodeTypes.BOOL_NOT, not_test_nested)
//     } else {
//       not_test = this.matchNextGrammar(this.comparison)
//     }

//     return not_test
//   }

//   comparison() {
//     let comparison = this.matchNextGrammar(this.or_expr)

//     while (
//       this.tokenizer.isMatchNextToken(
//         tokenTypes.LESS,
//         tokenTypes.MORE,
//         tokenTypes.D_EQUALS,
//         tokenTypes.LESS_EQUALS,
//         tokenTypes.MORE_EQUALS,
//         tokenTypes.NOT_EQUALS,
//         tokenTypes.IS,
//         tokenTypes.NOT,
//         tokenTypes.IN
//       )
//     ) {
//       if (this.tokenizer.isMatchNextToken(tokenTypes.LESS)) {
//         this.tokenizer.matchNextToken(tokenTypes.LESS)
//         const or_expr = this.matchNextGrammar(this.or_expr)

//         comparison = new AstNode(astNodeTypes.COMP_LESS, comparison, or_expr)
//       } else if (this.tokenizer.isMatchNextToken(tokenTypes.MORE)) {
//         this.tokenizer.matchNextToken(tokenTypes.MORE)
//         const or_expr = this.matchNextGrammar(this.or_expr)

//         comparison = new AstNode(astNodeTypes.COMP_MORE, comparison, or_expr)
//       } else if (this.tokenizer.isMatchNextToken(tokenTypes.D_EQUALS)) {
//         this.tokenizer.matchNextToken(tokenTypes.D_EQUALS)
//         const or_expr = this.matchNextGrammar(this.or_expr)
//         comparison = new AstNode(astNodeTypes.COMP_EQUALS, comparison, or_expr)
//       } else if (this.tokenizer.isMatchNextToken(tokenTypes.LESS_EQUALS)) {
//         this.tokenizer.matchNextToken(tokenTypes.LESS_EQUALS)
//         const or_expr = this.matchNextGrammar(this.or_expr)
//         comparison = new AstNode(
//           astNodeTypes.COMP_LESS_EQUALS,
//           comparison,
//           or_expr
//         )
//       } else if (this.tokenizer.isMatchNextToken(tokenTypes.MORE_EQUALS)) {
//         this.tokenizer.matchNextToken(tokenTypes.MORE_EQUALS)
//         const or_expr = this.matchNextGrammar(this.or_expr)
//         comparison = new AstNode(
//           astNodeTypes.COMP_MORE_EQUALS,
//           comparison,
//           or_expr
//         )
//       } else if (this.tokenizer.isMatchNextToken(tokenTypes.NOT_EQUALS)) {
//         this.tokenizer.matchNextToken(tokenTypes.NOT_EQUALS)
//         const or_expr = this.matchNextGrammar(this.or_expr)
//         comparison = new AstNode(
//           astNodeTypes.COMP_NOT_EQUALS,
//           comparison,
//           or_expr
//         )
//       } else if (this.tokenizer.isMatchNextToken(tokenTypes.IS)) {
//         this.tokenizer.matchNextToken(tokenTypes.IS)

//         if (this.tokenizer.isMatchNextToken(tokenTypes.NOT)) {
//           this.tokenizer.matchNextToken(tokenTypes.NOT)
//           const or_expr = this.matchNextGrammar(this.or_expr)
//           comparison = new AstNode(
//             astNodeTypes.COMP_IS_NOT,
//             comparison,
//             or_expr
//           )
//         } else {
//           const or_expr = this.matchNextGrammar(this.or_expr)
//           comparison = new AstNode(astNodeTypes.COMP_IS, comparison, or_expr)
//         }
//       } else if (this.tokenizer.isMatchNextToken(tokenTypes.NOT)) {
//         this.tokenizer.matchNextToken(tokenTypes.NOT)
//         this.tokenizer.matchNextToken(tokenTypes.IN)
//         const or_expr = this.matchNextGrammar(this.or_expr)
//         comparison = new AstNode(astNodeTypes.COMP_NOT_IN, comparison, or_expr)
//       } else if (this.tokenizer.isMatchNextToken(tokenTypes.IN)) {
//         this.tokenizer.matchNextToken(tokenTypes.IN)
//         const or_expr = this.matchNextGrammar(this.or_expr)
//         comparison = new AstNode(astNodeTypes.COMP_IN, comparison, or_expr)
//       }
//     }

//     return comparison
//   }

//   or_expr() {
//     let or_expr = this.matchNextGrammar(this.xor_expr)

//     while (this.tokenizer.isMatchNextToken(tokenTypes.PIPE)) {
//       this.tokenizer.matchNextToken(tokenTypes.PIPE)
//       const xor_expr = this.matchNextGrammar(this.xor_expr)

//       or_expr = new AstNode(astNodeTypes.BIN_OR, or_expr, xor_expr)
//     }

//     return or_expr
//   }

//   xor_expr() {
//     let xor_expr = this.matchNextGrammar(this.and_expr)

//     while (this.tokenizer.isMatchNextToken(tokenTypes.CARET)) {
//       this.tokenizer.matchNextToken(tokenTypes.CARET)
//       const and_expr = this.matchNextGrammar(this.and_expr)

//       xor_expr = new AstNode(astNodeTypes.BIN_XOR, xor_expr, and_expr)
//     }

//     return xor_expr
//   }

//   and_expr() {
//     let and_expr = this.matchNextGrammar(this.shift_expr)

//     while (this.tokenizer.isMatchNextToken(tokenTypes.AMPERSAND)) {
//       this.tokenizer.matchNextToken(tokenTypes.AMPERSAND)
//       const shift_expr = this.matchNextGrammar(this.shift_expr)

//       and_expr = new AstNode(astNodeTypes.BIN_AND, and_expr, shift_expr)
//     }

//     return and_expr
//   }

//   shift_expr() {
//     let shift_expr = this.matchNextGrammar(this.a_expr)

//     while (
//       this.tokenizer.isMatchNextToken(tokenTypes.D_LESS, tokenTypes.D_MORE)
//     ) {
//       if (this.tokenizer.isMatchNextToken(tokenTypes.D_LESS)) {
//         this.tokenizer.matchNextToken(tokenTypes.D_LESS)
//         const a_expr = this.matchNextGrammar(this.a_expr)

//         shift_expr = new AstNode(astNodeTypes.SHL, shift_expr, a_expr)
//       } else if (this.tokenizer.isMatchNextToken(tokenTypes.D_MORE)) {
//         this.tokenizer.matchNextToken(tokenTypes.D_MORE)
//         const a_expr = this.matchNextGrammar(this.a_expr)

//         shift_expr = new AstNode(astNodeTypes.SHR, shift_expr, a_expr)
//       }
//     }

//     return shift_expr
//   }

//   a_expr() {
//     let a_expr = this.matchNextGrammar(this.m_expr)

//     while (this.tokenizer.isMatchNextToken(tokenTypes.PLUS, tokenTypes.MINUS)) {
//       if (this.tokenizer.isMatchNextToken(tokenTypes.PLUS)) {
//         this.tokenizer.matchNextToken(tokenTypes.PLUS)
//         const m_expr = this.matchNextGrammar(this.m_expr)

//         a_expr = new AstNode(astNodeTypes.ADD, a_expr, m_expr)
//       } else if (this.tokenizer.isMatchNextToken(tokenTypes.MINUS)) {
//         this.tokenizer.matchNextToken(tokenTypes.MINUS)
//         const m_expr = this.matchNextGrammar(this.m_expr)

//         a_expr = new AstNode(astNodeTypes.SUB, a_expr, m_expr)
//       }
//     }

//     return a_expr
//   }

//   m_expr() {
//     let m_expr = this.matchNextGrammar(this.u_expr)

//     while (
//       this.tokenizer.isMatchNextToken(
//         tokenTypes.STAR,
//         tokenTypes.SLASH,
//         tokenTypes.D_SLASH,
//         tokenTypes.PERCENT
//       )
//     ) {
//       if (this.tokenizer.isMatchNextToken(tokenTypes.STAR)) {
//         this.tokenizer.matchNextToken(tokenTypes.STAR)
//         const u_expr = this.matchNextGrammar(this.u_expr)

//         m_expr = new AstNode(astNodeTypes.MUL, m_expr, u_expr)
//       } else if (this.tokenizer.isMatchNextToken(tokenTypes.SLASH)) {
//         this.tokenizer.matchNextToken(tokenTypes.SLASH)
//         const u_expr = this.matchNextGrammar(this.u_expr)

//         m_expr = new AstNode(astNodeTypes.DIV, m_expr, u_expr)
//       } else if (this.tokenizer.isMatchNextToken(tokenTypes.D_SLASH)) {
//         this.tokenizer.matchNextToken(tokenTypes.D_SLASH)
//         const u_expr = this.matchNextGrammar(this.u_expr)

//         m_expr = new AstNode(astNodeTypes.DIVINT, m_expr, u_expr)
//       } else if (this.tokenizer.isMatchNextToken(tokenTypes.PERCENT)) {
//         this.tokenizer.matchNextToken(tokenTypes.PERCENT)
//         const u_expr = this.matchNextGrammar(this.u_expr)

//         m_expr = new AstNode(astNodeTypes.REMAINDER, m_expr, u_expr)
//       }
//     }

//     return m_expr
//   }

//   u_expr() {
//     let u_expr

//     if (this.tokenizer.isMatchNextToken(tokenTypes.PLUS)) {
//       this.tokenizer.matchNextToken(tokenTypes.PLUS)
//       const u_expr_nested = this.matchNextGrammar(this.u_expr)

//       u_expr = new AstNode(astNodeTypes.U_ADD, u_expr_nested)
//     } else if (this.tokenizer.isMatchNextToken(tokenTypes.MINUS)) {
//       this.tokenizer.matchNextToken(tokenTypes.MINUS)
//       const u_expr_nested = this.matchNextGrammar(this.u_expr)

//       u_expr = new AstNode(astNodeTypes.U_SUB, u_expr_nested)
//     } else {
//       u_expr = this.matchNextGrammar(this.power)
//     }

//     return u_expr
//   }

//   power() {
//     let power = this.matchNextGrammar(this.primary)

//     if (this.tokenizer.isMatchNextToken(tokenTypes.D_STAR)) {
//       this.tokenizer.matchNextToken(tokenTypes.D_STAR)
//       const u_expr = this.matchNextGrammar(this.u_expr)

//       power = new AstNode(astNodeTypes.POWER, power, u_expr)
//     }

//     return power
//   }

//   primary() {
//     let primary

//     if (this.isMatchNextGrammar(this.call)) {
//       primary = this.matchNextGrammar(this.call)
//     } else if (this.isMatchNextGrammar(this.atom)) {
//       primary = this.matchNextGrammar(this.atom)
//     } else {
//       throw new Error("primary error")
//     }

//     return primary
//   }

//   call() {
//     let atom = this.start().block(this.atom, tokenTypes.OR_BRACKET)
//     this.cond(this.argList)
//     let call = this.matchNextGrammar(this.atom)

//     this.tokenizer.matchNextToken(tokenTypes.OR_BRACKET)

//     if (this.isMatchNextGrammar(this.argList)) {
//       const argList = this.matchNextGrammar(this.argList)
//       call = new AstNode(astNodeTypes.CALL, call, argList)
//     } else {
//       call = new AstNode(astNodeTypes.CALL, call)
//     }

//     this.tokenizer.matchNextToken(tokenTypes.CR_BRACKET)

//     return call
//   }

//   atom() {
//     let atom

//     if (this.isMatchNextGrammar(this.identifier)) {
//       atom = this.matchNextGrammar(this.identifier)
//     } else if (this.tokenizer.isMatchNextToken(tokenTypes.OR_BRACKET)) {
//       this.tokenizer.matchNextToken(tokenTypes.OR_BRACKET)

//       atom = this.matchNextGrammar(this.expr)

//       this.tokenizer.matchNextToken(tokenTypes.CR_BRACKET)
//     } else {
//       atom = this.matchNextGrammar(this.literal)
//     }

//     return atom
//   }

//   identifier() {
//     const ident = this.tokenizer.matchNextToken(tokenTypes.IDENT)

//     return new AstNode(astNodeTypes.IDENT, ident)
//   }

//   literal() {
//     let literal

//     if (this.tokenizer.isMatchNextToken(tokenTypes.INT)) {
//       const int = this.tokenizer.matchNextToken(tokenTypes.INT)

//       literal = new AstNode(astNodeTypes.INT, int)
//     } else if (this.tokenizer.isMatchNextToken(tokenTypes.FLOAT)) {
//       const float = this.tokenizer.matchNextToken(tokenTypes.FLOAT)

//       literal = new AstNode(astNodeTypes.FLOAT, float)
//     } else {
//       throw new Error(
//         "Expect literal: " +
//           this.tokenizer.code.slice(this.tokenizer.startIndex)
//       )
//     }

//     return literal
//   }

//   argList() {
//     let argList = new AstNode(astNodeTypes.ARG_LIST)

//     if (this.isMatchNextGrammar(this.positionalAndStarredArgs)) {
//       const positionalAndStarredArgs = this.matchNextGrammar(
//         this.positionalAndStarredArgs
//       )
//       argList.addChild(positionalAndStarredArgs)
//     }

//     if (this.isMatchNextGrammar(this.starredAndKeywordsArgs)) {
//       const starredAndKeywordsArgs = this.matchNextGrammar(
//         this.starredAndKeywordsArgs
//       )
//       argList.addChild(starredAndKeywordsArgs)
//     }

//     if (this.isMatchNextGrammar(this.keywordsAndDoubleStarredArgs)) {
//       const keywordsAndDoubleStarredArgs = this.matchNextGrammar(
//         this.keywordsAndDoubleStarredArgs
//       )
//       argList.addChild(keywordsAndDoubleStarredArgs)
//     }

//     if (argList.countChild() === 0) {
//       throw new Error("argList")
//     }

//     return argList
//   }

//   positionalAndStarredArgs() {
//     let positionalAndStarredArgs = new AstNode(astNodeTypes.POS_AND_STAR_ARGS)

//     while (this.isMatchNextGrammar(this.positionalAndStarredItem)) {
//       const positionalAndStarredItem = this.matchNextGrammar(
//         this.positionalAndStarredItem
//       )
//       positionalAndStarredArgs.addChild(positionalAndStarredItem)
//     }

//     if (positionalAndStarredArgs.countChild() === 0) throw new Error()
//     return positionalAndStarredArgs
//   }

//   positionalAndStarredItem() {
//     let positionalAndStarredItem

//     if (this.isMatchNextGrammar(this.positionalArg)) {
//       positionalAndStarredItem = this.matchNextGrammar(this.positionalArg)
//     } else {
//       positionalAndStarredItem = this.matchNextGrammar(this.starredArg)
//     }

//     return positionalAndStarredItem
//   }

//   starredAndKeywordsArgs() {
//     let starredAndKeywordsArgs = new AstNode(astNodeTypes.STAR_AND_KEY_ARGS)

//     while (this.isMatchNextGrammar(this.starredAndKeywordsItem)) {
//       const starredAndKeywordsItem = this.matchNextGrammar(
//         this.starredAndKeywordsItem
//       )
//       starredAndKeywordsArgs.addChild(starredAndKeywordsItem)
//     }

//     if (starredAndKeywordsArgs.countChild() === 0) throw new Error()
//     return starredAndKeywordsArgs
//   }

//   starredAndKeywordsItem() {
//     let starredAndKeywordsItem

//     if (this.isMatchNextGrammar(this.starredArg)) {
//       starredAndKeywordsItem = this.matchNextGrammar(this.starredArg)
//     } else {
//       starredAndKeywordsItem = this.matchNextGrammar(this.keywordArg)
//     }

//     return starredAndKeywordsItem
//   }

//   keywordsAndDoubleStarredArgs() {
//     let keywordsAndDoubleStarredArgs = new AstNode(
//       astNodeTypes.KEY_AND_D_STAR_ARGS
//     )

//     while (this.isMatchNextGrammar(this.keywordsAndDoubleStarredItem)) {
//       const keywordsAndDoubleStarredItem = this.matchNextGrammar(
//         this.keywordsAndDoubleStarredItem
//       )
//       keywordsAndDoubleStarredArgs.addChild(keywordsAndDoubleStarredItem)
//     }

//     if (keywordsAndDoubleStarredArgs.countChild() === 0) throw new Error()
//     return keywordsAndDoubleStarredArgs
//   }

//   keywordsAndDoubleStarredItem() {
//     let keywordsAndDoubleStarredItem

//     if (this.isMatchNextGrammar(this.keywordArg)) {
//       keywordsAndDoubleStarredItem = this.matchNextGrammar(this.keywordArg)
//     } else {
//       keywordsAndDoubleStarredItem = this.matchNextGrammar(
//         this.doubleStarredArg
//       )
//     }

//     return keywordsAndDoubleStarredItem
//   }

//   positionalArg() {
//     const expr = this.matchNextGrammar(this.expr)
//     const positionalArg = new AstNode(astNodeTypes.POS_ARG, expr)
//     this.matchNextGrammar(this.argEnd)

//     return positionalArg
//   }

//   starredArg() {
//     this.tokenizer.matchNextToken(tokenTypes.STAR)
//     const expr = this.matchNextGrammar(this.expr)
//     const starredArg = new AstNode(astNodeTypes.STAR_ARG, expr)
//     this.matchNextGrammar(this.argEnd)

//     return starredArg
//   }

//   keywordArg() {
//     const ident = this.matchNextGrammar(this.identifier)

//     this.tokenizer.matchNextToken(tokenTypes.EQUALS)
//     const expr = this.matchNextGrammar(this.expr)
//     const keywordArg = new AstNode(astNodeTypes.KEY_ARG, ident, expr)
//     this.matchNextGrammar(this.argEnd)

//     return keywordArg
//   }

//   doubleStarredArg() {
//     this.tokenizer.matchNextToken(tokenTypes.D_STAR)
//     const expr = this.matchNextGrammar(this.expr)
//     const doubleStarredArg = new AstNode(astNodeTypes.D_STAR_ARG, expr)
//     this.matchNextGrammar(this.argEnd)

//     return doubleStarredArg
//   }

//   argEnd() {
//     if (this.tokenizer.isMatchNextToken(tokenTypes.CR_BRACKET)) return
//     this.tokenizer.matchNextToken(tokenTypes.COMMA)
//   }
// }
