import { Binary, Grouping, Literal, Unary, Visitor } from "./Expr.mjs";
import Token from "./Token.mjs";
import { TokenType } from "./TokenType.mjs";

export class AstPrinter extends Visitor {
  print(expr) {
    return expr.accept(this);
  }

  visitBinaryExpr(expr) {
    return this.parenthesize(expr.operator.lexeme,
      expr.left, expr.right);
  }

  visitGroupingExpr(expr) {
    return this.parenthesize("group", expr.expression);
  }
  visitLiteralExpr(expr) {
    if (expr.value === null) return "nil";
    return expr.value.toString();
  }
  visitUnaryExpr(expr) {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }
  parenthesize(name, ...exprs) {
    let string = `(${name}`;

    for (const expr of exprs) {
      string += ` ${expr.accept(this)}`
    }
    string += ")"

    return string;
  }
  main() {
    const expr = new Binary(new Unary(new Token(TokenType.MINUS, "-", null, 1), new Literal(123)),
      new Token(TokenType.STAR, "*", null, 1),
      new Grouping(new Literal(45.67)));

    console.log(new AstPrinter().print(expr))
  }
}
