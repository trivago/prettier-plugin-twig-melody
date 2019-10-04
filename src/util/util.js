const prettier = require("prettier");
const { Node } = require("melody-types");
const { indent, concat, join, softline } = prettier.doc.builders;

const MAX_ATTRIBUTE_LENGTH_BEFORE_BREAK = 60;

const TEXT_SPACE = Symbol("TEXT_SPACE");
const TEXT_NEWLINE = Symbol("TEXT_NEWLINE");
const PRESERVE_LEADING_WHITESPACE = Symbol("PRESERVE_LEADING_WHITESPACE");
const PRESERVE_TRAILING_WHITESPACE = Symbol("PRESERVE_TRAILING_WHITESPACE");

const INLINE_HTML_ELEMENTS = [
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
    "small",
    "span"
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

const isWhitespaceNode = node => {
    return (
        Node.isPrintTextStatement(node) && isWhitespaceOnly(node.value.value)
    );
};

const preprocessChildren = children => {
    if (!Array.isArray(children)) {
        return children;
    }
    const result = [];
    let previous = null;
    children.forEach((child, index) => {
        const isFirstOrLast = index === 0 || index === children.length - 1;
        const isWhitespace = isWhitespaceNode(child);
        // Remove initial whitespace
        if (isFirstOrLast && isWhitespace) {
            return;
        }
        // Whitespace between two children can be removed
        // if the siblings are not both inline elements
        if (isWhitespace) {
            const next = children.length > index ? children[index + 1] : null;
            const hasMoreThanOneNewline = hasAtLeastTwoNewlines(
                child.value.value
            );
            if (isInlineElement(previous) && isInlineElement(next)) {
                // Add an (artificial) space to the result
                child[TEXT_SPACE] = true;
                result.push(child);
            } else if (hasAtLeastTwoNewlines(child.value.value)) {
                // Turn multiple empty lines into only one
                child[TEXT_NEWLINE] = true;
                result.push(child);
            }
            return;
        }

        result.push(child);
        previous = child;
    });
    return result;
};

const isInlineElement = node => {
    const isInlineHtmlElement =
        Node.isElement(node) && INLINE_HTML_ELEMENTS.indexOf(node.name) >= 0;

    return (
        isInlineHtmlElement ||
        Node.isPrintExpressionStatement(node) ||
        Node.isPrintTextStatement(node)
    );
};

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

const needsQuotedStringLiterals = node => {
    return (
        Node.isPrintExpressionStatement(node) ||
        Node.isMemberExpression(node) ||
        Node.isUnaryExpression(node) ||
        Node.isBinaryExpression(node) ||
        Node.isBinaryConcatExpression(node) ||
        Node.isArrayExpression(node) ||
        Node.isConditionalExpression(node) ||
        Node.isCallExpression(node) ||
        Node.isFilterExpression(node) ||
        Node.isNamedArgumentExpression(node) ||
        Node.isMountStatement(node) ||
        Node.isSetStatement(node) ||
        Node.isVariableDeclarationStatement(node) ||
        Node.isExtendsStatement(node) ||
        Node.isEmbedStatement(node) ||
        Node.isImportDeclaration(node) ||
        Node.isFromStatement(node)
    );
};

const isWhitespaceOnly = s => typeof s === "string" && s.trim() === "";

const countNewlines = s => {
    return (s.match(/\n/g) || "").length;
};

const hasAtLeastTwoNewlines = s => countNewlines(s) >= 2;

const joinChildExpressions = childExpressions => {
    return indent(concat([softline, join(softline, childExpressions)]));
};

const processChildExpressions = childExpressions => {
    const withoutEmptyStrings = childExpressions.filter(s => s !== "");
    return joinChildExpressions(withoutEmptyStrings);
};

const printChildren = (path, print, childrenKey) => {
    const printedChildren = path.map(print, childrenKey);
    return processChildExpressions(printedChildren);
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

const quoteChar = () => {
    // Might change depending on configuration options
    return '"';
};

const isMelodyNode = n => {
    const proto = n.__proto__;
    return typeof n === "object" && proto.type && proto.visitorKeys;
};

const findParentNode = path => {
    let currentIndex = path.stack.length - 2;
    while (currentIndex >= 0) {
        const currentElement = path.stack[currentIndex];
        if (isMelodyNode(currentElement)) {
            return currentElement;
        }
        currentIndex--;
    }
    return null;
};

module.exports = {
    normalizeParagraph,
    isNonBreaking,
    isDynamicValue,
    needsQuotedStringLiterals,
    getExpressionType,
    quoteChar,
    processChildExpressions,
    joinChildExpressions,
    printChildren,
    findParentNode,
    isMelodyNode,
    isWhitespaceOnly,
    isInlineElement,
    countNewlines,
    hasAtLeastTwoNewlines,
    preprocessChildren,
    TEXT_SPACE,
    TEXT_NEWLINE,
    PRESERVE_LEADING_WHITESPACE,
    PRESERVE_TRAILING_WHITESPACE
};
