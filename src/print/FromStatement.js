const prettier = require("prettier");
const { group, concat, join, line, indent } = prettier.doc.builders;
const { STRING_NEEDS_QUOTES } = require("../util");

const printImportDeclaration = node => {
    const parts = [node.key.name];
    if (node.key.name !== node.alias.name) {
        parts.push(" as ", node.alias.name);
    }
    return concat(parts);
};

const p = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = true;
    // Unfortunately, ImportDeclaration has different
    // formatting needs here compared to when used
    // standalone. Therefore, we collect them manually.
    const mappedImports = node.imports.map(printImportDeclaration);
    const indentedParts = indent(
        concat([line, join(concat([",", line]), mappedImports)])
    );
    return group(
        concat([
            node.trimLeft ? "{%-" : "{%",
            " from ",
            path.call(print, "source"),
            " import",
            indentedParts,
            line,
            node.trimRight ? "-%}" : "%}"
        ])
    );
};

module.exports = {
    printFromStatement: p
};
