# Changelog

## v0.0.34

Various small bug fixes and cosmetic optimizations

## v0.0.33

-   Bugfix
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
