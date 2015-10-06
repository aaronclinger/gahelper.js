# GAHelper

## Dependencies

`GAHelper` requires the presence of [jQuery](http://jquery.com). If you do not wish to include jQuery in your project, it should be fairly trivial to change the few dependences.


## Example Usage

```js
<script>
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	ga('create', 'UA-XXXXXXXX-X', 'auto');
	
	GAHelper.pageView({
		clearUTM: true
	});
	
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
</script>
```

## API

### GAHelper.pageView(*[fieldsObject]*)

Adds a new route. Only the first matched route will be triggered; routes are compared in the order in which they are added to `GAHelper`. This method returns the instance of `GAHelper` to allow for method chaining.

* **settings** (object) - An object that defines the routes settings and callback function.
    * **[settings.id]** (string) - An optional identifier that is passed to the `settings.callback` function. If undefined, the string provided for `settings.route` will be used as the identifier.
    * **settings.route** (string) - The route pattern to match.
    * **settings.callback** (function) - A function that should be called when the route has been triggered. The callback function is passed an object with two properties:
        * **object.id** (string) - The route identifier.
        * **object.matches** (array) - If the route included RegExp capture groups, the groups will be provided as an array. If the route does not contain any capture groups, an empty array will be provided.

## GAHelper.event(*fieldsObject*)

Adds a new route. Only the first matched route will be triggered; routes are compared in the order in which they are added to `GAHelper`. This method returns the instance of `GAHelper` to allow for method chaining.

* **settings** (object) - An object that defines the routes settings and callback function.
    * **[settings.id]** (string) - An optional identifier that is passed to the `settings.callback` function. If undefined, the string provided for `settings.route` will be used as the identifier.
    * **settings.route** (string) - The route pattern to match.
    * **settings.callback** (function) - A function that should be called when the route has been triggered. The callback function is passed an object with two properties:
        * **object.id** (string) - The route identifier.
        * **object.matches** (array) - If the route included RegExp capture groups, the groups will be provided as an array. If the route does not contain any capture groups, an empty array will be provided.

## GAHelper.send(*fieldsObject*)

Adds a new route. Only the first matched route will be triggered; routes are compared in the order in which they are added to `GAHelper`. This method returns the instance of `GAHelper` to allow for method chaining.

* **settings** (object) - An object that defines the routes settings and callback function.
    * **[settings.id]** (string) - An optional identifier that is passed to the `settings.callback` function. If undefined, the string provided for `settings.route` will be used as the identifier.
    * **settings.route** (string) - The route pattern to match.
    * **settings.callback** (function) - A function that should be called when the route has been triggered. The callback function is passed an object with two properties:
        * **object.id** (string) - The route identifier.
        * **object.matches** (array) - If the route included RegExp capture groups, the groups will be provided as an array. If the route does not contain any capture groups, an empty array will be provided.

## GAHelper.clearUTM()

Adds a new route. Only the first matched route will be triggered; routes are compared in the order in which they are added to `GAHelper`. This method returns the instance of `GAHelper` to allow for method chaining.

## GAHelper.isDefined()

Adds a new route. Only the first matched route will be triggered; routes are compared in the order in which they are added to `GAHelper`. This method returns the instance of `GAHelper` to allow for method chaining.

## GAHelper.isLoaded()

Adds a new route. Only the first matched route will be triggered; routes are compared in the order in which they are added to `GAHelper`. This method returns the instance of `GAHelper` to allow for method chaining.

### data-track="*eventCategory, eventAction, [eventLabel], [eventValue]*"

`GAHelper` will detect HTML elements with the data attribute `data-route` and automatically send the value to `requestRoute` when the element is clicked.

* **route** (string) - The route to send to `requestRoute`.

Examples:

```html
<ul>
	<li><a href="/buy" data-track="footer,buy,ft_buy">Buy now</a></li>
	<li><a href="https://www.google.com/maps" data-track="footer,exit_link,ft_map" target="_blank">Find our store</a></li>
	<li><a href="mailto:example@example.com" data-track="footer,email,ft_email">Email us</a></li>
</ul>
```

## License

`GAHelper` can be used freely for any open source or commercial works and is released under a [MIT license](http://en.wikipedia.org/wiki/MIT_License).


## Authors

This project was highly influenced by [Jeff Burger](https://www.linkedin.com/in/jeffburger) – the best analyst we know.

JavaScript authored by [Aaron Clinger](http://aaronclinger.com) & [Lucas J. Shuman](https://github.com/lucasishuman).