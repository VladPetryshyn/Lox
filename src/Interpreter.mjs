import { Environment } from "./Environment.mjs";
import { LoxCallable } from "./LoxCallable.mjs";
import { LoxClass } from "./LoxClass.mjs";
import { LoxFunction } from "./LoxFunction.mjs";
import { LoxInstance } from "./LoxInstance.mjs";
import { Return } from "./Return.mjs";
import { TokenType } from "./TokenType.mjs";
import * as fs from "fs";

export class Interpreter {
  globals = new Environment();
  environment = this.globals;
  locals = new Map();

  constructor() {
    class clock extends LoxCallable {
      arity() { return 0; }
      call() {
        return Date.now() / 1000
      }
      toString() { return "native fn" }
    }
    class push extends LoxCallable {
      arity() { return 2; }
      call(_, [array, item]) {
        array.push(item);
      }
      toString() { return "native fn" }
    }
    class pop extends LoxCallable {
      arity() { return 1; }
      call(_, [array]) {
        array.pop();
      }
      toString() { return "native fn" }
    }
    class unshift extends LoxCallable {
      arity() { return 2; }
      call(_, [array, item]) {
        array.unshift(item);
      }
      toString() { return "native fn" }
    }
    class shift extends LoxCallable {
      arity() { return 1; }
      call(_, [array]) {
        array.shift();
      }
      toString() { return "native fn" }
    }
    class writeFile extends LoxCallable {
      arity() { return 2; }
      call(_, [path, text]) {
        fs.writeFileSync(path, text);
      }
    }
    this.globals.define("clock", new clock())
    this.globals.define("push", new push())
    this.globals.define("pop", new pop())
    this.globals.define("unshift", new unshift())
    this.globals.define("shift", new shift())
    this.globals.define("writeFile", new writeFile())
  }

  visitLiteralExpr({ value }) {
    if (value instanceof Array) {
      for (const i in value) {
        value[i] = this.evaluate(value[i]);
      }
    }

    return value;
  }
  // explicit parentheses in an expression.
  visitGroupingExpr(expr) {
    return this.evaluate(expr.expression);
  }
  // sends expression back into interpreter visitor implementation
  evaluate(expr) {
    if (expr) {
      return expr.accept(this);
    }
  }

  visitUnaryExpr(expr) {
    const right = this.evaluate(expr.right);
    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        return -right;
      case TokenType.PLUS:
        return +right;
    }

    // unreachable
    return null;
  }

  visitVariableExpr(expr) {
    return this.lookUpVariable(expr.name, expr);
  }
  lookUpVariable(name, expr) {
    const distance = this.locals.get(expr);

    if (distance || distance === 0) {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
  }

  visitBinaryExpr(expr) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        return Number(left) - Number(right);
      case TokenType.STAR:
        return Number(left) * Number(right);
      case TokenType.SLASH:
        return Number(left) / Number(right);
      case TokenType.PLUS:
        return left + right;
      case TokenType.GREATER:
        return Number(left) > Number(right);
      case TokenType.GREATER_EQUAL:
        return Number(left) >= Number(right);
      case TokenType.LESS:
        return Number(left) < Number(right);
      case TokenType.LESS_EQUAL:
        return Number(left) <= Number(right);
      case TokenType.BANG_EQUAL: return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL: return this.isEqual(left, right);
    }

    return null;
  }
  visitCallExpr(expr) {
    const callee = this.evaluate(expr.callee);
    const args = [];

    for (const argument of expr.args) {
      args.push(this.evaluate(argument))
    }

    if (!(callee instanceof LoxCallable)) {
      throw new Error(expr.paren, "Can only call functions and classes.");
    }
    if (args.length !== callee.arity()) {
      throw new Error(expr.paren, `Expected ${callee.arity} arguments but got ${args.length}.`);
    }

    return callee.call(this, args)
  }
  visitGetExpr(expr) {
    const obj = this.evaluate(expr.object);
    if (obj instanceof Array) {
      return obj[expr.name.value];
    }
    if (obj instanceof LoxInstance) {
      return obj.get(expr.name);
    }

    throw new Error("Only instances have properties");
  }

  isTruthy(object) {
    // if (object == null) return false;
    // if (object instanceof Boolean) return Boolean(object);
    return !!object;
  }
  isEqual(a, b) {
    return a === b;
  }

  interpret(statements) {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      console.error(error)
    }
  }

  visitExpressionStmt(stmt) {
    this.evaluate(stmt.expression);
  }
  visitFunctionStmt(stmt) {
    const func = new LoxFunction(stmt, this.environment);
    this.environment.define(stmt.name.lexeme, func);
  }

  visitVarStmt(stmt) {
    if (stmt.initializer != null) {
      this.environment.define(stmt.name.lexeme, this.evaluate(stmt.initializer));
    }
  }
  visitAssignExpr(expr) {
    const value = this.evaluate(expr.value);

    const distance = this.locals.get(expr);
    if (distance || distance === 0) {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }
    return value;
  }
  visitBlockStmt(stmt) {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }
  visitClassStmt(stmt) {
    let superclass = null;
    if (stmt.superclass) {
      superclass = this.evaluate(stmt.superclass);

      if (!(superclass instanceof LoxClass)) {
        throw new Error("Superclass must be a class");
      }
    }
    this.environment.define(stmt.name.lexeme, null);

    if (stmt.superclass) {
      this.environment = new Environment(this.environment);
      this.environment.define("super", superclass);
    }

    const methods = new Map();
    for (const method of stmt.methods) {
      const funct = new LoxFunction(method, this.environment, method.name.lexeme === "init");
      methods.set(method.name.lexeme, funct);
    }

    const klass = new LoxClass(stmt.name.lexeme, superclass, methods);

    if (superclass) {
      this.environment = this.environment.enclosing;
    }

    this.environment.assign(stmt.name, klass);
  }

  visitIfStmt(stmt) {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      this.execute(stmt.elseBranch);
    }
  }

  visitLogicalExpr(expr) {
    const left = this.evaluate(expr.left);
    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }
  visitSetExpr(expr) {
    const obj = this.evaluate(expr.object);
    const value = this.evaluate(expr.value);

    if (obj instanceof Array) {
      obj[expr.name.value] = value;
      return value;
    }
    if (!(obj instanceof LoxInstance)) {
      throw new Error("Only instances have fields");
    }

    obj.set(expr.name, value);
    return value;
  }
  visitSuperExpr(expr) {
    let distance = this.locals.get(expr);

    const superclass = this.environment.getAt(distance, "super");
    const obj = this.environment.getAt(distance - 1, "this");

    const method = superclass.findMethod(expr.method.lexeme);

    if (!method) {
      throw new Error("Undefined property");
    }

    return method.bind(obj);
  }
  visitThisExpr(expr) {
    return this.lookUpVariable(expr.keyword, expr);
  }

  visitWhileStmt(stmt) {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  visitPrintStmt(stmt) {
    const value = this.evaluate(stmt.expression);
    console.log(value);
  }
  visitReturnStmt(stmt) {
    let value = null;
    if (stmt.value) value = this.evaluate(stmt.value)

    throw new Return(value);
  }


  execute(stmt) {
    stmt.accept(this);
  }
  resolve(expr, depth) {
    this.locals.set(expr, depth);
  }
  executeBlock(statements, environment) {
    const previous = this.environment;
    try {
      this.environment = environment;
      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }
}
