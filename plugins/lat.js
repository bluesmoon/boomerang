/*
 * Copyright (c) 2011, Yahoo! Inc.  All rights reserved.
 * Copyright (c) 2012, Log-Normal, Inc.  All rights reserved.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE.txt file for terms.
 */

// This is the Bandwidth & Latency plugin abbreviated to BW
(function() {
BOOMR = BOOMR || {};
BOOMR.plugins = BOOMR.plugins || {};
/**
 *Only lat test result
*/
var images={
	l: { name: "image-l.gif", size: 35, timeout: 1000 }
}

	images.end = images.length;
	images.start = 0;

// abuse arrays to do the latency test simply because it avoids a bunch of
// branches in the rest of the code.
// I'm sorry Douglas
images.l = { name: "image-l.gif", size: 35, timeout: 1000 };
// private object
var impl = {
	// properties
	base_url: '',
	timeout: 15000,
	nruns: 5,
	latency_runs: 10,
	user_ip: '',
	cookie_exp: 7*86400,
	cookie: 'LAT',

	// state
	results: [],
	latencies: [],
	latency: null,
	runs_left: 0,
	aborted: false,
	complete: false,
	running: false,

	// methods

	// numeric comparator.  Returns negative number if a < b, positive if a > b and 0 if they're equal
	// used to sort an array numerically
	ncmp: function(a, b) { return (a-b); },

	// Calculate the interquartile range of an array of data points
	iqr: function(a)
	{
		var l = a.length-1, q1, q3, fw, b = [], i;

		q1 = (a[Math.floor(l*0.25)] + a[Math.ceil(l*0.25)])/2;
		q3 = (a[Math.floor(l*0.75)] + a[Math.ceil(l*0.75)])/2;

		fw = (q3-q1)*1.5;

		l++;

		for(i=0; i<l && a[i] < q3+fw; i++) {
			if(a[i] > q1-fw) {
			    b.push(a[i]);			    
			}
		}

		return b;
	},
	/* 
	*  calcuate 
	**/
	calc_latency: function()
	{
		var	i, n,
			sum=0, sumsq=0,
			amean, median,
			std_dev, std_err,
			lat_filtered;

		// We first do IQR filtering and use the resulting data set
		// for all calculations
		lat_filtered = this.iqr(this.latencies.sort(this.ncmp));
		n = lat_filtered.length;

		BOOMR.debug(lat_filtered, "LAT");

		// First we get the arithmetic mean, standard deviation and standard error
		// We ignore the first since it paid the price of DNS lookup, TCP connect
		// and slow start
		for(i=1; i<n; i++) {
			sum += lat_filtered[i];
			sumsq += lat_filtered[i] * lat_filtered[i];
		}

		n--;	// Since we started the loop with 1 and not 0

		amean = Math.round(sum / n);

		std_dev = Math.sqrt( sumsq/n - sum*sum/(n*n));

		// See http://en.wikipedia.org/wiki/1.96 and http://en.wikipedia.org/wiki/Standard_error_%28statistics%29
		std_err = (1.96 * std_dev/Math.sqrt(n)).toFixed(2);

		std_dev = std_dev.toFixed(2);


		n = lat_filtered.length-1;

		median = Math.round(
				(lat_filtered[Math.floor(n/2)] + lat_filtered[Math.ceil(n/2)]) / 2
			);

		return { mean: amean, median: median, stddev: std_dev, stderr: std_err };
	},

	defer: function(method)
	{
		var that=this;
		return setTimeout(function() { method.call(that); that=null;}, 10);
	},

	load_img: function(i, run, callback)
	{
		var url = this.base_url + images[i].name+ '?t=' + (new Date().getTime()) + Math.random(),	// Math.random() is slow, but we get it before we start the timer
		    timer=0, tstart=0,
		    img = new Image(),
		    that=this;

		img.onload=function() {
			img.onload=img.onerror=null;
			img=null;
			clearTimeout(timer);
			if(callback) {
				callback.call(that, i, tstart, run, true);
			}
			that=callback=null;
		};
		img.onerror=function() {
			img.onload=img.onerror=null;
			img=null;
			clearTimeout(timer);
			if(callback) {
				callback.call(that, i, tstart, run, false);
			}
			that=callback=null;
		};

		// the timeout does not abort download of the current image, it just sets an
		// end of loop flag so we don't attempt download of the next image we still
		// need to wait until onload or onerror fire to be sure that the image
		// download isn't using up bandwidth.  This also saves us if the timeout
		// happens on the first image.  If it didn't, we'd have nothing to measure.
		timer=setTimeout(function() {
					if(callback) {
						callback.call(that, i, tstart, run, null);
					}
				},
				images[i].timeout
					+ Math.min(400, this.latency ? this.latency.mean : 400)
			);

		tstart = new Date().getTime();
		img.src=url;
	},

	lat_loaded: function(i, tstart, run, success)
	{
		if(run !== this.latency_runs+1) {
			return;
		}

		if(success !== null) {
			var lat = new Date().getTime() - tstart;
			this.latencies.push(lat);
		}
		// we've got all the latency images at this point,
		// so we can calculate latency
		if(this.latency_runs === 0) {
			this.latency = this.calc_latency();
		}

		this.defer(this.iterate);
	},

	img_loaded: function(i, tstart, run, success)
	{
		if(run !== this.runs_left+1) {
			return;
		}

		if(this.results[this.nruns-run].r[i])	{	// already called on this image
			return;
		}

		// if timeout, then we set the next image to the end of loop marker
		if(success === null) {
			this.results[this.nruns-run].r[i+1] = {t:null, state: null, run: run};
			return;
		}

		var result = {
				start: tstart,
				end: new Date().getTime(),
				t: null,
				state: success,
				run: run
			};
		if(success) {
			result.t = result.end-result.start;
		}
		this.results[this.nruns-run].r[i] = result;

		// we terminate if an image timed out because that means the connection is
		// too slow to go to the next image
		if(i >= images.end-1
			|| typeof this.results[this.nruns-run].r[i+1] !== "undefined"
		) {
			BOOMR.debug(this.results[this.nruns-run], "LAT");
			// First run is a pilot test to decide what the largest image
			// that we can download is. All following runs only try to
			// download this image
			if(run === this.nruns) {
				images.start = i;
			}
			this.defer(this.iterate);
		}
	},
	/**
	* count total
	**/
	finish: function()
	{
		if(!this.latency) {
			this.latency = this.calc_latency();
		}
		var		o = {
				lat:		this.latency.mean,
				lat_err:	parseFloat(this.latency.stderr, 10),
				bw_time:	Math.round(new Date().getTime()/1000)
			};
		BOOMR.addVar(o);

		// If we have an IP address we can make the BA cookie persistent for a while
		// because we'll recalculate it if necessary (when the user's IP changes).
			BOOMR.utils.setCookie(this.cookie,
						{

							l:  o.lat,
							ip: this.user_ip,
							t:  o.bw_time
						},
						(this.user_ip ? this.cookie_exp : 0)
				);

		this.complete = true;
		BOOMR.sendBeacon();
		this.running = false;
	},

	iterate: function()

	{
		if(this.aborted) {
			return false;
		}

		if(!this.latency_runs) {
			this.finish();
		}
		else if(this.latency_runs) {
			this.load_img('l', this.latency_runs--, this.lat_loaded);
		}
	},

	setVarsFromCookie: function(cookies) {
		var lat = parseInt(cookies.l, 10) || 0,
		    lat_e = parseFloat(cookies.le, 10) || 0,
		    c_sn = cookies.ip.replace(/\.\d+$/, '0'),	// Note this is IPv4 only
		    t = parseInt(cookies.t, 10),
		    p_sn = this.user_ip.replace(/\.\d+$/, '0'),

		// We use the subnet instead of the IP address because some people
		// on DHCP with the same ISP may get different IPs on the same subnet
		// every time they log in

		    t_now = Math.round((new Date().getTime())/1000);	// seconds

		// If the subnet changes or the cookie is more than 7 days old,
		// then we recheck the bandwidth, else we just use what's in the cookie
		if(c_sn === p_sn && t >= t_now - this.cookie_exp && ba > 0) {
			this.complete = true;
			BOOMR.addVar({
				'bw': ba,
				'lat': lat,
				'bw_err': bw_e,
				'lat_err': lat_e
			});

			return true;
		}

		return false;
	}

};

BOOMR.plugins.LAT = {
	init: function(config) {

		var cookies;
		if(impl.complete) {
			return this;
		}

		BOOMR.utils.pluginConfig(impl, config, "LAT",
						["base_url", "timeout", "nruns", "cookie", "cookie_exp","day"]);
		/*depend on config day*/
		cookies = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie(impl.cookie));

		if(impl.day){
			impl.cookie_exp =  impl.day*86400;
		}
		if(config && config.user_ip) {
			impl.user_ip = config.user_ip;
		}
		if(!impl.base_url) {
			return this;
		}

		images.start = 0;
		impl.runs_left = impl.nruns;
		impl.latency_runs = 10;
		impl.results = [];
		impl.latencies = [];
		impl.latency = null;
		impl.complete = false;
		impl.aborted = false;
		/*depend on cookies expect time*/
	//		BOOMR.removeVar('lat', 'lat_err');

		
		/*若缓存中没有，则直接退出*/
		if(!cookies || !cookies.ba || !impl.setVarsFromCookie(cookies)) {
			BOOMR.subscribe("page_ready", this.run, null, this);
			BOOMR.subscribe("page_unload", this.skip, null, this);
		}
		return this;
	},

	run: function() {
		if(impl.running || impl.complete) {
			return this;
		}

		if(BOOMR.window.location.protocol === 'https:') {
			// we don't run the test for https because SSL stuff will mess up b/w
			// calculations we could run the test itself over HTTP, but then IE
			// will complain about insecure resources, so the best is to just bail
			// and hope that the user gets the cookie from some other page

			BOOMR.info("HTTPS detected, skipping bandwidth test", "LAT");
			impl.complete = true;
			BOOMR.sendBeacon();
			return this;
		}

		impl.running = true;

		setTimeout(this.abort, impl.timeout);

		impl.defer(impl.iterate);
		return this;
	},

	abort: function() {
		impl.aborted = true;
		if (impl.running) {
			impl.finish();	// we don't defer this call because it might be called from
					// onunload and we want the entire chain to complete
					// before we return
		}
		return this;
	},

	skip: function() {
		// this is called on unload, so we should abort the test
		// if it's already started and report results.
		this.abort();

		// it's also possible that we didn't start, so sendBeacon never
		// gets called.  Let's set our complete state and call sendBeacon.
		// This happens if onunload fires before onload

		if(!impl.complete) {
			impl.complete = true;
			BOOMR.sendBeacon();
		}

		return this;
	},

	is_complete: function() { return impl.complete; }
};

}());
// End of BW plugin


