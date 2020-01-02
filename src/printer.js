"use strict";

const { printSequenceExpression } = require("./print/SequenceExpression.js");
const { printBinaryExpression } = require("./print/BinaryExpression.js");
const {
    printConditionalExpression
} = require("./print/ConditionalExpression.js");
const { printElement } = require("./print/Element.js");
const { printAttribute } = require("./print/Attribute.js");
const { printIdentifier } = require("./print/Identifier.js");
const { printExpressionStatement } = require("./print/ExpressionStatement.js");
const { printMemberExpression } = require("./print/MemberExpression.js");
const { printFilterExpression } = require("./print/FilterExpression.js");
const { printObjectExpression } = require("./print/ObjectExpression.js");
const { printObjectProperty } = require("./print/ObjectProperty.js");
const { printCallExpression } = require("./print/CallExpression.js");
const { printTestExpression } = require("./print/TestExpression.js");
const { printUnaryExpression } = require("./print/UnaryExpression.js");
const { printUnarySubclass } = require("./print/UnarySubclass.js");
const { printTextStatement } = require("./print/TextStatement.js");
const { printStringLiteral } = require("./print/StringLiteral.js");
const { printArrayExpression } = require("./print/ArrayExpression.js");
const { printSliceExpression } = require("./print/SliceExpression.js");
const { printUseStatement } = require("./print/UseStatement.js");
const { printAliasExpression } = require("./print/AliasExpression.js");
const { printBlockStatement } = require("./print/BlockStatement.js");
const { printSpacelessBlock } = require("./print/SpacelessBlock.js");
const { printAutoescapeBlock } = require("./print/AutoescapeBlock.js");
const { printFlushStatement } = require("./print/FlushStatement.js");
const { printIncludeStatement } = require("./print/IncludeStatement.js");
const { printIfStatement } = require("./print/IfStatement.js");
const { printMountStatement } = require("./print/MountStatement.js");
const { printForStatement } = require("./print/ForStatement.js");
const { printSetStatement } = require("./print/SetStatement.js");
const { printDoStatement } = require("./print/DoStatement.js");
const { printExtendsStatement } = require("./print/ExtendsStatement.js");
const { printEmbedStatement } = require("./print/EmbedStatement.js");
const { printImportDeclaration } = require("./print/ImportDeclaration.js");
const { printFromStatement } = require("./print/FromStatement.js");
const { printTwigComment } = require("./print/TwigComment.js");
const { printHtmlComment } = require("./print/HtmlComment.js");
const {
    printMacroDeclarationStatement
} = require("./print/MacroDeclarationStatement.js");
const {
    printFilterBlockStatement
} = require("./print/FilterBlockStatement.js");
const {
    printVariableDeclarationStatement
} = require("./print/VariableDeclarationStatement.js");
const {
    printNamedArgumentExpression
} = require("./print/NamedArgumentExpression.js");
const {
    getPluginPathsFromOptions,
    loadPlugins
} = require("./util/pluginUtil.js");
const { ORIGINAL_SOURCE } = require("./parser");

const printFunctions = {};

const applyPlugin = loadedPlugin => {
    if (loadedPlugin && loadedPlugin.printers) {
        for (const printerName of Object.keys(loadedPlugin.printers)) {
            printFunctions[printerName] = loadedPlugin.printers[printerName];
        }
    }
};

const applyPlugins = options => {
    const pluginPaths = getPluginPathsFromOptions(options);
    const loadedPlugins = loadPlugins(pluginPaths);
    loadedPlugins.forEach(plugin => {
        applyPlugin(plugin);
    });
};

let originalSource = "";
const print = (path, options, print) => {
    applyPlugins(options);

    const node = path.getValue();
    const nodeType = node.constructor.name;

    // Try to save original source from AST root
    if (node[ORIGINAL_SOURCE]) {
        originalSource = node[ORIGINAL_SOURCE];
    }

    if (options.twigPrintWidth) {
        options.printWidth = options.twigPrintWidth;
    }

    // Happy path
    if (printFunctions[nodeType]) {
        return printFunctions[nodeType](node, path, print, options);
    }

    console.warn(`No print function available for node type "${nodeType}"`);

    // 1st fallback: Use originalSource property on AST node
    if (node.originalSource) {
        return node.originalSource;
    }
    // 2nd fallback: Use the node's loc property with the
    // originalSource property on the AST root
    if (canGetSubstringForNode(node)) {
        return getSubstringForNode(node);
    }

    return "";
};

const getSubstringForNode = node =>
    originalSource.substring(node.loc.start.index, node.loc.end.index);

const canGetSubstringForNode = node =>
    originalSource &&
    node.loc &&
    node.loc.start &&
    node.loc.end &&
    node.loc.start.index &&
    node.loc.end.index;
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

printFunctions["SequenceExpression"] = printSequenceExpression;
printFunctions["ConstantValue"] = node => {
    return node.value;
};
printFunctions["StringLiteral"] = printStringLiteral;
printFunctions["Identifier"] = printIdentifier;
printFunctions["UnaryExpression"] = printUnaryExpression;
printFunctions["BinaryExpression"] = printBinaryExpression;
printFunctions["BinarySubclass"] = printBinaryExpression;
printFunctions["UnarySubclass"] = printUnarySubclass;
printFunctions["TestExpression"] = printTestExpression;
printFunctions["ConditionalExpression"] = printConditionalExpression;
printFunctions["Element"] = printElement;
printFunctions["Attribute"] = printAttribute;
printFunctions["PrintTextStatement"] = printTextStatement;
printFunctions["PrintExpressionStatement"] = printExpressionStatement;
printFunctions["MemberExpression"] = printMemberExpression;
printFunctions["FilterExpression"] = printFilterExpression;
printFunctions["ObjectExpression"] = printObjectExpression;
printFunctions["ObjectProperty"] = printObjectProperty;

// Return value has to be a string
const returnNodeValue = node => "" + node.value;

printFunctions["Fragment"] = (node, path, print) => {
    return path.call(print, "value");
};
printFunctions["NumericLiteral"] = returnNodeValue;
printFunctions["BooleanLiteral"] = returnNodeValue;
printFunctions["NullLiteral"] = () => "null";
printFunctions["ArrayExpression"] = printArrayExpression;
printFunctions["CallExpression"] = printCallExpression;
printFunctions["NamedArgumentExpression"] = printNamedArgumentExpression;
printFunctions["SliceExpression"] = printSliceExpression;
printFunctions["UseStatement"] = printUseStatement;
printFunctions["AliasExpression"] = printAliasExpression;
printFunctions["BlockStatement"] = printBlockStatement;
printFunctions["SpacelessBlock"] = printSpacelessBlock;
printFunctions["AutoescapeBlock"] = printAutoescapeBlock;
printFunctions["FlushStatement"] = printFlushStatement;
printFunctions["IncludeStatement"] = printIncludeStatement;
printFunctions["IfStatement"] = printIfStatement;
printFunctions["MountStatement"] = printMountStatement;
printFunctions["ForStatement"] = printForStatement;
printFunctions["BinaryConcatExpression"] = printBinaryExpression;
printFunctions["SetStatement"] = printSetStatement;
printFunctions[
    "VariableDeclarationStatement"
] = printVariableDeclarationStatement;
printFunctions["DoStatement"] = printDoStatement;
printFunctions["ExtendsStatement"] = printExtendsStatement;
printFunctions["EmbedStatement"] = printEmbedStatement;
printFunctions["FilterBlockStatement"] = printFilterBlockStatement;
printFunctions["ImportDeclaration"] = printImportDeclaration;
printFunctions["FromStatement"] = printFromStatement;
printFunctions["MacroDeclarationStatement"] = printMacroDeclarationStatement;
printFunctions["TwigComment"] = printTwigComment;
printFunctions["HtmlComment"] = printHtmlComment;

// Fallbacks
printFunctions["String"] = s => s;

module.exports = {
    print
};
