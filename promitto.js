/*! promitto.js - v0.1 - MIT License - https://github.com/h2non/promitto */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.promitto=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
{
        var promitto_lib_utils = _dereq_('./utils');
    var isPromise = promitto_lib_utils.isPromise;
    var promitto_lib_deferred = _dereq_('./deferred');
    var deferred = promitto_lib_deferred.deferred;
    var resolved = promitto_lib_deferred.resolved;
}
var counter = function counter(length) {
    return function () {
        var countø1 = 0;
        return function () {
            countø1 = countø1 + 1;
            return length - countø1 === 0;
        };
    }.call(this);
};
var pusher = function pusher(results) {
    return function (index, data) {
        return results[index] = data;
    };
};
var all = exports.all = function all(arr) {
        return Array.isArray(arr) ? function () {
            var reasonø1 = void 0;
            var resultsø1 = [];
            var rejectedø1 = false;
            var deferø1 = deferred();
            var poolø1 = arr.slice();
            var pushø1 = pusher(resultsø1);
            var countø1 = counter(poolø1.length);
            poolø1.forEach(function (promise, index) {
                return isPromise(promise) ? (function () {
                    promise.then(function (data) {
                        return !rejectedø1 ? pushø1(index, data) : void 0;
                    }, function (error) {
                        rejectedø1 = true;
                        return reasonø1 = error;
                    });
                    return promise.finally(function () {
                        deferø1.notify(index);
                        return countø1() || rejectedø1 ? rejectedø1 ? deferø1.reject(reasonø1) : deferø1.resolve(resultsø1) : void 0;
                    });
                })() : (function () {
                    countø1();
                    return pushø1(index, null);
                })();
            });
            return deferø1.promise;
        }.call(this) : resolved();
    };
},{"./deferred":2,"./utils":6}],2:[function(_dereq_,module,exports){
{
        var promitto_lib_utils = _dereq_('./utils');
    var isFn = promitto_lib_utils.isFn;
    var toArr = promitto_lib_utils.toArr;
    var isPromise = promitto_lib_utils.isPromise;
    var nextTick = promitto_lib_utils.nextTick;
    var chain = promitto_lib_utils.chain;
    var promitto_lib_types = _dereq_('./types');
    var states = promitto_lib_types.states;
    var newState = promitto_lib_types.newState;
    var newPool = promitto_lib_types.newPool;
    var newBuf = promitto_lib_types.newBuf;
    var promitto_lib_promise = _dereq_('./promise');
    var promise = promitto_lib_promise.promise;
}
var pusher = function pusher(pool) {
    return function (type, fn) {
        return isFn(fn) ? pool[type].push(fn) : void 0;
    };
};
var switchState = function switchState(state) {
    return function (type) {
        return !(type === 'notify') && state.pending ? (function () {
            state.pending = false;
            type === 'resolve' ? state.resolve = true : void 0;
            return type === 'reject' ? state.reject = true : void 0;
        })() : void 0;
    };
};
var cacheArgs = function cacheArgs(buf) {
    return function (type, args) {
        return buf[type] = toArr(args);
    };
};
var bufArgs = function bufArgs(state, buf) {
    return function (type, fn) {
        return type === 'finally' ? state.reject ? buf.reject : buf.resolve : buf[type];
    };
};
var dispatcher = function dispatcher(state, buf) {
    return function () {
        var getArgsø1 = bufArgs(state, buf);
        return function (type) {
            return function (fn) {
                return isFn(fn) ? function () {
                    var argsø1 = getArgsø1(type, fn);
                    return fn.apply(void 0, argsø1);
                }.call(this) : void 0;
            };
        };
    }.call(this);
};
var dispatch = function dispatch(state, pool, buf) {
    return function () {
        var dispatcherø1 = dispatcher(state, buf);
        return function (type) {
            return nextTick(function () {
                state[type] || type === 'notify' ? (function () {
                    pool[type].forEach(dispatcherø1(type));
                    return !(type === 'notify') ? pool[type].splice(0) : void 0;
                })() : void 0;
                return !state.pending && pool['finally'].length ? (function () {
                    state[type] || type === 'notify' ? (function () {
                        pool[type].forEach(dispatcherø1(type));
                        return !(type === 'notify') ? pool[type].splice(0) : void 0;
                    })() : void 0;
                    pool.finally.forEach(dispatcherø1('finally'));
                    return pool.finally.splice(0);
                })() : void 0;
            });
        };
    }.call(this);
};
var applyState = function applyState(cacheArgs, switchState, dispatch) {
    return function (type, args) {
        cacheArgs(type, args);
        switchState(type);
        return dispatch(type);
    };
};
var callState = function callState(applyFn) {
    return function (type) {
        return function () {
            return applyFn(type, arguments);
        };
    };
};
var notify = function notify(cacheArgs, dispatch) {
    return function () {
        cacheArgs('notify', arguments);
        return dispatch('notify');
    };
};
var deferred = exports.deferred = function deferred() {
        return function () {
            var bufø1 = newBuf();
            var poolø1 = newPool();
            var stateø1 = newState();
            var pusherø1 = pusher(poolø1);
            var cacheArgsø1 = cacheArgs(bufø1);
            var switchStateø1 = switchState(stateø1);
            var dispatchø1 = dispatch(stateø1, poolø1, bufø1);
            var applyø1 = applyState(cacheArgsø1, switchStateø1, dispatchø1);
            var callStateø1 = callState(applyø1);
            var ctx = {
                    'resolve': chain(ctx, callStateø1('resolve')),
                    'reject': chain(ctx, callStateø1('reject')),
                    'notify': chain(ctx, notify(cacheArgsø1, dispatchø1)),
                    'promise': promise(stateø1, pusherø1, dispatchø1)
                };
            return ctx;
        }.call(this);
    };
var resolved = exports.resolved = function resolved(reason) {
        return function () {
            var deferø1 = deferred();
            deferø1.resolve(reason);
            return deferø1.promise;
        }.call(this);
    };
var rejected = exports.rejected = function rejected(reason) {
        return function () {
            var deferø1 = deferred();
            deferø1.reject(reason);
            return deferø1.promise;
        }.call(this);
    };
var when = exports.when = function when(value, reason) {
        return isPromise(value) ? value : resolved(reason);
    };
},{"./promise":3,"./types":5,"./utils":6}],3:[function(_dereq_,module,exports){
{
        var promitto_lib_utils = _dereq_('./utils');
    var chain = promitto_lib_utils.chain;
    var promitto_lib_types = _dereq_('./types');
    var states = promitto_lib_types.states;
}
var thenFn = function thenFn(push, dispatch) {
    return function (resolve, reject, notify) {
        var args = arguments;
        states.forEach(function (name, index) {
            return push(name, args[index]);
        });
        return states.forEach(dispatch);
    };
};
var finallyFn = function finallyFn(push, dispatch) {
    return function (callback) {
        push('finally', callback);
        return dispatch('finally');
    };
};
var throwFn = function throwFn(push, dispatch) {
    return function (callback) {
        push('reject', callback);
        return dispatch('reject');
    };
};
var notifyFn = function notifyFn(state, push, dispatch) {
    return function (callback) {
        push('notify', callback);
        return dispatch('notify');
    };
};
var Promise = function Promise(ctx) {
    return function Promise(resolve, reject, notify) {
        ctx.then.apply(ctx, arguments);
        return ctx;
    };
};
var newPromise = function newPromise(ctx) {
    return function () {
        var Promiseø1 = Promise(ctx);
        Object.keys(ctx).forEach(function (name) {
            return Promiseø1[name] = chain(Promiseø1, ctx[name]);
        });
        return Promiseø1;
    }.call(this);
};
var promise = exports.promise = function promise(state, push, dispatch) {
        var ctx = {
                'then': thenFn(push, dispatch),
                'finally': finallyFn(push, dispatch),
                'throw': throwFn(push, dispatch),
                'notify': notifyFn(state, push, dispatch)
            };
        return newPromise(ctx);
    };
},{"./types":5,"./utils":6}],4:[function(_dereq_,module,exports){
{
        var promitto_lib_utils = _dereq_('./utils');
    var isPromise = promitto_lib_utils.isPromise;
    var isFn = promitto_lib_utils.isFn;
    var promitto_lib_collections = _dereq_('./collections');
    var all = promitto_lib_collections.all;
    var promitto_lib_deferred = _dereq_('./deferred');
    var deferred = promitto_lib_deferred.deferred;
    var resolved = promitto_lib_deferred.resolved;
    var rejected = promitto_lib_deferred.rejected;
    var when = promitto_lib_deferred.when;
}
var Promitto = function Promitto(lamdba) {
    return function () {
        var deferø1 = deferred();
        !isFn(lamdba) ? (function () {
            throw new TypeError('first argument must be a function');
        })() : void 0;
        lamdba(deferø1.resolve, deferø1.reject, deferø1.notify);
        return deferø1.promise;
    }.call(this);
};
Promitto.Promise = Promitto;
Promitto.defer = deferred;
Promitto.when = when;
Promitto.resolve = resolved;
Promitto.reject = rejected;
Promitto.all = all;
Promitto.isPromise = isPromise;
module.exports = Promitto;
},{"./collections":1,"./deferred":2,"./utils":6}],5:[function(_dereq_,module,exports){
var newBuf = exports.newBuf = function newBuf() {
        return {};
    };
var states = exports.states = [
        'resolve',
        'reject',
        'notify'
    ];
var newState = exports.newState = function newState() {
        return {
            'pending': true,
            'resolve': false,
            'reject': false
        };
    };
var newPool = exports.newPool = function newPool() {
        return {
            'reject': [],
            'resolve': [],
            'finally': [],
            'notify': []
        };
    };
},{}],6:[function(_dereq_,module,exports){
var isFn = exports.isFn = function isFn(o) {
        return typeof(o) === 'function';
    };
var toArr = exports.toArr = function toArr(o) {
        return Array.prototype.slice.call(o);
    };
var isPromise = exports.isPromise = function isPromise(o) {
        return isFn(o) && isFn(o.then);
    };
var nextTick = exports.nextTick = function nextTick(lamdba) {
        return setTimeout(lamdba, 0);
    };
var chain = exports.chain = function chain(obj, fn) {
        return function () {
            fn.apply(void 0, arguments);
            return obj;
        };
    };
},{}]},{},[4])
(4)
});