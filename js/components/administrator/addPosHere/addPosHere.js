(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('administrator.addPosHere', {
                url: "/add_pos_here/:pos_id",
                template: "<add-pos-here-component></add-pos-here-component>",
                data: {pageTitle: 'Add POS Here'},
                params: {
                    pos_id: null
                }
            });
    })

})();