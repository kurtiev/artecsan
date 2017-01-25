/**
 * Created by Eugen Protsenko on 25.01.2017.
 */
(function () {

    'use strict';

    function navigationController(core, auth) {

        var that = this;
        that.isAuth = auth.authentication.isLogged;


    }

    navigationController.$inject = ['core', 'auth'];

    angular.module('inspinia').component('navigationComponent', {
        templateUrl: 'js/components/navigation/navigation.html',
        controller: navigationController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();