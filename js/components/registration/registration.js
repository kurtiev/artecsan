(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('registration', {
                url: "/registration",
                template: "<registration-component></registration-component>",
                data: {pageTitle: ' Registration'}
            });

    })

})();