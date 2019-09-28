const prettier = require("prettier");
const { group, concat, join, line, indent } = prettier.doc.builders;

const printImportDeclaration = node => {
    const parts = [node.key.name];
    if (node.key.name !== node.alias.name) {
        parts.push(" as ", node.alias.name);
    }
    return concat(parts);
};

const p = (node, path, print) => {
    // Unfortunately, ImportDeclaration has different
    // formatting needs here compared to when used
    // standalone. Therefore, we collect them manually.
    const mappedImports = node.imports.map(printImportDeclaration);
    const indentedParts = indent(
        concat([line, join(concat([",", line]), mappedImports)])
    );
    return group(
        concat([
            "{% from ",
            path.call(print, "source"),
            " import",
            indentedParts,
            line,
            "%}"
        ])
    );
};

module.exports = {
    printFromStatement: p
};
