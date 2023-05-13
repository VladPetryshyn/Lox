export class Visitor {
	visitAssignExpr(expr){}
	visitBinaryExpr(expr){}
	visitGroupingExpr(expr){}
	visitLiteralExpr(expr){}
	visitUnaryExpr(expr){}
	visitVariableExpr(expr){}
	visitLogicalExpr(expr){}
	visitCallExpr(expr){}
	visitGetExpr(expr){}
	visitThisExpr(expr){}
	visitSuperExpr(expr){}
	visitSetExpr(expr){}
}

export class Expr {
  accept(visitor){};
}
export class Assign extends Expr {
	name
	value

	constructor(name, value) {
		super();
		this.name = name;
		this.value = value;
	}
	accept(visitor) {
		return visitor.visitAssignExpr(this)
	}
}
export class Binary extends Expr {
	left
	operator
	right

	constructor(left, operator, right) {
		super();
		this.left = left;
		this.operator = operator;
		this.right = right;
	}
	accept(visitor) {
		return visitor.visitBinaryExpr(this)
	}
}
export class Grouping extends Expr {
	expression

	constructor(expression) {
		super();
		this.expression = expression;
	}
	accept(visitor) {
		return visitor.visitGroupingExpr(this)
	}
}
export class Literal extends Expr {
	value

	constructor(value) {
		super();
		this.value = value;
	}
	accept(visitor) {
		return visitor.visitLiteralExpr(this)
	}
}
export class Unary extends Expr {
	operator
	right

	constructor(operator, right) {
		super();
		this.operator = operator;
		this.right = right;
	}
	accept(visitor) {
		return visitor.visitUnaryExpr(this)
	}
}
export class Variable extends Expr {
	name

	constructor(name) {
		super();
		this.name = name;
	}
	accept(visitor) {
		return visitor.visitVariableExpr(this)
	}
}
export class Logical extends Expr {
	left
	operator
	right

	constructor(left, operator, right) {
		super();
		this.left = left;
		this.operator = operator;
		this.right = right;
	}
	accept(visitor) {
		return visitor.visitLogicalExpr(this)
	}
}
export class Call extends Expr {
	callee
	paren
	args

	constructor(callee, paren, args) {
		super();
		this.callee = callee;
		this.paren = paren;
		this.args = args;
	}
	accept(visitor) {
		return visitor.visitCallExpr(this)
	}
}
export class Get extends Expr {
	object
	name

	constructor(object, name) {
		super();
		this.object = object;
		this.name = name;
	}
	accept(visitor) {
		return visitor.visitGetExpr(this)
	}
}
export class This extends Expr {
	keyword

	constructor(keyword) {
		super();
		this.keyword = keyword;
	}
	accept(visitor) {
		return visitor.visitThisExpr(this)
	}
}
export class Super extends Expr {
	keyword
	method

	constructor(keyword, method) {
		super();
		this.keyword = keyword;
		this.method = method;
	}
	accept(visitor) {
		return visitor.visitSuperExpr(this)
	}
}
export class Set extends Expr {
	object
	name
	value

	constructor(object, name, value) {
		super();
		this.object = object;
		this.name = name;
		this.value = value;
	}
	accept(visitor) {
		return visitor.visitSetExpr(this)
	}
}