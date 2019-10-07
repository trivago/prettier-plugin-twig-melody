const prettier = require("prettier");
const { concat, hardline } = prettier.doc.builders;
const { printChildBlock, quoteChar } = require("../util");

const createOpener = node => {
    return concat([
        "{% autoescape ",
        quoteChar(),
        node.escapeType || "html",
        quoteChar(),
        " %}"
    ]);
};

const p = (node, path, print) => {
    const parts = [createOpener(node)];
    parts.push(printChildBlock(node, path, print, "expressions"));
    parts.push(hardline, "{% endautoescape %}");

    return concat(parts);
};

module.exports = {
    printAutoescapeBlock: p
};
