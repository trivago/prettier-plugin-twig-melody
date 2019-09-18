const prettier = require("prettier");
const { Node } = require("melody-types");
const { fill } = prettier.doc.builders;

const MAX_ATTRIBUTE_LENGTH_BEFORE_BREAK = 60;

const INLINE_ELEMENTS = [
    "abbr",
    "b",
    "br",
    "dd",
    "em",
    "i",
    "s",
    "strong",
    "sup",
    "sub",
    "small"
];

const isNonBreaking = (node, elementsAllowed = true) => {
    return (
        (elementsAllowed && isNonBreakingElement(node)) ||
        Node.isConstantValue(node) ||
        isShallowExpression(node)
    );
};

const isNonBreakingElement = node => {
    return (
        isInlineElement(node) &&
        hasNoBreakingChildren(node) &&
        totalAttributeLength(node) <= MAX_ATTRIBUTE_LENGTH_BEFORE_BREAK
    );
};

const isShallowExpression = node => {
    return (
        Node.isPrintExpressionStatement(node) && Node.isIdentifier(node.value)
    );
};

const hasNoBreakingChildren = node => {
    for (const child of node.children) {
        if (!isNonBreaking(child, false)) {
            return false;
        }
    }
    return true;
};

const isInlineElement = node => INLINE_ELEMENTS.indexOf(node.name) >= 0;

const totalAttributeLength = elementNode =>
    elementNode.attributes &&
    elementNode.attributes.reduce(
        (totalLen, attrNode) => totalLen + attributeLength(attrNode) + 1,
        0
    );

/**
 * Adds 3 to the result: 2 for quotes, 1 for equal sign
 * @param {Node} attrNode
 */
const attributeLength = attrNode => {
    const result = String.length(attrNode.name);
    if (attrNode.value) {
        return result + String.length(attrNode.value) + 3;
    }
    return result;
};

const normalizeParagraph = s =>
    deduplicateWhitespace(s.replace(/\n/g, "").trim());

const deduplicateWhitespace = s => s.replace(/\s+/g, " ");
// const lastElement = arr => arr.length > 0 && arr[arr.length - 1];

const isDynamicValue = node => {
    return (
        Node.isIdentifier(node) ||
        Node.isMemberExpression(node) ||
        Node.isUnaryExpression(node) ||
        Node.isBinaryExpression(node) ||
        Node.isBinaryConcatExpression(node) ||
        Node.isConditionalExpression(node) ||
        Node.isCallExpression(node) ||
        Node.isFilterExpression(node)
    );
};

const isExpressionType = node => {
    return (
        Node.isPrintExpressionStatement(node) ||
        Node.isMemberExpression(node) ||
        Node.isUnaryExpression(node) ||
        Node.isBinaryExpression(node) ||
        Node.isBinaryConcatExpression(node) ||
        Node.isArrayExpression(node) ||
        Node.isConditionalExpression(node) ||
        Node.isCallExpression(node) ||
        Node.isFilterExpression(node)
    );
};

const getExpressionType = node => {
    if (Node.isPrintExpressionStatement(node)) {
        return "PrintExpressionStatement";
    }
    if (Node.isMemberExpression(node)) {
        return "MemberExpression";
    }
    if (Node.isUnaryExpression(node)) {
        return "UnaryExpression";
    }
    if (Node.isBinaryExpression(node)) {
        return "BinaryExpression";
    }
    if (Node.isBinaryConcatExpression(node)) {
        return "BinaryConcat";
    }
    if (Node.isArrayExpression(node)) {
        return "ArrayExpression";
    }
    if (Node.isConditionalExpression(node)) {
        return "ConditionalExpression";
    }
    if (Node.isCallExpression(node)) {
        return "CallExpression";
    }
    if (Node.isFilterExpression(node)) {
        return "FilterExpression";
    }
};

module.exports = {
    normalizeParagraph,
    isNonBreaking,
    isDynamicValue,
    isExpressionType,
    getExpressionType
};
