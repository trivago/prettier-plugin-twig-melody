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
    const openingTagEnd = node.selfClosing ? " />" : ">";
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
    const elemGroupId = Symbol("element-group-id");
    const openingGroup = group(printOpeningTag(node, path, print));

    if (!node.selfClosing) {
        const printedChildren = path.map(print, "children");
        const indentedChildren = indent(
            concat([ifBreak(softline, ""), ...printedChildren])
        );

        const closingTag = concat(["</", node.name, ">"]);
        return concat([
            group(
                concat([
                    openingGroup,
                    indentedChildren,
                    ifBreak(softline, ""),
                    closingTag
                ])
            )
        ]);
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
