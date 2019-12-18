const prettier = require("prettier");
const { group, concat, line, indent } = prettier.doc.builders;
const { STRING_NEEDS_QUOTES } = require("../util");

const p = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = true;
    return group(
        concat([
            node.trimLeft ? "{%-" : "{%",
            " import ",
            path.call(print, "key"),
            indent(concat([line, "as ", path.call(print, "alias")])),
            line,
            node.trimRight ? "-%}" : "%}"
        ])
    );
};

module.exports = {
    printImportDeclaration: p
};
