"use strict"

const tokenTypes = require("./token-types")

module.exports = class Tokenizer {
  constructor(code, fileName) {
    this.cursorIndex = 0
    this.cursorIndexEndPrevCodeLine = 0
    this.code = code
    this.fileName = fileName
    this.codeLines = null
    this.codeLine = null
    this.codeLineNumber = 1
  }

  prepare() {
    this.codeLines = this.code.split(/\n/)
    this.codeLine = this.getCodeLineByNumber(this.codeLineNumber)

    return this
  }

  matchNextToken(...tokenTypesParam) {
    let slicedCode, tokenType, token, cursor

    while (true) {
      cursor = this.getState()
      slicedCode = this.sliceCode(this.code, this.cursorIndex)
      ;[tokenType, token] = this.matchFirstToken(slicedCode)

      this.movePos(token)

      if (this.tokenIsNewline(tokenType)) this.nextCodeLine()
      if (this.tokenIsSpace(tokenType)) continue

      break
    }

    for (const tokenTypeParam of tokenTypesParam) {
      if (tokenTypeParam === tokenType) {
        token = token === "" ? "end" : token // end of file
        return token
      }
    }

    this.setState(cursor)
    const error = new Error(this.createErrorMessage(tokenTypesParam))
    error.cursorIndex = this.cursorIndex
    error.codeLine = this.codeLine
    return error
  }

  matchFirstToken(slicedCode) {
    const matchFuncNames = [
      "tokenIf",
      "tokenElse",
      "tokenOr",
      "tokenAnd",
      "tokenNotIn",
      "tokenIsNot",
      "tokenNot",
      "tokenIn",
      "tokenIs",
      "tokenIdent",
      "tokenFloat",
      "tokenInt",
      "tokenOpenRoundBracket",
      "tokenCloseRoundBracket",
      "tokenPlus",
      "tokenMinus",
      "tokenDoubleStar",
      "tokenDoubleSlash",
      "tokenStar",
      "tokenSlash",
      "tokenPercent",
      "tokenSpace",
      "tokenNewline",
      "tokenSemicolon",
      "tokenComma",
      "tokenDot",
      "tokenDoubleLess",
      "tokenDoubleMore",
      "tokenDoubleEquals",
      "tokenLessEquals",
      "tokenMoreEquals",
      "tokenNotEquals",
      "tokenEquals",
      "tokenLess",
      "tokenMore",
      "tokenPipe",
      "tokenCaret",
      "tokenAmpersand",
    ]

    for (const matchFuncName of matchFuncNames) {
      const [tokenType, tokenMatch] = this[matchFuncName](slicedCode)

      if (this.isMatch(tokenMatch)) {
        const token = tokenMatch[0]

        return [tokenType, token]
      }
    }

    throw new Error(JSON.stringify(slicedCode))
  }

  isMatch(match) {
    return match !== null && match.index === 0
  }

  sliceCode(code, start) {
    return code.slice(start)
  }

  getState() {
    return {
      cursorIndex: this.cursorIndex,
      lineNumber: this.codeLineNumber,
      prevCursor: this.cursorIndexEndPrevCodeLine,
    }
  }

  setState({ cursorIndex, lineNumber, prevCursor }) {
    this.cursorIndex = cursorIndex
    this.codeLineNumber = lineNumber
    this.cursorIndexEndPrevCodeLine = prevCursor
  }

  movePos(token) {
    this.cursorIndex += token.length
  }

  getNextCodeLineNumber() {
    return this.codeLineNumber + 1
  }

  getCodeLineByNumber(codeLineNumber) {
    return this.codeLines[codeLineNumber - 1]
  }

  nextCodeLine() {
    this.cursorIndexEndPrevCodeLine = this.cursorIndex
    this.codeLineNumber = this.getNextCodeLineNumber()
    this.codeLine = this.getCodeLineByNumber(this.codeLineNumber)
  }

  createErrorMessage(tokenTypesParam) {
    const locationStrIndent = " ".repeat(2)
    const codeLineStrIndent = " ".repeat(4)

    const lineNumberStr = `${locationStrIndent}File "${this.fileName}", line ${this.codeLineNumber}`
    const codeLineStr = `${codeLineStrIndent}${this.codeLine}`
    const cursorStr = `${codeLineStrIndent}${" ".repeat(
      this.cursorIndex - this.cursorIndexEndPrevCodeLine
    )}^`
    const tokenTypesStr = this.toStringTokenTypes(tokenTypesParam)
    const expectStr = `SyntaxError: Expected 1 from this characters: ${tokenTypesStr}`

    const errorMessageStr = [
      lineNumberStr,
      codeLineStr,
      cursorStr,
      expectStr,
    ].join("\n")

    return errorMessageStr
  }

  toStringTokenTypes(tokenTypes) {
    let tokenTypesStr = tokenTypes.reduce(
      (prev, cur) => prev + `"${cur}", `,
      ""
    )

    return tokenTypesStr.slice(0, tokenTypesStr.length - 2)
  }

  tokenIsSpace(tokenType) {
    return tokenType === tokenTypes.SPACE
  }

  tokenIsNewline(tokenType) {
    return tokenType === tokenTypes.NEWLINE
  }

  tokenKeyword(slicedCode) {
    return [
      tokenTypes.KEYWORD,
      slicedCode.match(
        new RegExp(
          "False|None|True|and|as|assert|async|await|break|class|" +
            "continue|def|del|elif|else|except|finally|for|from|global|" +
            "if|import|lambda|nonlocal|or|pass|raise|" +
            "return|try|while|with|yield"
        )
      ),
    ]
  }

  tokenIdent(slicedCode) {
    return [tokenTypes.IDENT, slicedCode.match(/[a-zA-Z_][a-zA-Z0-9_]*/)]
  }

  tokenFloat(slicedCode) {
    return [tokenTypes.FLOAT, slicedCode.match(/[0-9]+\.[0-9]+/)]
  }

  tokenInt(slicedCode) {
    return [tokenTypes.INT, slicedCode.match(/[0-9]+/)]
  }

  tokenOpenRoundBracket(slicedCode) {
    return [tokenTypes.OR_BRACKET, slicedCode.match(/[(]/)]
  }

  tokenCloseRoundBracket(slicedCode) {
    return [tokenTypes.CR_BRACKET, slicedCode.match(/[)]/)]
  }

  tokenPlus(slicedCode) {
    return [tokenTypes.PLUS, slicedCode.match(/[+]/)]
  }

  tokenMinus(slicedCode) {
    return [tokenTypes.MINUS, slicedCode.match(/[-]/)]
  }

  tokenDoubleStar(sliceCode) {
    return [tokenTypes.D_STAR, sliceCode.match(/[*][*]/)]
  }

  tokenStar(slicedCode) {
    return [tokenTypes.STAR, slicedCode.match(/[*]/)]
  }

  tokenSlash(slicedCode) {
    return [tokenTypes.SLASH, slicedCode.match(/[/]/)]
  }
  tokenDoubleSlash(slicedCode) {
    return [tokenTypes.D_SLASH, slicedCode.match(/[/][/]/)]
  }

  tokenSpace(sliceCode) {
    return [tokenTypes.SPACE, sliceCode.match(/[ \t]/)]
  }

  tokenNewline(slicedCode) {
    return [tokenTypes.NEWLINE, slicedCode.match(/[\n]|^$/)]
  }

  tokenSemicolon(slicedCode) {
    return [tokenTypes.SEMICOLON, slicedCode.match(/;/)]
  }

  tokenComma(slicedCode) {
    return [tokenTypes.COMMA, slicedCode.match(/,/)]
  }

  tokenDot(slicedCode) {
    return [tokenTypes.DOT, slicedCode.match(/\./)]
  }

  tokenEquals(slicedCode) {
    return [tokenTypes.EQUALS, slicedCode.match(/[=]/)]
  }

  tokenLess(slicedCode) {
    return [tokenTypes.LESS, slicedCode.match(/[<]/)]
  }

  tokenMore(slicedCode) {
    return [tokenTypes.MORE, slicedCode.match(/[>]/)]
  }

  tokenDoubleLess(slicedCode) {
    return [tokenTypes.D_LESS, slicedCode.match(/[<][<]/)]
  }

  tokenDoubleMore(slicedCode) {
    return [tokenTypes.D_MORE, slicedCode.match(/[>][>]/)]
  }

  tokenPipe(slicedCode) {
    return [tokenTypes.PIPE, slicedCode.match(/[|]/)]
  }

  tokenCaret(slicedCode) {
    return [tokenTypes.CARET, slicedCode.match(/\^/)]
  }

  tokenAmpersand(slicedCode) {
    return [tokenTypes.AMPERSAND, slicedCode.match(/[&]/)]
  }

  tokenLessEquals(slicedCode) {
    return [tokenTypes.LESS_EQUALS, slicedCode.match(/[<][=]/)]
  }

  tokenMoreEquals(slicedCode) {
    return [tokenTypes.MORE_EQUALS, slicedCode.match(/[>][=]/)]
  }

  tokenNotEquals(slicedCode) {
    return [tokenTypes.NOT_EQUALS, slicedCode.match(/[!][=]/)]
  }

  tokenNot(slicedCode) {
    return [tokenTypes.NOT, slicedCode.match(/\bnot\b/)]
  }

  tokenIs(slicedCode) {
    return [tokenTypes.IS, slicedCode.match(/\bis\b/)]
  }

  tokenIsNot(slicedCode) {
    return [tokenTypes.IS_NOT, slicedCode.match(/\bis\b[ \t]+\bnot\b/)]
  }

  tokenIn(slicedCode) {
    return [tokenTypes.IN, slicedCode.match(/\bin\b/)]
  }

  tokenNotIn(slicedCode) {
    return [tokenTypes.NOT_IN, slicedCode.match(/\bnot\b[ \t]+\bin\b/)]
  }

  tokenDoubleEquals(slicedCode) {
    return [tokenTypes.D_EQUALS, slicedCode.match(/[=][=]/)]
  }

  tokenAnd(slicedCode) {
    return [tokenTypes.AND, slicedCode.match(/\band\b/)]
  }

  tokenOr(slicedCode) {
    return [tokenTypes.OR, slicedCode.match(/\bor\b/)]
  }

  tokenIf(slicedCode) {
    return [tokenTypes.IF, slicedCode.match(/\bif\b/)]
  }

  tokenElse(slicedCode) {
    return [tokenTypes.ELSE, slicedCode.match(/\belse\b/)]
  }

  tokenPercent(slicedCode) {
    return [tokenTypes.PERCENT, slicedCode.match(/%/)]
  }
}
