"use strict";

const util = require("./util.js");
const { Node } = require("melody-types");
const prettier = require("prettier");
const {
    concat,
    group,
    hardline,
    softline,
    line,
    indent,
    join
} = prettier.doc.builders;

const printFunctions = {};

const print = (path, options, print) => {
    const node = path.getValue();
    const nodeType = node.constructor.name;
    if (printFunctions[nodeType]) {
        return printFunctions[nodeType](node, path, print, options);
    }
    console.warn(`No print function available for node type "${nodeType}"`);
    return "";
};

/**
 * Prettier printing works with a so-called FastPath object, which is
 * passed into many of the following methods through a "path" argument.
 * This is basically a stack, and the way to do do recursion in Prettier
 * is through this path object.
 *
 * For example, you might expect to write something like this:
 *
 * BinaryExpression.prototype.prettyPrint = _ => {
 *     return concat([
 *         this.left.prettyPrint(),
 *         " ",
 *         this.operator,
 *         " ",
 *         this.right.prettyPrint()
 *     ]);
 * };
 *
 * Here, the prettyPrint() method of BinaryExpression calls the prettyPrint()
 * methods of the left and right operands. However, it actually has to be
 * done like this in Prettier plugins:
 *
 * BinaryExpression.prototype.prettyPrint = (path, print) => {
 *     const docs = [
 *         path.call(print, "left"),
 *         " ",
 *         this.operator,
 *         " ",
 *         path.call(print, "right")
 *     ];
 *     return concat(docs);
 * };
 *
 * The first argument to path.call() seems to always be the print function
 * that is passed in (a case of bad interface design and over-complication?),
 * at least I have not found any other instance. The arguments after that are
 * field names that are pulled from the node and put on the stack for the
 * next processing step(s) => this is how recursion is done.
 *
 */

printFunctions["SequenceExpression"] = (node, path, print) => {
    const docs = [];
    // docs.push(group(join(hardline, path.map(print, "expressions"))), hardline);
    docs.push(group(join(line, path.map(print, "expressions"))));
    return concat(docs);
};

printFunctions["ConstantValue"] = node => {
    return concat([node.value]);
};

printFunctions["StringLiteral"] = node => {
    return concat([node.value]);
};

printFunctions["Identifier"] = node => {
    return concat([node.name]);
};

printFunctions["UnaryExpression"] = (node, path, print) => {
    const docs = [node.operator, path.call(print, "argument")];

    return concat(docs);
};

printFunctions["BinaryExpression"] = (node, path, print) => {
    const docs = [
        path.call(print, "left"),
        " ",
        node.operator,
        " ",
        path.call(print, "right")
    ];
    return concat(docs);
};

printFunctions["ConditionalExpression"] = (node, path, print) => {
    const docs = [
        path.call(print, "test"),
        " ",
        "?",
        " ",
        path.call(print, "consequent"),
        " ",
        ":",
        " ",
        path.call(print, "alternate")
    ];

    return concat(docs);
};

printFunctions["SequenceExpression"] = (node, path, print) => {
    const docs = [];
    docs.push(group(join(hardline, path.map(print, "expressions"))), hardline);
    return concat(docs);
};

const printGroup = (prefix, elements, suffix) => {
    return group(
        concat([
            prefix,
            indent(
                concat([
                    line,
                    elements
                    // join(concat([separator, line]), path.map(print, attrName))
                ])
            ),
            suffix
        ])
    );
};

const printSeparatedList = (path, print, separator, attrName) => {
    return join(concat([separator, line]), path.map(print, attrName));
};

printFunctions["Element"] = (node, path, print) => {
    const docs = [];
    const opener = "<" + node.name;
    const hasAttributes = node.attributes && node.attributes.length > 0;
    const openingTagEnd = node.selfClosing ? " />" : ">";

    if (hasAttributes) {
        docs.push(
            printGroup(
                opener,
                printSeparatedList(path, print, "", "attributes"),
                openingTagEnd
            )
        );
    } else {
        docs.push(concat([opener, openingTagEnd]));
    }

    if (!node.selfClosing) {
        // Too simple: docs.push(indent(join(hardline, path.map(print, 'children'))));

        const childDocs = [];
        const nonBreakingElems = [];
        path.each(subPath => {
            const childNode = subPath.getValue();
            if (util.isNonBreaking(childNode)) {
                nonBreakingElems.push(childNode);
            } else {
                // Output collected non-breaking elements first
                // ...
                // Then output breaking element
                // ...
            }
            if (!Node.isPrintTextStatement(childNode)) {
                // if (true) {
                childDocs.push(subPath.call(print));
            } else {
                // Within this node is a StringLiteral, hence node.value.value
                childDocs.push(util.textToDocs(childNode.value.value));
            }
        }, "children");

        docs.push(indent(concat(childDocs)));

        // docs.push(dedent(concat(["</", node.name, ">"])));
        docs.push(concat(["</", node.name, ">"]));
    }

    return concat(docs);
};

const isDynamicValue = node => {
    return (
        Node.isIdentifier(node) ||
        Node.isMemberExpression(node) ||
        Node.isUnaryExpression(node) ||
        Node.isBinaryExpression(node) ||
        Node.isBinaryConcatExpression(node) ||
        Node.isConditionalExpression(node) ||
        Node.isCallExpression(node) ||
        Node.isFilterExpression(node)
    );
};

printFunctions["Attribute"] = (node, path, print = print) => {
    const docs = [path.call(print, "name"), '="'];

    if (isDynamicValue(node.value)) {
        docs.push("{{ ");
    }
    docs.push(path.call(print, "value"));
    if (isDynamicValue(node.value)) {
        docs.push(" }}");
    }

    docs.push('"');
    return concat(docs);
};

printFunctions["PrintTextStatement"] = (node, path, print) => {
    // Replace the trailing newline with hardline for better readability
    // const trailingNewlineRegex = /\n[^\S\n]*?$/;
    // const hasTrailingNewline = trailingNewlineRegex.test(this.value);
    // const value = hasTrailingNewline
    //     ? this.value.replace(trailingNewlineRegex, '')
    //     : this.value;
    // return concat([
    //     concat(replaceNewlines(value, literalline)),
    //     hasTrailingNewline ? hardline : '',
    // ]);
    return path.call(print, "value");
};

printFunctions["PrintExpressionStatement"] = (node, path, print) => {
    const docs = ["{{ ", path.call(print, "value"), " }}"];
    return concat(docs);
};

printFunctions["MemberExpression"] = (node, path, print) => {
    return concat([
        path.call(print, "object"),
        ".",
        path.call(print, "property")
    ]);
};

printFunctions["FilterExpression"] = (path, print) => {
    const docs = [
        indent(path.call(print, "target")),
        hardline,
        "} | ",
        this.name
    ];
    if (this.arguments && this.arguments.length > 0) {
        docs.push("(");
        docs.push(path.call(print, "arguments"));
        docs.push(")");
    }
    return concat(docs);
};

printFunctions["ObjectExpression"] = (node, path, print) => {
    const docs = [
        "{",
        hardline,
        indent(path.map(print, "properties")),
        hardline,
        "}"
    ];

    return concat(docs);
};

printFunctions["ObjectProperty"] = (node, path, print) => {
    return concat(path.call(print, "key"), ": ", path.call(print, "value"));
};

module.exports = {
    print
};
