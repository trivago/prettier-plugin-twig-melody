const prettier = require("prettier");
const { Node } = require("melody-types");
const {
    indent,
    concat,
    join,
    fill,
    hardline,
    softline
} = prettier.doc.builders;

const MAX_ATTRIBUTE_LENGTH_BEFORE_BREAK = 60;

const PRESERVE_LEADING_WHITESPACE = Symbol("PRESERVE_LEADING_WHITESPACE");
const PRESERVE_TRAILING_WHITESPACE = Symbol("PRESERVE_TRAILING_WHITESPACE");
const NEWLINES_ONLY = Symbol("NEWLINES_ONLY");

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

const removeSurroundingWhitespace = children => {
    if (!Array.isArray(children)) {
        return children;
    }
    const result = [];
    children.forEach((child, index) => {
        const isFirstOrLast = index === 0 || index === children.length - 1;
        // Remove initial whitespace
        if (isFirstOrLast && isWhitespaceNode(child)) {
            return;
        }

        result.push(child);
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

const createInlineMap = nodes => nodes.map(node => isInlineElement(node));

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

const textStatementsOnlyNewlines = nodes => {
    nodes.forEach(node => {
        if (Node.isPrintTextStatement(node)) {
            node[NEWLINES_ONLY] = true;
        }
    });
};

const addNewlineIfNotEmpty = items => {
    if (items.length > 0) {
        items.push(hardline);
    }
};

const printChildGroups = (node, path, print, childrenKey) => {
    // For the preprocessed children, get a map showing which elements can
    // be printed inline
    const inlineMap = createInlineMap(node[childrenKey]);
    addPreserveWhitespaceInfo(inlineMap, node[childrenKey]);
    textStatementsOnlyNewlines(node[childrenKey]);
    const printedChildren = path.map(print, childrenKey);
    // Go over the children, while carrying along a group to be filled
    // - If the element is inline, add it to the group
    // - If the element is not inline, and the group is not empty
    //       => print the group as fill()
    let inlineGroup = [];
    const finishedGroups = [];
    printedChildren.forEach((child, index) => {
        if (inlineMap[index]) {
            // Maybe a PrintTextStatement should not be
            // considered "inline" if it contains more than
            // one \n character
            inlineGroup.push(child);
        } else {
            if (inlineGroup.length > 0) {
                finishedGroups.push(fill(inlineGroup));
                inlineGroup = [];
            }
            // Ensure line break between two block elements
            if (finishedGroups.length > 0 && !inlineMap[index - 1]) {
                addNewlineIfNotEmpty(finishedGroups);
            }
            finishedGroups.push(child);
        }
    });
    if (inlineGroup.length > 0) {
        finishedGroups.push(fill(inlineGroup));
    }
    return finishedGroups;
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

const addPreserveWhitespaceInfo = (inlineMap, nodes) => {
    nodes.forEach((node, index) => {
        if (Node.isPrintTextStatement(node)) {
            const hasPreviousInlineElement = index > 0 && inlineMap[index - 1];
            if (hasPreviousInlineElement) {
                node[PRESERVE_LEADING_WHITESPACE] = true;
            }
            const hasFollowingInlineElement =
                index < inlineMap.length - 1 && inlineMap[index + 1];
            if (hasFollowingInlineElement) {
                node[PRESERVE_TRAILING_WHITESPACE] = true;
            }
        }
    });
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
    printChildGroups,
    findParentNode,
    isMelodyNode,
    isWhitespaceOnly,
    isInlineElement,
    createInlineMap,
    countNewlines,
    hasAtLeastTwoNewlines,
    removeSurroundingWhitespace,
    addPreserveWhitespaceInfo,
    textStatementsOnlyNewlines,
    PRESERVE_LEADING_WHITESPACE,
    PRESERVE_TRAILING_WHITESPACE,
    NEWLINES_ONLY
};
