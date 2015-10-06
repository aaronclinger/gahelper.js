/* jshint strict: true, browser: true, nonbsp: true, bitwise: true, immed: true, latedef: true, eqeqeq: true, undef: true, curly: true, unused: true */
/* global jQuery */

/**
 * @author Aaron Clinger - https://github.com/aaronclinger/gahelper.js
 */
(function($, window, document) {
	'use strict';
	
	function GAHelper() {
		var pub = {};
		
		pub.forceTry     = false;
		pub.timeoutDelay = 2000;
		
		
		pub.event = function(fieldsObject) {
			fieldsObject.hitType = 'event';
			
			return pub.send(fieldsObject);
		};
		
		pub.pageView = function(fieldsObject) {
			var callback;
			
			fieldsObject.hitType = 'pageview';
			
			if (fieldsObject.clearUTM) {
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
		
		pub.send = function(fieldsObject) {
			var hasHit = false;
			var callback;
			var fallback;
			var timeout;
			
			if (fieldsObject.hitCallback) {
				callback = fieldsObject.hitCallback;
				
				fallback = function(success) {
					if (hasHit) {
						return;
					}
					
					hasHit = true;
					
					clearTimeout(timeout);
					
					if (callback) {
						callback(success);
					}
				};
				
				fieldsObject.hitCallback = function() {
					fallback(true);
				};
				
				timeout = setTimeout(function() {
					fallback(false);
				}, pub.timeoutDelay);
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
		
		var getEventFieldsFromAttr = function($el) {
			var fieldsObject = {};
			var values       = $el.data('track').split(',');
			var keys         = ['eventCategory', 'eventAction', 'eventLabel', 'eventValue'];
			var l            = Math.min(4, values.length);
			
			while (l--) {
				fieldsObject[keys[l]] = values[l];
			}
			
			return fieldsObject;
		};
		
		var init = function() {
			$(document).on('click', 'a[data-track]', function() {
				var $this        = $(this);
				var href         = $this.attr('href');
				var target       = $this.attr('target');
				var isBlank      = target && target.toLowerCase() === '_blank';
				var fieldsObject = getEventFieldsFromAttr($this);
				
				if (href && ! isBlank) {
					fieldsObject.hitCallback = function() {
						document.location = href;
					};
				}
				
				pub.trackEvent(fieldsObject);
				
				return !! isBlank;
			});
			
			$('form[data-track]').each(function() {
				var $this  = $(this);
				var submit = false;
				
				$this.submit(function() {
					if (submit === true) {
						return true;
					}
					
					var fieldsObject = getEventFieldsFromAttr($this);
					
					fieldsObject.hitCallback = function() {
						submit = true;
						
						$this.submit();
					};
					
					pub.trackEvent(fieldsObject);
					
					return false;
				});
			});
		};
		
		init();
		
		return pub;
	}
	
	window.GAHelper = new GAHelper();
}(jQuery, window, document));