const prettier = require("prettier");
const { group, concat, line, softline, indent } = prettier.doc.builders;
const { Node } = require("melody-types");
const {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    INSIDE_OF_STRING,
    firstValueInAncestorChain,
    quoteChar
} = require("../util");
const { extension: coreExtension } = require("melody-extension-core");
const ALREADY_INDENTED = Symbol("ALREADY_INDENTED");
const IS_ROOT_BINARY_EXPRESSION = Symbol("IS_ROOT_BINARY_EXPRESSION");
const OPERATOR_PRECEDENCE = Symbol("OPERATOR_PRECEDENCE");
const NO_WHITESPACE_AROUND = [".."];

const operatorPrecedence = coreExtension.binaryOperators.reduce((acc, curr) => {
    acc[curr.text] = curr.precedence;
    return acc;
}, {});

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

const operatorNeedsSpaces = operator => {
    return NO_WHITESPACE_AROUND.indexOf(operator) < 0;
};

const printBinaryExpression = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;

    const isBinaryLeft = Node.isBinaryExpression(node.left);
    const isBinaryRight = Node.isBinaryExpression(node.right);
    const isLogicalOperator = ["and", "or", "not"].indexOf(node.operator) > -1;
    const whitespaceAroundOperator = operatorNeedsSpaces(node.operator);

    const alreadyIndented = firstValueInAncestorChain(
        path,
        ALREADY_INDENTED,
        false
    );
    if (!alreadyIndented && isBinaryRight) {
        node.right[ALREADY_INDENTED] = true;
    }
    const foundRootAbove = firstValueInAncestorChain(
        path,
        IS_ROOT_BINARY_EXPRESSION,
        false
    );
    if (!foundRootAbove) {
        node[IS_ROOT_BINARY_EXPRESSION] = true;
    }
    const parentOperator = foundRootAbove
        ? firstValueInAncestorChain(path, "operator")
        : "";

    const parentPrecedence = foundRootAbove
        ? firstValueInAncestorChain(path, OPERATOR_PRECEDENCE, -1)
        : -1;
    const ownPrecedence = operatorPrecedence[node.operator];
    node[OPERATOR_PRECEDENCE] = ownPrecedence;

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
        leftPrecedence < ownPrecedence || Node.isFilterExpression(node.left);
    const rightNeedsParens =
        rightPrecedence < ownPrecedence || Node.isFilterExpression(node.right);
    if (leftNeedsParens) {
        parts.push("(");
    }
    parts.push(printedLeft);
    if (leftNeedsParens) {
        parts.push(")");
    }
    const potentiallyIndented = [
        whitespaceAroundOperator ? line : softline,
        node.operator,
        whitespaceAroundOperator ? " " : ""
    ];
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
    const result = concat([...parts, rightHandSide]);

    return !foundRootAbove ||
        !isLogicalOperator ||
        (isLogicalOperator && ownPrecedence < parentPrecedence) ||
        (isLogicalOperator && node.operator !== parentOperator)
        ? group(result)
        : result;
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
