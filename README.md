# Prettier for Melody

![Prettier Banner](https://raw.githubusercontent.com/prettier/prettier-logo/master/images/prettier-banner-light.png)

---

This plugin for Prettier is a fork of [`prettier-plugin-twig-melody`](https://github.com/trivago/prettier-plugin-twig-melody), which is currently unmaintained. Several enhancements have been added to fit our development and templating needs at [Supersoniks](https://supersoniks.com/).

## Install

```bash
yarn add --dev @supersoniks/prettier-plugin-twig-melody
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
    "plugins": ["./node_modules/@supersoniks/prettier-plugin-twig-melody"]
}
```

## Enhancements

- Preserve `only` keyword in twig templates.
- Block statements : no empty line between opening end closing `block` statements. 
- Html element : nno empty line between opening and closing tags. 

