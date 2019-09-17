const prettier = require("prettier");
const { group, concat, softline, indent, join } = prettier.doc.builders;

const p = (node, path, print) => {
    const mappedArguments = path.map(print, "arguments");
    return group(
        concat([
            node.callee.name,
            "(",
            softline,
            indent(join(concat[(",", softline)], mappedArguments)),
            softline,
            ")"
        ])
    );
};

module.exports = {
    printCallExpression: p
};
