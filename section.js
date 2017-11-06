'use strict';

const {WikaNode, PrefixParser} = require("./parse");

class Section extends WikaNode {
	constructor(level, title, content=[], subsections=[]) {
		super();
		
		this.level = level;
		this.title = title;
		this.content = content;
		this.subsections = subsections;
	}
	
	toString() {
		let h = '='.repeat(this.level);
		
		return `${h}${this.content}${h}\n` +
			`${this.content.join("")}` +
			`${this.subsections.join("\n")}`;
	}
}

class Article extends Section {
	constructor(title, content, subsections) {
		super(0, title, content, subsections);
	}
	
	toString() {
		return (this.title?
			`<<<ARTICLE: ${this.title}>>>` : "<<<ARTICLE>>>") +
			`\n${this.content.join("")}` +
			`\n${this.subsections.join("\n")}`;
	}
}

const SECTION = /^(={1,6})(.+?)(={1,6})$/gm;
class SectionParser extends PrefixParser {
	match(p) {
		return !!p.match(SECTION);
	}
	
	parse(p) {
		let m = p.match(SECTION);
		
		let
			level = Math.min(m[1].length, m[3].length),
			title = m[0].slice(level, -level);
		
		let content = [], subsections = [];
		
		// Sections consume all subsections that come after them
		while(p.pos < p.src.length) {
			let [plain, item] = p.parseNext();
			
			if(plain) {
				content.push(plain);
			}
			
			if(item) {
				if(item instanceof Section) {
					if(item.level <= level) {
						break;
					}
					
					subsections.push(item);
				}
				else {
					content.push(item);
				}
			}
		}
		
		return new Section(level, title, content, subsections);
	}
}

/**
 * Parses an article in a similar manner to a section, with content and
 *  subsections.
**/
class ArticleParser extends PrefixParser {
	match(p) {
		// The article parser should be used exactly once at the start of
		//  arsing.
		if(p.data.article) {
			return false;
		}
		else {
			return p.data.article = true;
		}
	}
	
	parse(p) {
		let content = [], subsections = [];
		
		// This will consume the entire article.
		while(p.pos < p.src.length) {
			// Can't use parseInto() because we're building more than one list
			let [plain, item] = p.parseNext();
			
			if(plain) {
				content.push(plain);
			}
			
			if(item) {
				if(item instanceof Section) {
					subsections.push(item);
				}
				else {
					content.push(item);
				}
			}
		}
		
		return new Article(p.context.title||"", content, subsections);
	}
}

module.exports = {
	Section, Article,
	SectionParser, ArticleParser
};
