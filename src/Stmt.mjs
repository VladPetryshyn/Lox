export class Visitor {
	visitBlockStmt(stmt){}
	visitExpressionStmt(stmt){}
	visitIfStmt(stmt){}
	visitPrintStmt(stmt){}
	visitVarStmt(stmt){}
	visitWhileStmt(stmt){}
	visitFunctionStmt(stmt){}
	visitClassStmt(stmt){}
	visitReturnStmt(stmt){}
}

export class Stmt {
  accept(visitor){};
}
export class Block extends Stmt {
	statements

	constructor(statements) {
		super();
		this.statements = statements;
	}
	accept(visitor) {
		return visitor.visitBlockStmt(this)
	}
}
export class Expression extends Stmt {
	expression

	constructor(expression) {
		super();
		this.expression = expression;
	}
	accept(visitor) {
		return visitor.visitExpressionStmt(this)
	}
}
export class If extends Stmt {
	condition
	thenBranch
	elseBranch

	constructor(condition, thenBranch, elseBranch) {
		super();
		this.condition = condition;
		this.thenBranch = thenBranch;
		this.elseBranch = elseBranch;
	}
	accept(visitor) {
		return visitor.visitIfStmt(this)
	}
}
export class Print extends Stmt {
	expression

	constructor(expression) {
		super();
		this.expression = expression;
	}
	accept(visitor) {
		return visitor.visitPrintStmt(this)
	}
}
export class Var extends Stmt {
	name
	initializer

	constructor(name, initializer) {
		super();
		this.name = name;
		this.initializer = initializer;
	}
	accept(visitor) {
		return visitor.visitVarStmt(this)
	}
}
export class While extends Stmt {
	condition
	body

	constructor(condition, body) {
		super();
		this.condition = condition;
		this.body = body;
	}
	accept(visitor) {
		return visitor.visitWhileStmt(this)
	}
}
export class Function extends Stmt {
	name
	params
	body

	constructor(name, params, body) {
		super();
		this.name = name;
		this.params = params;
		this.body = body;
	}
	accept(visitor) {
		return visitor.visitFunctionStmt(this)
	}
}
export class Class extends Stmt {
	name
	superclass
	methods

	constructor(name, superclass, methods) {
		super();
		this.name = name;
		this.superclass = superclass;
		this.methods = methods;
	}
	accept(visitor) {
		return visitor.visitClassStmt(this)
	}
}
export class Return extends Stmt {
	keyword
	value

	constructor(keyword, value) {
		super();
		this.keyword = keyword;
		this.value = value;
	}
	accept(visitor) {
		return visitor.visitReturnStmt(this)
	}
}