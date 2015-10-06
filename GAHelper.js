/**
 * @author Aaron Clinger - https://github.com/aaronclinger/GAHelper.js
 */
(function($, window) {
	'use strict';
	
	function GAHelper() {
		var pub = {};
		
		pub.forceTry     = false;
		pub.clearUTM     = false;
		pub.timeoutDelay = 2000;
		
		pub.trackEvent = function(fieldsObject) {
			fieldsObject.hitType = 'event';
			
			/*
			eventCategory
			eventAction
			eventLabel
			eventValue
			*/
			
			send(fieldsObject);
		};
		
		pub.trackPageView = function(fieldsObject) {
			fieldsObject.hitType = 'pageview';
			
			/*
			title
			location
			page
			*/
			
			send(fieldsObject);
		};
		
		pub.removeUTM = function() {
			var location = window.location.toString();
			var hasPush  = (history && 'pushState' in history);
			
			if (hasPush && location.indexOf('?') !== -1) {
				location.replace(/utm_(?:source|medium|term|content|campaign)=[^\&]+\&*/ig, '');
				location.replace(/\?+$/ig, '');
				
				history.replaceState({}, '', location);
			}
		};
		
		pub.isPresent = function() {
			return !! getGA();
		};
		
		pub.isLoaded = function() {
			return pub.isPresent() && getGA().hasOwnProperty('loaded') && getGA().loaded === true;
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
		};
		
		var getGA = function() {
			return window.ga;
		};
		
		var init = function() {
			
		};
		
		init();
		
		return pub;
	}
	
	window.GAHelper = new GAHelper();
}(jQuery, window));