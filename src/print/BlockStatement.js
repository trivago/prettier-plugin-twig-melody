const prettier = require("prettier");
const { concat, softline, group, join, indent } = prettier.doc.builders;
const { Node } = require("melody-types");

const printBodyWithChildren = (path, print) => {
    const printedBody = path.map(print, "body");
    const withoutEmptyStrings = printedBody.filter(s => s !== "");
    const joinedContents = join(softline, withoutEmptyStrings);
    return indent(concat([softline, joinedContents]));
};

const p = (node, path, print) => {
    const hasChildren = Array.isArray(node.body) && node.body.length > 0;

    if (hasChildren) {
        const opener = concat(["{% block ", path.call(print, "name"), " %}"]);
        const indentedBody = printBodyWithChildren(path, print);
        const result = group(
            concat([opener, indentedBody, softline, "{% endblock %}"])
        );
        return result;
    } else if (Node.isPrintExpressionStatement(node.body)) {
        const parts = [
            "{% block ",
            path.call(print, "name"),
            " ",
            path.call(print, "body", "value"),
            " %}"
        ];
        return concat(parts);
    }
};

module.exports = {
    printBlockStatement: p
};
