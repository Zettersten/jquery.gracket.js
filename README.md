Gracket
=======

A **single elimation bracket** built using canvas and jquery. 
**Live demo**: http://erik5388.github.com/jquery.gracket.js/

Example
-------

### HTML

```html
<div data-gracket="[{},{},{}]">
</div>
```

### JS

```js
$("[data-gracket]").gracket();
```

### CSS

```css
.g_gracket { width: 9999px; background-color: #fff; padding: 55px 15px 5px; line-height: 100%; position: relative; overflow: hidden;}
.g_round { float: left; margin-right: 70px; }
.g_game { position: relative; margin-bottom: 15px; }
.g_gracket h3 { margin: 0; padding: 10px 8px 8px; font-size: 18px; font-weight: normal; color: #fff}
.g_team { background: #3597AE; }
.g_team:last-child {  background: #FCB821; }
.g_round:last-child { margin-right: 20px; }
.g_winner { background: #444; }
.g_winner .g_team { background: none; }
.g_current { cursor: pointer; background: #A0B43C!important; }
.g_round_label { top: -5px; font-weight: normal; color: #CCC; text-align: center; font-size: 18px; }
```

API Usage
---------

```js
/* 
* Basic usage
* @note: Assumes your data comes 
*        from the element in the 
*        form of JSON 
*/

$("selector").gracket(); 
```

```js
/* 
* Custom source usage
* @note: Telling gracket to look 
*        at a local variable
*        for the JSON object 
*/

$("selector").gracket({
	src : refToMyData
});
```

```js
/* 
* Alter canvas usage
* @note: Tell grackets canvas to 
*        look a little different
*/

$("selector").gracket({
	canvasLineWidth : 1,      // adjusts the thickness of a line
	canvasLineGap : 2,        // adjusts the gap between element and line
	cornerRadius : 3,         // adjusts edges of line
	canvasLineCap : "round",  // or "square"
	canvasLineColor : "white" // or #HEX
});
```

```js
/* 
* Change class names and id structure
* @note: create gracket with custom  
*        classes to cater to 
*        any convention nessesary
*/

$("selector").gracket({
	gracketClass : "g_gracket",
	gameClass : "g_game",
	roundClass : "g_round",
	teamClass : "g_team",
	winnerClass : "g_winner",
	spacerClass : "g_spacer",
	currentClass : "g_current",
	canvasId : "g_canvas",
	canvasClass : "g_canvas"
});
```

```js
/* 
* Create show custom labels, or hide them
* @note: create gracket with custom  
*        labels to add more instruction
*        to your bracket. 
*/

$("selector").gracket({
	roundLabels : ["1st Round", "2nd Round", "..."]
});

/* 
* @note: leaving this field 
*				 empty shows the default values.
*				 In order to hide labels, enter 
*				 one empty value.
*/

$("selector").gracket({
	roundLabels : [""]
});
```

What's Next?
------------

+ **Ajax** : to load data from a given source and then init the bracket. 
+ **Tooltips** : to hover and expose an element with more info from each team & round.
+ **Refactor $ Usage** : reduce jQuery methods in the area of "creating elements", "elements lookups", and "element inline styles".
+ **Data Dive** : A more in depth view at how to structure data to adequatly use gracket.

Contributors
------------

I could not make this plugin without the advice of the following people, 

1. [Andrew Miller](https://github.com/AndrewMillerPSD)
2. [James Coutry](https://github.com/jcoutry)
3. [Voung Trinh](https://github.com/goods4trade)

About
-----

+ **Author** : [Erik Zettersten](http://zettersten.com)
+ **Version** : 1.5.5
+ **URL** : https://github.com/erik5388/jquery.gracket.js

jquery.gracket.js loves all browsers
------------------------------------

This plugin has been looked at and tested on the following browsers...

![Gracket is supported in all browsers](http://eventespresso.com/wp-content/uploads/2010/07/Browser-Icons.png)

+ IE6/5 not tested
+ IE has minor issues with hover states.

Disclaimer
----------
This code is provided with no warranty.  While I strive to maintain backwards compatibility, the code is still under active development.  As this is the case, some revisions may break break compatibility with earlier versions of the library.  Please keep this in mind when using jquery.gracket.js.

Copyright and Licensing
-----------------------
Copyright (c) 2012 Erik Zettersten, released under the MIT license.
