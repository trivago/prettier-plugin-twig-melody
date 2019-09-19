const { CharStream, Lexer, TokenStream, Parser } = require("melody-parser");
const { extension: coreExtension } = require("melody-extension-core");

const applyExtension = (parser, extension) => {
    if (extension.tags) {
        for (const tag of extension.tags) {
            parser.addTag(tag);
        }
    }
    if (extension.unaryOperators) {
        for (const op of extension.unaryOperators) {
            parser.addUnaryOperator(op);
        }
    }
    if (extension.binaryOperators) {
        for (const op of extension.binaryOperators) {
            parser.addBinaryOperator(op);
        }
    }
    if (extension.tests) {
        for (const test of extension.tests) {
            parser.addTest(test);
        }
    }
};

const configureParser = parser => {
    applyExtension(parser, coreExtension);
};

const parse = code => {
    const parser = new Parser(new TokenStream(new Lexer(new CharStream(code))));
    configureParser(parser);
    return parser.parse();
};

module.exports = {
    parse
};
