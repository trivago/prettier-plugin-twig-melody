const prettier = require("prettier");
const { group, concat, indent, line, softline, join } = prettier.doc.builders;

const printGroup = (prefix, elements, separator, suffix) => {
    return group(
        concat([
            prefix,
            indent(concat([softline, join(separator, elements)])),
            softline,
            suffix
        ])
    );
};

const p = (node, path, print) => {
    const target = path.call(print, "target");
    const hasArguments = node.arguments && node.arguments.length > 0;
    const printedArguments = hasArguments ? path.map(print, "arguments") : [];
    const args = hasArguments
        ? printGroup("(", printedArguments, concat([",", line]), ")")
        : "";
    const filterName = path.call(print, "name");

    return group(
        concat([target, " |", indent(concat([line, filterName, args]))])
    );
};

module.exports = {
    printFilterExpression: p
};
