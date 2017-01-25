(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('subscription', {
                url: "/subscription",
                template: "<subscription-component></subscription-component>",
                data: {pageTitle: ' Subscriptions'}
            });

    })

})();