const { CharStream, Lexer, TokenStream, Parser } = require("melody-parser");
const { extension: coreExtension } = require("melody-extension-core");
const {
    getAdditionalMelodyExtensions,
    getPluginPathsFromOptions
} = require("./util");

const ORIGINAL_SOURCE = Symbol("ORIGINAL_SOURCE");

const createConfiguredLexer = (code, ...extensions) => {
    const lexer = new Lexer(new CharStream(code));
    for (const extension of extensions) {
        if (extension.unaryOperators) {
            lexer.addOperators(...extension.unaryOperators.map(op => op.text));
        }
        if (extension.binaryOperators) {
            lexer.addOperators(...extension.binaryOperators.map(op => op.text));
        }
    }
    return lexer;
};

const applyParserExtensions = (parser, ...extensions) => {
    for (const extension of extensions) {
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
    }
};

const createConfiguredParser = (code, multiTagConfig, ...extensions) => {
    const parser = new Parser(
        new TokenStream(createConfiguredLexer(code, ...extensions), {
            ignoreWhitespace: true,
            ignoreComments: false,
            ignoreHtmlComments: false,
            applyWhitespaceTrimming: false
        }),
        {
            ignoreComments: false,
            ignoreHtmlComments: false,
            ignoreDeclarations: false,
            decodeEntities: false,
            multiTags: multiTagConfig,
            allowUnknownTags: true
        }
    );
    applyParserExtensions(parser, ...extensions);
    return parser;
};

const getMultiTagConfig = (tagsCsvs = []) =>
    tagsCsvs.reduce((acc, curr) => {
        const tagNames = curr.split(",");
        acc[tagNames[0].trim()] = tagNames.slice(1).map(s => s.trim());
        return acc;
    }, {});

const parse = (text, parsers, options) => {
    const pluginPaths = getPluginPathsFromOptions(options);
    const multiTagConfig = getMultiTagConfig(options.twigMultiTags || []);
    const extensions = [
        coreExtension,
        ...getAdditionalMelodyExtensions(pluginPaths)
    ];
    const parser = createConfiguredParser(text, multiTagConfig, ...extensions);
    const ast = parser.parse();
    ast[ORIGINAL_SOURCE] = text;
    return ast;
};

module.exports = {
    parse,
    ORIGINAL_SOURCE
};
