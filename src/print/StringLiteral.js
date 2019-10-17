const {
    needsQuotedStringLiterals,
    findParentNode,
    quoteChar,
    STRING_NEEDS_QUOTES
} = require("../util");

const p = (node, path, print, options) => {
    // The parent node of this StringLiteral is 2 or more positions
    // up in the stack. If it is some kind of Expression,
    // we have to put quotes around the value.
    const parentNode = findParentNode(path);
    if (parentNode) {
        if (
            needsQuotedStringLiterals(parentNode) ||
            parentNode[STRING_NEEDS_QUOTES] === true
        ) {
            const quote = quoteChar(options);
            return quote + node.value + quote;
        }
    }
    return node.value;
};

module.exports = {
    printStringLiteral: p
};
