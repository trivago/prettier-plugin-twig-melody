const prettier = require("prettier");
const { group, concat, line, indent, join } = prettier.doc.builders;
const { EXPRESSION_NEEDED, wrapExpressionIfNeeded } = require("../util");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    const mappedElements = path.map(print, "properties");
    const indentedContent = concat([
        line,
        join(concat([",", line]), mappedElements)
    ]);

    const parts = ["{", indent(indentedContent), line, "}"];
    wrapExpressionIfNeeded(path, parts);

    return group(concat(parts));
};

module.exports = {
    printObjectExpression: p
};
