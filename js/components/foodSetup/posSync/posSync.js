(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('foodSetup.posSync', {
                url: "/pos_sync/:pos_id",
                template: '<pos-sync-component></pos-sync-component>',
                data: {pageTitle: ' POS Setup'}
            })
    })

})();