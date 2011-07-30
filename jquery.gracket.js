// ItsGosu | Bracket Plugin | Gracket (jquery.gracket.js)
// Erik Zettersten
// Version 0.1

(function($) {
    $.fn.gracket = function(method) {
		
		var container = this;
		var data = container.data("gracket");

        // Public methods
        var methods = {
            init : function(options) {
                this.gracket.settings = $.extend({}, this.gracket.defaults, options);
                methods.generate();          
            },
        	generate : function(){
				container.append(helpers.build.column());
        	},

			// We can call methods publically
			// $("[data-gracket]").gracket('foo_public_method');
            foo_public_method: function() {
               alert("public method");
        	}

        }


		
        // Private methods
        var helpers = {
        	build : {
        		player : function(){
					return player = $("<div />", {
						html : "<h3><span>{{id}}</span>{{name}}</h3>",
						id : "player_{{id}}",
						class : "{{class}} g_player"
					});
				},
				node : function(){
					return node = $("<div />", {
						id : "node_{{id}}",
						class : "{{class}} g_node"
					}).css({
						width : 120,
						height : container.height() / data[0].length
					});
				},
				column : function(){
					// create markup for column
					return column = $("<div />", {
						id : "col_{{id}}",
						class : "{{class}} g_column"
					}).css({
						width : 120,
						height : container.height()
					});
				}
        	},
        	populate : {
        		node : function(){
        		},
				column : function(){
				},
				player : function(){
					
				}
        	},
        	design : {}
        }

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


