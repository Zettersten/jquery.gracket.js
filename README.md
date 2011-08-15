  _____                _        _   
 / ____|              | |      | |  
| |  __ _ __ __ _  ___| | _____| |_ 
| | |_ | '__/ _` |/ __| |/ / _ \ __|
| |__| | | | (_| | (__|   <  __/ |_ 
 \_____|_|  \__,_|\___|_|\_\___|\__|


V1.8
====

A modern approach to handling tournament brackets in jQuery.

Built for http://itsgosu.com! 

------------------------------------------------------------

The plugin initializes itself. You need to do include the file and follow the steps below.

Step One: <div data-gracket='{object}' /> 
Step Two: Swap out the '{object}' for a real serialized JSON string or javascript object.

Feature's,

	1. [DONE v1.2] Hover trail
	2. [DONE v1.4] Canvas Draw Lines
	3. Tooltips
	
------------------------------------------------------------

API
===
<code>
	Basic use,
	- $(YOUR_SELECTOR).gracket();

	Load data,
	- $(YOUR_SELECTOR).gracket({
		src : "/a/link/to/my/data"
	});

	Change canvas,
	- $(YOUR_SELECTOR).gracket({
		canvasLineWidth : 1,
		canvasLineGap : 2,
		cornerRadius : 3,
		canvasLineCap : "round", // or "square"
		canvasLineColor : "white" // or #HEX
	});

	Full api (defaults),
	- $(YOUR_SELECTOR).gracket({
		gameClass : "g_game",
		roundClass : "g_round",
		teamClass : "g_team",
		winnerClass : "g_winner",
		spacerClass : "g_spacer",
		currentClass : "g_current",
		cornerRadius : 25,
		canvasId : "g_canvas",
		canvasClass : "g_canvas",
		canvasLineColor : "white",
		canvasLineWidth : 2,
		canvasLineGap : 5,
		canvasLineCap : "round",
		src : null
	});
</code>

