import { Assign, Binary, Call, Get, Grouping, Literal, Logical, Variable, Set as ExprSet, This, Super } from "./Expr.mjs";
import { LoxImplementation } from "./index.mjs";
import { Block, Class, Expression, Function, If, Print, Return, Var, While } from "./Stmt.mjs";
import { TokenType } from "./TokenType.mjs";

export class Parser {
  tokens = [];
  current = 0;

  constructor(tokens) {
    this.tokens = tokens;
  }

  expression() {
    return this.assignment();
  }

  assignment() {
    const expr = this.or();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();


      if (expr instanceof Variable) {
        const name = expr.name;
        return new Assign(name, value);
      } else if (expr instanceof Get) {
        const get = expr;
        return new ExprSet(get.object, get.name, value);
      }

      this.error(equals.line, "Invalid assignment target.");
    }

    return expr;
  }
  or() {
    let expr = this.and();
    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Logical(expr, operator, right);
    }


    return expr;
  }
  and() {
    let expr = this.equality();
    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  // stuff that contains equality
  equality() {
    let expr = this.comparison();

    // we must find first eitehr != or == token
    while (this.match(TokenType.BANG_EQUAL, TokenType.BANG_EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  // checks if current token has any of the given types, if so it consumes token and returns true.
  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  // returns true, if the current token of the given type
  check(...types) {
    if (this.isAtEnd()) return false;
    for (const type of types) {
      if (this.peek().type === type) {
        return true;
      }
    }

    return false;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }
  peek() {
    return this.tokens[this.current];
  }
  next() {
    return this.tokens[this.current + 1];
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  comparison() {
    let expr = this.term();

    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  term() {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  factor() {
    let expr = this.unary();

    while (this.match(TokenType.STAR, TokenType.SLASH)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  unary() {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    const call = this.call();
    return call;
  }
  finishCall(callee) {
    const args = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (args.length > 100) {
          this.error(this.peek().line, "Can't have more than 100 arguments.");
        }
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    const paren = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");

    return new Call(callee, paren, args);
  }
  call() {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LEFT_BRACKET)) {
        const arr = this.arrayStmt();
        if (arr.length !== 1) {
          throw this.error(this.peek().line, "1");
        }

        return new Get(expr, arr[0]);
      } else if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.DOT)) {
        const name = this.consume(TokenType.IDENTIFIER, "Expect property name after '.'.");
        expr = new Get(expr, name);
      } else {
        break;
      }
    }

    return expr;
  }

  primary() {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }
    if (this.match(TokenType.SUPER)) {
      const keyword = this.previous();
      this.consume(TokenType.DOT, "Expect '.' after 'super'.");
      const method = this.consume(TokenType.IDENTIFIER, "Expect superclass method name.");

      return new Super(keyword, method);
    }
    if (this.match(TokenType.THIS)) return new This(this.previous());
    if (this.match(TokenType.LEFT_BRACKET)) {
      const arr = this.arrayStmt();
      return new Literal(arr);
    }
    if (this.match(TokenType.IDENTIFIER)) {
      return new Variable(this.previous());
    }
    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

    throw this.error(this.peek().line, "Expect expression.");
  }

  consume(type, message) {
    if (this.check(type)) return this.advance();

    console.log(this.peek());
    throw this.error(this.peek().line, message);
  }

  error(line, message) {
    LoxImplementation.error(line, message);
    return new Error();
  }

  synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type == TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  parse() {
    const statements = [];

    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }
    return statements;
  }

  statement() {
    if (this.match(TokenType.RETURN)) return this.returnStatement();
    if (this.match(TokenType.FOR)) return this.forStatement();
    if (this.match(TokenType.IF)) {
      return this.ifStatement();
    }
    if (this.match(TokenType.PRINT)) return this.printStatement();
    if (this.match(TokenType.WHILE)) return this.whileStatement();
    if (this.match(TokenType.LEFT_BRACE)) return new Block(this.block());

    return this.expressionStatement();
  }

  printStatement() {
    const value = this.expression();

    this.consume(TokenType.SEMICOLON, "Expect ; after value.");
    return new Print(value);
  }
  returnStatement() {
    const keyword = this.previous();
    let value = null;

    if (!this.check(TokenType.SEMICOLON)) {
      value = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after return value.");
    return new Return(keyword, value);
  }

  whileStatement() {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'");
    const condition = this.expression();

    this.consume(TokenType.RIGHT_PAREN, "Expect '(' after condition");
    const body = this.statement();

    return new While(condition, body);
  }
  forStatement() {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after for");
    let initializer;

    if (this.match(TokenType.SEMICOLON)) {
      initializer = null;
    } else if (this.match(TokenType.VAR)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition = null;
    if (!this.check(TokenType.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(TokenType.SEMICOLON, "Expect ; after loop condition.");

    let increment = null;
    if (!this.check(TokenType.RIGHT_PAREN)) {
      increment = this.expression();
    }

    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

    let body = this.statement();

    if (increment) {
      body = new Block([body, new Expression(increment)]);
    }
    if (!condition) condition = new Literal(true);
    body = new While(condition, body);

    if (initializer) {
      body = new Block([initializer, body]);
    }

    return body;
  }

  varDeclaration() {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name");

    let initializer = null;

    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ; after variable declaration");
    return new Var(name, initializer);
  }

  arrayStmt() {
    const items = [];
    while (this.check(TokenType.STRING, TokenType.NUMBER, TokenType.IDENTIFIER, TokenType.LEFT_BRACKET, TokenType.COMMA)) {
      if (!this.match(TokenType.COMMA)) {
        const item = this.primary();
        items.push(item);
      }
    }

    this.consume(TokenType.RIGHT_BRACKET, "Expect ] after array.");
    return items;
  }

  expressionStatement() {
    const expr = this.expression();

    this.consume(TokenType.SEMICOLON, "Expect ; after expression.");
    return new Expression(expr);
  }

  func(kind) {
    const name = this.consume(TokenType.IDENTIFIER, "Expect " + kind + " name.");
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after " + kind + " name.");

    const parameters = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (parameters.length > 100) {
          this.error(this.peek().line, "Can't have more than 100 parameters.");
        }

        parameters.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name."));
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");

    this.consume(TokenType.LEFT_BRACE, `Expect '{' before ${kind} body`);
    const body = this.block();
    return new Function(name, parameters, body);
  }

  block() {
    const statements = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      const declaration = this.declaration();
      statements.push(declaration);
    }

    this.consume(TokenType.RIGHT_BRACE, `Expect } after block.`);
    return statements;
  }

  declaration() {
    try {
      if (this.match(TokenType.CLASS)) return this.classDeclaration();
      if (this.match(TokenType.FUN)) return this.func("function");
      if (this.match(TokenType.VAR)) return this.varDeclaration();

      return this.statement();
    } catch (error) {
      this.synchronize();
      return null;
    }
  }
  classDeclaration() {
    const name = this.consume(TokenType.IDENTIFIER, "Expect class name");

    let superclass = null;
    if (this.match(TokenType.LESS)) {
      this.consume(TokenType.IDENTIFIER, "Expect superclass name.");
      superclass = new Variable(this.previous());
    }

    this.consume(TokenType.LEFT_BRACE, "Expect '{' before class body.");

    const methods = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      methods.push(this.func("method"));
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after class body.");

    return new Class(name, superclass, methods);
  }

  ifStatement() {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition");

    const thenBranch = this.statement();
    let elseBranch = null;

    if (this.match(TokenType.ELSE)) {
      elseBranch = this.statement();
    }

    return new If(condition, thenBranch, elseBranch);
  }
}
