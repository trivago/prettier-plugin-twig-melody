# Changelog

## master

-   Features

-   Bug fixes

## v0.3.7

-   Bug fix: Expressions like `not (a and b)` lost the parentheses, thus changing the meaning of the expression.

## v0.3.6

-   Bug fix: Optimize group structure when using `SetStatement`, `VariableDeclarationStatement`, and logical binary expressions. Previously, the group created by `SetStatement` had only one breaking point (before the closing `%}`), which led to some undesirable results.

## v0.3.5

-   Fix: `twigMelodyPlugins` option is finally an array, not a string separated by `|` any more.

## v0.3.4

-   Fix: Stylistic improvements

## v0.3.3

-   Bug fix: Mount statement of the form `mount ... from ...` were dropping the source. Fixed now.

## v0.3.2

-   Bug fix: No breaking point before closing `%}` for `for`, `if`, `set`.

## v0.3.1

-   Bug fixes
    -   [Issue #24](https://github.com/trivago/prettier-plugin-twig-melody/issues/24): Take the string contents into account when choosing the quote characters surrounding a string literal.

## v0.3.0

-   Features
    -   [Issue #22](https://github.com/trivago/prettier-plugin-twig-melody/issues/22): Add `twigOutputEndblockName` option so that you can choose whether to print the name in the `{% endblock %}` tag or not.

## v0.2.3

-   Bug fixes
    -   [Issue #21](https://github.com/trivago/prettier-plugin-twig-melody/issues/21): Always use double quotes around interpolated strings

## v0.2.2

-   Bug fixes
    -   [Issue #20](https://github.com/trivago/prettier-plugin-twig-melody/issues/20): Double quotation marks in `include` statement
    -   [Issue #21](https://github.com/trivago/prettier-plugin-twig-melody/issues/21): Essentially same bug as Issue #20

## v0.2.1

-   Bug fixes
    -   Improve printing of HTML and Twig comments

## v0.2.0

-   Features

    -   Introduction of `prettier-ignore` functionality
    -   Better adherence to Twig coding standards

-   Bug fixes
    -   Avoid dropping of backslash in string literal: [https://github.com/trivago/prettier-plugin-twig-melody/issues/11](https://github.com/trivago/prettier-plugin-twig-melody/issues/11)
    -   Not crashing when facing declarations (`<!DOCTYPE html>`) any more

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
