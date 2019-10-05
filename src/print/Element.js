const prettier = require("prettier");
const { concat, group, line, softline, indent, join } = prettier.doc.builders;
const {
    removeSurroundingWhitespace,
    isInlineElement,
    printChildGroups
} = require("../util");

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

const printSeparatedList = (path, print, separator, attrName) => {
    return join(concat([separator, line]), path.map(print, attrName));
};

const p = (node, path, print) => {
    const openingGroup = group(printOpeningTag(node, path, print));

    if (!node.selfClosing) {
        node.children = removeSurroundingWhitespace(node.children);

        const childGroups = printChildGroups(node, path, print, "children");
        const closingTag = concat(["</", node.name, ">"]);
        const finalGroup = [openingGroup];
        const joinedChildren = concat(childGroups);
        if (isInlineElement(node)) {
            finalGroup.push(indent(joinedChildren));
        } else {
            finalGroup.push(
                indent(concat([softline, joinedChildren])),
                softline
            );
        }
        finalGroup.push(closingTag);

        const result = group(concat(finalGroup));
        return result;
    }

    return openingGroup;
};

module.exports = {
    printElement: p
};
