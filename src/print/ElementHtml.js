/**
 * This code is a proof-of-concept adaption of the HTML printer that
 * comes with Prettier.
 */

const { Node } = require("melody-types");
const prettier = require("prettier");
const {
    concat,
    group,
    hardline,
    softline,
    line,
    indent,
    join,
    breakParent,
    ifBreak
} = prettier.doc.builders;

function printOpeningTagStart(node) {
    return `<${node.name}`;
}

function printOpeningTagEnd(node) {
    return node.selfClosing ? "" : ">";
}

function printClosingTag(node) {
    return concat([
        node.selfClosing ? "" : printClosingTagStart(node),
        printClosingTagEnd(node)
    ]);
}

function printClosingTagStart(node) {
    return `</${node.name}`;
}

function printClosingTagEnd(node) {
    return node.selfClosing ? "/>" : ">";
}

function forceBreakContent(node) {
    return (
        forceBreakChildren(node) ||
        (Node.isElement(node) &&
            node.children.length !== 0 &&
            (["body", "template", "script", "style"].indexOf(node.name) !==
                -1 ||
                node.children.some(child => hasNonTextChild(child))))
    );
}

/** spaces between children */
function forceBreakChildren(node) {
    return (
        Node.isElement(node) &&
        node.children.length !== 0 &&
        ["html", "head", "ul", "ol", "select"].indexOf(node.name) !== -1
    );
}

function hasNonTextChild(node) {
    // return node.children && node.children.some(child => child.type !== "text");
    return (
        node.children &&
        node.children.some(child => !Node.isPrintTextStatement(child))
    );
}

const printOpeningTagHtml = (path, options, print) => {
    const node = path.getValue();
    const selfClosingSpace = node.selfClosing ? " " : "";
    return concat([
        printOpeningTagStart(node),
        !node.attributes || node.attributes.length === 0
            ? selfClosingSpace
            : concat([
                  indent(
                      concat([line, join(line, path.map(print, "attributes"))])
                  ),
                  node.isSelfClosing ? line : softline
              ]),
        node.isSelfClosing ? "" : printOpeningTagEnd(node)
    ]);
};

const printElement = (node, path, print, options) => {
    const elemGroupId = Symbol("element-group-id");
    const attrGroupId = Symbol("attr-group-id");
    return concat([
        group(
            concat([
                group(printOpeningTagHtml(path, options, print), {
                    id: attrGroupId
                }),
                node.children.length === 0
                    ? ""
                    : concat([
                          forceBreakContent(node) ? breakParent : "",
                          indent(concat([printChildren(path, options, print)])),
                          softline
                      ])
            ]),
            { id: elemGroupId }
        ),
        printClosingTag(node)
    ]);
};

function printBetweenLine(prevNode, nextNode) {
    return softline;
}

function forceNextEmptyLine(node) {
    return false;
    // return (
    //   isFrontMatterNode(node) ||
    //   (node.next &&
    //     node.sourceSpan.end.line + 1 < node.next.sourceSpan.start.line)
    // );
}

function printChildren(path, options, print) {
    const node = path.getValue();

    if (forceBreakChildren(node)) {
        return concat([
            breakParent,
            concat(
                path.map(childPath => {
                    const childNode = childPath.getValue();
                    const prevBetweenLine = !childNode.prev
                        ? ""
                        : printBetweenLine(childNode.prev, childNode);
                    return concat([
                        !prevBetweenLine
                            ? ""
                            : concat([
                                  prevBetweenLine,
                                  forceNextEmptyLine(childNode.prev)
                                      ? hardline
                                      : ""
                              ]),
                        childPath.call(print)
                    ]);
                }, "children")
            )
        ]);
    }

    const groupIds = node.children.map(() => Symbol(""));
    return concat(
        path.map((childPath, childIndex) => {
            const childNode = childPath.getValue();

            if (Node.isPrintTextStatement(childNode)) {
                return childPath.call(print);
            }

            return concat(
                [].concat(
                    group(
                        concat([
                            group(concat([childPath.call(print)]), {
                                id: groupIds[childIndex]
                            })
                        ])
                    )
                )
            );
        }, "children")
    );
}

module.exports = {
    printElement
};
