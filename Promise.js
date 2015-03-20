/**
 * @class Ext.Promise
 */
Ext.define('Ext.Promise',{
    config: {
        STATE_THEN : true,
        STATE_FAILURE : false,
        STATE_ALWAYS : null
    },

    inheritableStatics: {
        all: function(){
            var args = Ext.toArray(arguments),
                size = args.length,
                dfd = this.create(),
                internalCallback = function(){
                    var finished = true,
                        state = true;

                    Ext.Array.each(args,function(item){
                        if (!item.fired) {
                            finished = false;
                        } else if (item.state !== true) {
                            state = false;
                        }

                        return finished;
                    });

                    if (finished) {
                        dfd.fire(state);
                    }
                };

            Ext.Array.each(args,function(item){
                item.always(internalCallback);
            });

            return dfd;
        },

        afterWaitFor: function(after,callback){
            var dfd = this.create();

            after.always(function(){
                callback.apply(this,arguments).always(function(){
                    dfd.resolve(this,arguments);
                });
            });

            return dfd; 
        }
    },

    privates: {
        run: function(){
            var me = this;

            if (me.fired === false) {
                return;
            }

            var callbacks = me.callbacks,
                state = me.state,
                scope = me.scope,
                args = Ext.Array.from(me.args),
                stateAlways = me.getConfig('STATE_ALWAYS');

            for (var call; (call = callbacks.shift());) {
                if (call.state === state || call.state === stateAlways) {
                    call.fn.apply(call.scope || scope,args);
                }
            }
        }
    },

    constructor : function(config){
        var me = this;

        Ext.applyIf(me,{
            id: Ext.id(),
            callbacks: [],
            fired: false,
            state: null,
            scope: null,
            args: null
        });

        me.initConfig(config);
    },

    /**
     * Register callbacks for different states. 
     * All states are possible but to keep it simple I added three standart methods: then, failure and always.
     */
    then: function(fn,scope){
        return this.after(fn,scope,this.getConfig('STATE_THEN'));
    },

    failure: function(fn,scope){
        return this.after(fn,scope,this.getConfig('STATE_FAILURE'));
    },

    always: function(fn,scope){
        return this.after(fn,scope,this.getConfig('STATE_ALWAYS'));
    },

    after: function(fn,scope,state){
        var me = this,
            callbacks = me.callbacks;
        
        callbacks.push({
            state : state,
            scope: scope,
            fn : fn
        });
        me.run();
        
        return me;
    },

    delayed: function(delay,state,scope,args){
        Ext.defer(function(){
            this.fire(state,scope,args);
        },delay,this);
    },

    resolve: function(scope,args){
        this.fire(this.getConfig('STATE_THEN'),scope,args);
    },

    reject: function(scope,args){
        this.fire(this.getConfig('STATE_FAILURE'),scope,args);
    },

    fire: function(state,scope,args) {
        var me = this;
        
        if (me.fired === true) {
            Ext.log({
                level: 'warn'
            },me.getConfig('ERROR_FIRED'));
        }

        me.fired = true;
        me.state = state;
        me.scope = scope;
        me.args = args;
        
        me.run();
    },

    reset: function(){
        this.fired = false;
    }
});