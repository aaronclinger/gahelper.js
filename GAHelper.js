/* jshint strict: true, browser: true, nonbsp: true, bitwise: true, immed: true, latedef: true, eqeqeq: true, undef: true, curly: true, unused: true */

/**
 * @author Aaron Clinger - https://github.com/aaronclinger/gahelper.js
 */
(function(window, document) {
	'use strict';
	
	function GAHelper() {
		var pub            = {};
		var firstPageview  = true;
		var supportsBeacon = ('navigator' in window) && ('sendBeacon' in window.navigator);
		var attributeTrack = false;
		pub.forceTry       = false;
		pub.timeout        = 2000;
		pub.trackerName    = null;
		
		
		pub.create = function(fieldsObject) {
			if ( ! pub.isDefined()) {
				loadGA();
			}
			
			if (typeof fieldsObject === 'string') {
				fieldsObject = {
					trackingId: fieldsObject
				};
			}
			
			if (fieldsObject.name) {
				pub.trackerName = fieldsObject.name = trim(fieldsObject.name);
			} else if (typeof pub.trackerName === 'string') {
				fieldsObject.name = trim(pub.trackerName);
			}
			
			fieldsObject.cookieDomain = fieldsObject.cookieDomain || 'auto';
			
			getGA()('create', fieldsObject);
			
			return pub;
		};
		
		pub.pageview = function(fieldsObject) {
			var callback;
			var command;
			
			fieldsObject         = fieldsObject || {};
			fieldsObject.hitType = 'pageview';
			
			command = getNamedCommand('set', fieldsObject);
			
			if ( ! fieldsObject.page && ! fieldsObject.location) {
				getGA()(command, 'location', window.location.toString());
				getGA()(command, 'page', window.location.pathname.toString());
			}
			
			if (fieldsObject.clearUTM) {
				if (firstPageview) {
					firstPageview = false;
					callback      = fieldsObject.hitCallback;
					
					fieldsObject.hitCallback = function(success) {
						pub.clearUTM();
						
						if (callback) {
							callback(success);
						}
					};
				}
				
				delete fieldsObject.clearUTM;
			}
			
			return pub.send(fieldsObject);
		};
		
		pub.event = function(fieldsObject) {
			fieldsObject.hitType = 'event';
			
			return pub.send(fieldsObject);
		};
		
		pub.send = function(fieldsObject) {
			var hasHit = false;
			var callback;
			var fallback;
			var delay;
			
			if (fieldsObject.hitCallback) {
				callback = fieldsObject.hitCallback;
				
				fallback = function(success) {
					if (hasHit) {
						return;
					}
					
					hasHit = true;
					
					clearTimeout(delay);
					
					callback(success);
				};
				
				fieldsObject.hitCallback = function() {
					fallback(true);
				};
				
				delay = setTimeout(function() {
					fallback(false);
				}, pub.timeout);
			}
			
			if ( ! fieldsObject.transport && supportsBeacon) {
				fieldsObject.transport = 'beacon';
			}
			
			if (pub.forceTry || pub.isLoaded() || pub.isDefined() && fieldsObject.hitType === 'pageview') {
				getGA()(getNamedCommand('send', fieldsObject), fieldsObject);
			} else if (fieldsObject.hitCallback) {
				fieldsObject.hitCallback(false);
			}
			
			return pub;
		};
		
		pub.initAttributeTracking = function() {
			if (attributeTrack) {
				return pub;
			}
			
			attributeTrack = true;
			
			if (document.readyState === 'interactive' || document.readyState === 'complete') {
				addAttributeEvents();
			} else {
				document.addEventListener('DOMContentLoaded', addAttributeEvents);
			}
			
			return pub;
		};
		
		pub.clearUTM = function() {
			var loc     = window.location.toString();
			var hasPush = ('history' in window) && ('pushState' in window.history);
			
			if (hasPush && loc.indexOf('?') !== -1) {
				loc = loc.replace(/utm_(?:source|medium|term|content|campaign)=[^\&#]+\&*/ig, '');
				loc = loc.replace(/(\?|\&)+(?=$|#)/g, '');
				
				window.history.replaceState({}, '', loc);
			}
			
			return pub;
		};
		
		pub.isDefined = function() {
			return !! getGA();
		};
		
		pub.isLoaded = function() {
			return pub.isDefined() && getGA().hasOwnProperty('loaded') && getGA().loaded === true;
		};
		
		var loadGA = function() {
			/* jshint ignore:start */
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
			/* jshint ignore:end */
		};
		
		var getGA = function() {
			return window.ga;
		};
		
		var trim = function(str) {
			return str.replace(/^[ \t\n\r]+|[ \t\n\r]+$/g, '');
		};
		
		var getNamedCommand = function(command, fieldsObject) {
			var name = fieldsObject.name || pub.trackerName;
			
			if (typeof name === 'string') {
				name = trim(name);
				
				if (name !== '') {
					return name + '.' + command;
				}
			}
			
			return command;
		};
		
		var getEventFieldsFromAttribute = function(el) {
			var attr = el.getAttribute('data-track') || el.getAttribute('data-track-async');
			
			if (attr === null || attr === '') {
				return {};
			}
			
			var fieldsObject = {};
			var values       = attr.split(',');
			var keys         = ['eventCategory', 'eventAction', 'eventLabel', 'eventValue'];
			var l            = Math.min(4, values.length);
			
			while (l--) {
				fieldsObject[keys[l]] = trim(values[l]);
			}
			
			return fieldsObject;
		};
		
		var isForm = function(el) {
			return el.tagName.toLowerCase() === 'form';
		};
		
		var onRegularClick = function(e) {
			var element = e.target;
			
			if ( ! isForm(element)) {
				var href         = element.href;
				var target       = element.target;
				var isBlank      = target && target.toLowerCase() === '_blank';
				var fieldsObject = getEventFieldsFromAttribute(element);
				
				if (href && ! isBlank && ! supportsBeacon) {
					e.preventDefault();
					
					fieldsObject.hitCallback = function() {
						document.location = href;
					};
				}
				
				pub.event(fieldsObject);
			}
			
			element.removeEventListener('click', onRegularClick);
		};
		
		var onAsyncClick = function(e) {
			var element = e.target;
			
			pub.event(getEventFieldsFromAttribute(element));
			
			element.removeEventListener('click', onAsyncClick);
		};
		
		var onFormSubmit = function(e) {
			var element = e.target;
			
			if (element.getAttribute('data-track-async')) {
				pub.event(getEventFieldsFromAttribute(element));
			} else if (element.getAttribute('data-track')) {
				var fieldsObject = getEventFieldsFromAttribute(element);
				
				if ( ! supportsBeacon) {
					e.preventDefault();
					
					fieldsObject.hitCallback = function() {
						document.removeEventListener('submit', onFormSubmit);
						
						element.submit();
					};
				}
				
				pub.event(fieldsObject);
			}
		};
		
		var addAttributeEvents = function() {
			document.addEventListener('mousedown', function(e) {
				var element = e.target;
				
				if (element.getAttribute('data-track')) {
					var isAsync = e.which === 1 && (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey);
					
					element.addEventListener('click', isAsync ? onAsyncClick : onRegularClick);
				}
			});
			
			document.addEventListener('click', function(e) {
				var element = e.target;
				
				if (element.getAttribute('data-track-async') && ! isForm(element)) {
					pub.event(getEventFieldsFromAttribute(element));
				}
			});
			
			document.addEventListener('submit', onFormSubmit);
		};
		
		return pub;
	}
	
	window.GAHelper = new GAHelper();
}(window, document));
