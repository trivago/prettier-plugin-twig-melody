const prettier = require("prettier");
const { concat, group } = prettier.doc.builders;
const {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    wrapExpressionIfNeeded
} = require("../util");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;
    const parts = [node.operator, path.call(print, "argument")];
    wrapExpressionIfNeeded(path, parts, node);
    return group(concat(parts));
};

module.exports = {
    printUnaryExpression: p
};
