const prettier = require("prettier");
const { group, join, line, softline, hardline, indent } = prettier.doc.builders;

const printOpener = (node, path, print) => {
    const parts = [
        node.trimLeft ? "{%-" : "{%",
        " macro ",
        path.call(print, "name"),
        "(",
    ];
    const mappedArguments = path.map(print, "arguments");
    const joinedArguments = join([",", line], mappedArguments);
    parts.push(indent([softline, joinedArguments]));
    parts.push(")", line, node.trimRightMacro ? "-%}" : "%}");
    return group(parts);
};

const p = (node, path, print) => {
    const parts = [printOpener(node, path, print)];
    parts.push(indent([hardline, path.call(print, "body")]));
    parts.push(
        hardline,
        node.trimLeftEndmacro ? "{%-" : "{%",
        " endmacro ",
        node.trimRight ? "-%}" : "%}"
    );
    return parts;
};

module.exports = {
    printMacroDeclarationStatement: p,
};
