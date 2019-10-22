const prettier = require("prettier");
const { group, indent, line, hardline, concat } = prettier.doc.builders;
const { EXPRESSION_NEEDED, printChildBlock } = require("../util");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    const hasAlternate =
        Array.isArray(node.alternate) && node.alternate.length > 0;
    const ifClause = group(
        concat([
            "{% if",
            indent(concat([line, path.call(print, "test")])),
            line,
            "%}"
        ])
    );
    const ifBody = printChildBlock(node, path, print, "consequent");
    const parts = [ifClause, ifBody];
    if (hasAlternate) {
        parts.push(hardline, "{% else %}");
        parts.push(printChildBlock(node, path, print, "alternate"));
    }
    parts.push(hardline, "{% endif %}");
    return concat(parts);
};

module.exports = {
    printIfStatement: p
};
