const prettier = require("prettier");
const { concat } = prettier.doc.builders;

const p = (node, path, print) => {
    const printedName = path.call(print, "name");
    const printedValue = path.call(print, "value");
    return concat([printedName, " = ", printedValue]);
};

module.exports = {
    printNamedArgumentExpression: p
};
