const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const { EXPRESSION_NEEDED, STRING_NEEDS_QUOTES } = require("../util");
const { Node } = require("melody-types");

const mayCorrectWhitespace = attrName =>
    ["id", "class", "type"].indexOf(attrName) > -1;

const sanitizeWhitespace = s => s.replace(/\s+/g, " ").trim();

const printConcatenatedString = (valueNode, path, print, ...initialPath) => {
    const printedFragments = [];
    let currentNode = valueNode;
    const currentPath = initialPath;
    while (Node.isBinaryConcatExpression(currentNode)) {
        printedFragments.unshift(path.call(print, ...currentPath, "right"));
        currentPath.push("left");
        currentNode = currentNode.left;
    }
    printedFragments.unshift(path.call(print, ...currentPath));
    return concat(printedFragments);
};

const p = (node, path, print = print) => {
    node[EXPRESSION_NEEDED] = false;
    const docs = [path.call(print, "name")];
    node[EXPRESSION_NEEDED] = true;
    node[STRING_NEEDS_QUOTES] = false;
    if (node.value) {
        docs.push('="');
        if (
            Node.isBinaryConcatExpression(node.value) &&
            node.value.wasImplicitConcatenation
        ) {
            // Special handling for concatenated string values
            docs.push(
                printConcatenatedString(node.value, path, print, "value")
            );
        } else {
            const isStringValue = Node.isStringLiteral(node.value);
            if (mayCorrectWhitespace(node.name.name) && isStringValue) {
                node.value.value = sanitizeWhitespace(node.value.value);
            }
            docs.push(path.call(print, "value"));
        }
        docs.push('"');
    }

    return concat(docs);
};

module.exports = {
    printAttribute: p
};
