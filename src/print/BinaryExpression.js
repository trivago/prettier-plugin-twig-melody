const prettier = require("prettier");
const { group, join, concat, line } = prettier.doc.builders;
const { Node } = require("melody-types");
const {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    INSIDE_OF_STRING,
    wrapExpressionIfNeeded,
    quoteChar
} = require("../util");

const printOneOperand = (node, path, print, nodePath) => {
    const shouldPrintParentheses = Node.isFilterExpression(node.right);

    return concat([
        line,
        node.operator,
        " ",
        shouldPrintParentheses ? "(" : "",
        path.call(print, ...nodePath, "right"),
        shouldPrintParentheses ? ")" : ""
    ]);
};

const printInterpolatedString = (node, path, print, options) => {
    node[STRING_NEEDS_QUOTES] = false;
    node[INSIDE_OF_STRING] = true;

    const printedFragments = [quoteChar(options)];
    let currentNode = node;
    const currentPath = [];
    while (Node.isBinaryConcatExpression(currentNode)) {
        printedFragments.unshift(path.call(print, ...currentPath, "right"));
        currentPath.push("left");
        currentNode = currentNode.left;
    }
    printedFragments.unshift(path.call(print, ...currentPath));
    printedFragments.unshift(quoteChar(options));
    return concat(printedFragments);
};

const printBinaryExpression = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;

    let currentNode = node;
    const pathToFinalLeftHandSide = ["left"];
    const binaryExpressions = [printOneOperand(node, path, print, [])];

    // Here, we do not do the usual recursion using path.call(), but
    // instead traverse the chain of BinaryExpressions ourselves (in
    // case there are multiple chained BinaryExpressions, that is).
    // Reason: For a proper layout like this
    // cond1 or
    // cond2 or
    // cond3 or
    // cond4
    // we need all the individual binary expressions in one group. This
    // can only be achieved by collecting them manually in the top-level
    // BinaryExpression node.
    while (Node.isBinaryExpression(currentNode.left)) {
        binaryExpressions.unshift(
            printOneOperand(
                currentNode.left,
                path,
                print,
                pathToFinalLeftHandSide
            )
        );
        pathToFinalLeftHandSide.push("left"); // Go one level deeper
        currentNode = currentNode.left;
        currentNode[EXPRESSION_NEEDED] = false;
        currentNode[STRING_NEEDS_QUOTES] = true;
    }
    binaryExpressions.unshift(path.call(print, ...pathToFinalLeftHandSide));

    wrapExpressionIfNeeded(path, binaryExpressions, node);

    return group(join("", binaryExpressions));
};

const p = (node, path, print, options) => {
    if (Node.isBinaryConcatExpression(node) && node.wasImplicitConcatenation) {
        return printInterpolatedString(node, path, print, options);
    }
    return printBinaryExpression(node, path, print);
};

module.exports = {
    printBinaryExpression: p
};
