// ItsGosu | Bracket Plugin | Gracket (jquery.gracket.js)
// Erik Zettersten
// Version 0.2

(function($) {
	$.fn.gracket = function(method) {
		
		var 
			container = this,
			data = JSON.parse(container.data("gracket")),
			team_count,
			round_count,
			game_count
		;
		
		// Defaults
		$.fn.gracket.defaults = {
			gameClass : "g_game",
			roundClass : "g_round",
			teamClass : "g_team",
			winnerClass : "g_winner",
			spacerClass : "g_spacer",
			connectorClass : "g_connector"
		}
		
		// Defaults => Settings
		$.fn.gracket.settings = {}

		// Public methods
		var methods = {
			init : function(options) {
				
				this.gracket.settings = $.extend({}, this.gracket.defaults, options);

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
							spacer = helpers.build.spacer(this.gracket.settings, outer_height, r)
						;
						
						// append spacer
						if (g % 1 == 0) round_html.append(spacer);
						
						// append game
						round_html.append(game_html);
						
						// align game
						helpers.align.game(game_html, outer_height, r);
						
						// create teams in game
						team_count = data[r][g].length;
						for (var t=0; t < team_count; t++) {
		
							var team_html = helpers.build.team(data[r][g][t], this.gracket.settings);
							game_html.append(team_html);
							
							// adjust winner
							if (team_count === 1) {
								helpers.align.winner(game_html, this.gracket.settings, outer_height, r);
								
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
						class : node.teamClass + " " + (data.id || "id_null")
					});
				},
				game : function(node){
					return game = $("<div />", {
						class : node.gameClass,
						html : "<div class="+ node.connectorClass +"></div>"
					});
				},
				round : function(node){
					return round = $("<div />", {
						class : node.roundClass
					});
				},
				spacer : function(node, yOffset, r){
					return spacer = $("<div />", {
						class : node.spacerClass,
					}).css({
						height : (yOffset * r)
					});
				}
			},
			align : {
				game : function(game_html, yOffset, r){
					// only get the top of each game so we can move accordingly
					if (game_html.parent().index() > 0 && game_html.index() === 0) {
						//return game_html.css({ marginTop: yOffset + (Math.pow(2, (r - 2)) * yOffset - (yOffset / 2)) });
						return game_html.css({ marginTop: yOffset * r });
					};
				},
				winner : function(game_html, node, yOffset, r){
					// return game_html.addClass(node.winnerClass).css({ height : game_html.height() * 2, marginTop: yOffset + (Math.pow(2, (r - 3)) * yOffset - (yOffset / 2)) });
				}
			}, 
			listeners : function(){	
				// tbd
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


