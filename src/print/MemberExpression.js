const prettier = require("prettier");
const { concat, group } = prettier.doc.builders;
const {
    EXPRESSION_NEEDED,
    needsExpressionEnvironment,
    wrapInEnvironment
} = require("../util");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    const parts = [path.call(print, "object")];
    parts.push(node.computed ? "[" : ".");
    parts.push(path.call(print, "property"));
    if (node.computed) {
        parts.push("]");
    }
    if (needsExpressionEnvironment(path)) {
        wrapInEnvironment(parts);
    }
    return group(concat(parts));
};

module.exports = {
    printMemberExpression: p
};
