const prettier = require("prettier");
const { group, concat, softline, line, indent, join } = prettier.doc.builders;

const p = (node, path, print) => {
    debugger;
    const mappedArguments = path.map(print, "arguments");
    return group(
        concat([
            node.callee.name,
            "(",
            softline,
            indent(join(concat([",", line]), mappedArguments)),
            softline,
            ")"
        ])
    );
};

module.exports = {
    printCallExpression: p
};
