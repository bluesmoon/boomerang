/**
\file forms.js
A plugin beaconing submitted forms back to the server seperate from the application
*/

(function(w){
    BOOMR = BOOMR || {};
    BOOMR.plugins = BOOMR.plugins || {};

    var d = w.document;

    /* filter() and map() taken from lodash */
    var impl = {
	forms_url: "",
	name: "boomerang_form_post",
	filter: function(cb) {
	    var array = this;
	    var index = -1,
		length = array.length,
		resIndex = -1,
		result = [];

	    while (++index < length) {
		var value = array[index];
		if (cb(value, index, array)) {
		    result[++resIndex] = value;
		}
	    }
	    return result;
	},
	map: function(cb) {
	    var array = this;
	    var index = -1,
		length = array.length,
		result = Array(length);

	    while (++index < length) {
		result[index] = cb(array[index], index, array);
	    }
	    return result;
	},
	isSensitive: function(target) {
	    var boomerSensitive = "data-boomerang-sensitive",
		dataSensitive = "data-sensitive";

	    if ((target.getAttribute(boomerSensitive) &&
		 target.getAttribute(boomerSensitive) === "true") ||

		(target.getAttribute(dataSensitive) &&
		 target.getAttribute(dataSensitive) === "true")) {
		return true;
	    }
	    return false;
	},
	handleEvent: function(event) {
	    BOOMR.debug("Handling Form Submission", "forms");

	    if (impl.isSensitive(event.target)) {
		return;
	    }

	    var elements = [];

	    if (typeof elements.map !== "function") {
		elements.map = impl.map;
	    }

	    if (typeof elements.filter !== "function") {
		elements.filter = impl.filter;
	    }

	    for(var index = 0; index < event.target.length; index++) {
		elements.push(event.target[index]);
	    }

	    elements = elements.filter(function(element) {
		if (!element.type || element.type === "submit") {
		    return false;
		} else if (impl.isSensitive(element)) {
		    return false;
		}
		return true;
	    });

	    if (elements.length === 0) {
		BOOMR.warn("No elements found, will not send a Forms!", "forms");
		return;
	    }

	    var formData = elements.map(function(el) {
		var obj = {
		    name: el.name,
		    value: el.value,
		    type: el.type,
		    id: el.type
		};
		return obj;
	    });

	    var form = {
		id: event.target.id,
		tag: event.target.tagName,
		classes: event.target.classList || event.target.className.split(" "),
		data: formData
	    };

	    impl.postData(form);
	},
	postData : function(data) {
	    var iframe,
		form = d.createElement("form"),
		input = d.createElement("input");

	    try {
		iframe = d.createElement('<iframe name="' + impl.name + '">');
	    }
	    catch (ignore) {
		iframe = d.createElement("iframe");
	    }

	    iframe.name = impl.name;
	    iframe.style.display = form.style.display = "none";

	    form.method = "POST";
	    form.action = impl.forms_url;
	    form.target = iframe.name;

	    input.name = "data";

	    if (w.JSON) {
		form.enctype = "text/plain";
		input.value = JSON.stringify(data);
	    } else {
		BOOMR.info("Couldn't find JSON skipping form submission data", "forms");
	    }

	    d.body.appendChild(iframe);
	    form.appendChild(input);
	    iframe.appendChild(form);

	    BOOMR.info("Submitting data: " + input.value, "forms");
	    form.submit();
	},
	ready: function() {
	    w = BOOMR.window;
	    d = w.document;
	    d.addEventListener("submit", impl.handleEvent);
	}
    };

    BOOMR.plugins.forms = {
	init: function(config) {
	    var i, properties = ["forms_url",      // URL to beacon
				 "onbeforeunload",
				 "onsubmit"]; // Send the beacon when page is closed?
	    // This block is only needed if you actually have user configurable properties
	    BOOMR.utils.pluginConfig(impl, config,"forms", properties);
	    BOOMR.debug("Forms Plugin initialized with Forms URL:\"" + impl.forms_url + "\"", "forms");

	    BOOMR.subscribe("page_ready", impl.ready, null, impl);

	    return this;
	},

	// Any other public methods would be defined here
	is_complete: function() {
	    return true;
	}
    };

}(this));
