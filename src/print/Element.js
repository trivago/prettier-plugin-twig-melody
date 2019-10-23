const prettier = require("prettier");
const {
    concat,
    group,
    line,
    hardline,
    softline,
    indent,
    join
} = prettier.doc.builders;
const {
    removeSurroundingWhitespace,
    isInlineElement,
    printChildGroups,
    EXPRESSION_NEEDED
} = require("../util");

const printOpeningTag = (node, path, print) => {
    const opener = "<" + node.name;
    const printedAttributes = printSeparatedList(path, print, "", "attributes");
    const openingTagEnd = node.selfClosing ? concat([line, "/>"]) : ">";
    const hasAttributes = node.attributes && node.attributes.length > 0;

    if (hasAttributes) {
        const separator = node.attributes.length === 1 ? " " : line;
        return concat([
            opener,
            indent(concat([separator, printedAttributes])),
            openingTagEnd
        ]);
    }
    return concat([opener, openingTagEnd]);
};

const printSeparatedList = (path, print, separator, attrName) => {
    return join(concat([separator, line]), path.map(print, attrName));
};

const p = (node, path, print) => {
    // Set a flag in case attributes contain, e.g., a FilterExpression
    node[EXPRESSION_NEEDED] = true;
    const openingGroup = group(printOpeningTag(node, path, print));

    if (!node.selfClosing) {
        node.children = removeSurroundingWhitespace(node.children);

        const childGroups = printChildGroups(node, path, print, "children");
        const closingTag = concat(["</", node.name, ">"]);
        const result = [openingGroup];
        const joinedChildren = concat(childGroups);
        if (isInlineElement(node)) {
            result.push(indent(concat([softline, joinedChildren])), softline);
        } else {
            const childBlock = [];
            if (childGroups.length > 0) {
                childBlock.push(hardline);
            }
            childBlock.push(joinedChildren);
            result.push(indent(concat(childBlock)));
            if (childGroups.length > 0) {
                result.push(hardline);
            }
        }
        result.push(closingTag);

        return isInlineElement(node) ? group(concat(result)) : concat(result);
    }

    return openingGroup;
};

module.exports = {
    printElement: p
};
