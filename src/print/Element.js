const prettier = require("prettier");
const { concat, group, line, softline, indent, join } = prettier.doc.builders;
const { printChildren } = require("../util");

const printOpeningTag = (node, path, print) => {
    const opener = "<" + node.name;
    const printedAttributes = printSeparatedList(path, print, "", "attributes");
    const openingTagEnd = node.selfClosing ? concat([line, "/>"]) : ">";
    const hasAttributes = node.attributes && node.attributes.length > 0;

    if (hasAttributes) {
        return concat([
            opener,
            indent(concat([line, printedAttributes])),
            openingTagEnd
        ]);
    }
    return concat([opener, openingTagEnd]);
};

const printElementChildren = children => {
    return group(concat([indent(concat([children]))]));
};

const printSeparatedList = (path, print, separator, attrName) => {
    return join(concat([separator, line]), path.map(print, attrName));
};

const p = (node, path, print) => {
    const openingGroup = group(printOpeningTag(node, path, print));

    if (!node.selfClosing) {
        const indentedChildren = printChildren(path, print, "children");
        const closingTag = concat(["</", node.name, ">"]);
        const result = group(
            concat([openingGroup, indentedChildren, softline, closingTag])
        );
        return result;
    }

    return openingGroup;
};

module.exports = {
    printElement: p
};
