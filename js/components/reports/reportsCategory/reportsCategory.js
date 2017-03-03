(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('reports.reportsCategory', {
                url: "/reports-category",
                templateUrl: 'js/components/reports/reportsCategory/reportsCategory.html',
                data: {pageTitle: 'Reports'},
                controllerAs: '$ctr',
                controller: function ($rootScope) {}
            });
    })

})();