# Changelog

## master

-   Bug fixes
    -   Avoid dropping of backslash in string literal: [https://github.com/trivago/prettier-plugin-twig-melody/issues/11](https://github.com/trivago/prettier-plugin-twig-melody/issues/11)

## v0.1.1

-   Bug fixes
    -   Avoid extraneous line breaks for zero-argument call expressions: [https://github.com/trivago/prettier-plugin-twig-melody/issues/10](https://github.com/trivago/prettier-plugin-twig-melody/issues/10)

## v0.1.0

-   Features

    -   "If" statements can be in one line now, under certain circumstances
    -   New option `twigAlwaysBreakObjects`
    -   New option `twigPrintWidth`
    -   All util functions are public now (available to plugins)
    -   Optimizations: Fewer line breaks in a lot of cases, less indentation
    -   Long HTML comments are re-wrapped now

-   Bug fixes
    -   Respect operator precedence in binary expressions (especially boolean)

## v0.0.34

Various small bug fixes and cosmetic optimizations

## v0.0.33

-   Bug fix
    -   Empty block was causing an error. Does not an more.

## v0.0.32

-   Features
    -   Uses Melody 1.5.0
    -   Trim left and trim right marks are preserved for Twig tags `{%- ... -%}`

## v0.0.31

-   Features
    -   Uses Melody 1.4.0
    -   Whitespace trimming is now suppressed
    -   Trim left and trim right marks are preserved for expressions `{{- ... -}}`

## v0.0.30

-   Bug fixes:
    -   MacroDeclarationStatement: There was an extraneous space after the opening parenthesis
    -   Plugin loading: project root path was not always correctly determined

## v0.0.29

-   Make use of new `melody-parser` capabilities:
    -   Add comment printing
    -   Pass parser option to leave character entities undecoded
    -   Preserve HTML comments

## v0.0.28

-   Fix [issue #2](https://github.com/trivago/prettier-plugin-twig-melody/issues/2), where all final newlines in a file were skipped. Now, there will be one final newline.

## v0.0.27

-   Fix attribute printing in objects. Computed attributes are now surrounded by `(...)`. Keys that don't need quotes will not be quoted.
