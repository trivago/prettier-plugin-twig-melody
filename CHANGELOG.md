# Changelog

## v0.0.28

* Fix [issue #2](https://github.com/trivago/prettier-plugin-twig-melody/issues/2), where all final newlines in a file were skipped. Now, there will be one final newline.

## v0.0.27

* Fix attribute printing in objects. Computed attributes are now surrounded by `(...)`. Keys that don't need quotes will not be quoted.
