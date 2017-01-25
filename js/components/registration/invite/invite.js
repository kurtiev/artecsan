(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('invite', {
                url: "/invite",
                template: "<invite-component></invite-component>",
                data: {pageTitle: 'Invite Users'}
            });

    })

})();