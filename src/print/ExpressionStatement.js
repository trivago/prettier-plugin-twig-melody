const prettier = require("prettier");
const { concat, group, indent, line } = prettier.doc.builders;

const p = (node, path, print) => {
    return group(
        concat([
            "{{",
            indent(concat([line, path.call(print, "value")])),
            line,
            "}}"
        ])
    );
};

module.exports = {
    printExpressionStatement: p
};
