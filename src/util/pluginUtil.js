const path = require("path");
const resolve = require("resolve");

const getPluginPathsFromOptions = options => {
    if (options.twigMelodyPlugins && Array.isArray(options.twigMelodyPlugins)) {
        return options.twigMelodyPlugins;
    }
    return [];
};

const tryLoadPlugin = pluginPath => {
    try {
        const requirePath = resolve.sync(
            path.resolve(process.cwd(), pluginPath)
        );
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
