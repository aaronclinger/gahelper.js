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
			
			return send(fieldsObject);
		};
		
		pub.pageView = function(fieldsObject) {
			fieldsObject.hitType = 'pageview';
			
			//pub.clearUTM     = false;
			
			/*
			title
			location
			page
			*/
			
			return send(fieldsObject);
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
		
		pub.send = function(fieldsObject) {
			var isPageView = fieldsObject.hitType === 'pageview';
			var hasCalled  = false;
			var callback;
			var fallback;
			var timeout;
			
			if (isPageView && clearUTM) {
				
			}
			
			if (fieldsObject.hitCallback) {
				callback = fieldsObject.hitCallback;
				
				fallback = function(success) {
					if (hasCalled) {
						return;
					}
					
					hasCalled = true;
					
					window.clearTimeout(timeout);
					
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
			
			if (forceTry || isLoaded() || (isPresent() && isPageView)) {
				getGA()('send', fieldsObject);
			} else if (fieldsObject.hitCallback) {
				fieldsObject.hitCallback(false);
			}
			
			return pub;
		};
		
		pub.isPresent = function() {
			return !! getGA();
		};
		
		pub.isLoaded = function() {
			return pub.isPresent() && getGA().hasOwnProperty('loaded') && getGA().loaded === true;
		};
		
		var getGA = function() {
			return window.ga;
		};
		
		var getEventFieldsFromAttr = function($el) {
			var fieldsObject = {};
			var values       = $el.data('track').split(',');
			var keys         = ['eventCategory', 'eventAction', 'eventLabel', 'eventValue'];
			var l            = Math.min(5, params.length);
			
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
		};
		
		init();
		
		return pub;
	}
	
	window.GAHelper = new GAHelper();
}(jQuery, window, document));