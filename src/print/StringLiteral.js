const prettier = require("prettier");
const { concat, indent, hardline } = prettier.doc.builders;
const { isExpressionType } = require("../util");

const p = (node, path, print, options) => {
    // The parent node of this StringLiteral is 2 positions
    // up in the stack. If it is some kind of Expression,
    // we have to put quotes around the value.
    const parentIndex = path.stack.length - 3; // -1 would be self
    if (parentIndex > 0) {
        const parentNode = path.stack[parentIndex];
        if (isExpressionType(parentNode)) {
            debugger;
            return '"' + node.value + '"';
        }
    }
    return node.value;
};

module.exports = {
    printStringLiteral: p
};
