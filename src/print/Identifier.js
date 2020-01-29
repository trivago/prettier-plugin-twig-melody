const prettier = require("prettier");
const { group, concat } = prettier.doc.builders;
const { EXPRESSION_NEEDED, wrapExpressionIfNeeded } = require("../util");

const p = (node, path) => {
    node[EXPRESSION_NEEDED] = false;

    const parts = [node.name];
    wrapExpressionIfNeeded(path, parts, node);
    const result = concat(parts);
    return parts.length === 1 ? result : group(result);
};

module.exports = {
    printIdentifier: p
};
