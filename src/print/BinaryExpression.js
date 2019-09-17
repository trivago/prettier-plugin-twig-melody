const prettier = require("prettier");
const { group, concat, line } = prettier.doc.builders;

const p = (node, path, print) => {
    return group(
        concat([
            path.call(print, "left"),
            " ",
            node.operator,
            line,
            path.call(print, "right")
        ])
    );
};

module.exports = {
    printBinaryExpression: p
};
