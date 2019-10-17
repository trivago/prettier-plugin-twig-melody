# Prettier for Melody

![Prettier Banner](https://raw.githubusercontent.com/prettier/prettier-logo/master/images/prettier-banner-light.png)

---

This Plugin enables Prettier to format `.twig` files, as well as `.html.twig` and `.melody.twig`. [Melody](https://melody.js.org) is a component based UI framework that uses Twig as its template language.

## Install

```bash
yarn add --dev prettier-plugin-twig-melody
```

## Use

```bash
prettier --write "**/*.melody.twig"
```

In your editor, if the plugin is not automatically picked up and invoked (e.g., if you are using format on save, but no formatting is happening when you save), try adding the plugin explicitly in your Prettier configuration (e.g., `.prettierrc.json`) using the `plugins` key:

```json
{
    "printWidth": 80,
    "tabWidth": 4,
    "plugins": ["./node_modules/prettier-plugin-twig-melody"]
}
```

## Options

This Prettier plugin comes with some options that you can add to your Prettier configuration (e.g., `prettierrc.json`).

### twigSingleQuote

Values can be `true` or `false`. If `true`, single quotes will be used for string literals in Twig files.

### twigMelodyPlugins

An array containing file paths to plugin directories. This can be used to add your own printers and parser extensions.

## Plugins

[Melody](https://melody.js.org) features an extensible parser, so chances are you add custom elements for which the parsing and printing logic is not part of this Prettier plugin. Therefore, this Prettier plugin is itself pluggable.

Let's look at an example of a plugin to the plugin:

```javascript
const melodyIconPlugin = require("../melody-plugin-icon-tag");

const printIconTag = (node, path, print, options) => {
    // Implementation of printing
    // ...
};

module.exports = {
    melodyExtensions: [melodyIconPlugin],
    printers: {
        IconTag: printIconTag
    }
};
```

As we can see, a plugin to the plugin exports two fields:

* `melodyExtensions`: A list of extensions to the [Melody](https://melody.js.org) framework that might export `tags`, `visitors`, `functionMap` and the like. Usually, such an extension will add additional parsing functionality to the core parser.
* `printers`: The Prettier printing functionality for your additional language constructs, tags, operators, etc. This is an object where the keys are the node types in the Melody AST (abstract syntax tree) &mdash; as retrieved through `node.constructor.name` &mdash;, and the values are the print functions with the standard Prettier signature.

Don't forget to make your plugins known through the `twigMelodyPlugins` option in your Prettier configuration.

## Testing

* You can call `yarn test`to test against all regular tests
