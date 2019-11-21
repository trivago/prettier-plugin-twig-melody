const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const { STRING_NEEDS_QUOTES } = require("../util");

const p = (node, path, print, options) => {
    node[STRING_NEEDS_QUOTES] = false;
    const parts = [];
    if (node.computed) {
        parts.push("(");
    }
    parts.push(path.call(print, "key"));
    if (node.computed) {
        parts.push(")");
    }
    parts.push(": ");
    node[STRING_NEEDS_QUOTES] = true;
    parts.push(path.call(print, "value"));
    return concat(parts);
};

module.exports = {
    printObjectProperty: p
};
