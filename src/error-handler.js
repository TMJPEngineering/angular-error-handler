'use strict';
var errorNotifier = require('./error-notifier');

angular
    .module('ngErrorHandler', [])
    .factory('errorNotifier', errorNotifier)
    .provider('errorHandler', errorHandler);

/* @ngInject */
function errorHandler() {
    var handledServices = {}; // Stores the manually handled services
    var isFunction = angular.isFunction.bind(angular);
    var debug = true; // Determines if we should print logs

    var decorator = function (serviceName) {
        return ['$delegate', '$injector', function ($delegate, $injector) {
            // Loops through all the properties of the service
            // and check if it's a function, before wrapping it
            // with our generic error handler
            for (var prop in $delegate) {
                var service = { value: $delegate, name: serviceName };
                if (!isFunction($delegate[prop])) continue;
                $delegate[prop] = decorate($injector, service, $delegate[prop]);
            }
            return $delegate;
        }];
    };

    var decorate = function ($injector, service, fn) {
        // Wraps the service function with our generic error handler
        return angular.extend(function() {
            var handler = $injector.get('errorHandler');
            return handler.wrap(service, fn, arguments);
        }, fn);
    };

    return {
        debugEnabled: debugEnabled,
        handle: handle,
        $get: ['$q', 'errorNotifier', factory]
    };

    function debugEnabled(enable) {
        debug = !!enable;
    }

    function handle($provide, services) {
        if (angular.isArray(services)) autoHandling($provide, services);
        else if (angular.isObject(services)) manualHandling($provide, services);
        else console.error('ngErrorHandler: Invalid options.');
    }

    function autoHandling($provide, services) {
        var len = services.length;
        for (var i = 0; i < len; i++) {
            $provide.decorator(services[i], decorator(services[i]));
        }
    }

    function manualHandling($provide, services) {
        angular.forEach(services, function (value, key) {
            handledServices[key] = {};

            var len = value.length;
            for (var i = 0; i < len; i++) {
                // Store the function that is manually handled
                handledServices[key][value[i]] = true;
            }

            $provide.decorator(key, decorator(key));
        });
    }

    function factory($q, errorNotifier) {
        return {
            wrap: wrap
        }

        function wrap(service, fn, args) {
            var serviceName = service.name;
            var fnName = fn.name;

            var result;
            try {
                result = fn.apply(service.value, args);
            } catch (error) {
                // Catch synchronous errors
                log('ngErrorHandler: Exception @', serviceName, '->', fnName, error);
                errorNotifier.broadcast(error);
                throw error;

                /*
                 * TODO: Catching exceptions with the choice to
                 * rethrow the exception or continue the execution
                 */
                // if (isServiceFnManuallyHandled(serviceName, fnName)) {
                //     log('ngErrorHandler:', 'Error is manually handled.');
                //     // Just throw the exception again, because it's manually handled
                //     throw error;
                // }
                // log('ngErrorHandler:', 'Exception is automatically handled.');
                // return
            }

            // Catch asynchronous errors
            var promise = result && result.$promise || result;
            if (promise && isFunction(promise.then) && isFunction(promise.catch)) {
                return handleAsync(promise, serviceName, fnName);
            }

            return result;
        }

        function handleAsync(promise, service, fn) {
            return promise.catch(function (error) {
                log('ngErrorHandler: Async Error @', service, '->', fn, error);
                if (isServiceFnManuallyHandled(service, fn)) {
                    // Just reject the error again, so that the
                    // user can handle it manually
                    log('ngErrorHandler:', 'Error is manually handled.');
                    return $q.reject(error);
                }

                log('ngErrorHandler:', 'Error is automatically handled.');
                errorNotifier.broadcast(error);
                // This prevents the execution of other promises chained to this call
                return $q(function () {
                    return null;
                });
            });
        }

        function isServiceFnManuallyHandled(service, fn) {
            return handledServices[service] && handledServices[service][fn];
        }

        function log() {
            if (debug) console.log.apply(console, arguments);
        }
    }
}
