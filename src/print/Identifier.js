const prettier = require("prettier");
const { group, concat } = prettier.doc.builders;
const { EXPRESSION_NEEDED, wrapExpressionIfNeeded } = require("../util");

const p = (node, path) => {
    node[EXPRESSION_NEEDED] = false;

    const parts = [node.name];
    wrapExpressionIfNeeded(path, parts);
    return group(concat(parts));
};

module.exports = {
    printIdentifier: p
};
