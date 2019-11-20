const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const { EXPRESSION_NEEDED } = require("../util");
const { Node } = require("melody-types");

const printConcatenatedString = (valueNode, path, print) => {
    const printedFragments = [];
    let currentNode = valueNode;
    const currentPath = ["value"];
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
    if (node.value) {
        docs.push('="');
        node.value.isMelodyGenerated = true;
        if (
            Node.isBinaryConcatExpression(node.value) &&
            node.value.isMelodyGenerated
        ) {
            // Special handling for concatenated string values
            docs.push(printConcatenatedString(node.value, path, print));
        } else {
            docs.push(path.call(print, "value"));
        }
        docs.push('"');
    }

    return concat(docs);
};

module.exports = {
    printAttribute: p
};
