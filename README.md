# canvasChart
A javascript library supporting plot creation using HTML 5 canvas

21 April 2021 Daniel Hellerstein (danielh@crosslink.net)

A javascript library supporting plot creation using HTML 5 canvas

What does this do: dynamically creates plots using html5 "canvas" tools.

What does this use: a dataSet saved in an javascript array. Each row of the array is an object that specifies an "x" and "y" value. And (optionally) a "L" (label), an "ID", and a number of display specs.

A variety of features are supported!
<ul type="a">
<li> Can create points (circles, squares, etc), trend lines, or bar graphs  -- with selectable colors and line styles
<li> Can label points, using Y values or a data-row "L" attribute
<li> Main title, x-axis title, and y axis title (left and right) can be specified. Fonts and colors can be specified
<li> Range of data to display (both  in X and Y) can be specified, or you can let the function auto-determine
<li> Horizontal grid lines can be specified, as well as  "x" (vertical) and "y" (horizontal) reference lines.
<li> Mouse clicks supported -- to identify X,Y coordinates and what shape (corresponding to a data row) was clicked on.
<li> A sequence of several calls, with different datasets, can occur (with each graph displayed using different colors, etc)
<li> A key can be displayed
<li>) Sample selection (with a user supplied function) can be dynamically applied.
</ul>
This library is a heavily modified and updated version of https: weblogs.asp.net/dwahlin/creating-a-line-chart-using-the-html-5-canvas. It is particularly useful for drawing, and quickly refreshing, different colors & shaped points on a plotting area.

This requres jQuery (version 3.4 or above)
