const prettier = require("prettier");
const { group, concat, softline, line, indent, join } = prettier.doc.builders;
const { STRING_NEEDS_QUOTES } = require("../util");

const p = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = true;
    const mappedElements = path.map(print, "elements");
    const indentedContent = concat([
        softline,
        join(concat([",", line]), mappedElements)
    ]);

    return group(concat(["[", indent(indentedContent), softline, "]"]));
};

module.exports = {
    printArrayExpression: p
};
