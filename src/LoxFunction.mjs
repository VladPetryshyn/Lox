import { Environment } from "./Environment.mjs";
import { LoxCallable } from "./LoxCallable.mjs";

export class LoxFunction extends LoxCallable {
  declaration = null;
  closure = null;
  isInitializer = false;

  constructor(declaration, closure, isInitializer = false) {
    super();
    this.declaration = declaration;
    this.closure = closure;
    this.isInitializer = isInitializer;
  }
  call(interpreter, args) {
    const environment = new Environment(this.closure);

    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue) {
      if (this.isInitializer) return closure.getAt(0, "this");

      return returnValue.value
    }

    if (this.isInitializer) return this.closure.getAt(0, "this");
  }

  bind(instance) {
    const environment = new Environment(this.closure);
    environment.define("this", instance);
    return new LoxFunction(this.declaration, environment, this.isInitializer);
  }

  arity() {
    return this.declaration.params.length;
  }
  toString() {
    return "<fn " + this.declaration.name.lexeme + ">";
  }
}
