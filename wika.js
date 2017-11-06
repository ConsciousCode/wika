'use strict';

const {
	WikaNode,
	CrowdParser, InlineParser, PrefixParser,
	PlainText,
	WikaParser
} = require("./parse");

const {
	Template, TemplatePreProcessor, TemplateParser
} = require("./template");

const {
	Section, Article,
	SectionParser, ArticleParser
} = require("./section");

const {Paragraph, ParagraphParser} = require("./paragraph");

const {Link, LinkParser} = require("./link");

const parser = new WikaParser([
	new ArticleParser(), new SectionParser(),
	new ParagraphParser()
], [
	new LinkParser(), new TemplateParser()
]);

module.exports = {
	WikaNode,
	CrowdParser, InlineParser, PrefixParser,
	PlainText,
	WikaParser,
	
	Template, TemplatePreProcessor, TemplateParser,
	
	Section, Article,
	SectionParser, ArticleParser,
	
	Paragraph, ParagraphParser,
	Link, LinkParser,
	
	parser
};
