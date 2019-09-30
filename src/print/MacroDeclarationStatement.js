const prettier = require("prettier");
const { group, join, concat, line, softline, indent } = prettier.doc.builders;

const printOpener = (node, path, print) => {
    const parts = ["{% macro ", path.call(print, "name"), "("];
    const mappedArguments = path.map(print, "arguments");
    const joinedArguments = join(concat([",", line]), mappedArguments);
    parts.push(indent(concat([line, joinedArguments])));
    parts.push(")", line, "%}");
    return group(concat(parts));
};

const p = (node, path, print) => {
    const parts = [printOpener(node, path, print)];
    parts.push(indent(path.call(print, "body")));
    parts.push(softline, "{% endmacro %}");
    return concat(parts);
};

module.exports = {
    printMacroDeclarationStatement: p
};
