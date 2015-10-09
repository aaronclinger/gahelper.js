/* jshint strict: true, browser: true, nonbsp: true, bitwise: true, immed: true, latedef: true, eqeqeq: true, undef: true, curly: true, unused: true */
/* global jQuery */

/**
 * @author Aaron Clinger - https://github.com/aaronclinger/gahelper.js
 */
(function($, window, document) {
	'use strict';
	
	function GAHelper() {
		var pub       = {};
		var firstView = true;
		pub.forceTry  = false;
		pub.timeout   = 2000;
		
		
		pub.create = function(fieldsObject) {
			if (typeof fieldsObject === 'string') {
				fieldsObject = {
					trackingId: fieldsObject
				};
			}
			
			fieldsObject.cookieDomain = fieldsObject.cookieDomain || 'auto';
			
			getGA()('create', fieldsObject);
			
			return pub;
		};
		
		pub.pageView = function(fieldsObject) {
			var callback;
			
			fieldsObject         = fieldsObject || {};
			fieldsObject.hitType = 'pageview';
			firstView            = false;
			
			if (firstView && fieldsObject.clearUTM) {
				callback = fieldsObject.hitCallback;
				
				fieldsObject.hitCallback = function(success) {
					pub.clearUTM();
					
					if (callback) {
						callback(success);
					}
				};
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
			
			if (pub.forceTry || pub.isLoaded() || pub.isDefined() && fieldsObject.hitType === 'pageview') {
				getGA()('send', fieldsObject);
			} else if (fieldsObject.hitCallback) {
				fieldsObject.hitCallback(false);
			}
			
			return pub;
		};
		
		pub.clearUTM = function() {
			var location = window.location.toString();
			var hasPush  = history && 'pushState' in history;
			
			if (hasPush && location.indexOf('?') !== -1) {
				location.replace(/utm_(?:source|medium|term|content|campaign)=[^\&]+\&*/ig, '');
				location.replace(/\?+$/ig, '');
				
				history.replaceState({}, '', location);
			}
			
			return pub;
		};
		
		pub.isDefined = function() {
			return !! getGA();
		};
		
		pub.isLoaded = function() {
			return pub.isDefined() && getGA().hasOwnProperty('loaded') && getGA().loaded === true;
		};
		
		var getGA = function() {
			return window.ga;
		};
		
		var trim = function(str) {
			return str.replace(/^[ \t\n\r]+|[ \t\n\r]+$/g, '');
		};
		
		var getEventFieldsFromAttr = function($el) {
			var fieldsObject = {};
			var values       = $el.data('track').split(',');
			var keys         = ['eventCategory', 'eventAction', 'eventLabel', 'eventValue'];
			var l            = Math.min(4, values.length);
			
			while (l--) {
				fieldsObject[keys[l]] = trim(values[l]);
			}
			
			return fieldsObject;
		};
		
		var init = function() {
			$(document).on('click', 'a[data-track]', function(e) {
				var $this        = $(this);
				var href         = $this.attr('href');
				var target       = $this.attr('target');
				var isBlank      = target && target.toLowerCase() === '_blank';
				var fieldsObject = getEventFieldsFromAttr($this);
				
				if (href && ! isBlank) {
					e.preventDefault();
					
					fieldsObject.hitCallback = function() {
						document.location = href;
					};
				}
				
				pub.trackEvent(fieldsObject);
			});
			
			$('form[data-track]').each(function() {
				var $this  = $(this);
				var submit = false;
				
				$this.submit(function(e) {
					if (submit === true) {
						return;
					}
					
					var fieldsObject = getEventFieldsFromAttr($this);
					
					fieldsObject.hitCallback = function() {
						submit = true;
						
						$this.submit();
					};
					
					pub.trackEvent(fieldsObject);
					
					e.preventDefault();
				});
			});
		};
		
		init();
		
		return pub;
	}
	
	window.GAHelper = new GAHelper();
}(jQuery, window, document));