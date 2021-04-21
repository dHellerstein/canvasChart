// generic javascript functions, that use jquery. Misc functions
// Requires availability of wsurveyUtils1.js

/*  :::::::::::::::::::::::::
Copyright 2016.. 2020. Daniel Hellerstein (danielh@crosslink.net)



    wsurveyUtils1 is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    wsurveyUtils1 is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with wsurveyUtils1.  If not, see <http://www.gnu.org/licenses/>.

 ::::::::::::::::::::: */

  //=====
//an "obsfcuator" type of very weak encryption. Slows down harvesting of stuff in code. Meant for use with similar functions in wsPhpLib.php
function rot13(astr) {
  if (jQuery.trim(astr)=='') return astr; 

  z=astr.replace(/[a-zA-Z]/g, function(chr) {
    var start = chr <= 'Z' ? 65 : 97;
    return String.fromCharCode(start + (chr.charCodeAt(0) - start + 13) % 26);
  });
  return z;
}
function ws_obsfucate(astring) {
//   var a1=$.base64('encode',astring);
   var a1=Base64.encode(astring);
   var a1a=a1.replace(/=/g,'$');
   var a2=rot13(a1a);
   return a2;
}
function ws_unobsfucate(astring) {
   var a1=rot13(astring);
   var a1a=a1.replace(/\$/g,'=');
//   var a1=$.base64('decode',a1a);
   var a1=Base64.decode(a1a);
   return a1 ;
}




//===========
// convert a number of seconds to hh:mm:ss format
function Seconds_ToTime(towait,maxhrs) {

  if (arguments.length<2) maxhrs=Math.pow(2,32) - 1;
  if (isNaN(towait)) return towait ;              //ignore non numbers
  if (towait<10) return ':0'+towait ;
  if (towait<60) return ':'+towait ;
  var thr=0;                     // convert seconds to hr:min:sec
  var tmin=Math.floor(towait / 60);
  var tsec=towait -  (tmin*60) ;
  if (tsec<10) tsec='0'+tsec ;

  thr=Math.floor(tmin/60) ;
  tmin=tmin-(thr*60) ;
  if (tmin<10) tmin='0'+tmin ;
  thr1=''
  if (thr>0) {
     thr1=thr ;
     if (thr1<10) thr1='0'+thr1 ;
    if (thr1>=maxhrs) {
       goo=thr1;
       thr2=parseInt(thr1/24) ;
       thr1=thr2+'d '+(thr1 % maxhrs)+':' ;
    } else {
       thr1=thr1+':';
    }
  }
  var dahh=thr1 + tmin +':' + tsec ;
 if (dahh.indexOf('.')>0) {                     // strip out fractional seconds
        dahh=dahh.split('.');
        return dahh[0];
 }
  return dahh ;

}

seconds_toTime=Seconds_ToTime;
seconds_ToTime=Seconds_ToTime;
secondsToTime=Seconds_ToTime ;



//====================
// convert a number to $mm.cc
function show_dollars(avalue) {
 avalue=parseFloat(avalue+0.00001);
 var foo=avalue.toFixed(2) ;
 if (foo>=0) return '$'+foo ;
 foo=-foo; foo=foo.toFixed(2) ;
 return '-$'+foo;
}

// from:  http://www.mredkj.com/javascript/numberFormat.html
function addComma(nStr) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}



//==============
// return a list of words, or the nth word (where nth=1 means "first . Returns '' if object, or if nth > # of words
// if nth an array, get words from nth[0] to nth[1] INCLUSIVE.
// i.e.;  astring="this is my string of words "
//  getWord(astring,1) = "this"
//  getWord(astring) = array of 6 elements
//  getWord(astring,7)=''
//  toget=[3,4] ;  foo=getWord(astring,toget,' ')  = "my string"
// jan 2019  Probably should update this to use regex as some kind of default (i.e.; all white space). Say, by using an array in delim (rather than a string)
// oct 2019. Nth <0 : get from end (-1 means "get last word"

function  getWord(astring,nth,adelim)   {

  var   is2,foo,foonew,a1,j,n1,n2,aa;
  if (arguments.length<2) nth=0;
  if (arguments.length<3) adelim=''; 
  if (typeof(adelim)=='string') adelim=jQuery.trim(adelim);

  if (typeof(astring)=='object') return '' ;
  if (typeof(astring)=='number') {
        if (nth!=0) return '' ;
        return astring  ;
   }
   if (typeof(astring)=='undefined' || typeof(astring.split)!=='function' ) return 'getWord_astring_error' ;

  is2=0;
  if (typeof(nth)=='object' && nth.length && nth.length>1) is2=1;
  if (adelim=='') {
        var foo=astring.split(' ');
        var foonew=new Array() ;
        for (var j=0 ; j<foo.length;j++){
           var a1=jQuery.trim(foo[j]);
           if (a1=='') continue ;
           foonew[foonew.length]=a1 ;
        }
   } else {
        if (typeof(astring)=='undefined' || typeof(astring.split)!=='function') return 'getWord_delim_error';
         foonew=astring.split(adelim);
   }

   if (is2==1) {                        // subset of the words
       n1=parseInt(nth[0]) ; n2=parseInt(nth[1]);
       if (isNaN(n1) || isNaN(n2)) return ''  ;
       if (n1>foonew.length || n2 <1) return '';
       if (n1<1) n1=1 ; if (n2>foonew.length) n2=foonew.length ;
       if (n1==n2) return foonew[n1-1] ;
       aa=adelim ; if (aa.length==0) aa=' ';
       var arf=foonew.slice(n1-1,n2) ;
       arf=arf.join(aa);
       return arf ;
   }

   if (nth>0)  {
        if (nth>foonew.length) return '' ;
        return foonew[nth-1] ;
   }
   if (nth<0) {
     nthlast=-nth;
     if (nthlast>foonew.length) return '' ;
     return foonew[foonew.length-nthlast];
   }

   return foonew ;                       // return the array
}

var getWords=getWord ;

//======
//  several html to endtity conversion functions .
// convert html tags to entties (<b> becomes &lt;b&gt;
function htmlTagsConvert(str) {
  if (typeof(str)!=='string') return str ;   // don't modify non strings
  str = str.replace(/&/g, "&amp;");
  str = str.replace(/>/g, "&gt;");
  str = str.replace(/</g, "&lt;");
  str = str.replace(/"/g, "&quot;");
  str = str.replace(/'/g, "&#039;");
  return str;
}

function htmlspecialchars(str) {   // synonymn
   return htmlTagsConvert(str);
}





//=====================
// convert a style="s1:value;s2:value" type of string to an object useable by $().css()
function styleToJquery(astyle) {
  var astyle1,astyle2,im2;
       astyle1=astyle.split(';');
       astyle2={};
       for (im2=0;im2<astyle1.length;im2++) {
           a2=astyle1[im2].split(':',2);
           astyle2[a2[0]]=a2[1];
       }
 return astyle2;
}




//===================================
// html encode a string for a limited set of characters
// 1: ascii codes <32
//    ascii codes > 127
//  characters:    "  &  ' ( )  ,  < >
function someHTMLEncode(str){

  var doem={34:1,38:1,39:1,40:1,41:1,44:1,60:1,62:1,37:1} ;
  var i = str.length, aRet = [];

  while (i--) {
    var iC = str[i].charCodeAt();
    if (iC<32 || iC>127 || typeof(doem[iC])!=='undefined') {
        aRet[i] = '&#'+iC+';';
    } else {
        aRet[i] = str[i];
      }
  }
  return aRet.join('');
}

someHTMLencode=someHTMLEncode ;

//===================================
// decode  limited set of html enties in string: that have a syntax of &#nn;
// &#nn; characters for the following will be decoded (converted back to the character:    "  &  ' ( )  ,  < >  %
// also, entity names (some of them non-standard) are recoqnized:  quot amp apost lparen rparen comma lt gt
//
// example : &#38; or &38; become '&',  &#41; or &rparen; become ")"
//
// If others is specified, other string replacements (all occurences) will happen
// Others should be an array of objects. Each object should have two fields:  toFind (the thing to find in the string), and replaceWith (the new value)
// Example: others=[]; others[0]={toFind:' this.id ',toReplace:thisElement}


function someHTMLDecode(str,others,justOthers){

 var aa,a1,aorig,areplace,m,a,i,doem;
 if (arguments.length<3) justOthers=0;
 justOthers=jQuery.trim(justOthers);

 if (justOthers!=='1') {
   doem={'34':'"', '38':'&', '39':"'", '40':'(', '41':')', '44':",", '60':'<', '62':'>','quot':'"','amp':'&','gt':'>','lt':'<','lparen':'(','rparen':')','comma':',','apost':"'",'37':'%'} ;
   i = str.length, aRet = [];

  for (a in doem) {
      if (isNaN(a)) {
        aa=RegExp('&'+a+';','g') ;
      } else {
         aa=RegExp('&#'+a+';','g') ;
      }
      str=str.replace(aa,doem[a]);
  }
}


 if (arguments.length>1) {           // other replacements
   for (m=0;m<others.length;m++) {
       a1=others[m];
       aorig=a1.toFind ;
       aa=RegExp(aorig,'g') ;
       areplace=a1.replaceWith ;
      str=str.replace(aa,areplace);
   }
 }

  return str;
}

someHTMLdecode=someHTMLDecode ;


//===========
// similar to above...
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
htmlentities=htmlEntities ;

function htmlEntitiesReverse(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeHtml(text) {
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

function unescapeHtml(text) {
  return text
      .replace(/\&amp;/g,'&')
      .replace(/\&lt;/g,'<')
      .replace(/\&gt;/g,'>')
      .replace(/\&quot;/g,'"')
      .replace(/\&#039;/g,"'");
}


//===================
// split string into two parts, using achar

function parseAt(theString,achar) {
  var iat,a1,a2;

   if (arguments.length<2) return [theString,''];

   iat=theString.indexOf(achar);
   if (iat<0) return [theString,''];
   if (iat==0) return ['',theString.substr(achar.length)];;

   a1=theString.substr(0,iat );
   a2=theString.substr(iat+achar.length);
   return [a1,a2];
}


//===================
//===============
// parse from the var, between first d1 and first d2 characters (following d1)
// return 3 elements (before extraction, the extraction, after extraction)
// if allp=1, just return extracion (as a string). if 2, same as 1 but if NO delimiters, return null (not '') in a3[1]

function parseUsing(thevar,d1,d2,allp ) {
if (arguments.length<4)allp=0 ; allp=jQuery.trim(allp);
if (typeof(thevar)=='undefined') {
    abortJavaScript('%WARNING: Undefined string in parseUsing ');
    return '' ;
 }
 if (arguments.length<2) return thevar ;
 if (arguments.length<3) d2='' ;
 allp=jQuery.trim(allp);
var a3=new Array('','','') ;
if (allp==2) { allp=1 ;a3[1]=null; }

 var dares='' ;
if (jQuery.trim(d1)==='') {                  // no first delim means :"everything upto the 2nd delim"
      var idb=thevar.indexOf(d2) ;
      if (idb<1) {                // cant find 2nd delim.. so use entire string
         if (allp!=1)  return thevar ;
         a3[1]=thevar ;                 // no 2nd delimiter, everything matches
         return a3 ;
      }
     if (allp!=1)  return thevar.substr(0,idb) ;
      a3[1]=thevar.substr(0,idb) ;                 // match is everything up to this 2nd delminter -- there is no "leading" portion
      a3[2]=thevar.substr(idb+1) ;
      return a3 ;
}
if (jQuery.trim(d2)==='') {                   // no second delim means "everything after the first delim"
      var ida=thevar.indexOf(d1,ida);
      if (ida<1)  {                       // cant find first delim, so use ''
         if (allp!=1) return '';                     // no first delim, so nothing to return
         a3[0]=thevar ;                        // no match to first, so all in preceder
         return a3 ;
      }
      if (allp!=1)  return thevar.substr(ida+1) ;
      a3[0]=thevar.substr(0,ida) ;                      // no trailer
      a3[1]=thevar.substr(ida+1) ;
      return a3 ;
}

//there are 2 delimters

 var lend1=d1.length;

 var ida=thevar.indexOf(d1,ida);


 if (ida==-1) {
      if (allp!=1)    return '' ;                     // can't find first
      a3[0]=thevar ;
      return a3 ;
 }


 var idb=thevar.indexOf(d2,ida+1);

 if (idb<ida) {
      if (allp!=1)  return thevar.substr(ida+d1.length) ;               // cant find 2nd
      a3[0]=thevar.substr(0,ida+lend1)  ;
      a3[1]=thevar.substr(ida+lend1)  ;
      return a3 ;
}

var tt=idb-(ida+lend1) ;
if (allp!=1) return thevar.substr(ida+lend1,tt);
a3[0]=thevar.substr(0,ida);
a3[1]=thevar.substr(ida+lend1,tt);
a3[2]=thevar.substr(idb+1) ;

return a3 ;

}

//  For most trim operatons (i.e.; if the which argument is not needed) we recommend using jQuery.trim(xxx) instead
function trim(str,which) {
  if (typeof(str)=='number') {str=str+''; return str; }
  if (typeof(str)!='string') return str;
  if (arguments.length<2) {
      which=''
   } else {
    which=which.toUpperCase();
    which=which.replace(/\s+/g,'')
    which=which.substring(0,1);
  }
  if (which=='L')  return str.replace(/^\s+/, '');
  if (which=='R') return str.replace(/\s+$/, '');
  return str.replace(/^\s+|\s+$/g, '');                         // trim both sides

}
//=====================
// display a message and clumsily exit javascript
// if showtrace =1, user can have a stacktrace error path shown (if stacktrace.js has been loaded)

function abortJavaScript(amess,showtrace) {
  if (arguments.length<2) showtrace=0;showtrace=jQuery.trim(showtrace);


  if (showtrace=='1' && typeof(printStackTrace)=='function') {
      var vtmp=confirm(amess+'\n Would you like to view a stackTrace of where this occurred?');
      if (vtmp) {
        var trace = printStackTrace();
        trace=trace.join('\n\n')   ;
        alert(trace)
      }
      throw new Error('This is not a javascript coding error -- javascript is being aborted because: '+amess);

  } else {
     if (arguments.length>0) {
        alert(amess);
        throw new Error('This is not a javascript coding error -- javascript is being aborted because: '+amess);
     } else {
        throw new Error('This is not a javascript coding error -- javascript is just being aborted.');
     }
  }

}

// ----------
// return time and/or date
//  If no arguments: return  hh:mm:ss xM
// timeType:
//      0 = javascript milliseconds   (and ingure 2nd argument))
//      1 =  mm:hh:ss xM
//      11 = same as 1 , using 24 hr time (so no xM)
//      2  = same as 1, with GMT offset noted
//      21= same as 2, using 24 hour time (so no xM0
//     31: short (hh:mm) 24 hr time  (no xM)
//   otherwise: same as 0
//    default is 1
//
// dateType:
//      1=  date Month Year
//      2 = day-of-week, date Month Year
//
// if timeType and dateType ==2 : return as: xday Month date year hh:mm:ss GMT-xxxx (tz)

// if both time and date specified, format is date-string, time-string
//
// 28 April 2020: if 3rd argument is a unix time stamp, return stamp for that (rather than current time)

wsCurrentTime=get_currentTime ;  // some synoynms
ws_currentTime=get_currentTime ;

function get_currentTime(timeType,dateType,useTime) {
  var Hours,Mins,Time,Sec,atime,adate,jdate,amonth,ayear,aday;

   if (arguments.length<1 ) timeType=1;
   if (arguments.length>0) {
       if (typeof(timeType)=='object' || jQuery.trim(timeType)==='') timeType=1;
    }
   if (arguments.length<2) dateType=0 ;

  if (arguments.length<3) {
     Stamp = new Date();
  } else {
     Stamp=new Date(useTime);;
  }
  atime=''; jdate='';

  if (timeType==0) return Stamp.getTime()  ;                    // internal time (milliseconds since 1970)

  if (timeType==2 && dateType==2) {  // fullblown time -- use javascript default
        adate=Stamp.toString();
        return adate ;
   }

  if (timeType==2 || timeType==21) {   // GMT time. default is hh:mm:ss Xm GMT offset
      Hours = Stamp.getUTCHours();
      Time= '';
      if (timeType!=21)  {     // not 24 hr
        if (Hours >= 12) {
           Time = "PM";
          }     else {
              Time = "AM";
          }
          if (Hours > 12) {
            Hours -= 12;
         }
          if (Hours == 0) {
              Hours = 12;
         }
       }
       Mins = Stamp.getUTCMinutes();
       if (Mins < 10) {   Mins = "0" + Mins } ;

       Secs = Stamp.getUTCSeconds();
       if (Secs < 10) {   Secs = "0" + Secs } ;
       atime=Hours + ':' + Mins + ':' +  Secs + ' ' + Time +' GMT';

   }  else if (timeType==31) {  // hh:mm
          Hours = Stamp.getUTCHours();
          Mins = Stamp.getMinutes();
          if (Mins < 10) {   Mins = "0" + Mins } ;
          atime=Hours + ':' + Mins ;

   }  else {   // default is hh:mm:ss Xm   -- drop xm if 11

         Hours = Stamp.getHours();
         Time='';
        if (timeType!=11) {
           if (Hours >= 12) {
             Time = "PM";
           }   else {
              Time = "AM";
           }
           if (Hours > 12) {
              Hours -= 12;
           }
           if (Hours == 0) {
              Hours = 12;
           }
         }
         Mins = Stamp.getMinutes();
         if (Mins < 10) {   Mins = "0" + Mins } ;

         Secs = Stamp.getSeconds();
         if (Secs < 10) {   Secs = "0" + Secs } ;
         atime=Hours + ':' + Mins + ':' +  Secs + ' ' + Time ;

    }  // timetype (21 or 2, 31, other)


  if (dateType!=0) {
     adate= (timeType==2 ) ?  adate=Stamp.toUTCString() : adate=Stamp.toString() ;
     var foo=adate.split(' ');
     aday=foo[0]; amonth=foo[1]; adate=foo[2] ; ayear=foo[3];
     jdate=adate+' '+amonth+' '+ayear+' ';
     if (dateType==2 )  jdate=aday + ', ' + jdate;
  }

  atime=jdate+atime ;
  return atime ;
}


//=========================================================
// display string in a new HTML window.
//  stuff: string to write to new window
//  if cvt=1, convert <  > and & to entity codes
// astext: 0 = html,  1=xml, 2 =text
// aheader: string to put at top of text file, or to use as title of html
// winname : name of window to create (use default if not specified --- 'sdata'
// yesbars: default=0. If 0, don't show menubars, etc. If 1, do show
//  width: pixel width of new window  (default is to do whatever system does
//  height: pixel height of new window (default is to do whatever system does
//
// possible winName values Optional. Specifies the target attribute or the name of the window. The following values are supported:
//
//    _blank - URL is loaded into a new window. This is default
//    _parent - URL is loaded into the parent frame
//    _self - URL replaces the current page
//    _top - URL replaces any framesets that may be loaded
//    name - The name of the window
// returns pointer to newly opened window

function  displayStringInWindow(stuff,cvt,astext,aheader,winname,yesbars,awidth0,aheight0){
  var stuff2,aheader;

  if (arguments.length<3) astext=0;
  if (arguments.length<4) aheader='' ;
  if (arguments.length<5) winname='sdata' ;
  if (arguments.length<6) yesbars='0' ;

  var awidth='', aheight='';
  if (arguments.length>6) awidth=",width="+awidth0+'px';
  if (arguments.length>7) aheight=",height="+aheight0+'px';
   aheader=trim(aheader);
  stuff2=stuff;
  if (cvt==1) {
      stuff2=stuff2.replace(/\&/g,'&amp;');
      stuff2=stuff2.replace(/\>/g,'&gt;');
      stuff2=stuff2.replace(/\</g,'&lt;');
  }
  if (jQuery.trim(yesbars)!=='1') {

    var ww=window.open('',winname,"toolbar=0,menubar=0,directories=0,scrollbars=1,resizable=1"+awidth+aheight );
  } else {
    var ww=window.open('',winname,"toolbar=1,menubar=1,directories=0,scrollbars=1,resizable=1"+awidth+aheight  );
  }
  if (astext==2) {
       ww.document.open('text/plain; charset=utf-8');
       stuff2=aheader+"\n ========================================================== \n"+stuff2 ;

  } else if (astext==1)  {
        ww.document.open('text/xml');
  } else {
    stuff2=unescapeHtml(stuff2)

    ww.document.open('text/html; charset=utf-8');
  }

  ww.document.writeln(stuff2);
  ww.document.close();
  ww.focus();

  var  wwGlobal=ww ;
  var  wwAheader=aheader ;
  ww_check();
  return ww;

// change title of window... might have to do wait for content to be fully loaded
  function ww_check() {
    if(wwGlobal.document) { // if loaded
        wwGlobal.document.title = wwAheader; // set title
    } else { // if not loaded yet
        setTimeout(ww_check, 10); // check in another 10ms
    }
   return 1;
  }
}


//================================
// display contents of abox in a new window. This is a front end to displayStringInWindow
// aid: string containing id of content to  move to new window
// or array. First element is content to move. later ones are names of local css files to add
// atitle: title  of page.
//   or: a 3 element array [title,windowName,noButtons]
// stuff3 : optional. If specified, use this string as is (used instead of aid, or instead of aid[0])
// Note: this is optimized to be used with output from the dump_debug php function in wsPhpLib.php
// Note: if there are any elements with a class of '.containers', then add "open" and "close" buttons at top
//    also open buttons for  .containers_1,.containers_2
///   Buttons are NOT added if noButtons=1, or atitle=1
function displayElsewhere(aid0,atitle,stuff3) {

  var stuff,stuff2,nobuttons=0,t1='',aid,others=[],a1,ii,winName='Info';
  if (arguments.length<2) atitle="Info";
  if ($.isArray(atitle)) {
      if (atitle.length>1) winName=atitle[1] ;
      if (atitle.length>2) nobuttons=atitle[2] ;
      atitle=atitle[0];
  }

  if (atitle=='1') {
     atitle='Info ';
     nobuttons=1;
  }

  if (arguments.length<3) {
     if (typeof(aid0)=='string') {
         if (aid0.substr(0,1)=='#') {
            stuff=$(aid0).html() ;
         } else {
            stuff=$('#'+aid0).html();
         }

     } else {    // arg1 is not a string -- its  a pointer to something
        if (aid0 instanceof jQuery) {
           stuff=aid0.html() ;
        } else {             // an array
           a1=aid0[0];
           if (a1 instanceof jQuery) {
              stuff=a1.html() ;
           } else {
             if (a1.substr(0,1)=='#') {
                stuff=$(a1).html()    ;
             } else {
                stuff=$('#'+a1).html();
             }
           }
           for (ii=1;ii<aid0.length;ii ++){   // and elements 1... are stylesheets
              others[ii-1]='<link rel="stylesheet" type="text/css" href="'+aid0[ii]+'" >\n';
           }
       }   // not jsuqery
     }    // not string

  } else {       // #args > 2 : so last arg is the string to display (do NOT use aid0[0] -- but DO use aid0[1].... for stylesheets
      stuff=stuff3;  // use contents of argument
      if ($.isArray(aid0)) {
           for (ii=1;ii<aid0.length;ii ++){   // and elements 1... are stylesheets
              others[ii-1]='<link rel="stylesheet" type="text/css" href="'+aid0[ii]+'" >\n';
           }
      }
  }

  if (stuff.indexOf('.containers')<0) nobuttons=1;

//  if (nobuttons!==1) {
//     t1='<input type="button" value="&#8661;" title="expand all" onClick="$(\'.containers\').show()"><input type="button" value="c" title="collapse all" onClick="$(\'.containers\').hide()">';
//  }

   stuff2='<html><head><title>'+atitle+'</title>\n';
   stuff2+='<meta charset="utf-8"> \n';
   for (ii=0;ii<others.length;ii++) stuff2+=others[ii]+'\n';
// DEPRECATED (use jquery .show and .hide
//  stuff2+='  <script type="text/javascript" src="/wsurvey/publicLib/jquery-1.11.3.min.js"></script> \n';
//   stuff2+=' <script type="text/javascript">function toggleDisplay(aid){ $(\'#container\'+aid).toggle()}</script>\n ';
   stuff2+='</head><body>\n';

   if (nobuttons!==1) {
     stuff2+='<input type="button" value="&#9412;" title="expand all" onClick="$(\'.containers\').show()">';
      stuff2+='<input type="button" value="&#9412 &#9343; " title="expand levels 1 and 2" onClick="$(\'.containers_1,.containers_2\').show()">';
     stuff2+='<input type="button" value="&#127282;" title="collapse all" onClick="$(\'.containers\').hide()">';
     stuff2+='<br>\n';
   }

   stuff2+=stuff;
   stuff2+='\n</body</html>';

   displayStringInWindow(stuff2,0,0,atitle,winName,1);
    return 0;
}


//===============
// convert sequences of crlfs to a <br>
// http://stackoverflow.com/questions/2919337/jquery-convert-line-breaks-to-br-nl2br-equivalent
function nl2br(str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}




//===============
// convert number to numeric string using k,m,etc postfix
// converts to integer
// min value of mLen=4
// maximum length is 6 "digits" (8 characers if - and 'k' ). ie  512,245,661 == 512.246m  (516,231 would be 516321 if mlen>=6)
// mlen is total length. # digits is 1 less (for postfix), and one less again if neg number
// maxd is maximum decimal places. Min of 0, max of 3
  function integerK(aval,mLen,maxd) {
    var isneg='' ;
    if (arguments.length<2 || isNaN(mLen) ||  mLen<4) mLen=4;
    if (arguments.length<3 || isNaN(maxd) || maxd=='' ) maxd=2;
    maxd=Math.min(Math.max(0,maxd),3);
    if (isNaN(aval))   return aval ;  // do nothing if not a number

    aval=parseInt(aval);           // convert to integer
    if (aval==0) return 0   ; // special case

    if (aval<0) {
        isneg='-';
        mLen--;
    }
    aval=Math.abs(aval);

    if (aval<1000) return  isneg+parseInt(aval).toFixed(0)  ;  // mLen never less than 4

    mLen=Math.abs(parseInt(mLen));
    mLen--;           // number of actual digits (including . point) available (lost one to 'x', and possibly one to '-'


// simple cases
    if (aval<1000) return  isneg+aval.toFixed(0)  ;  // mlen never less than 4
    if (mLen>4 && aval<10000) return isneg+aval.toFixed(0);
    if (mLen>5 && aval<100000) return isneg+aval.toFixed(0);
    if (mLen>6 && aval<1000000) return isneg+aval.toFixed(0);

   let postChar=['','k','m','g','t','p','e','z','y','!','!' ];   // give up after yottabyte ( 10^24)
   let mgroup=0;
    for (var mm=0;mm<1;mm) {
       aval=aval/1000;
       mgroup++;
       if (aval<1000) break;
    }
    if (mgroup>8) mgroup=9 ; // give up after yottabyte
    let dachar=postChar[mgroup];

    if (mLen==2)   {
       if (aval<100) return isneg+aval.toFixed(0)+dachar;    //   1.123 (k or m or ...) == 1x,  23.513 == 23x
       aval=aval/1000;
       dachar=postChar[mgroup+1];
       return isneg+aval.toFixed(1).substr(1)+dachar;        // 631.66  ==  .6 xx (xx =m if x =k )  -- not maxd is ignored
    }
    if (mLen==3)   {
       if (aval<10) return isneg+aval.toFixed(Math.min(1,maxd))+dachar;    //   1.123 (k or m or ...) == 1.2x,
       return isneg+aval.toFixed(0)+dachar;        // 631.66  ==  631x , 72.661 == 72x
    }
    if (mLen==4)   {
       if (aval<10) return isneg+aval.toFixed(Math.min(2,maxd))+dachar;    //   1.123 (k or m or ...) == 1.12x,
       if (aval<100) return isneg+aval.toFixed(Math.min(1,maxd))+dachar;    //   21.323 (k or m or ...) == 21.3x,
       return isneg+aval.toFixed(0)+dachar;        // 631.66  ==  631x
    }
    if (mLen==5)   {
       if (aval<10) return isneg+aval.toFixed(Math.min(3,maxd))+dachar;    //   1.123 (k or m or ...) == 1.123x,
       if (aval<100) {
           return isneg+aval.toFixed(Math.min(2,maxd))+dachar;    //   21.323 (k or m or ...) == 21.32x,
       }
       return isneg+aval.toFixed(Math.min(1,maxd))+dachar;        // 631.66  ==  631.6x
    }
// over 6, return xxx.ddd
    return isneg+aval.toFixed(Math.min(3,maxd))+dachar;    //   1.123 (k or m or ...) == 1.123x,
  }

///==================== mlen
// check a string containing html for tag errors (unclosed tags)/
//  <x /> tags are okay
//  Returns number of errors found (0 if no errors)
//   text: string containing html marckup
//   ignore : string; space delimited list of "unclosed" tags to ignore (i.e.; 'br p input option'). If not specified 'br p input option li' is used
// useage:   numErrs=$.checkTags(stringOfHtml,okayTags);

 $.checkTags=function(text,ignore){               // space delimited list of tags to ignore (they do not require closure)

  var ignores=[];
   var tags = [];
   var i=0;
   var j=0;
   var k=0;
   var tag='';
   var level=0;
 if (arguments.length<2) ignore='p br input option li  hr  '     ;
 ignore=jQuery.trim(ignore);
 ignore=(' '+ignore+' ').toUpperCase();

  i = text.indexOf('<');
  while (i>=0) {
        j = text.indexOf('>', i);
        if (j == -1) break;

        if (text.substr(j-1,1)=='/') {     // self closer are okay
                i = text.indexOf('<',j);
                continue ;
        }

        k = text.indexOf(' ',i);
        if (k > i && k < j) {
            tag = text.substr(i+1,k-i-1);
        } else {
            tag = text.substr(i+1,j-i-1);
        }


        if (tag.indexOf('/') == 0) {          // found </
            tag = tag.substr(1);
            var ttt=' '+tag.toUpperCase()+' ';
            if (ignore.indexOf(ttt)>-1)  {
                i = text.indexOf('<',j);
                continue ;
           }

            tag=tag+' '+level;
            if (tags[tag] == undefined) {
                tags[tag] = -1;
            } else {
                tags[tag]--;
            }
            level--;
        } else {
            var ttt=' '+tag.toUpperCase()+' ';
            if (ignore.indexOf(ttt)>-1)  {
                i = text.indexOf('<',j);
                continue ;
           }

            level++;
            tag=tag+' '+level;
            if (tags[tag] == undefined) {
                tags[tag] = 1;
            } else {
                tags[tag]++;
            }
        }
        i = text.indexOf('<',j);
    }
    // Everything should be zero
    var nprobs=0;
    for (tag in tags) {
        if (tags[tag] != 0) {
          nprobs++ ;
//           console.log(tag + ' ERR ' + tags[tag]);
        } else {
//            console.log(tag + ' ok ' + tags[tag]);
       }
    }

    return nprobs;
};


//===========================
// echo a string back as a file, using a POST. Works with the echoFileBack.php
// The string can be text or a a binary file (such as an image);
// returns true
//  arguments:
//      contents : contents of the file.
//      target : target of window to display response in. If not specified, _self is used (i.e.; in current window)
//      type : the content type to use in the response. If not specified, pplication/octet-stream is used
//      filename : optional. If specified, a content-disposition with this name is used (so that the browser presents a save file to disk option rather
//                 than displaying content in target

function echoFileBack(contents,atarget,atype,afilename) {
  var pp,ff,qq;
  var flen2,postProblem,flen;

   if (arguments.length<2) atarget="_self"   ;
   if (arguments.length<3) atype='application/octet-stream';
   if (arguments.length<4) afilename='';
   pp='<form action="/wsurvey/phpLib/echoFileBack.php" method="post" target="'+atarget+'" >';
   pp+='  <input type="hidden" name="filename" value="'+afilename+'"> ';
   pp+='  <input type="hidden" name="type" value="'+atype+'">';
   acontent=$.base64('encode',contents);          // use binary safe version
 //  alert('size of acontent: '+acontent.length+', type='+atype+', fielname='+afilename);
//   acontent=Base64.encode(contents);

  if (typeof(post_max_size)!=='undefined' && typeof(upload_max_filesize)!=='undefined')   { // check for limits, if availabe
     flen=acontent.length; flen2=flen*1.05 ;  // 5% just in case
     if (flen2> post_max_size || flen2>upload_max_filesize)  {
        postProblem='File upload requires about '+addComma(flen2.toFixed())+' bytes; but  post_max_size='+addComma(post_max_size)+') and upload_max_filesize='+addComma(upload_max_filesize);
        postProblem+='\nAre you sure you want to try (it may fail)?\n If not, you can change these limits in the php.ini file? ';
        q=confirm(postProblem);
        if (!q) return 0;
     }
   }
   pp+=' <input type="hidden" name="contents" value="'+acontent+'"> ';
   ff=$(pp);
   $('body').append(ff);
    ff.submit()   ;
    ff.remove();

   return 1;
}



//=======================
// remove attributes from elements in q1 jquery object
// whitelist: array of attribute names to NOT remove (case insensitive)
// blacklist: array of arrays 2nd check: if an attribute has a value in the blacklist, remove it.
//             each array should have the syntax [attributeName,val1,val2,...];
//             the attributeName should be in the whitelist (since only attributes in the whitelist are subject to blacklist testing)
//             attributeName and val1,.. are case insensitive comparisons
//
// Example -- remove "dangerous" attributes from a html text string
// 
//  Note: see strip_active_tags for an alternative
//
// qq=$('body').find('*');
// removeMostAttributes(qq,['value','title','style','class','name','type'],[['type','submit']]);

function removeMostAttributes(q1,whitelist,blacklist) {

  var tatname,tavalue;
  var remlist,atname,atvalue;
  var exceptions=[];

  if (arguments.length<2) whitelist=[];
  if (arguments.length<3) blacklist=[];

  $.each(whitelist,function(ith,aval){whitelist[ith]=jQuery.trim(aval).toUpperCase() ;}) ;        // capitalize all elements

  $.each(blacklist,function(ith,aval){
      var ado=jQuery.trim(aval[0]).toUpperCase();
      exceptions[ado]={};
      $.each(aval,function(ii2,aval2) {
          if (ii2==0) return 1 ;     // slice instead? eh.
          var ado2=jQuery.trim(aval2).toUpperCase();
          exceptions[ado][ado2]=1;
      });
  }) ;        // capitalize all elements

   q1.each(function() {          // now remove attributes
    var e = $(this);
    remlist=[];
    $.each(this.attributes, function(attr, avalue){
      atname=avalue.name ;
      atvalue=avalue.value ;
      tatname=atname.toUpperCase();
      if($.inArray(tatname, whitelist) == -1)  {       // not in whitelist
             remlist.push(atname);
       } else {                         // check exceptions
             if (exceptions[tatname]!==undefined) {
                tavalue=atvalue.toUpperCase() ;
                if (exceptions[tatname][tavalue]!==undefined)  remlist.push(atname);
             }      // exceptions check
       }        // whitelist check
    });         // this.attributes each

    for (var irem=0;irem<remlist.length;irem++) e.removeAttr(remlist[irem]);   
  });         // q1 each

} ;



//===========================
//http://stackoverflow.com/questions/948172/password-strength-meter
// note:   https://www.grc.com/haystack.htm is a useful test. It suggests that these results may not be quite right
// (they strongly advocate simple but long passwords (where simple can mean pdding with lots of repeated characrers, hence easy to remember)

 function scorePassword1(pass) {
    var score = 0;
    if (!pass)
        return score;

    // award every unique letter until 5 repetitions
    var letters = new Object();
    for (var i=0; i<pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    var variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    }

    variationCount = 0;
    for (var check in variations) {
        variationCount += (variations[check] == true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;
    return parseInt(score);
}


// Runs password through check and then updates GUI
function scorePassword2(strPassword, strFieldID) {
    // Check password
    var nScore = scorePassword1(strPassword);


     // Get controls
        var ctlBar = document.getElementById(strFieldID + "_bar");
        var ctlText = document.getElementById(strFieldID + "_text");
        if (!ctlBar || !ctlText)    {
           alert('scorePassword2: problem finding matching ids for `'+strFieldID+'` : _bar='+ctlBar+', _text='+ctlText);
            return 1;
        }

        // Set new width
        ctlBar.style.width = (nScore*1.25>100)?100:nScore*1.25 + "%";

    // Color and text
    // -- Very Secure
   if (nScore >= 90)       {
        var strText = "Very Secure";
        var strColor = "#0ca908";
    } else if (nScore >= 80)    {
        var strText = "Secure";
       vstrColor = "#7ff67c";
    }  else if (nScore >= 80)     {
        var strText = "Very Strong";
        var strColor = "#008000";
    }  else if (nScore >= 60)    {
        var strText = "Strong";
        var strColor = "#006000";
    } else if (nScore >= 40)   {
        var strText = "Average";
        var strColor = "#e3cb00";
    }    else if (nScore >= 20)    {
        var strText = "Weak";
        var strColor = "#Fe3d1a";
    }    else    {
        var strText = "Very Weak";
        var strColor = "#e71a1a";
    }

    if(strPassword.length == 0)     {
      ctlBar.style.backgroundColor = "";
      ctlText.innerHTML =  "";
    }else     {
      ctlBar.style.backgroundColor = strColor;
      ctlText.innerHTML =  strText;
    }
}

//=============
// front end to dump2 -- adds a header string
function dump2String(v,amess,ispre) {
   if (arguments.length<2) amess='Displaying array ';
   if (arguments.length<3) ispre=0;
   let aa=dump2(v,'none',0,amess);
   if (ispre==1) {
      aa='<div style="white-space:pre">'+aa+'</div>';
   }
   return aa;
}


//=============
// front end to dump -- adds a header string
function dump2(v, howDisplay, recursionLevel,amess) {
    howDisplay = (typeof howDisplay === 'undefined' || jQuery.trim(howDisplay)=='') ? "alert" : howDisplay;
    recursionLevel = (typeof recursionLevel !== 'number') ? 0 : recursionLevel;
    if (arguments.length<3) {
        amess='';
    } else {
       amess+=' \n';
    }
    var out=dump(v,'none',recursionLevel);
    out=amess+out;
    if (howDisplay == 'body') {
        var pre = document.createElement('pre');
        pre.innerHTML = out;
        document.body.appendChild(pre)
    }  else if (howDisplay == 'alert') {
        alert(out);
    }

    return out;

 }

//============================
/*   http://stackoverflow.com/questions/603987/what-is-the-javascript-equivalent-of-var-dump-or-print-r-in-php
 I wrote this JS function dump() to work like PHP's var_dump().
   To show the contents of the variable in an alert window: dump(variable)
   To show the contents of the variable in the web page: dump(variable, 'body')
   To just get a string of the variable: dump(variable, 'none')
dump() displays the contents of a variable like var_dump() does in PHP. dump() is
better than typeof, because it can distinguish between array, null and object.
Parameters:
  v:              The variable
  howDisplay:     "none", "body", "alert" (default)
  recursionLevel: Number of times the function has recursed when entering nested
                  objects or arrays. Each level of recursion adds extra space to the
                  output to indicate level. Set to 0 by default.
Return Value:
  A string of the variable's contents
Limitations:
  Can't pass an undefined variable to dump().
  dump() can't distinguish between int and float.
  dump() can't tell the original variable type of a member variable of an object.
  These limitations can't be fixed because these are *features* of JS.
*/
function dump(v, howDisplay, recursionLevel) {
    howDisplay = (typeof howDisplay === 'undefined') ? "alert" : howDisplay;
    recursionLevel = (typeof recursionLevel !== 'number') ? 0 : recursionLevel;


    var vType = typeof v;
    var out = vType;

    switch (vType) {
        case "number":
            /* there is absolutely no way in JS to distinguish 2 from 2.0
            so 'number' is the best that you can do. The following doesn't work:
            var er = /^[0-9]+$/;
            if (!isNaN(v) && v % 1 === 0 && er.test(3.0))
                out = 'int';*/
        case "boolean":
            out += ": " + v;
            break;
        case "string":
            out += "(" + v.length + '): "' + v + '"';
            break;
        case "object":
            //check if null
            if (v === null) {
                out = "null";

            }
            //If using jQuery: if ($.isArray(v))
            //If using IE: if (isArray(v))
            //this should work for all browsers according to the ECMAScript standard:
            else if (Object.prototype.toString.call(v) === '[object Array]') {
                out = 'array(' + v.length + '): {\n';
                for (var i = 0; i < v.length; i++) {
                    out += dump_repeatString('   ', recursionLevel) + "   [" + i + "]:  " +
                        dump(v[i], "none", recursionLevel + 1) + "\n";
                }
                out += dump_repeatString('   ', recursionLevel) + "}";
            }
            else { //if object
                sContents = "{\n";
                cnt = 0;
                for (var member in v) {
                    //No way to know the original data type of member, since JS
                    //always converts it to a string and no other way to parse objects.
                    sContents += dump_repeatString('   ', recursionLevel) + "   " + member +
                        ":  " + dump(v[member], "none", recursionLevel + 1) + "\n";
                    cnt++;
                }
                sContents += dump_repeatString('   ', recursionLevel) + "}";
                out += "(" + cnt + "): " + sContents;
            }
            break;
    }

    if (howDisplay == 'body') {
        var pre = document.createElement('pre');
        pre.innerHTML = out;
        document.body.appendChild(pre)
    }
    else if (howDisplay == 'alert') {
        alert(out);
    }

    return out;
}
/* dump_repeatString() returns a string which has been repeated a set number of times */
function dump_repeatString(str, num) {
    out = '';
    for (var i = 0; i < num; i++) {
        out += str;
    }
    return out;
}


//=== synnonym for dump2()
function do_dump(a,b,c,amess) {
   if (arguments.length<2) b='alert';
   if (arguments.length<3) c=5;
   if (arguments.length<4) amess='';
   var a=dump2(a,b,c,amess);
   return a;
}


//=========================
// strip out actiion tags (script, style, head) from html content.
// also remove attributes that are suspisions
// This complements the strip_html_activeTags php function (that removes "active" tags but leaves formatters like <b>)
// Note: seee removeMostAttributes for an alternative
// hco : string with html
//  careful: if specified and 1, removes less dangerous tags (base, applet,frame,iframe,layer,embed,eta)
//  removeCt: if specified and 1, returns [newText,# removals]. Otherwise, returns newText
// note: # of removals isn't perfect -- it does not count Head, body, html and some other tags (but not necessarily content) removed

function strip_active_tags(hco,careful,removeCt) {
  var found,q1,q1all,iq,spp;
  var nremoves=0;
  if (arguments.length<2) careful=0;
  if (arguments.length<3) removeCt=0;
  try {
      re=/<\s*body[^\>]*\>([\s\S]*?)<\s*\/body[^\>]*\>/im ;   // use \S\s instead of . (to included crlfs)
      found =hco.match(re);
      if (found!==null)  {
          hco=found[1];   // use inner portion of first <body>...</body>
      }

       q1=$('<div>');                          // now make sure it isn't invalid.
       q1.html(hco);                           // Note nov 2018: html(hco) seems to remove head and body tags

       nremoves+=strip_active_tags2('script');
       nremoves+=strip_active_tags2('style');
       nremoves+=strip_active_tags2('head');

       if (careful==1) {
         nremoves+=strip_active_tags2('base');
         nremoves+=strip_active_tags2('applet');
         nremoves+=strip_active_tags2('iframe');
         nremoves+=strip_active_tags2('html');
         nremoves+=strip_active_tags2('head');
         nremoves+=strip_active_tags2('body');
         nremoves+=strip_active_tags2('frame');
         nremoves+=strip_active_tags2('layer');
         nremoves+=strip_active_tags2('ilayer');
         nremoves+=strip_active_tags2('embed');
         nremoves+=strip_active_tags2('meta');
       }

       q1all=q1.find('*');
       // removeMostAttributes(qq,['id','value','title','style','class','name','type'],[['type','submit']]);
      removeMostAttributes(q1all,['id','value','title','name','href','type','style'],[['type','submit']]);  // get rid of sketchy attributes
       for (var iq=0;iq<q1all.length;iq++) {
            spp=$(q1all[iq]).css('position')  ;
           if (spp!=='undefined' && spp!=='static'  ) $(q1all[iq]).css('position','relative') ;     // get rid of fixed & absolute position
       }
       hco=unescapeHtml(q1.html());

  } catch(err) {           // if here, problem with hconent, so don't use it
       if (jQuery.trim(hco)!=='') {
           hco=htmlentities(hco);
          console.log('problem with strip_active_tags');
        }
  }

  if (removeCt==1) return [hco,nremoves];

  return hco     ;

 function  strip_active_tags2(datag) {
     var nq=q1.find(datag).length;
   
     if (nq>0) {
        q1.find(datag).remove();
     }
   return nq ;
 }

}

//===========
// check for okay html content of email
// uses $.checkTags and strip_active_tags
// Returns [status,safe Html]   or [status,safe html, nremoves]
// status=0 means some kind of html problem (such as unclosed markup); 1=ok
// if 0, return "tags stripped" version of atext    (all html removed)
// if 1, return "dangerous stuff version" of atext (retains basic html, remove script, style, and head sections)
// safe Html is the atext with most attiributes (such as onClick, etc) removed, and hazardous tags (such as <script>) removed.
// if dosafe is specified, and is 1, remove more attributes (such as meta, applet,.. that are outside of head )
// if dosafe is removeCt, and is 1, return count of removed tags

function makeHtmlSafe(atext,dosafe,removeCt) {
  if (arguments.length<2) dosafe=0
  var zz,use1;
   zz=$.checkTags(atext);
   if (zz>0) {                // problems found, just convert everything to text
       use1= $("<div/>").html(atext).text();   // convert to text
      return [0,use1];
   }
   use1=   strip_active_tags(atext,dosafe,removeCt);        // html is okay, so make it safe
   if (removeCt==1)   return [1,use1[0],use1[1]];
   return [1,use1];
}


//====================
// wrap wrap long lines in a div.
//  1 ) sets white-space: normal
//  2) Finds crlfs and converts to <br>
function wrapLongLines(aid) {
  var q1,astuff;
   q1=$('#'+aid);
   if (q1.length==0) {
       alert('error in wrapLongLines: no such id = '+aid);
       return 0;
   }
   q1.css('white-space','normal');
   astuff=q1.html();
   astuff=nl2br(astuff);
   q1.html(astuff);
   return 1;
}

// ::::::::::::::::::::::::::::::::::::  BEGIN BASE64 stuff :::::::::::::::::::::
// several base64 converters/
// The basic ones have problems -- either they work with utf-8 or binary, but not both. Crazy.
// Safest best is to encode use wsBase64_encode (it tries utf-8 save, and decocdes result. If problem detected, uses binary safe.


//===================
// general purpose base64 encoder
// handles both utf-8 and binary (but stupidly

function wsBase64_encode(astring) {
   var a1,a2,a1a,a2a;
   a1=$.base64('encode',astring);         // binary safe, but not utf-8 save
   a2=$.base64('decode',a1);
   if (a2==astring) return a1 ;
// else might of been utf-8, so try other methd
   a1a=Base64.encode(astring);           // utf-8 save, but not binary safe
   a2a=Base64.decode(a1a);
   if (a2a!==astring) {
      alert("Unable to base64 encode a string of length '+astring.length+' . Will use non-utf-8 save version ");
   }
   return a1a ;
}

//====================
// WARNING: these do not work reliably. So  this is not a hook to Base64 (below)
//
// utf8 safe base64 encode and decode (but not binary?)
//https://raw.githubusercontent.com/kvz/phpjs/master/functions/url/base64_encode.js
// discuss at: http://phpjs.org/functions/base64_decode/
function base64_encode(data) {
  return Base64.encode(data);
}
function base64_decode(data) {
  return Base64.decode(data) ;
}


//=============
//
//      http://stackoverflow.com/questions/3774622/how-to-base64-encode-inside-of-javascript
//  Base64 encode / decode
//  http://www.webtoolkit.info/
//
// usage:
//   encodedString=Base64.encode('some thing here');
//   decodedString=Base64.decode(encodedString);
//

var Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}

//============================

/*
CAUTION: these fail with unicode.
  If unicode (i.e.; a known string) Use Base64. instead; or ws wsBase64_encode

   Maybe there is a way to get these to work with unicode, but the authors seem to not be intersted in informing
   us how to do it.

 * jquery.base64.js 0.1 - https://github.com/yckart/jquery.base64.js
 * Makes Base64 en & -decoding simpler as it is.
 *
 * Based upon: https://gist.github.com/Yaffle/1284012
 *
 * Copyright (c) 2012 Yannick Albert (http://yckart.com)
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 * 2013/02/10

      enc.val($.base64.atob(this.value, true));
            // also possible:
            // dec.val( $.base64('decode', this.value) );
            // dec.val( $.base64.decode(this.value) );

            // note: you can pass a third parameter to use the utf8 en- / decode option
      enc.val($.base64.atob(this.value, true));
            // also possible:
            // dec.val( $.base64('decode', this.value) );
            // dec.val( $.base64.decode(this.value) );
      or decode

Or: endVal=$.base64('decode',astring) (or 'encode' instead of 'decode')

**/

;(function($) {

    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        a256 = '',
        r64 = [256],
        r256 = [256],
        i = 0;

    var UTF8 = {

        /**
         * Encode multi-byte Unicode string into utf-8 multiple single-byte characters
         * (BMP / basic multilingual plane only)
         *
         * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
         *
         * @param {String} strUni Unicode string to be encoded as UTF-8
         * @returns {String} encoded string
         */
        encode: function(strUni) {
            // use regular expressions & String.replace callback function for better efficiency
            // than procedural approaches
            var strUtf = strUni.replace(/[\u0080-\u07ff]/g, // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
            function(c) {
                var cc = c.charCodeAt(0);
                return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
            })
            .replace(/[\u0800-\uffff]/g, // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
            function(c) {
                var cc = c.charCodeAt(0);
                return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
            });
            return strUtf;
        },

        /**
         * Decode utf-8 encoded string back into multi-byte Unicode characters
         *
         * @param {String} strUtf UTF-8 string to be decoded back to Unicode
         * @returns {String} decoded string
         */
        decode: function(strUtf) {
            // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
            var strUni = strUtf.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, // 3-byte chars
            function(c) { // (note parentheses for precence)
                var cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f);
                return String.fromCharCode(cc);
            })
            .replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, // 2-byte chars
            function(c) { // (note parentheses for precence)
                var cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
                return String.fromCharCode(cc);
            });
            return strUni;
        }
    };

    while(i < 256) {
        var c = String.fromCharCode(i);
        a256 += c;
        r256[i] = i;
        r64[i] = b64.indexOf(c);
        ++i;
    }

    function code(s, discard, alpha, beta, w1, w2) {
        s = String(s);
        var buffer = 0,
            i = 0,
            length = s.length,
            result = '',
            bitsInBuffer = 0;

        while(i < length) {
            var c = s.charCodeAt(i);
            c = c < 256 ? alpha[c] : -1;

            buffer = (buffer << w1) + c;
            bitsInBuffer += w1;

            while(bitsInBuffer >= w2) {
                bitsInBuffer -= w2;
                var tmp = buffer >> bitsInBuffer;
                result += beta.charAt(tmp);
                buffer ^= tmp << bitsInBuffer;
            }
            ++i;
        }
        if(!discard && bitsInBuffer > 0) result += beta.charAt(buffer << (w2 - bitsInBuffer));
        return result;
    }

    var Plugin = $.base64 = function(dir, input, encode) {
            return input ? Plugin[dir](input, encode) : dir ? null : this;
        };

    Plugin.btoa = Plugin.encode = function(plain, utf8encode) {
        plain = Plugin.raw === false || Plugin.utf8encode || utf8encode ? UTF8.encode(plain) : plain;
        plain = code(plain, false, r256, b64, 8, 6);
        return plain + '===='.slice((plain.length % 4) || 4);
    };

    Plugin.atob = Plugin.decode = function(coded, utf8decode) {
        coded = String(coded).split('=');
        var i = coded.length;
        do {--i;
            coded[i] = code(coded[i], true, r64, a256, 6, 8);
        } while (i > 0);
        coded = coded.join('');
        return Plugin.raw === false || Plugin.utf8decode || utf8decode ? UTF8.decode(coded) : coded;
    };
}(jQuery));

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: end of base64 stuff



function dechex(anumber) {
  //  discuss at: http://phpjs.org/functions/dechex/
  // original by: Philippe Baumann
  // bugfixed by: Onno Marsman
  // improved by: http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
  //    input by: pilus
  //   example 1: dechex(10);
  //   returns 1: 'a'
  //   example 2: dechex(47);
  //   returns 2: '2f'
  //   example 3: dechex(-1415723993);
  //   returns 3: 'ab9dc427'

   if (anumber < 0) {
    anumber = 0xFFFFFFFF + anumber + 1;
  }
  return parseInt(anumber, 10).toString(16);
}

 function utf8_encode (argString) {
    // Encodes an ISO-8859-1 string to UTF-8
    //
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/utf8_encode    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: sowberry
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman    // +   improved by: Yves Sucaet
    // +   bugfixed by: Onno Marsman
    // +   bugfixed by: Ulrich
    // +   bugfixed by: Rafal Kukawski
    // *     example 1: utf8_encode('Kevin van Zonneveld');    // *     returns 1: 'Kevin van Zonneveld'
    if (argString === null || typeof argString === "undefined") {
        return "";
    }
    var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    var utftext = "", start, end, stringl = 0;

    start = end = 0;    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;
         if (c1 < 128) {
            end++;
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
        } else {            enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.slice(start, end);            }
            utftext += enc;
            start = end = n + 1;
        }
    }
    if (end > start) {
        utftext += string.slice(start, stringl);
    }
     return utftext;
}


//http://stackoverflow.com/questions/7695450/how-to-program-hex2bin-in-javascript
function hex2bin(hex){
    var bytes = [], str;

    for(var i=0; i< hex.length-1; i+=2)
        bytes.push(parseInt(hex.substr(i, 2), 16));

    return String.fromCharCode.apply(String, bytes);
}

function bin2hex(s) {
  //  discuss at: http://phpjs.org/functions/bin2hex/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Onno Marsman
  // bugfixed by: Linuxworld
  // improved by: ntoniazzi (http://phpjs.org/functions/bin2hex:361#comment_177616)
  //   example 1: bin2hex('Kev');
  //   returns 1: '4b6576'
  //   example 2: bin2hex(String.fromCharCode(0x00));
  //   returns 2: '00'

  var i, l, o = '',
    n;

  s += '';

  for (i = 0, l = s.length; i < l; i++) {
    n = s.charCodeAt(i)
      .toString(16);
    o += n.length < 2 ? '0' + n : n;
  }

  return o;
}

//===============
// ws open ended multi depth object (or array) to flat array.
// recurses through array or object, converting each element in an array
// Each row of the output array consists of a two element array   -- with each element in base64
//   [0] csv list of element names
//   [1] the value (either a string or a number)
//  For example a[0]['help']['size']='515'; would return an element in the array of: ['0,help,size','515']
//  Note: see below for an exception (the array may only be one element)
//
// Actually: the '0,help,size' string would be in base64, as would the '515'
//
// The resulting array can be .join(seperator) for safe transmission (say, via ajax) and later reconstruction
//
//  aval: the array or object to conver
//  fieldlist and buildon : not used in origian call -- used internally!
//
// Notes:
// *   if this is called with a number or string (not an array or object), ['',aval] (both in base64) is returned
//     (the '' signals not an array or object, hence no field name
// *  If aval is an empty object, ['ind1,inde'] is returnend (that is, a 1 element array signifiefs value is an empty object)

function ws_object_toArray64(aval,fieldlist,buildon) {

  var afield,bval,tval,af,f2,iff,p0,p1;

  if (arguments.length<3) buildon=[] ;
  if (arguments.length<2) fieldlist=[] ;

  if (typeof(aval)=='number' || typeof(aval)=='string') {            // special case. Should ONLY happen if original call is not an array or object
       af='' ;                // '' signifies "no field-- number or string .
       bval=aval;
       if (fieldlist.length>0) af=fieldlist.join(',')+','+af;       // should not happen, but wtf
       if (typeof(bval)=='number') bval=jQuery.trim(bval);  // convert to string
       p0=Base64.encode(af);
       p1=Base64.encode(bval);
       a1=[p0,p1];
       buildon.push(a1);
       return buildon ;
  }
 if (typeof(aval)=='object' && jQuery.isEmptyObject(aval)) {      // an empty object
       if (fieldlist.length==0) {
           af='';
       } else {
         af=fieldlist.join(',') ;
       }
        p0=Base64.encode(af);
        a1=[p0];             // one element array signfies value is empty object
        buildon.push(a1);
        return buildon ;
  }
 if (typeof(aval)=='array' && aval.length==0) {      // an empty  array
       if (fieldlist.length ==0) {
           af='';
       } else  {
         af=fieldlist.join(',') ;
       }
        p0=Base64.encode(af);
        a1=[p0];             // one element array signfies value is empty object
        buildon.push(a1);
        return buildon ;
  }


  for (afield in aval)  {
      bval=aval[afield];
      tval=typeof(bval);
      if (tval=='array' || tval=='object') {
            f2=[];
            for (iff=0;iff<fieldlist.length;iff++) f2[iff]=fieldlist[iff];   // send a copy
            f2.push(afield);
            buildon=ws_object_toArray64(bval,f2,buildon);
      } else {
         af=afield ;
         if (fieldlist.length>0) af=fieldlist.join(',')+','+af;
         if (typeof(bval)=='number') bval=jQuery.trim(bval);  // convert to string
         p0=Base64.encode(af);
         p1=Base64.encode(bval);
         a1=[p0,p1];
         buildon.push(a1);
      }
  }
  return buildon ;
}

//======================
// update fields in an vals object, using fields in newVals object
//       When examining newVals:
//            Case insensitive (and space trimmed) matching is used -- so fooBar in vals matches FOOBAR in newVals
//            A field name in newVals that does NOT exist (using a case insensitive match) in vals is ignored
//            You can choose to ignore fields in newVals whose type does not match the type in vals
//       Returns the updated vals object
//
//   Arguments:
//       vals : object with values.  This sets the "default values" of the updatable fields
//       newVals: object with values that will be used to reset values in vals (if a match occurs
//       checkType: optional. If 1, then  a match in newVals to vals only occurs if the type of the value is the same
//       okFields : optional. If specified, shouuld be an array (or csv) of fieldnames in vals that can be updated.
//                   Thus, if okFields is specified; if newVals has a field that matches a field in vals, it ALSO much match a field specified in okFields.
//                   If it does not match a field specified in okFields, updating does not occur (the value in vals is unchanged)
//      synonyms: optional.   If specified, should be an associative array.  Each field is an alternate name, whose value should be a field in vals
//                Thus: if a newVals field matches a field (case insensitive), it is converted into the value of the field.
//                Example synonynms='FieldA':'field1','fieldB':'field2','field':'field1'};
//                   A newValues field of fieldA, field1, or field will set the value of the vals['field'] (the "field" is case insensitive)


function updateOptionsObject(vals,newVals,checkType,okFields,synonyms){
  var okLookup={},doLookup=0,checkT=0,tt,itt,att,vaf,af,taf,doSynonyms=0;
  var valsLookup={};
  var tasyn,synLookup={},asyn;

  if (arguments.length<3) checkType='0';
  if (jQuery.trim(checkType)=='1') checkT=1;

  if (arguments.length>3) {
     if (typeof(okFields)=='string'  && jQuery.trim(okFields)!=='' )  {
       doLookup=1;
       tt=okFields.split(',');;
    }
    if (jQuery.isArray(okFields) && okFields.length>0) {
        tt=okFields;
        doLookup=1;
    }
    if (doLookup==1) {
        for (itt=0;itt<tt.length;itt++) {
            att=jQuery.trim(tt[itt]).toUpperCase();
            okLookup[att]=1;
        }
     }
  }

//  synonyms:
  if (arguments.length>4) {
     doSynonyms=1;
     for (asyn in synonyms ) {
        tasyn=jQuery.trim(asyn).toUpperCase();
        synLookup[tasyn]=jQuery.trim(synonyms[asyn]).toUpperCase();
     }
  }


// find fieldnames in vals
   for (af in vals) {
      taf=jQuery.trim(af).toUpperCase();
      valsLookup[taf]=af;           // note: if multiple matches (i.e.; 'fooBar' and 'foobar'), last match is what is updated
   }

//

// now do the updating by examinig fields in newVals
  for (af in newVals) {
     taf=jQuery.trim(af).toUpperCase() ;
     if (doSynonyms==1) {              // synonymn convert?
        if (typeof(synLookup[taf])!=='undefined') taf=synLookup[taf];
     }
     if (typeof(valsLookup[taf])=='undefined') continue ;   //  no match in vals
     if (doLookup==1)  {
        if (typeof(okLookup[taf])=='undefined') continue  ;  // no match in okfields
     }
     vaf=valsLookup[taf];
     if (checkT==1) {
        if (typeof(vals[vaf])!==typeof(newVals[af]) ) continue  ; // type mismatch
     }
     vals[vaf]=newVals[af];                         // use this new value!
  }

  return vals;
}




//===================
// show (block level) elements with a css rule -- check that this rule exists in the global style sheet)
function classShow(selectorText) {
  var n,theRules;
  selectorText=jQuery.trim(selectorText);
  if (selectorText.substr(0,1)!=='.') selectorText='.'+selectorText ;

    theRules = new Array();
    if (document.styleSheets[0].cssRules) {
        theRules = document.styleSheets[0].cssRules;
    }
    else if (document.styleSheets[0].rules) {
        theRules = document.styleSheets[0].rules;
    }
    for (n=0;n<theRules.length;n++)    {
        if (theRules[n].selectorText == selectorText)   {
            theRules[n].style.display = 'block';
        }
    }
}



//=======================
// looks in all active style sheets for a .class definition equaling aclass0
// For exmaple, if  .myclass {stuff } exists
// then cssClassExists('myclass') returns true.
// Obviously, if no such class found, return false

function cssClassExists(aclass0) {
      var zoo,sx,cs,sheetclasses;

        var hasstyle = false;
        var fullstylesheets = document.styleSheets;
        var aclass='.'+aclass0;

        for (var sx = 0; sx < fullstylesheets.length; sx++) {
          try {
            sheetclasses = fullstylesheets[sx].rules || document.styleSheets[sx].cssRules;
          }
          catch(err) {
              console.log('problem looking for '+aclass0+' in  cssClassExists: '+err.message);
              return false;
          }
           for (var cx = 0; cx < sheetclasses.length; cx++) {
                try1=sheetclasses[cx].selectorText ;
                if (try1 == aclass) {
                    hasstyle = true; ;
                    break ;
                }
            }
        }
        return hasstyle;
    };

//===================================
// add a style sheet to the head with a class of cid; or add   rule to an existing sytles
// cid: id of a stylesheet to add. If '', no id. cid is used if you want to make multiple calls to addCssRule, and add to the same stylesheet
// rules: optional. If specified, should be an object, each field being an object.
//        Each top level object's field name is used as a .class type of css rule
//        The value of each top level object should be objects with fields being css attributes
//        Example:   {'boldRed':{'color':'red','font-weight':600},
//                    'emGreen':{'font-style':'oblique','color':'green'}
//                   }
//  Example:
//        addCssRule('foo1',{'boldRed':{'color':'red','font-weight':600},
//                    '       emGreen':{'font-style':'oblique','color':'green'}
//    would be the same as specifying:
//   <style id="foo1" type="text/css">
//     .boldRed {color:red, font-weight:600 }
//     .emGreen {font-style:oblique; color:green}
//   </style>

//   $('#cid').append(".redbold{ color:#f00; font-weight:bold;}")
function addCssRule(cid,rules) {
 var acid , ij,v1,v2,aopt1;
 var q,cssrules,cidt;
 var arule,rstrings,daname,aopt,addme ;

 if (cid instanceof jQuery)    {       // this shoudl be a  jquery object pointing to a <style> sheet
    cssrules=cid;
 } else  {                      // a string to use as the id .. might have to create a <style> element if no  matching element
   cidt=jQuery.trim(cid);
   if (cidt!=='') {
     quse=$('#'+cidt);
     if (quse.length<1) {    // doesn't exist, create
        cssrules =  $('<style id="'+cidt+'" type="text/css"> </style>').appendTo("head");
     } else {
        cssrules=quse;
     }

   } else {         // create "anonymous" stylesheet
         cssrules =  $("<style   type='text/css'> </style>").appendTo("head");
   }
 }                // jquery object first argument?

 if (arguments.length<2) return 1;                // nothing to add (just creating the style sheet

for (dname in rules) {
   arule=rules[dname];
   rstrings=[] ;
   for (aopt in arule ) {
        aopt1=aopt;
        if (aopt.substr(aopt.length-1,1)==':') aopt1=aopt.substr(0,aopt.length-1);
        rstrings.push(aopt1+':'+arule[aopt]);
  }
  if (dname.substr(0,1)!=='#') dname='.'+dname ;   // allow for complex rules: i.e.; #foobar .rule1 { .... }
  addme=dname+' {'+rstrings.join(';')+' } \n ' ;
  cssrules.append(addme);
}                                           // for each defined rule
return 1
}

// ==========
// return value of array element. If not defined, return derfault
// vlist is an array. First element is the array. 2nd ... are strings containing indices in the array
// so vlist=[myarray,'person','cat'] looks for myarran['person']['cat']. If any level (myarray, myarray['person'], or myarray['cat'] is missing, return defval
// if adef not specified, what element in vlist is missing (by index into vlist, so if myarray exists but myarray['person'] does not exist, returns a 1.
//       IF all good, returns -1
// if adef is specified, and the element does not exist, return adef
function missValArray(vlist,adef ) {
  var dotest,vv,vcheck,atype,aind;
   dotest=0;

   if (arguments.length<2) dotest=1;
   if (typeof(vlist)!='object') {
      alert('Error in missValArray. First argument to function is not an array ('+typeof(vlist)+')');
      return -2;
   }
   vv=vlist[0];
   if (typeof(vv)!='object') {
      alert('Error in missValArray. First index (in first argument) is not an array ('+typeof(vv)+')');
      return -2;
   }

   vcheck=vv;
   for (iv=1;iv<vlist.length;iv++) {
     aind=vlist[iv];
     atype=typeof(vcheck[aind]);
     if (atype=='undefined')  {
        if (dotest==1) return iv ;
        return adef ;
     }
     vcheck=vcheck[aind];
   }
 
   return vcheck ;  // element exists!

}


//====================
// change max-height of a containter 
// note: a max-height or min-height overrides this (that is: you can't make it bigger or smaller than a max-height or min-height,
//       even if these are specified in css styles (rather than inline)
//  container:  container to change. A sting containing  selector. For example: '#myMenu1'. Be exact: so include the '#'
//              If more than one match, change first only
//  dchange: % change. - means "shrink by this pct".  So  expandContainerHeight('#myBox',10) means "expands the height of id="myBox" container '#xx" by 10%
//            Special case: '=nn' means "change to this size'.  'nn' can be pixels, or 'nn%' or 'nnem' or 'nnpx'. If just 'nn', 'nnpx' is assumed.
//            If not specified or '', '10' (10% increase) is used
//  statusVar : optional. If specified, a variable name. Status results will be saved to $(document).data(statusVar). So be sure it doesn't overwrite anything important!
//                Otherwise,  status messages are displayed using writeStatusMessage
// maxmin is optional. If specified, as csv of "minpixel,maxpixel". The height will be constrained within these bounds.
//       If not specified, or if one of the terms is not a number, the defaults of min=90px and max=500px are used
//
//  Altenative: if aid is a event (say, due to an onclick handler, the element should contain 'where="aid" change="npct" maxMin="amin,amax" statusVar="varname"
//              Only the "where" is required.
//  Alternative:  if an inline call, it might be easier to specify these attributes and call as changeContainerHeight(this)
//
// Note: if container is currently hidden, it will be made visible for a moment (jquery doesn't work well with hidden elements)
// Note: if specification error, error written using alert (statusVar is not used)

function changeContainerHeight(aid,dchange,maxMin,noError,statusVar) {

 var e1,mh,idiff,newmh,goo,tmp,eaid,tmp2,dothis=0,changeId='',dchange;
 var eChange,currentH,nowHeight,reHide,maxHeight,minHeight,statusVar,sayMess,nuHeight ;
 var jmax=500,jmin=50,gotErr=0 ;
 var statusMess=[];

 if (typeof(aid)=='object') {
     changeId='' ; maxMin=''; dchange=10 ;  statusVar="";    // assume no attributes
     if (typeof(aid.currentTarget)=='object') {        // on click event caller?
        eaid=$(aid.currentTarget);
     } else {                          // a "this"
        eaid=$(aid);
     }
     if (eaid[0].hasAttribute('maxMin')) maxMin=eaid.attr('maxMin');
     if (eaid[0].hasAttribute('change')) dchange=eaid.attr('change');
     if (eaid[0].hasAttribute('where'))  changeId=eaid.attr('where');
     if (eaid[0].hasAttribute('statusVar'))  statusVar=eaid.attr('statusVar');
  }  else {           // argument list (not  this or  evt)
      if (arguments.length<4) statusVar='' ;     // default is to display
      if (arguments.length<3) maxMin='';     // use default
      if (arguments.length<2) dchange=10;   // 10% increase by default
      if (arguments.length>0) changeId=aid  ;     // if no arguments, '' is the default
  }

  changeId=jQuery.trim(changeId);
  if (changeId=='') {
    alert('changeContainerHeight error: no target element specified') ;
    return 0;
  }
  eChange=$(changeId);
  if (eChange.length==0) {
    alert('changeContainerHeight error: no element matches: '+changeId);
    return 0;
  }
  if (eChange.length>1) eChange=$(eChange[0]);   // just the first if multiple matches

  if (!eChange.is(':visible')) {
     reHide=1;
     eChange.show();
  }

// check for min-height and max-height css specs
  maxHeight=jQuery.trim(eChange.css('max-height'));
  if (maxHeight=='0px' || maxHeight=='none' || parseInt(maxHeight)==0) maxHeight=10000000000;  // unlimited;

  minHeight=eChange.css('min-height');
  if (minHeight=='0px' || minHeight=='none' || parseInt(minHeight)==0) minHeight=0;  // unlimited;

  if (typeof(maxMin)=='string' && maxMin!='')  {      // override default max and min ('min,max')
     tmp=maxMin.split(',');
     if (!isNaN(maxMin[0])) jmin=parseInt(tmp[0]);
     if (tmp.length>1 && !isNaN(maxMin[1])) jmax=parseInt(tmp[1]);
  }

  tmp2=jQuery.trim(dchange);        // is this an "absolute" height?
  if (tmp2.substr(0,1)=='=') {
     nuHeight=jQuery.trim(tmp2.substr(1));    // assume proper syntax  -- such as '250' or '250px' or '30em' or '20%'. Thus, do NOT make it a number
     dothis=1;
  }  else {                       // not absolute:   this is a "% change"
     dchange=parseFloat(dchange);   // so make it a number
  }

  currentH=eChange.height();       // use this for % change. Also, may have to reset to this
  gotErr=0;

  if (dothis==1) {          // absolute value specifed

     eChange.height(nuHeight);      // absolute size set..

     nowHeight=eChange.height();         // check if too big or small
     if (nowHeight<jmin || nowHeight>jmax) {             // note change first then check --- too hard to figure "compare to pixel height" when change can be em or %
        statusMess.push('Unable to change height: selected height ('+nuHeight+') is outside of '+jmin+'px to '+jmax+'px range');
        gotErr=1;
        eChange.height(currentH);      // reset to prior height

     } else {                        // permissible change. Did it work?
        if (Math.abs(nowHeight-nuHeight)>4 )   {         // noticeable differnce between requested and actual?  see if maxHeight and minHeight are issues
           if (dchange<minHeight || dchange>maxHeight) {
               statusMess.push('Requested height ('+nuHeight+') !=  new height ('+nowHeight.toFixed()+').  Height must be within min-height and max-height range ('+minHeight+'px to '+maxHeight+'px)');
           } else {                 // large change, but not because of min or max height. Who knows why
               statusMess.push('Requested height ('+nuHeight+') !=  new height ('+nowHeight.toFixed()+'). ');
           }
           gotErr=1 ;
        } else {         // worked!
            statusMess.push('New height= '+nowHeight.toFixed()+'px');
        }
     }

  } else {                 // change by this %

     idiff=(dchange*0.01*currentH);     // dchange is %change (+ or -)
     newmh=currentH+idiff;  newmh=newmh.toFixed();
     if (newmh>=jmin && newmh<=jmax) {        // % change, so check now (before changing)
          eChange.height(newmh);
          nowHeight=eChange.height();         // check if too big or small
      } else {
           gotErr=1;
           statusMess.push('Unable to change height: height (after '+dchange+'% change) is outside of '+jmin+'px to '+jmax+'px range' );
     }
     if (gotErr==0)   {            // no error yet, but perhaps failure?
       if (Math.abs(nowHeight-newmh)>4 )   {         // noticeable differnce between requested and actual?  see if maxHeight and minHeight are issues
           if (newmh<minHeight || newmh>maxHeight) {
               gotErr=1;
               statusMess.push('Requested height ('+newmh+') !=  new height ('+nowHeight.toFixed()+').  Height must be within min-height and max-height range ('+minHeight+'px to '+maxHeight+'px)');
           } else {                 // large change, but not because of min or max height. Who knows why
              gotErr=1;
               statusMess.push('Requested height ('+newmh+') !=  new height ('+nowHeight.toFixed()+'). ');
           }
       }  else {     //  no noticeable differnce between actual and requested
         statusMess.push('New height= '+nowHeight.toFixed()+'px');
       }
    }                                 // if error, no need to check

  }                                      // dothis

  if (reHide==1) echange.hide();        // since we might of made it temporarily visible ...

  sayMess=statusMess.join('\n');
  if (statusVar!='') {
    $(document).data(statusVar,sayMess);
  } else {
     if (gotErr==1) {
        writeStatusMessage(sayMess,14000,2,1)  ;  // error: linger in visible box
     } else {
        writeStatusMessage('',-1,0,1)  ;  //  clear "error" message
        writeStatusMessage(sayMess,2000,0,2)  ;  // okay, quick message flash
     }
  }
  return 1;

}


//=======================
// reize container height so there is no vert scroll bar.
//  aid: string pointing to element. Should contain # or . or whatever. If > 1 match, just resize first. Or, can be a jQuery object.
// atype: height or width. Default is height
//  addPx: size to increment by. Smaller sizes give more accurate final size, but take longer. In pixels. Default is 10
//  maxMin: csv of maximum and minimum sizes.  If not specified; '1200,25' is used. If just one number, it is used as the max, with min=25
//          If max<min, assume wrong order (swith them!);
//  status : name of variable to write status info (start and final size) to (saved in $(document).data(statusVar);
//           Several messages are written to status. Each is seperated by a '\n'
//
// returns [startHeignt,endHeight]. Or a string error message

function resize_noScroll(aid,atype,addPx,maxMin,statusVar ) {

   var  ej='',aa,maxPx=1200,minPx=25;
   var  maxPx0=1200,minPx0=25;       // vvvPx0 are used if values <=0 are provided. Typically same as non xxxPx variables
   var  addPx0=10;                  // addPx0 are used if addPx is not specified (the default)
   var maxSteps=1000;               // maximum # of steps. If large, might take a long time if addPx is small
   var mess=[],amess,nCOL=1;
   var ntries=0,gotScroll,huse,bscroll,ij,ej0,aa,iSize,qdone,tmp1  ;

   if (arguments.length<1) return 'resize_noScroll: no element identifier ';    // no statusVar to worry about!

   if (aid instanceof jQuery) {         // jquery object passed, use it (or first if a collection
        nCOL=aid.length;                // used in status messages
        if (aid.length>1)  {
            ej=$(aid[0]);
        } else {
            ej=aid;
        }
   }
   
   if (arguments.length<2 || typeof(atype)!='string' || jQuery.trim(atype)=='' ) atype='height';
   atype=jQuery.trim(atype.toLowerCase());
   if (atype=='0') atype='height';
   if (atype!='height' && atype!='width') {
       return 'atype must be height or width: '+atype;
   }

    
   if (arguments.length<3 || isNaN(addPx) || jQuery.trim(addPx)=='' ) {   // no addPx arg
       addPx=addPx0;         // default increment/decrment amount
   } else {
       addPx=parseInt(addPx);
       if (addPx==0) addPx=addPx0;
       if (addPx<1) addPx=1;    // can't be less than 1
   }

   if (arguments.length>3)  {    // maxmin arg is specified

     if (typeof(maxMin)=='number') {
          maxPx=maxMin;
          if (maxPx<=0) maxPx=maxPx0;
          minPx=minPx0;
      } else if (jQuery.isArray(maxMin) || typeof(maxMin)=='string') {
           if (jQuery.isArray(maxMin)) {
                aa=maxMin;
           } else {
              aa=maxMin.split(',');
          }
          if (!isNaN(aa[0]) && jQuery.trim(aa[0])!='')  maxPx=parseInt(aa[0]);
          if (maxPx<=0) maxPx=maxPx0 ;
          if (aa.length>1 && jQuery.trim(aa[1])!='' &&  !isNaN(aa[1])) minPx=parseInt(aa[1]);
          if (minPx<=0) minPx=minPx0;

     }                            // if object or someting, ignore (use defaults)
  }


  if (arguments.length<4 || typeof(statusVar)!='string') statusVar='';    // statusVar not specified
  statusVar=jQuery.trim(statusVar);

  if (ej=='') {                   // find the element to resize (a string identifier was provided)
        ej0=$(aid);
        if (ej0.length==0) {
           amess='No matching element to: '+aid;
           if (statusVar!=''){
             mess.push(amess);
             amess=mess.join('\n');
             $(document).data(statusVar,amess);
           }
           return amess;
        }
        if (ej0.length>1) {
             nCOL=ej0.length;                    // used below
             ej=$(ej0[0]) ;
       } else {
           ej=ej0;
       }
  }       // ..  make a jquery object

  if (nCOL>1 && statusVar!='') mess.push('Using first element in a collection of '+nCOL);

  if (minPx>maxPx) {
      tmp1=minPx;
      minPx=maxPx ; maxPx=minPx;
     if (statusVar!='')  amess='Switching order of min and max ';
  }

  if (statusVar!='')  mess.push('Set '+atype+'. Limits: '+minPx+' to '+maxPx+ ' (by '+addPx+')');

// done with checking parameters and finding target of operatons...

  if (atype=='height') {
      iSize=parseInt(ej.height());
  } else {
      iSize=parseInt(ej.width());
  }
  if (statusVar!='')  mess.push('Starting '+atype+': '+iSize);

  if (minPx==maxPx) {                     // this could be used as a way of setting the height/width (awfully roundabout!
       if (statusVar!='')  mess.push('Min=max : '+minPx);
       if (atype=='height') {
          ej.height(minPx);      // set the height
          huse=ej.height()       // just to be sure -- what is the end height
       } else {
          ej.width(minPx);        // set the width
          huse=ej.width()         // just to be sure -- what is the end width
       }
       if (statusVar!='')  {
           mess.push('Final '+atype+': '+huse);
           amess=mess.join('\n');
           $(document).data(statusVar,amess);
       }
       return [iSize,huse]    ;
  }

//  -- need to check...

  ntries=0;
  if (atype=='height') {
      gotScroll=isScrollable(ej).verticallyScrollable;
  } else {
      gotScroll=isScrollable(ej).horizontallyScrollable;
  }

  if (gotScroll) {                       // vert  or horiz scroll exists. So increase in size until it does not
    if (statusVar!='') mess.push('Scroll bars visible: trying expand.');

     huse=iSize;

     for (im=0;im<maxSteps;im++) {        // take a bunch of small steps. Stop when the scroll bar disappears
         huse+=addPx;                       // increment size by a small amount
         if (huse>maxPx) {
              if (statusVar!='') mess.push('Max size limit.');
              break ;     // can't getr bigger
         }
         if (atype=='height') {             // increase it a small amount
                ej.height(huse+'px');
        } else {
                ej.width(huse+'px');
        }
        ntries++;
        bscroll=isScrollable(ej);          // check for scroll bar existence
        if (atype=='height'){
             if (!bscroll.verticallyScrollable) break;    // vert scrollbars went away. Good enough
        } else {
             if (!bscroll.horizontallyScrollable) break;    // horiz scrollbars went away. Good enough
        }
     }       // maxsteps loop

  }   else {             //  gotScroll :::: if here too big, decrease in size ....

     huse=iSize;
      if (statusVar!='') mess.push('Scroll bars NOT visible: trying shrink.');

     for (im=0;im<maxSteps;im++) {
         huse-=addPx;               // decement height by a small amount
         if (huse<minPx) {
              if (statusVar!='') mess.push('Min size limit.');
              break ;     // can't getr smaller
         }
         if (atype=='height') {
                ej.height(huse+'px');
        } else {
                ej.width(huse+'px');
        }

         bscroll=isScrollable(ej);
         if (atype=='height')  {
            qdone=(bscroll.verticallyScrollable) ; // is now too small (so scroll bars appeared). so just increase by one (since before this it was
         } else {
             qdone=(bscroll.verticallyScrollable) ;
         }
         if (!qdone) {                // there is no scroll bar, shrink some more
            ntries++;
            continue;                            // not small enough.
         }

         if (ntries==0) {            // return original size
              huse=iSize ;
         } else {
             huse+=addPx;                                   // else, just got small enough. Add back on the decrement
         }

         if (atype=='height')  {
             ej.height(huse+'px');
         } else {
             ej.width(huse+'px');
         }
          break;

     }       // maxsetps

  }       // need to shrink

  if (atype=='height') {          // the final size
          huse=ej.height()
  } else {
     huse=ej.width()
  }
  if (statusVar!='') {
    mess.push('After '+ntries+' steps');
    mess.push('Final '+atype+': '+huse);
    amess=mess.join('\n');
    if (statusVar!='') $(document).data(statusVar,amess);
  }

//ej.css({'border':acss});

  return [iSize,huse];
}


//=============================    iSize
 //https://stackoverflow.com/questions/4814398/how-can-i-check-if-a-scrollbar-is-visible
// returns if the jquery container e0 has x and y scrollbars
//     horizontallyScrollable: false if NO horiz scrollbars
//     verticallyScrollable: false if NO vert scrollbars
function  isScrollable(q10){

  var  ee ;

  ee=q10[0];

  var y1 = ee.scrollTop;
  ee.scrollTop  += 1;
  var y2 = ee.scrollTop;
  ee.scrollTop  -= 1;
  var y3 = ee.scrollTop;
  ee.scrollTop   = y1;
  var x1 = ee.scrollLeft;
  ee.scrollLeft += 1;
  var x2 = ee.scrollLeft;
  ee.scrollLeft -= 1;
  var x3 = ee.scrollLeft;
  ee.scrollLeft  = x1;
  return {
    horizontallyScrollable: x1 !== x2 || x2 !== x3,
    verticallyScrollable: y1 !== y2 || y2 !== y3
  }
}

//============
// display an array of associative arrays as a CSV -- one row per row of array.
// or ... an "associative array or associative arrays!"
// The first row is a CSV of associative array indices; with rows 1... nrows being CSVs of the values (in this row) of this associative array
//  Note that ALL indices have spot in the CSV (header and nrows). If an array row does NOT contain this index (in its associative array), it is left blank.
//  Each substring (between ,,) will be quoted if non-numeric. IF a " appears, a ` is used (or you can set the escapedQuote character)
//
// Usage:
//      csvString=ws_arrayToCSV(myArray,row1,row2,escapedQuote,minLength
// where
//  myArray : array, each row is an associative array
//  row1 : optional (default is 0). Where to start in array
//  row2 : optional (default is  vv.length-1). Where to end
//  escapedQuote: optional (default is '`'). What to replace " with. Hint: To replace with \", use '\\"'
//  minLength : minimum length of each substring (default, or 0, is any length). If not this long, pad (at end) with spaces
//  maxSizeCheck  : if specified and 1 -- just return maximum size of a substring.

function ws_arrayToCSV(vv,j1,j2,howEscape,minLength,maxSizeCheck) {

  var irow,avv,allvars={},amess='',avar,vlist2,iv,amess,arow,aval,vlist=[],ii,vvlist=[],amax=0,sval,js;

  if (arguments.length<2) j1=0;
  if (arguments.length<3) j2=1111111111111111111 ;
  if (arguments.length<4) howEscape='`';                         // string to replace " with. Eg; '' (remove), '`' : replace with ',  '\"', replace with \" remove, 1: replace with  ', 2: replace with "", 3: repalce with \", other: replace with howEscape
  if (arguments.length<5) minLength=0;                         // string to replace " with. Eg; '' (remove), '`' : replace with ',  '\"', replace with \" remove, 1: replace with  ', 2: replace with "", 3: repalce with \", other: replace with howEscape
  if (arguments.length<6) maxSizeCheck=0;

//  for (irow=j1;irow<=j2;irow++) {                 // find all variables specified in the row range
  for (irow in vv)  { //
     if (irow<j1 || irow > j2) continue;
     avv=vv[irow];
     for (avar in avv) {
           allvars[avar]=1;
      }
  }
  for (avar in allvars) vlist.push(avar);   // array of variable names (simpler to work with than allvars?)

  vlist2=[];
  for (iv=0;iv<vlist.length;iv++) {
     aval=ws_arrayToCSV_escape(vlist[iv],howEscape);
     if (minLength>0) {
           sval=''+aval;
           for (js=sval.length;js<minLength;js++) aval+=' ';
     }
     amax=Math.max(amax,(''+aval).length);
     vlist2[iv]=aval;

  }
  amess+=vlist2.join(',');     // header row


//  for (irow=j1;irow<=Math.min(vv.length-1,j2);irow++) {
  for (irow in vv) {
     if (irow<j1 || irow > j2) continue;

      arow=vv[irow];
      vvlist=[];
      for (ii=0;ii<vlist.length;ii++) {
         avar=vlist[ii];
         aval= (typeof(arow[avar])!=='undefined') ? aval=ws_arrayToCSV_escape(arow[avar]) : '' ;
         if (minLength>0) {
           sval=''+aval;
           for (js=sval.length;js<minLength;js++) aval+=' ';
        }
        amax=Math.max(amax,(''+aval).length);
        vvlist.push(aval);
       }
       amess+='\n'+vvlist.join(',');
  }

  if (maxSizeCheck==1) return amax ;   // jst return size (i.e; for use in second call with padded substrings (between ,,)
  return amess;
  }


 function ws_arrayToCSV_escape(astring,ahow,aquote) {
    var lets,ill,achar;
    if (arguments.length<2) ahow='`';
    if (arguments.length<3) aquote='"';
    if (astring==='' || !isNaN(jQuery.trim(astring))) return astring;              // a number, return as is
    lets=[];
    for (ill=0;ill<astring.length;ill++) {         // regex can do some odds stuff, so be pedantic
       achar=astring.substr(ill,1);
       if (achar=='"') {
               lets.push(ahow);
       } else {
               lets.push(achar);
       }
    }
    return aquote+lets.join('')+aquote;

 }

// synonym for above
function ws_arrayToCsv(vv,j1,j2,howEscape,minLength) {

  if (arguments.length<2) j1=0;
  if (arguments.length<3) j1=vv.length;
  if (arguments.length<4) howEscape='`';                         // string to replace " with. Eg; '' (remove), '`' : replace with ',  '\"', replace with \" remove, 1: replace with  ', 2: replace with "", 3: repalce with \", other: replace with howEscape
  if (arguments.length<5) minLength=0;                         // string to replace " with. Eg; '' (remove), '`' : replace with ',  '\"', replace with \" remove, 1: replace with  ', 2: replace with "", 3: repalce with \", other: replace with howEscape
  return ws_arrayToCSV(vv,j1,j2,howEscape,minLength);
}


// --------------
// function to flatten multi dimensional object to an array.
// each row in the returned array is a [names,value];
//   where value is the final value (string or number)
//   and name is a "name" that captures all of the "nodes" of the object.
//
// theObj: the object to "flatten"
//  dispType: how to display the "name"
//        'array': return as an array.
//        'arrayString': use a [] syntax. Such as 'name1[subNameA][endit]'
//        Otherwise: a string delimited with lowerCase dispType
//
//  Example: for theObj['topName1]['subName1']['endLeaf']=1
//    Then names will be:
//     'array': ['topname1','subname1','endleaf'];
//    'arrayString':  'topName1[subname1[endleaf]'
//     ', '      : 'topName1,subname1,endleaf'
//
//   Example: for theObj['dog']='fido'
//     'array': ['dog'];
//    'arrayString':  'dog'
//     ', '      : 'dog'
//
//
//  The other 2 argumetns are used internally
// Uses recursion

function ws_objectToFlatArray(theObj,dispType,res,ugs0) {
  if (arguments.length<2)  dispType='array';
  if (arguments.length<3)  {       // always, and only, true on first call
      res=[];   ugs0=[];
      dispType=dispType.toLowerCase();
   }
   let ugs=[];
//   if (ugs0.length>0) ugs=$.map(ugs0,function(vv,ii){return vv  });

   for (let aa in theObj) {
     let atype=jQuery.type(theObj[aa]);
     ugs=$.map(ugs0,function(vv,ii){return vv  });
     if (atype=='string' || atype=='number') {
          ugs.push(aa);
          if (dispType=='array') {
               ugsWow= ugs ;
          } else if (dispType=='arraystring') {
             if (ugs.length==1) {
                ugsWow=ugs[0];
             }else {
                ugsWow=ugs[0]+'['+ugs.slice(1).join('][')+']';
             }
          } else {
               ugsWow=ugs.join(dispType);
          }
          aitem=[ugsWow,theObj[aa]];
          res.push(aitem);
      }   else  if (atype=='array'  || atype=='object')  {
           ugs.push(aa);
           ws_objectToFlatArray(theObj[aa],dispType,res,ugs);
      }   // else, ignore
   }
   return res;
}



//============  ugs
// display as a big html table with column headers
// or ... adjust display of of existing table  (if called with 1 argument)
// Note: for an alternative, see the phpLib "divTable.php"
//
// For details, see wsurveyUtils1.txt
//
// There are 3 modes: display an array in an html table,  special options (including  change display of existing html table), and add click handler
//  NOTE: this does NOT crate  a <table>. Instead, a number of sized <div>s, with float:left.
//
//   vv : several possiblities
//        *  array of associative arrays (each row can have different indices). A "table" of this array will be built
//        *  a function.  This is assigned to be a the click handler for all cells.
//        *  a "this" or an event object -- for special cases. Uses attributes, or opts, to determinee what the special case is.  2nd arg used if present, otherwise attribs used .

//   aopts: option associative array. Usages depends on first argumeht
//     if  vv is a function:  the aopts is  the id (a string variable) of a wsArrayToTable table to assign clickhandlers to.
//     if no 2nd argument, or if opts['SPECIAL':1} -- a list of special arguments. This is used if specified. If no 2nd arg, attributes of the element are used (to select what special task to do)
//     opts is '', {}   : create the table using default options
//     opts contains arguments : : create the table using default options in opts. Note that there should NOT be a SPECIAL attribute defined.
//
//  Options for table creation are:
//
//        skipVars:  csvOfIndicesToSkip
//           Example: 'maxYear,totalAmount' -- a maxYear of totalAmount index (in a row of vv) is ignored (not included as a column in the display table)
//        leftColLabels: csv of "row id" labels.
//            Format:   'top=astring,n1=astring,n2=astring'  (top, and n1... are optional)
//                top: a label for the column header. If not  specified,'#' is used
//                n1,n2... : row index.
//            Example: 'top=Year,0=Final,5=Year 5'
//         range : 'firstRow,lastRow' (inclusive) to display. If not specified, all rows are displayed (same as '0,'+vv.length-1)
//                 Note if lastRow is >= vv.length (or if it is NOT specified), vv.length-1 is used
//         freeze : # of rows (of vv) to freeze. These (along with the column header row are NOT scrollable.
//                   All rows after freeze ARE scrollable.
//                   Default value is 1
//         colors: csv of colors. first is used in the "non scrolling rows" (and last row); after that is used for scrolling rows.. so there should be at least 3 colors
//                   Default is 'tan,#abbaba,silver'
//        addComma: if 1 and a number, add commas
//        nDec:  If specified and a number, and a number is displayed, this is the decimal precision
//
//   returns:  [htmlTable,htmlTableId];
//         The htmlTable is a string containing the htmlTable. It can written to the browser window. I.e.;  $('#showResults').html(htmlTable) ;
//         The htmlTableId is a random string used as the ID of the "htmlTable".
//         It can be used to in the change Display mode (see below)
//
// Display  mode. Just one argument that should be either:
//     this, when called using a  'onClick=ws_arrayToHtmlTable(this)
//     or the event when called via a jquery assigned event handler.
//   A "tableId" attribute MUST be specified (in the element assigned this as a click handler)
//
//  Add click handler. One argument that should be a function.
//    A click handler is added that handles clicks on any value cell (an upper level click handler handles it when it bubbles up)
//    This will then call the function with 3 arguments of the clicked on cell: rowNumber,title, html
//
//
//   Attributes are used to direct what display changes are desired.
//   Right now, only one is supported: changeRows="direction", where "direction" is '1' or '-1'
//      This will increase (if '1') or decrease (if -1) the number of rows displayed in the "scrollable" set of rows -- by one em per click
//
//  For example:
//   atable0=ws_arrayToHtmlTable(vdo,{});       // use default options
//     atable=atable0[0]; atableid=atable0[1];
//     atable+='<input type="button" value="&#9047;" title="view fewer rows "  tableId="'+atableId+'" action="changeRows" dire="-1"   onClick="ws_arrayToHtmlTable(this)">';
//     atable+='<input type="button" value="&#9040;" title="view more rows "  tableId="'+atableId+'" action="changeRows" dire="1"   onClick="ws_arrayToHtmlTable(this)">';
//     atable+='<input type="button" value="&#9031;" title="shrink column size "  tableId="'+atableId+'" action="cellWidth"  dire="-1"  onClick="ws_arrayToHtmlTable(this)">';
//     atable+='<input type="button" value="&#9032;" title="expand column size "  tableId="'+atableId+'" action="cellWidth"  dire="1"     onClick="ws_arrayToHtmlTable(this)">';
//   $('myResults').html(atable);


function ws_arrayToHtmlTable(vv,aopts) {

   var allvars={},irow,avv,avar,amess='',arow,ii,vlist=[],ii2,sayval,totem=0,t1,j1,j2,doit=0;
   var icolor,colors=['tan','#abbaba','silver'],skipVars={},colHeader1='row',achar,tt,efoo2,iwidth;
   var nFreeze,zid,useColor,iheight=0,efoo3,acolor,aval,aval0,sptype,colLabels={};
   var leftLabels,alabel,b1,b2,sayRow,atbleId,idir,ethis,doAddComma=0,nDec=0,nDecUse=0,cellWidth=5,newline,addWidth=30,startHeight=12;  // height in em
   var hiliteClass='0',cellWidthLookups={},acellWidth;
   var titles={},ntitles;

   if (arguments.length<2) aopts={'SPECIAL':1};

// function as first argument special cases...
   if (typeof(vv)=='function') {    // add a click handler
     if (arguments.length<2) {
           alert('ws_arrayToHtmlTable click handler error: no tableid ');
           return 0;
     }
     ws_arrayToHtmlTable_clickHandler(vv,aopts);    // aopts is  the id of the table)... this presumes a prior call to ws_arrayToHtmlTble
     return 1 ;
  }

//  special cases. Note the addition of the SPECIAL option if call with just one argument.
   if (typeof(aopts['SPECIAL'])!=='undefined') {

      if (typeof(vv)!=='object') {       // should never happen
           alert('ws_arrayToHtmlTable changeDisplay error: first argument must be object (a pointer to the clicked element)');
           return '';
      }
      if (typeof(vv.target)!=='undefined') {
          ethis=$(vv.target);
      } else {
          ethis=$(vv);
      }

       atableId=aopts['tableId'];
       if (typeof(atableId)==='undefined')  atableId=ethis.wsAttr('tableId',false);
       if (atableId===false) {
           alert('ws_arrayToHtmlTable changeDisplay error: no tableId attribute on 1 argument call');
           return '';
       }
       if ($('#'+atableId).length==0) {
           alert('ws_arrayToHtmlTable changeDisplay error: no such element with id=' +atableId);
           return '';
       }


       doit=aopts['action'];
       if (typeof(doit)==='undefined')  doit=ethis.wsAttr('action','');
       doit=jQuery.trim(doit).toUpperCase();

       if (doit=='') {
          alert('ws_arrayToHtmlTable changeDisplay error: no action specified ');
          return '';
       }

      if (doit=='CHANGEROWS') {                    //  increase or decrease size of scrolleable rows container
          idir=aopts['DIRE'];
          if (typeof(idir)==='undefined')  idir=ethis.wsAttr('DIR',1);
          ws_arrayToHtmlTable_changeRows(idir,atableId);
          return 1 ;
      }
      if (doit=='GETVARS') {                    //  return array of variables
           avv=ws_arrayToHtmlTable_getVars(atableId);
           return avv ;
      }
      if (doit=='VIEWVARS') {                    //  return array of variables
          avv=aopts['varList'];
          if (typeof(avv)==='undefined')  avv=ethis.wsAttr('varlist','*');
          tt=ws_arrayToHtmlTable_viewVars(atableId,avv);
         return tt;
      }
      if (doit=='CELLWIDTH') {                    //  return array of variables
          idir=aopts['DIRE'];
          if (typeof(idir)==='undefined')  idir=ethis.wsAttr('DIR',1);
           tt=ws_arrayToHtmlTable_cellWidth(atableId,idir);
           return tt;
      }

      return 0    ;  // no known action
   }      // done with change display mode

// END OF special cases ....

// ......... display vv (array of associative arrays) !

   zid=Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);   // assign an ID to this "table" -- something long and random to avoid name conflict
   if (typeof(aopts['skipVars'])!=='undefined') {        // variables to NOT display
          avv=aopts['skipVars'].split(',');
          for (ii=0;ii<avv.length;ii++) {
              avar=jQuery.trim(avv[ii]);
              skipVars[avar]=1;
          }
   }

   if (typeof(aopts['nDec'])!=='undefined') {
           tt=jQuery.trim(aopts['nDec']);
           if (!isNaN(tt)) {
               nDec=parseInt(tt);
               nDecUse=1;
           }
     }

   if (typeof(aopts['cellWidth'])=='undefined' && typeof(aopts['cellWidths'])!=='undefined') aopts['cellWidth']=aopts['cellWidths'] ;


   if (typeof(aopts['cellWidth'])!=='undefined') {
           tt=aopts['cellWidth'];
           if (!isNaN(tt) && $.trim(tt)!=='') {
               cellWidth=parseInt($.trim(tt));
           } else {
             if (typeof(tt)=='object') {
                if  (tt.hasOwnProperty('*')) {  // set default?
                    let jtt=tt['*'] ;
                    if (!isNaN(jtt) && jtt>=1)  cellWidth=parseInt(jtt);
                }
                cellWidthLookups=tt;
             }
           }
     }

   if (typeof(aopts['hiliteClass'])!=='undefined') {        // higlight rows on click
           hiliteClass=jQuery.trim(aopts['hiliteClass']);
           if (hiliteClass!=='0') {
               if (hiliteClass=='') hiliteClass='ws_arrayToHtmlTable_rowHilite';
           }
     }

   if (typeof(aopts['ndec'])!=='undefined') {        //  synonym
           tt=jQuery.trim(aopts['ndec']);
           if (!isNaN(tt)) {
               nDec=parseInt(tt);
               nDecUse=1;
           }
     }

   if (typeof(aopts['addComma'])!=='undefined') {
           doAddComma=jQuery.trim(aopts['addComma']);
     }

   if (typeof(aopts['addWidth'])!=='undefined') {
           avv=jQuery.trim(aopts['addWidth']);
           if (!isNaN(avv) && avv>0) addWidth=parseInt(avv);
     }


   if (typeof(aopts['height'])!=='undefined') {
           avv=jQuery.trim(aopts['height']);
           if (!isNaN(avv) && avv>=1) {
               startHeight=parseFloat(avv).toFixed(1);    // miniumum of 1 em
           }
     }
    let nColLabels=0;
    if (typeof(aopts['colLabels'])!=='undefined') {
           colLabels=aopts['colLabels'];
           let nn=0;
           for (let ba in colLabels) {
                nn++;
                if (ba.substr(0,1)==' ') {
                   alert('ws_arrayToHtmlTable   error: column labels can NOT start with a  space: '+ba)   ;
                   return 1;
                }
                nColLabels++;
           }
     }

    if (typeof(aopts['titles'])!=='undefined') {
           titles=aopts['titles'];
           for (let ba in titles)    ntitles++;
     }


   if (typeof(aopts['colors'])!=='undefined') {        // variables to NOT display
          avv=aopts['colors'].split(',');
          colors=[];
          for (iv=0;iv<avv.length;iv++) {
              acolor=jQuery.trim(avv[iv]);
              if (acolor!='')   colors.push(acolor);
          }
    }



   leftLabels={'top':'#'}
   if (typeof(aopts['leftColLabels'])!=='undefined') {
      if (typeof(aopts['leftColLabels'])=='string') {
        avv=aopts['leftColLabels'].split(',');
        for (iv=0;iv<avv.length;iv++) {
           alabel=jQuery.trim(avv[iv])+'=';  // force at least 2 elements
           if (alabel=='')  continue;
           avv2=alabel.split('=');
           b1=jQuery.trim(avv2[0]);
           b2=jQuery.trim(avv2[1]);
           leftLabels[b1]=b2;
        }
      } else {
        for (let vrr in aopts['leftColLabels']) leftLabels[vrr]=aopts['leftColLabels'][vrr];
      }
   }
    colHeader1=leftLabels['top'];

   j1=0; j2=vv.length-1;                           // row range
   if (typeof(aopts['range'])!=='undefined') {
       arow=aopts['range']+',';
       avv=arow.split(',');
       t1=jQuery.trim(avv[0]);
       if (t1=='' || isNaN(t1)) t1=0;
       j1=parseInt(t1);
       t1=jQuery.trim(avv[1]);
       if (t1=='' || isNaN(t1)) t1=vv.length-1;
       j2=parseInt(t1);
   }

   nFreeze=0;
   if (typeof(aopts['freeze'])!=='undefined') {    // # of rows to freeze
       arow=aopts['freeze'] ;
       t1=jQuery.trim(arow);
       if (t1=='' || isNaN(t1)) t1=1;
       nFreeze=parseInt(t1);
   }

   for (irow=j1;irow<=Math.min(vv.length-1,j2);irow++) {                 // find all variables specified in the row range
       avv=vv[irow];
       for (avar in avv) {
           if (typeof(skipVars[avar])!=='undefined') continue ;
           allvars[avar]=1;
       }
   }

// what columns to show (after remove of "skip vars"), and the labels, and in what order.
// if coLlabels not defined, use them all, with breaks at _ and .
   let arf=wsArrayToHtmlTable_colLabels(allvars,colLabels,nColLabels) ;
   let nlabels2=arf[0];
   if (nlabels2==0) {
          alert('ws_arrayToHtmlTable changeDisplay error: the column labels do  NOT include ANY existing indices (in the array rows) ');
          return '';
   }
   colLabels=arf[1];
 // first time -- to get absolute sizes (using absolute sizes avoids premature line breaks, without using infnitely wide container)
   amess+='<div class="ws_arrayToHtmlTable_main" style="width:7000em" id="'+zid+'0">';    // very wide so nothing wraps
   amess+='<div  class="ws_arrayToHtmlTable_colHeaderRow" dtype="-1"  id="'+zid+'2" >';           // column headers
   amess+='<div class="ws_arrayToHtmlTable_topLeft" >'+colHeader1+'</div>';   // each header is a div that is floated left
   icolor=0;

   for (avar in colLabels) {
        if (avar.substr(0,1)==' ') continue;  // should never happen
         acellWidth= (cellWidthLookups.hasOwnProperty(avar)) ? cellWidthLookups[avar] : cellWidth ;
         amess+='<div class="ws_arrayToHtmlTable_colHeaderCell" style="width:'+acellWidth+'em;background-color:'+colors[icolor]+'" >'+colLabels[avar]+'</div>';
   }

   amess+='<div id="'+zid+'1" style="float:left" > ZZ </div>';  // temporary, used to figure out optimal cell widths
   amess+='</div>';
   amess+='</div>'
   amess+='<br clear="all">';
   $(document.body).append(amess);;
   efoo2=$('#'+zid+'1');           // position of final cell (the "ZZ" cell)
   iwidth=Math.trunc(efoo2.position().left)+addWidth;   // the width
   efoo2=$('#'+zid+'2');
   efoo3=efoo2.find('.ws_arrayToHtmlTable_colHeaderCell');
   iheight=0;
   efoo3.each(function(idx){
       iheight=Math.max(iheight,$(this).height());
   })
   $('#'+zid+'0').remove();              // remove the temporary copy (used only to read actual size, that is used below)

// Redo with absolute sizes computed using the 'write content and then read attributes' (above)
   amess='';   vlist=[];
   amess+='<div  class="ws_arrayToHtmlTable_main" style="width:'+iwidth+'px"  id="'+zid+'">';      // col header, no scrolliing, and scrollingg rows container

   amess+='<div class="ws_arrayToHtmlTable_colHeaderRow" dtype="-2"   >';           // column headers
   acellWidth= (cellWidthLookups.hasOwnProperty('#')) ? cellWidthLookups['#'] : cellWidth ;

   amess+='<div  varname="'+colHeader1+'"  class="ws_arrayToHtmlTable_topLeft "  style="width:'+acellWidth+'em"  >'+colHeader1+'</div>';   // each header is a div that is floated left
   var colj=0;
   for (avar in colLabels) {          // write the array-index values as column headers (splitting long names)
         vlist.push(avar);
         acellWidth= (cellWidthLookups.hasOwnProperty(avar)) ? cellWidthLookups[avar] : cellWidth ;
         if (titles.hasOwnProperty(avar)) {
            amess+='<div class="ws_arrayToHtmlTable_colHeaderCell" colJ="'+colj+'" title="Variable: '+avar+'&#013; &#149; '+titles[avar]+'"  ';
            amess+='     varname="'+avar+'"  style="width:'+acellWidth+'em;height:'+iheight+'px">'+colLabels[avar]+'</div>';       // fill up the row
         } else {
            amess+='<div class="ws_arrayToHtmlTable_colHeaderCell" colJ="'+colj+'" title="Variable: '+avar+'" varname="'+avar+'"  style="width:'+acellWidth+'em;height:'+iheight+'px">'+colLabels[avar]+'</div>';       // fill up the row
         }
         colj++;
   }
   amess+='</div>';         // column headers
   amess+='<br clear="all">';
  for (irow=j1;irow<Math.min(vv.length,j1+nFreeze);irow++)  {
     arow=vv[irow];
     icolor=0; useColor=colors[icolor];
     amess+='<div title="Row '+irow+'" class="wsArrayToTable_noScrollRow"  wsArrayRowCt="'+irow+'" style="background-color:'+colors[icolor]+'" >';           // a non scrolled rows

     if (leftLabels.hasOwnProperty(irow)) {
         sayRow=leftLabels[irow];
     } else if (leftLabels.hasOwnProperty('*') ) {
         sayRow=leftLabels['*'];
     } else {
        sayRow=irow;
     }

     let c1Width= (cellWidthLookups.hasOwnProperty('#')) ? ';width="'+cellWidthLookups['#']+'em' : ' ';
     amess+='<div class="ws_arrayToHtmlTable_left1 " style="background-color:'+useColor+c1Width+'" ><span title="'+sayRow+'">'+sayRow+'</span></div>';
     for (ii2=0;ii2<vlist.length;ii2++) {
          avar=vlist[ii2];
          if (typeof(arow[avar])=='undefined'){      // no explicit value for this column in this row
               acellWidth= (cellWidthLookups.hasOwnProperty(avar)) ? cellWidthLookups[avar] : cellWidth ;
               amess+=' <div class="ws_arrayToHtmlTable_rowCell " colj="'+ii2+'" dtype="1" style="width:'+acellWidth+'em;background-color:'+useColor+'" >';
               amess+=' <span isValSpan="0" title="'+avar+' not specified in this row">&hellip;</span></div> ';
          } else {                                  // specifided in this row
             aval0=arow[avar] ;
             if (jQuery.isArray(aval0)){      // got an explicit value?
                aval=aval0[0]; sayval=aval;
                if (aval0.length>1) sayval=aval0[1];
             } else {                             // use value as is -- perhaps with commas and decimal precision (if number)
                aval=aval0;
                if (!isNaN(aval)) {
                   if (nDecUse==1) aval=aval.toFixed(nDec);
                   if (doAddComma==1) aval=addComma(aval);
                }
                sayval=aval;
             }                                // explicit, or not, display value
            acellWidth= (cellWidthLookups.hasOwnProperty(avar)) ? cellWidthLookups[avar] : cellWidth ;
            amess+='<div  class="ws_arrayToHtmlTable_rowCell " colj="'+ii2+'"   dtype="2" style="width:'+acellWidth+'em;background-color:'+useColor+'" >';
            amess+='  <span  isValSpan="1" title="'+avar+': '+aval+'">'+sayval +'</span></div> ';
          }         // missing
      }             // eachcell
      amess+='</div>';        // non scrolled row
      amess+='<br clear="all">';
  }               // non scolledd rows


// scrolled rows
  amess+='<div  class="wsArrayToTable_scrollRows" style="height:'+startHeight+'em">';     // containter for all the srolled rows (this has a y scrollbar, but NOT x)

  for (irow=j1+nFreeze;irow<=Math.min(vv.length-1,j2);irow++)  {
     arow=vv[irow];
     icolor++; if (icolor>=colors.length)icolor=1 ;
      useColor=colors[icolor];
     amess+='<div title="Row '+irow+'" class="wsArrayToTable_aScrollRow" wsArrayRowCt="'+irow+'" style="background-color:'+useColor+'" >';           // containter for a   scrolled row


     if (leftLabels.hasOwnProperty(irow)) {
         sayRow=leftLabels[irow];
     } else if (leftLabels.hasOwnProperty('*') ) {
         sayRow=leftLabels['*'];
     } else {
        sayRow=irow;
     }

      acellWidth= (cellWidthLookups.hasOwnProperty('#')) ? cellWidthLookups['#'] : cellWidth ;

      amess+='<div class="ws_arrayToHtmlTable_left1 ws_arrayToHtmlTable_left1Scroll " style="background-color:'+useColor+';width:'+acellWidth+'em" ';

    acellWidth= (cellWidthLookups.hasOwnProperty('#')) ? cellWidthLookups['#'] : cellWidth ;
     if (hiliteClass!=='0') {
         amess+=' hiliteClass="'+hiliteClass+'" onClick="ws_arrayToHTmlTable_hilite(this)"  ';
         amess+='>';
         let sayRow2=irow;
         amess+=' <span   class="ws_arrayToHtmlTable_hiliteRowButton" title="Click to highlight this row: '+sayRow2+'">'+sayRow+'</span></div>';
     } else {
         amess+='>';
         amess+=' <span   title="'+sayRow+'">'+sayRow+'</span></div>';
     }
     for (ii2=0;ii2<vlist.length;ii2++) {
           avar=vlist[ii2];
           if (typeof(arow[avar])=='undefined'){
                acellWidth= (cellWidthLookups.hasOwnProperty(avar)) ? cellWidthLookups[avar] : cellWidth ;
                amess+=' <div class="ws_arrayToHtmlTable_rowCell "  colj="'+ii2+'"  dtype="3" style="width:'+acellWidth+'em;background-color:'+useColor+'">';
                amess+='<span  isValSpan="0"  title="'+avar+' not specified in this row">&hellip;</span></div> ';
           } else {
              aval0=arow[avar] ;
              if (jQuery.isArray(aval0)){      // got an explicit value?
                  aval=aval0[0]; sayval=aval;
                  if (aval0.length>1) sayval=aval0[1];
              } else {                             // use value as is -- perhaps with commas and decimal precision (if number)
                aval=aval0;
                if (!isNaN(aval) && typeof(aval.toFixed)=='function') {   // catch some odd constructions
                   if (nDecUse==1) aval=aval.toFixed(nDec);
                   if (doAddComma==1) aval=addComma(aval);
                }
                sayval=aval;
              }   // isarray
              acellWidth= (cellWidthLookups.hasOwnProperty(avar)) ? cellWidthLookups[avar] : cellWidth ;
              amess+='<div  class="ws_arrayToHtmlTable_rowCell "  colj="'+ii2+'" dtype="4"  style="width:'+acellWidth+'em;background-color:'+useColor+'" >';
              amess+='<span isValSpan="1"  title="'+avar+': '+aval+'">'+sayval +'</span></div> ';
           }                // undefined
      }      // ii2
      amess+='</div>';   //   scrolled fow
      amess+='<br clear="all">';
   }        // irow
  amess+='<div style="background-color:'+colors[0]+'"> &hellip; </div>';// spacer at bottom
  amess+='</div> ' ;          // block of srolled rows END

  amess+='</div>'  ;
  return [amess,zid];

}

//============================
// click handler to highlight a row
function ws_arrayToHTmlTable_hilite(athis) {
   var e1=$(athis);
   var hclass=e1.wsAttr('hiliteClass');
   if (hclass===false) return 0;       // should never happen
   var eparent=e1.closest('.ws_arrayToHtmlTable_main');
   var e2=eparent.find('.wsArrayToTable_aScrollRow');
   e2.removeClass(hclass);
   var e3=e1.closest('.wsArrayToTable_aScrollRow');
   e3.addClass(hclass);
   return 0;
}


//=----------------------------   colLabels vlist

// create column labels, or check existing
function wsArrayToHtmlTable_colLabels(allvars,colLabels,nColLabels) {
   var avar,daval,allClass='';doAll=0,nlabels=0;

  if (nColLabels ==0) {               // no column labels specified.
      for (avar in allvars) {
          daval=wsArrayToHtmlTable_colLabels2(avar);
          colLabels[avar]=daval ;
          nlabels++;
      }
      return [nlabels,colLabels];
  }
// else remove from colLabels if no such var; or use variable name as label if empty

  for (avar in colLabels) {
    if (avar=='*') {
       allClass=jQuery.trim(colLabels[avar]);
       doAll=1;
       delete colLabels[avar];
       continue;
    }
    if (typeof (allvars[avar])=='undefined') {     // no such variable, remove it  from colLabels list
      delete colLabels[avar];
      continue;
    }

    nlabels++;
    daval=jQuery.trim(colLabels[avar]);
    if (daval=='') {          // no explicit label? prettify column name!
         daval=wsArrayToHtmlTable_colLabels2(avar);
         colLabels[avar]=daval;     // change in place
     }
  }

// add "non specified" at end?
  if (doAll==0) return [nlabels,colLabels];   // do NOT add "non specified" columns

  for (avar in allvars) {
     if (typeof(colLabels[avar])!=='undefined') continue;
     daval=wsArrayToHtmlTable_colLabels2(avar);
     if (allClass!=='') daval='<span class="'+allClass+'">'+daval+'</span>';
     colLabels[avar]=daval ;
     nlabels++;

  }

  if (typeof(colLabels['*'])!=='undefined') delete colLabels['*'];  // cl;eanup



  return [nlabels,colLabels];

}

//============
// break up long name into several lines (break on . or _  or upperCase (in camelback)
function wsArrayToHtmlTable_colLabels2(avar) {
   var ii,achar,tt,newline=1,tt=[];
   for (ii=0;ii<avar.length;ii++) {                  // break on _ or uppercase
      achar=avar.substr(ii,1);
      if (achar=='_'  ||   achar==achar.toUpperCase()  ) {       // a break. Note that ., or any non-character, is a break
         if (newline==1)   {        // newline JUST done -- don't have two in a row
            tt.push(achar);   // don't repeat a new line
          } else {                 // make a new line...
            tt.push('<br>');
            tt.push(achar);
            newline=1;
          }
      } else {
         tt.push(achar);
         newline=0;
      }    // done with this char
   }
  avar=tt.join('');
  return avar;
}

//================
// add click handler
function ws_arrayToHtmlTable_clickHandler(afunc,aid) {
   var e1,e2;

   e1=$('#'+aid);
   if (e1.length==0){
      alert('ws_arrayToHtmlTable click handler error: no such tableid: '+aid);
      return 0 ;
   }
    e1.on('click',{'tocall':afunc},ws_arrayToHtmlTable_clickHandler2);
    return 1;
}

/// ============= called on click .. willl call user supplied function
function   ws_arrayToHtmlTable_clickHandler2(evt) {
  var adata,afunc,e1,ss,atitle,aval,iyear;

  var  adata=evt.data;
  var afunc=adata['tocall'] ;
  //   alert('xxx '+afunc);
  e1=$(evt.target);
  ss=e1.attr('isValSpan');
  if (typeof(ss)=='undefined') return 0;                         //do nothing
  atitle=e1.attr('title');
  aval=e1.html();
  e2=e1.closest('.wsArrayToTable_aScrollRow,.wsArrayToTable_noScrollRow');
  iyear=e2.attr('wsArrayRowCt');
  afunc(iyear,atitle,aval,evt);


}

//===========================
// add and subtract # of "scrollable rows" to view
function ws_arrayToHtmlTable_changeRows(iadd,aid) {
  var eid,e2,iheight;
   eid=$('#'+aid);                                // existence was checked for by caller
   e2=eid.find('.wsArrayToTable_scrollRows');
   iheight=e2.height();
   iheight=(1+(iadd/10))*iheight;
   iheight=Math.max(iheight,20);
   e2.height(iheight);

}

//==========================
// return array of column headers
function   ws_arrayToHtmlTable_getVars(aid) {
  var eid,e2,e3,evars=[];
   eid=$('#'+aid);
   e2=eid.find('.ws_arrayToHtmlTable_colHeaderRow');
   e3=e2.find('div');
   e3.each(function(ix) {
      e3a=$(this);
      evars.push(e3a.attr('varname'));
   });
   return evars;
}


//=--------------
// change cell widthx
function ws_arrayToHtmlTable_cellWidth(aid,idir) {
  var eid,e2,e3,iwidth;
   eid=$('#'+aid);
   e2=eid.find('.ws_arrayToHtmlTable_colHeaderCell,.ws_arrayToHtmlTable_rowCell');
   e3=$(e2[0]);
   iwidth=e3.width();
//   alert(e2.length+' LLL '+iwidth+' ' +idir);
   iwidth=iwidth+(idir*10);
   e2.width(iwidth);
}

//===============
// select which columns to view
function   ws_arrayToHtmlTable_viewVars(aid,varlist) {
  var eid,e2,e3,evars={},avar,vs,iv,bvar,colKeep=[],ikeep;
  var icol,ido,eact,arf,varlistAll=[];

   eid=$('#'+aid);
   e2=eid.find('.ws_arrayToHtmlTable_colHeaderRow');
   e3=e2.find('div');

   e3.each(function(ix) {      // get list of all column names
      e3a=$(this);
      avar=jQuery.trim(e3a.attr('varname')).toUpperCase();
      varlistAll.push(avar);
      colj=e3a.wsAttr('colj',-1);
      if (colj>0) {
          evars[avar]=e3a.wsAttr('colj',0);
          colKeep[colj]=0;                  // default is to remove
      }
   });
 
   if (varlist=='*') {
      vs=varlistAll;
    } else {
       vs=varlist.split(',');         // the column names to keep
    }
   for (iv=0;iv<vs.length;iv++) {
     bvar=jQuery.trim(vs[iv]).toUpperCase();
     if (typeof(evars[bvar])!='undefined') {   // if a column to keep exists, mark as keep
         ikeep=evars[bvar];
         colKeep[ikeep]=1;
     }
   }
  for (icol in colKeep) {
     ido=colKeep[icol];
     if (typeof(ido)=='undefined') continue;   // if col 0
     arf='[colj="'+icol+'"]' ;
     eact=eid.find(arf);
     if (ido==1) {
        eact.show();
     } else {
       eact.hide();
     }
  }



}



//==========================
// toggle between differnt "value types". For esxample: a value could be interpreted as  a "dollar" or a "pct"
//  The same text input would be used to enter the value (for either type). A different (usually hidden field) is used to store the type.
//  A "select button" (in a span or input) is used to switch the values of the type (say, toggle between "dollar" and "pct"
//  When toggling,  the display of the button will show the currently selected type: by changing the text string AND the class (say, set a type specific background color).
// In addition, the class AND value in the textinput box can be changed (depending on the type)
// This click handler is added to the "select button", say with $('#mySelectButton').on('click',wsToggleVal)
// Note: the value field is optional. If not specified, this is simply a color changing button (perhaps specified as a span), with a seperate element (often a hidden <input>) storing the chosen value


function wsToggleVal(athis,addTos,whatDo) {
   var e1,e2,e3,ethis,iv,asay,atoggle,eToggles,a3,i1;
   var nValues,iv,ivnew,e_val,e_type,selName,isDisable,valueDefVals;
   var v0,v1,useClass,allClasses,atag,classList;
   var foo,alist,aval;

  if (arguments.length>1)   {            // special task: add event handlers
    if (jQuery.trim(addTos)=='') addTos='wsToggleVal_selectField';               // if no 2nd arg, never geth ere
    if (arguments.length<3) whatDo='init';   // init, findType, findValue

    if (whatDo=='init') {                    // append click handlers, etc
       if (athis==0)   {
           eToggles=$(addTos) ;             // all the document
       } else {               // more efficient: within a dom object (say, a newlly added block of input fields)
           eToggles=athis.find(addTos);   // toggle "type of input" buttons (addTos typically '.wsToggleVal_selectField'
           if (athis.hasClass(addTos)) eToggles=eToggles.add(athis);    // add self
       }
       for (i1=0;i1<eToggles.length;i1++) {
          atoggle=$(eToggles[i1]);
          if (typeof(atoggle.attr('wsToggleVal_enabled')=='undefined')) {   // make sure wsToggleVal not already an event handler
               atoggle.attr('wsToggleVal_enabled',1)           // add "this had click handler" flag (to avoid adding flags in some other call
               atoggle.on('click',wsToggleVal);                // add the click handler
               if (!atoggle.wsAttr('_current',false)) atoggle.attr('_current',0);   // maks sure a _current attribute exists
         }
       }
    }
    if (whatDo=='findType') {                    // find current category. This ASSUMES that athis is one of the elements inside of a  wsToggleVal_top conteiner.
         e2=athis.closest('.wsToggleVal_top') ;
         if (e2.length!=1) {
            alert('wsToggleVal error: no wsToggleVal_top parent (findType) ');
            return 0;
         }
         e3=e2.find('.wsToggleVal_typeField');
         if (e3.length==0) return '';                    // no such element, return ''
         aval=e3.val();
         alist=e3.wsAttr('_valueList');
          if (alist===false)  return aval ;
         aval=parseInt(aval);
         foo=alist.split(',');
         if (typeof(foo[aval])=='undefined') return aval; // not enought items
         return foo[aval] ;

     }

    if (whatDo=='findValue') {                    // find current category. This ASSUMES that athis is one of the elements inside of a  wsToggleVal_top conteiner.
         e2=athis.closest('.wsToggleVal_top') ;
         if (e2.length!=1) {
            alert('wsToggleVal error: no wsToggleVal_top parent (findValue) ');
            return 0;
         }
         e3=e2.find('.wsToggleVal_valueField');
         if (e3.length==0) return '';                    // no such element, return ''
         return e3.val();
     }

            // if no such parrent, error.



    return 1;
  }          // end of special case

// == a wsToggleVal_selectField "change type" hit -- so switch the 'type" of input
// Note: ethis  is  a span (or something which displays html) with a class of "wsToggleVal_selectField"

   if (typeof(athis.target)=='undefined') {         // how to find underlying dom object depends on whether called as inline function with (this), or using jquery event handler assignment
       ethis=$(athis)  ;      // a "this" in an online function
   } else {
       ethis=$(athis.target);   // an evt in a .on('click',funcname) (or similar)
   }


// some syntax checks..
   if (ethis.length!=1) {
        alert('wsToggleVal error: first argument not convertible to jQuery object ');
        return 1;
   }

   isDisable=ethis.wsAttr('_disable',0,2)  ;
   if (isDisable==1) return 0 ;  // disabled.  Value of 2 means "do NOT look for _top"


// A missing e_val and e_type is permissible (no text input associated with this selectField, and no typeField used for storage of current type)
   e_type=[]; e_val=[];     // default is they do not exist
   if (isDisable!=2)   {             // If not 2,  look for a wsToggleVal parent. so you can look for valueField and typeField as children. Otherwise, valueField and typeField actions are NOT done
      e1=ethis.parents('.wsToggleVal_top');                // the container that holds the value, select, and type elements)
      if (e1.length==0) {                               // if not disabled, top must exist
         alert('wsToggleVal error: no wsToggleVal_top  (as parent of element: '+ethis.prop('outerHTML'));
         return 1;
      }
      e_type=e1.find('.wsToggleVal_typeField');      // the hidden "type" field -- if does not exist, use wsToggleVal_current attribute of selectField to determine current category
      e_val=e1.find('.wsToggleVal_valueField');            // the value input field (typically <input type="text" )
   }

   selName=ethis.wsAttr('_buttonName','');         // this is sent to a callback

   nValues=jQuery.trim(ethis.wsAttr('_nvalues',2));            // must be at least 2 possible values (else, what's the point)
   if (isNaN(nValues) || nValues<2){
        alert('wsToggleVal error: nValues must be 2 or more ('+nValues);
        return 1;
   }
   nValues=parseInt(nValues);

// set the value in the typeField -- increment current value. But if >=nValues, reset to 0 (so toggle through a list)
  if (e_type.length>0) {
      iv=e_type.val();              //  current value. Should start at 0 and go up to nValues-1
  } else {
     iv=ethis.wsAttr('_current',0);    // use this if no typeField
  }
   if (isNaN(iv)) {
        alert('wsToggleVal error: value in style field not a number :'+iv);
        return 0;
   }

   ivNew=parseInt(iv)+1;                   // each click toggles the value (increase by 1...)
   if (ivNew>=nValues) ivNew=0;           // or cycle through list if at maximum value
   if (ivNew<0) ivNew=0;                   // should never happen
   if (e_type.length>0) e_type.val(ivNew);                 // typeField is avaiable. so change it
   ethis.attr("_current",ivNew);           // could be useful


// these are optional (if a needed attributes in sslect field not properly specified, no change occurs to that element)

// change stuff in the _selectField

   v0=ethis.wsAttr('_title'+ivNew,'',2);   // type specific title specified?
   if (v0!=='')  ethis.attr('title',v0);   // if so, change title

  v0=ethis.wsAttr('_valueList','');           // change value displayed
  if (v0!=='') {
    v1=v0.split(',');
    if (ivNew<v1.length)   {         // got a match
          newv=v1[ivNew];
          ethis.html(newv);
    }
  }
  classList=ethis.wsAttr('_classList','');   // change  class
  if (jQuery.trim(classList)!=='') {
      v1=classList.split(',');
      if (ivNew<v1.length)   {         // got a match
          useClass=v1[ivNew];
          allClasses=v1.join(' ');
          wsToggleVal_setClass(ethis,useClass,allClasses);
      }
  }    // non empty _selectClass

// change  stuff of _valueField
// For class, use _classList from _selectField (if no _classList in _valueField)

 if (e_val.length>0) {               // if no value field, don't bother

    v0=e_val.wsAttr('_title'+ivNew,'',2);   // type specific title specified?
    if (v0!=='')  e_val.attr('title',v0);   // if so, change title

    v0=e_val.wsAttr('_valueList','');  // type specific values specified?
    if (v0!=='' ) {             // yes, seee if enough
         valueDefVals=v0.split(',')                    // is there a value (in the csv)?
         if (typeof(valueDefVals[ivNew])!=='undefined') wsToggleVal_setVal(e_val,valueDefVals[ivNew]);
    }       // valuelist for e_val

    v0=e_val.wsAttr('_classList',false);  // type specific values specified?
    if (v0===false) v0=classLit ;        // if not specified, use _selectField class list
    if (jQuery.trim(v0)!=='') {                // either from _selectField, or there  set in _valueField
      v1=v0.split(',');           // if _valueField has _classList='', then do NOT set (even if _selectField has a _classList)
      if (ivNew<v1.length)   {         // got a match
          useClass=v1[ivNew];
          allClasses=v1.join(' ');
          wsToggleVal_setClass(e_val,useClass,allClasses);
      }
    }    // non empty _selectClass


 }

// is there a function to call?
  v0=ethis.wsAttr('_callback');
 
  if (v0!==false) {
    if (typeof(window[v0])!='function')  {
        alert('wsToggleVal error: no such callback function: '+v0);
        return 1;
   }
   window[v0](selName,ivNew,ethis);
  }

/* note: several styles are used, they are set in wsurveyUtils.css
.wsToggleVal_buttonFormat
.wsToggleVal_colorA1
.wsToggleVal_colorA2
.wsToggleVal_colorB1
.wsToggleVal_colorB2
*/

}

//================
// set value 
function wsToggleVal_setVal(aelem,avalue) {
  var  atag=aelem.prop('tagName').toUpperCase() ;
  if (atag=='INPUT' || atag=='OPTION' || atag=='TEXTAREA' || atag=='SELECT') {
     aelem.val(avalue);
  } else {
     aelem.html(avalue);
  }
  return 1;
}

// get value   -- either .val if <input> type of element, otherwise the .html (say, if a <span> )
function wsToggleVal_getVal(aelem,avalue) {
   var daval ;
  var  atag=aelem.prop('tagName').toUpperCase() ;
  if (atag=='INPUT' || atag=='OPTION' || atag=='TEXTAREA' || atag=='SELECT') {
     daval=aelem.val();
  } else {
     daval=aelem.html();
  }
  return daval;
}

// set class
function  wsToggleVal_setClass(aelem,aclass,allClasses) {
  aelem.removeClass(allClasses);     // remove these classes (for all types)
  aelem.addClass(aclass);         // and use this one (for this type)
  return 1;
}


//-------------------
// display number compactly, using K or M
// aval: numeric value to display
//  maxAsIs : the maximum value to display "as is" -- with commas. Anything larger is displayed using xxx.xK. Default is 10,000
// ndec: number of decimal. Default is -1 -- which means return no commas, no decimal

function makeNumberK(aval,maxAsIs,ndec) {
   if (arguments.length<2) maxAxIs=10000;
   if (arguments.length<3) ndec=-1;
   aval=parseFloat(aval);

   if (aval<maxAsIs)   {
      if (ndec<0) return aval.toFixed();   // no commas, no decimal
       if (maxAsIs>=10000) return addComma(aval.toFixed(ndec));    // add comma if > 10k (and ndec >-1)
       return aval.toFixed(ndec);
   }
   if (aval<=100000 ) {    // 100k
      oof= (aval/1000);
      return oof.toFixed(1)+'k';
   }
   if (aval<=100000 ) {    //    1 million
      oof= (aval/1000);
      return oof.toFixed(0)+'k';
   }
   if (aval<10000000) {          // 10 million
      oof=Math.trunc(aval/1000);
      return oof+'k';
   }
   oof=Math. trunc(aval/1000000);
   return oof+'m';
}



//======================
// extenced attribute reader.
// This is called as  $(someThing).wsAttr(...) -- it is an extension to jQuery
// Returns the value of the attribute, or a default.
// What is returned depends on the arguments:
//  No arguments: return associative array containing all attributes (as indices) and their values
//  theAttr: look for this attribute. If its a regex expression, search for attribute that matches.
//  adef:  the default, if no match is found. If not specified, false is used
//  doExactOnly0: if 1, then ONLY look for an exact match. If not found, return  adef
//                if 11, similar to 1, but allow for case insensitive exact match
//               if 2, then also look for a  trailing substring match. Basically, convert 'astring' into '.*astring$'. This should NOT be used if theAttr is a regular expression
//               if 3, then also look for a  leading substring match. Basically, convert 'astring' into '^astring.*'. This should NOT be used if theAttr is a regular expression
//               If not specified, or if any other value:  theAttr is used as is  (so theAttr can contain complicated regular  expresssions)
//                   Note that if theAttr contains no regex, then a substring match occurs.
//    An exact match is always returned, even if there are also substring matches.  But see doMultiple for an exception..
//   doMultiple0:
//     If there is more than one  match,
//        if doMultiple0=0 (or if not specified), the first match found is returned (the order is indeterminate)
//        if 1, an asscoative array of all matches -- including an exact match
//     Note: if doExactOnly0=1, doMultiple0 is ignored (it is set to 0)

  (function($) {
    $.fn.wsAttr = function (theAttr,adef,doExactOnly0,doMultiple0) {
        var elem = this;
        var anattr,attr={},qExact=false,re,att1,doExactOnly=0,doMultiple=0,tattr,gotmatch=0;
        var attr2={};
       var  theAttr_2,gotMatch=[];
        var nargs=arguments.length;
        if (nargs<2) adef=false;
        if (nargs>2) {
            if (jQuery.trim(doExactOnly0)=='1' || jQuery.trim(doExactOnly0)=='2' || jQuery.trim(doExactOnly0)=='3') doExactOnly=parseInt(doExactOnly0);
        }
        if (nargs>3) doMultiple=parseInt(doMultiple0)  ;   // only 1 means "do mutliple"
        if (doExactOnly==1 || doExactOnly==11  ) doMultiple=0;                 // exactONly overrides doMultiple

        if (doExactOnly==11) theAttr_2=jQuery.trim(theAttr).toUpperCase();

        if (nargs>1 && doMultiple!=1) {            // not a "get all attributes" (or get matching). So always check for exact match (even if doExactOnly != 1)
            anattr=elem.attr(theAttr);
            tattr=typeof(anattr);
            if (tattr!='undefined' && tattr!='null' && anattr!==false ) return anattr ;        // got an exact match
            if (doExactOnly==1) return adef ;     // special case: exact only and no match -- return default
        }

        if(elem && elem.length) $.each(elem.get(0).attributes, function(v,n) {     // create a list of all attributes
            n = n.nodeName||n.name;
            v = elem.attr(n);
            tattr=typeof(attr);
            if (tattr=='undefined' ||  tattr=='null' || attr===false )   v=adef;    // should never happen
            attr[n] = v ;
            if (doExactOnly==11) {
                if (theAttr_2==jQuery.trim(n).toUpperCase()) {
                    gotMatch[0]=v;
                }
            }
        })   ;     // list of all attributes

        if (gotMatch.length>0) return gotMatch[0];      // a case insensitive exact match

        if (nargs==0 )  return attr ;     // return all attributes

        if (doExactOnly==2)  {                       // trailing substring match
           re=new RegExp('.*'+theAttr+'$','i');
        } else if(doExactOnly==3) {                  // leading substring match
           re=new RegExp('^'+theAttr+'.*','i');
        } else {                                   // use theAttr as is  (perhaps as substring match, if no regex in theAttr)
            re=new RegExp(theAttr,'i');
        }
        for (att1 in attr) {
           if (att1.search(re)>-1 ) {
             if (doMultiple==0) return attr[att1];      // found a matching attribute. return its value
             attr2[att1]=attr[att1];
             gotmatch++;
           }
        }

        if (gotmatch==0) return adef;  // no matches, return default (= false, if only 1 argument
        return attr2 ;            // if here, doMultiple=1, so return matches only. Might be {} if adef={}
    }
})(jQuery);


// ===============================
// fix up opts  -- create an index, with adef value, if it doesn't exist.
// aobj: the object to be examined-- an associative array
// aindex: key to look for. Case insensitive, trimmed.
// adef : value to use if no such "case insensitive" key exists
// exact: 
//  0 : case  insensitive match. This is the default
//  1: case sensitive match. This is always done first (if no match, then other matches are tried if exact !=1) 
//  2: case insensitive abbreviation match
//  3: case insensitive substring match
// Returns existing value. If no existing value (no such index that matches), returns adef AND sets this aobj[index] = adef (since aobj is called by reference)
// If there are multiple matches (say, due to a substring match), the value returned is one of these (which one is indeterminate)

function ws_setObjectDefault(aobj,aindex,adef,exact) {
   var a1,foo={};
    if (arguments.length<4) exact=0;
   if (typeof(aobj)!=='object') {
      alert('ws_setArrayDefault error: aobj is not an object ');
      return 0;
   }
// check for exact first
    if (typeof(aobj[aindex])!=='undefined')   return aobj[aindex];  // exact match? done
    if (exact==1)  {                     // only exact match -- return default
           aobj[aindex]=adef;
           return adef;
    }
// not an exact match, perhaps try other case-insensitive match
   taindex=jQuery.trim(aindex).toUpperCase(); lenTa=taindex.length;
   for (a1 in aobj) {             // get all of the keys (and cover to uppercase
        aa1=jQuery.trim(a1).toUpperCase();
        if (exact==2) {     // abbreviation match?
           lenaa1=aa1.length;
           if (aa1.substr(0,lenTa)==taindex) {
               return aobj[a1]
           }

        }
        if (exact==3) {     // substring match
           if (aa1.indexOf(taindex)>-1) return aobj[a1]
        }
        if (aa1==taindex)  return aobj[a1]  // otherwise, case insenstive match
    }
// no match, return default
   aobj[aindex]=adef;   // set (aobj is modified in caller
   return adef;   // and return
}


// ======== add clcik handlers if not alreay there
// ado: string to use to find dom elements (i.e.; '.addClickHere'
//      if ado is a jquery object, use as is
// cdo: type of event (string).  i.e.; 'click';
// if only 2 argumetns, returns 0 or 1 -- if a cdo event handler exists.
// afunc : function to call (function reference, NOT string name). i.e.  myClickHandler
// dobj: optional. If supplied, an object or scalar included in the .on event (hence will be available in evt.data of callback). i.e.; 11
//           #added is # of dom objects with event added,
//           #checked is number examined (some of which may be skipped if there already is a cdo event on a candidate dom element)
//       If idelay>0, returns 1  (not very useful, since immediate return before action occurs)
// anyfunc: optional.  Only skips (does not add) if none of the cdo events have a "handler" (a callback) not equnal to afunc
//                    where afunc is a function (NOT a string)
//                    If non of the existing handlers equal afunc, the event IS added.
//       Thus: not specifying anyfunc means "do NOT add if ANY cdo event handlers"
//             specifying anyfunc (which must have typeof = function) means "do NOT add if a cdo event handler points to this function"
//             But DO add if there are cdo event handlers, but none of them are anyFunc

function ws_addEventsNew(ado,cdo,afunc,dobj,anyFunc) {
  var iz,ev,azz,ezz,idid=0,nargs,izz,aev,gotmatch=0;
  nargs=arguments.length;
  if (nargs<5) anyFunc=1;    // default is to NOT add if any cdo event handler exusts
  if (nargs>2) {
    if (typeof(afunc)!='function') {
      alert('ws_addEventsNew error: afunc is NOT a function : '+typeof(afunc));
      return 0;
    }
  }

  zz0=$(ado);
  for (iz=0;iz<zz0.length;iz++) {
        azz=zz0[iz];
        ev = $._data(azz, 'events');

        if(ev && ev[cdo]) {
          if (nargs<3) return 1 ;   // a cdo event handler is assigned to this element
          if (anyFunc==1) continue;    // any such event -- don't add. Otherwise, check if one of the handlers is this event
          for (izz=0;izz<ev[cdo].length;izz++) {
                 aev=ev[cdo][izz];
                 if (aev['handler']==afunc) {
                    gotmatch=1;
                    break;
                 }
          }
          if (gotmatch==1) continue ;    // skip, this function is already a cdo event handler
        }

        idid++;     // number of elements the afunc  event handler was added to
        ezz=$(azz);
        if (nargs<4) {
           ezz.on(cdo,afunc);
        } else {
           ezz.on(cdo,dobj,afunc);
        }
  }
  if (nargs<3) return 0 ;   // no such event handler assigned to this 

  return [idid,zz0.length];

}

//;; ====
// front end to ws_addEventsNew -- with a preliminary delay
// idelay: optional. delay before starting -- give dom a chance to settle down. If not specified, 100 (0.1 seconds) is used. ie. 100
//  anyFunc: 1 (default) -- no add if any cdo event handler. if 0, then no add if a afunc event handler
function ws_addEventsNew_delay(ado,cdo,afunc,dobj,anyFunc,idelay) {

  var iz,ev,azz,ezz,idid=0,nargs,izz,aev,gotmatch=0;
  nargs=arguments.length;
  if (nargs<4) dobj=0;    // default is to NOT add if any cdo event handler exusts
  if (nargs<5) anyFunc=1;    // default is to NOT add if any cdo event handler exusts
  if (nargs<6) idelay=100;    // default is to NOT add if any cdo event handler exusts

// add a delay
  window.setTimeout(function(){
      ws_addEventsNew(ado,cdo,afunc,dobj,anyFunc);
   },idelay);
  return 1;
}

//================
// close parent of this button
// this is called either via a "  onClick="ws_closeParent(this)"  or a  .on('click',ws_closeParent);
// In either case, if the element has a "closeParent" attribute -- the matching dom element will be hidden.
//    This attribute MUST be CSS style: so to close id="myTop", use closeParent="#myTop"
// If no closeParent, "hide" the immediate parent (if one exists)

function ws_closeParent(athis) {
  if (arguments.length<1) {
     alert('ws_closeParent error -- no argument ');
     return 0;
  }
  var e1,eparent,toclose;
  e1=ws_argJquery(athis);


   toclose=e1.wsAttr('closeParent',false,11);
   if (toclose===false) {                    // just close parent
      eparent=e1.parent();
      if (eparent.length==1) eparent.hide();
   } else {
      eparent=e1.closest(toclose);
      if (eparent.length==1) eparent.hide();   // maybe error if no such toclose (perhaps forgot a #)
   }
   return 1;
}

//=====  retrun crc32 of a string (ie; for non utf8 passwords
// same as ws_crc32, no hex option. Should be decpreactead
function  crc32 (str) {
  var a_table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
  var b_table = a_table.split(' ').map(function(s){ return parseInt(s,16) });
    var crc = crc ^ (-1);
    for(var i=0, iTop=str.length; i<iTop; i++) {
        crc = ( crc >>> 8 ) ^ b_table[( crc ^ str.charCodeAt( i ) ) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
};


// crc32 checksum https://stackoverflow.com/questions/18638900/javascript-crc32
function ws_crc32 (str,ashex) {
   if (arguments.length<2) ashex=0;
   var a_table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
   var b_table = a_table.split(' ').map(function(s){ return parseInt(s,16) });
    var crc = -1;
    for(var i=0, iTop=str.length; i<iTop; i++) {
        crc = ( crc >>> 8 ) ^ b_table[( crc ^ str.charCodeAt( i ) ) & 0xFF];
    }
    var  icrc=(crc ^ (-1)) >>> 0;
   if (ashex==0)  return icrc;

   if (icrc < 0) {
     icrc = 0xFFFFFFFF + icrc + 1;
   }
   acrc=parseInt(icrc, 10).toString(16);
   if (acrc.length==7) acrc='0'+acrc;
   return acrc;

};


//============================
// return a jquery object for the ado argument. Can handle several cases.
// Typically, this is called by an event handler, which wants to get access to the dom object that invoked it.
//
//   ado: the object to be examined -- what is the dom element associated with it?
//  which: optional. If specified, can be 'target', 'currentTarget', or 'delegateTarget'. If not specified, or anything else, 'target' is used
//        target is the element that triggered the event (e.g., the user clicked on)
//        delegateTarget  delegateTarget is the element the event listener was  attached to
//        currentTarget is usually the same as delegateTarget. It can differ if .on was used, and  "selector" was specified
//                   If a selector was specified, currentTarget returns the element matching this selector (a child of delegateTarget, possibly parent of target)
//                   If no selector field, currentTarget and delegateTarget are the same.
//
//  Returns a jquery object pointing to this ado argument... such as what element was clicked (or what parent element was clicked)
//
// The event handler could of been assigned using:
//     i) jquery.     Example:   $('#myButton').on('click',myFunction)
//    ii) javascript. Example:   document.getElementById('myButton').addEventListener('click',myFunction);
//   iii) inline.     Example:   <input type="button" value="info!" onClick="myFunction(this)"  what="mainInfo">
//    iv) String.     Example:   <input type="checkbox" id="whatBox" value="Guess1" onClick="myFunction('#whatbox')"  what="Correct!">
// for i and ii, there could be a <div id="myButton" what="Perhaps!">...</div>
//
//  If a "inLine" call, or a 'string' call:  ado is not used (the actual element clicked is assumed).
//
// Example:
//  function myFunction(thisEvt)  {
//     jqUse=ws_argJquery(thisEvt);
//     awwhat=jqUse.attr('what');
//    ... }
//

// ws_jqueryArg is a synonym for this

function ws_jqueryArg(ado,which) {
   if (ado instanceof jQuery)  return ado ;  // already jquery object
   if (arguments.length<2) which='target';
   let xx=ws_argJquery(ado,which);
   return xx;
}

function ws_argJquery(ado,which) {
   if (ado instanceof jQuery)  return ado ;  // already jquery object
   if (arguments.length<2) which='target';

   if (which!='target' && which!=='currentTarget' && which!=='delegateTarget' && which!=='relatedTarget') which='target';

   if (typeof(ado)=='string') {       // kind of odd to use this function for this, but just in case
       oof=$(ado);
       if (oof.length==0) return false ;
       return oof ;
   }
   if (typeof(ado)!=='object') return false ;   // should rarely happen

   if (typeof(ado.originalEvent)!=='undefined' && typeof(ado.target)!=='undefined') return $(ado[which]);  // from an .on
   if (typeof(ado.currentTarget)!=='undefined' && typeof(ado.target)!=='undefined') return $(ado[which]);  // from an .addEventListener


   oof=$(ado);                  // a this
   if (oof.length==0) return false;
   return oof;

}



//--------------------------
// escape key handler
// This is used to "hide elements" by hitting the keyboard's esc key. Where this hiding can occur n a pre determined order (with "earlier to close elements"
// being hid first.
//
//  Initialization call:
//       ws_escapeHandler('init',arg2);
//  Arg2 is optional:
//     *   if arg2 is a string: it is the attribute to look for (to determine "hide order"). The default is 'escIndex'
//     * if arg2 is an object. It can have fields:
//          'escName':  the attribute to look for. Default is 'escIndex'.
//          'highlight': the class to use when highlighting a "hide this?" confirm box.
//                         Default is  'ws_escHandlerHighlight' (a class is created if it does not exist)
//
//  Otherwise, this is used as an event handler (i.e.;attached to document by the 'init' call). So evt is the event  (no 2nd argument)
//
//  How does it work?
//    For all elements you wish to be "hideable" (via a click on the keyboard's escape key) you MUST specify an "escIndex" attribute.
//    This attribute has the following syntax (in a csv string)
//       escIndex="n,func,message"
//    where:
//          n: a number. This is the priority: elements with larger values of "n" are hidden first.
//          func: optional. A function that is called before hiding.   Or special values: ONE or ASK
//          message: optional. A message that may be displayed on function calls
//
//   Note that multiple elements CAN have the same value of "n".
//   When this occurs (and this "n" is the largest of the "visible" escIndex,  this list of  elements are acted upon based on the
//   value of func.
//        * func not specified, or '0', or '':   are hidden
//        * 'ONE' : hidden. Other elements in the list are not hidden.
//        * "ASK" : a simple confirm box is displayed, asking if you want to hide this element. The "message" (if one is specified) is dispalyed in
//                 this prompt box
//        * funcName : the name (as a string) of an existing function.  This function will be called -- see "custom functions" below
//
//
//
//  Note:
//    *  ws_escapeHandler only considers visible elements. If an element has the largest escIndex, but is not visible, it is ignored.
//    * The order of processing of elements that have the same escIndex is indeterminate.
//       For example, if there are several elements with the same escIndex value, and a with a mix of ONE and ASK functions -- an ASK might occur before a ONE.
//
//
// Custom functions
//    You can specify what to do using a special function.
// The function is called as:
//    myFunc(listOfElements,currentInList,escIndex);
// where
//    listOfElements: list of jquery objects pointing to elements selected
//    currentInList : the index (in listOfElements) to consider
//    escIndex :  the "highest found" escIndex (that all elements in this list have)
//
// This function can consider just the currentInList element, or look at them all.
// The function should return a 3 element array
//      [doHide,doReturn,doStop]
//  where
//   doHide: 0, 1, or 2
//          If 0, the current element (listOfElements[currentInList] is left as is (though the function could close it).
//          If 1, the curremt element is hidden.
//          If 2, the current AND ALL remaining elements will be hidden. Any function call associated with remining elements is ignored -- it is just closed!
//   doReturn: 0, or 1.
//          If 1, processing stops. Otherwise, the remaining elments are considered (their functions are called)
///  doStop: 0 or 1
//          If 1, a propagation is stopped -- the event will not "bubble up" to any other event handler (such as 2nd ws_escHandler call). If 0, propagation is not stopped
//          Note that if one (in a series of function calls) has a doStop=1, event propagation is stopped (even if the remaining calls to NOT stop propagation).
//
//   If a non-array is returned, same as [0,0,0]
//
//
// Advanced hint:
//   Multiple calls to ws_escapeHandler can be made, with different values of the 'escName'.
//      In such a world, the first set of elements (with an escName attibute are considered)
//      Then, the next set.
//
//    To stop after the first set, you can use stop propogation in a custom function


function ws_escapeHandler(evt,arg2) {

  var jj,list1,asay,afunc,qq,eaa,isName,ee,eev,maxInd,aee,aindex0,aindexV,aindex,t1,ntest,tests,tt;
  var datas={},akey,highStyle;
  var didstop,a1,ido,doclose,doreturn,dstop;


// init call?

  if (typeof(evt)=='string' && evt=='init') {

    if (arguments.length<2) {
       arg2={} ;
    } else {
       if (typeof(arg2)=='string') {
         tt=arg2; arg2={}; arg2['escName']=tt;
      }
    }
    datas['escName']=ws_setObjectDefault(arg2,'escName','escIndex',0);
    datas['highlight']=ws_setObjectDefault(arg2,'highlight','ws_escHandlerHighlight',0);

    $(document).on('keyup',datas,ws_escapeHandler) ;           // depends on where mouse is

    qq=cssClassExists('ws_escHandlerHighlight');
    if (!qq) {           // create this class

    $('<style>').prop("type","text/css")
   .html(" \
.ws_escHandlerHighlight {   \
 border:4px groove tan !important ;  box-shadow: 2px 2px 10px 2px tan inset   !important ;  opacity: 0.55  !important ; \
} \
    ")
    .appendTo("head");
    }
    return 1;

  }        // init

// not an init

  akey=evt.which ;
  if (akey!==27) return 0;  // just deal with esc keys hits

  datas=evt.data ;
  isName=datas.escName ;
  highStyle=datas.highlight ;
  ee=$('['+isName+']');
  eev=ee.filter(':visible');

  maxInd=0;   // 0 values are NOT closed
  var list1=[];
  var listTop=[];
  for (iee=0;iee<eev.length;iee++) {
    aee=$(eev[iee]);
    aindex0=aee.attr(isName)+',,';
    aindexV=aindex0.split(',');
    aindex=jQuery.trim(aindexV[0]);
    if (isNaN(aindex)) {
       if ($.trim(aindex).toUpperCase()=='TOP') {   // special case: always do these   (perhaps before current topValue of escIndex)
          afunc=jQuery.trim(aindexV[1]);
          asay=jQuery.trim(aindexV[2]);
          t1=[aee,afunc,asay];
          listTop.push(t1);
       }
       continue ; // skip, if does non numeric value
    }      // non numeric escIndex

    aindex=parseInt(aindex);
    if (aindex==0 || aindex <maxInd) continue ;   // not top prioirity to close

    afunc=jQuery.trim(aindexV[1]);
    asay=jQuery.trim(aindexV[2]);
    if (aindex==maxInd) {
        t1=[aee,afunc,asay];
        list1.push(t1);
    } else {
       list1=[];
       t1=[aee,afunc,asay];
       list1.push(t1) ;
       maxInd=aindex;
    }
  }

  if (list1.length==0 && listTop.length==0) return 0 ;  // should not happen

  if (list1.length==1 && listTop.length==0)  {       // just found one
    eaa=list1[0][0];
    afunc=list1[0][1];
    if (afunc=='' || afunc=='0'  )  {     // no function, or "just close this" so just hide it
        eaa.hide();
        return 1;
    }
  }

  if (listTop.length>0)  {       // do the "always do" first. All of them, indeterminate order
     for (jj=0;jj<listTop.length;jj++) {
       a1=listTop[jj];
       afunc=a1[1];
       if (typeof(window[afunc])!=='function') {
          alert('Error in ws_escapeHandler: function does not exist: '+afunc);
          return 0;
       }
       ido=window[afunc](listTop,jj,0);      // jj is the "currently being considered". But the function can look at all of them!
       if (ido==0) continue ;                // do next in list
       if (ido==1) break ;                   // stop doing these, and do the normal (escIndex=n) items
       if (ido==2) return 1;                 // no more processing of (don't close anything)
     }
 }

// multiple matches (or one match with a function)-- look for a afunc='one' or '1' -- delete first one found.
  tests=[];
  for (jj=0;jj<list1.length;jj++) {
    a1=list1[jj];
    afunc=a1[1].toUpperCase();
    asay=a1[2] ;

    if (afunc=='')  {               // close all that have no modifiers
      a1[0].hide();
      continue ;
    }
    if (afunc=='ONE' || afunc=='1') {
       a1[0].hide();
       return 0;
    }
    if (afunc=='ASK' ) {
       a1[0].addClass(highStyle);
       if (asay=='') {
           qq=confirm('Hide this? ');
       } else {
           qq=confirm('Hide `'+asay+'` ');
       }
       a1[0].removeClass(highStyle);
       if (qq) a1[0].hide();
       continue ;
    }

   tests.push(a1);         // a custom function
 }

 if (tests.length>0) {               // one or more  call function  matches
   didstop=0;  closeAll=0;
   for (jj=0;jj<tests.length;jj++) {
     a1=tests[jj];
     if (closeAll==1)  {           //  a "close all" from prior call from this list
             a1[0].hide();;
             continue;
     }
     afunc=a1[1];
     if (typeof(window[afunc])!=='function') {
       alert('Error in ws_escapeHandler: function does not exist: '+afunc);
       return 0;
     }
     ido=window[afunc](tests,jj,maxInd);      // jj is the "currently being considered". But the function can look at all of them!

     if (jQuery.isArray(ido)) {
        ido.push(0); ido.push(0);   // hack to set defaults (continue down list, do not stop propagation)
        doclose=ido[0];  doreturn=ido[1]; dostop=ido[2];
        if (doclose==2) {
             a1[0].hide();;
             closeAll=1;
             continue;
        }
        if (doclose==1) a1[0].hide();
        if (dostop==1) {
          if (didstop==0) evt.stopPropagation();   // only need to do this once
          didstp=1;
        }
        if (doreturn==1) return 1;
        alert('esc next one ');
     }   // else, continue down list

   }
 }      // test.length


 return 1;
}   // func end     afunc



//--------------
//   select contents of a container  (id =containerid as a string,
// lifted from http://www.sitepoint.com/forums/showthread.php?459934-selecting-text-inside-lt-div-gt
// http://stackoverflow.com/questions/5669448/get-selected-texts-html-in-div
//
//  NOTE: clip does NOT seeem to work under firefox (april 2020)
//
// container id: id of a container to mark, copy, or copy to clipboard.  A string, without leading #
//  awhat: optional. 'MARK', 'COPY',   'CLIP' ,or UNNMARK:
//       MARK text in container.  returns true or false
//      COPY marked contents.  returns contents, retaining HTML
//      CLIP: copy to clipboard (case insensitive).  returns 1 on success, 0 on faiure, -1 if unsupported browser
//      UNMARK if any text is selected. returns true
//
//  jan 2021 modification. If one argument, assume this is an event handler. 
//   first argument is pointer to the element that was clicked on -- work with its contents
//   Find the "what" attribute_-- which should containt MARK, COPY, CLIP, or UNMARK. If not specified, MARK is used

 function ws_selectText(containerid,awhat) {
   var node,awhat,e0,node0;
    if (arguments.length<2) awhat='mark';
    awhat=jQuery.trim(awhat).toUpperCase();
   if (arguments.length==1)   {          // event handler?
         e0=ws_argJquery(containerid);

         if (e0.length==0) return false ;
         awhat=e0.attr('what');
         awhat= (typeof(awhat)=='undefined')  ? 'MARK' : awhat;
         node=e0[0];  // dom object needed

   } else {
       containerid=jQuery.trim(containerid);    // uses
       if (containerid.substr(0,1)!=='#') containerid='#'+containerid;
       node0=$(containerid);
       if (node0.length!=1) return false ;
       node=node0[0];
   }

 // clear any open range
    if (document.selection) document.selection.empty();
    else if (window.getSelection)
    window.getSelection().removeAllRanges();
    if (awhat=='UNMARK' ) return true ;


// mark it
    if ( document.selection ) {
            var range = document.body.createTextRange();
            range.moveToElementText( node  );
            range.select();
   } else if ( window.getSelection ) {
            var range = document.createRange();
            range.selectNode( node );
           window.getSelection().removeAllRanges();
            window.getSelection().addRange( range );
     }
    if (awhat=='MARK') return true ;     // done

// copy all html within the container
  if (awhat=='COPY' || awhat=='GET') {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {                    // should always be the case (give tne above must marked some content)
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            if ($(container).children().length==1) {
               html=$(container).children().prop('innerHTML');   // strip out encompassing div
            } else {
               html = container.innerHTML;
            }
        }

    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
 }

// save to clipboard?
 if (awhat.substr(0,4)=='CLIP' || awhat=='SAVE') {
        try {
          var ok = document.execCommand('copy');        // The important part (copy selected text)

         if (ok) return 1;
             else  return 0 ;
       } catch (err) {
          return -1  ;
    }
 }

 return false ;
}

//================
// replicable random number generatlr (not cryptographically secure)

Math.wsSeed=10;                 // the global seed. It should be to some stored (or storable) value before first call to wsRand
wsRand = function(max, min) {
    max = max || 1;
    min = min || 0;

    Math.wsSeed = (Math.wsSeed * 9301 + 49297) % 233280;
    var rnd = Math.wsSeed / 233280;

    return min + rnd * (max - min);
}


//====================
// find what "bin" a numeric value is in
function ws_rangeToIndex(daval0,rangeList,aeq,rlistUse) {
  var daval,ibin;
   if (arguments.length<3) aeq=0;

    daval=parseFloat(daval0);
    ibin=0;
   for (let ii=0;ii<rangeList.length;ii++){
       if (aeq==0) {
          if (daval<parseFloat(rangeList[ii])) {
             if (arguments.length<4) return ii;
             return rlistUse[ii];              // could return undefined
          }
       } else {
          if (daval<=parseFloat(rangeList[ii])) {
             if (arguments.length<4) return ii;
             return rlistUse[ii];                // could return undefined
          }
       }
    }
    if (arguments.length<4) return rangeList.length;
    return rlistUse[rlistUse.length-1] ;
   }


//================
// given a list of weights, chose a random index from this list.
// probablity of choosing an index = ithWeight / sum(weights)
function ws_rand_WeightedChoice(weights) {
  
  var sumWeight,dalist=[],sweight=0,relWeights=[],ii,vv,darand,ii,arelWeight;

  if (weights.length==1) return 0 ; // trivial case
  sumWeight=0;
  for (ii=0;ii<weights.length;ii++) {
      relWeights[ii]= (weights[ii]<0) ? 0 : weights[ii];
  }
  $.each(relWeights,function(ii,vv){ sumWeight+=vv ;});
  dalist=[];
  sweight=0;
  for (ii=0;ii<weights.length;ii++) {
      arelWeight=relWeights[ii]/sumWeight;
      sweight+=arelWeight;
      dalist[ii]=sweight ;
  }
  darand=wsRand();
  for (ii=0;ii<dalist.length;ii++) {
      if (darand<=dalist[ii]) return ii;
  }
  return dalist.length - 1 ;        //should never get here

}


//============================
//=====================================
// process a "criteria" list that contains a list of "if" conditions"
// return a matrix that specifies what these are
//
// critList: a string containing one or more logical statements.    For example: 'a < b & d eq 10 '
// allowedLhs : optional. If specified, an array of string values allowed on the LHS. For example, a list of known variables
// allowedRhs :  optional. If specified, an array of string values allowed on the RHS. For example, a list of known variables
// moreConds: array of other conditions that are permitted. Such as "in" 

function ws_ifParse(critList0,allowedLhs,allowedRhs,moreConds) {

    var  errlist=[],nAnds=0,nOrs=0,nterms=0,critList1=[],ii,tt  ;
    var terms=[{'errors':''}];   // 1,2, for conditions 1,2, ...

    if (arguments.length<2) {
      allowedLhs=[]; allowedRhs=[];
    }
    if (arguments.length<3) allowedRhs=[];
    if (arguments.length<4) moreConds=[];


//-----------------------------
// allowed LHS and RHS lookups ..

   var allowedLhsNum=0,allowedLhsFuncs={},allowedLhs2={'nn':0},allowedLhsArrays={} ;
   allowedLhsNum=ws_ifParse_0a(allowedLhs,allowedLhsFuncs,allowedLhsArrays,allowedLhs2) ;

   let  allowedRhsNum=0,allowedRhsFuncs={},allowedRhs2={},allowedRhsArrays={}    ;
   allowedRhsNum=ws_ifParse_0a(allowedRhs,allowedRhsFuncs,allowedRhsArrays,allowedRhs2) ;

// the logical conditons (case insensitive) that can appear in critList
   var okConds={'EQ':'EQ','NE':'NE','GE':'GE','LE':'LE','GT':'GT','LT':'LT','==':'EQ','!=':'NE','>=':'GE','<=':'LE','>':'GT','<':'LT' } ;
   if (moreConds.length>0) {
       for (ii=0;ii<moreConds.length;ii++) {
           tt=jQuery.trim(moreConds[ii]).toUpperCase(); okConds[tt]=tt;
       }
   }

// hacky preprocssing..  replace the '==' (and similar) substrings with 'EQ' (etc)
   var rep1s={'==':' EQ ','!=':' NE ','>=':' GE ','<=':' LE ','>':' GT ','<':' LT ',' = ':' EQ ' };
   let aa,ab,ac,ad,ae,re1 ;
   aa=critList0.replace(/[,]+/g,' | ');   // term1 , term 2 convetred to term1 | term2
   ab=aa.replace(/[\&]+/g,' ,& ');      // commas used to seperate terms for next processing step
   ac=ab.replace(/[\|]+/g,' ,| ');
   ad=ac.replace(/\s+or\s+/gi,' ,| ');
   ae=ad.replace(/\s+and\s+/gi,' ,& ');
   for (a0 in rep1s) {
     re1=new RegExp(a0,'g');
     ae=ae.replace(re1,rep1s[a0]);
  }

// each phrase in the csv is a seperate condition. Note use of above to inser "," before & or |
// Note that && and || are converted to & an | . "and" is converted to '&', or is converted to '|'

   let ic,aterm,aterm3,isAnd,ac1,isNot,acNot;
   let cTerms=ae.split(',');

// remove empty terms, figure out if 'and' or 'or'
   for (ic=0;ic<cTerms.length;ic++) {
      aterm=jQuery.trim(cTerms[ic]);
      if (aterm.substr(0,1)=='&') {
          aterm=jQuery.trim(aterm.substr(1)) ;
          isAnd=1;
      } else if (aterm.substr(0,1)=='|') {
          aterm=jQuery.trim(aterm.substr(1)) ;
          isAnd=0;
      }   else {           // if the first statement   does NOT start with an & or |,  is assumed to be an or
          isAnd=0;
      }

// now get the 3 "words" in the condition. Note that the '==' do NOT have to be surrounded by spaces -- the "rep1s" replacements
// add them. But the 'EQ' conditions MUST be surrounded by spaces.
// The & and | must also be surrounded by spaces (since they are before and after the left and right "terms"
      if (aterm=='') continue      ;     // skip goofiness
      ac1=aterm.substr(0,1);       // note that aterm has been trimemd
      if (ac1==';') continue ; // skip comments
      isNot=0 ;
      if (ac1=='!') {        // not
         isNot=1;
         aterm=jQuery.trim(aterm.substr(1));
      }
      aterm3=getWord(aterm)  ;        // check for comments and ! (not) character

     if (aterm3.length==4)  {        // check for a preceding ' NOT '
       acNot=jQuery.trim(aterm3[0]).toUpperCase() ;
       if (acNot=='NOT') {
           isNot=1;
           aterm3=aterm3.slice(1);
       }
     }
     if (aterm3.length!=3) {
         errlist.push('misspecified term: '+cTerms[ic]);
     } else {
        nterms++;
        terms[nterms]={'LHS':{},'cond':'','RHS':{}};
        terms[nterms]['and']=isAnd;
        terms[nterms]['not']=isNot;
        critList1[nterms]=aterm3 ;
        terms[nterms]['term']=aterm ;
        terms[nterms]['nerrs']=0 ;
        nAnds=nAnds+isAnd ; nOrs=nOrs+ (1-isAnd);
     }

  }  // cterms
  terms[0]['nAnds']=nAnds;
  terms[0]['nOrs']=nOrs ;

// done processing each term. Any errors?
  if (errlist.length>0) {
     terms[0]['errors']=errlist.join('; ');
     return terms;
  }

// this does the work (now that the syntax is cleared up. Most of the work is processing for [] and ()
  let ac0,ac2,cac2,ithterm;
  for (ithterm in critList1) {
       ac0= critList1[ithterm]  ;   // the ic'th term

       ws_ifParse_1(ac0[0],allowedLhs2,allowedLhsNum,allowedLhsFuncs,allowedLhsArrays,'LHS',ithterm,terms,errlist) ; // will change terms or errlist

       ws_ifParse_1(ac0[2],allowedRhs2,allowedRhsNum,allowedRhsFuncs,allowedRhsArrays,'RHS',ithterm,terms,errlist) ; // will change terms or errlist

       ac2=ac0[1] ;            // condition
       cac2=jQuery.trim(ac2).toUpperCase();
       if (typeof(okConds[cac2])=='undefined')  {
          errlist.push('unknown condition ('+ac2+')  specified in  '+terms[ithterm]['term']);
          terms[ithterm]['nerrs']++;
       }
       terms[ithterm]['cond']=okConds[cac2];
  }       //  [field,  condition , value, array flag or index in array, and flag]

// all done
  if (errlist.length>0)  terms[0]['errors']=errlist.join('; ');
  return terms ;
}



//---------------------------
//===============
// create allowed fairalves
  function  ws_ifParse_0a(allowed1,allowedFuncs,allowedArrays,allowed2) {

    allowedFuncs['nn']=0; allowedArrays['nn']=0 ; allowed2['nn']=0 ;

    var ii,av0,avvC,foo,fooC,numok=0 ;

    for (ii=0;ii<allowed1.length;ii++) {
         avv0=jQuery.trim(allowed1[ii]);
         avvC=avv0.toUpperCase();
         if (avvC=='*N') { numok=1; continue ; }

         if (avv0.indexOf('(')>-1) {        // functions allowed
             avv0=avv0.split('('); avv0=jQuery.trim(avv0[0]);
             avvC= avv0.toUpperCase();
             allowedFuncs[avvC]=avv0 ;
             allowedFuncs['nn']++;
             continue;
         }
         if (avv0.indexOf('[')>-1) {        // arrays allowed
             avv0=avv0.split('['); avv0=jQuery.trim(avv0[0]);
             avvC= avv0.toUpperCase();
             allowedArrays[avvC]=avv0;
             allowedArrays['nn']++;
         }
         allowed2[avvC]=[ii,avv0] ; // allowedLhs[ii]
         allowed2['nn']++ ;
   }


   return numok ;
 }     // end ofws_ifParse_0



//===============
// parse lhs or rhs for [] notation
 function  ws_ifParse_1(a1a,allowed1,numOk,okFuncs,okArrays,awhat,iterm,terms,errlist) {   // arrays are passed by reference

    var  a1=jQuery.trim(a1a);      // may be redundant
     terms[iterm][awhat]['error']=0 ;  // assume no error
     terms[iterm][awhat]['original']=a1 ;  // for reference

     if (allowed1['nn']==0 && okFuncs['nn']==0 && okArrays['nn']==0){       // no 'allowed' checking, so use as is
       terms[iterm][awhat]['val']=a1;                                  // does not have to a number
       return 1 ; // no need to process this -- return as is
     }

     var  afuncC,a1,afunc=''
     let tmp0=parseUsing(a1,'(',')',2);         // check for () notation
     if (tmp0[1]!==null) {  // if non-null   xxx(yy) detected
       afunc=jQuery.trim(tmp0[0]);
       afuncC=afunc.toUpperCase();
       a1=tmp0[1];       // extract the function argument for further processing
       terms[iterm][awhat]['function']=afunc ;
       if (okFuncs['nn']>0 && typeof(okFuncs[afuncC])=='undefined') {        // check for function
             errlist.push(awhat +' ('+afunc+')  function not allowed in: '+terms[iterm]['term']);
             terms[iterm][awhat]['error']++  ;
       }   else {                            // use case as specified in okFuncs
           terms[iterm][awhat]['function']=okFuncs[afuncC] ;
       }

     }

     if (numOk==1 && !isNaN(a1)) {      // check if a number
         terms[iterm][awhat]['val']=a1;
         return 1 ; // no need to further process this
     }

     let varSay,varC;
     let tmp1=parseUsing(a1,'[',']',2);         // check for [] notation
     if (tmp1[1]!==null) {  // this has a x[i] structure
          varSay=jQuery.trim(tmp1[0]);
          varC=varSay.toUpperCase();
          if (okArrays['nn']>0 && typeof(okArrays[varC])=='undefined') {        // not an allowed fucntion
              errlist.push(awhat +' ('+varSay+')  array not allowed  in: '+terms[iterm]['term'] );
              terms[iterm][awhat]['error']++  ;
          }
     } else {
            varSay=a1;
            varC=varSay.toUpperCase();
     }

     if (allowed1['nn']==0) {
         terms[iterm][awhat]['var']=varSay;  // no listindex, no error
     } else {
         if (typeof(allowed1[varC])=='undefined') {
            terms[iterm][awhat]['var']=varSay;  // no listindex, yet error
            errlist.push(awhat +' ('+varSay+') variable not allowed  in: '+terms[iterm]['term'] );
            terms[iterm][awhat]['error']++  ;
        } else {
             terms[iterm][awhat]['var']= allowed1[varC][1];
             terms[iterm][awhat]['listIndex']=allowed1[varC][0];
        }
     }
     if (tmp1[1] !==null) {  // this has a x[i] structure (even if not a permissible array)
           terms[iterm][awhat]['index']=jQuery.trim(tmp1[1]);
     }

     return 1;
 }     // end of  ws_ifParse_1



//===============
// clone an array or objec
ws_clonseObject=ws_cloneArray;
ws_clonesObject=ws_cloneArray;
ws_cloneObj=ws_cloneArray;
function ws_cloneArray(aobj) {
         var newobj=JSON.parse(JSON.stringify(aobj));
         return newobj;
}


//=====================
// generic toggle sets of itesm (i.e.; variables) to view within a container
// uses attributes of the "button" that invokes this
//  <input type="button"  value="toggle view"  inId="apriorPeriodsTable"  which="0" maxWhich="2" finds="toggleVarsDo" onClick="toggleVarsToView(this)">';
// inid: dom string  of container to toggle elements within. If not specified, use immediate parent of athis
// finds: class of elements to toggle. If not specified, use 'toggleVarsToView'
// maxWhich : max "which'. Optional. If not specified, max value of 'which' (in elements with toggleVarsToView class) is used
// which : counter for "which" elements to view. Increment on each call, up to maxWhich.
//          all toggleVarsToView elements with a 'which' attribute <= which (after increment) will be vieweed. Others will not be
//  If an toggleVarsToView element does NOT have a whcih attirube, a value of 1 is used
// THus: higher values of iwhich are shown LESS frequently
//
// Standalone call:  toggleVarsToView(0,inid,finds,which,daButton)
//  inid and finds MUST be specified. which is the value to use (it is NOT incremented).
// daButton is dom selector string -- its "which" attribute is set. Tyicall starts with a # (for the id);but any dom string is okay -- first match is used

function ws_toggleElementsToView(athis,inId,finds,iwhich,daButton) {
  var e1,iwhich,ifinds,eall,maxWhichFound,ewhich,ee,jj,nobutton=0;

  if (arguments.length>1)  {         // explicit
    nobutton=1;
    if (arguments.length>4) {
      e1=$(daButton);
      if (e1.length==0) {
        alert('ws_toggleElementsToView error. no button with: '+daButton);
        return 0  ; // give up
      }
      if (e1.length>1) e1=$(e1[0]);
      nobutton=0;
    }
    inId=$.trim(inId);
    euse=$(inId);
  } else {
     e1=ws_argJquery(athis);
     inId=e1.attr('inId');
     if (typeof(inId)=='string') {
        inId=$.trim(inId);
        euse=e1.closest(inId);
    }  else {
       euse=e1.parent();
    }
  }

  if (euse.length==0) {
     alert('ws_toggleElementsToView error. no matches to parent container: '+inId);
     return 0;    // give up
  }

  if (arguments.length==1)  {         // explicit
    finds=e1.attr('finds');
    if (typeof(finds)=='undefined') finds='.toggelVarsToView';   // elements in the euse containter with this class may be toggled
  }
  eall=euse.find(finds);   // all elements in  euse that are subject to toggline
  if (eall.length==0) {
     alert('ws_toggleElementsToView error. no toggleable elements: '+finds);
      return 0 ;  // give up
  }

  if (arguments.length==1)  {         // find which attribute, and update
    iwhich=e1.attr('which') ;
    if (typeof(iwhich)=='undefined')  {   // counter of what "group" to display. if not specified, start with group 0
       iwhich=0;
       e1.attr('which',0);
    }
   }

   ewhich=[];
   maxWhichFound=0;
   for   (var ifoo=0;ifoo<eall.length;ifoo++) {       // find the "which" levels of these toggleable elements
       ee=$(eall[ifoo]);
       jj=ee.attr('which');
       if (typeof(jj)=='undefined') jj=1;
       maxWhichFound=Math.max(maxWhichFound,jj);
       ewhich[ifoo]=jj;
   }

   iwhich=parseInt(iwhich);          // if explicit, use iwhich as is (no attempt to compare to max observed iwhich)

   if (arguments.length==1) {
      maxWhich=e1.attr('maxWhich');
      if (typeof(maxWhich)=='undefined')  {   //  cycle back to 0 if which++ > than this
           maxWhich=maxWhichFound;
     }
     iwhich++;
     if (iwhich>maxWhich) iwhich=0 ;        // 0  means "display everything"
   }

  if (nobutton==0) e1.attr('which',iwhich);          // set the "incrementatin of current value", or the explicitily set one

  eall.hide();
  for  (var ifoo=0;ifoo<eall.length;ifoo++) {
    if (ewhich[ifoo]<=iwhich) $(eall[ifoo]).show();
  }

  return eall.length ; // success

}       //e1
