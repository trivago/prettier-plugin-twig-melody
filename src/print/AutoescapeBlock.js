const prettier = require("prettier");
const { concat, softline, group } = prettier.doc.builders;
const { printChildren, quoteChar } = require("../util");

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
    parts.push(printChildren(path, print, "expressions"));
    parts.push(softline, "{% endautoescape %}");
    const result = group(concat(parts));
    return result;
};

module.exports = {
    printAutoescapeBlock: p
};
