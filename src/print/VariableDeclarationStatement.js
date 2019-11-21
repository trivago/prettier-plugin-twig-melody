const prettier = require("prettier");
const { group, concat, line, indent } = prettier.doc.builders;
const { STRING_NEEDS_QUOTES } = require("../util");

const p = (node, path, print) => {
    const printedName = path.call(print, "name");
    node[STRING_NEEDS_QUOTES] = true;
    const printedValue = path.call(print, "value");
    return group(
        concat([printedName, " =", indent(concat([line, printedValue]))])
    );
};

module.exports = {
    printVariableDeclarationStatement: p
};
