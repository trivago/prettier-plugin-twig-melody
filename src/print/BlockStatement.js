const prettier = require("prettier");
const { hardline, group } = prettier.doc.builders;
const { Node } = require("melody-types");
const { EXPRESSION_NEEDED, printChildBlock } = require("../util");

const p = (node, path, print, options) => {
    node[EXPRESSION_NEEDED] = false;
    const hasChildren = Array.isArray(node.body);
    const printEndblockName = options.twigOutputEndblockName === true;

    if (hasChildren) {
        const blockName = path.call(print, "name");
        const opener = [
            node.trimLeft ? "{%-" : "{%",
            " block ",
            blockName,
            node.trimRightBlock ? " -%}" : " %}",
        ];
        const parts = [opener];
        if (node.body.length > 0) {
            const indentedBody = printChildBlock(node, path, print, "body");
            parts.push(indentedBody);
        }
        parts.push(hardline);
        parts.push(
            node.trimLeftEndblock ? "{%-" : "{%",
            " endblock",
            printEndblockName ? [" ", blockName] : "",
            node.trimRight ? " -%}" : " %}"
        );

        const result = group(parts);
        return result;
    } else if (Node.isPrintExpressionStatement(node.body)) {
        const parts = [
            node.trimLeft ? "{%-" : "{%",
            " block ",
            path.call(print, "name"),
            " ",
            path.call(print, "body", "value"),
            node.trimRight ? " -%}" : " %}",
        ];
        return parts;
    }
};

module.exports = {
    printBlockStatement: p,
};
