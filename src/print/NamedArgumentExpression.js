const prettier = require("prettier");
const { STRING_NEEDS_QUOTES } = require("../util");

const p = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = true;
    const printedName = path.call(print, "name");
    const printedValue = path.call(print, "value");
    return [printedName, " = ", printedValue];
};

module.exports = {
    printNamedArgumentExpression: p,
};
