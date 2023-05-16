---
sidebar_position: 5
---

# Functions

## Syntax

### Function declaration
```javascript
fun sayHi(name) {
    return "Hello, " + name;
}

sayHi("Fritz");
```

### Closures
Lox language supports closures, here's an example:

```javascript
fun counter() {
    var i = 0;
    fun add() {
        i = i + 1;
        return i;
    }
    return add;
}

var cntr = counter();
cntr(); // 1
cntr(); // 2
print cntr(); // 3
```
