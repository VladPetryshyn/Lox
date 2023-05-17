import Token from "./Token.mjs";
import { TokenType } from "./TokenType.mjs";
import { LoxImplementation } from "./index.mjs";

const keywords = Object.freeze({
  "and": TokenType.AND,
  "class": TokenType.CLASS,
  "else": TokenType.ELSE,
  "false": TokenType.FALSE,
  "true": TokenType.TRUE,
  "for": TokenType.FOR,
  "if": TokenType.IF,
  "fun": TokenType.FUN,
  "nil": TokenType.NIL,
  "print": TokenType.PRINT,
  "return": TokenType.RETURN,
  "super": TokenType.SUPER,
  "this": TokenType.THIS,
  "var": TokenType.VAR,
  "while": TokenType.WHILE,
  "or": TokenType.OR
});

export default class Scanner {
  source = "";
  tokens = [];
  line = 1;
  start = 0;
  current = 0;

  constructor(source) {
    this.source = source;
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  isAtEnd() {
    return this.current >= this.source.length;
  }

  scanToken() {
    const c = this.advance();
    switch (c) {
      case '(': this.addToken(TokenType.LEFT_PAREN); break;
      case ')': this.addToken(TokenType.RIGHT_PAREN); break;
      case '{': this.addToken(TokenType.LEFT_BRACE); break;
      case '}': this.addToken(TokenType.RIGHT_BRACE); break;
      case '[': this.addToken(TokenType.LEFT_BRACKET); break;
      case ']': this.addToken(TokenType.RIGHT_BRACKET); break;
      case ',': this.addToken(TokenType.COMMA); break;
      case '.': this.addToken(TokenType.DOT); break;
      case '-': this.addToken(TokenType.MINUS); break;
      case '+': this.addToken(TokenType.PLUS); break;
      case ';': this.addToken(TokenType.SEMICOLON); break;
      case '*': this.addToken(TokenType.STAR); break;
      case '!':
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case '=':
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>':
        this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      case '/':
        if (this.match('/')) {
          // A comment goes until the end of the line.
          while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
        } else if (this.match("*")) {
          this.multilineComment();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break;
      case "\n":
        this.line++;
        break;
      case '"': this.string(); break;
      default:
        if (!isNaN(c)) {
          this.number();
        } else if (this.isAlphaNumeric(c)) {
          this.identifier();
        } else {
          LoxImplementation.error(this.line, "Unexpected character");
        }
    }
  }

  advance() {
    return this.source[this.current++];
  }

  addToken(type, literal) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  match(char) {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== char) return false;

    this.current++;
    return true;
  }

  peek() {
    if (this.isAtEnd()) return "\0";
    return this.source[this.current];
  }

  string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() == '\n') this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      throw LoxImplementation.error(this.line, "Unterminated string");
    }

    // closing of the string
    this.advance();

    // adding token
    this.addToken(TokenType.STRING, this.source.substring(this.start + 1, this.current - 1));
  }

  number() {
    while (!isNaN(this.peek())) this.advance();

    if (this.peek() == "." && !isNaN(this.peekNext())) {
      this.advance();
      while (!isNaN(this.peek())) this.advance();
    }

    this.addToken(TokenType.NUMBER, Number(this.source.substring(this.start, this.current)));
  }

  peekNext() {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source[this.current + 1];
  }

  isAlphaNumeric(str) {
    let code, i, len;
    for (i = 0, len = str.length; i < len; i++) {
      code = str.charCodeAt(i);
      if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
      }
    }
    return true;
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    let type = keywords[text];
    if (!type || text === "constructor") {
      type = TokenType.IDENTIFIER;
    }
    this.addToken(type);
  }

  multilineComment() {
    let unclosed = 1;
    while (!this.isAtEnd()) {
      const c = this.advance();
      if (c === "*" && this.match("/")) {
        unclosed--;
      }
      if (c === "/" && this.match("*")) {
        unclosed++;
      }
      if (unclosed === 0) break;
    }

    if (unclosed > 0) {
      LoxImplementation.output("Error, unterminated comment");
    }
  }
}
