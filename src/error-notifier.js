'use strict';

/* @ngInject */
var errorNotifier = ['$rootScope', function ($rootScope) {
    var events = {
        error: 'error-occured'
    };
    var service = {
        broadcast: broadcast,
        on: on
    };

    return service;

    function broadcast(error) {
        $rootScope.$emit(events.error, error);
    }

    function on(cb) {
        $rootScope.$on(events.error, function (event, error) {
            cb(error);
        });
    }
}];

module.exports = errorNotifier;
