const prettier = require("prettier");
const { group, softline, join } = prettier.doc.builders;
const { preprocessChildren } = require("../util");

const p = (node, path, print) => {
    node.expressions = preprocessChildren(node.expressions);
    const mappedExpressions = path.map(print, "expressions");

    return group(join(softline, mappedExpressions));

    // From HTML parser:
    // return concat([group(concat(path.map(print, "expressions"))), hardline]);
};

module.exports = {
    printSequenceExpression: p
};
