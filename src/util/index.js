const pluginUtil = require("./pluginUtil.js");
const publicSymbols = require("./publicSymbols.js");
const publicFunctions = require("./publicFunctions.js");
const printFunctions = require("./printFunctions.js");

const combinedExports = Object.assign(
    {},
    pluginUtil,
    publicSymbols,
    publicFunctions,
    printFunctions
);

module.exports = combinedExports;
