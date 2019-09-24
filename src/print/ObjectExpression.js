const prettier = require("prettier");
const { group, concat, line, indent, join } = prettier.doc.builders;

const p = (node, path, print) => {
    const mappedElements = path.map(print, "properties");
    const indentedContent = concat([
        line,
        join(concat([",", line]), mappedElements)
    ]);

    return group(concat(["{", indent(indentedContent), line, "}"]));
};

module.exports = {
    printObjectExpression: p
};
