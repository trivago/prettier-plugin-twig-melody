const path = require("path");
const resolve = require("resolve");

const getPluginPathsFromOptions = options => {
    if (
        options.twigMelodyPlugins &&
        typeof options.twigMelodyPlugins === "string"
    ) {
        const paths = options.twigMelodyPlugins || "";
        return paths.split("|").map(s => s.trim());
    }
    return [];
};

const getProjectRoot = () => {
    const parts = __dirname.split(path.sep);
    let index = parts.length - 1;
    let dirName = parts[index];
    while (dirName !== "node_modules") {
        index--;
        dirName = parts[index];
    }
    const subPath = parts.slice(0, index);
    return path.join(...subPath);
};

const tryLoadPlugin = pluginPath => {
    try {
        const projectRoot = getProjectRoot();
        const requirePath = resolve.sync(path.resolve(projectRoot, pluginPath));
        return eval("require")(requirePath);
    } catch (e) {
        console.error("Could not load plugin path " + pluginPath);
        return undefined;
    }
};

const loadPlugins = pluginPaths => {
    const result = [];
    if (pluginPaths && Array.isArray(pluginPaths)) {
        pluginPaths.forEach(pluginPath => {
            const loadedPlugin = tryLoadPlugin(pluginPath);
            if (loadedPlugin) {
                result.push(loadedPlugin);
            }
        });
    }
    return result;
};

const getAdditionalMelodyExtensions = pluginPaths => {
    let result = [];
    const loadedPlugins = loadPlugins(pluginPaths);
    loadedPlugins.forEach(loadedPlugin => {
        result = result.concat(loadedPlugin.melodyExtensions);
    });
    // Filter out potential "undefined" values
    return result.filter(elem => !!elem);
};

module.exports = {
    getPluginPathsFromOptions,
    tryLoadPlugin,
    loadPlugins,
    getAdditionalMelodyExtensions
};
