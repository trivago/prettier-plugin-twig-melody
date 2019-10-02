const prettier = require("prettier");
const { group, softline, join } = prettier.doc.builders;
const { Node } = require("melody-types");
const { isWhitespaceOnly } = require("../util");

const isWhitespaceNode = node => {
    debugger;
    return (
        Node.isPrintTextStatement(node) && isWhitespaceOnly(node.value.value)
    );
};

const preprocessChildren = children => {
    if (!Array.isArray(children)) {
        return children;
    }
    const result = [];
    children.forEach((child, index) => {
        const isFirstOrLast = index === 0 || index === children.length - 1;
        // Remove initial whitespace
        debugger;
        if (isFirstOrLast && isWhitespaceNode(child)) {
            return;
        }

        result.push(child);
    });
    return result;
};

const p = (node, path, print) => {
    node.expressions = preprocessChildren(node.expressions);
    const mappedExpressions = path.map(print, "expressions");

    return group(join(softline, mappedExpressions));
    // From HTML parser: return concat(group(path.map(print, "expressions")), hardline);
};

module.exports = {
    printSequenceExpression: p
};
