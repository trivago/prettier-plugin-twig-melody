const prettier = require("prettier");
const { Node } = require("melody-types");
const { indent, concat, fill, group, hardline } = prettier.doc.builders;

const PRESERVE_LEADING_WHITESPACE = Symbol("PRESERVE_LEADING_WHITESPACE");
const PRESERVE_TRAILING_WHITESPACE = Symbol("PRESERVE_TRAILING_WHITESPACE");
const NEWLINES_ONLY = Symbol("NEWLINES_ONLY");

const INLINE_HTML_ELEMENTS = [
    "a",
    "abbr",
    "b",
    "br",
    "dd",
    "em",
    "i",
    "li",
    "s",
    "strong",
    "sup",
    "sub",
    "small",
    "span"
];

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

const endsWithHtmlComment = s => s.endsWith("-->");

const isInlineTextStatement = node => {
    if (!Node.isPrintTextStatement(node)) {
        return false;
    }
    // If the statement ends with an HTML comment
    const trimmedValue =
        typeof node.value.value === "string" && node.value.value.trim();
    return !endsWithHtmlComment(trimmedValue);
};

const isInlineElement = node => {
    const isInlineHtmlElement =
        Node.isElement(node) && INLINE_HTML_ELEMENTS.indexOf(node.name) >= 0;

    return (
        isInlineHtmlElement ||
        Node.isPrintExpressionStatement(node) ||
        isInlineTextStatement(node)
    );
};

const createInlineMap = nodes => nodes.map(node => isInlineElement(node));

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

const printChildGroups = (node, path, print, ...childPath) => {
    // For the preprocessed children, get a map showing which elements can
    // be printed inline
    const children = getDeepProperty(node, ...childPath);
    const inlineMap = createInlineMap(children);
    addPreserveWhitespaceInfo(inlineMap, children);
    textStatementsOnlyNewlines(children);
    const printedChildren = path.map(print, ...childPath);
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

const getDeepProperty = (obj, ...properties) => {
    let result = obj;
    properties.forEach(p => {
        result = result[p];
    });
    return result;
};

const setDeepProperty = (obj, value, ...properties) => {
    let containingObject = obj;
    const len = properties.length;
    for (let i = 0; i < len - 1; i++) {
        containingObject = containingObject[properties[i]];
    }
    containingObject[properties[len - 1]] = value;
};

const printChildBlock = (node, path, print, ...childPath) => {
    const originalChildren = getDeepProperty(node, ...childPath);
    setDeepProperty(
        node,
        removeSurroundingWhitespace(originalChildren),
        ...childPath
    );
    const childGroups = printChildGroups(node, path, print, ...childPath);
    return indent(group(concat([hardline, ...childGroups])));
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
    needsQuotedStringLiterals,
    printChildGroups,
    printChildBlock,
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
