const prettier = require("prettier");
const { group, line, hardline, softline, indent, join } = prettier.doc.builders;
const {
    removeSurroundingWhitespace,
    isInlineElement,
    printChildGroups,
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
} = require("../util");

const printOpeningTag = (node, path, print) => {
    const opener = "<" + node.name;
    const printedAttributes = printSeparatedList(path, print, "", "attributes");
    const openingTagEnd = node.selfClosing ? " />" : ">";
    const hasAttributes = node.attributes && node.attributes.length > 0;

    if (hasAttributes) {
        return [opener, indent([" ", printedAttributes]), openingTagEnd];
    }
    return [opener, openingTagEnd];
};

const printSeparatedList = (path, print, separator, attrName) => {
    return join([separator, line], path.map(print, attrName));
};

const p = (node, path, print) => {
    // Set a flag in case attributes contain, e.g., a FilterExpression
    node[EXPRESSION_NEEDED] = true;
    const openingGroup = group(printOpeningTag(node, path, print));
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = false;

    if (!node.selfClosing) {
        node.children = removeSurroundingWhitespace(node.children);

        const childGroups = printChildGroups(node, path, print, "children");
        const closingTag = ["</", node.name, ">"];
        const result = [openingGroup];
        const joinedChildren = childGroups;
        if (isInlineElement(node)) {
            result.push(indent([softline, joinedChildren]), softline);
        } else {
            const childBlock = [];
            if (childGroups.length > 0) {
                childBlock.push(hardline);
            }
            childBlock.push(joinedChildren);
            result.push(indent(childBlock));
            if (childGroups.length > 0) {
                result.push(hardline);
            }
        }
        result.push(closingTag);

        return isInlineElement(node) ? group(result) : result;
    }

    return openingGroup;
};

module.exports = {
    printElement: p,
};
