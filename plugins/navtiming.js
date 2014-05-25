/*
 * Copyright (c), Buddy Brewer.
 */

/**
\file navtiming.js
Plugin to collect metrics from the W3C Navigation Timing API. For more information about Navigation Timing,
see: http://www.w3.org/TR/navigation-timing/
*/

(function() {

// First make sure BOOMR is actually defined.  It's possible that your plugin is loaded before boomerang, in which case
// you'll need this.
BOOMR = BOOMR || {};
BOOMR.plugins = BOOMR.plugins || {};

var mapData = function(data) {
	var pn, pt, mapped;

	if(!data) {
		return;
	}

	pn = data.navigation;
	pt = data.timing;

	if(!pn || !pt) {
		return;
	}

	mapped = {
		nt_red_cnt: pn.redirectCount,
		nt_nav_type: pn.type,
		nt_nav_st: pt.navigationStart,
		nt_red_st: pt.redirectStart,
		nt_red_end: pt.redirectEnd,
		nt_fet_st: pt.fetchStart,
		nt_dns_st: pt.domainLookupStart,
		nt_dns_end: pt.domainLookupEnd,
		nt_con_st: pt.connectStart,
		nt_con_end: pt.connectEnd,
		nt_req_st: pt.requestStart,
		nt_res_st: pt.responseStart,
		nt_res_end: pt.responseEnd,
		nt_domloading: pt.domLoading,
		nt_domint: pt.domInteractive,
		nt_domcontloaded_st: pt.domContentLoadedEventStart,
		nt_domcontloaded_end: pt.domContentLoadedEventEnd,
		nt_domcomp: pt.domComplete,
		nt_load_st: pt.loadEventStart,
		nt_load_end: pt.loadEventEnd,
		nt_unload_st: pt.unloadEventStart,
		nt_unload_end: pt.unloadEventEnd
	};

	if(pt.secureConnectionStart) {
		// secureConnectionStart is OPTIONAL in the spec
		mapped.nt_ssl_st = pt.secureConnectionStart;
	}

	if(pt.msFirstPaint) {
		// msFirstPaint is IE9+ http://msdn.microsoft.com/en-us/library/ff974719
		mapped.nt_first_paint = pt.msFirstPaint;
	}

	return mapped;
},

mapChromeData = function(data) {
	var pt;

	if(!data || !data.loadTimes) {
		return;
	}

	pt = data.loadTimes();
	if(!pt) {
		return;
	}

	// This is Chrome only, so will not overwrite nt_first_paint above
	return {
		nt_spdy: (pt.wasFetchedViaSpdy?1:0),
		// XXX Inconsistency warning. msFirstPaint above is in milliseconds while
		//     firstPaintTime is in seconds.microseconds. The server needs to deal with this.
		nt_first_paint: pt.firstPaintTime
	};
},

getPerformance = function (w) {
	return w.performance || w.msPerformance || w.webkitPerformance || w.mozPerformance;
},

// A private object to encapsulate all your implementation details
impl = {
	complete: false,
	done: function() {
		var w, data;

		if(this.complete) {
			return this;
		}

		BOOMR.removeVar("navtiming");

		w = BOOMR.window;
		data = mapData(getPerformance(w));

		if(data) {
			BOOMR.info("This user agent supports NavigationTiming.", "nt");
			BOOMR.addVar(data);
			BOOMR.utils.forEachFrame(function (frame, index) {
				BOOMR.addFrameVar(index, mapData(getPerformance(frame)));
			});
		}

		data = mapChromeData(w.chrome);
		if (data) {
			BOOMR.addVar(data);
			BOOMR.utils.forEachFrame(function (frame, index) {
				BOOMR.addFrameVar(index, mapChromeData(frame.chrome));
			});
		}

		this.complete = true;
		BOOMR.sendBeacon();
	}
};

BOOMR.plugins.NavigationTiming = {
	init: function() {
		// we'll fire on whichever happens first
		BOOMR.subscribe("page_ready", impl.done, null, impl);
		BOOMR.subscribe("page_unload", impl.done, null, impl);
		return this;
	},

	is_complete: function() {
		return impl.complete;
	}
};

}());

