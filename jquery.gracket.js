// ItsGosu | Bracket Plugin | Gracket (jquery.gracket.js)
// Erik Zettersten
// Version 0.2

(function($) {
	$.fn.gracket = function(method) {
		
		var container = this;
		var data = container.data("gracket");
		var team_count;
		var round_count;
		var game_count;
		
		
		// Defaults
		$.fn.gracket.defaults = {
			gameClass : "g_game",
			roundClass : "g_round",
			teamClass : "g_team",
			nodeWidth : 120,
			winnerClass : "g_winner",
			connectorClass : "g_connector"
		}
		
		// Defaults => Settings
		$.fn.gracket.settings = {}

		// Public methods
		var methods = {
			init : function(options) {
				
				this.gracket.settings = $.extend({}, this.gracket.defaults, options);
		
				// get data length
				round_count = data.length;
				
				//  create rounds
				for (var r=0; r < round_count; r++) {
					
					var round_html = helpers.build.round(this.gracket.settings);
					container.append(round_html);
		
					// create games in round
					game_count = data[r].length;		
					for (var g=0; g < game_count; g++) {
		
						var game_html = helpers.build.game(this.gracket.settings);
						round_html.append(game_html);
						
						// align game
						helpers.align.game(game_html, container.find("." + this.gracket.settings.gameClass).outerHeight(true), r);
						
						// create teams in game
						team_count = data[r][g].length;
						for (var t=0; t < team_count; t++) {
		
							var team_html = helpers.build.team(data[r][g][t], this.gracket.settings);
							game_html.append(team_html);
							
							// adjust winner
							if (team_count === 1) {
								helpers.align.winner(game_html, this.gracket.settings, container.find("." + this.gracket.settings.gameClass).outerHeight(true), r);
								
								// init the listeners after gracket is built
								helpers.listeners();
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
						html : "<h3><span>"+ (data.id || 0) +"</span>"+ data.name +"</h3>",
						class : node.teamClass + " " + data.id
					});
				},
				game : function(node){
					return game = $("<div />", {
						class : node.gameClass,
						html : "<div class="+ node.connectorClass +"></div>"
					}).css({
						width : node.nodeWidth
					});
				},
				round : function(node){
					return round = $("<div />", {
						class : node.roundClass
					}).css({
						width : node.nodeWidth
					});
				}
			},
			align : {
				game : function(game_html, yOffset, r){
					// only get the top of each game so we can move accordingly
					if (game_html.parent().index() > 0 && game_html.index() === 0) {
						return game_html.css({ marginTop: yOffset + (Math.pow(2, (r - 2)) * yOffset - (yOffset / 2)) });
					};
				},
				winner : function(game_html, node, yOffset, r){
					return game_html.addClass(node.winnerClass).css({ height : game_html.height() * 2, marginTop: yOffset + (Math.pow(2, (r - 3)) * yOffset - (yOffset / 2)) });
				}
			}, 
			listeners : function(){	
				
				// example only
				$(".g_1234").hover(function(){
					$(".g_1234").css({ background : "yellow" })
				}, function(){
					$(".g_1234").css({ background : "none" })
				});
				
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


