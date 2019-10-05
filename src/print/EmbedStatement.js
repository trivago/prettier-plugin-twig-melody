const prettier = require("prettier");
const { concat, indent, hardline, line, group } = prettier.doc.builders;
const { printChildGroups, removeSurroundingWhitespace } = require("../util");

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
    node.blocks = removeSurroundingWhitespace(node.blocks);
    const printedOpener = printOpener(node, path, print);
    const childGroups = printChildGroups(node, path, print, "blocks");
    const closing = concat([hardline, "{% endembed %}"]);

    return concat([
        printedOpener,
        indent(concat([hardline, ...childGroups])),
        closing
    ]);
};

module.exports = {
    printEmbedStatement: p
};
