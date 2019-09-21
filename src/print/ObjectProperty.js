const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const { quoteChar } = require("../util");
const { Node } = require("melody-types");

const p = (node, path, print) => {
    const parts = [quoteChar(), path.call(print, "key"), quoteChar(), ": "];
    if (Node.isStringLiteral(node.value)) {
        parts.push(quoteChar());
    }
    parts.push(path.call(print, "value"));
    if (Node.isStringLiteral(node.value)) {
        parts.push(quoteChar());
    }
    return concat(parts);
};

module.exports = {
    printObjectProperty: p
};
