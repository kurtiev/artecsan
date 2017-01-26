(function () {

    'use strict';

    function navigationController($state, auth) {

        var that = this;
        that.isAuth = auth.authentication.isLogged;

        that.logOut = function () {
            auth.logOut();
            $state.go('login')
        }

    }

    navigationController.$inject = ['$state', 'auth'];

    angular.module('inspinia').component('navigationComponent', {
        templateUrl: 'js/components/navigation/navigation.html',
        controller: navigationController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();