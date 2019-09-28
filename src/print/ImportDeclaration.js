const prettier = require("prettier");
const { group, concat, line, indent } = prettier.doc.builders;

const p = (node, path, print) => {
    return group(
        concat([
            "{% import ",
            path.call(print, "key"),
            indent(concat([line, "as ", path.call(print, "alias")])),
            line,
            "%}"
        ])
    );
};

module.exports = {
    printImportDeclaration: p
};
