(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('reports.reportsCategory', {
                url: "/reports-category",
                templateUrl: 'js/components/reports/reportsCategory/reportsCategory.html',
                data: {pageTitle: 'Reports'},
                controllerAs: '$ctr',
                controller: function ($rootScope, restaurant) {

                    var that = this;

                    $rootScope.$on('restaurantSelected', function () {
                        that.permissions = restaurant.data.permissions;
                    });

                    if (restaurant.data.permissions) {
                        that.permissions = restaurant.data.permissions
                    }
                }
            });
    })

})();