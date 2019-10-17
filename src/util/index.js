const util = require("./util.js");
const pluginUtil = require("./pluginUtil.js");
const publicSymbols = require("./publicSymbols.js");

const combinedExports = Object.assign({}, util, pluginUtil, publicSymbols);

module.exports = combinedExports;
