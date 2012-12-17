(function(){
	var js,jsdone=0;
function include_js(url) { 
    var html_doc = document.getElementsByTagName('body')[0]; 
    js = document.createElement('script'); 
    js.setAttribute('type', 'text/javascript'); 
    js.setAttribute('src', url); 
    html_doc.appendChild(js); 
    //当js加载完成时处理的事件 
    js.onload = function(){
    	jsdone = 1;
    	BOOMR.addVar({requestto:false});
        BOOMR.init({
		user_ip: user_ip,
		  beacon_url: "http://115.182.81.61:8001/1.gif",

		userid:{
			userid:uuid,
			siteid:123004
		},
		BW: {
			base_url: '../../images/',	
			cookie: 'BA',			
			day:15
		},
		LAT:{
			base_url: '../../images/',
			cookie:'LAT',
			timeout:3500,
			day:15
		},
		RT: {
			cookie: 'RT'
		}
	});
    } 
} 
include_js("http://115.182.81.61:8001/config");
})();