const prettier = require("prettier");
const { concat, hardline } = prettier.doc.builders;
const { printChildBlock, quoteChar } = require("../util");

const createOpener = (node, options) => {
    return concat([
        "{% autoescape ",
        quoteChar(options),
        node.escapeType || "html",
        quoteChar(options),
        " %}"
    ]);
};

const p = (node, path, print, options) => {
    const parts = [createOpener(node, options)];
    parts.push(printChildBlock(node, path, print, "expressions"));
    parts.push(hardline, "{% endautoescape %}");

    return concat(parts);
};

module.exports = {
    printAutoescapeBlock: p
};
