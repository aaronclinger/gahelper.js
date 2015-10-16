# GAHelper.js

An utility which makes common tracking tasks with Google Analytics more reliable and less error-prone:

* Ensures tracking features, such as `hitCallback`, work regardless if GA is loaded or is blocked by an ad blocker.
* Automatically tracks events on elements with the data attribute `data-track` and attempts to register the hit before the page is redirected.
* Can remove UTM parameters from from the URL after their values have registered.
* `GAHelper` will include Google Analytics base code if it is not present on the page.
* Includes a configurable timeout for the tracking hit to register before gracefully failing.
* `GAHelper`’s methods can be mixed and matched with their native GA counterparts.
* Handles setting `page` and `location` variables to ensure proper page tracking with [single page applications](https://developers.google.com/analytics/devguides/collection/analyticsjs/single-page-applications).


## Dependencies

`GAHelper` requires the presence of [jQuery](http://jquery.com) for [data attribute event tracking](#data-attribute). If jQuery is not present, `GAHelper` will automatically disable this feature. If you do not wish to include jQuery in your project, but want data attribute event tracking, it should be fairly trivial to change the few dependences.


## Example Usage

```html
<head>
	<script src="GAHelper.min.js"></script>
	<script>
		GAHelper.create('UA-XXXXX-Y').pageview({
			clearUTM: true
		});
	</script>
	...
</head>
```
```html
<a href="/more" data-track="footer,more,ft_more">Learn more</a>
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

## API

### Properties

* **GAHelper.forceTry** `Boolean` - Specifies if `GAHelper` should attempt to [register event hits](#event) regardless if GA has loaded `true`, or not to attempt `false`; defaults to `false`.
    * This flag is designed to speed up the calling of `hitCallback` in the event that GA has been blocked by an ad blocker.
    * [Page views](#pageview) are always attempted regardless of GA load status as page views are often requested immediately after the GA base code and before the asynchronous script has loaded.

* **GAHelper.timeout** `Number` - The time, in milliseconds, for the tracking hit to register before assuming it failed; defaults to `3000`.

### <a id="create"></a>GAHelper.create(*trackingId* || *fieldsObject*)

Creates a new tracker instance and will include the Google Analytics base code if it is [not present](#is-defined) on the page. This method returns the instance of `GAHelper` to allow for method chaining.

`GAHelper.create` requires either a `trackingId` or `fieldsObject`:

* **trackingId** `String` - The tracking ID / web property ID.
* **fieldsObject** `Object` - Alternatively, a [fields object](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference) may also be used to specify multiple fields together.

Examples:
```js
GAHelper.create('UA-XXXXX-Y');
```
```js
GAHelper.create({
	trackingId: 'UA-XXXXX-Y',
	cookieDomain: 'auto',
	name: 'myTracker'
});
```

### <a id="pageview"></a>GAHelper.pageview(*[fieldsObject]*)

Sends a pageview hit to Google Analytics. This method returns the instance of `GAHelper` to allow for method chaining.

* **[fieldsObject]** `Object` - An optional [field object](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference):
    * **[fieldsObject.title]** `String` - The optional title of the page.
    * **[fieldsObject.location]** `String` - The optional URL of the page being tracked.
    * **[fieldsObject.page]** `String` - The optional path portion of a URL. This value should start with a slash (/) character.
    * **[fieldsObject.clearUTM]** `Boolean` - Specifies if the [UTM parameters](https://support.google.com/analytics/answer/1033863) should be removed from the URL after the page view has been recorded `true`, or not `false`; defaults to `false`. See [`GAHelper.clearUTM`](#clear-utm) for additional details.
    * **[fieldsObject.hitCallback]** `Function` - The optional function that will be called after processing a hit. The callback function is passed a `Boolean` with the value of `true` if the hit was recorded, or `false` if the request timed out or was blocked.

Example:
```js
GAHelper.pageview();
```
```js
GAHelper.pageview({
	page: '/buy',
	clearUTM: true,
	hitCallback: function(success) {
		if ( ! success) {
			console.log('Pageview failed to register, or GA was disabled by an ad blocker.');
		}
	}
});
```

### <a id="event"></a>GAHelper.event(*fieldsObject*)

Sends an event hit to Google Analytics. This method returns the instance of `GAHelper` to allow for method chaining.

* **fieldsObject** `Object` - A [field object](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference):
    * **fieldsObject.eventCategory** `String` - Specifies the event category.
    * **fieldsObject.eventAction** `String` - Specifies the event action.
    * **[fieldsObject.eventLabel]** `String` - Specifies the optional event label.
    * **[fieldsObject.eventValue]** `Number` - Specifies the optional event value
    * **[fieldsObject.hitCallback]** `Function` - The optional function that will be called after processing a hit. The callback function is passed a `Boolean` with the value of `true` if the hit was recorded, or `false` if the request timed out or was blocked.


Example:
```js
 GAHelper.event({
	eventCategory: 'header',
	eventAction: 'nav_home',
	hitCallback: function(success) {
		if ( ! success) {
			console.log('Event failed to register, or GA was disabled by an ad blocker.');
		}
	}
});
```

### GAHelper.send(*fieldsObject*)

Sends a hit to Google Analytics. Most likely you will want to use [`GAHelper.pageview`](#pageview) or [`GAHelper.event`](#event), but `GAHelper.send` is exposed if you wish to track "social" or "timing" hit types. This method returns the instance of `GAHelper` to allow for method chaining.

* **fieldsObject** `Object` - A [field object](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference) that defines the hit type and fields.

Example:
```js
GAHelper.send({
	hitType: 'social',
	socialNetwork: 'Facebook',
	socialAction: 'like',
	socialTarget: 'http://example.com',
	hitCallback: function(success) {
		if ( ! success) {
			console.log('Hit failed to register, or GA was disabled by an ad blocker.');
		}
	}
});
```

### <a id="clear-utm"></a>GAHelper.clearUTM()

Removes Google Analytics [UTM parameters](https://support.google.com/analytics/answer/1033863) from the URL using `history.replaceState`.

`GAHelper` can also be configured to automatically remove UTM codes after the initial [`GAHelper.pageview`](#pageview) has been recorded.

While removing UTM codes creates a visually cleaner URL, visitors who copy and share the browser URL will not copy the UTM codes going forward. You will lose any measurement of share “spray” and the attribution to the original source. This may be desired, but should be considered before implementing.

This method returns the instance of `GAHelper` to allow for method chaining.

### <a id="is-defined"></a>GAHelper.isDefined()

Determines if the Google Analytics base code and `ga` variable are present `true`, or unavailable `false`.

### GAHelper.isLoaded()

Determines if the Google Analytics asynchronous script has loaded `true`, or is unavailable or still loading `false`.

### <a id="data-attribute"></a>data-track="*eventCategory, eventAction, [eventLabel], [eventValue]*"

`GAHelper` will detect `<a>` or `<form>` elements with the data attribute `data-track` and automatically send the defined value to `GAHelper.event` when the element is clicked or submitted. `GAHelper` will attempt to register the hit before the page is redirected.

* **track** `String` - A comma-separated `String` that defines the `event` hit. Whitespace before and after commas is trimmed and ignored.
    * **eventCategory** `String` - Specifies the event category.
    * **eventAction** `String` - Specifies the event action.
    * **[eventLabel]** `String` - Specifies the optional event label.
    * **[eventValue]** `Number` - Specifies the optional event value

Example:
```html
<ul>
	<li><a href="/buy" data-track="footer, buy, ft_buy">Buy now</a></li>
	<li><a href="https://www.google.com/maps" target="_blank" data-track="footer,exit_link,ft_map">Find our store</a></li>
	<li><a href="mailto:example@example.com" data-track="footer,email,ft_email">Email us</a></li>
</ul>
```

## License

`GAHelper` can be used freely for any open source or commercial works and is released under a [MIT license](http://en.wikipedia.org/wiki/MIT_License).


## Authors

This project was highly influenced by [Jeff Burger](https://www.linkedin.com/in/jeffburger) – the best analyst we know.

JavaScript authored by [Aaron Clinger](https://github.com/aaronclinger) & [Lucas J. Shuman](https://github.com/lucasishuman).