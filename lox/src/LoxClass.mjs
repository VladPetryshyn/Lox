import { LoxCallable } from "./LoxCallable.mjs";
import { LoxInstance } from "./LoxInstance.mjs";

export class LoxClass extends LoxCallable {
  name = null;
  methods = new Map();
  superclass = null;

  constructor(name, superclass, methods) {
    super();
    this.superclass = superclass;
    this.name = name;
    this.methods = methods;
  }

  toString() {
    return this.name;
  }

  call(interpreter, args) {
    const instance = new LoxInstance(this);
    const initializer = this.findMethod("init");

    if (initializer) {
      initializer.bind(instance).call(interpreter, args);
    }

    return instance;
  }


  findMethod(name) {
    if (this.methods.has(name)) {
      return this.methods.get(name);
    }

    if (this.superclass) {
      return this.superclass.findMethod(name);
    }
  }

  arity() {
    const initializer = this.findMethod("init");
    if (!initializer) return 0;
    return initializer.arity();
  }
}
