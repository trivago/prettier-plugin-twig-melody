const prettier = require("prettier");
const { concat, indent, hardline, line, group } = prettier.doc.builders;
const { EXPRESSION_NEEDED, printChildBlock } = require("../util");

const printOpener = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    const parts = ["{% embed ", path.call(print, "parent")];
    if (node.argument) {
        parts.push(
            indent(concat([line, "with ", path.call(print, "argument")]))
        );
    }
    parts.push(concat([line, "%}"]));
    return group(concat(parts));
};

const p = (node, path, print) => {
    const children = printChildBlock(node, path, print, "blocks");
    const printedOpener = printOpener(node, path, print);
    const closing = concat([hardline, "{% endembed %}"]);

    return concat([printedOpener, children, closing]);
};

module.exports = {
    printEmbedStatement: p
};
