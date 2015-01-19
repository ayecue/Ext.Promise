/**
 * @class Ext.Promise
 */
Ext.define('Ext.Promise',{
    statics : {
        ERROR_FIRED : 'Error: Promise already fired.',
        STATE_THEN : true,
        STATE_FAILURE : false,
        STATE_ALWAYS : null
    },
    constructor : function(){
		var me = this;

        me.id = Ext.id();
		me.callbacks = [];
	},
    /**
     * Register callbacks for different states. 
     * All states are possible but to keep it simple I added three standart methods: then, failure and always.
     */
    then : function(fn){
        return this.after(fn,this.self.STATE_THEN);
    },
    failure : function(fn){
        return this.after(fn,this.self.STATE_FAILURE);
    },
    always : function(fn){
        return this.after(fn,this.self.STATE_ALWAYS);
    },
	after : function(fn,state){
		var me = this,
            callbacks = me.callbacks;
        
        if (!callbacks) {
            throw new Error(me.self.ERROR_FIRED);
        }
        
        callbacks.push({
            state : state,
            fn : fn
        });
        
        return me;
	},
    /**
     * Resolve all callbacks of a certain state.
     * Same thing like above. Basicly all states are possible but to keep it simple I added two standart methods: resolve and reject
     */
    delayed : function(delay,state,scope,args){
        Ext.defer(function(){
            this.fire(state,scope,args);
        },delay,this);
    },
    resolve : function(scope,args){
        this.fire(this.self.STATE_THEN,scope,args);
    },
    reject : function(scope,args){
        this.fire(this.self.STATE_FAILURE,scope,args);
    },
    fire : function(state,scope,args) {
        var me = this,
            callbacks = me.callbacks;
        
        if (!callbacks) {
            throw new Error(me.self.ERROR_FIRED);
        }
        
        args = Ext.Array.from(args);
        
        for (var call; (call = callbacks.shift()) != null;) {
            if (call.state === state || call.state == me.self.STATE_ALWAYS) {
                call.fn.apply(scope,args);
            }
        }
        
        me.callbacks = null;
        delete me.callbacks;
    }
});