export class LoxInstance {
  klass = null;
  fields = new Map();

  constructor(klass) {
    this.klass = klass;
  }

  toString() {
    return this.klass.name + " instance";
  }

  get(name) {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme);
    }

    const method = this.klass.findMethod(name.lexeme);
    if (method) return method.bind(this);

    throw new Error("Undefined property " + name.lexeme + ".")
  }
  set(name, value) {
    this.fields.set(name.lexeme, value)
  }
}
