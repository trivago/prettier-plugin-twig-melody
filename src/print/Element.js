const prettier = require("prettier");
const {
    concat,
    group,
    line,
    softline,
    indent,
    fill,
    join
} = prettier.doc.builders;
const {
    printChildren,
    preprocessChildren,
    isInlineElement,
    joinChildExpressions,
    PRESERVE_LEADING_WHITESPACE,
    PRESERVE_TRAILING_WHITESPACE
} = require("../util");
const { Node } = require("melody-types");

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

const createInlineMap = nodes => nodes.map(node => isInlineElement(node));

const configureTextStatements = (inlineMap, nodes) => {
    nodes.forEach((node, index) => {
        if (Node.isPrintTextStatement(node)) {
            const hasPreviousInlineElement = index > 0 && inlineMap[index - 1];
            if (hasPreviousInlineElement) {
                node[PRESERVE_LEADING_WHITESPACE] = true;
            }
            const hasFollowingInlineElement =
                index < inlineMap.length - 1 && inlineMap[index + 1];
            if (hasFollowingInlineElement) {
                node[PRESERVE_TRAILING_WHITESPACE] = true;
            }
        }
    });
};

const printChildrenInGroups = (node, path, print, childrenKey) => {
    // For the preprocessed children, get a map showing which elements can
    // be printed inline
    const inlineMap = createInlineMap(node[childrenKey]);
    configureTextStatements(inlineMap, node[childrenKey]);
    const printedChildren = path.map(print, childrenKey);
    // Go over the children, while carrying along a group to be filled
    // - If the element is inline, add it to the group
    // - If the element is not inline, and the group is not empty
    //       => print the group as fill()
    let currentGroup = [];
    const finishedGroups = [];
    printedChildren.forEach((child, index) => {
        if (inlineMap[index]) {
            currentGroup.push(child);
        } else {
            if (currentGroup.length > 0) {
                finishedGroups.push(fill(currentGroup));
            }
            finishedGroups.push(child);
            currentGroup = [];
        }
    });
    if (currentGroup.length > 0) {
        finishedGroups.push(fill(currentGroup));
    }
    return finishedGroups;
};

const p = (node, path, print) => {
    const openingGroup = group(printOpeningTag(node, path, print));

    if (!node.selfClosing) {
        node.children = preprocessChildren(node.children);

        const childGroups = printChildrenInGroups(
            node,
            path,
            print,
            "children"
        );
        const closingTag = concat(["</", node.name, ">"]);
        const finalGroup = [openingGroup];
        const joinedChildren = join(softline, childGroups);
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
