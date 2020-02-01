const prettier = require("prettier");
const { concat, line, indent } = prettier.doc.builders;
const { STRING_NEEDS_QUOTES, isContractableNodeType } = require("../util");

const p = (node, path, print) => {
    const printedName = path.call(print, "name");
    node[STRING_NEEDS_QUOTES] = true;
    const printedValue = path.call(print, "value");
    const shouldCondenseLayout = isContractableNodeType(node.value);
    const rightHandSide = shouldCondenseLayout
        ? concat([" ", printedValue])
        : indent(concat([line, printedValue]));

    // We are explicitly not returning a group here, because
    // a VariableDeclarationStatement is - currently - always
    // embedded in a group created by SetStatement.
    return concat([printedName, " =", rightHandSide]);
};

module.exports = {
    printVariableDeclarationStatement: p
};
