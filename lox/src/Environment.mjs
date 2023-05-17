import { RuntimeError } from "./RuntimeError.mjs";

export class Environment {
  values = new Map();
  enclosing = null;

  constructor(enclosing) {
    this.enclosing = enclosing;
  }

  define(name, value) {
    if (this.values.get(name)) {
      throw new RuntimeError(name, `${name} Variable is already defined ${name.lexeme}`);
    }
    this.values.set(name, value);
  }
  assign(name, value) {
    const val = this.values.get(name.lexeme);
    if (val || val <= 0) {
      this.values.set(name.lexeme, value);
      return;
    }
    if (this.enclosing) {
      this.enclosing.assign(name, value);
      return;
    }
    throw new RuntimeError(name, `${name} Undefined variable, ${name.lexeme}.`);
  }

  get(name) {
    const val = this.values.get(name.lexeme);
    if (val || val === 0) {
      return this.values.get(name.lexeme);
    }


    if (this.enclosing) return this.enclosing.get(name);

    throw new RuntimeError(name, `${name} Undefined variable, ${name.lexeme}.`);
  }
  getAt(distance, name) {
    const value = this.ancestor(distance).values.get(name);
    return value;
  }
  assignAt(distance, name, value) {
    this.ancestor(distance).values.set(name.lexeme, value);
  }

  ancestor(distance) {
    let environment = this;

    for (let i = 0; i < distance; i++) {
      environment = environment.enclosing;
    }

    return environment;
  }
}
