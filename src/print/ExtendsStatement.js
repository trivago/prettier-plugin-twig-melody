const prettier = require("prettier");
const { STRING_NEEDS_QUOTES } = require("../util");

const p = (node, path, print) => {
    node[STRING_NEEDS_QUOTES] = true;
    return [
        node.trimLeft ? "{%-" : "{%",
        " extends ",
        path.call(print, "parentName"),
        node.trimRight ? " -%}" : " %}",
    ];
};

module.exports = {
    printExtendsStatement: p,
};
