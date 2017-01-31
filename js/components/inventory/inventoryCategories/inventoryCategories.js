(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('inventory.inventoryCategories', {
                url: "/inventory_categories",
                template: "<inventory-categories-controller></inventory-categories-controller>",
                data: {pageTitle: 'Inventory Categories'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                            },
                            {
                                name: 'ui.footable',
                                files: ['js/plugins/footable/angular-footable.js']
                            }
                        ]);
                    }
                }
            });
    })

})();