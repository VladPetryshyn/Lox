import { Resolver } from "./Resolver.mjs";
import * as fs from "fs";
import { Interpreter } from "./Interpreter.mjs";
import { Parser } from "./Parser.mjs";
import Scanner from "./Scanner.mjs";

const args = process.argv;

export class Lox {
  hadError = false;
  hadRuntimeError = false;
  interpreter = new Interpreter();

  runFile = (path) => {
    const file = String(fs.readFileSync(path));
    this.run(file);

    if (this.hadRuntimeError) process.exit(70);
  };

  run(file) {
    const scanner = new Scanner(file);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();

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

if (args > 3) {
  console.error("Usage: tox [script]");
} else if (args.length === 3) {
  LoxImplementation.runFile(args[2]);
}
