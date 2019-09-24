const { needsQuotedStringLiterals, findParentNode } = require("../util");

const p = (node, path, print, options) => {
    // The parent node of this StringLiteral is 2 or more positions
    // up in the stack. If it is some kind of Expression,
    // we have to put quotes around the value.
    const parentNode = findParentNode(path);
    if (parentNode) {
        if (needsQuotedStringLiterals(parentNode)) {
            return '"' + node.value + '"';
        }
    }
    return node.value;
};

module.exports = {
    printStringLiteral: p
};
