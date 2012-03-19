Gracket
=======

A **single elimation bracket** built using canvas and jquery.

Example
-------

**HTML**
```html
	<div data-gracket>
	</div>
```

**JS**
```js
$("[data-gracket]").gracket();
```

**CSS**
```css
.g_gracket { overflow: hidden; }
.g_round { float: left; margin-right: 20px; }
.g_game { position: relative; margin-bottom: 15px; }
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

What's Next?
------------

+ **Ajax** : to load data from a given source and then init the bracket. 
+ **Tooltips** : to hover and expose an element with more info from each team & round.
+ **Round Title** : to show a round title at the top of each round.
+ **Refactor $ Usage** : reduce jQuery methods in the area of "creating elements", "elements lookups", and "element inline styles".


Contributors
------------

I could not make this plugin without the advice of the following people, 

1. [Andrew Miller](https://github.com/AndrewMillerPSD)
2. [James Coutry](https://github.com/jcoutry)

