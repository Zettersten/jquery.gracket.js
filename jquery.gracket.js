// ItsGosu | Bracket Plugin | Gracket (jquery.gracket.js)
// Erik Zettersten
// Version 0.1

(function($) {
    $.fn.gracket = function(method) {

        // Public methods
        var methods = {
            init : function(options) {
                this.gracket.settings = $.extend({}, this.gracket.defaults, options);
                methods.generate();          
            },
        	generate : function(){
        		helpers.build.node();
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
        		node : function(){
					alert("build node html");
					alert(helpers.populate.node("data goes here"));
				}
        	},
        	populate : {
        		node : function(data){
        			return data;
        		}
        	},
        	design : {
        		offset : function(){
        			
        		}
        	}
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