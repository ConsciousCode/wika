'use strict';

const {InlineParser, WikaNode} = require("./parse");

class Italic extends WikaNode {
	constructor(content) {
		super();
		this.content = content;
	}
}
