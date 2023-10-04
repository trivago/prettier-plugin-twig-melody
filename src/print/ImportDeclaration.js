const prettier = require("prettier");
const { group, line, indent } = prettier.doc.builders;
const { STRING_NEEDS_QUOTES } = require("../util");

const p = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = true;
    return group([
        node.trimLeft ? "{%-" : "{%",
        " import ",
        path.call(print, "key"),
        indent([line, "as ", path.call(print, "alias")]),
        line,
        node.trimRight ? "-%}" : "%}",
    ]);
};

module.exports = {
    printImportDeclaration: p,
};
