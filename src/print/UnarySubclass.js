const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const { Node } = require("melody-types");

const p = (node, path, print) => {
    const parts = [];
    if (node.operator === "not" && !Node.isTestExpression(node.argument)) {
        parts.push("not ");
    }
    parts.push(path.call(print, "argument"));
    return concat(parts);
};

module.exports = {
    printUnarySubclass: p
};
