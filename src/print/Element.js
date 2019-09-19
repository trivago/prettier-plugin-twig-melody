const prettier = require("prettier");
const {
    concat,
    group,
    line,
    softline,
    indent,
    join,
    ifBreak
} = prettier.doc.builders;

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
        const printedChildren = path.map(print, "children");
        const withoutEmptyStrings = printedChildren.filter(s => s !== "");
        const indentedChildren = indent(
            concat([softline, join(softline, withoutEmptyStrings)])
        );

        const closingTag = concat(["</", node.name, ">"]);
        const result = group(
            concat([openingGroup, indentedChildren, softline, closingTag])
        );
        return result;
    }

    return openingGroup;
};

function printChildren(path, options, print) {
    const node = path.getValue();

    const groupIds = node.children.map(() => Symbol(""));
    return concat(
        path.map((childPath, childIndex) => {
            return group(
                concat([
                    group(concat([childPath.call(print)]), {
                        id: groupIds[childIndex]
                    })
                ])
            );
        }, "children")
    );
}

module.exports = {
    printElement: p
};
