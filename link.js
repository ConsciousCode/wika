'use strict';

const {InlineParser, WikaNode} = require("./parse");

class Link extends WikaNode {
	constructor(params) {
		super();
		this.params = params;
	}
	
	toString() {
		return `[[${this.params.join("|")}]]`;
	}
}

class LinkParser extends InlineParser {
	next(p) {
		return p.indexOf("[[");
	}
	
	parse(p) {
		let r = p.indexOf("]]");
		
		let ln = new Link(p.src.slice(this.pos + 2, r));
		
		p.pos = r + 2;
		
		return ln;
	}
}
