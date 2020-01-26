const {
    NavParser,
    IfChildrenParser,
    ChildrenParser,
    printNav,
    printChildren,
    printIfChildren
} = require("./nav");

const melodyExtension = {
    tags: [NavParser, IfChildrenParser, ChildrenParser]
};

module.exports = {
    melodyExtensions: [melodyExtension],
    printers: {
        CraftCMS_NavStatement: printNav,
        CraftCMS_ChildrenStatement: printChildren,
        CraftCMS_IfChildrenStatement: printIfChildren
    }
};
