const prettier = require("prettier");
const { concat } = prettier.doc.builders;
const { Node } = require("melody-types");

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

const p = (node, path, print = print) => {
    const docs = [path.call(print, "name")];
    if (node.value) {
        docs.push('="');
        if (isDynamicValue(node.value)) {
            docs.push("{{ ");
        }
        docs.push(path.call(print, "value"));
        if (isDynamicValue(node.value)) {
            docs.push(" }}");
        }
        docs.push('"');
    }

    return concat(docs);
};

module.exports = {
    printAttribute: p
};
