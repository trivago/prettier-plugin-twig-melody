const prettier = require("prettier");
const { group, concat, line, softline, indent } = prettier.doc.builders;
const { Node } = require("melody-types");
const {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    INSIDE_OF_STRING,
    GROUP_TOP_LEVEL_LOGICAL,
    IS_ROOT_LOGICAL_EXPRESSION,
    firstValueInAncestorChain,
    findParentNode,
    wrapExpressionIfNeeded
} = require("../util");
const { extension: coreExtension } = require("melody-extension-core");
const ALREADY_INDENTED = Symbol("ALREADY_INDENTED");
const OPERATOR_PRECEDENCE = Symbol("OPERATOR_PRECEDENCE");
const NO_WHITESPACE_AROUND = [".."];

const operatorPrecedence = coreExtension.binaryOperators.reduce((acc, curr) => {
    acc[curr.text] = curr.precedence;
    return acc;
}, {});

const printInterpolatedString = (node, path, print, options) => {
    node[STRING_NEEDS_QUOTES] = false;
    node[INSIDE_OF_STRING] = true;

    const printedFragments = ['"']; // For interpolated strings, we HAVE to use double quotes
    let currentNode = node;
    const currentPath = [];
    while (Node.isBinaryConcatExpression(currentNode)) {
        printedFragments.unshift(path.call(print, ...currentPath, "right"));
        currentPath.push("left");
        currentNode = currentNode.left;
    }
    printedFragments.unshift(path.call(print, ...currentPath));
    printedFragments.unshift('"');
    return concat(printedFragments);
};

const operatorNeedsSpaces = operator => {
    return NO_WHITESPACE_AROUND.indexOf(operator) < 0;
};

const hasLogicalOperator = node => {
    return node.operator === "or" || node.operator === "and";
};

const otherNeedsParentheses = (node, otherProp) => {
    const other = node[otherProp];
    const isBinaryOther = Node.isBinaryExpression(other);
    const ownPrecedence = operatorPrecedence[node.operator];
    const otherPrecedence = isBinaryOther
        ? operatorPrecedence[node[otherProp].operator]
        : Number.MAX_SAFE_INTEGER;
    return (
        otherPrecedence < ownPrecedence ||
        (otherPrecedence > ownPrecedence &&
            isBinaryOther &&
            hasLogicalOperator(other)) ||
        Node.isFilterExpression(other) ||
        (Node.isBinaryConcatExpression(node) &&
            Node.isConditionalExpression(other))
    );
};

const printBinaryExpression = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;

    const isBinaryRight = Node.isBinaryExpression(node.right);
    const isLogicalOperator = ["and", "or"].indexOf(node.operator) > -1;
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
        IS_ROOT_LOGICAL_EXPRESSION,
        false
    );

    const parentNode = findParentNode(path);
    const shouldGroupOnTopLevel = parentNode[GROUP_TOP_LEVEL_LOGICAL] !== false;

    if (!foundRootAbove) {
        node[IS_ROOT_LOGICAL_EXPRESSION] = true;
    }
    const parentOperator = foundRootAbove
        ? firstValueInAncestorChain(path, "operator")
        : "";

    node[OPERATOR_PRECEDENCE] = operatorPrecedence[node.operator];

    const printedLeft = path.call(print, "left");
    const printedRight = path.call(print, "right");

    const parts = [];
    const leftNeedsParens = otherNeedsParentheses(node, "left");
    const rightNeedsParens = otherNeedsParentheses(node, "right");

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
    const result = concat(
        wrapExpressionIfNeeded(path, [...parts, rightHandSide], node)
    );

    const shouldCreateTopLevelGroup = !foundRootAbove && shouldGroupOnTopLevel;
    const isDifferentLogicalOperator =
        isLogicalOperator && node.operator !== parentOperator;

    const shouldGroupResult =
        shouldCreateTopLevelGroup ||
        !isLogicalOperator ||
        (foundRootAbove && isDifferentLogicalOperator);

    return shouldGroupResult ? group(result) : result;
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
