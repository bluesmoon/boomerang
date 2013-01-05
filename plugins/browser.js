/**
 * this javascript design by http://www.quirksmode.org/js/detect.html
 * 
*/

// w is the window object
(function(w) {

var d=w.document;


BOOMR = BOOMR || {};
BOOMR.plugins = BOOMR.plugins || {};

var impl = {
	complete:false,
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
		this.complete = true;
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	/*If you want add new browser or other system,can use this type into this array.*/
	dataBrowser: [
		{
			string: navigator.userAgent,   	/*String from by this*/
			subString: "Chrome",			/*use this String to find*/
			identity: "Chrome"				/*return result*/
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	],
	finish:function(){

	}
	
};

BOOMR.plugins.MyPlugin = {
	init: function(config) {
	//	var i, properties = ["prop1", "prop2"];	// list of user configurable properties in O
	impl.init();
	BOOMR.addVar({
		browser:impl.browser,
		version:impl.browser,
		os:impl.os
	}
		);
		// This block is only needed if you actually have user configurable properties
//		BOOMR.utils.pluginConfig(impl, config, "MyPlugin", properties);
		// Other initialisation code here
		// Subscribe to any BOOMR events here.
		// Unless your code will explicitly be called by the developer
		// or by another plugin, you must to do this.

		return this;
	},

	// Any other public methods would be defined here

	is_complete: function() {
		return impl.complete; 
		// This method should determine if the plugin has completed doing what it
		/// needs to do and return true if so or false otherwise
	}
};

}(window));

