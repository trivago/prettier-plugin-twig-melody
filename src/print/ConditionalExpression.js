const prettier = require("prettier");
const { concat, line, indent, group } = prettier.doc.builders;
const {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    wrapExpressionIfNeeded
} = require("../util");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;

    const rest = [line, "?"];
    if (node.consequent) {
        rest.push(concat([" ", path.call(print, "consequent")]));
    }
    if (node.alternate) {
        rest.push(line, ": ", path.call(print, "alternate"));
    }
    const parts = [path.call(print, "test"), indent(concat(rest))];
    wrapExpressionIfNeeded(path, parts, node);

    return group(concat(parts));
};

module.exports = {
    printConditionalExpression: p
};
