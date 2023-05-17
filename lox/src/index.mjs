import { Resolver } from "./Resolver.mjs";
import { Interpreter } from "./Interpreter.mjs";
import { Parser } from "./Parser.mjs";
import Scanner from "./Scanner.mjs";

let outputvals = [];
let isInBrowser = false;

export class Lox {
  hadError = false;
  hadRuntimeError = false;
  interpreter = new Interpreter();
  output = null;

  constructor(output) {
    this.output = output;
  }

  run(file) {
    if (isInBrowser) {
      outputvals = [];
      this.hadError = false;
      this.hadRuntimeError = false;
    }

    const scanner = new Scanner(file);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();

    if (this.hadRuntimeError && !isInBrowser) process.exit(70);
    if (this.hadRuntimeError) return outputvals;
    if (this.hadError) return outputvals;

    const resolver = new Resolver(this.interpreter);
    resolver.resolve(statements);
    this.interpreter.interpret(statements);
    if (isInBrowser) return outputvals;
  }

  error(line, message) {
    this.report(line, isInBrowser ? "repl" : "file", message);
  }

  report(line, where, message) {
    this.output(`[${line}] Error ${where}: ${message}`);
    this.hadError = true;
  }

  runtimeError(error) {
    this.output(error.message +
      "\n[line " + error.token.line + "]");
    this.hadRuntimeError = true;
  }
}

let output;
try {
  if (window && document) {
    output = (message) => outputvals.push(message);
    isInBrowser = true;
  } else {
    output = console.log;
  }
} catch {
  output = console.log;
}

export const LoxImplementation = new Lox(output);
