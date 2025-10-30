// jquery.gracket.js
// Erik M. Zettersten
// https://github.com/erik5388/jquery.gracket.js
// MIT
// Version 1.5.5


(function(win, doc, $){

	var passes  = 0;
	var fails   = 0;
	var counter = 1;
	win.tests   = {};

	// home grown tester
	function describe(description, callback){
		tests[description] = function(){
			var result = (callback() === true) ? true : false;
			fails = fails + (result ? 0 : 1);
			passes = passes + (!result ? 0 : 1);
			return console[result ? "info" : "error"](counter++ + " - " + description + ": " + (result ? "Pass" : "Fail"));
		};
		tests[description]();
	};

	// tests
	$(function(){

		console.log("\n\njquery.gracket.js Tests Started!\n\n");
		
		describe("jQuery is loaded", function(){
			return typeof $ !== "undefined";
		});

		describe("The total rounds (in TestData) should equal 5", function(){
			return win.TestData.length === 5;
		});

		describe("Works with jQuery version 1.8.2", function(){
			return $().jquery === "1.8.2";
		});

		describe("Player width should be greater than or equal to minWidth", function(){
			var playerWidth = $(".sammy-zettersten").eq(0).outerWidth(true);
			var minWidth    = +($(".my_gracket h3").eq(0).css("minWidth").replace("px", ""));
			return playerWidth >= minWidth;
		});

		describe("Player 'Erik Zettersten' should be the only node at the fith round position", function(){
			return ($(".g_winner h3").text().replace(/1\s/g, "").toLowerCase()) === "erik zettersten";
		});

		//tbc...
		console.log("\nThere were "+ passes +" Passes and "+ fails +" fails!\njquery.gracket.js Tests Completed!\n\n");

	});

})(window, document, jQuery);