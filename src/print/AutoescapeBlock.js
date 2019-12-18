const prettier = require("prettier");
const { concat, hardline } = prettier.doc.builders;
const { printChildBlock, quoteChar } = require("../util");

const createOpener = (node, options) => {
    return concat([
        node.trimLeft ? "{%-" : "{%",
        " autoescape ",
        quoteChar(options),
        node.escapeType || "html",
        quoteChar(options),
        " ",
        node.trimRightAutoescape ? "-%}" : "%}"
    ]);
};

const p = (node, path, print, options) => {
    const parts = [createOpener(node, options)];
    parts.push(printChildBlock(node, path, print, "expressions"));
    parts.push(
        hardline,
        node.trimLeftEndautoescape ? "{%-" : "{%",
        " endautoescape ",
        node.trimRight ? "-%}" : "%}"
    );

    return concat(parts);
};

module.exports = {
    printAutoescapeBlock: p
};
