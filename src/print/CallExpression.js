const prettier = require("prettier");
const { group, concat, softline, line, indent, join } = prettier.doc.builders;

const p = (node, path, print) => {
    const mappedArguments = path.map(print, "arguments");

    return group(
        concat([
            path.call(print, "callee"),
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
