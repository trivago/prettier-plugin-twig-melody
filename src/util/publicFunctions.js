const { EXPRESSION_NEEDED } = require("./publicSymbols.js");
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

const needsExpressionEnvironment = path => {
    let result = false;
    walkParents(path, node => {
        if (node[EXPRESSION_NEEDED] === false) {
            // Abort walking up the ancestor chain
            return false;
        }
        if (node[EXPRESSION_NEEDED] === true) {
            result = true;
            return false;
        }
    });
    return result;
};

/**
 * Puts environment braces {{ ... }} around an element
 *
 * @param {array} parts The finished, printed element,
 *                  except for concatenation and grouping
 */
const wrapInEnvironment = parts => {
    parts.unshift("{{", line);
    parts.push(line, "}}");
};

module.exports = {
    needsExpressionEnvironment,
    wrapInEnvironment,
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
