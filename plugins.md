# Plugins for prettier-plugin-twig-melody

Since the Melody parser might be extended through custom Twig syntax, it can become necessary to extend the Prettier plugin, as well. Such plugins have to fulfill certain requirements.

## Finding plugins

In order for `prettier-plugin-twig-melody` to find a plugin, there are the following ways:

### Prettier option

Use the option `prettier-plugin-twig-melody-plugins` to pass a list of directories that hold the plugins you want to have loaded.

In `.prettierrc.json`:

```json
{
    "printWidth": 80,
    "tabWidth": 4,
    "prettier-plugin-twig-melody-plugins": [
        "src/@my-namespace/plugin1",
        "src/@my-namespace/plugin2"
    ]
}
```

### Naming convention

tbd

## Plugin structure

A plugin has to export an object of the following shape:

```
module.exports = {
    melodyExtensions: [
        ext1,
        ext2,
        ...
    ],
    printers: {
        nodeTypeName1: printNodeType1,
        nodeTypeName2: printNodeType2,
        ...
    }
};
```
