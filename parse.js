'use strict';

/**
 * Base for all nodes.
**/
class WikaNode {
	toString() {
		return `<wika::${this.__proto__.constructor.name}>`;
	}
}

/**
 * Base for the other parsers.
**/
class CrowdParser {
	parse(p) {}
}

class InlineParser extends CrowdParser {
	next(p) {}
}

class PrefixParser extends CrowdParser {
	match(p) {}
}

/**
 * Text containing no formatting whatsoever.
**/
class PlainText extends WikaNode {
	constructor(text) {
		super();
		this.text = text;
	}
	
	toString() {
		return this.text;
	}
}

const SOL = /^/gm;
class WikaParser {
	constructor(sol, inl) {
		this.src = "";
		this.pos = 0;
		this.sol = sol;
		this.inl = inl;
		
		this.context = null;
		this.data = {};
	}
	
	parse(src, context={}) {
		this.src = src;
		this.pos = 0;
		this.context = context;
		this.data = {};
		
		let article = this.parseRest();
		
		// Reset
		this.src = "";
		this.pos = 0;
		this.context = null;
		this.data = {};
		
		return article;
	}
	
	parseNext() {
		if(this.isPrefix()) {
			let [plain, item] = this.parsePrefix();
			
			if(plain || item) {
				return [plain, item];
			}
			// Fallthrough...
		}
		
		return this.parseInline();
	}
	
	/**
	 * Call parseNext() and add any truthy values to the given list.
	**/
	parseInto(ls) {
		let [plain, item] = this.parseNext();
		
		if(plain) {
			ls.push(plain);
		}
		
		if(item) {
			ls.push(item);
		}
		
		return ls;
	}
	
	parseRest() {
		let rest = [];
		while(this.pos < this.src.length) {
			this.parseInto(rest);
		}
		
		return rest;
	}
	
	/**
	 * Only match the given pattern if it's next.
	**/
	match(re) {
		re.lastIndex = this.pos;
		let m = re.exec(this.src);
		if(m && m.index === this.pos) {
			this.pos = re.lastIndex;
			return m;
		}
		
		return null;
	}
	
	isPrefix() {
		SOL.lastIndex = this.pos;
		let m = SOL.exec(this.src);
		return !!m && m.index == this.pos;
	}
	
	parsePrefix() {
		// Try a start-of-line parser first
		for(let x of this.sol) {
			if(x.match(this)) {
				return ["", x.parse(this)];
			}
		}
		
		// Delegate to inline
		return this.parseInline();
	}
	
	parseInline() {
		let parser = null, index = Infinity;
		
		// Select the parser closest to the current index
		for(let i = 0; i < this.inl.length; ++i) {
			let nx = this.inl[i].next(this);
			if(nx >= this.pos && nx < index) {
				parser = this.inl[i];
				index = nx;
			}
		}
		
		// Index will be Inf if a parser isn't found, which silently
		//  slices to the end of the array
		let plain = new PlainText(this.src.slice(this.pos, index));
		
		this.pos = index;
		if(parser) {
			return [plain, parser.parse(this)];
		}
		else {
			return [plain, null];
		}
	}
}

module.exports = {
	WikaNode,
	CrowdParser, InlineParser, PrefixParser,
	PlainText,
	WikaParser
};
