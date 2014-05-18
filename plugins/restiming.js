/**
\file restiming.js
Plugin to collect metrics from the W3C Resource Timing API.
For more information about Resource Timing,
see: http://www.w3.org/TR/resource-timing/
*/

(function() {

BOOMR = BOOMR || {};
BOOMR.plugins = BOOMR.plugins || {};

var restricted = {
	redirectStart: "rt_red_st",
	redirectEnd: "rt_red_end",
	domainLookupStart: "rt_dns_st",
	domainLookupEnd: "rt_dns_end",
	connectStart: "rt_con_st",
	connectEnd: "rt_con_end",
	secureConnectionStart: "rt_scon_st",
	requestStart: "rt_req_st",
	responseStart: "rt_res_st"
},

mapData = function (data) {
	var resource, mapped, i, k;

	if(data && typeof data.getEntriesByType === "function") {
		resource = data.getEntriesByType("resource");

		if(r) {
			mapped = new Array(resource.length);

			for(i = 0; i < resource.length; ++i) {
				mapped[i] = {
					rt_name: resource[i].name,
					rt_in_type: resource[i].initiatorType,
					rt_st: resource[i].startTime,
					rt_dur: resource[i].duration,
					rt_fet_st: resource[i].fetchStart,
					rt_res_end: resource[i].responseEnd
				};

				for(k in restricted) {
					if(restricted.hasOwnProperty(k) && resource[i][k] > 0) {
						mapped[i][restricted[k]] = resource[i][k];
					}
				}
			}
		}
	}

	return mapped;
},

impl = {
	complete: false,
	done: function() {
		var data;

		if(impl.complete) {
			return;
		}

		BOOMR.removeVar("restiming");

		data = mapData(BOOMR.window.performance);
		if (data) {
			BOOMR.info("Client supports Resource Timing API", "restiming");

			BOOMR.addVar({ restiming: data });
			BOOMR.utils.forEachFrame(function (frame) {
				return mapData(frame.performance, 'restiming');
			});
		}

		this.complete = true;
		BOOMR.sendBeacon();
	}
};

BOOMR.plugins.ResourceTiming = {
	init: function() {
		BOOMR.subscribe("page_ready", impl.done, null, impl);
		return this;
	},
	is_complete: function() {
		return impl.complete;
	}
};

}());

