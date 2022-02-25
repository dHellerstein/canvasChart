# wsurvey.canvasChart.js  -- create graphs using HTML5

 *What does this do:* dynamically creates plots using html5 "canvas" tools.

 *What does this use:* a dataset saved in a javascript array. Each row of the array is an object that specifies
                      an "x" and "y" value.   And (optionally) a "L" (label), an "ID", and a number of display specs.

  A variety of features are supported:

    a) Can create points (circles, squares, etc), trend lines, or bar graphs  -- with selectable colors and line styles
    b) Can label points, using Y values or a data-row "L" attribute
    c) Main title, x-axis title, and y axis title (left and right) can be specified. Fonts and colors can be specified
    d) Range of data to display (both  in X and Y) can be specified, or you can let the function auto-determine
    d) Horizontal grid lines can be specified, as well as  "x" (vertical) and "y" (horizontal) reference lines.
    e) Mouse clicks supported -- to identify X,Y coordinates and what shape (corresponding to a data row) was clicked on.
    f) A sequence of several calls, with different datasets, can occur (with each graph displayed using different colors, etc)
    g) A key can be displayed
    h) Sample selection (with a user supplied function) can be dynamically applied.

See [wsurvey.canvasChart.txt](wsurvey.canvasChart.txt) for the details.

#### Notes
  
  - testWsurveyCanvas.html demos the use of wsurvey.canvasChart.

  - If you download just these (and not the full wsurvey.lib.zip) 
   - to use testWsurveyCanvas.html, you will need to edit the code a bit: change  `<script ...>` so they point to the where you saved the .js files! 
   
  
