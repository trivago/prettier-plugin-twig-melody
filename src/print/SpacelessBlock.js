const prettier = require("prettier");
const { concat, softline, group, join, indent } = prettier.doc.builders;

const printBodyWithChildren = (path, print) => {
    const printedBody = path.map(print, "body");
    const withoutEmptyStrings = printedBody.filter(s => s !== "");
    const joinedContents = join(softline, withoutEmptyStrings);
    return indent(concat([softline, joinedContents]));
};

const p = (node, path, print) => {
    const opener = "{% spaceless %}";
    const indentedBody = printBodyWithChildren(path, print);
    const result = group(
        concat([opener, indentedBody, softline, "{% endspaceless %}"])
    );
    return result;
};

module.exports = {
    printSpacelessBlock: p
};
