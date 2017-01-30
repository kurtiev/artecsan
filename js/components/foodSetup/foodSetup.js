(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('foodSetup', {
                url: "/food",
                data: {pageTitle: ' Food Setup'},
                abstract: true,
                template: '<ui-view></ui-view>'
            });
    })

})();