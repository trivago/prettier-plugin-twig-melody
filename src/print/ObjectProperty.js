const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const { isValidIdentifierName, STRING_NEEDS_QUOTES } = require("../util");
const { Node } = require("melody-types");

const p = (node, path, print, options) => {
    node[STRING_NEEDS_QUOTES] =
        !node.computed &&
        Node.isStringLiteral(node.key) &&
        !isValidIdentifierName(node.key.value);
    const shouldPrintKeyAsString = node.key.wasImplicitConcatenation;
    const needsParentheses = node.computed && !shouldPrintKeyAsString;
    const parts = [];
    if (needsParentheses) {
        parts.push("(");
    }
    parts.push(path.call(print, "key"));
    if (needsParentheses) {
        parts.push(")");
    }
    parts.push(": ");
    node[STRING_NEEDS_QUOTES] = true;
    parts.push(path.call(print, "value"));
    return concat(parts);
};

module.exports = {
    printObjectProperty: p
};
