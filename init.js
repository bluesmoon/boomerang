/*放在头部*/
    <script type="text/javascript" language="javascript" charset ="utf-8">
  BOOMR_start = new Date().getTime();
    </script>
/*放在中间*/
(function(){

  var iframe = document.createElement('iframe');
  iframe.src="javascript:false";
  iframe.id = 'boomar_if';
  (iframe.frameElement || iframe).style.cssText = "width: 0; height: 0; border: 0";
  var where = document.getElementsByTagName('script')[0];
  where.parentNode.insertBefore(iframe, where);
  var doc = iframe.contentWindow.document;
  doc.open().write('<body onload="'+
        'var config = document.createElement(\'script\');'+
    'config.id =\'configjs\';'+
    'config.src=\'http://www.test.com/config.js\';document.body.appendChild(config);'+
    'var js = document.createElement(\'script\');'+
    'js.id = \'boomr-if-as\';'+
    'js.src = \'boomerang-1.0.1356313160.js\';'+
    'document.body.appendChild(js);'+
    '">');
  doc.close();
})();