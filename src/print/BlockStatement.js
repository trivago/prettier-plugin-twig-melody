const prettier = require("prettier");
const { concat, hardline, group } = prettier.doc.builders;
const { Node } = require("melody-types");
const { EXPRESSION_NEEDED, printChildBlock } = require("../util");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    const hasChildren = Array.isArray(node.body);

    if (hasChildren) {
        const blockName = path.call(print, "name");
        const opener = concat([
            node.trimLeft ? "{%-" : "{%",
            " block ",
            blockName,
            node.trimRightBlock ? " -%}" : " %}"
        ]);
        const parts = [opener];
        if (node.body.length > 0) {
            const indentedBody = printChildBlock(node, path, print, "body");
            parts.push(indentedBody);
        }
        parts.push(hardline);
        parts.push(
            node.trimLeftEndblock ? "{%-" : "{%",
            " endblock ",
            blockName,
            node.trimRight ? " -%}" : " %}"
        );

        const result = group(concat(parts));
        return result;
    } else if (Node.isPrintExpressionStatement(node.body)) {
        const parts = [
            node.trimLeft ? "{%-" : "{%",
            " block ",
            path.call(print, "name"),
            " ",
            path.call(print, "body", "value"),
            node.trimRight ? " -%}" : " %}"
        ];
        return concat(parts);
    }
};

module.exports = {
    printBlockStatement: p
};
