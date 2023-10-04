const prettier = require("prettier");

const p = (node, path, print) => {
    return [
        node.trimLeft ? "{%-" : "{%",
        " do ",
        path.call(print, "value"),
        node.trimRight ? " -%}" : " %}",
    ];
};

module.exports = {
    printDoStatement: p,
};
