const prettier = require("prettier");
const { group, indent, line, hardline, concat } = prettier.doc.builders;
const { EXPRESSION_NEEDED } = require("../util");

const printFor = (node, path, print) => {
    const parts = [node.trimLeft ? "{%-" : "{%", " for "];
    if (node.keyTarget) {
        parts.push(path.call(print, "keyTarget"), ", ");
    }
    parts.push(
        path.call(print, "valueTarget"),
        " in ",
        path.call(print, "sequence")
    );
    if (node.condition) {
        parts.push(
            indent(concat([line, "if ", path.call(print, "condition")]))
        );
    }
    parts.push(concat([line, node.trimRightFor ? "-%}" : "%}"]));
    return group(concat(parts));
};

const indentWithHardline = contents => indent(concat([hardline, contents]));

const p = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    const parts = [printFor(node, path, print)];
    const printedChildren = path.call(print, "body");
    parts.push(indentWithHardline(printedChildren));
    if (node.otherwise) {
        parts.push(
            hardline,
            node.trimLeftElse ? "{%-" : "{%",
            " else ",
            node.trimRightElse ? "-%}" : "%}"
        );
        const printedOtherwise = path.call(print, "otherwise");
        parts.push(indentWithHardline(printedOtherwise));
    }
    parts.push(
        hardline,
        node.trimLeftEndfor ? "{%-" : "{%",
        " endfor ",
        node.trimRight ? "-%}" : "%}"
    );

    return concat(parts);
};

module.exports = {
    printForStatement: p
};
