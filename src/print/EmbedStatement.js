const prettier = require("prettier");
const { concat, indent, hardline, line, group } = prettier.doc.builders;
const {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    printChildBlock
} = require("../util");

const printOpener = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;
    const parts = [
        node.trimLeft ? "{%-" : "{%",
        " embed ",
        path.call(print, "parent")
    ];
    if (node.argument) {
        parts.push(
            indent(concat([line, "with ", path.call(print, "argument")]))
        );
    }
    parts.push(concat([line, node.trimRightEmbed ? "-%}" : "%}"]));
    return group(concat(parts));
};

const p = (node, path, print) => {
    const children = printChildBlock(node, path, print, "blocks");
    const printedOpener = printOpener(node, path, print);
    const closing = concat([
        hardline,
        node.trimLeftEndembed ? "{%-" : "{%",
        " endembed ",
        node.trimRight ? "-%}" : "%}"
    ]);

    return concat([printedOpener, children, closing]);
};

module.exports = {
    printEmbedStatement: p
};
