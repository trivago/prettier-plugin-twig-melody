const prettier = require("prettier");
const { concat, softline, group, join, indent } = prettier.doc.builders;

const p = (node, path, print) => {
    const opener = concat(["{% ", path.call(print, "name"), " %}"]);
    const printedBody = path.map(print, "body");
    const withoutEmptyStrings = printedBody.filter(s => s !== "");
    const indentedBody = indent(
        concat([softline, join(softline, withoutEmptyStrings)])
    );

    const result = group(
        concat([opener, indentedBody, softline, "{% endblock %}"])
    );
    return result;
};

module.exports = {
    printBlockStatement: p
};
