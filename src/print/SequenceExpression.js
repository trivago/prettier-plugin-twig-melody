const prettier = require("prettier");
const { hardline } = prettier.doc.builders;
const {
    removeSurroundingWhitespace,
    printChildGroups,
    isRootNode,
    STRING_NEEDS_QUOTES,
} = require("../util");

const p = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = false;
    node.expressions = removeSurroundingWhitespace(node.expressions);
    const items = printChildGroups(node, path, print, "expressions");
    if (isRootNode(path)) {
        return [...items, hardline];
    }
    return items;
};

module.exports = {
    printSequenceExpression: p,
};
