const prettier = require("prettier");
const { group, indent, line } = prettier.doc.builders;
const {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    isContractableNodeType,
} = require("../util");
const { Node } = require("melody-types");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;
    const opener = node.trimLeft ? "{{-" : "{{";
    const closing = node.trimRight ? "-}}" : "}}";
    const shouldContractValue =
        isContractableNodeType(node.value) &&
        !Node.isObjectExpression(node.value);
    const padding = shouldContractValue ? " " : line;
    const printedValue = [padding, path.call(print, "value")];
    const value = shouldContractValue ? printedValue : indent(printedValue);
    return group([opener, value, padding, closing]);
};

module.exports = {
    printExpressionStatement: p,
};
