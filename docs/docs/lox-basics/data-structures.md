---
sidebar_position: 6
---

# Data Structures

Lox has 3 data structures: Strings, Numbers, Arrays

## Strings

```javascript
// variable declaration with string value "Fritz";
var name = "Fritz";

// string concatenation
name = name + " Muller"; // Fritz Muller
```

## Numbers
```javascript
// variable declaration with number value 18;
var age = 18;

// multiplication
age = age * 2;

// division
age = age / 2;

// addition
age = age + 1;

// subtraction
age = age - 1;

print age; // 18
```

## Arrays
```javascript
// variable declaration with array value ["Servus"];
var greetings = ["Servus"];

// adds value to the end
push(greetings, "Gruss Got");

// removes last array value
pop(greetings);

// adds item in front of array
unshift(greetings, "Hallo");

// removes 1 array item
shift(greetings);

// prints array length
print len(greetings);
```
