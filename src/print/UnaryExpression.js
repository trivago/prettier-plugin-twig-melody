const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const {
    EXPRESSION_NEEDED,
    needsExpressionEnvironment,
    wrapInEnvironment
} = require("../util");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    const parts = [node.operator, path.call(print, "argument")];
    if (needsExpressionEnvironment(path)) {
        wrapInEnvironment(parts);
    }
    return concat(parts);
};

module.exports = {
    printUnaryExpression: p
};
