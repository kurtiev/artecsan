(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin', {
                url: "/admin",
                abstract: true,
                templateUrl: "views/common/content.html"
            });
    })

})();