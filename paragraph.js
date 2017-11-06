'use strict';

const {WikaNode, PrefixParser} = require("./parse");

/**
 * Paragraphs group together blocks of text with newlines between them.
**/
class Paragraph extends WikaNode {
	constructor(content=[]) {
		super();
		this.content = content;
	}
	
	toString() {
		return this.content.join("")+"\n\n";
	}
}

const PARAGRAPH = /(^\s*?$)/gm;
class ParagraphParser extends PrefixParser {
	match(p) {
		// Paragraphs are a kind of catch-all, so they must be last
		//  in the parser list.
		return !p.data.paragraph;
	}
	
	parse(p) {
		// Prevent infinite recursion
		p.data.paragraph = true;
		
		let items = [], m;
		do {
			p.parseInto(items);
			m = p.match(PARAGRAPH);
		} while(p.pos < p.src.length && m && m.index !== p.pos);
		
		p.data.paragraph = false;
		return new Paragraph(items);
	}
}

module.exports = {
	Paragraph, ParagraphParser
};
