/**
\file plugin.js
Skeleton template for all boomerang plugins.  Use this code as a starting point for your
own plugins.
*/

//////////////////////////////////////////////////////////
//    DO NOT INCLUDE THIS FILE IN YOUR HTML DOCUMENT    //
//               THIS IS A SAMPLE PLUGIN                //
//////////////////////////////////////////////////////////

// w is the window object
(function(w) {

var d=w.document;

// First make sure BOOMR is actually defined.  It's possible that your plugin is loaded before boomerang, in which case
// you'll need this.
BOOMR = BOOMR || {};
BOOMR.plugins = BOOMR.plugins || {};

// A private object to encapsulate all your implementation details
// This is optional, but the way we recommend you do it.
var impl = {
	userid:'',
	siteid:'',
	cookie:'userinfo',
	cookie_exp: 356*86400,
	/*设置userinfo的信息到cookies*/
	getcookies:function(){
	    var o = {
				userid:		this.userid,
				siteid: 	this.siteid
			};
		BOOMR.addVar(o);

	},
	setcookie:function(){

		// If we have an IP address we can make the BA cookie persistent for a while
		// because we'll recalculate it if necessary (when the user's IP changes).
			BOOMR.utils.setCookie(this.cookie,
						{

							userid:this.userid,
							siteid:this.siteid
						},
						(this.cookie_exp)
				);
	    /*返回数据*/
	    this.getcookies();
	}
};

BOOMR.plugins.uuid = {
	init: function(config) {

		var i, properties = ["userid", "siteid"];
		/*从cookies中读取本扩展的cookies*/
		cookies = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie(impl.cookie));
		/*若没有在cookies中读取到用户的数据，生成新的数据，若有，直接获取cookies中的信息*/
		if(!cookies || !cookies.siteid){
			BOOMR.utils.pluginConfig(impl, config, "userid", properties);
			impl.setcookie();
		}else{
			impl.siteid = cookies.siteid;
			impl.userid = cookies.userid;
			impl.getcookies();
		}

		/*若config中的userid没有定义，则直接返回.否则设置cookies*/
		return this;
	},

	is_complete: function() {
		return this;
	}
};

}(window));

