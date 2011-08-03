// ItsGosu | Bracket Plugin | Gracket (jquery.gracket.js)
// Erik Zettersten
// Version 0.1

(function($) {
	$.fn.gracket = function(method) {
		
		var container = this;
		var data = container.data("gracket");
		var team_count;
		var round_count;
		var game_count;

		// Public methods
		var methods = {
			init : function(options) {
				this.gracket.settings = $.extend({}, this.gracket.defaults, options);
		
				round_count = data.length;
		
				//  create rounds
				for (var r=0; r < round_count; r++) {
		
					var round_html = helpers.build.round();
					container.append(round_html);
		
					// create games in round
					game_count = data[r].length;
		
					for (var g=0; g < game_count; g++) {
		
						var game_html = helpers.build.game();
						round_html.append(game_html);
		
						// create teams in game
						team_count = data[r][g].length;
		
						for (var t=0; t < team_count; t++) {
		
							var team_html = helpers.build.team();
							game_html.append(team_html);
		
						};
		
					};
		
				};
		
			}
		};


		
		// Private methods
		var helpers = {
			build : {
				team : function(){
					return team = $("<div />", {
						html : "<h3><span>{{id}}</span>{{name}}</h3>",
						class : "{{class}} g_team"
					});
				},
				game : function(){
					return game = $("<div />", {
						class : "{{class}} g_game"
					}).css({
						width : 120
					});
				},
				round : function(){
					return round = $("<div />", {
						class : "{{class}} g_round"
					}).css({
						width : 120
					});
				}
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
	
	// Defaults
	$.fn.gracket.defaults = {}
	// Defaults => Settings
	$.fn.gracket.settings = {}

})(jQuery);

// Call Plugin
$("[data-gracket]").gracket();


