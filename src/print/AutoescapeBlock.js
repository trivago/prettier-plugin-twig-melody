const prettier = require("prettier");
const { concat, softline, indent, hardline, group } = prettier.doc.builders;
const {
    removeSurroundingWhitespace,
    printChildGroups,
    quoteChar
} = require("../util");

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

    node.expressions = removeSurroundingWhitespace(node.expressions);
    const childGroups = printChildGroups(node, path, print, "expressions");
    const expressions = indent(group(concat([hardline, ...childGroups])));

    parts.push(expressions);
    parts.push(hardline, "{% endautoescape %}");

    return concat(parts);
};

module.exports = {
    printAutoescapeBlock: p
};
