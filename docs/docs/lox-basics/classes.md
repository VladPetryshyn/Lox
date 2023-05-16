---
sidebar_position: 4
---

# Classes

## Syntax

```javascript
// class declaration;
class Lox {
    constructor(name) {
        this.name = name;
    }
    // method
    run() {
        print "Hi, " + this.name;
    }
}
```

## Extending classes

```javascript
class Lox {
    constructor(name) {
        this.name = name;
    }
    run() {
        print "Hi, " + this.name;
    }
}

// Class Jox extends Lox
class Jox < Lox {
    run() {
        super.run();
        print "Ciao";
    }
}
```
