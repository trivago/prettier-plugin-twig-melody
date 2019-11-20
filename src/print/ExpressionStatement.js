const prettier = require("prettier");
const { concat, group, indent, line } = prettier.doc.builders;
const { EXPRESSION_NEEDED, STRING_NEEDS_QUOTES } = require("../util");

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;
    const opener = node.trimLeft ? "{{-" : "{{";
    const closing = node.trimRight ? "-}}" : "}}";
    return group(
        concat([
            opener,
            indent(concat([line, path.call(print, "value")])),
            line,
            closing
        ])
    );
};

module.exports = {
    printExpressionStatement: p
};
