const prettier = require("prettier");
const { concat, group, line, indent, join } = prettier.doc.builders;

const printOpeningTag = (prefix, attributes, suffix) => {
    const attrGroupId = Symbol("element-attr-group-id");
    return group(concat([prefix, indent(concat([line, attributes])), suffix]), {
        id: attrGroupId
    });
};

const printElementChildren = children => {
    return group(concat([indent(concat([children]))]));
};

const printSeparatedList = (path, print, separator, attrName) => {
    return join(concat([separator, line]), path.map(print, attrName));
};

const p = (node, path, print) => {
    const docs = [];
    const opener = "<" + node.name;
    const hasAttributes = node.attributes && node.attributes.length > 0;
    const openingTagEnd = node.selfClosing ? " />" : ">";

    if (hasAttributes) {
        docs.push(
            printOpeningTag(
                opener,
                printSeparatedList(path, print, "", "attributes"),
                openingTagEnd
            )
        );
    } else {
        docs.push(concat([opener, openingTagEnd]));
    }

    if (!node.selfClosing) {
        const children = join("", path.map(print, "children"));
        docs.push(printElementChildren(children));

        // const childDocs = [];
        // const nonBreakingElems = [];
        // path.each(subPath => {
        //     const childNode = subPath.getValue();
        //     if (util.isNonBreaking(childNode)) {
        //         nonBreakingElems.push(childNode);
        //     } else {
        //         // Output collected non-breaking elements first
        //         // ...
        //         // Then output breaking element
        //         // ...
        //     }
        //     if (!Node.isPrintTextStatement(childNode)) {
        //         // if (true) {
        //         childDocs.push(subPath.call(print));
        //     } else {
        //         // Within this node is a StringLiteral, hence node.value.value
        //         childDocs.push(util.textToDocs(childNode.value.value));
        //     }
        // }, "children");

        // docs.push(indent(concat(childDocs)));

        docs.push(concat(["</", node.name, ">"]));
    }

    const attrGroupId = Symbol("attr-group-id");
    return group(concat(docs), { id: attrGroupId });
    // return concat(docs);
};

module.exports = {
    printElement: p
};
