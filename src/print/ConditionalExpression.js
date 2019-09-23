const prettier = require("prettier");
const { concat, line, indent, group } = prettier.doc.builders;

const p = (node, path, print) => {
    const rest = [line, "? ", path.call(print, "consequent")];
    if (node.alternate) {
        rest.push(line, ": ", path.call(print, "alternate"));
    }
    const parts = [path.call(print, "test"), indent(concat(rest))];

    return group(concat(parts));
};

module.exports = {
    printConditionalExpression: p
};
