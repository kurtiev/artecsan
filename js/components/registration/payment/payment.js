(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('payment', {
                url: "/payment",
                template: "<payment-component></payment-component>",
                data: {pageTitle: 'Payment'}
            });

    })

})();