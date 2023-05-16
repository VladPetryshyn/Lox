import { Resolver } from "./Resolver.mjs";
import { Interpreter } from "./Interpreter.mjs";
import { Parser } from "./Parser.mjs";
import Scanner from "./Scanner.mjs";

export class Lox {
  hadError = false;
  hadRuntimeError = false;
  interpreter = new Interpreter();

  run(file) {
    const scanner = new Scanner(file);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();

    if (this.hadRuntimeError) process.exit(70);
    if (this.hadError) return;

    const resolver = new Resolver(this.interpreter);
    resolver.resolve(statements);
    this.interpreter.interpret(statements);
  }

  error(line, message) {
    this.report(line, "", message);
  }

  report(line, where, message) {
    console.error(`[${line}] Error ${where}: ${message}`);
    this.hadError = true;
  }

  runtimeError(error) {
    console.error(error.message +
      "\n[line " + error.token.line + "]");
    this.hadRuntimeError = true;
  }
}

export const LoxImplementation = new Lox();
