const prettier = require("prettier");
const { group, concat, softline, line, indent, join } = prettier.doc.builders;
const {
    EXPRESSION_NEEDED,
    needsExpressionEnvironment,
    wrapInEnvironment
} = require("../util");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    const mappedArguments = path.map(print, "arguments");
    const parts = [
        path.call(print, "callee"),
        "(",
        indent(concat([softline, join(concat([",", line]), mappedArguments)])),
        softline,
        ")"
    ];

    if (needsExpressionEnvironment(path)) {
        wrapInEnvironment(parts);
    }

    return group(concat(parts));
};

module.exports = {
    printCallExpression: p
};
