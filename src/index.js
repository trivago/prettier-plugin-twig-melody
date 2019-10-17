"use strict";

const { print } = require("./printer.js");
const { parse } = require("./parser.js");
const symbols = require("./util/publicSymbols.js");

const languages = [
    {
        name: "melody",
        parsers: ["melody"],
        group: "Melody",
        tmScope: "melody.twig",
        aceMode: "html",
        codemirrorMode: "clike",
        codemirrorMimeType: "text/melody-twig",
        extensions: [".melody.twig", ".html.twig", ".twig"],
        linguistLanguageId: 0,
        vscodeLanguageIds: ["twig"]
    }
];

function hasPragma(/* text */) {
    return false;
}

function locStart(/* node */) {
    return -1;
}

function locEnd(/* node */) {
    return -1;
}

const parsers = {
    melody: {
        parse,
        astFormat: "melody",
        hasPragma,
        locStart,
        locEnd
    }
};

function canAttachComment(node) {
    return node.ast_type && node.ast_type !== "comment";
}

function printComment(commentPath) {
    const comment = commentPath.getValue();

    switch (comment.ast_type) {
        case "comment":
            return comment.value;
        default:
            throw new Error("Not a comment: " + JSON.stringify(comment));
    }
}

function clean(ast, newObj) {
    delete newObj.lineno;
    delete newObj.col_offset;
}

const printers = {
    melody: {
        print,
        // hasPrettierIgnore,
        printComment,
        canAttachComment,
        massageAstNode: clean,
        willPrintOwnComments: () => true
    }
};

const options = {
    twigMelodyPlugins: {
        type: "array",
        category: "Global",
        default: [],
        description:
            "Provide additional plugins for Melody. Relative file path from the project root."
    }
};

const pluginExports = {
    languages,
    printers,
    parsers,
    options
};
const combinedExports = Object.assign({}, pluginExports, symbols);

// This exports defines the Prettier plugin
// See https://github.com/prettier/prettier/blob/master/docs/plugins.md
module.exports = combinedExports;
