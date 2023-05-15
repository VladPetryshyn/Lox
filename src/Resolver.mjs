import { Expr } from "./Expr.mjs";
import { createEnum } from "./helpers/enums.mjs";
import { Stmt } from "./Stmt.mjs";
import { LoxImplementation } from "./index.mjs";

const FunctionType = createEnum(["NONE", "FUNCTION", "METHOD", "INITIALIZER"]);
const ClassType = createEnum(["NONE", "CLASS", "SUBCLASS"]);

export class Resolver {
  interpreter = null;
  scopes = [];
  currentFunction = FunctionType.NONE;
  currentClass = ClassType.NONE;
  locals = new Map();

  constructor(interpreter) {
    this.interpreter = interpreter;
  }
  resolve(item) {
    if (item) {
      if (item instanceof Array) {
        for (const statement of item) {
          this.resolve(statement);
        }
      }

      if (item instanceof Stmt || item instanceof Expr) {
        item.accept(this);
      }
    }
  }
  resolveFunction(func, type) {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    for (const param of func.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve(func.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  beginScope() {
    this.scopes.push(new Map());
  }
  endScope() {
    this.scopes.pop();
  }

  visitBlockStmt(stmt) {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
  }
  visitClassStmt(stmt) {
    const enclosingClass = this.currentClass;
    this.currentClass = ClassType.CLASS;

    this.declare(stmt.name);
    this.define(stmt.name);

    if (stmt.superclass && stmt.name.lexeme === stmt?.superclass?.name?.lexeme) {
      LoxImplementation.error(stmt.superclass.name.line, "A class can't inherit from itself");
    }

    if (stmt.superclass) {
      this.currentClass = ClassType.SUBCLASS;
      this.resolve(stmt.superclass);
    }

    if (stmt.superclass) {
      this.beginScope();
      this.scopes[this.scopes.length - 1].set("super", true);
    }

    this.beginScope();
    this.scopes[this.scopes.length - 1].set("this", true);

    for (const method of stmt.methods) {
      const declaration = method.name.lexeme === "init" ? FunctionType.INITIALIZER : FunctionType.METHOD;
      this.resolveFunction(method, declaration);
    }

    this.endScope();
    if (stmt.superclass) this.endScope();
    this.currentClass = enclosingClass;
  }
  visitExpressionStmt(stmt) {
    this.resolve(stmt.expression);
  }
  visitIfStmt(stmt) {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch) this.resolve(stmt.elseBranch);
  }
  visitPrintStmt(stmt) {
    this.resolve(stmt.expression);
  }
  visitReturnStmt(stmt) {
    if (this.currentFunction === FunctionType.NONE) {
      LoxImplementation.error(stmt.keyword.line, "Can't return from top-level code.");
    }

    if (stmt.value) {
      if (this.currentFunction === FunctionType.INITIALIZER) {
        LoxImplementation.error(stmt.keyword.line, "Can't return a value from an initializer.");
      }
      this.resolve(stmt.value);
    }
  }
  visitVarStmt(stmt) {
    this.declare(stmt.name);
    if (stmt.initializer) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
  }
  visitWhileStmt(stmt) {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
  }
  visitBinaryExpr(expr) {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }
  visitAssignExpr(expr) {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }
  visitCallExpr(expr) {
    this.resolve(expr.callee);

    for (const argument of expr.args) {
      this.resolve(argument);
    }
  }
  visitGetExpr(expr) {
    this.resolve(expr.object);
  }
  visistThisExpr(expr) {
    this.resolveLocal(expr, expr.keyword);
  }
  visitGroupingExpr(expr) {
    this.resolve(expr.expression);
  }
  visitLiteralExpr() { }
  visitLogicalExpr(expr) {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitSetExpr(expr) {
    this.resolve(expr.value);
    this.resolve(expr.object);
  }
  visitSuperExpr(expr) {
    if (this.currentClass == ClassType.NONE) {
      LoxImplementation.error(expr.keyword.line,
        "Can't use 'super' outside of a class.");
    } else if (this.currentClass != ClassType.SUBCLASS) {
      LoxImplementation.error(expr.keyword.line,
        "Can't use 'super' in a class with no superclass.");
    }
    this.resolveLocal(expr, expr.keyword);
  }

  visitThisExpr(expr) {
    if (this.currentClass === ClassType.NONE) {
      LoxImplementation.error(expr.keyword.line, "Can't use this outside of a class.");
    }

    this.resolveLocal(expr, expr.keyword);
  }
  visitUnaryExpr(expr) {
    this.resolve(expr.right);
  }
  visitFunctionStmt(stmt) {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }
  visitVariableExpr(expr) {
    if (this.scopes.length > 0 && this.scopes[this.scopes.length - 1].get(expr.name.lexme) === false) {
      LoxImplementation.error(expr.name.line, "Can't read variable in its own initializer.");
    }

    this.resolveLocal(expr, expr.name);
  }

  declare(name) {
    if (this.scopes.length === 0) return;

    const scope = this.scopes[this.scopes.length - 1]
    if (scope.has(name.lexeme)) {
      LoxImplementation.error(name.line, "Already a variable with this name in this scope");
    }
    scope.set(name.lexeme, false);
  }

  define(name) {
    if (this.scopes.length === 0) return;
    this.scopes[this.scopes.length - 1].set(name.lexeme, true);
  }

  resolveLocal(expr, name) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }
}
