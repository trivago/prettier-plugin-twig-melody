const path = require("path");
const resolve = require("resolve");

const getPluginPathsFromOptions = options => {
    if (options.twigMelodyPlugins && Array.isArray(options.twigMelodyPlugins)) {
        return options.twigMelodyPlugins.map(s => s.trim());
    }
    return [];
};

const getProjectRoot = () => {
    const parts = __dirname.split(path.sep);
    let index = parts.length - 1;
    let dirName = parts[index];
    while (dirName !== "node_modules" && index > 0) {
        index--;
        dirName = parts[index];
    }
    // If we are not inside a "node_modules" folder, just
    // strip away "src" and "util"
    if (index === 0) {
        index = parts.length - 2;
    }
    const subPath = parts.slice(0, index);
    const joined = path.join(...subPath);

    // This might contain something like
    //   Users/jdoe/project
    // => leading slash missing, which can cause
    // problems. To stay OS independent, let's
    // re-add everything that came before the result
    // we have so far.
    const foundIndex = __dirname.indexOf(joined);
    return __dirname.slice(0, foundIndex) + joined;
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
