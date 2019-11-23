const prettier = require("prettier");
const { group, concat, softline, line, indent, join } = prettier.doc.builders;
const {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    wrapExpressionIfNeeded
} = require("../util");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;
    const mappedArguments = path.map(print, "arguments");
    const parts = [
        path.call(print, "callee"),
        "(",
        indent(concat([softline, join(concat([",", line]), mappedArguments)])),
        softline,
        ")"
    ];

    wrapExpressionIfNeeded(path, parts);

    return group(concat(parts));
};

module.exports = {
    printCallExpression: p
};
