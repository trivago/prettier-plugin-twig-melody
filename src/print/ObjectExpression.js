const prettier = require("prettier");
const { group, concat, softline, line, indent, join } = prettier.doc.builders;

const p = (node, path, print) => {
    const mappedElements = path.map(print, "properties");
    const indentedContent = concat([
        softline,
        join(concat([",", line]), mappedElements)
    ]);

    return group(concat(["{", indent(indentedContent), softline, "}"]));
};

module.exports = {
    printObjectExpression: p
};
