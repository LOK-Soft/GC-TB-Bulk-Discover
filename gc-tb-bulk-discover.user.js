// Copyright (C) 2011-2015 by LOK-Soft Lars-Olof Krause http://lok-soft.net
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2, or (at your option)
// any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// ==UserScript==
// @name           GC - TB-Helper & -Bulk-Discover
// @namespace      LOK-Soft.net/GC
// @description    This scripts helps to discover several TBs automatically
// @include        https://www.geocaching.com*
// @include        http://www.geocaching.com*
// @include        http://coord.info/t*
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_registerMenuCommand
// @grant          console.log
// @grant          GM_xmlhttpRequest
// @grant          GM_openInTab
// @downloadURL    https://github.com/LOK-Soft/GC-TB-Bulk-Discover/raw/master/gc-tb-bulk-discover.user.js
// @downloadURL    
// @version        1.3
// ==/UserScript==

  console.log = function(){};

  var job = GM_getValue('tblogjob');
  var loc = String(document.location);
  
  //register GM-Menu
  if(job != 0)GM_registerMenuCommand('GC TB-Bulk-Discover - Clear Job', GCTBBDrem);
  GM_registerMenuCommand('GC TB-Bulk-Discover - Open Logpage', createLogPage);
  //GM_registerMenuCommand('GC TB-Bulk-Discover - Read Loged TB', readLoggedTb);
  
  /*
   * Function called on initialition
   *
   * @function init
   * @return {void}
   */
  function init(){
    if(loc.indexOf("geocaching.com/#tblogfin") != -1){ //Final Page
      console.log("tblogfinpage onsite");
      document.getElementsByTagName("html")[0].innerHTML = '<html><head><title>TB-Bulk-Log Finished</title></head><body><h2>TB-Bulk-Log Finished</h2><br />Errors in following codes:<div id="codeerror"></div></body></html>';
      //List wrong codes
      var tbwrongcodes = GM_getValue('tbwrongcodes').split(" ,");
      console.log("tbwrongcodes "+ tbwrongcodes);
      var errorcodes = "<ul>";
      for(var i = 0;i < tbwrongcodes.length; i++){
        if(tbwrongcodes[i].length > 1)
          errorcodes += "<li>" + tbwrongcodes[i]+ "</li>";
      }
      errorcodes += "</ul>";
      var errdiv = document.getElementById("codeerror");
      errdiv.innerHTML = errorcodes;
      
      //remove job data
      GCTBBDrem();
    }else if(loc.indexOf("geocaching.com/#tblogstop") != -1){ //Stop Page
      console.log("tblog stoppage onsite");
      document.getElementsByTagName("html")[0].innerHTML = '<html><head><title>TB-Bulk-Log Stopped</title></head><body><h2>TB-Bulk-Log Stopped</h2><br />Could not remove following code from open codes: <div id="tbcodestop"></div><br />Open codes:<div id="codeopen"></div><br />Errors in following codes:<div id="codeerror"></div><br /></body></html>';
      
      //Add stop code
      var stopdiv = document.getElementById("tbcodestop");
      stopdiv.innerHTML = GM_getValue('tbcodestop');
      
      //List wrong codes
      var tbwrongcodes = GM_getValue('tbwrongcodes').split(" ,");
      console.log("tbwrongcodes "+ tbwrongcodes);
      var errorcodes = "<ul>";
      for(var i = 0;i < tbwrongcodes.length; i++){
        if(tbwrongcodes[i].length > 1)
          errorcodes += "<li>" + tbwrongcodes[i]+ "</li>";
      }
      errorcodes += "</ul>";
      var errdiv = document.getElementById("codeerror");
      errdiv.innerHTML = errorcodes;
      
      //List open codes
      var tbopencodes = GM_getValue('tbcodes').split(" ,");
      console.log("tbopengcodes "+ tbopencodes);
      var opencodes = "<ul>";
      for(var i = 0;i < tbopencodes.length; i++){
        if(tbopencodes[i].length > 1)
          opencodes += "<li>" + tbopencodes[i]+ "</li>";
      }
      opencodes += "</ul>";
      var opendiv = document.getElementById("codeopen");
      opendiv.innerHTML = opencodes;
      
      //remove job data
      GCTBBDrem();
    }else if(job == 1){
      batch();
    }else if(loc.indexOf("my/default.aspx") != -1){ //add TB-Auto-Log-Link on Profile-Page
      console.log("on profile site");
      var side = document.getElementById("ctl00_ContentBody_WidgetMiniProfile1_LoggedInPanel");
      var header = document.createElement("h3");
      header.setAttribute("class","WidgetHeader");
      header.appendChild(document.createTextNode(" TB-Bulk-Discover"));
    
      var div = document.createElement("div");
      div.setAttribute("class","WidgetBody ProfileWidget");
    
      var ul = document.createElement("ul");
      
      var asite = document.createElement("a");
      if( asite.addEventListener )
          asite.addEventListener( 'click', createLogPage, false );
        else if( asite.attachEvent )
          asite.attachEvent( 'onclick', createLogPage );
        else
          asite.onClick = createLogPage;
      asite.appendChild(document.createTextNode("Open TB-Bulk-Discover Page"));
       
      var lisite = document.createElement("li");
      lisite.appendChild(asite);
      ul.appendChild(lisite);
        
      div.appendChild(ul);
      side.appendChild(header);
      side.appendChild(div);
    }
  }
  
  /*
   * Function initializes Log-Page
   *
   * @function createLogPage
   * @return {void}
   */
  function createLogPage(){
    console.log("CreateLogPage");
    document.getElementsByTagName("html")[0].innerHTML = '';
    document.getElementsByTagName("head")[0].innerHTML = ''
      +'  <title>TB-LOG-Helper</title>'
      +'  <style type="text/css">'
      +'    *{margin:0;padding:0;}'
      +'    #control{position:absolute;height:100%;width:20%;overflow:auto;background-color:grey;padding:0 10px;}'
      +'    #gc{position:absolute;left:21.5%;height:100%;width:78.5%;border:none;}'
      +'    #tbcodes{height:300px;margin-left:10px;margin-right:10px;width:95%;}'
      +'    #logtext{margin-left:10px;width:95%;height:200px;}'
      +'    #go{position:relative;left:140px;top:10px;}'
      +'  </style>';
     document.getElementsByTagName("body")[0].innerHTML = ''     
      +'  <div id="control">'
      +'    <h1>TB-Bulk-Discover</h1>'
      +'    <lable for="tbcodes">TB-Codes (line-by-line)</lable>'
      +'    <textarea id="tbcodes" name="tbcodes"></textarea><br /><br />'
      +'    <span id="Date">'
      +'      <select id="Date_Year" name="Date_Year">'
      +'        <option value="2010">2010</option>'
      +'        <option value="2011">2011</option>'
      +'        <option value="2012">2012</option>'
      +'        <option value="2013">2013</option>'
      +'        <option value="2014">2014</option>'
      +'        <option value="2015">2015</option>'
      +'        <option value="2016">2016</option>'
      +'        <option value="2017">2017</option>'
      +'        <option value="2018">2018</option>'
      +'        <option value="2019">2019</option>'
      +'        <option value="2020">2020</option>'
      +'      </select>'
      +'      <select id="Date_Month" name="Date_Month"><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option></select>'
      +'      <select id="Date_Day" name="Date_Day"><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option></select>'
      +'    </span><br /><br />'
      +'    <lable for="logtext">Logtext</lable>'
      +'    <textarea id="logtext" name="logtext"></textarea>'
      +'    <input type="button" id="go" value="log!" />'
      +'  </div>'
      +'  <iframe src="https://www.geocaching.com/login/" id="gc"></iframe>';
  
    console.log("tblogpage");

    var d = new Date();
    document.getElementById('Date_Year').selectedIndex = (d.getFullYear()-2010);
    document.getElementById('Date_Month').selectedIndex = d.getMonth();
    document.getElementById("Date_Day").selectedIndex = (d.getDate()-1);

    var element = document.getElementById("go");
    if( element.addEventListener )
      element.addEventListener( 'click', startProcessBatch, false );
    else if( element.attachEvent )
      element.attachEvent( 'onclick', startProcessBatch );
    else
      document.onClick = startProcessBatch;
    console.log("eventlistener set");
  }
  
  /*
   * Function removes TB-Autolog-Data
   *
   * @function GCTBBDrem
   * @return {void}
   */
  function GCTBBDrem(){
    GM_setValue('tbcodes', "");
    GM_setValue('tbwrongcodes', "");
    GM_setValue('tbtext', "");
    GM_setValue('logyear',"");
    GM_setValue('logmonth',"");
    GM_setValue('logday',"");
    GM_setValue('tblogjob', 0);
    console.log("job stopped");
  }

  /*
   * Function starts processes batch
   *
   * @function startProcessBatch
   * @return {void}
   */
  function startProcessBatch(){
    console.log("startProcessBatch");
    var tbcodes = document.getElementById("tbcodes").value;
    var logtext = document.getElementById("logtext").value;
    console.log("codes "+tbcodes);
    console.log("text "+logtext);
  
    var tbcodes = tbcodes.split("\n");
    tbcodes.push(" ");
    console.log("codesarr "+tbcodes);
    if(tbcodes.length > 0 && logtext.length > 0){
      console.log("codes/text present");
      GM_setValue('tbcodes', tbcodes.join(" ,"));
      GM_setValue('tbtext', logtext);
      console.log("codes/text saved");
      GM_setValue('logyear',document.getElementById("Date_Year").value);
      GM_setValue('logmonth',document.getElementById("Date_Month").value);
      GM_setValue('logday',document.getElementById("Date_Day").value);
      console.log("date saved");
      GM_setValue('tbwrongcodes',"  ,");
      GM_setValue('tblogjob', 1);
      document.getElementById('gc').src = "http://coord.info/t/" + tbcodes.shift(); 
    }
  
  }

  /*
   * Function is called if batch is running
   *
   * @function batch
   * @return {void}
   */
  function batch(){
    console.log("batch!");
    
    //Check if signed in
    if(document.getElementById('ctl00_divNotSignedIn')){
      console.log("not logdin");
      GM_setValue('tblogjob', 0);
      alert("Please Login to use this service!");
      document.location = "http://geocaching.com/login"
      return 0;
    }
    if(loc.indexOf("coord.info/t/") != -1){ //on coord.info
      var errormessage = document.getElementById('uxDefault').innerHTML;
      if(errormessage.indexOf("Tracking code not found") != -1){
      	var trackcode = loc.substr(20); // http://coord.info/t/
        wrongtbcode(trackcode);
      }
    }else if(loc.indexOf("track/log.aspx?wid=") != -1){
  
      if(!document.getElementById('ctl00_ContentBody_LogBookPanel1_LogImage')){
      	sitetitle = document.getElementsByTagName('title')[0].innerHTML;
      	if(sitetitle.indexOf("404 - File Not Found") != -1){
    		var matches = document.location.href.match(/&c=(.*)/);
	        if(matches){
	          err_tbcode = decodeURIComponent(matches[1]);
              wrongtbcode(err_tbcode);
	        }else{
	        	 GM_setValue('tblogjob', 0);
		         GM_setValue('tbcodestop', loc);
		         alert('Sorry somehow there was an 404 page and the current trackcode could not be determined. To prevent errors the process is stopped.');
		         document.location = "http://geocaching.com/#tblogstop";
	        }
      	} else {
	        console.log("logpage");
	        
	    //check if trackcode is in tracking-list
	        var trcode = document.getElementById('ctl00_ContentBody_LogBookPanel1_tbCode').value;
	        if(GM_getValue('tbcodes').indexOf(trcode + " ") == -1){
	          console.log("trackcode not in trackinglist!");
	          return 0;
	        }
	  
	      //select discover as logtype
	        var changeelement = document.getElementById('ctl00_ContentBody_LogBookPanel1_ddLogType');
	        var childs = changeelement.childNodes;
	        for(var i=0; i<childs.length; i++){
	          if(childs[i].value == 48){
	            childs[i].setAttribute("selected","selected");
	          }
	        }
	        console.log("type selected");
	        
	        var month = (GM_getValue('logmonth') < 10)? '0' + GM_getValue('logmonth'): GM_getValue('logmonth');
	  		var day = (GM_getValue('logday') < 10)? '0' + GM_getValue('logday'): GM_getValue('logday');
	  
	  		//select date
	  		document.getElementById('uxDateVisited').value = GM_getValue('logyear') + '-' + month + '-' + day;       
	        console.log("date entered");
	  
	      //remove vars
	        delete(childs);
	        delete(changeelement);
	
	        //enter log text
	        document.getElementById('ctl00_ContentBody_LogBookPanel1_uxLogInfo').value = GM_getValue('tbtext');
	        console.log("logtext entered");
	        
	        //submit log form
	        console.log("will log "+ trcode + " now");
	        simulateClick(document.getElementById('ctl00_ContentBody_LogBookPanel1_btnSubmitLog'));
	        console.log("after Simulate Click");
	  
	        return 0;
      	}
        
      }else{ //Logged
        
        console.log("log result page");
        var sitecode = "";
        var matches = document.location.href.match(/&c=(.*)/);
        if(matches){
          sitecode = decodeURIComponent(matches[1]);
        }else{
          GM_setValue('tblogjob', 0);
          alert("Error TB-Code not found");
          return 0;
        }
        console.log("sitecode "+ sitecode);
  
        var tbcodes = GM_getValue('tbcodes').split(" ,");
        console.log("tbcodes "+ tbcodes);
  
        var tbcodeRemoved = false;
          //remove code from codelist
          for(var i=0;i<tbcodes.length;i++){
            console.log("comp-"+tbcodes[i]+"-"+sitecode+"-");
            if(tbcodes[i] == sitecode){
              tbcodeRemoved = true;
              tbcodes.splice(i,1);
              console.log("splice"+ i);
              i--;
            }
          }
        if(tbcodeRemoved){
            console.log("tbcodes afer remove"+ tbcodes);
            GM_setValue('tbcodes', tbcodes.join(" ,"));
      
            if(tbcodes.length <= 1){
              GM_setValue('tblogjob', 0);
              document.location = "http://geocaching.com/#tblogfin";
              alert("job finished");
            }else{
               console.log("logged "+ sitecode);
               document.location = "http://coord.info/t/" + tbcodes.shift(); 
            }
        }else{
          GM_setValue('tblogjob', 0);
          GM_setValue('tbcodestop', sitecode);
          alert('Sorry somehow the trackcode could not be removed from list. To prevent a not ending loop the process is stopped.');
          document.location = "http://geocaching.com/#tblogstop";
        }
      }
    }
  }

  /*
   * Function removes code if it is wrong
   *
   * @function wrongtbcode
   * @param {String} trackcode   wrong trackcode
   * @return {void}
   */
  function wrongtbcode(trackcode){
    console.log("tbwrongcode "+ trackcode);
    var tbwrongcodes = GM_getValue('tbwrongcodes')
    console.log("tbwrongcodes "+ tbwrongcodes);
    GM_setValue('tbwrongcodes', tbwrongcodes + " ," + trackcode);
    
    var tbcodes = GM_getValue('tbcodes').split(" ,");
    console.log("tbcodes "+ tbcodes);
  
    for(var i=0;i<tbcodes.length;i++){
      console.log("comp-"+tbcodes[i]+"-"+trackcode+"-");
      if(tbcodes[i] == trackcode){
        tbcodes.splice(i,1);
        console.log("splice"+ i);
        i--;
      }
    }
  
    console.log("tbcodes afer remove"+ tbcodes);
    GM_setValue('tbcodes', tbcodes.join(" ,"));
  
    if(tbcodes.length <= 1){
      GM_setValue('tblogjob', 0);
      document.location = "http://geocaching.com/#tblogfin";
      alert("job finished");
    }else{
      console.log("error "+ trackcode);
      document.location = "http://coord.info/t/" + tbcodes.shift(); 
    }
  
  }

  //
  // Known TBs
  //
  function readLoggedTb(){
    var rows = document.getElementById('ctl00_divContentMain').getElementsByTagName('table')[0].getElementsByTagName('tr');
    var allLogs = [];
    for(var i = 0; i < rows.length; i++){
      var currow = rows[i];
      var imgsrc = currow.getElementsByTagName('img')[0].src;
      var logtype = parseInt(imgsrc.substr(imgsrc.indexOf('.png')-2,2).replace('/','')); // http://www.geocaching.com/images/logtypes/XX.png
      /*
      *Visited:
      *13 = Retrieve It from a Cache
      *14 = Dropped Off
      *19 = Grab It (Not from a Cache)
      *48 = Discovered It
      *75 = Visited
      *Not Visited:
      *4 = Write note
      *16 = Mark Missing
      *69 = Move To Collection
      *70 = Move To Inventory
      */
      
      var logdate = currow.getElementsByTagName('td')[2].innerHTML.replace(/^\s+|\s+$/g, '');
      var rowlinks = currow.getElementsByTagName('a');
      var tbsrc = rowlinks[0].href;
      var tbguid = tbsrc.substr(tbsrc.indexOf('guid=') + 5);
      var logsrc = rowlinks[2].href;
      var luid = logsrc.substr(logsrc.indexOf('LUID=') + 5);
      
      allLogs.push([logtype, logdate, tbguid, luid]);
      //console.log(logtype + ", " + logdate + ", " + tbguid + ", " + luid);
		/* @TODO: save results and display them on page */ 
    }
    var allLogsJSON = JSON.stringify(allLogs);
	console.log(allLogsJSON)
	
	/*JSON.parse(string)*/
  }
  
  //
  // Helper
  //  
  function simulateClick(button) {
    console.log("Simulate Click");
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    button.dispatchEvent(evt);
    console.log("Simulate Click2");
    return 0;
  }

  //
  // Initialize
  //
  init();
  
