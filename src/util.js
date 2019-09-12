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

/**
 * 1. Split at newlines
 * 2. Trim each line
 * 3. Merge multiple empty lines into one
 * 4. Join lines with a hard line
 *
 * @param {String} s The string to normalize
 */
const textToDocs = s => {
    return fill([normalizeParagraph(s)]);
};
//     .reduce((docs, line) => {
//         // Ignore additional line breaks beyond the first one
//         if (
//             line === '' &&
//             (lastElement(docs) === '' || docs.length === 0)
//         ) {
//             return docs;
//         }
//         if (line === '') {
//             return docs.concat([hardline]);
//         }
//         return docs.concat([line]);
//     }, []);

// if (docs.length > 1) {
//     return fill(join(hardline, docs));
// }
// return fill(docs);
// };

const normalizeParagraph = s =>
    deduplicateWhitespace(s.replace(/\n/g, "").trim());

const deduplicateWhitespace = s => s.replace(/\s+/g, " ");
// const lastElement = arr => arr.length > 0 && arr[arr.length - 1];

module.exports = {
    normalizeParagraph,
    isNonBreaking,
    textToDocs
};
