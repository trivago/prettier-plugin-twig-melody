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

## SequenceExpression

* Whitespace only: Only count newline characters, and output those (as hardlines?)
* If no newline, but whitespace only: Normalize whitespace, respect surrounding inline elements
* If PrintTextStatement: Leading/trailing whitespace will be taken care of by TextStatement. Just pass the information as PRESERVE_LEADING_WHITESPACE and PRESERVE_TRAILING_WHITESPACE, respectively

```html
<div class="{{ css.loader }}">
    <div class="{{ css.barWrapper }}">
        <span class="{{ css.bar }}"></span>
    </div>
    <strong class="{{ css.text }}">{{ 'checking_deals' }}</strong>
</div>
```

## Algorithm for Element

1. Remove surrounding whitespace
2. Add "preserve whitespace" info to PrintTextStatement nodes
3. Iterate over children, start with empty result
4. If inline element, put in temporary group. Eventually, use fill() on it.
5. If block element => add to result
