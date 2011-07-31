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
        		// build first col // get value/object and send to populate method
        		for (var i=0; i < data[0].length; i++) {
        			for (var k=0; k < data[0][i].length; k++) {
        				// console.log(data[0][i][k]);
        				var counter = 0;
        				$.each(data[0][i][k], function(key, value, length, ea){
        					var item = helpers.build.player();
        					
							
        					// set class
        					item.attr("class", item.attr("class").replace("{{class}}", "group_" + i + " gteam_" + k + " gitem_" + counter++));
        					
        					
        					container.append(item);
        				});
        			};
        		};
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
						class : "{{class}} g_player"
					});
				},
				node : function(){
					return node = $("<div />", {
						class : "{{class}} g_node"
					}).css({
						width : 120,
						height : container.height() / data[0].length
					});
				},
				column : function(){
					// create markup for column
					return column = $("<div />", {
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


