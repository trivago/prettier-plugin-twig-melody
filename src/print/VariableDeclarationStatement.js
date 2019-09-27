const prettier = require("prettier");
const { group, concat, line, indent } = prettier.doc.builders;

const p = (node, path, print) => {
    const printedName = path.call(print, "name");
    const printedValue = path.call(print, "value");
    return group(
        concat([printedName, " =", indent(concat([line, printedValue]))])
    );
};

module.exports = {
    printVariableDeclarationStatement: p
};
