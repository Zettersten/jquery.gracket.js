// Bracket Plugin | Gracket (jquery.gracket.js)
// Erik Zettersten
// Version 1.3

(function($) {
	$.fn.gracket = function(method) {

		
		// Defaults
		$.fn.gracket.defaults = {
			gameClass : "g_game",
			roundClass : "g_round",
			teamClass : "g_team",
			winnerClass : "g_winner",
			spacerClass : "g_spacer",
			connectorClass : "g_connector",
			currentClass : "g_current",
			canvasId : "g_canvas",
			canvasClass : "g_canvas",
			canvasLineColor : "white",
			canvasLineWidth : 10,
			canvasLineCap : "round",
			src : null
		}
		
		// global
		var 
			container = this,
			data = JSON.parse(container.data("gracket")) || JSON.parse(this.gracket.defaults.src),
			team_count,
			round_count,
			game_count
		;
		
		// Defaults => Settings
		$.fn.gracket.settings = {}

		// Public methods
		var methods = {
			init : function(options) {
				
				this.gracket.settings = $.extend({}, this.gracket.defaults, options);
				
				// build empty canvas
				container.append("<canvas id='"+ this.gracket.settings.canvasId +"' style=\"position:absolute;top:0;left:0;\" />");
				
				//  create rounds
				round_count = data.length;
				for (var r=0; r < round_count; r++) {
					
					var round_html = helpers.build.round(this.gracket.settings);
					container.append(round_html);
		
					// create games in round
					game_count = data[r].length;		
					for (var g=0; g < game_count; g++) {
						
					
						var 
							game_html = helpers.build.game(this.gracket.settings),
							outer_height = container.find("." + this.gracket.settings.gameClass).outerHeight(true),
							spacer = helpers.build.spacer(this.gracket.settings, outer_height, r, (r !== 0 && g === 0) ? true : false)
						;
						
						
						// append spacer
						if (g % 1 == 0 && r !== 0) round_html.append(spacer);
						
						// append game
						round_html.append(game_html);
						
						// create teams in game
						team_count = data[r][g].length;
						for (var t=0; t < team_count; t++) {
		
							var team_html = helpers.build.team(data[r][g][t], this.gracket.settings);
							game_html.append(team_html);
						
							// adjust winner
							if (team_count === 1) {
								
								// remove spacer
								game_html.prev().remove()
								
								// align winner
								helpers.align.winner(game_html, this.gracket.settings, game_html.parent().prev().children().eq(0).height());

								// init the listeners after gracket is built
								helpers.listeners(this.gracket.settings, data, game_html.parent().prev().children().eq(1));
								
							}
		
						};
		
					};
					
				};
		
			}
		
		};
		
		// Private methods
		var helpers = {
			build : {
				team : function(data, node){
					return team = $("<div />", {
						"html" : "<h3><span>"+ (data.seed || 0) +"</span>"+ data.name +"</h3>",
						"class" : node.teamClass + " " + (data.id || "id_null")
					});
				},
				game : function(node){
					return game = $("<div />", {
						"class" : node.gameClass,
						"html" : "<div class="+ node.connectorClass +"></div>"
					});
				},
				round : function(node){
					return round = $("<div />", {
						"class" : node.roundClass
					});
				},
				spacer : function(node, yOffset, r, isFirst){
					return spacer = $("<div />", {
						"class" : node.spacerClass,
					}).css({
						"height" : (isFirst) ?  (((Math.pow(2, r)) - 1) * (yOffset / 2)) : ((Math.pow(2, r) -1) * yOffset)
					});
				},
				canvas : {
					resize : function(node){
						var canvas = document.getElementById(node.canvasId);
						canvas.height = container.innerHeight();
						canvas.width = container.innerWidth();
						$(canvas).css({
							height : container.innerHeight(),
							width : container.innerWidth(),
							zIndex : 1,
							pointerEvents : "none"
						});
					},
					draw : function(node, data, game_html){
						
						
						var canvas = document.getElementById(node.canvasId);
						var ctx = canvas.getContext("2d");
						
						// set starting position -- will default to zero
						var _paddingLeft = (parseInt(container.css("paddingLeft")) || 0);
						var _paddingTop = (parseInt(container.css("paddingTop")) || 0);
						var _marginBottom = (parseInt(game_html.css("marginBottom")) || 0);
						var _startingLeftPos = game_html.outerWidth(true) + _paddingLeft;
						var _marginRight = (parseInt(container.find("> div").css("marginRight")) || 0);
						
						// set styles
						ctx.strokeStyle = node.canvasLineColor;
						ctx.lineCap = node.canvasLineCap;
						ctx.lineWidth = node.canvasLineWidth;
						
						// move path across rows
						for (var r = 0; r < data.length; r++) {
							// start first path
							ctx.beginPath();
							if (r === 0) {
								ctx.moveTo(_startingLeftPos, _paddingTop);
							} else if (r !== (data.length - 1)){
								ctx.moveTo(_startingLeftPos + (_marginRight + game_html.width()) * r, _paddingTop);
							}
							ctx.closePath();
							ctx.stroke();
							
							// move path down
							
							for (var g = 0; g < data[r].length; g++) {
								
								ctx.beginPath();
								ctx.moveTo(_startingLeftPos, _paddingTop * g + 90);
								
								ctx.closePath();
								ctx.stroke();
							};
						};
						
						
					}
				}
			},
			align : {
				winner : function(game_html, node, yOffset){
					return game_html.addClass(node.winnerClass).css({ 
						"margin-top" : yOffset + (game_html.height() / 2)
					});
				}
			}, 
			listeners : function(node, data, game_html){	
				
				// 1. Hover Trail
				var _gameSelector = "." + node.teamClass + " > h3";
				$.each($(_gameSelector), function(e){
					var id = "." + $(this).parent().attr("class").split(" ")[1];
					if (id !== undefined) {
						$(id).hover(function(){
							$(id).addClass(node.currentClass);
						}, function(){
							$(id).removeClass(node.currentClass);
						});
					};
				});
				
				// 2. size the canvas
				helpers.build.canvas.resize(node);
				helpers.build.canvas.draw(node, data, game_html);
				// 3. add tooltip
				
				
			}
		};
	
		// if a method as the given argument exists
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error( 'Method "' +  method + '" does not exist in gracket!');
		}
	
	}

})(jQuery);

// Call Plugin
$("[data-gracket]").gracket();





