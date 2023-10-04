const prettier = require("prettier");
const { group, softline, line, indent, join } = prettier.doc.builders;
const { STRING_NEEDS_QUOTES } = require("../util");

const p = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = true;
    const mappedElements = path.map(print, "elements");
    const indentedContent = [softline, join([",", line], mappedElements)];

    return group(["[", indent(indentedContent), softline, "]"]);
};

module.exports = {
    printArrayExpression: p,
};
