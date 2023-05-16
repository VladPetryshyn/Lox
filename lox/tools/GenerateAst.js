const fs = require("fs");

const args = process.argv;

if (args.length < 3) {
  process.exit(65);
}

const outputDir = args[2];


const defineAst = (baseName, types) => {
  const appendFile = (val) => {
    fs.appendFileSync(path, val);
  };
  const path = `${outputDir}/${baseName}.mjs`;
  // defining Visitor interface
  fs.writeFileSync(path, `export class Visitor {\n`);
  for (const key of Object.keys(types)) {
    appendFile(`\tvisit${key}${baseName}(${baseName.toLowerCase()}){}\n`);
  }
  // appendFile("\tparenthesize(name, ...exprs) {}")
  appendFile("}\n\n");

  // defining abstract class
  appendFile(`export class ${baseName} {
  accept(visitor){};
}`);

  // defining expressions
  for (const key of Object.keys(types)) {
    const fields = types[key].split(',');

    // defining class
    appendFile(`
export class ${key} extends ${baseName} {\n`);

    // defining fields types
    for (const field of fields) {
      appendFile(`\t${field.trim()}\n`);
    }

    // constructor
    appendFile(
      `\n\tconstructor(${types[key]}) {
\t\tsuper();\n`);

    // constructor fields
    for (const field of fields) {
      const name = field.split(":")[0].trim();
      appendFile(`\t\tthis.${name} = ${name};\n`);
    }
    appendFile("\t}");
    // accept method implementation
    appendFile(`\n\taccept(visitor) {
\t\treturn visitor.visit${key}${baseName}(this)\n\t}`);

    appendFile("\n}");
  }
};

defineAst("Expr", {
  Assign: "name, value",
  Binary: "left, operator, right",
  Grouping: "expression",
  Literal: "value",
  Unary: "operator, right",
  Variable: "name",
  Logical: "left, operator, right",
  Call: "callee, paren, args",
  Get: "object, name",
  This: "keyword",
  Super: "keyword, method",
  Set: "object, name, value",
});

defineAst("Stmt", {
  Block: "statements",
  Expression: "expression",
  If: "condition, thenBranch, elseBranch",
  Print: "expression",
  Var: "name, initializer",
  While: "condition, body",
  Function: "name, params, body",
  Class: "name, superclass, methods",
  Return: "keyword, value",
});
