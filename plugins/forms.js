/**
\file forms.js
A plugin beaconing submitted forms back to the server seperate from the application
*/

(function(w){
    BOOMR = BOOMR || {};
    BOOMR.plugins = BOOMR.plugins || {};

    var d = w.document;

    var impl = {
	forms_url: "",
	name: "boomerang_form_post",
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

	    var data = elements.map(function(el) {
		var obj = {
		    name: el.name,
		    value: el.value,
		    type: el.type,
		    id: el.type
		};

		return obj;
	    });

	    impl.postData({
		id: event.target.id,
		"class": event.target.classList,
		form_data: data
	    });
	},
	postData : function(data) {
	    var iframe,
		form = d.createElement("form"),
		input = d.createElement("input");

	    try {
		iframe = document.createElement('<iframe name="' + impl.name + '">');
	    }
	    catch (ignore) {
		iframe = document.createElement("iframe");
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
	}
    };

    BOOMR.plugins.forms = {
	init: function(config) {
	    var i, properties = ["forms_url",      // URL to beacon
				 "onbeforeunload",
				"onsubmit"]; // Send the beacon when page is closed?

	    // This block is only needed if you actually have user configurable properties
	    BOOMR.utils.pluginConfig(impl, config,"forms", properties);

	    // Other initialisation code here
	    w.addEventListener("submit",impl.handleEvent,true);
	    return this;
	},

	// Any other public methods would be defined here
	is_complete: function() {
	    return true;
	}
    };

}(window));
