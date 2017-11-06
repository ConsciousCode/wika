'use strict';

const
	{WikaNode, InlineParser} = require("./parse");

const NOWIKI = /<.*?nowiki.*?>.*?<\s*\/.*?nowiki.*?>/gmi;

/**
 * Preprocesses templates as a separate step.
**/
class TemplatePreProcessor {
	constructor(src, tpl, tvar) {
		this.src = src;
		this.pos = 0;
		this.tpl = tpl;
		this.tvar = tvar;
	}
	
	isNext(s) {
		return this.src.indexOf(s) === this.pos;
	}
	
	/**
	 * Parse non-template text, including nowiki sections.
	**/
	parse_text() {
		let start = this.pos, end = start;
		
		while(end < this.src.length) {
			let x = this.src.indexOf("{{", end);
			if(x === -1) {
				// If there's no more templates, we're done.
				break;
			}
			
			// Hit a template, no more text
			if(x === end) {
				return this.src.slice(start, x);
			}
			
			// Try to eat a nowiki block
			// This can't use match() because it doesn't care if nowiki is
			//  next.
			NOWIKI.lastIndex = end;
			let m = NOWIKI.exec(this.src);
			if(m) {
				end = NOWIKI.lastIndex;
			}
			else {
				// Must keep incrementing
				++end;
			}
		}
		
		return this.src.slice(start);
	}
	
	/**
	 * Parse the inner part of a template/var and return the contents
	 *  after processing inner templates.
	**/
	async parse_tpl_params(END) {
		let out = [];
		while(this.pos < this.src.length) {
			let
				end = this.src.indexOf(END, this.pos),
				tt = this.parse_text();
			
			if(this.pos + tt.length >= end) {
				out.push(this.src.slice(this.pos, end));
				this.pos = end;
				break;
			}
			else {
				out.push(tt);
			}
			
			let t = await this.parse_any_tpl();
			while(t) {
				out.push(...t);
				t = await this.parse_any_tpl();
			}
		}
		
		return out.join("");
	}
	
	async parse_var() {
		if(this.isNext("{{{")) {
			this.pos += 3;
			
			let p = await this.parse_tpl_params("}}}");
			
			if(this.isNext("}}}")) {
				this.pos += 3;
				return await this.tvar(p.split("|")) + "";
			}
			else {
				return [p];
			}
		}
		else {
			return null;
		}
	}
	
	async parse_tpl() {
		if(this.isNext("{{")) {
			this.pos += 2;
			
			let p = await this.parse_tpl_params("}}");
			
			if(this.isNext("}}")) {
				this.pos += 2;
				return await this.tpl(p.split("|"));
			}
			else {
				return ["{{", p];
			}
		}
		else {
			return null;
		}
	}
	
	async parse_any_tpl() {
		return await this.parse_var() || await this.parse_tpl();
	}
	
	async parse() {
		let out = [];
		while(this.pos < this.src.length) {
			let txt = this.parse_text();
			if(txt) {
				out.push(txt);
				this.pos += txt.length;
			}
			
			let tpl = await this.parse_any_tpl();
			while(tpl) {
				out.push(...tpl);
				tpl = await this.parse_any_tpl();
			}
		}
		
		return out.join("");
	}
}

class Template extends WikaNode {
	constructor(params) {
		super();
		this.params = params;
	}
	
	toString() {
		return `{{${this.params.join("|")}}}`;
	}
}

class TemplateVar extends WikaNode {
	constructor(params) {
		super();
		this.params = params;
	}
	
	toString() {
		return `{{{${this.params.join("|")}}}}`;
	}
}

/**
 * Parses unprocessed templates as items.
**/
class TemplateParser extends InlineParser {
	next(p) {
		return p.src.indexOf("{{", p.pos);
	}
	
	parse(p) {
		let rt = p.src.indexOf("}}", p.pos)
		
		let t = new Template(p.src.slice(p.pos + 2, rt).split("|"));
		
		p.pos = rt + 2;
		return t;
	}
}

module.exports = {
	Template, TemplateVar,
	TemplatePreProcessor, TemplateParser
};
