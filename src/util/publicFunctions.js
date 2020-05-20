const { EXPRESSION_NEEDED, INSIDE_OF_STRING } = require("./publicSymbols.js");
const prettier = require("prettier");
const { line, indent, concat, fill, group, hardline } = prettier.doc.builders;
const { Node } = require("melody-types");

const {
    PRESERVE_LEADING_WHITESPACE,
    PRESERVE_TRAILING_WHITESPACE,
    NEWLINES_ONLY
} = require("./publicSymbols.js");

const INLINE_HTML_ELEMENTS = [
    "a",
    "abbr",
    "acronym",
    "b",
    "bdo",
    "big",
    "br",
    "button",
    "cite",
    "code",
    "dd",
    "dfn",
    "em",
    "i",
    "img",
    "kbd",
    "label",
    "li",
    "mark",
    "q",
    "s",
    "samp",
    "strong",
    "sup",
    "sub",
    "small",
    "span",
    "time",
    "tt",
    "var"
];

/**
 * Node types around which we avoid an extra line break.
 * Example:
 * {{ {
 *     animal: "dog",
 *     owner: "Jim"
 *  } }}
 *
 * instead of
 * {{
 *     {
 *         animal: "dog",
 *         owner: "Jim"
 *     }
 * }}
 */
const CONTRACTABLE_NODE_TYPES = [
    "ObjectExpression",
    "BinaryExpression",
    "ConditionalExpression",
    "ArrayExpression"
];

const registerContractableNodeType = nodeType => {
    CONTRACTABLE_NODE_TYPES.push(nodeType);
};

const isContractableNodeType = node => {
    for (let i = 0; i < CONTRACTABLE_NODE_TYPES.length; i++) {
        const contractableNodeType = CONTRACTABLE_NODE_TYPES[i];
        const methodName = "is" + contractableNodeType;
        if (Node[methodName] && Node[methodName].call(null, node)) {
            return true;
        }
    }
    if (Node.isUnaryLike(node)) {
        return true;
    }
    return false;
};

const isNotExpression = node =>
    Node.isUnaryLike(node) && node.operator === "not";

const isMultipartExpression = node => {
    return (
        Node.isBinaryExpression(node) ||
        Node.isConditionalExpression(node) ||
        Node.isUnaryLike(node)
    );
};

/**
 * Calls the callback for each parent
 *
 * Return false from the callback if you want the iteration
 * to end.
 *
 * @param {FastPath} path A standard Prettier FastPath object
 *                        representing the current AST traversal state
 * @param {function} callback Gets called with each ancestor node
 */
const walkParents = (path, callback, startWithSelf = false) => {
    let currentIndex = path.stack.length - 1;
    if (!startWithSelf) {
        currentIndex -= 1;
    }
    while (currentIndex >= 0) {
        const currentElement = path.stack[currentIndex];
        if (isMelodyNode(currentElement)) {
            const callbackResult = callback(currentElement);
            if (callbackResult === false) {
                return;
            }
        }
        currentIndex--;
    }
};

const firstValueInAncestorChain = (path, property, defaultValue) => {
    let currentIndex = path.stack.length - 2; // Don't start with self
    while (currentIndex >= 0) {
        const currentElement = path.stack[currentIndex];
        if (
            isMelodyNode(currentElement) &&
            currentElement[property] !== undefined
        ) {
            return currentElement[property];
        }
        currentIndex--;
    }
    return defaultValue;
};

const quoteChar = options => {
    // Might change depending on configuration options
    return options && options.twigSingleQuote ? "'" : '"';
};

const isValidIdentifierName = s => {
    const identifierRegex = /^[A-Z][0-9A-Z_$]*$/i;
    return typeof s === "string" && identifierRegex.test(s);
};

const isMelodyNode = n => {
    const proto = n.__proto__;
    return (
        typeof n === "object" &&
        proto.type &&
        typeof Node["is" + proto.type] === "function"
    );
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

const isRootNode = path => {
    return findParentNode(path) === null;
};

const testCurrentAndParentNodes = (path, predicate) =>
    testCurrentNode(path, predicate) || someParentNode(path, predicate);

const testCurrentNode = (path, predicate) => {
    const index = path.stack.length - 1;
    if (index >= 0) {
        const node = path.stack[index];
        return isMelodyNode(node) && predicate(node);
    }
    return false;
};

const someParentNode = (path, predicate) => {
    let currentIndex = path.stack.length - 2;
    while (currentIndex >= 0) {
        const currentElement = path.stack[currentIndex];
        if (isMelodyNode(currentElement) && predicate(currentElement)) {
            return true;
        }
        currentIndex--;
    }
    return false;
};

/**
 * Returns EXPRESSION_NEEDED or INSIDE_OF_STRING, depending
 * on what kind of wrapping is needed around expressions:
 * EXPRESSION_NEEDED => {{ ... }}
 * INSIDE_OF_STRING => #{ ... }
 *
 * @param {FastPath} path The representation of the current AST traversal state
 */
const shouldExpressionsBeWrapped = path => {
    let result = false;
    walkParents(path, node => {
        if (node[INSIDE_OF_STRING] === true) {
            result = INSIDE_OF_STRING;
            return false;
        }
        if (node[EXPRESSION_NEEDED] === true) {
            result = EXPRESSION_NEEDED;
            return false;
        }
        if (
            node[EXPRESSION_NEEDED] === false ||
            node[INSIDE_OF_STRING] === false
        ) {
            // Abort walking up the ancestor chain
            return false;
        }
    });
    return result;
};

const wrapExpressionIfNeeded = (path, fragments, node = {}) => {
    const wrapType = shouldExpressionsBeWrapped(path);
    if (wrapType === EXPRESSION_NEEDED) {
        wrapInEnvironment(fragments, node.trimLeft, node.trimRight);
    } else if (wrapType === INSIDE_OF_STRING) {
        wrapInStringInterpolation(fragments);
    }
    return fragments;
};

/**
 * Puts environment braces {{ ... }} around an element
 *
 * @param {array} parts The finished, printed element,
 *                  except for concatenation and grouping
 */
const wrapInEnvironment = (parts, trimLeft = false, trimRight = false) => {
    const leftBraces = trimLeft ? "{{-" : "{{";
    const rightBraces = trimRight ? "-}}" : "}}";
    parts.unshift(leftBraces, line);
    parts.push(line, rightBraces);
};

/**
 * Puts string interpolation braces #{ ... } around an element
 *
 * @param {array} parts The finished, printed element,
 *                  except for concatenation and grouping
 */
const wrapInStringInterpolation = parts => {
    parts.unshift("#{");
    parts.push("}");
};

const isWhitespaceOnly = s => typeof s === "string" && s.trim() === "";

const countNewlines = s => {
    return (s.match(/\n/g) || "").length;
};

const hasNoNewlines = s => {
    return countNewlines(s) === 0;
};

const hasAtLeastTwoNewlines = s => countNewlines(s) >= 2;

// Split string by whitespace, but preserving the whitespace
// "\n   Next\n" => ["", "\n   ", "Next", "\n", ""]
const splitByWhitespace = s => s.split(/([\s\n]+)/gm);

const unifyWhitespace = (s, replacement = " ") =>
    splitByWhitespace(s)
        .filter(s => !isWhitespaceOnly(s))
        .join(replacement);

const normalizeWhitespace = whitespace => {
    const numNewlines = countNewlines(whitespace);
    if (numNewlines > 0) {
        // Normalize to one/two newline(s)
        return numNewlines > 1 ? [hardline, hardline] : [hardline];
    }
    // Normalize to one single space
    return [line];
};

const createTextGroups = (
    s,
    preserveLeadingWhitespace,
    preserveTrailingWhitespace
) => {
    const parts = splitByWhitespace(s);
    const groups = [];
    let currentGroup = [];
    const len = parts.length;
    parts.forEach((curr, index) => {
        if (curr !== "") {
            if (isWhitespaceOnly(curr)) {
                const isFirst =
                    groups.length === 0 && currentGroup.length === 0;
                const isLast =
                    index === len - 1 ||
                    (index === len - 2 && parts[len - 1] === "");
                // Remove leading whitespace if allowed
                if (
                    (isFirst && preserveLeadingWhitespace) ||
                    (isLast && preserveTrailingWhitespace)
                ) {
                    currentGroup.push(...normalizeWhitespace(curr));
                } else if (!isFirst && !isLast) {
                    const numNewlines = countNewlines(curr);
                    if (numNewlines <= 1) {
                        currentGroup.push(line);
                    } else {
                        groups.push(currentGroup);
                        currentGroup = [];
                    }
                }
            } else {
                currentGroup.push(curr);
            }
        }
    });

    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }
    return groups.map(elem => fill(elem));
};

const isWhitespaceNode = node => {
    return (
        (Node.isPrintTextStatement(node) &&
            isWhitespaceOnly(node.value.value)) ||
        (Node.isStringLiteral(node) && isWhitespaceOnly(node.value))
    );
};

const isEmptySequence = node =>
    Node.isSequenceExpression(node) && node.expressions.length === 0;

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

const addNewlineIfNotEmpty = items => {
    if (items.length > 0) {
        items.push(hardline);
    }
};

const endsWithHtmlComment = s => s.endsWith("-->");

const stripCommentChars = (start, end) => s => {
    let result = s;
    if (result.startsWith(start)) {
        result = result.slice(start.length);
    }
    if (result.endsWith(end)) {
        result = result.slice(0, 0 - end.length);
    }
    return result;
};

const stripHtmlCommentChars = stripCommentChars("<!--", "-->");

const stripTwigCommentChars = s => {
    let result = s;
    if (result.startsWith("{#")) {
        result = result.slice(2);
    }
    if (result.startsWith("-")) {
        result = result.slice(1);
    }
    if (result.endsWith("#}")) {
        result = result.slice(0, -2);
    }
    if (result.endsWith("-")) {
        result = result.slice(0, -1);
    }
    return result;
};

const normalizeHtmlComment = s => {
    const commentText = stripHtmlCommentChars(s);
    return "<!-- " + unifyWhitespace(commentText) + " -->";
};

const normalizeTwigComment = (s, trimLeft, trimRight) => {
    const commentText = stripTwigCommentChars(s);
    const open = trimLeft ? "{#-" : "{#";
    const close = trimRight ? "-#}" : "#}";
    return open + " " + unifyWhitespace(commentText) + " " + close;
};

const isHtmlCommentEqualTo = substr => node => {
    return (
        node.constructor.name === "HtmlComment" &&
        node.value.value &&
        normalizeHtmlComment(node.value.value) === "<!-- " + substr + " -->"
    );
};

const isTwigCommentEqualTo = substr => node => {
    return (
        node.constructor.name === "TwigComment" &&
        node.value.value &&
        normalizeTwigComment(node.value.value) === "{# " + substr + " #}"
    );
};

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

const isCommentNode = node =>
    Node.isTwigComment(node) || Node.isHtmlComment(node);

const createInlineMap = nodes => nodes.map(node => isInlineElement(node));

const textStatementsOnlyNewlines = nodes => {
    nodes.forEach(node => {
        if (Node.isPrintTextStatement(node)) {
            node[NEWLINES_ONLY] = true;
        }
    });
};

const addPreserveWhitespaceInfo = (inlineMap, nodes) => {
    nodes.forEach((node, index) => {
        const previousNodeIsComment =
            index > 0 && isCommentNode(nodes[index - 1]);
        const followingNodeIsComment =
            index < nodes.length - 1 && isCommentNode(nodes[index + 1]);
        if (Node.isPrintTextStatement(node)) {
            const hasPreviousInlineElement = index > 0 && inlineMap[index - 1];
            if (hasPreviousInlineElement || previousNodeIsComment) {
                node[PRESERVE_LEADING_WHITESPACE] = true;
            }
            const hasFollowingInlineElement =
                index < inlineMap.length - 1 && inlineMap[index + 1];
            if (hasFollowingInlineElement || followingNodeIsComment) {
                node[PRESERVE_TRAILING_WHITESPACE] = true;
            }
        }
    });
};

const indentWithHardline = contents => indent(concat([hardline, contents]));

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

module.exports = {
    shouldExpressionsBeWrapped,
    wrapExpressionIfNeeded,
    wrapInStringInterpolation,
    wrapInEnvironment,
    findParentNode,
    isRootNode,
    isMelodyNode,
    someParentNode,
    walkParents,
    firstValueInAncestorChain,
    isContractableNodeType,
    isNotExpression,
    isMultipartExpression,
    registerContractableNodeType,
    quoteChar,
    isValidIdentifierName,
    testCurrentNode,
    testCurrentAndParentNodes,
    isWhitespaceOnly,
    isWhitespaceNode,
    isEmptySequence,
    hasNoNewlines,
    countNewlines,
    hasAtLeastTwoNewlines,
    stripHtmlCommentChars,
    stripTwigCommentChars,
    normalizeHtmlComment,
    normalizeTwigComment,
    isHtmlCommentEqualTo,
    isTwigCommentEqualTo,
    createTextGroups,
    removeSurroundingWhitespace,
    getDeepProperty,
    setDeepProperty,
    isInlineElement,
    printChildBlock,
    printChildGroups,
    indentWithHardline
};
