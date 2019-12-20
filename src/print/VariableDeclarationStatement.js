const prettier = require("prettier");
const { group, concat, line, indent } = prettier.doc.builders;
const { STRING_NEEDS_QUOTES } = require("../util");
const { Node } = require("melody-types");

const p = (node, path, print) => {
    const printedName = path.call(print, "name");
    node[STRING_NEEDS_QUOTES] = true;
    const printedValue = path.call(print, "value");
    const space =
        Node.isObjectExpression(node.value) ||
        Node.isBinaryExpression(node.value) ||
        Node.isConditionalExpression(node.value)
            ? " "
            : line;
    return group(
        concat([printedName, " =", indent(concat([space, printedValue]))])
    );
};

module.exports = {
    printVariableDeclarationStatement: p
};
