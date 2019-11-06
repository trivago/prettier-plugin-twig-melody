const prettier = require("prettier");
const { concat, hardline } = prettier.doc.builders;
const {
    removeSurroundingWhitespace,
    printChildGroups,
    isRootNode
} = require("../util");

const p = (node, path, print) => {
    node.expressions = removeSurroundingWhitespace(node.expressions);
    const items = printChildGroups(node, path, print, "expressions");
    if (isRootNode(path)) {
        return concat([...items, hardline]);
    }
    return concat(items);
};

module.exports = {
    printSequenceExpression: p
};
