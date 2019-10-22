const util = require("./util.js");
const pluginUtil = require("./pluginUtil.js");
const publicSymbols = require("./publicSymbols.js");
const publicFunctions = require("./publicFunctions.js");

const combinedExports = Object.assign(
    {},
    util,
    pluginUtil,
    publicSymbols,
    publicFunctions
);

module.exports = combinedExports;
