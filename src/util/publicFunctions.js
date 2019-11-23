const { EXPRESSION_NEEDED, INSIDE_OF_STRING } = require("./publicSymbols.js");
const prettier = require("prettier");
const { line } = prettier.doc.builders;

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
    let currentIndex = path.stack.length - 1;
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
    const identifierRegex = /^[0-9A-Z_$]+$/i;
    return typeof s === "string" && identifierRegex.test(s);
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
    parts.unshift("#{ ");
    parts.push(" }");
};

module.exports = {
    shouldExpressionsBeWrapped,
    wrapExpressionIfNeeded,
    findParentNode,
    isRootNode,
    isMelodyNode,
    someParentNode,
    walkParents,
    firstValueInAncestorChain,
    quoteChar,
    isValidIdentifierName,
    testCurrentNode,
    testCurrentAndParentNodes
};
