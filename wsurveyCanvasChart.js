// 8 June  2020. 19 april 2021 update
// For details, see wsurveyCanvasChart.txt.
// Note: this is a vaer heavily modified & updated version of CanvasChart --   https://weblogs.asp.net/dwahlin/creating-a-line-chart-using-the-html-5-canvas. Jan 2020 modified by D Hellerstein
//
// Draw line graph using html5 tools.
// Usage:
//      Include something like:<script src="/wsurvey/publicLib/CanvasDemos/Scripts/wsurveyCanvasChart.js" type="text/javascript"></script>
// Call using:
//    wsCanvasChart.render('idOfCanvasElement', dataSpecs);
//        idOfCanvasElement : the id of a <canvas> element
//               It SHOULD have height, and width attribures. It usually is empty
//                  Example: <canvas id="idOfCanvasElement" height="300" width="800"></canvas>
//               Note that the graphing area is a portion of this area -- margins are used to display axises and labels
//                   The default margins are:  top: 40, left: 75, right: 0, bottom: 75  (in pixels)
//        dataSpecs: an object specifying graph specifications, and the data.
//
// returns:
//         [statusMessage,chartSpecs,xRange,yRange]
//   Or
//       [errormessage] if a fatal error (an alert will be used with an error message before return)
//   where:
//       statusMessage: a message describing disposition of points (#, #drawn, # bad Y value, #x out of range #Y out of range, # badx , # bad X and Y values
//       chartSpecs: canvas objects and lookup tables used by mouse clicks. This can be included in dataSpecs if you do multiple calls (to overlay graphs) in a row
//


var wsCanvasChart = function () {

    var ctx;
    var xPosOld,xInc,nXmarks,ignoreBad,badObs=[],xTics=[];

    var minGridLineSep=12;
    var margin = { top: 40, left: 75, bottom: 75  ,right: 20  };      // indent or graph (leave room for axis labels)
    var chartHeight, chartWidth, xMaxPx, data, chartBounds,createHitInfo;
    var maxYValue,minYValue,yGridLinesPx,yGridLinesColor,gridLineSpecs,maxXValue,minXValue,maxYValue2,minYValue2,yAxisRight ;
    var refLinesY,refLinesX ;
    var selectFunc=false ;
    var data ;
    var dataPointTextColor,dataPointSize,dataPointType,dataPointTextFont,labelFont,axisTicFont,axisTicColors,dataPointColor,dataPointTextForce;
    var barColor,barWidth='',barWidthAuto=0,barSide='C',titleFont,lineColor,lineWidth,isDotted;
    var dataPointBorder,filledBorderColor,filledBorderWidth; ;
    var dataPointTextOffsetX,dataPointTextOffsetY,gCompositeOperation,backgroundColor ,dataPointTextFill,dataPointTextAlign    ;
    var emphasisSize,emphasisBorder,emphasisColor ;

    var xValsOk=1;
    var clickFunc,noClickfunc;
    var canvas ;
    var chartKey={} ;
    var ratio = 0;
    var chartDisplay=4;   // -2:nothing, -11: yaxis only, -1: main title only, 0 everything but data, 1 data only, 2 : 1 +  x and y axises,  3: 2 +   title +  x and y tics & gridlines , 4: 3+ xais labels (iow: everything)
    var chartDisplay_noTicLabels=0 ;  // used if chartDisplay=0 or > 2:  if 1, do NOT display the x axis tic labels or the y axis horizGrid line labels
    var chartDisplay_showTitle=0;  //  used if chartDisplay= 1 or 2. If 1, display the title (whiting out area before writing)
    var clearAll=1;
    var clearChart=0;
    var   xRangeReturn=[],yRangeReturn=[],gotYrange2=0;

    var renderType = { lines: 'lines', points: 'points',textValues:'textValues',bars:'bars',line:'lines',point:'points',text:'textValues',bar:'bars'}; // not use of synonyms
    var yPrec,xPrec ;    // dmh addition
    var chartAreaHeightPx,chartAreaHeightValues,chartAreaHeightValues2,xCategory=1, xMinUse,xMaxUse,yMinUse,yMaxUse,yMinUse2,yMaxUse2  ;
    var pointsDone=[],linesDone=[],barsDone=[];
    var canvasTest,testctx ;
    var okDataPointTypes={'NONE':1,
                  'CIRCLE':1,'CIRCLEFULL':1,'CIRCLEGRADIENT':1,'CIRCLEPLUS':1,'CIRCLEBAR':1,
                 'SQUARE':1,'SQUAREFULL':1,'SQUAREGRADIENT':1,'SQUAREPLUS':1,
                 'TRIANGLE':1,'TRIANGLEFULL':1,'TRIANGLEGRADIENT':1,'+':1,'X':1,'_':1,'|':1,'/':1,'CHECK':1,'HAT':1,'\\':1,
                 '..':1,'--':1,'.-':1,'-.':1,
                 'DIAMOND':1,'DIAMONDPLUS':1,'DIAMONDFULL':1,'DIAMONDBAR':1,'TRIANGLEU':1,'TRIANGLEFULLU':1,'TRIANGLEBAR':1,
                 'ARROWUP':1,'ARROWRIGHT':1,'ARROWDOWN':1,'ARROWLEFT':1,'ARROWNE':1,'ARROWSE':1,'ARROWNW':1,'ARROWSW':1} ;

    var dataPointAbbrev={'N':'NONE',
                           'C':'CIRCLE','CF':'CIRCLEFULL','CG':'CIRCLEGRADIENT','CP':'CIRCLEPLUS','CB':'CIRCLEBAR',
                             'S':'SQUARE','SF':'SQUAREFULL','SG':'SQUAREGRADIENT','SP':'SQUAREPLUS',
                             'T':'TRIANGLE','TF':'TRIANGLEFULL','TG':'TRIANGLEGRADIENT','TU':'TRIANGLEU','TD':'TRIANGLEFULLU','TB':'TRIANGLEBAR',
                             'D':'DIAMOND','DF':'DIAMONDFULL','DP':'DIAMONDPLUS','DB':'DIAMONDBAR' ,'DI':'DIAMOND',
                             'CH':'CHECK','HA':'HAT','HO':'_','VE':'|','FS':'/','BS':'\\',
                             'AU':'ARROWUP','AR':'ARROWRIGHT','AD':'ARROWDOWN','AL':'ARROWLEFT',
                             'ASE':'ARROWSE','ASW':'ARROWSW','ANE':'ARROWNE','ANW':'ARROWNW'
                              };

    var renderTrace=[0,null,otherInfo=''];

    var debugMode=0;

// ==================================================
// ... this is the public facing function. Sets locally global variables, etc.

    var render = function(canvasId, dataObj,otherInfo0) {         // :::::::::::::::::;;   the main function
       if (arguments.length<3) otherInfo=null ;
       otherInfo=otherInfo0 ;
       renderTrace[0]++;
       renderTrace[1]=otherInfo   ;

       var t1,t2,oo1,astat,xRange='',i,tmp1;
       var tt,vv,vv2,a1,iv,yRange,yRange2,isDotted0;           // yMinUse and yMaxUse are used (yRange is just a holding variable). yRange2 is similar
       var chartStatus={};
       var stats,astat,plotNum,dataPointTextOffset,gotYrange=0;
       var clickFunc='' ;
       var errs='' ;

       badObs=[];

       data=dataObj;  ; // kind of pointless

       labelFont = (data.labelFont != null) ? data.labelFont : '14pt Arial';       // x & y axis labels
       titleFont = (data.titleFont != null) ? data.titleFont : '20pt Arial';      // main title
       axisTicFont = (data.axisTicFont != null) ? data.axisTicFont : labelFont;
       axisTicColors = (data.axisTicColors!== null) ? data.axisTicColors : '';
       axisTicColors=splitCsv(axisTicColors+',black,black,black');  // note use of black as default

       canvas = document.getElementById(canvasId);       // setup the canvas ... note that 0,0 is upper left corner
       if (canvas==null)  errs+=' ;  no such canvas (with ID= '+canvasId+')' ;

       if (typeof(data.debugMode)!=='undefined') debugMode=data.debugMode ;

       if (debugMode==1) alert('render: '+otherInfo+': STARTING ');

       ignoreBad = (data.ignoreBad != null) ? data.ignoreBad :0 ;
       skipYout = (data.skipYout != null) ? data.skipYout :0 ;        // if 0, draw out of range y values lightly. If 1, skip them

       if (!data.hasOwnProperty('chartKey') || data['chartKey']=='0') {
           data['chartKey']={'show':0};  // flat for no key
       } else {
           if (typeof(data['chartKey'])!='object') {
               errs+=' ; chartKey specified, but not an object  ';
           } else {
               if (!data['chartKey'].hasOwnProperty('show')) data['chartKey']['show']=0;    // show not specified, then do NOT show
           }
       }

       noClickfunc=1;
       if (typeof(data.clickFunc)!=='undefined') {
            clickFunc=data.clickFunc;  // mouseover funciton
            if (clickFunc=='' || clickFunc=='0') {
               noClickfunc=1;
            } else {
               if (typeof(clickFunc)!='function') {
                   errs+=';  clickFunc function does not exist '
               } else {
                  noClickfunc=0;                 // exists! so do NOT suppress its assignment as a click handler
               }
            }       // data.clickfunc non empty
       }             // data.clickfunc exits


       var mgorder=['top','left','bottom','right'], mcheck={'top':0,'left':0,'right':0,'bottom':0},aa,aa2;
       if (typeof(data.chartMargin)!=='undefined') {
           if (typeof(data.chartMargin)!='string')  {       // an array or object -- check for top left bottom right attribues
              for (aa in data.chartMargin)  {
                  aa2=jQuery.trim(aa).toLowerCase();
                  if (typeof(mcheck[aa2])!=='undefined' && !isNaN(data.chartMargin[aa])) {
                      mcheck[aa2]++;
                      margin[aa2]=data.chartMargin[aa] ; // force error
                  }  // mcheck[aa2] defiuned
              }
              for (aa in mcheck) {
                    if (mcheck[aa]!=1) errs+='; Margin specifcation error ('+aa+') not specified or improperly specified)';
              }

          } else  {         // parse csv

             t1=jQuery.trim(data.chartMargin) ;
             if (t1!='') {
                t2=splitCsv(t1);
                if (t2.length<4) {
                   errs+='; Incorrect margin specification (there must be 4 -- top, left, right,bottom -- elements in a CSV): '+t1;
               } else {
                   for (i=0;i<4;i++) {
                     if (isNaN(jQuery.trim(t2[i]))) {
                         errs+=' ; Non-numeric value in margins: '+t1;
                     }
                     if (errs=='') {
                         margin[mgorder[i]]=parseInt(t2[i]);
                     }
                   }       // for
               }       // else
             }   // T1!=''
          }            // chartMargin   string
       }       // data.chartmargin exists

       yPrec=0; yGridLinesPx=30;yGridLinesColor='#E8E8E8'; yAxisRight=0;
       refLinesY=[];refLinesX=[];

       gridLineSpecs='';chartDisplay=4; clearChart=0;clearAll=1;chartDisplay_noTicLabels=0;chartDisplay_showTitle=0;        // reset globals on each call to .render
       gCompositeOperation='source-over';createHitInfo=1;

       let achartSpecs=false;
       if (data.hasOwnProperty('chartSpecs')  ) {                          // extract and validate chartSpecs
            achartSpecs=data.chartSpecs ;
            if (achartSpecs==0 || achartSpecs===false || achartSpecs=='' ) {
                achartSpecs=false;
            } else {
               if ($.isArray(achartSpecs) && achartSpecs.length>1 ) achartSpecs=data.chartSpecs[1];  // special case (if the results of a prior call to render are used as is)
                if (typeof(achartSpecs)!='object')  {
                   alert('wsCanvasChart error: chartSpecs must be an object (perhaps an array was used, but [1] was not a proper chartSpecs object)');
                   return 0;
                }
                if (!achartSpecs.hasOwnProperty('plotNum')) {
                   alert('wsCanvasChart error: chartSpecs must be an object with a plotNum attribute.');
                   return 0;
                }
            }   // achartSpecs not 0 or ''
        }
        data.chartSpecs=achartSpecs;

        if (typeof(data.yPrec)!=='undefined') yPrec=data.yPrec;
        if (typeof(data.yGridLinesPx)!=='undefined') yGridLinesPx=data.yGridLinesPx;
        if (typeof(data.yGridLinesColor)!=='undefined') yGridLinesColor=data.yGridLinesColor;
        if (typeof(data.yAxisRight)!=='undefined') yAxisRight=data.yAxisRight;

        if (typeof(data.gridLineSpecs)!=='undefined') gridLineSpecs=jQuery.trim(data.gridLineSpecs);  //         one of yGridLinesPx or gridLineSpecs is used
        if (typeof(data.gridLineSpecs)!=='undefined') gridLineSpecs=jQuery.trim(data.gridLineSpecs);  //         one of yGridLinesPx or gridLineSpecs is used
        if (typeof(data.globalCompositeOperation)!=='undefined') gCompositeOperation=jQuery.trim(data.globalCompositeOperation);

        if (typeof(data.refLinesX)!=='undefined') refLinesX=jQuery.trim(data.refLinesX);
        if (typeof(data.refLinesY)!=='undefined') refLinesY=jQuery.trim(data.refLinesY);
        refLinesX=readRefLines(refLinesX);  // return an array to work with  [xloc,color,dotPattern)
        refLinesY=readRefLines(refLinesY);  // return an array to work with


        if (typeof(data.createHitInfo)!=='undefined') createHitInfo=jQuery.trim(data.createHitInfo);

        backgroundColor='';                             // '' means uses the default gradient
        if (typeof(data.backgroundColor)!=='undefined') backgroundColor=jQuery.trim(data.backgroundColor);

       if (typeof(data.chartDisplay)!=='undefined') chartDisplay=jQuery.trim(data.chartDisplay);    // -2:nothing, -1: main title only, 0 everything but data, 1 data only, 2 : 1 +  x and y axises,  3: 2 +   title +  x and y tics & gridlines , 4: 3+ xais labels (iow: everything)
        if (chartDisplay=='' || isNaN(chartDisplay)) chartDisplay=4;
        chartDisplay=parseInt(chartDisplay); //
        if (chartDisplay!=-2  && chartDisplay!=-1   && chartDisplay!=-11 && chartDisplay!=0 && chartDisplay!=1 && chartDisplay!=2 && chartDisplay!=3) chartDisplay=4;

       tmp1=0;
       if (typeof(data.chartDisplay_noTicLabels)!=='undefined') tmp1=jQuery.trim(data.chartDisplay_noTicLabels);    // 1 to suppress tic labels if chartDisplay=0 or > 2
       if (tmp1=='1') chartDisplay_noTicLabels=1;           // anything but '1'  is 0
       tmp1=0;
       if (typeof(data.chartDisplay_showTitle)!=='undefined') tmp1=jQuery.trim(data.chartDisplay_showTitle);    // 1 to suppress tic labels if chartDisplay=0 or > 2
       if (tmp1=='1') chartDisplay_showTitle=1;           // anything but '1' or '2'   is 0
       if (tmp1=='2') chartDisplay_showTitle=2;


       if (typeof(data.clearAll)!=='undefined') clearAll=jQuery.trim(data.clearAll);  // 1 means "clear canvas". 0: draw on top.

       if (typeof(data.clearChart)!=='undefined') clearChart=jQuery.trim(data.clearChart);  // 1 means "clear chart". 0: do not clear chart

       if (typeof(data.selectFunc)!=='undefined') selectFunc= data.selectFunc ;  // 1 means "clear chart". 0: do not clear chart
       if (selectFunc!==false) {
           if  (!$.isFunction(selectFunc)) {
               if (typeof(selectFunc)=='string' || selectFunc==0  ) {
                   selectFunc=$.trim(selectFunc);
                   if (selectFunc=='' || selectFunc=='0') {
                       selectFunc=false;
                   } else {
                      let atest=window[selectFunc];
                      if ($.isFunction(atest)) {
                        selectFunc=atest;
                     } else {
                        selectFunc=false;
                        alert('wsCanvasChart warning: selection function ('+data.selectFunc+') does not exist. Selections will not be attempted');
                     }
                   }    // not ''
               }   else {  // selectFunc not a function and not a string.
                   alert('wsCanvasChart warning: selection function ('+data.selectFunc+') not specified correctly. Selections will not be attempted');
                   selectFunc=false;
              }
          }   // not a passed function
      }     // something passed as selectFunc


       dataPointSize=18 ; // the default
       if (typeof(data.dataPointHeight)!=='undefined') {         // synonyms: height trumps width trumps size
           dataPointSize=data.dataPointHeight;
       } else if (typeof(data.dataPointWidth)!=='undefined') {
           dataPointSize=data.dataPointWidth;
       } else if (typeof(data.dataPointSize)!=='undefined') {
           dataPointSize =data.dataPointSize ;
       }
       if (isNaN(dataPointSize)) dataPointSize=8;
       dataPointBorder = (data.dataPointBorder != null) ? data.dataPointBorder : '1';
         if (isNaN(dataPointBorder)) dataPointBorder=1;

       dataPointType = (data.dataPointType != null) ? data.dataPointType : 'CIRCLEGRADIENT';

       dataPointType=jQuery.trim(dataPointType).toUpperCase();
       if (typeof(okDataPointTypes[dataPointType])=='undefined') {    // not full name. PErhaps abbrev?
          dataPointType= (dataPointAbbrev.hasOwnProperty(dataPointType)) ? dataPointAbbrev[dataPointType] : 'CIRCLEGRADIENT' ; // default if no match
       }

       filledBorderColor = (data.filledBorderColor != null) ? data.filledBorderColor : '#fff';
       filledBorderColor=jQuery.trim(filledBorderColor);
       if (filledBorderColor=='') filledBorderColor='#fff';

       filledBorderWidth = (data.filledBorderWidth != null) ? data.filledBorderWidth : 0 ;
       if (isNaN(filledBorderWidth) || jQuery.trim(filledBorderWidth)=='') filledBorderWidth=0;
       filledBorderWidth=parseInt(filledBorderWidth);
       if (filledBorderWidth<0) filledBorderWidth=0;


       emphasisSize = (typeof(data.emphasisSize)!='undefined' ) ? data.emphasisSize : 0 ;
       if (isNaN(emphasisSize) || jQuery.trim(emphasisSize)=='') emphasisSize=0;
       emphasisSize=parseInt(emphasisSize);
       if (emphasisSize<0) emphasisSize=0;

       emphasisBorder = (data.emphasisBorder != null) ? data.emphasisBorder : 1 ;
       if (isNaN(emphasisBorder) || jQuery.trim(emphasisBorder)=='') emphasisBorder=1;
       emphasisBorder=parseInt(emphasisBorder);
       if (emphasisBorder<0) emphasisBorder=1 ;

       emphasisColor = (data.emphasisColor != null) ? data.emphasisColor : 'gold' ;
       if (jQuery.trim(emphasisColor)=='') emphasisColor='gold';


       dataPointColor = (data.dataPointColor != null) ? jQuery.trim(data.dataPointColor) : 'Green';
       dataPointColor=jQuery.trim(dataPointColor);
       if (dataPointColor=='') dataPointColor='black';

       lineColor = (data.lineColor != null) ? jQuery.trim(data.lineColor) : 'black';
         if (lineColor=='') lineColor='black';
       lineWidth = (data.lineWidth != null) ? data.lineWidth : 2;
          if (isNaN(lineWidth) || lineWidth<1) lineWidth=2;
          lineWidth=Math.trunc(lineWidth);
       isDotted0 = (data.lineDotted != null) ? data.lineDotted : '0';
         isDotted=makeDotted(isDotted0);

       let okAligns={'LEFT':'left' ,'END':'end','START':'start','CENTER':'center','RIGHT':'right'};

       barColor = (data.barColor != null &&  jQuery.trim(data.barColor)!='') ? data.barColor : 'rgba(20,255,20,0.4)';
       barWidth = (data.barWidth != null &&  jQuery.trim(data.barWidth)!='') ? data.barWidth : 'A' ;
       fixBarWidth()  ; // sets barWidth and barSide and barWidthAuto

       dataPointTextFont = (data.dataPointTextFont != null) ? data.dataPointTextFont : '10pt Arial';
       dataPointTextFill = (data.dataPointTextFill != null) ? data.dataPointTextFill : 1 ;

       dataPointTextAlign = (data.dataPointTextAlign != null) ? data.dataPointTextAlign : 'center'  ;  // start end lieft center right
       let dd=jQuery.trim(dataPointTextAlign).toUpperCase() ;
       dataPointTextAlign= (typeof(okAligns[dd])!=='undefined') ? okAligns[dd] : 'left ';

       dataPointTextColor = (data.dataPointTextColor != null  && jQuery.trim(data.dataPointTextColor)!='') ? jQuery.trim(data.dataPointTextColor) : '#766767';

       dataPointTextOffset = (data.dataPointTextOffset != null) ? jQuery.trim(data.dataPointTextOffset) : '-5,16';
       dataPointTextOffsetX=-5;      dataPointTextOffsetY=16;
       if (dataPointTextOffset!='') {
           vv=splitCsv(dataPointTextOffset);
           if (!isNaN(jQuery.trim(vv[0]))) dataPointTextOffsetX=parseInt(vv[0]);
           if (vv.length>1 && !isNaN(jQuery.trim(vv[1])))  dataPointTextOffsetY=parseInt(vv[1]);
        }

        dataPointTextForce= (data.dataPointTextOffset != null) ? jQuery.trim(data.dataPointTextForce) : 0 ;

// xRange (or xCategory)
       xCategory=1;                       // by default (if xRange is NOT specified): x values are just category names
       if (typeof(data.xRange)!=='undefined') {
           xRange=jQuery.trim(data.xRange);     // a string that MUST have at least one comma! Otherwise, it is ignored

           oo1=xRange.split(',');
           nXmarks=-1;     // assume xtic at all x values
           xTics=[];   xPrec=yPrec;

           if (oo1.length>1) {                   // if not 'min,max' format (min or max can be ''), ignore
              t1=jQuery.trim(oo1[0]);
              t2=jQuery.trim(oo1[1]);
              if (t1=='' || !isNaN(t1)) {
                  if (t2=='' || !isNaN(t2)) {   // any error in specifying min max means -- treat as category
                     xCategory=0;         // x values are numeric values and should be plotted as such
                     xMinUse=t1;
                     xMaxUse=t2;
                  }      //t2
              }     // t1
              if (xCategory==0 && oo1.length>2  && jQuery.trim(oo1[2])!=''  ) {         // valid xmin and max, and non empty tic mark specs
                 t1=jQuery.trim(oo1[2]);
                 if (t1.substr(0,1)!=='@')  {     // specify #xtics
                       nXmarks= (isNaN(t1)) ? -1 : Math.max(-1,parseInt(t1)) ;
                } else {                    //  @ ...
                     t3=splitCsv(t1);
                     if (t3.length>1) {      // something after the @
                         xPrec=jQuery.trim(t3[0]).substr(2);
                         if (xPrec==='' || isNaN(xPrec))xPrec=yPrec;
                         if (!isNan(xPrec)) xPrec=parseInt(xPrec);

                         nXmarks=0;
                         for (i=1;i<t3.length;i++) {
                            t2=jQuery.trim(t3[i]) ;
                            if (isNaN(t2)) {
                                  nXmarks=-1;
                                  xTics=[];
                                  break;
                            }
                            nXmarks++;
                            xTics.push(parseFloat(t2));
                         }    //  i <t3.length
                     }     // t3.length>1
                 }        // @ ...
              }
           }   //oo1 -- a valid xRange

        }             // xRange     .. note that nXmarks=-1 has special meaning

        if (chartDisplay!=-2 &&  chartDisplay!=-11 && xCategory==1) nXmarks=data.dataPoints.length ;     // show x axis tics and text for all categories

        if (chartDisplay!=-2 &&  typeof(data.yRange)!=='undefined') {
            gotYrange=1;
            yMinUse=''; yMaxUse='';
            vv=jQuery.trim(data.yRange)+','  ;   // ymin,ymax (if '', use defaults). Add ',' if just ymin specified
            vv2=vv.split(',');
            tt=jQuery.trim(vv2[0]);
            if (tt!=='' && !isNaN(tt)) yMinUse=parseFloat(tt);
            tt=jQuery.trim(vv2[1]);
            if (tt!=='' && !isNaN(tt)) yMaxUse=parseFloat(tt);
        }

        if (chartDisplay!=-2 &&  typeof(data.yRange2)!=='undefined') {
            vv=jQuery.trim(data.yRange2) ;
             vv2=vv.split(',');
            if (vv2.length>1) {           // first 2 elements are requredi
               yMinUse2=null; yMaxUse2=null;
               tt=jQuery.trim(vv2[0]);
               if (tt!=='' && !isNaN(tt)) yMinUse2=parseFloat(tt);
               tt=jQuery.trim(vv2[1]);
               if (tt!=='' && !isNaN(tt)) yMaxUse2=parseFloat(tt);
               if (yMinUse2!==null && yMaxUse2!==null && yMaxUse2>yMinUse2) {
                   chartAreaHeightValues2=yMaxUse2-yMinUse2 ;               //  global used in renderPxToYval2
                   gotYrange2=1;
               }
           }
        }

/// DONE reading parametsrs ........... if chart display not suppressed, check stuff

       if (chartDisplay!=-2 && chartDisplay!=-11) {
          fixDataSpecs() ;        //  Case insenstive fix up of data.dataPoints. And assign point by point type, point linecolor, linesize, point color, point size, and text color (uses defaults if not alreay assigned)
 
          astat=getMaxDataValue();      // get x and y min and max, and bad obs values 1,10, and 11
          if (astat!=='') errs+= astat ;           // a fatal error (bad x if ignoreBad=0, or a point with NO x or NO y field

          if (xCategory==0)  {            // update x range ... (but NOT if categorical)
             if (xMinUse==='') xMinUse=minXValue ;
             if (xMaxUse==='') xMaxUse=maxXValue ;
          }

          if (gotYrange==0) {              // no specified y range. Use min and max of observed Y
              yMaxUse =  maxYValue;
              yMinUse = minYValue;
          }  else {
             if (yMinUse==='') yMinUse=minYValue ;    // specified y range is "empty". Use min or max of obserged by
             if (yMaxUse==='') yMaxUse=maxYValue ;
          }               // note: for 2nd y axis, Defaults are NOT allowed. Either it is fully specified, or it is not displayed

          if (xCategory==0) {
             xMaxUse=parseFloat(xMaxUse);    xMinUse=parseFloat(xMinUse);
             if (xMinUse>=xMaxUse) errs+=' ; xMin ('+xMinUse+') is greater than xMax ('+xMaxUse+') ' ;
             xRangeReturn=[xMinUse,xMaxUse,0];  // [2] may be filled in if axis is drawn
          }
          yMaxUse=parseFloat(yMaxUse);    yMinUse=parseFloat(yMinUse);
          if (yMinUse>yMaxUse) errs+=' ; yMin ('+yMinUse+') is greater than yMax ('+yMaxUse+') ';

          yRangeReturn=[yMinUse,yMaxUse,0];  // [2] may be filled in if axis is drawn
       }   // chartdisplay >-11

       if (errs!=='') {         // Fatal errors? Alert them? Return them.
             if (ignoreBad!=1) return ['wsCanvasChart.render errors: '+errs];
       }

// no fatal erorrs .. proces the data a bit  -- which datapoints are bad (unreadable x & y values, or outside of range)

       if (chartDisplay!=-2 && chartDisplay!=-11)  findBadObs() ;         //  for codes 20,30, and 31

// get ready to draw to canvas..

       if (clearAll==1) {
             clearChart=0;   // no need to do this
            canvas.width = canvas.width;  // clear the whole canvas     https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
            if (debugMode==1) alert('render: '+otherInfo+' : canvas cleared ');
       }

// ratio to convert y (in values space) to yPx (in chart pixel space)
//      a y value  is displayed at  margin.top+ (yMinUse-point.y)*ratio ;
//
// xMaxPx,chartAreaHeightPx is the width and height of the charting Area -- whsere datapoints are to be drawn
        chartHeight = canvas.getAttribute('height');
        chartWidth = canvas.getAttribute('width');
        chartAreaHeightPx=chartHeight-(margin.top + margin.bottom); ; // do not write in margins
        chartAreaHeightValues=yMaxUse-yMinUse ;               // suppress display if y outside this range

        ratio=chartAreaHeightPx/chartAreaHeightValues ;

        xMaxPx = chartWidth - (margin.left + margin.right);        // width of graph area (in pixels)

       chartBounds=[margin.left,margin.top, xMaxPx+margin.left, chartAreaHeightPx+margin.top];     // save for global use

        xInc= getXInc();

        ctx = canvas.getContext("2d");

        renderChart();     // This does the work or writing stuff to the canvas (titles, axis, points, lines, bars, and text ....

// create a status report , and information to include in event handler, and to return to caller  ...

//badObs flags: 0=ok, 1=bad Y, 10=bad x, 11=bad x and y .  20=out of x range , 30 = out of y range, 31=y off graph      (X is NOT checked if xCategory=1)
        var stats={0:0,1:0,10:0,11:0,20:0,30:0,31:0};
        var statsSay={};
        statsSay['nPoints']=badObs.length;
        var statNames={0:'ok',1:'bad Y',10:'bad X',11:'bad X and Y',20:'X out of range',30:'Y out of range',31:'Y off chart'};
        for (i=0;i<badObs.length;i++) {
            astat=badObs[i];
            stats[astat]++;
        }
        for (i in statNames) statsSay[statNames[i]]=stats[i];

// return some useful info
        let evtData={} ;

        evtData['plotMinY']=yMinUse;     // used to convert mouse click to y value
        evtData['plotMaxY']=yMaxUse;     // used to convert mouse click to y value
        evtData['plotYinc']=chartAreaHeightValues/chartAreaHeightPx ;

        evtData['plotMinX']=xMinUse;     // used to convert mouse click to y value
        evtData['plotMaxX']=xMaxUse;     // used to convert mouse click to y value
        evtData['plotXinc']=1/xInc ;         // cvt pixel to value

        evtData['chartBounds']=[];
        for (i in   chartBounds  ) evtData['chartBounds'][i]=chartBounds[i];

        evtData['xCategory']=xCategory ;

// -- i, and iPrior, points to dataPoints ;
// 1 pointsDone: dataPoint id, x ploc, y ploc, circle radius in px
// 2 linesDone:  dataPoint id (vertext 1), x ploc, y ploc, dataPoint id (vertex 2), x ploc, y ploc
// 3 barsDone :  dataPoint id , upper left x ploc, upper left y ploc, width, height

       evtData['barsDone']=JSON.parse(JSON.stringify(barsDone)) ;    // local copy
       evtData['linesDone']=JSON.parse(JSON.stringify(linesDone)) ;
       evtData['pointsDone']=JSON.parse(JSON.stringify(pointsDone));


// create a lookup image for image just creatd, plus prior image if provided in data.chartSpecs above
//chartSpecs fields:
//  plotNum
//  width  (of charting area, not including margins)
//  height:
//  hitInfo, an object with fields
//     image
//        data : Uint8ClampedArray array (of pixel values
//        width: should be same as above
//        height: should be same as above
//     retTime
//     colorHash

     let hitInfo,colorHash;

// createHitInfo=0 will clear the "hitInfo" component of chartSepcs
     if (clearAll==1 || typeof(data['chartSpecs'])!='object' || typeof(data['chartSpecs']['plotNum'])=='undefined' || createHitInfo==0) {
        plotNum=1;
        hitInfo={'image':{},'retTime':0};  // intialize hitInfo (even it not really used due to createHitInfo=0)
        let tt={'ncolors':0,'hashTable':{}};                                                  //  used to match click to drawn object
        hitInfo['colorHash']=tt;
       if (debugMode==1) alert('render: '+otherInfo+':  chartspecs does not exist (clearall='+clearAll+', createHitInfo='+createHitInfo+'). Creating ');

     } else {    // create hitInfo ... use prior?
         plotNum= data['chartSpecs']['plotNum']+1;
         hitInfo=JSON.parse(JSON.stringify(data['chartSpecs']['hitInfo']));   // create a copy of colorHash, etc .. including "simpliofied" verson of image data
         if (debugMode==1) {
            alert('render: '+otherInfo+': chartspecs exists -- it will be added to. Current colorhash length  = '+hitInfo['colorHash']['ncolors']);
         }
     }


// recreate chartspecs ..

    chartSpecs={'plotNum':plotNum,'width':xMaxPx,'height':chartAreaHeightPx} ; // width and height are redundant with same fields in hitInfo
    chartSpecs['hitInfo']=hitInfo;      // hitinfo is modified below (if createHitInfo==1)

    let ttime=new Date().getTime();
    let hitCanvas;

    if (createHitInfo==1) {               // hitInfo used for identifying points on image click
       if (debugMode<2) {
             hitCanvas= $('<canvas height="'+chartAreaHeightPx+'" width="'+xMaxPx+'">');  // size of chart area (don't bother with labels ,etc
       } else {         // show "hitInfo plot" (if a wsurveyChartTest canvas is present"
          hitCanvas=$('#wsurveyChartDebug');  // should be same size as actual plot area
         if (hitCanvas.length==0) hitCanvas= $('<canvas height="'+chartAreaHeightPx+'" width="'+xMaxPx+'">');  // size of chart area (don't bother with labels ,etc
       }
       hitCanvas[0].width = hitCanvas[0].width;  // clear the whole canvas     https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing

       let hitCtx = hitCanvas[0].getContext('2d');                            //  used to write shape match mage

// since getImage object does NOT stringify, have to explicity extra info fromm the "simplified" image ... ... re
//https://stackoverflow.com/questions/28916923/argument-1-of-canvasrenderingcontext2d-putimagedata-does-not-implement-interface

         if (typeof(hitInfo['image'].data)!=='undefined') {
             if (hitInfo.image.data.length>0) {     // tbere is a prior "shape" image to retain
                let apic2  = hitInfo.image.data;
                var idata = hitCtx.createImageData(hitInfo['image']['width'], hitInfo['image']['height']);
                for(var i = 0; i < idata.data.length; i++) idata.data[i] = apic2[i];
                hitCtx.putImageData(idata,0,0);  // "populate" image with  prior "shape identifying" image
             }
         }

// add shapes to the "hitImage" -- that may have prior shapes on it already.
        render_addToChash(hitInfo,3,barsDone,data.dataPoints,plotNum,hitCtx);    // will write shapes to hitCtx, update stuff in hitInfo
        render_addToChash(hitInfo,2,linesDone,data.dataPoints,plotNum,hitCtx);    //  using special colors stored in colorHash (colorHash upated by reference)
        render_addToChash(hitInfo,1,pointsDone,data.dataPoints,plotNum,hitCtx);   // with colorHash pointing to shape info

        let  aimage=hitCtx.getImageData(0,0, xMaxPx, chartAreaHeightPx);   //hCtx will now have new pixels added by addToChash calls

         let pic=[];
         for(var i = 0; i < aimage.data.length; i++) pic.push(aimage.data[i]);    // get image data out in a simpler fashion
         chartSpecs['hitInfo']['image']={'width':xMaxPx,'height':chartAreaHeightPx,'data':pic};  // simplifed data (withouth getIMage stuff)
         chartSpecs['hitInfo']['retTime']=ttime;       // note that colorHash was updated in the render_addToChash calls (since call by referene)

    } else {
         chartSpecs['hitInfo']['image']={}; // set to empty, retTime=0 above
    }


     if (debugMode>1) {
         let oy=$('#wsurveyChartDebug2')  ;
         if (oy.length==1) {
             let oymess='<ul>'
             let atime=get_currentTime(1,0,chartSpecs.hitInfo.retTime)
             oymess+='<li>Plot# <tt> '+chartSpecs.plotNum+'</tt> @ '+atime+' :  with boundaries: '+evtData.chartBounds.join(', ');
             oymess+='<li>Size of shapeImage array: '+chartSpecs['hitInfo']['image'].data.length;
             oymess+='  (w='+chartSpecs['hitInfo']['image'].width+' h='+chartSpecs['hitInfo']['image'].height+')';
             oymess+='<li># of seperate shapes (one color per shape) : '+chartSpecs.hitInfo.colorHash.ncolors;
             oymess+='<li>This plot had: #points='+evtData.pointsDone.length+', #lines='+evtData.linesDone.length+', #bars='+evtData.barsDone.length;
             oymess+='</ul>'
            oy.html(oymess);
         }
      }

      evtData['chartSpecs']=chartSpecs ;    // For used in click handler!

/// add a mousedown /mouse up click handler?
     if (clickFunc!=='' && noClickfunc==0 && createHitInfo==1)  {       // click handler desired AND event handler exists  AND click info update not suppressed

        if (debugMode==1) alert('render: '+otherInfo+': Step completed. Initializing clickFunc with  colorHash of '+evtData.chartSpecs.hitInfo.colorHash.ncolors);
        $(canvas).off('mousedown') ;              // get rid of prior one
        $(canvas).off('mouseup') ;
        let evtData2=JSON.parse(JSON.stringify(evtData)); // this ensures that the clicks work EVEN if there are differet images drawn
         evtData2['clickFunc']= clickFunc ;
         evtData2['clickFuncPriorLoc']={};
         evtData2['clickFuncNowLoc']={};
         evtData2['clickCount']=0;

        $(canvas).on('mousedown',evtData2,canvasChartClickHander);   // data describes the current images in this canvas. eg: it is used by renderMouseXY
        $(canvas).on('mouseup',evtData2,canvasChartClickHander);

        $(canvas).css({'cursor':'crosshair'});
        $(canvas).attr('gotClick',1);
     }


// all done! Return some status, and "specs", dataa
     if (debugMode==1) alert('render '+otherInfo+': Returning. # of entries in colorHash='+chartSpecs.hitInfo.colorHash.ncolors);

     return [statsSay,chartSpecs,xRangeReturn,yRangeReturn] ;       // if createHitInfo=0, chartSpecs[retTime] will not exist


// --------------------
// internal fucntion for render -- cleanup the barWidth and barSide and barWidthAuto global variables
// barWidth is in X space. NOT IN PIXEL SPACE!

 function fixBarWidth(ii) {
    barWidthAuto=1;   // if barWidthAuto=1, barWidth is ignored (though point specific WI attribute will be used if specified)
    barSide='C';

    let bb1=$.trim(barWidth).toUpperCase();
    if (bb1===''  ) {   // default is auto at center
         barSide='C';
         barWidthAuto=1 ;
         return 1;
    }
    let bb1a=bb1.substr(0,1).toUpperCase();
    if (bb1a=='A') {                    // if A, always centered
             barSide='C';
             barWidthAuto=1 ;
             return 1;
    }

    if (bb1a=='S' || bb1a=='L') {
         barSide='S';
         barWidth=bb1.substr(1);
    } else if (bb1a=='E' || bb1a=='R') {
         barSide='E';
         barWidth=bb1.substr(1);
    } else if (bb1a=='C')  {
         barSide='C';
         barWidth=bb1.substr(1);
     } else if (bb1a=='A') {
           barSide='C';
           barWidthAuto=1 ;
           return ;         // if auto, barWidth is ignored
     }                     // if non-numeric first char is not A,C,L,S,E, or R -- barWidth is ignored (auto is used)
     if (barWidth=='' || isNaN(barWidth)) {
          barWidthAuto=1;    // can't figure it out? Use auto bar width
     } else {
         barWidthAuto=0;        // legit width (though it could be silly). Don't use auto
         barWidth=parseFloat(barWidth);    // note that center is default (if barWidth does not start with A,C,L,S,E, or R
    }
    return 1;
 }

// --------------------
// internal fucntion for render -- cleanup the refLinesY and refLinesX user parameters
// locations are in X and Y space. NOT IN PIXEL SPACE!
function  readRefLines(areflines) {

   var ido=-1,dalines=[];
   if ($.trim(areflines)=='') return dalines ;
   let arf=areflines.split(',');
   for (let ia=0;ia<arf.length;ia++) {
      let arf2=$.trim(arf[ia]);
      if (arf2=='') continue;
      let arf2v=splitCsv(arf2);
      let zadd=[];
      let zat=$.trim(arf2v[0]);
      if (isNaN(zat)) continue ; // ignore if not a number
      zadd[0]=parseFloat(zat);
      zadd[1]= (arf2v.length>1) ? $.trim(arf2v[1]) : 'black' ;
      zadd[2]=2 ; // dotted is the derfault
      let adash=(arf2v.length>2) ? $.trim(arf2v[2]).toUpperCase().substr(0,2) : 'DO' ;
      if (adash=='SO')  zadd[2]=0 ; // solid
      if (adash=='DA')  zadd[2]=10 ; // dashed
      ido++;
      dalines[ido]=zadd;
   }
   return dalines;
  }  // end of readRefLines

};   // end of render


//====================== end of render



//==========================
// ... this does the work of actually drawing stuff    .........

//   chartDisplay: -2:none, -11 y axisonly, -1: main title only, 0 everything but data, 1 data only, 2 : 1 +  x and y axises,  3: 2 +   title +  x and y tics & gridlines , 4: 3+ xais labels (iow: everything)
//    chartDisplay_noTiclabels: if 1 ,suppress tic labels (x and y axis) if chartDisplay =0 or > 2
//    chartDisplay_showTitle: if 1 or 2, show title even if chartDisplay== 1 or 2
// this calls:
//   renderBackgrond:  to clear background  -- only if chartDisplay> 1
//   renderText: Main title, and axis titles
//  renderAxisLines : x and y axis lines
//   renderLinesAndLabels: axis line and tic marks/tic mark labels
//   renderData: lines, shapes, basrs, and text for the dataPoints
//   renderRefLines: x and y reference lines

  var renderChart = function () {     // ::::::::::::::::::::::::::::::::: display stuff (called by render )  :::::::::::::::::::
     pointsDone=[]; linesDone=[]; barsDone=[];       // intialize some globals

     if (clearChart==1 || clearAll==1) {
        let margs=[margin.left, margin.top, xMaxPx + margin.left- margin.right, chartHeight-(margin.top+margin.bottom)];
        renderBackground(backgroundColor,margs);     // will overwrite existing stuff -- with a plain color, or a gradient using an array of colors
     }

    if (chartDisplay!==-2) {           //  not "no display"

       if (chartDisplay!==1) {           //  not data only

          if (chartDisplay==0 || chartDisplay==-11 ||  chartDisplay>1) renderAxisLines(chartDisplay);
          if (chartDisplay==0 || chartDisplay==-11 ||  chartDisplay>2)  {
              renderLinesAndLabels(chartDisplay_noTicLabels,chartDisplay);
          }
          renderText(chartDisplay,chartDisplay_showTitle);            // main title, and/or x & y axis labels
       }

       if (chartDisplay>0) {            //display the data ponts, based upon type of renderType(s) that client supplies. INcluding refLines
          if (chartDisplay_showTitle!=0)    renderText(1,chartDisplay_showTitle); // force title
          if (data.renderTypes == undefined || data.renderTypes == null) data.renderTypes = [renderType.lines];     // default is line only
          if (!jQuery.isArray(data.renderTypes )) data.renderTypes = [data.renderTypes]; //  a hack used in next step...
          for (var i = 0; i < data.renderTypes.length; i++) {   // types are: line connecting points, dots or other shapes at points, text values at points, horizontal bars at ponts
              renderData(data.renderTypes[i]);
          }
          if (refLinesX.length>0) renderRefLines(refLinesX,0);
          if (refLinesY.length>0) renderRefLines(refLinesY,1);
       }
    }
    if (data['chartKey']['show']!=0) {  // key display is independent of chart display
           renderKey(1);
     }

  };    ///-------------- end of renderChart()  --------



// =================== ====================
// the key
//     chartBounds=[margin.left,margin.top, xMaxPx+margin.left, chartAreaHeightPx+margin.top];     // save for global use
// chartHeight, chartWidth (canvas dimensions
  var  renderKey=function(ii) {

      var topAt,leftAt,aText,rightAt,pt,topAdd,lcolor,ldotted ;

     let kk=data['chartKey'];

// find the area of the key box
     let wdef=chartWidth-5, hdef=chartHeight-10;
     let defMargins={'left':chartBounds[2]+1,'top':10,'right':wdef,'bottom':hdef} ;
     if (kk.hasOwnProperty('margins')){            // specified? If so, overwrite defaults
       defMargins=$.map(defMargins,function(vv,ii) {
          if (kk['margins'].hasOwnProperty(ii)  ) {
              return kk['margins'][ii];
          } else {
             return vv;
          }
       });
     }          // margins
 
     let keyLeft=defMargins[0],keyTop=defMargins[1],keyRight=defMargins[2],keyBottom=defMargins[3];  // easir to work with scalars...
     if (keyRight<keyLeft) keyRight=wdef ;   // goofy, just use right edge
     if (keyBottom<keyTop) keyBottom=hdef;     // goofy, just use bottom edge
     let keyWidth=keyRight-keyLeft;            // actual width
     let keyHeight=keyBottom-keyTop;           // actual height

     let keybackgroundColor= (kk.hasOwnProperty('backgroundColor')) ? kk['backgroundColor'] : '';   // if not specifid, use whitish gradient default

     let keyGlobalCompositeOperation=(kk.hasOwnProperty('globalCompositeOperation')) ? kk['globalCompositeOperation'] : 'source-over';   // if not specifid, use whitish gradient default

     let keyOpacity=(kk.hasOwnProperty('opacity')) ? kk['opacity'] : '1.0';   // if not specifid, use whitish gradient default

     ctx.setLineDash([]);

// for background: damargs=[left,top,right,bottom[
   ctx.globalCompositeOperation =keyGlobalCompositeOperation ;
   ctx.globalAlpha =keyOpacity;

     renderBackground(keybackgroundColor,[keyLeft,keyTop,keyRight,keyBottom]);

// border around keybox?
     let keyborderColor= (kk.hasOwnProperty('borderColor')) ? kk['borderColor'] : 'black';   // if not specifid, use black
     if ($.trim(keyborderColor)!=='') {
         ctx.strokeStyle =keyborderColor;
         ctx.lineWidth = 1;
         ctx.beginPath();
         ctx.rect(keyLeft,keyTop,keyWidth,keyHeight) ;
         ctx.closePath();
         ctx.stroke();
     }

     let keyTitle=(kk.hasOwnProperty('title')) ? kk['title'] : 'Key';
     let keyTitleFont =(kk.hasOwnProperty('titleFont')) ? kk['titleFont'] : '14pt Arial';

// get key-title font and color
     let titleColor=(kk.hasOwnProperty('titleColor')) ? kk['titleColor'] : 'black';
     ctx.font = keyTitleFont;
     ctx.textAlign = "center";
     ctx.textBaseline = 'bottom';

     let txtSize = ctx.measureText(keyTitle);   // how far down from top?
     topAt=(txtSize.actualBoundingBoxAscent*1.5) ;

     ctx.fillStyle = titleColor;
     let keyCenter=keyLeft+ (parseInt(keyWidth/2)) ;

     ctx.fillText(keyTitle,keyCenter,keyTop+topAt);   // write the title

      topAt=topAt+2;                                  // add a seperator line
      drawLine(keyLeft,keyTop+topAt,keyRight,keyTop+topAt, 'black',1,[]);
      topAt=topAt+2;

     let keyTextFont=(kk.hasOwnProperty('textFont')) ? kk['textFont'] : '10pt Arial';       // font for "key text"
     ctx.font = keyTitleFont;

     let keyTextColor=(kk.hasOwnProperty('textColor')) ?  kk['textColor'] : 'black';  // color for key text
     keyTextColor=$.trim(keyTextColor);
     let keySymbolSize=(kk.hasOwnProperty('symbolSize')) ? parseInt(kk['symbolSize']) : 10;  // default size for key symbol

     let keyRowPad=(kk.hasOwnProperty('rowPad')) ? parseInt(kk['rowPad']) : 2;  // extra padding between kee yrows
     let keyRowSepColor=(kk.hasOwnProperty('rowLineColor')) ?  kk['rowLineColor']  : '';  // a dcotted line between key rows?
     keyRowSepColor=$.trim(keyRowSepColor);

      topAt+=keyRowPad; // padding

      let daSymbols= (kk.hasOwnProperty('symbols')) ? kk['symbols'] : [] ;  // the symbols
      let daSymbolsB= (kk.hasOwnProperty('symbolsB')) ? kk['symbolsB'] : [] ;  // the symbols

      if (!$.isArray(daSymbols)) daSymbols=[];
      let daTexts= (kk.hasOwnProperty('texts')) ? kk['texts'] : [] ; // the text messages
      if (!$.isArray(daTexts)) daTexts=[];

      nDo=Math.max(daTexts.length,daSymbols.length);   // if either symbol or text missing, skip that portion of a key row(but show other)

      leftAt=parseInt(keyLeft+(keySymbolSize/2));    // the left aligned symbol position will be adjusted (based on symbol size)
      rightAt=parseInt(keyRight-3) ; // the right algned text position
      ctx.textBaseline = 'bottom';

      for (let ii=0;ii<nDo;ii++) {      // for all texts and symbols... but skip if no such text or symbol

        let tAdd=keySymbolSize;  // start with this (downward offset)
        let daText1={};
        if (daTexts.hasOwnProperty(ii)) {
             ctx.textAlign = "right";
            if (typeof(daTexts[ii])=='object')     {        // if an object: text,font, and color fields can be specified. font and color use defaults if not specifie
                 aText= (daTexts[ii].hasOwnProperty('text')) ? daTexts[ii]['text'] : ' ';
                 let afont=(daTexts[ii].hasOwnProperty('font')) ? daTexts[ii]['font'] : keyTextFont ;
                 ctx.font =afont;
                 let astyle= (daTexts[ii].hasOwnProperty('color')) ? daTexts[ii]['color'] : keyTextColor ;
                 ctx.fillStyle =astyle;
                 daText1={'text':aText,'font':afont,'color':astyle};
             } else {
                 aText=daTexts[ii];
                 ctx.font = keyTextFont;
                 ctx.fillStyle = keyTextColor;
                 daText1={'text':aText,'font':keyTextFont,'color':keyTextColor};
             }
             let txtSize = ctx.measureText(aText);
             tAdd=Math.max(tAdd,txtSize.actualBoundingBoxAscent);
        }

        let pt0=renderKey_pt(daSymbols,ii,keySymbolSize,keyTextColor,tAdd);  // pt=0 if  DO NOT DRAW
        let tAdd0=pt0[0],pt=pt0[1];
        tAdd=Math.max(tAdd,tAdd0);

        let pt0B=renderKey_pt(daSymbolsB,ii,keySymbolSize,keyTextColor,tAdd);  // pt=0 if  DO NOT DRAW
        let tAddB=pt0B[0],ptB=pt0B[1];
        tAdd=Math.max(tAdd,tAddB);


// now draw symbol and text ... or a line, or empty space
        topAt=topAt+tAdd ;

        if (topAt>keyHeight) break ; // out of the bottom of the box ... skip

// check for "draw line" (rather than 'symbol text' )
        let didline=0;
        lcolor='black' ;
        if (pt!==0) {
           if (pt['LS']!=0) {      // draw line (instead of a shape and text)
              let lwidth=pt['LS'], lcolor=pt['LC'];
              if ($.trim(pt['LD'])=='') {
                  ldotted=[];
              } else {
                  ldotted=$.trim(pt['LD']).split(',');
                  ldotted=$.map(ldotted,function(vv,ii) { return Math.max(1,parseInt(vv)) } ) ;
              }
              drawLine(keyLeft,keyTop+topAt-(keySymbolSize/2),keyRight,keyTop+topAt-(keySymbolSize/2), lcolor,lwidth,ldotted);
              didline=1;
           } else {               // draw a shape (left end of the row
              renderPointShape(pt,leftAt+pt['PS'],keyTop+topAt-(pt['PS']*0.5));
              lcolor=pt['PC'];
           }
         }    // gotsym

        if ( ptB!==0 && didline==0) {  // 2nd symbol?
           if (ptB['LS']==0) {      // draw line (instead of a shape and text)
              renderPointShape(ptB,leftAt+pt['PS']+4+ptB['PS'],keyTop+topAt-(ptB['PS']*0.5));
           }
         }    // gotsym


         if (didline==0 && daTexts.hasOwnProperty(ii)) {  // draw text (right aligned) ?
             ctx.textAlign = "start";
             ctx.font=daText1['font'];
             let tcolor=daText1['color'];
             tcolor= (tcolor!='') ? tcolor : lcolor ;  // either the symbol color, or black if no symbol on this row
             ctx.fillStyle = tcolor;
             ctx.textAlign = "right";
             ctx.fillText(daText1['text'],keyRight-5,keyTop+topAt);
         }

         topAt+=keyRowPad; // padding

         if (keyRowSepColor!='') {            // a seperator line?
            topAt=topAt+2 ;
            drawLine(keyLeft,keyTop+topAt,keyRight,keyTop+topAt, keyRowSepColor,1,[9,4]);
            topAt=topAt+2 ;

         }

         topAt+=keyRowPad; // padding
      }           // row ido

      ctx.globalAlpha = 1;
      return 1;
  }


//=============
// symbol specs for a line of the key
// return 0 if "no draw"
// otherwise [sizeOfSymbol,pt]
// pt object (shape abbributes) for a symbol
// Fields used (in pt)    PS (size), PC (color), PT (type of shape), PB (border width for non-filled shapes),
//                        BW (border width for filled shapes, BC (border color for filled shapes)
//                        HW (bar width) HC (bar color)
//                        ES (emphasis size), EB (emphasis border), EC (emphasis color)
//           or           LS (line size (width), LC (line color), LD (dot pattern)

function renderKey_pt(alls,ith,defSize,defColor,tAdd) {
   if (!alls.hasOwnProperty(ith)) return [defSize,0];
   if (alls[ith]==0) return [defSize,0];
   let ause='' ;
// the defults
   let pt={'PS':defSize,'PC':defColor,'PT':'CIRCLE','PB':1,'ES':0,'EB':0,'EC':'gray','LS':0,'LC':'black','LD':'','BW':0,'BC':'','HW':'','HC':'','TC':''}
   for (let aa in alls[ith]) {
      let laa=aa.toUpperCase();
      if (laa=='PT') {
          ause=$.trim(alls[ith][aa]).toUpperCase() ;
          if (dataPointAbbrev.hasOwnProperty(ause)) ause=dataPointAbbrev[ause] ; // else, will dfault to circle
      } else {    // point type: convert 2 letter abbfeviations
         if (laa=='LS') {
           ause=parseInt(alls[ith][aa]);
         } else {
              ause=alls[ith][aa] ;
          }
      }      // laa=pt
      if (pt.hasOwnProperty(laa)) pt[laa]=ause;  // don't bother adding unsupported properties
      tAdd=Math.max(tAdd,pt['PS'],pt['ES']);
    }
    return [tAdd,pt];
 }

//====================
//  ........   background of charting area, or key     .....
// for chart area: damargs=[margin.left, margin.top, xMaxPx + margin.left- margin.right, chartHeight-margin.bottom];
    var renderBackground = function(bcolor,damarg) {              // ::::::::::::::: color background of charting area :::::::::::::::
        var ibb,bcolors;
        var lingrad = ctx.createLinearGradient(damarg[0],damarg[1],damarg[2],damarg[3]);
//        margin.left, margin.top, xMaxPx + margin.left- margin.right, chartHeight-margin.bottom);
        if (bcolor=='')  {
            bcolors=['#D4D4D4','#fff','#fff','#D4D4D4'];        // default is white with shading at nw and se corners
        } else {
            bcolor+=',#fff,#fff,#fff,#fff'  ; // add defaults just in case
            bcolors=bcolor.split(',');
            for (ibb=0;ibb<4;ibb++)  {
                bcolors[ibb]=jQuery.trim(bcolors[ibb]);
                if (bcolors[ibb]=='') bcolors[ibb]='#fff';     // a default
            }
        }
        lingrad.addColorStop(0.0, bcolors[0]);
        lingrad.addColorStop(0.2, bcolors[1]);
        lingrad.addColorStop(0.8, bcolors[2]);
        lingrad.addColorStop(1, bcolors[3]);

        ctx.fillStyle = lingrad;
        ctx.fillRect(damarg[0],damarg[1],damarg[2],damarg[3])  ;
    };


//========================
// ....   display axis titles, and main title  (depends on chartDisplay2)    .....
//   chartDisplay: -1: main title only, 0 everything but data, 1 data only, 2 : 1 +  x and y axises,  3: 2 +   title +  x and y tics & gridlines , 4: 3+ xais labels (iow: everything)

    var renderText = function(chartDisplay2,showTitle1) {                // ::::::::::;  Write x and y axis titles, and graph title ::::::::::::::::;

        if (chartDisplay2==-1 || chartDisplay2==0 || chartDisplay2>2 || showTitle1!=0 ) {               // main title
           if (typeof(data.title)!=='undefined') {
             ctx.fillStyle = 'black';
             ctx.font = titleFont;
             ctx.textAlign = "center";
             var txtSize = ctx.measureText(data.title);
             if (showTitle1==2)  {  // clear first
                ctx.clearRect(margin.left+2,3,chartWidth-margin.right,margin.top-6) ;
             }
             ctx.fillStyle = 'black';
             ctx.fillText(data.title, (chartWidth / 2), (margin.top / 2));
           }            // title exist
        }        // write titel

        if (chartDisplay2==-1 || chartDisplay2==1 || chartDisplay2==2 ) return;            // x and y axis labels not desired?

        if (chartDisplay!==-11 && typeof(data.xLabel)!=='undefined') {
          ctx.font = labelFont;
          ctx.textAlign = "center";

          txtSize = ctx.measureText(data.xLabel);          //X-axis text
          ctx.fillText(data.xLabel, margin.left + (xMaxPx / 2) - (txtSize.width / 2), chartAreaHeightPx + margin.top + (margin.bottom / 1.2));
        }

        if (typeof(data.yLabel)!=='undefined') {
          ctx.save();                                    //Y-axis text
          ctx.rotate(-Math.PI / 2);
          ctx.font = labelFont;
          ctx.textAlign = "center";

          ctx.fillText(data.yLabel,(margin.top+ (chartAreaHeightPx / 2)) * -1, margin.left / 4);
          ctx.restore();
        }
        if (typeof(data.yLabel2)!=='undefined' && $.trim(data.yLabel2)!=='') {
          ctx.save();                                    //Y-axis text
          ctx.rotate(-Math.PI / 2);
          ctx.font = labelFont;
          ctx.textAlign = "center";

          ctx.fillText(data.yLabel2,(margin.top+ (chartAreaHeightPx / 2)) * -1, margin.left+xMaxPx+22  );
          ctx.restore();
        }

    };      // ========== End of renderText    ============


// .... display  gridlines, axis labels and tics.......


    var renderAxisLines = function (icc) {       // :::::::::::::::::: draw axis lines :::::::::::::::::::::
       if (yAxisRight!=1) {
          drawLine( margin.left, margin.top,  margin.left, chartAreaHeightPx+margin.top , 'black',1,[]);          //Y axis left
       } else {

          drawLine(xMaxPx+margin.left, margin.top,xMaxPx+margin.left, chartAreaHeightPx+margin.top , 'black',1,[]);          //Y axis right
       }
       if (icc!=-11) {  // not y axis only
         drawLine(margin.left, chartAreaHeightPx+margin.top, xMaxPx+margin.left, chartAreaHeightPx+margin.top, 'black',1,[]);          //X axis
       }
       return 1;
   }

// =======================================

    var renderLinesAndLabels = function (noTicLabels,jcc) {       // :::::::::::::::::: draw grid lines and x and y axis labels :::::::::::::::::::::

       var yatPx,yGrids=[],yGrids2=[],ii,ylinePx,dyPx,dyVal,ylineVal,ypos,txtSize,ygs;
       var gridLinesColor=yGridLinesColor,gridLinesColorBold='#987868',yColor,isBold,tt,ii2;
       var ylinePx0,arcSize,aheight,isbad,minXShown=100000000000000,itt;

       if (gridLineSpecs!='' && $.trim(gridLineSpecs)!='0') {                        // use specified gridlines  (y levels)
           ygs=gridLineSpecs.split(',');
           ii2=0;
           for (ii=0;ii<ygs.length;ii++) {
             isBold=0 ;
             tt=jQuery.trim(ygs[ii]);
             if (tt.substr(0,1).toUpperCase()=='B') {
                ypos=tt.substr(1);
                isBold=1;
             } else {
                 ypos=tt;
             }
             if (isNaN(ypos)) continue ;
             ylineVal=parseFloat(ypos);
             ylinePx=renderValToPx(ylineVal);
             if (ii>0)  {                    // check if too crowded
               if (Math.abs(ylinePx-ylinePx0)<minGridLineSep) continue ;
             }
             let ytt= (!isNaN(yPrec)) ? ylineVal.toFixed(yPrec) : sprintf(yPrec,ylineVal);

             yGrids[ii2]=[ylinePx,ytt,isBold];

             ylinePx0=ylinePx;
             ii2++;
             if (ylinePx>chartHeight) break;
               }          // ygs.length

       } else {         // not explicit gridlines
             yatPx=0 ;         // first grid line is here relative to margin.top
             if (yGridLinesPx>0) {      // -1 to suppress
               for (ii=0;ii<10000;ii++) {
                  ylinePx=yatPx+(ii*yGridLinesPx) ;   // relative to charting area
                  ylineVal=renderPxToYval(ylinePx);
                  let ytt= (!isNaN(yPrec)) ? ylineVal.toFixed(yPrec) : sprintf(yPrec,ylineVal);
                  yGrids[ii]=[ylinePx,ytt,0];
                  if ( gotYrange2==1) {  // 2nd y axis
                      let ylineVal2=renderPxToYval2(ylinePx);    // just use for 2nd y axis
                      let ytt2= (!isNaN(yPrec)) ? ylineVal2.toFixed(yPrec) : sprintf(yPrec,ylineVal2);
                      yGrids2[ii]=ytt2;
                 }
                 if (ylinePx>chartHeight) break;
               }
           }      // yGridlinespx <0 (suppress gridlines)
       }                  // gridLines

       yRangeReturn=[yMinUse,yMaxUse,yGrids.length];        // return to original caller of wsCanvasChart.render

       let x2at=xMaxPx+margin.left ; // used if 2nd y axis
       let noDraw= ($.trim(gridLinesColor).toUpperCase().substr(0,1)=='N') ? 1 : 0;
       for (ii=0;ii<yGrids.length;ii++) {
             ypos=yGrids[ii][0] ;
             if (ypos<0 || ypos>chartAreaHeightPx) continue ;   // out of charting area
             ypos+=margin.top;
             yColor=gridLinesColor;     // ygridLinesColor

             if (yGrids[ii][2]==1) yColor=gridLinesColorBold;  // bold horiz line?

             if (noDraw==0)   drawLine(margin.left, ypos, xMaxPx+margin.left , ypos,yColor);              //Draw horizontal gridlines
             if (noTicLabels!=1)  {   // do NOT suppress tic text?
                  txt=yGrids[ii][1];
                  ctx.font = axisTicFont ;
                  ctx.fillStyle=axisTicColors[1];
                  txtSize = ctx.measureText(txt);
                  if (yAxisRight!=1) {
                     ctx.textAlign = "center";
                    ctx.fillText(txt, margin.left - ((txtSize.width >= 14) ? txtSize.width : 10) - 7, ypos + 8);       // draw y axis text (at grid line intersetion)
                  }else {
                     ctx.textAlign = "left";
                    ctx.fillText(txt,  x2at+18 - ((txtSize.width >= 14) ? txtSize.width : 10) - 7, ypos + 8);       // draw y axis text (at grid line intersetion) - on the right!
                  }

                  if (ii<yGrids2.length) {       // 2nd y axis-- 2nd y location, x at end of char area
                    txt=yGrids2[ii] ;
                    ctx.font = axisTicFont ;
                    ctx.textAlign = "center";
                    ctx.fillStyle=axisTicColors[2];
                    txtSize = ctx.measureText(txt);
                    ctx.fillText(txt, x2at+14 - ((txtSize.width >= 14) ? txtSize.width : 10) - 7, ypos + 8);       // draw y axis text (at grid line intersetion)
                  }

               }     // notic
        }           //  ygrids

        if (jcc==-11) {
           return 1 ;   // y axis only
        }

// Now do x axis stuff

        if (nXmarks==0) return ;                        // no x tic (or tic labels)
        if (xCategory==0) {                           // Not catetories
            if (nXmarks>0) {                            // display at specified values of x axis (not necessiarly related to actual values)
               if (xTics.length==0)    {                // divide into chunks
                   dx=(xMaxUse-xMinUse)/nXmarks ;
                   xTics[0]=xMinUse ;
                   for (itt=1;itt<=nXmarks;itt++)  xTics[itt]=xTics[itt-1]+dx;

               }  else {
                  if (xTics[0]>xMinUse) xTics.unshift(xMinUse);
               }
            }  else {                   // nXmarks<=0) -- show all of the actual x values. Make sure that xMinUse is the first
               xTics=[];                // just to be sure
               for (itt=0;itt<data.dataPoints.length;itt++) {
                  if (badObs[itt]==0 || badObs[itt]==31) {       // skip if bad observation
                    minXShown=Math.min(minXShown,data.dataPoints[itt].x);
                    xTics.push(data.dataPoints[itt].x) ;
                  }
                }
                if (minXShown>xMinUse) xTics.push(xMinUse);
            }           // nXmarks<0
            for (itt=0;itt<xTics.length;itt++) {
               drawOnXaxis(xTics[itt],noTicLabels,axisTicColors[0] );
            }

            xRangeReturn=[xMinUse,xMaxUse,xTics.length];             // returned by .render
            return 1;
        }   // xcateogyr=0

// if here , catgorical x  (don't set xrangeReturn (so returns [])

        var xPos = margin.left;  // first point is on y axis (if categorical x )
        var xVal,doAllX ;
        xPosOld=xPos ;
        nXmarksUse=nXmarks; doAllX=1;
        for (ii=0;ii<nXmarksUse;ii++) {
            isbad=badObs[ii];
            if (isbad!=0 && isbad!==31) {
                    xPos += xInc;
                    continue ;             // don;'t show, but do nmove over
            }

            txt=data.dataPoints[ii].x ;
            ctx.font = axisTicFont ;
            ctx.textAlign = "center";
            txtSize = ctx.measureText(txt);

            if (ii>0 && ( Math.abs(xPos-xPosOld) <(txtSize.width*1.1) )) {        // can't squeeze in x category
                 xPos += xInc;                            // used if  xcategory=1 (note we do NOT update xPosOld)
                 continue ;
            }    // too close, skip x axis label & tic
            if (noTicLabels!=1) ctx.fillText(txt, xPos, chartAreaHeightPx+ margin.top + (margin.bottom / 3));
            drawLine(xPos, chartAreaHeightPx+margin.top+4, xPos, chartAreaHeightPx+margin.top-4,'black');              //Draw tic marks (even if xais lines only
            if (ii==0) {
                    drawLine(xPos , chartAreaHeightPx+margin.top , xPos+(xInc/3), chartAreaHeightPx+margin.top ,'gray',6,[2,2]);              //Draw category bar marks
            } else {
                    drawLine(xPos-(xInc/6), chartAreaHeightPx+margin.top , xPos+(xInc/6), chartAreaHeightPx+margin.top ,'gray',6,[2,2]);              //Draw full width category marks
            }
            xPosOld=xPos;
            xPos += xInc;        // xPos is position of the NEXT "categorical" x value (if non-categorial, xPos is a function of the x value)
        }


        if (xCategory==0 && doAllX==1 &&  minXShown!==xMinUse) {         // see if tic mark at min value
             if (noTicLabels!=1) {
                let txt= (!isNaN(yPrec)) ? xMinUse.toFixed(yPrec) : sprintf(yPrec,xMinUse);
                ctx.fillText(txt, margin.left+1, chartAreaHeightPx+ margin.top + (margin.bottom / 3));
             }
        }
    }        //  ::::::::::::: end of renderLinesAndLabels fucntion ........ ::::::::::::::::::::::::::::::::::::::::::::::::


 var  drawOnXaxis = function(xval,noText,tcolor) {        // used by renderLinesAndLabels    -- draw x tics tuff for NON-categorical x  values

    axisTicFont = (data.axisTicFont != null) ? data.axisTicFont : labelFont;

    xPos=renderXValToPx(xval);
    if (xPos==='' && xPos!==0) return 0 ;   // '' signals "outside of range"
    xPos+=margin.left;
    ctx.font = axisTicFont ;
    ctx.textAlign = "center";
    ctx.fillStyle = tcolor;

    drawLine(xPos, chartAreaHeightPx+margin.top+4, xPos, chartAreaHeightPx+margin.top-4,'black');              //Draw tic marks (even if xais lines only
    if (noText!=1) {
      txt= (!isNaN(xPrec)) ? parseFloat(xval).toFixed(xPrec) : sprintf(xPrec,xval) ;
      txtSize = ctx.measureText(txt);
      let ypuse=chartAreaHeightPx+ margin.top + (margin.bottom / 3)
      ctx.fillText(txt, xPos,ypuse );          // x value just below x axis
    }
    return 1;
 }

 //  .... diplay line graph, dots, point labels      ............

//badObs flags: 0=ok, 1=bad Y, 10=bad x (not checked if xcategory=1), 11=bad x and y .  2=x out of range, 3= Y out of range  (if x out of range, y not checked)


 // --------- the draw datapoints function (lines, shapes, text, bars)
 // note that each points has many point specific values. Often, these are not specified in dataPoints. In which case, the global defaults are used

    var renderData = function(type) {            // ::::::::::::::::::: draw each data point -- either as line graph, or dots  :::::::::::::
        var prevX = 0,prevY = 0,prevYval=0,prevXText=0,prevYText=0,adist,ptX,i,outOf,ptLabel,acolor,pointType,arcSize,rectSize;
        var  x0,x1,x2,argb,iPrior=0,gotFirst=0,prevOut=0,nowOut=0,iPrev,ptWas,radGrad,y0,y1,y2,arf,aLineWidth,borderColor,borderWidth;
       var  didwrite=0  ;

        for (var i = 0; i < data.dataPoints.length; i++) {
           let isThisBad= badObs[i];
           if (xCategory==0) {
              if (badObs[i]!=0 && badObs[i]!=31)  continue;              // 30 is "skip y", 31 is "display lines lightly" -- so if 31 do NOT skip
           }  else {
              if (badObs[i]==30) continue   ;                                    // don't display (but do have spot on x axis
           }


           var pt = data.dataPoints[i];

// selection test here.
           if (selectFunc!==false) {
               let qdo=selectFunc(pt);
               if (qdo===false || qdo==0) continue;
           }

           var ptYval=pt.y,ptXval=pt.x;

           if (xCategory==1) {
               ptX = (i * xInc) + margin.left;
            } else {
                ptX=renderXValToPx(ptXval);
                ptX+=margin.left ;
            }

            var ptY=renderValToPx(ptYval,type);
            ptY=ptY+margin.top;


            if (gotFirst==1 && type == renderType.lines) {        //  Draw connecting lines    (note if i=0, save for use in i=1 (start of line)    .........
               nowout= (badObs[i]==31) ? 1 : 0 ;             // this is a "out of y chart area" point -- but display dotted line headed toward it?
               outOf=0 ;

               if (nowout==0 && prevOut==0) {          // both ends of segment in bounds
                   outOf=0;
               } else {
                 if (prevOut==1 &&   nowout==1 ) {          // both ends of segment out of  bounds
                      outOf=2;     // both end out of bounds
                 } else   {
                     outOf=1;      // one end out of bounds
                 }
               }        // in bounds?
               prevOut =nowout ;

               if (outOf==0)   {
                     ptWas=data.dataPoints[iPrev];;
                    drawLine(ptX, ptY, prevX, prevY, ptWas.LC, ptWas.LS,ptWas.LD);
                } else {
                   if (outOf==2) {    // completely out of bounds
                      drawLine(ptX, ptY, prevX, prevY, '#ababab', 1,[6, 3, 3]);
                   } else {              // partially out of bounds
                      drawLine(ptX, ptY, prevX, prevY, '#ababab', 2,[4,5,10,20]);
                   }
               }
               apt=[iPrior,prevX-margin.left,prevY-margin.top,i,ptX-margin.left,ptY-margin.top];     // vertex 1 id, x location, ylocation, vertex 2 id, x locatioh, ylocation
               linesDone.push(apt) ;

            }       // renderType.lines

            gotFirst=1 ;

// ploc, width, and height are in pixels in the chart --- 0,0 is upper left corner of chart (top of x axis)
// linesDone:  dataPoint id (vertext 1) x ploc, y ploc, dataPoint id (vertex 2), x ploc, y ploc
// pointsDone: dataPoint id, x ploc, y ploc, circle radius in px
// barsDone :  dataPoint id , upper left x ploc, upper left y ploc, width, height

            if (type == renderType.points) {         // :::::::::::::  draw a SHAPE  (a circle,square,triangl: outline, filled, gradient circle; or a + or X  ........
//              alert([isThisBad,ptX,ptY]);
               renderPointShape(pt,ptX,ptY,isThisBad);
               let apt=[i,ptX-margin.left,ptY-margin.top,dataPointSize] ;     // point id, x pixel coord, ypixel coord in chart area (not on canvas) shape size (i.e.; circle radius)
               pointsDone.push(apt) ;
             }

             if (type == renderType.bars) {                                   // draw a histogram bar ....

               ctx.globalCompositeOperation=gCompositeOperation;
                ctx.beginPath();
                if (badObs[i]!=0) continue ;         // bars not fully in range are NOT displaye
                aheight=chartAreaHeightPx+margin.top -ptY;
                let barWidePx=1;
                if ( (pt.HW=='' && barWidthAuto==1) || xCategory==1) {      // barwidthe always auto determiend for categories
                        barWidePx= (isNaN(pt.HI)) ?  Math.max(4,dataPointSize) : parseFloat(pt.HW);
                } else {
                    let barWidthUse=pt.HW;    // barWidthUse in X space (not pixel space)
                    if ($.trim(barWidthUse)=='' || isNaN(barWidthUse)) barWidthUse=barWidth;

                    ptB1=renderXValToPx(ptXval-barWidthUse/2);      // convert to pixel spce
                    ptB2=renderXValToPx(ptXval+barWidthUse/2);
                    if (ptB1==='' || ptB2==='')  {
                      barWidePx=Math.max(4,dataPointSize);  // use dfault width for non categorical x
                    } else {
                      barWidePx=Math.max(1,parseInt(Math.abs(ptB2-ptB1)));
                    }
                }     // barWidePx is local

                let cool1= (ptX+(barWidePx/3));  // in pixel space ... (ptX and pxY in pixel, ptXval and ptyVal are origional values)
                let barWideUsePx=barWidePx;
                if (i==0) {     // if first bar, center it and use half bar. Even if barSide != 'A'
                      x0=ptX;
                      barWideUsePx=barWidePx/2;
                } else if (barSide=='S') {
                       x0=ptX ;
                } else if (barSide=='E') {  // bar right edge over x0
                       x0=ptX-barWidePx ;
                } else {   //   defaiult is centered
                     x0=ptX-(barWidePx/2);
                }


                lingrad = ctx.createLinearGradient(x0,ptY,cool1,ptY+margin.top);
                argb="rgba(10,30,20,0.1)";
                lingrad.addColorStop(0.0,argb);          // a light gray
                let barColorUse= ((pt.HC=='')) ? barColor : pt.HC ;
//                alert(barColor+','+pt.HC);
                lingrad.addColorStop(1.0, barColorUse);    // can be set, by a default a light lime
                ctx.fillStyle = lingrad;
                ctx.fillRect(x0,ptY,barWideUsePx,aheight );
                apt=[i,x0-margin.left,ptY-margin.top,barWidePx/3,aheight] ;   // barid, upper left corner x and y, width,height
                barsDone.push(apt) ;
            }

            if (type == renderType.textValues) {             // display Y value  (or label value) next to point   ..............
                  ctx.globalCompositeOperation=gCompositeOperation;
                  ctx.beginPath();

                if (badObs[i]!=0) continue ;           // text values outside of range are not displayed
                adist=Math.sqrt(((ptX-prevXText)*(ptX-prevXText)) +   ((ptY-prevYText)*(ptY-prevYText) ) ) ;
                txt=pt.L;                                             // will be filled in by fixDataSpecs
                if ($.trim(txt)!=='' && !isNaN(txt)) {
                  txt=(!isNaN(yPrec)) ? parseFloat(txt).toFixed(yPrec)  : sprintf(yPrec,txt);
                }
                txtSize = ctx.measureText(txt);

                if (txtSize.width*1.2 > adist && dataPointTextForce!=1) continue ;  // too close, and not forcing of textvalue output
                ctx.globalCompositeOperation=gCompositeOperation;
                ctx.beginPath();
                ctx.font = dataPointTextFont ;
                ctx.textAlign = dataPointTextAlign ;
                 if (dataPointTextFill!=0) {
                   ctx.fillStyle = pt.TC;       // default is dataPointTextColor ;
                   ctx.fillText(txt, ptX+dataPointTextOffsetX,ptY+dataPointTextOffsetY);
                 } else {
                   ctx.strokeStyle = pt.TC;       // default is dataPointTextColor ;
                   ctx.strokeText(txt, ptX+dataPointTextOffsetX,ptY+dataPointTextOffsetY);
                 }
                 ctx.closePath();
                prevXText=ptX; prevYText=ptY ;
            }

            prevX = ptX;
            prevY = ptY;
            prevYval=ptYval;
            iPrev=i;
            iPrior=i;
        }   // ith object


    };   // ::::::: end of  renderData  ::::::::::::::::::

//========
// draw vertical (xRefline) or horiziontal (yRefLines) data
// isYline=0 : xreflines, 1=yreflines
function renderRefLines(zdo,isYline) {
  if (zdo.length==0) return 1;
  for (let ir=0;ir<zdo.length;ir++) {
   let aval=zdo[ir][0];
    let acolor=zdo[ir][1];
    let adot=makeDotted(zdo[ir][2]);
    if (isYline==0)   {             // x ref lines  (vertical)
         let xPos=parseInt(renderXValToPx(aval));
         if (xPos==='') continue  ;   // out of x margins
         drawLine( xPos+margin.left, margin.top,  xPos+margin.left, chartAreaHeightPx+margin.top , acolor,lineWidth,adot,0);          //Y axis left
    } else {               // horizline
          let ylinePx=renderValToPx(aval);
          if (ylinePx<0 || ylinePx>chartAreaHeightPx) continue;
         drawLine( margin.left, margin.top+ylinePx,  xMaxPx+margin.left,  margin.top+ylinePx, acolor,lineWidth,adot,0);          //Y axis left
     } // isyline
  }  // ir

  return 1;

}


//=============================
// draw a point shape pt (pt is object with lots of specs, ptX and ptY are where to draw it, in pixel space of the entire canvas, not just the chart area)
// yMaxUse, yMinUse,  gCompositeOperation are global
// Fields used (of pt)    PS (size), PC (color), PT (type of shape), PB (border width for non-filled shapes),
//                        ES (emphasis size), EB (emphasis border), EC (emphasis color)

 var renderPointShape=function(pt,ptX,ptY,thisBad) {
   var x0,y0,x1,y1,pointType,acolor,borderColor,borderWidth,aborderWidth,aLineWidth,rectSize,radgrad,arcSize;
     if (arguments.length<4) thisBad=0;
     pointType=pt.PT ;

     borderColor=pt.BC; borderWidth=pt.BW ;
     acolor='green'; aLineWidth=1;
     let ap1=pointType.substr(0,1).toUpperCase();
     let ap2=pointType.substr(0,2).toUpperCase();
     if (ap1=='N' ) {
         ;    // do nothing

     } else  if (ap1=='+' || ap1=='X' || ap1=='_' || ap1=='|' || ap1=='/'  || ap1=='\\')  {   //  + or X or _ or | or / or \
        ctx.beginPath();
        rectSize=parseInt(pt.PS);
        aLineWidth=pt.PB ;
        acolor=pt.PC ;
        if (pt.y> yMaxUse || pt.y<yMinUse)  {
           acolor='#dedede';    aLineWidth=1 ;
           rectSize=Math.max(1,dataPointSize/4) ;   // out of bounds dot
        }

        if (ap1=='X') {
           x0=ptX-rectSize/2;
           y0=ptY-rectSize/2 ;
           x1=ptX+rectSize/2;
           y1=ptY+rectSize/2 ;
             ctx.moveTo(x0,y0);  ctx.lineTo(x1,y1);  // upper left to lower right
             ctx.moveTo(x1,y0);  ctx.lineTo(x0,y1);   // upper right to lower left

        } else  if (ap1=='+') {               //  +
           x0=ptX ;
           y0=ptY-rectSize/2 ;
           y1=ptY+rectSize/2 ; ;
             ctx.moveTo(x0,y0);  ctx.lineTo(x0,y1);         //downstroke
           x0=ptX-rectSize/2 ;
           x1=ptX+rectSize/2;
           y1=ptY  ; ;
             ctx.moveTo(x0,y1);  ctx.lineTo(x1,y1);   // horiz stroke

        } else  if (ap1=='|') {               //  |  vert bar through middle
           x0=ptX ;
           y0=ptY-rectSize/2 ;
           y1=ptY+rectSize/2 ; ;
             ctx.moveTo(x0,y0);  ctx.lineTo(x0,y1);

        } else  if (ap1=='_') {               //  _   horiz bar through middle
           x0=ptX -rectSize/2;
           x1=ptX+rectSize/2;
           y0=ptY ;
           ctx.moveTo(x0,y0);  ctx.lineTo(x1,y0);

        } else  if (ap1=='/') {               //  /  forward slash
           x0=ptX-rectSize/2 ;
           y1=ptY+rectSize/2 ; ;
           x1=ptX+rectSize/2;
           y0=ptY-rectSize/2 ;
           ctx.moveTo(x0,y1);  ctx.lineTo(x1,y0);

        } else  if (ap1=='\\') {               //  \    backwoard slash
           x0=ptX-rectSize/2 ;
           y1=ptY+rectSize/2 ; ;
           x1=ptX+rectSize/2;
           y0=ptY-rectSize/2 ;
             ctx.moveTo(x0,y0);  ctx.lineTo(x1,y1);
       }

       ctx.strokeStyle =acolor;

       ctx.lineWidth = aLineWidth;
       ctx.stroke();
  //     if (ap1=='+') alert(thisBad+' write + ax '+x0+','+y0);

    } else if (pointType=='..' || pointType=='.-' || pointType=='-.' ) {

        ctx.beginPath();
        rectSize=parseInt(pt.PS);
        acolor=pt.PC ;

        arcSize=Math.max(1,parseInt(pt.PS)/5);
        let afact=(pointType=='..') ? 0.5 : 0.66;
        x0=ptX-(afact*rectSize);
        aLineWidth=Math.max(pt.PB,2) ;
        ctx.arc(x0, ptY, arcSize, 0, 2 * Math.PI, false)

        if (pointType=='.-' || pointType=='-.' ) {
          aLineWidth=Math.max(pt.PB,2) ;
          x0=ptX-(0.25*rectSize);
          x1=ptX+(0.25*rectSize);
          ctx.moveTo(x0,ptY);  ctx.lineTo(x1,ptY);  // upper left to lower right
          ctx.stroke();
        }

        x0=ptX+(afact*rectSize);
        aLineWidth=Math.max(pt.PB,2) ;
        ctx.arc(x0, ptY, arcSize, 0, 2 * Math.PI, false)
        ctx.fillStyle = acolor;
        ctx.fill();



    } else if (pointType=='--' ) {
          ctx.beginPath();
          rectSize=parseInt(pt.PS);
          aLineWidth=pt.PB ;
          acolor=pt.PC ;

          x0=ptX-rectSize/2 ;
          x1=ptX-rectSize/8;
          ctx.moveTo(x0,ptY);  ctx.lineTo(x1,ptY);
          x0=ptX+rectSize/8 ;
          x1=ptX+rectSize/2;
          ctx.moveTo(x0,ptY);  ctx.lineTo(x1,ptY);

          ctx.strokeStyle =acolor;
          ctx.lineWidth = aLineWidth;
          ctx.stroke()


    } else if (pointType=='CHECK' || pointType=='HAT' ) {
        ctx.beginPath();
        rectSize=parseInt(pt.PS);
        aLineWidth=pt.PB ;
        acolor=pt.PC ;
        if (pt.y> yMaxUse || pt.y<yMinUse)  {
           acolor='#dedede';    aLineWidth=1 ;
           rectSize=Math.max(1,dataPointSize/4) ;   // out of bounds dot
        }
        if (pointType=='CHECK') {               // check mark
           x0=ptX-rectSize/4 ;
           y1=ptY+rectSize/2 ; ;
           x1=ptX+rectSize/2;
           y0=ptY-rectSize/2 ;
             ctx.moveTo(x0,ptY);  ctx.lineTo(ptX,y1);
            ctx.lineTo(x1,y0);

       } else {               // hat
           x0=ptX-rectSize/2 ;
           y1=ptY+rectSize/2 ; ;
           x1=ptX+rectSize/2;
           y0=ptY-rectSize/2 ;
           ctx.moveTo(x0,ptY);  ctx.lineTo(ptX,y0);
           ctx.lineTo(x1,ptY);
       }

       ctx.strokeStyle =acolor;

       ctx.lineWidth = aLineWidth;
       ctx.stroke()

    } else if (ap2=='AR') {
        ctx.beginPath();
        rectSize=parseInt(pt.PS);
        aLineWidth=pt.PB ;
        acolor=pt.PC ;
        if (pt.y> yMaxUse || pt.y<yMinUse)  {
           acolor='#dedede';    aLineWidth=1 ;
           rectSize=Math.max(1,dataPointSize/4) ;   // out of bounds dot
        }
       ctx.strokeStyle =acolor;
       ctx.lineWidth = aLineWidth;
       ctx.stroke();

       x0=ptX-rectSize/2 ;       y1=ptY+rectSize/2 ; ;
       x1=ptX+rectSize/2;        y0=ptY-rectSize/2 ;

       if (pointType=='ARROWUP')  {
           ctx.moveTo(ptX,y1);  ctx.lineTo(ptX,y0);
           ctx.lineTo(x0,ptY);
           ctx.moveTo(ptX,y0);
           ctx.lineTo(x1,ptY);
       } else if (pointType=='ARROWRIGHT')  {
           ctx.moveTo(x0,ptY);  ctx.lineTo(x1,ptY);
           ctx.lineTo(ptX,y0)
           ctx.moveTo(x1,ptY);
           ctx.lineTo(ptX,y1)

       } else if (pointType=='ARROWDOWN')  {
           ctx.moveTo(ptX,y0);  ctx.lineTo(ptX,y1);
           ctx.lineTo(x0,ptY);
           ctx.moveTo(ptX,y1);
           ctx.lineTo(x1,ptY);

       } else if (pointType=='ARROWLEFT')  {
           ctx.moveTo(x1,ptY);  ctx.lineTo(x0,ptY);
           ctx.lineTo(ptX,y0)
           ctx.moveTo(x0,ptY);
           ctx.lineTo(ptX,y1)

       } else if (pointType=='ARROWSE')  {
           ctx.moveTo(x0,y0);
           ctx.lineTo(x1,y1);
           ctx.lineTo(x1,ptY)
           ctx.moveTo(x1,y1);
           ctx.lineTo(ptX,y1)
       } else if (pointType=='ARROWSW')  {
           ctx.moveTo(x1,y0);
           ctx.lineTo(x0,y1);
           ctx.lineTo(x0,ptY)
           ctx.moveTo(x0,y1);
           ctx.lineTo(ptX,y1)
       } else if (pointType=='ARROWNE')  {
           ctx.moveTo(x0,y1);
           ctx.lineTo(x1,y0);
           ctx.lineTo(ptX,y0)
           ctx.moveTo(x1,y0);
           ctx.lineTo(x1,ptY)
       } else if (pointType=='ARROWNW')  {
           ctx.moveTo(x1,y1);
           ctx.lineTo(x0,y0);
           ctx.lineTo(ptX,y0)
           ctx.moveTo(x0,y0);
           ctx.lineTo(x0,ptY)
       }

       ctx.strokeStyle =acolor;
       ctx.lineWidth = aLineWidth;
       ctx.stroke();


    } else if (pointType.substr(0,2)=='DI')  {   // Diamond (rotated square). Gradients doesn't seem to work (could fix but not now)
       acolor=pt.PC ;
       aLineWidth=pt.PB ;

       rectSize=parseInt(pt.PS);
       if (pt.y> yMaxUse || pt.y<yMinUse)  {
           acolor='#dedede'; aLineWidth=1;
           rectSize=Math.max(1,dataPointSize/4) ;   // out of bounds dot
       }
       x0=ptX-rectSize/2  ; x1=ptX ; x2=ptX+rectSize/2;
       y0=ptY-rectSize/2 ; y1=ptY; y2=ptY+rectSize/2 ;

       ctx.globalCompositeOperation=gCompositeOperation;
       ctx.beginPath();
           ctx.moveTo(x1,y0);
           ctx.lineTo(x2,y1);
           ctx.lineTo(x1,y2);
           ctx.lineTo(x0,y1) ;
           ctx.lineTo(x1,y0) ;
        if (pointType=='DIAMONDPLUS' || pointType=='DIAMONDBAR'){
           ctx.fillStyle ='';
           ctx.moveTo(x0,y1);
           ctx.lineTo(x2,y1) ;
           if (pointType=='DIAMONDPLUS') { // verticala line to complete the plus
              ctx.moveTo(x1,y0);
              ctx.lineTo(x1,y2) ;
           }
       }
       ctx.strokeStyle=acolor ;
       ctx.lineWidth=aLineWidth;

       if (pointType=='DIAMONDFULL') {
             if (borderWidth>0) {
               ctx.lineWidth=borderWidth;
               ctx.strokeStyle=borderColor ;
             }
             ctx.stroke();
             ctx.fillStyle =acolor;
             ctx.fill();
       } else {
             ctx.stroke();
       }


//square squarePlus squareFull squareGradient

    } else if (pointType.substr(0,2)=='SQ' || pointType.substr(0,1)=='S' )  {   // SQUARE

       rectSize=parseInt(pt.PS) ;
       aLineWidth=pt.PB ;
        ctx.beginPath();

        x0=ptX-rectSize/2;
        y0=ptY-rectSize/2 ;
        x1=ptX+rectSize/2;
        y1=ptY+rectSize/2 ;

       if (pointType=='SQUAREFULL' || pointType=='SQUAREGRADIENT')  {                   // yes  fill
           radgrad = ctx.createLinearGradient(x0,y0,x1+(rectSize/3),y1+(rectSize/3));
       }
       if (pt.y> yMaxUse || pt.y<yMinUse)  {
           acolor='#dedede'; aLineWidth=1;
           if (pointType!='SQUARE')  radgrad.addColorStop(0,acolor);
           rectSize=Math.max(1,dataPointSize/4) ;   // out of bounds dot
           x0=ptX-rectSize/2;
           y0=ptY-rectSize/2 ;
           x1=ptX+rectSize/2;
           y1=ptY+rectSize/2 ;
           radgrad = ctx.createLinearGradient(x0,y0,x1,y1);

       } else{
          acolor=pt.PC ;
          if (pointType=='SQUAREFULL'  || pointType=='SQUAREGRADIENT' ) {
             radgrad.addColorStop(0,acolor);
          }
       }
       if (pointType=='SQUAREFULL' || pointType=='SQUAREGRADIENT' )  {
         if (pointType=='SQUAREGRADIENT') {
            radgrad.addColorStop(0.9, 'White');
         } else {
            radgrad.addColorStop(1.0,acolor);
         }
       }

// now draw it
       if (pointType=='SQUAREFULL'  || pointType=='SQUAREGRADIENT' ) {  // a filled shape
            ctx.fillStyle = radgrad;
            if (borderWidth>0) {
                ctx.lineWidth=borderWidth;
                ctx.strokeStyle = borderColor;
           }
           ctx.rect(x0,y0,rectSize,rectSize) ;
          ctx.fill();
           ctx.stroke();

        } else {       // square or squarePlus
           ctx.fillStyle = '';
           ctx.strokeStyle =acolor;
           ctx.lineWidth = aLineWidth;
           ctx.globalCompositeOperation=gCompositeOperation;
           ctx.beginPath();
           ctx.rect(x0,y0,rectSize,rectSize) ;
           if (pointType=='SQUAREPLUS') {
               x0=ptX ;
               y0=ptY-rectSize/2 ;
               y1=ptY+rectSize/2 ; ;
               ctx.moveTo(x0,y0);  ctx.lineTo(x0,y1);         //downstroke
               x0=ptX-rectSize/2 ;
               x1=ptX+rectSize/2;
               y1=ptY  ; ;
               ctx.moveTo(x0,y1);  ctx.lineTo(x1,y1);   // horiz stroke
           }
           ctx.stroke();
        }


    } else if (pointType.substr(0,2)=='TR')  {   // TRIANGLE

       rectSize=parseInt(pt.PS) ;
        x0=ptX-rectSize/2;
        y0=ptY-rectSize/2 ;
        x1=ptX+rectSize/2;
        y1=ptY+rectSize/2 ;

       ctx.globalCompositeOperation=gCompositeOperation;
       ctx.beginPath();

       if (pointType!='TRIANGLE' && pointType!=='TRIANGLEU' && pointType!=='TRIANGLEBAR')  {                   // yes  fill
           radgrad = ctx.createLinearGradient(x0,y0,x1+(rectSize/3),y1+(rectSize/3));
       }
       if (pt.y> yMaxUse || pt.y<yMinUse)  {
           acolor='#dedede'; aLineWidth=1;
           if (pointType!='TRIANGLE'  && pointType!=='TRIANGLEU' && pointType!=='TRIANGLEBAR')  radgrad.addColorStop(0,acolor);
           rectSize=Math.max(1,dataPointSize/4) ;   // out of bounds dot
           x0=ptX-rectSize/2;
           y0=ptY-rectSize/2 ;
           x1=ptX+rectSize/2;
           y1=ptY+rectSize/2 ;
           radgrad = ctx.createLinearGradient(x0,y0,x1,y1);

       } else{
          acolor=pt.PC ;
          aLineWidth=pt.PB ;
          if (pointType!='TRIANGLE'  && pointType!=='TRIANGLEU' && pointType!=='TRIANGLEBAR') { // a filled triagle
             radgrad.addColorStop(0,acolor);
          }
       }
       if (pointType!='TRIANGLE'  && pointType!=='TRIANGLEU' && pointType!=='TRIANGLEBAR')  {     // a filled triagle
         if (pointType=='TRIANGLEGRADIENT') {
            radgrad.addColorStop(0.9, 'White');
         } else {
            radgrad.addColorStop(1.0,acolor);
         }
       }


       if (pointType!='TRIANGLEU'  && pointType!=='TRIANGLEFULLU'  )  {  // non-upside down triangle
           ctx.moveTo(x0,y1);
           ctx.lineTo(x1,y1);
           ctx.lineTo(ptX,y0);
           ctx.closePath();
       }else {
           ctx.moveTo(x0,y0);
           ctx.lineTo(x1,y0);
           ctx.lineTo(ptX,y1);
           ctx.closePath();

       }

        if (pointType!='TRIANGLE'  && pointType!=='TRIANGLEU' && pointType!=='TRIANGLEBAR') {   // a filled triangle (if not one of these)
              ctx.fillStyle = radgrad;
              ctx.fill();
             if (borderWidth>0) {
               ctx.lineWidth=borderWidth;
               ctx.strokeStyle=borderColor ;
               ctx.stroke();
             }

        } else {       // unfilled triangle

           ctx.fillStyle = '';
           ctx.strokeStyle =acolor;
           ctx.lineWidth = aLineWidth;
           ctx.stroke();

           if (pointType=='TRIANGLEBAR') {    // add a bar -- perahsp different color
              if (borderWidth>0) {
                let mx1=Math.max(1,parseInt(rectSize/3));     // don't make the bar too big
                mx1=Math.min(mx1,borderWidth);
                ctx.strokeStyle=borderColor ;
                ctx.lineWidth =  mx1;
             } else {
                ctx.strokeStyle =acolor;
                ctx.lineWidth = aLineWidth;
             }
              ctx.closePath();
              ctx.beginPath();
             ctx.moveTo(ptX,y0);
             ctx.lineTo(ptX,y1);
             ctx.stroke();
           }

       }

    } else {           // default is circle

       ctx.globalCompositeOperation=gCompositeOperation;
       ctx.beginPath();

       if (pointType!='CIRCLE' && pointType!='CIRCLEPLUS' && pointType!='CIRCLEBAR')   radgrad = ctx.createRadialGradient(ptX, ptY, 8, ptX - 5, ptY - 5, 0);
       rectSize=parseInt(pt.PS);

       if (pt.y> yMaxUse || pt.y<yMinUse)  {
           acolor='#dedede';   aLineWidth=1;
           if (pointType!='CIRCLE' && pointType!='CIRCLEPLUS' && pointType!='CIRCLEBAR')  radgrad.addColorStop(0,acolor);
           arcSize=Math.max(1,dataPointSize/4) ;   // out of bounds dot
       } else{
          acolor=pt.PC ;
          aLineWidth=pt.PB ;
          if (pointType!='CIRCLE' && pointType!='CIRCLEPLUS' && pointType!='CIRCLEBAR') {
              radgrad.addColorStop(0,acolor);
          }
          arcSize=parseInt(pt.PS)/2;
       }
       if (pointType!='CIRCLE' && pointType!='CIRCLEPLUS' && pointType!='CIRCLEBAR')  {
         if (pointType=='CIRCLEGRADIENT') {
            radgrad.addColorStop(0.9, 'White');
         } else {
            radgrad.addColorStop(1.0,acolor);
         }
       }
       if (pointType!='CIRCLE' && pointType!='CIRCLEPLUS' && pointType!='CIRCLEBAR')   {
           ctx.fillStyle = radgrad;
       } else {
           ctx.fillStyle = '';
       }

       //Render circle
       ctx.arc(ptX, ptY, arcSize, 0, 2 * Math.PI, false)
       if (pointType!='CIRCLE' && pointType!='CIRCLEPLUS' && pointType!='CIRCLEBAR')   ctx.fill();
       ctx.lineWidth = aLineWidth;
        if (pointType!='CIRCLE' && pointType!='CIRCLEPLUS' && pointType!='CIRCLEBAR') {
            ctx.strokeStyle = '#000';
            if (borderWidth>0) {
               ctx.lineWidth=borderWidth;
               ctx.strokeStyle=borderColor ;
            }

        } else {
            ctx.strokeStyle =acolor;
        }
       if (pointType=='CIRCLEPLUS' || pointType=='CIRCLEBAR') {

           x0=ptX ;
           if (pointType=='CIRCLEPLUS') {
             y0=ptY-rectSize/2 ;
             y1=ptY+rectSize/2 ; ;
             ctx.moveTo(x0,y0);  ctx.lineTo(x0,y1);         //downstroke
           }    // horiz stroke for both bar and plus
           x0=ptX-rectSize/2 ;
           x1=ptX+rectSize/2;
           y1=ptY  ; ;
             ctx.moveTo(x0,y1);  ctx.lineTo(x1,y1);   // horiz stroke
       }
       ctx.stroke();
       ctx.closePath();

   }   // circle (default)   fill

// shape is now drawn? Draw some kind of emphasiser around it?
   let esize= (typeof(pt.ES)!=='undefined') ?  pt.ES : 0 ;
   if (!isNaN(esize) && esize>0) {
         y0=ptY-esize/2 ;
         x0=ptX-esize/2 ;

         ctx.globalCompositeOperation=gCompositeOperation;
         ctx.shadowColor = '#d53';
         ctx.strokeStyle = pt.EC ;
         ctx.lineWidth = pt.EB ;
          ctx.lineJoin = 'bevel';
          ctx.shadowBlur = 1;
          ctx.beginPath();
          ctx.rect(x0,y0,esize,esize) ;
          ctx.stroke();
          ctx.closePath();
          ctx.lineJoin = 'miter';
          ctx.shadowBlur = 0;

   }
 }


//===========================
// create a colorHash table -- to match pixel color to a shape
//
// hitInfo contains colorhash table (to be updated)
//  alist is ont of pointsdone,linesdone,or barsdone
//  itype identifies which one!
//    1 pointsDone: dataPoint id, x ploc, y ploc, circle radius in px
//    2 linesDone:  dataPoint id (vertext 1), x ploc, y ploc, dataPoint id (vertex 2), x ploc, y ploc
//    3 barsDone :  dataPoint id , upper left x ploc, upper left y ploc, width, height
//       ploc, width, and height are in pixels in the chart (NOT the entire canvas)  --- 0,0 is upper left corner of chart (top of x axis)
//
//   1 pointsDone: dataPoint id, x ploc, y ploc, circle radius in px
//   2 linesDone:  dataPoint id (vertex 1), x ploc, y ploc, dataPoint id (vertex 2), x ploc, y ploc
//   3 barsDone :  dataPoint id , upper left x ploc, upper left y ploc, width, height
//
// pdata is the original data, plus extra stuff
// plotnum is the current plot number (call to render since last clearAll
// aCtx is the worksspace canvas
//
//  colorHash table is object with:
//    ncolors : entries in hashTable
//    hashTable:   object, indesx by colorKey. Each element (as indexed by colorkey) is an array of [type][index][data]
//         type = 1:point, 2=line, 3=bar;
//         index is 0.. index into pointsDone,linesDone, or barsDone
//         data:  the shape specs from the dataObj (in call to render)
//               index: index into data
//

 var render_addToChash = function(hInfo,itype,alist,pdata,plotNum,actx) {
      var colorKey,ic,alookups=[];
      var acolor,arow,ic,ptX,ptY,prevX,prevY,awide,aheigh,apdata     ;

      let chash0=hInfo['colorHash'];
      let cHash=chash0['hashTable'];
      let ncolors=chash0['ncolors'];

// create unique colors for each item  in alist (i.e.; each point) -- starting from ncolors

      for (ic=0;ic<alist.length;ic++) {
         colorKey = renderGetNthColor(ic+ncolors,plotNum);
          cHash[colorKey]=[itype,ic];                         // type: type of shape. Ic= index into specific shape list (i.e.; pointsDone)
         if (itype==1 || itype==3) {
               indx=alist[ic][0];
               apdata=JSON.parse(JSON.stringify(pdata[indx]));    // the stuff provided in call to render (for this data point)
               apdata['index']=indx;  // pointer into dataPoints
               apdata['plotNum']=plotNum;
               cHash[colorKey].push(apdata);
           }
           if (itype==2) {
               indx=alist[ic][0];
               apdata=JSON.parse(JSON.stringify(pdata[indx])) ;
               apdata['index']=indx; apdata['plotNum']=plotNum;
               cHash[colorKey].push(apdata);
               indx=alist[ic][3];
               apdata=JSON.parse(JSON.stringify(pdata[indx]));
               apdata['index']=indx; apdata['plotNum']=plotNum;
               cHash[colorKey].push(apdata);
           }
           alookups[ic]=colorKey;          // color to use to draw on hitImage (for plist item ic)
       }   // for all shapes in alist

       hInfo['colorHash']['ncolors']=ncolors+alist.length ;

// draw to hitimage
     for (ic=0;ic<alookups.length;ic++) {   // alookups is one-to-one match with alist
         acolor=alookups[ic];
         arow=alist[ic];
         if (itype==1)  {               // point: -- use a circle for all shapes (circles, triangles, rectangles, etc
             ptX=parseInt(arow[1]); ptY=parseInt(arow[2]);   arad=Math.min(arow[3],6);  // make sure it isn't too small to miss click detection
             actx.beginPath();

             actx.arc(ptX, ptY, arad, 0, 2 * Math.PI, false);
             actx.fillStyle = acolor;
             actx.fill();
             actx.closePath();
        }
         if (itype==2) {           // line
           prevX=arow[1]; prevY=arow[2]; ptX=arow[4]; ptY=arow[5];
           actx.beginPath();
           actx.strokeStyle = acolor;
           actx.lineWidth = 8 ;      // 8 px wide for easier detection
           actx.moveTo(prevX, prevY);
           actx.lineTo(ptX, ptY);
           actx.stroke();
          }
         if (itype==3) {           // bar
             ptX=arow[1]; ptY=arow[2];   awide=arow[3]; aheight=arow[4];
             actx.fillStyle = acolor;
             actx.fillRect(ptX,ptY,awide,aheight );
        }
    }

// the hiddent canvas (actx) now has colors corresponding to shapes (colorHash maps these colors to original data used to create the shape
    return 1;
  }




//  ============ secondary public and private functions



// ==========================
//  ........ Modify the badObs() array  .....

     var findBadObs = function() {              // ::::::::::::::: out of range obsertvations  ::::::::::

      var i,apt;
      for (i = 0; i < data.dataPoints.length; i++) {
           apt=data.dataPoints[i];
           if (xCategory==0) {
              if (apt.x < xMinUse || apt.x> xMaxUse) {
               badObs[i]=20;
               continue;    // don't check for out of range y
              }
           }
           if (apt.y < yMinUse || apt.y>yMaxUse) {
               if (skipYout==1) {
                    badObs[i]=30;     // skip
               } else {
                    badObs[i]=31;     // draw lightly
               }
           }
      }
      return 1;
   }

//======= fix up the data specs (case insensitive, etc

    var fixDataSpecs = function () {       // :::::::::::::: get min and max values of x and Y data  ::::::::::::::::::
        var ii,apt,apt1,ia,cia,akey,apt1={},tt;
        var zz=0;
        for (ii=0;ii<data.dataPoints.length;ii++)  {
            apt=data.dataPoints[ii];
            apt1={};
            apt1['LC']=lineColor ; apt1['LS']=lineWidth ; apt1['LD']=isDotted;
            apt1['PS']=dataPointSize; apt1['PC']=dataPointColor;  apt1['PT']=dataPointType;    apt1['PB']=dataPointBorder;
            apt1['BC']=filledBorderColor ;  apt1['BW']=filledBorderWidth ;
            apt1['TC']=dataPointTextColor ;
            apt1['HW']=barWidth ;   
            apt1['HC']=barColor ;
            apt1['ID']='' ;
            apt1['ES']=emphasisSize;
            apt1['EB']=emphasisBorder;
            apt1['EC']=emphasisColor ;
            apt1['INFO']={};      // stuff that can be used later
;

            for (ia in apt) {                      // for each attribute
               cia=jQuery.trim(ia).toUpperCase();
               if (cia.substr(0,1)=='X')  apt1['x']=apt[ia];
               if (cia.substr(0,1)=='Y')  apt1['y']=apt[ia];

               if (cia.substr(0,2)=='PC' || cia=='POINTCOLOR')   apt1['PC']= apt[ia] ;
               if (cia.substr(0,2)=='PS' || cia=='POINTSIZE' || cia.substr(0,2)=='PH' || cia.substr(0,2)=='PW')   apt1['PS']= apt[ia] ;     // ph and pw are synonyms for PS
               if (cia.substr(0,2)=='PB' ||  cia=='PL' ||cia=='POINTBORDER' || cia=='POINTLINE' )   apt1['PB']=apt[ia] ;


               if (cia.substr(0,2)=='ES' ||    cia=='EMPHASISSIZE'  ) {
                   apt1['ES']=parseInt(apt[ia]) ;
                   if (apt1['ES']>0)  zz++ ;
               }
               if (cia.substr(0,2)=='EB' ||    cia=='EMPHASISBORDER'  )   apt1['EB']=apt[ia] ;
               if (cia.substr(0,2)=='EC' ||    cia=='EMPHASISCOLOR'  )   apt1['EC']=apt[ia] ;


               if (isNaN(apt1['PS'])) apt1['PS']=2;     // width of shape
               if (isNaN(apt1['PB'])) apt1['PB']=1;      // border line width

               if (cia.substr(0,2)=='PT' || cia=='POINTTYPE')   {
                   tt=jQuery.trim(apt[ia]).toUpperCase();
                   if (typeof(dataPointAbbrev[tt])!='undefined')  tt=dataPointAbbrev[tt];
                   if (typeof(okDataPointTypes[tt])=='undefined') tt='CIRCLEGRADIENT';           // okDataPointTypes defined in closure of this function
                   apt1['PT']= tt ;
               }

               if (cia.substr(0,2)=='BC' || cia=='FILLEDBORDERCOLOR')   apt1['BC']= apt[ia] ;
               if (cia.substr(0,2)=='BW' || cia=='FILLEDBORDERWIDTH')   apt1['BW']= apt[ia] ;


               if (cia.substr(0,2)=='LC' || cia=='LINECOLOR') {  apt1['LC']= apt[ia] ; continue;}
               if (cia.substr(0,2)=='LS' || cia=='LINESIZE')  { apt1['LS']= apt[ia] ;   continue;}
               if (cia.substr(0,2)=='LD' || cia=='LINEDOTTED'){
                    apt1['LD']=makeDotted(apt[ia]) ;
                    continue;
                 };

               if (cia.substr(0,1)=='L')     apt1['L']=apt[ia];     // has to be after LC and LS

               if (cia.substr(0,2)=='TC' || cia=='TEXTCOLOR')  apt1['TC']= apt[ia] ;

               if (cia.substr(0,2)=='HW' || cia=='BARWIDTH')  apt1['HW']= apt[ia] ;
               if (cia.substr(0,2)=='HC' || cia=='BARCOLOR')  apt1['HC']= apt[ia] ;

               if (cia.substr(0,2)=='ID')  apt1['ID']= apt[ia] ;
               if (cia =='INFO')  apt1['INFO']= apt[ia] ;   // this should be an array

           }                             // atttributes
           if (typeof(apt1.L)=='undefined' && typeof(apt1.y)!=='undefined') {
              apt1.L=jQuery.trim(apt1.y) ;
           }
           data.dataPoints[ii]=apt1;                // if X or Y not specified, it won't be in this row (and will be caught by getMaxDataValue
        }                               //data rows


         return 1;
    }


//  ... get min and max values AND check for badObs for each i. badObs flags: 0=ok, 1=bad Y, 10=bad x, 11=bad x and y . X is NOT checked if xCategory=1    .....
// badobs of 20,30,and 31 set AFTER min/max determined (in findBadObs

    var getMaxDataValue = function () {       // :::::::::::::: get min and max values of x and Y data  ::::::::::::::::::
     if  (typeof(data.dataPoints.length)=='undefined') {           // no data, use alarge values
        maxYValue=100000000000000000000;       // globals
        minYValue = -minYValue ;
        maxXValue=100000000000000000000;       // globals
        minXValue = -minXValue ;
        return '';
     }

      var xy,i1 ;
         minYValue=100000000000000000000;       // globals
        maxYValue = -minYValue ;
        minXValue=100000000000000000000;       // globals
        maxXValue = -minXValue ;
       errs='';
        for (var i = 0; i < data.dataPoints.length; i++) {
            badObs[i]=0;
            i1=i+1;
            if (typeof(data.dataPoints[i].x)=='undefined') {
                errs+=' ;  x value not specified (row '+i1+')' ;
                badObs[i]+=10;
            }
            if (typeof(data.dataPoints[i].y)=='undefined') {
                errs+=' ;  y value not specified (row '+i1+')' ;
                badObs[i]+=1;
            }
            if (badObs[i]!==0) continue ;

            xy=data.dataPoints[i].y ;
            if (jQuery.trim(xy)==='' || isNaN(xy)) {
                errs+=';  non-numeric Y value row '+i1+' ('+xy+')';
                badObs[i]+=1;
            } else {
               maxYValue=Math.max(maxYValue,xy);
               minYValue=Math.min(minYValue,xy);
            }

            if (xCategory==0) {               // no checking if x if "categorical x"
               xy=data.dataPoints[i].x ;
               if (jQuery.trim(xy)==='' || isNaN(xy)) {
                   errs+=';  non-numeric X value row '+i1+' ('+xy+')';
                   badObs[i]+=10;
               } else {
                  maxXValue=Math.max(maxXValue,xy);
                  minXValue=Math.min(minXValue,xy);
               }
             }
        }
        return errs ;
    };


//========
// createa dotted line specs from csv
   var    makeDotted= function(isDotted0) {
      var tt=[],vv2,iv ;                 // create argment for setLineDash. Default is solid
      isDotted0=jQuery.trim(isDotted0);
      if (isDotted0=='' || isDotted0==0) return [];
      if (isDotted0=='2') return [1,1];
      if (isDotted0=='10') return [10,10];

      vv2=splitCsv(isDotted0);
      if (vv2.length==1) vv2[1]=vv2[0];   // make sure there are at least 2 elements
      for (iv=0;iv<vv2.length;iv++) {
                a1=jQuery.trim(vv2[iv]);
                if (isNaN(a1)) continue  ;     // ignore
                tt.push(parseInt(a1));
        }

      return tt;
  }


//================
// get rgba information, as an array [red,green,blue,alpha] from an imageInfo object
  var renderGetPixelColor = function(imgInfo,xat,yat) {

      if (typeof(imgInfo)!=='object') {
           alert('Error in renderGetPixelColor: imgInfo is not an object: '+typeof(imgInfo)) ;
           return false ;
      }

      let checkems=['data','height','width'];
      for (let aa of checkems) {
         if (typeof(imgInfo[aa])=='undefined') {
           alert('Error in renderGetPixelColor: missing field ('+aa+') in imgImfo.  ');
           return false;
         }
      }
      if (yat<0 || yat>imgInfo.height) return [];    // [] means point out of bounds
      if (xat<0 || xat>imgInfo.width) return [] ;
      xat=parseInt(xat); yat=parseInt(yat);
      let red = yat * (imgInfo.width * 4) + xat * 4;
      return [ imgInfo.data[red], imgInfo.data[red + 1], imgInfo.data[red + 2], imgInfo.data[red + 3] ];

  }

// .................... this creates a lookup image  https://lavrton.com/hit-region-detection-for-html5-canvas-and-how-to-listen-to-click-events-on-canvas-shapes-815034d7e9f8/

  var    renderGetRandomColor= function() {
     const r = Math.round(Math.random() * 255);
     const g = Math.round(Math.random() * 255);
     const b = Math.round(Math.random() * 255);
     return `rgb(${r},${g},${b})`;           // ES6 language feature
  }

    var    renderGetNthColor= function(nth0,jnum) {        // jnum not use (could be used for a, but that messes up otehr stuff
     let nth=nth0+1;
     let rgb = [(nth & 0xff0000) >> 16,  (nth & 0x00ff00) >> 8,  (nth & 0x0000ff)]
//     let a= (jnum % 255)*0.01 ;  // up to 100 plots, then stays at 255
     const r = rgb[0];
     const g = rgb[1];
     const b = rgb[2];
     return `rgb(${r},${g},${b})`;           // ES6 language feature
  }


//================
// click handler. Calls the user specified click handler
var canvasChartClickHander = function(evt) {
  if (typeof(evt.data['clickFunc'])!=='function') {
      alert('canvasChartClickHandler: clickFunc not a proper function: '+typeof(evt.data['clickFunc']));
      return 1;
  }
  if (evt.type=='mousedown') evt.data['clickCount']++;
 
  let nowLoc=renderMouseXY(evt,1) ; // use 2nd arg
  let priorLoc=evt.data['clickFuncPriorLoc'];
  evt.data['clickFuncPriorLoc']=nowLoc  ;    // used on next click

  evt.data['clickFunc'](evt,{'prior':priorLoc,'now':nowLoc,'count':evt.data['clickCount']});

}

//================
//  ....  mouse click to x,y ... and info on a shape (if click on a shape -- a point, a line, a bar)
// uses data.chartSpecs: information on the chart. Designed for use by renderMouseXY
//     plotNum :  incremente d on each call, reset to 1 if clearall=1
//     width  : (of charting area, not including margins)
//     height: (of charting area, not including margins)
//     hitInfo, an object with fields
//          image  : a getImageData type of array that identifies "shapes" (NOT meant for display). width, height, data fields
//          retTime : time (unix milliseconds) of creation
//          colorHash: table that matches the colors in "image" to shape information
//
//  colorHash: lookup table. uses rgb keys to store data on "what shape created this pixel"



   var renderMouseXY = function(evt,quick) {       // quick 1 if called from  canvasChartClickHander

    var yOffset,xOffset,etarg,rect,xCategory,maxY,minY,mouseX2,mouseY2,yInc,xInc,rect,yVal2,xVal2,ix,indx;
    var matchType,matchId,daSpot={},daMatch,px1,mSay,px1d,tcolor,mouseX1,mouseY1,scTop,scLeft;
    var mnames=['n.a.','point','line','bar'];

    mouseX1=evt.clientX; mouseY1=evt.clientY ;
    daSpot['clientPixel']={'x':mouseX1,'y':mouseY1};
    
      scTop=0; scLeft=0;
      etarg=$(evt.target);
      rect = etarg[0].getBoundingClientRect()    ; // location of the canvas element
      chartBounds=evt.data.chartBounds;

     yOffset=rect.top + scTop +  chartBounds[1]  ;  // these are used to convert mouse clicks to postion in charting area (not in the canvas area). So 0,0 is top of x axis.
     xOffset=rect.left + scLeft + chartBounds[0]   ;
     mouseX2 = mouseX1 - xOffset;
     mouseY2 = mouseY1 - yOffset;

      daSpot['pixel']={'x':mouseX2,'y':mouseY2};

     maxY=evt.data.plotMaxY;
     minX=evt.data.plotMinX ;
     yInc=evt.data.plotYinc;
     xInc=evt.data.plotXinc;

     xCategory=evt.data.xCategory;

     yVal2=maxY - (mouseY2*yInc);

    if (xCategory==0) {
       xVal2=minX + (mouseX2*xInc);
    } else {                     // category? Than return the X value associated with this bar
      ix=(mouseX2*xInc);                    // which bar #
      xVal2=ix.toFixed(2) ;       // nth category (approximate).
    }

     daSpot['value']={'x':xVal2,'y':yVal2};

     if (arguments.length>1 && quick==1) return daSpot ; //canvasChartClickHander called
// look in chartSpecs.hitInfo
// 1 pointsDone: dataPoint id, x ploc, y ploc, circle radius in px
// 2 linesDone:  dataPoint id (vertext 1), x ploc, y ploc, dataPoint id (vertex 2), x ploc, y ploc
// 3 barsDone :  dataPoint id , upper left x ploc, upper left y ploc, width, height

    var idd,dInfo,dInfo2,idd2;
    var priorImage=evt.data.chartSpecs.hitInfo.image  ;

    mouseX2=parseInt(mouseX2); mouseY2=parseInt(mouseY2);


      px1d=renderGetPixelColor(priorImage,mouseX2,mouseY2);

      if (px1d[0]==0 && px1d[1]==0 && px1d[2]==0)  { //no match
          daSpot['shape']={'type':0,'id':-1,'nAvail':evt.data.chartSpecs.hitInfo.colorHash.ncolors,'pixel':px1d};
           return daSpot;
      }

      if (debugMode==1)  alert('render: '+otherInfo+' :  in renderMouseXY: '+mouseX2+', '+mouseY2+' '+px1d);

      tcolor = `rgb(${px1d[0]},${px1d[1]},${px1d[2]})`;

      matchType=0; matchId=0;

      if (typeof(evt.data.chartSpecs.hitInfo.colorHash.hashTable[tcolor])!=='undefined') {
           matchType=evt.data.chartSpecs.hitInfo.colorHash.hashTable[tcolor][0];
           matchId=evt.data.chartSpecs.hitInfo.colorHash.hashTable[tcolor][1];
            dInfo=[]; dInfo2=0;
           if (matchType==1 || matchType==3) {
               dInfo=evt.data.chartSpecs.hitInfo.colorHash.hashTable[tcolor][2];        // dataPoint  info for this matching point
           }
           if (matchType==2) {
              dInfo=evt.data.chartSpecs.hitInfo.colorHash.hashTable[tcolor][2];
              dInfo2=evt.data.chartSpecs.hitInfo.colorHash.hashTable[tcolor][3];
           }
           daSpot['shape']={'type':matchType,'index':matchId,'obsInfo':dInfo,'obs2Info':dInfo2};

      }  else {
           daSpot['shape']={'type':0,'id':-1,'nAvail':evt.data.chartSpecs.hitInfo.colorHash.ncolors,'pixel':px1};
      }

      return daSpot;
   }


// ...... helper functions ........

    var getXInc = function() {                            // ::::::::::::::::::: compute x increment (pixel seperation) :::::::::::::::;;;
       var dx ,ainc;
       if (xCategory==1)  {                               // x values have no import -- so divide x axis into # of specified points

           let v1=xMaxPx / data.dataPoints.length;
           let ainc= (v1>2) ? Math.round(v1)-1  : 1 ;            // if more categories than pixels, will overwrite
           return ainc;

       }
       dx=xMaxUse - xMinUse ;
       ainc=xMaxPx/dx ;

       return ainc;
    };


    var    renderPxToYval = function(ydo) {         // :::::  convert a Y pixel value to a Y value (uses globals). WIthin chart area (ignores margins) :::::::::::
       var  dyPx=ydo/chartAreaHeightPx ;           // fraction of charting area. 0 means "top". Larger values are down, hence LOWER y values
       var dyVal=(dyPx*chartAreaHeightValues);
       var ylineVal=yMaxUse-dyVal ;             // note that top line has a value of yMaxUse ;
       return ylineVal;
    }
    var    renderPxToYval2 = function(ydo) {         // :::::  convert a Y pixel value to a Y value (uses globals).  for "2nd y asix"
       var  dyPx=ydo/chartAreaHeightPx ;           // fraction of charting area. 0 means "top". Larger values are down, hence LOWER y values
       var dyVal=(dyPx*chartAreaHeightValues2);
       var ylineVal=yMaxUse2-dyVal ;             // note that top line has a value of yMaxUse ;
       return ylineVal;
    }


    var    renderValToPx = function(ydoVal,zztype) {         // :::::::::::::: convert a y value to a y pixel. uses globals.   WIthin chart area (ignores margins)  :::::::::::

       var yRel=yMaxUse-ydoVal ;                    //  how much less than maximu (if -, above maximum)
        if (chartAreaHeightValues==0) return 1 ;
       var dy=yRel/chartAreaHeightValues ;
       var aPx=dy*chartAreaHeightPx;

       return aPx;
    }

    var    renderXValToPx = function(xdoVal) {         // :::::::::::::: convert a x value to a x pixel. uses globals.   WIthin chart area (ignores margins)  :::::::::::
       if (xdoVal<xMinUse || xdoVal>xMaxUse) {
           return '' ;  // '' signals "out of range"
       }
       var dx=xdoVal - xMinUse ;
       var aPx=xInc*dx;         // xInc compute previously (getXinc())  -- the number of pixels for a change in x value (xinc) of 1.0
       return aPx;
    }



    var drawLine = function(startX, startY, endX, endY, strokeStyle, lineWidth,isDotted,debut) {      // :::::::::: draw a line from start to end :::::::::::::

        if (lineWidth != null) {
           if (lineWidth==0) return ;                       // do NOT draw if 0 width
           ctx.lineWidth = lineWidth;
        }

        if (debut==1) alert([startX,startY,endX,endY,isDotted,lineWidth]);

        if (strokeStyle != null) ctx.strokeStyle = strokeStyle;

        if (isDotted != null)  ctx.setLineDash(isDotted);
        ctx.globalCompositeOperation=gCompositeOperation;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.closePath();
        if (isDotted != null)  ctx.setLineDash([]);   // reset to solid

    };

    var renderGetTrace = function() {
        return renderTrace ;
    }

// ----- split on single space, or comma surrounded by space
// if toNumber, convert each item to a real value
   var  splitCsv=function(astring,toNumber) {
       if (arguments.length<2) toNumber=0;
        astring=astring.replace(/\s+/g,' ');
        astring=astring.replace(/[\s]*\,[\s]*/g,',');
        vv=astring.split(/[\s,]/);
        if (toNumber==1) {
            for (let ii=0;ii<vv.length;ii++) vv[ii]=parseFloat(vv[ii]);
        }
       return vv ;
   }
//=============
// emulate php sprintf
// Note use of args to read arguments (one or more)
var sprintf=function() {      //  discuss at: https://locutus.io/php/sprintf/

 //   example 1: sprintf("%01.2f", 123.1)
  //   returns 1: '123.10'
  //   example 2: sprintf("[%10s]", 'monkey')
  //   returns 2: '[    monkey]'
  //   example 3: sprintf("[%'#10s]", 'monkey')
  //   returns 3: '[####monkey]'
  //   example 4: sprintf("%d", 123456789012345)
  //   returns 4: '123456789012345'
  //   example 5: sprintf('%-03s', 'E')
  //   returns 5: 'E00'
  //   example 6: sprintf('%+010d', 9)
  //   returns 6: '+000000009'
  //   example 7: sprintf('%+0\'@10d', 9)
  //   returns 7: '@@@@@@@@+9'
  //   example 8: sprintf('%.f', 3.14)
  //   returns 8: '3.140000'
  //   example 9: sprintf('%% %2$d', 1, 2)
  //   returns 9: '% 2'

  const regex = /%%|%(?:(\d+)\$)?((?:[-+#0 ]|'[\s\S])*)(\d+)?(?:\.(\d*))?([\s\S])/g
  const args = arguments
  let i = 0
  const format = args[i++]

  const _pad = function (str, len, chr, leftJustify) {
    if (!chr) {
      chr = ' '
    }
    const padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr)
    return leftJustify ? str + padding : padding + str
  }

  const justify = function (value, prefix, leftJustify, minWidth, padChar) {
    const diff = minWidth - value.length
    if (diff > 0) {
      // when padding with zeros
      // on the left side
      // keep sign (+ or -) in front
      if (!leftJustify && padChar === '0') {
        value = [
          value.slice(0, prefix.length),
          _pad('', diff, '0', true),
          value.slice(prefix.length)
        ].join('')
      } else {
        value = _pad(value, minWidth, padChar, leftJustify)
      }
    }
    return value
  }

  const _formatBaseX = function (value, base, leftJustify, minWidth, precision, padChar) {
    // Note: casts negative numbers to positive ones
    const number = value >>> 0
    value = _pad(number.toString(base), precision || 0, '0', false)
    return justify(value, '', leftJustify, minWidth, padChar)
  }

  // _formatString()
  const _formatString = function (value, leftJustify, minWidth, precision, customPadChar) {
    if (precision !== null && precision !== undefined) {
      value = value.slice(0, precision)
    }
    return justify(value, '', leftJustify, minWidth, customPadChar)
  }

  // doFormat()
  const doFormat = function (substring, argIndex, modifiers, minWidth, precision, specifier) {
    let number, prefix, method, textTransform, value

    if (substring === '%%') {
      return '%'
    }

    // parse modifiers
    let padChar = ' ' // pad with spaces by default
    let leftJustify = false
    let positiveNumberPrefix = ''
    let j, l

    for (j = 0, l = modifiers.length; j < l; j++) {
      switch (modifiers.charAt(j)) {
        case ' ':
        case '0':
          padChar = modifiers.charAt(j)
          break
        case '+':
          positiveNumberPrefix = '+'
          break
        case '-':
          leftJustify = true
          break
        case "'":
          if (j + 1 < l) {
            padChar = modifiers.charAt(j + 1)
            j++
          }
          break
      }
    }

    if (!minWidth) {
      minWidth = 0
    } else {
      minWidth = +minWidth
    }

    if (!isFinite(minWidth)) {
      throw new Error('Width must be finite')
    }

    if (!precision) {
      precision = (specifier === 'd') ? 0 : 'fFeE'.indexOf(specifier) > -1 ? 6 : undefined
    } else {
      precision = +precision
    }

    if (argIndex && +argIndex === 0) {
      throw new Error('Argument number must be greater than zero')
    }

    if (argIndex && +argIndex >= args.length) {
      throw new Error('Too few arguments')
    }

    value = argIndex ? args[+argIndex] : args[i++]

    switch (specifier) {
      case '%':
        return '%'
      case 's':
        return _formatString(value + '', leftJustify, minWidth, precision, padChar)
      case 'c':
        return _formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, padChar)
      case 'b':
        return _formatBaseX(value, 2, leftJustify, minWidth, precision, padChar)
      case 'o':
        return _formatBaseX(value, 8, leftJustify, minWidth, precision, padChar)
      case 'x':
        return _formatBaseX(value, 16, leftJustify, minWidth, precision, padChar)
      case 'X':
        return _formatBaseX(value, 16, leftJustify, minWidth, precision, padChar)
          .toUpperCase()
      case 'u':
        return _formatBaseX(value, 10, leftJustify, minWidth, precision, padChar)
      case 'i':
      case 'd':
        number = +value || 0
        // Plain Math.round doesn't just truncate
        number = Math.round(number - number % 1)
        prefix = number < 0 ? '-' : positiveNumberPrefix
        value = prefix + _pad(String(Math.abs(number)), precision, '0', false)

        if (leftJustify && padChar === '0') {
          // can't right-pad 0s on integers
          padChar = ' '
        }
        return justify(value, prefix, leftJustify, minWidth, padChar)
      case 'e':
      case 'E':
      case 'f': // @todo: Should handle locales (as per setlocale)
      case 'F':
      case 'g':
      case 'G':
        number = +value
        prefix = number < 0 ? '-' : positiveNumberPrefix
        method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(specifier.toLowerCase())]
        textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(specifier) % 2]
        value = prefix + Math.abs(number)[method](precision)
        return justify(value, prefix, leftJustify, minWidth, padChar)[textTransform]()
      default:
        // unknown specifier, consume that char and return empty
        return ''
    }
  }

  try {
    return format.replace(regex, doFormat)
  } catch (err) {
    return false
  }
}    // end of sprintf



// ---------------------------------
// Pre and post processing functions. These are publically available

//===============
// update a dataPoints array
// this calls by reference, so  does NOT create a new copy -- dataDo is modified "in place"
// returns -1 if a problem. # of rows changed otherwise
// Adds 'X', 'Y', and 'OTHER' to ech points 'INFO' field
var updateINFO=function(dataDo,otherData) {
    if (arguments.length<1) {
       if (typeof(data)=='undefined') return false  ;
       if (typeof(data.dataPoints)=='undefined') return false ;
       if (typeof(data.dataPoints)=='undefined') return false ;
       if (typeof(data.dataPoints.length)=='undefined') return false ;
       dataDo=data.dataPoints ; // got something from prior call!
    }
    if (arguments.length<2) {
       otherData=[];
    } else {    // if a scaler, create an array filled with tis calr
        if (typeof(otherData)=='string' ||typeof(otherData)=='number' || typeof(otherData)=='boolean') {
            let tmp1=otherData;  otherData=[];
            for (let j=0;j<dataDo.length;j++) otherData[j]=tmp1;
        }
    }    // else, otherdata is array or object so use as is

    ndid=0;
    for (let i in  dataDo) {
        let d1=dataDo[i];
        if (!dataDo[i].hasOwnProperty('INFO')) dataDo[i]['INFO']={};
        let oinfo={};
        oinfo['XORIG']=d1.x;
        oinfo['YORIG']=d1.y;
        oinfo['OTHER']='';
        if (otherData.hasOwnProperty(i)) oinfo['OTHER']=otherData[i]  ;
        dataDo[i]['INFO']=oinfo;
        ndid++;
    }
    return ndid;

}

//==============================
// convert .y values in dataPonts (using yRange and yRange2
// returns new array: where the .y values are rescaled (so that yrange2[0]=yrange1[0] and yrange2[1]=yrange1[1])

  var rescaleY=function(data2,yRangeA,yRangeB) {
  let yrange1=[],yrange2=[];
  let newdata=[];
  if ($.isArray(yRangeA) || $.isPlainObject(yRangeA)) {
     yrange1=yRangeA;
   } else {
     yrange1= wsCanvasChart.splitCsv(yRangeA,1);
   }
   if (yrange1.length<2) return data2;
   if (isNaN(yrange1[0]) || isNaN(yrange1[1])) return data2 ;

   if ($.isArray(yRangeB) || $.isPlainObject(yRangeB)) {
     yrange2=yRangeB;
   } else {
     yrange2= wsCanvasChart.splitCsv(yRangeB,1);
   }
   if (yrange2.length<2) return data2;
   if (isNaN(yrange2[0]) || isNaN(yrange2[1])) return data2 ;

   let dy1=yrange1[1]-yrange1[0];
   if (dy1<=0) return data2 ;
   let dy2=yrange2[1]-yrange2[0];
   if (dy2<=0) return data2 ;
   yscale=dy1/dy2;
//   alert([yscale,dy1,dy2]);
   for (let ij=0;ij<data2.length;ij++) {
       let d2new={};
       let d2=data2[ij];
       for (jv in d2) {
           let cval=d2[jv];
           d2new[jv]=cval;
           let tjv=jv.toUpperCase();
           if (tjv!=='Y') continue ;  // leave this attribute as is

           d2new['origY']=cval;
           let frac2=(cval-yrange2[0])/dy2 ;
           let addme=(frac2*dy1)
           let danew=yrange1[0]+addme ;
           d2new[jv]=danew;           // change the y attribute

       }      // all attirbs
       newdata[ij]=d2new;
   }  // data2

   return newdata   ;
 }

// -----------------------------
// return info on a datapoints array
// If no arguments, use the most recently specified dataPoints.
//    If no most recently specified data points, return {'n':-1]
// n : # of rows
// xRange:[xmin,xmax]
// yRange: [ymin,ymax]
  var getRanges=function(dataDo ) {
     var stuff={'n':-1};

    if (arguments.length<1) {
       if (typeof(data)=='undefined') return stuff;
       if (typeof(data.dataPoints)=='undefined') return stuff;
       if (typeof(data.dataPoints)=='undefined') return stuff;
       if (typeof(data.dataPoints.length)=='undefined') return stuff;
       dataDo=data.dataPoints ; // got something from prior call!
    }

   var xrangeLow,yrangeLow,xrangeHigh,yrangeHigh,nobs=0,q1=true;
   for (let aval of dataDo) {
      nobs++  ;
      if (q1) {             // hack to use first in array (just in case this is a sparse array, don't use [0] element
        xrangeLow=aval['x'];   xrangeHigh=aval['x'] ;
        yrangeLow=aval['y'];   yrangeHigh=aval['y'] ;
        q1=false;
     } else {
        xrangeLow=Math.min(xrangeLow,aval['x']);   xrangeHigh=Math.max(xrangeHigh,aval['x']) ;
        yrangeLow=Math.min(yrangeLow,aval['y']);   yrangeHigh=Math.max(yrangeHigh,aval['y']) ;
      }
   }
   stuff['n']=nobs;
   stuff['xRange']=[xrangeLow,xrangeHigh];
   stuff['yRange']=[yrangeLow,yrangeHigh];
  return  stuff ;
}

//============================
// add points to create a "step function"
// this assume dataPoints is a  matrix with rows 0...n . Each row has .x and .y attributes (or .X and .Y)
// stepBelow=1 means "steps" are "below" line graph. 0 (the default) is above

var makeSteps=function(dataPoints1,stepBelow,useEc,useEs) {

  if (arguments.length<2) stepBelow=0 ;
  var newdata=[],wasx=0,wasY=0;
  var jlast=dataPoints1.length-1;

  for (let ij=0;ij<dataPoints1.length;ij++) {
       let d2=dataPoints1[ij];
       let d2new={};  // cloned copy
       let d2newAdd={}; // clonec dopy, with .x and .y adjusted
       for (jv in d2) {
           let cval=d2[jv];
           d2new[jv]=cval;
           d2newAdd[jv]=cval;
           let tjv=jv.toUpperCase();
           if (tjv=='X') wasX=cval;
           if (tjv=='Y') wasY=cval;
       }
       newdata.push(d2new);
       if (!d2newAdd.hasOwnProperty('INFO'))  d2newAdd['INFO']={};
       if (ij==jlast) break ;   // if last, nothing after it

       if (arguments.length>2)      d2newAdd['EC']=useEc;
       if (arguments.length>3)      d2newAdd['ES']=useEs;

       let d2next=dataPoints1[ij+1];
       nextX= (d2next.hasOwnProperty('x')) ? d2next['x'] : d2next['X'] ;
       nextY= (d2next.hasOwnProperty('y')) ? d2next['y'] : d2next['Y'] ;

// step above?
      if (stepBelow!=1) {
         if (nextY>wasY) {    // up then right
            d2newAdd['INFO']['ADDED']=1;
            d2newAdd['x']=wasX; d2newAdd['y']=nextY  ;
         } else {   // right then down
            d2newAdd['INFO']['ADDED']=2;
            d2newAdd['x']=nextX; d2newAdd['y']=wasY ;
        }
      } else {   // stepdown
         if (nextY>wasY) {    // right then up
            d2newAdd['INFO']['ADDED']=3;
            d2newAdd['x']=nextX; d2newAdd['y']=wasY  ;
         } else {   // down then right
            d2newAdd['INFO']['ADDED']=4;
            d2newAdd['x']=wasX; d2newAdd['y']=nextY ;
        }
      }   // stepbelow


      newdata.push(d2newAdd);

   }       // for im

   return newdata ;

}

// ==== return from wsCanvasChart .....................
    return {                                   // :::::::::::::::: returns stuff that isn't usually directly used  ::::::::::::::::;
        renderType: renderType,
        render: render,
        canvasChartClickHander:canvasChartClickHander,
        sprintf: sprintf,
        splitCsv:splitCsv,
        updateINFO:updateINFO,
        getRanges:getRanges,
        makeSteps:makeSteps,
        rescaleY:rescaleY,
        renderMouseXY: renderMouseXY,
        renderGetPixelColor:renderGetPixelColor,
        renderGetTrace: renderGetTrace
    };

} ();  // wsCanvasChart


//=============