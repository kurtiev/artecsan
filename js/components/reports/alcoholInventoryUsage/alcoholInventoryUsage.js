(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('reports.alcohol.inventoryUsage', {
                url: "/inventory-usage",
                template: "<inventory-usage></inventory-usage>",
                data: {pageTitle: 'Inventory Usage'}
            });
    })

})();