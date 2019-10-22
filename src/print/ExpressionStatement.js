const prettier = require("prettier");
const { concat, group, indent, line } = prettier.doc.builders;
const { EXPRESSION_NEEDED } = require("../util");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
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
