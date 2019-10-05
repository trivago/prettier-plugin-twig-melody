const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const { removeSurroundingWhitespace, printChildGroups } = require("../util");

const p = (node, path, print) => {
    node.expressions = removeSurroundingWhitespace(node.expressions);
    const items = printChildGroups(node, path, print, "expressions");
    return concat(items);
};

module.exports = {
    printSequenceExpression: p
};
