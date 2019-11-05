const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const { quoteChar } = require("../util");
const { Node } = require("melody-types");

const p = (node, path, print, options) => {
    const parts = [];
    if (node.computed) {
        parts.push("(");
    } else if (Node.isStringLiteral(node.key)) {
        parts.push(quoteChar(options));
    }
    parts.push(path.call(print, "key"));
    if (node.computed) {
        parts.push(")");
    } else if (Node.isStringLiteral(node.key)) {
        parts.push(quoteChar(options));
    }
    parts.push(": ");
    if (Node.isStringLiteral(node.value)) {
        parts.push(quoteChar(options));
    }
    parts.push(path.call(print, "value"));
    if (Node.isStringLiteral(node.value)) {
        parts.push(quoteChar(options));
    }
    return concat(parts);
};

module.exports = {
    printObjectProperty: p
};
