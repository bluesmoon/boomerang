/**
\file forms.js
A plugin beaconing submitted forms back to the server seperate from the application
*/

(function(w,d){
    BOOMR = BOOMR || {};
    BOOMR.plugins = BOOMR.plugins || {};

    var impl = {
	start_time: "",
	form_url: "",
	handleEvent: function(event) {
	    var elements = [];
	    for(var index = 0; index < event.target.length; index++) {
		elements.push(event.target[index]);
	    }

	    elements = elements.filter(function(element) {
		if (typeof(element.type) === "undefined") {
		    return false;
		}
		if (element.type === "submit") {
		    return false;
		}
		return true;
	    });

	    impl.data = elements.map(function(el) {
		var obj = {
		    name: el.name,
		    value: el.value,
		    type: el.type,
		    id: el.type
		};

		return obj;
	    });

	    if (impl.onsubmit === true) {
		impl.sendData(data);
	    }

	    BOOMR.info("Form Submission Captured, JSON: " + JSON.stringify(impl.data,undefined, 4));
	},
	unload: function() {
	    if ( impl.onbeforeunload === true ) {
		impl.sendData(impl.data);
	    }
	},
	sendData : function(data) {
	    var keys = Object.keys(data);
	    var urlenc = "";

	    for (var i in keys) {
		urlenc += keys[i] + "=" + data[keys[i]] + "&";
	    }

	    BOOMR.info("Url-encoded string: " + urlenc);
	    var url = impl.form_url + "?" + urlenc;
	    var img = new Image();
	    img.src = url;
	    img.remove();
	}
    };

    BOOMR.plugins.forms = {
	init: function(config) {
	    var i, properties = ["form_url",      // URL to beacon
				 "onbeforeunload",
				"onsubmit"]; // Send the beacon when page is closed?

	    // This block is only needed if you actually have user configurable properties
	    BOOMR.utils.pluginConfig(impl, config,"forms", properties);

	    // Other initialisation code here
	    w.addEventListener("submit",impl.handleEvent,true);
	    w.addEventListener("beforeunload",impl.unload,true);
	    return this;
	},

	// Any other public methods would be defined here

	is_complete: function() {
	    // This method should determine if the plugin has completed doing what it
	    /// needs to do and return true if so or false otherwise
	    impl.start_time = Date.now();
	    return true;
	}
    };

}(window));
