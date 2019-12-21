const prettier = require("prettier");
const { group, join, concat, line, indent } = prettier.doc.builders;
const { Node } = require("melody-types");
const {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    INSIDE_OF_STRING,
    wrapExpressionIfNeeded,
    firstValueInAncestorChain,
    quoteChar
} = require("../util");
const { extension: coreExtension } = require("melody-extension-core");
const ALREADY_INDENTED = Symbol("ALREADY_INDENTED");

const operatorPrecedence = coreExtension.binaryOperators.reduce((acc, curr) => {
    acc[curr.text] = curr.precedence;
    return acc;
}, {});

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

const printBinaryExpression2 = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;

    const isBinaryLeft = Node.isBinaryExpression(node.left);
    const isBinaryRight = Node.isBinaryExpression(node.right);

    const alreadyIndented = firstValueInAncestorChain(
        path,
        ALREADY_INDENTED,
        false
    );
    if (!alreadyIndented && isBinaryRight) {
        node.right[ALREADY_INDENTED] = true;
    }

    const precedence = operatorPrecedence[node.operator];
    const leftPrecedence = isBinaryLeft
        ? operatorPrecedence[node.left.operator]
        : Number.MAX_SAFE_INTEGER;
    const rightPrecedence = isBinaryRight
        ? operatorPrecedence[node.right.operator]
        : Number.MAX_SAFE_INTEGER;
    const printedLeft = path.call(print, "left");
    const printedRight = path.call(print, "right");

    const parts = [];
    const leftNeedsParens =
        leftPrecedence < precedence || Node.isFilterExpression(node.left);
    const rightNeedsParens =
        rightPrecedence < precedence || Node.isFilterExpression(node.right);
    if (leftNeedsParens) {
        parts.push("(");
    }
    parts.push(printedLeft);
    if (leftNeedsParens) {
        parts.push(")");
    }
    const potentiallyIndented = [line, node.operator, " "];
    if (rightNeedsParens) {
        potentiallyIndented.push("(");
    }
    potentiallyIndented.push(printedRight);
    if (rightNeedsParens) {
        potentiallyIndented.push(")");
    }
    const rightHandSide = alreadyIndented
        ? concat(potentiallyIndented)
        : indent(concat(potentiallyIndented));
    return group(concat([...parts, rightHandSide]));
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
    return printBinaryExpression2(node, path, print);
};

module.exports = {
    printBinaryExpression: p
};
