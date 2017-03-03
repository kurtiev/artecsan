(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('reports', {
                url: "/reports",
                data: {pageTitle: 'Reports'},
                template: '<ui-view></ui-view>',
                abstract: true,
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