const prettier = require("prettier");
const { concat, indent, hardline, line, group } = prettier.doc.builders;
const { processChildExpressions } = require("../util");

const printOpener = (node, path, print) => {
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
    const printedOpener = printOpener(node, path, print);
    const printedBlocks = path.map(print, "blocks");
    const closing = concat([hardline, "{% endembed %}"]);
    return concat([
        printedOpener,
        processChildExpressions(printedBlocks),
        closing
    ]);
};

module.exports = {
    printEmbedStatement: p
};
