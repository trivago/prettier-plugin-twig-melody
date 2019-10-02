```html
<div class="navigation">

    <span>Some text</span>

</div>
```

The whitespace between the opening `<div>` tag and the opening `<span>` tag
can be removed. Criteria:

* Whitespace separates two opening tags

The whitespace between the closing `</span>` tag and the closing `</div>` tag
can also be removed.

```HTML
    abc<span>
E
</span>fg
```

Here, neither the leading whitespace nor the trailing whitespace in the `span` tag
can be removed, because it would change the appearance. What are the criteria?

* The element is an inline element...
* ...AND the node before the current element (left sibling) is a `PrintTextStatement` ...
* ...AND there is no whitespace before the current element
* THEN leading whitespace in the current element must be preserved
* OTHERWISE it can be removed

IDEA: This kind of information can be passed on from parent to child by adding additional properties to the children AST nodes:

* `SequenceExpression` could pass on information on whitespace to children.
* Then, `Element` would know if it is preceded by whitespace or something else.
* And so on...

Strictly speaking, you may also not insert whitespace between "abc" and the opening `<span>`, even though this might be an edge case that can be ignored for now.
