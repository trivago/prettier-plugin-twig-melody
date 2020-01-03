const prettier = require("prettier");
const { group, concat, softline, line, indent, join } = prettier.doc.builders;
const {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    wrapExpressionIfNeeded
} = require("../util");
const { Node } = require("melody-types");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;
    const mappedArguments = path.map(print, "arguments");
    const parts = [path.call(print, "callee"), "("];
    if (node.arguments.length === 0) {
        parts.push(")");
    } else if (
        node.arguments.length === 1 &&
        Node.isObjectExpression(node.arguments[0])
    ) {
        // Optimization: No line break between "(" and "{" if
        // there is exactly one object parameter
        parts.push(mappedArguments[0], ")");
    } else {
        parts.push(
            indent(
                concat([softline, join(concat([",", line]), mappedArguments)])
            ),
            softline,
            ")"
        );
    }

    wrapExpressionIfNeeded(path, parts, node);

    return group(concat(parts));
};

module.exports = {
    printCallExpression: p
};
