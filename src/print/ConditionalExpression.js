const prettier = require("prettier");
const { line, indent, group } = prettier.doc.builders;
const {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    wrapExpressionIfNeeded,
} = require("../util");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;

    const rest = [line, "?"];
    if (node.consequent) {
        rest.push([" ", path.call(print, "consequent")]);
    }
    if (node.alternate) {
        rest.push(line, ": ", path.call(print, "alternate"));
    }
    const parts = [path.call(print, "test"), indent(rest)];
    wrapExpressionIfNeeded(path, parts, node);

    return group(parts);
};

module.exports = {
    printConditionalExpression: p,
};
