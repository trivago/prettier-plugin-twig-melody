const prettier = require("prettier");
const {
    group,
    join,
    concat,
    line,
    softline,
    hardline,
    indent
} = prettier.doc.builders;

const printOpener = (node, path, print) => {
    const parts = [
        node.trimLeft ? "{%-" : "{%",
        " macro ",
        path.call(print, "name"),
        "("
    ];
    const mappedArguments = path.map(print, "arguments");
    const joinedArguments = join(concat([",", line]), mappedArguments);
    parts.push(indent(concat([softline, joinedArguments])));
    parts.push(")", line, node.trimRightMacro ? "-%}" : "%}");
    return group(concat(parts));
};

const p = (node, path, print) => {
    const parts = [printOpener(node, path, print)];
    parts.push(indent(concat([hardline, path.call(print, "body")])));
    parts.push(
        hardline,
        node.trimLeftEndmacro ? "{%-" : "{%",
        " endmacro ",
        node.trimRight ? "-%}" : "%}"
    );
    return concat(parts);
};

module.exports = {
    printMacroDeclarationStatement: p
};
