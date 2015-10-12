# GAHelper

* Removes UTM
* timeout for hitCallback
* Ensures hitCallback works if GA is blocked
* Can event track automatically via data attribute
* Ensures events are recorded before pages are redirected

## Dependencies

`GAHelper` requires the presence of [jQuery](http://jquery.com) for [data attribute event tracking](#data-attribute). If jQuery is not present, `GAHelper` will automatically disable the feature. If you do not wish to include jQuery in your project, but want data attribute event tracking, it should be fairly trivial to change the few dependences.


## Example Usage

```html
<head>
	<script src="GAHelper.min.js"></script>
	<script>
		GAHelper.create('UA-XXXXX-Y').pageView({
			clearUTM: true
		});
	</script>
	...
</head>
```

```js
$('#logo').click(function() {
	GAHelper.event({
		eventCategory: 'header',
		eventAction: 'nav_home',
		eventLabel: 'hd_nav_logo',
		hitCallback: function(success) {
			if ( ! success) {
				console.log('GA event failed to register, or GA was disabled by an ad blocker.');
			}
		}
	});
});
```
```html
<a href="/buy" data-track="footer,buy,ft_buy">Buy now</a>
```

## API

### Properties

* **GAHelper.forceTry** `Boolean` - Specifies if a random value name/value pair should be appended to the query string to help prevent caching `true`, or not append `false`; defaults to `false`.
* **GAHelper.timeout** `Number` - Set a timeout, in milliseconds, for the tracking request; defaults to `2000`.

### <a id="pageview"></a>GAHelper.pageView(*[fieldsObject]*)

Adds a new route. Only the first matched route will be triggered; routes are compared in the order in which they are added to `GAHelper`. This method returns the instance of `GAHelper` to allow for method chaining.

* **fieldsObject** `Object` - An object that defines the routes settings and callback function.
    * **[fieldsObject.title]** `String` - The optional title of the page.
    * **[fieldsObject.location]** `String` - The optional URL of the page being tracked.
    * **[fieldsObject.page]** `String` - The optional path portion of a URL. This value should start with a slash (/) character.
    * **[fieldsObject.clearUTM]** `Boolean` - Specifies if the [UTM parameters](https://support.google.com/analytics/answer/1033863) should be removed from the URL after the page view has been recorded `true`, or not `false`; defaults to `false`. See [GAHelper.clearUTM](#clear-utm) for additional details.
    * **[fieldsObject.hitCallback]** `Function` - The optional function that will be called after processing a hit. The callback function is passed a `Boolean` with the value of `true` if the hit was recorded, or `false` if the request timed out or was blocked.

Example:
```js
GAHelper.pageView({
	
});
```

### GAHelper.event(*fieldsObject*)

Adds a new route. Only the first matched route will be triggered; routes are compared in the order in which they are added to `GAHelper`. This method returns the instance of `GAHelper` to allow for method chaining.

* **fieldsObject** `Object` - An object that defines the routes settings and callback function.
    * **fieldsObject.eventCategory** `String` - Specifies the event category.
    * **fieldsObject.eventAction** `String` - Specifies the event action.
    * **[fieldsObject.eventLabel]** `String` - Specifies the optional event label.
    * **[fieldsObject.eventValue]** `Number` - Specifies the optional event value
    * **[fieldsObject.hitCallback]** `Function` - The optional function that will be called after processing a hit. The callback function is passed a `Boolean` with the value of `true` if the hit was recorded, or `false` if the request timed out or was blocked.


Example:
```js
GAHelper.event({
	
});
```

### GAHelper.send(*fieldsObject*)

Adds a new route. Only the first matched route will be triggered; routes are compared in the order in which they are added to `GAHelper`. This method returns the instance of `GAHelper` to allow for method chaining.

* **fieldsObject** `Object` - An object that defines the routes settings and callback function.
    * **[fieldsObject.id]** `String` - An optional identifier that is passed to the `settings.callback` function. If undefined, the string provided for `settings.route` will be used as the identifier.
    * **fieldsObject.route** `String` - The route pattern to match.
    * **fieldsObject.callback** `Function` - A function that should be called when the route has been triggered. The callback function is passed an object with two properties:
        * **object.id** `String` - The route identifier.
        * **object.matches** (array) - If the route included RegExp capture groups, the groups will be provided as an array. If the route does not contain any capture groups, an empty array will be provided.




Example:
```js
GAHelper.send({
	
});
```

### <a id="clear-utm"></a>GAHelper.clearUTM()

Removes Google Analytics [UTM parameters](https://support.google.com/analytics/answer/1033863) from the page URL using `history.replaceState`.

`GAHelper` can also be configured to automatically remove UTM codes after the initial [GAHelper.pageView](#pageview) has been recorded.

*Note: While removing UTM codes creates a visually cleaner URL, visitors who copy and share the browser URL will not copy the UTM codes going forward. You will lose any measurement of share “spray” and the attribution to the original source. This may be desired, but should be considered before implementing.*

### GAHelper.isDefined()

Determines if the Google Analytics base code and `ga` variable are present `true`, or unavailable `false`.

### GAHelper.isLoaded()

Determines if the Google Analytics asynchronous script has loaded `true`, or is unavailable or still loading `false`.

### <a id="data-attribute"></a>data-track="*eventCategory, eventAction, [eventLabel], [eventValue]*"

`GAHelper` will detect HTML elements with the data attribute `data-route` and automatically send the value to `GAHelper.event` when the element is clicked. `GAHelper` will ensure 

* **route** `String` - The route to send to `requestRoute`.

Example:
```html
<ul>
	<li><a href="/buy" data-track="footer,buy,ft_buy">Buy now</a></li>
	<li><a href="https://www.google.com/maps" target="_blank" data-track="footer,exit_link,ft_map">Find our store</a></li>
	<li><a href="mailto:example@example.com" data-track="footer,email,ft_email">Email us</a></li>
</ul>
```

## License

`GAHelper` can be used freely for any open source or commercial works and is released under a [MIT license](http://en.wikipedia.org/wiki/MIT_License).


## Authors

This project was highly influenced by [Jeff Burger](https://www.linkedin.com/in/jeffburger) – the best analyst we know.

JavaScript authored by [Aaron Clinger](https://github.com/aaronclinger) & [Lucas J. Shuman](https://github.com/lucasishuman).