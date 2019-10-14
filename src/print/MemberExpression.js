const prettier = require("prettier");
const { concat } = prettier.doc.builders;

const p = (node, path, print) => {
    const parts = [path.call(print, "object")];
    parts.push(node.computed ? "[" : ".");
    parts.push(path.call(print, "property"));
    if (node.computed) {
        parts.push("]");
    }
    return concat(parts);
};

module.exports = {
    printMemberExpression: p
};
