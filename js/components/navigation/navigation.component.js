(function () {

    'use strict';

    function navigationController($state, auth, restaurant, $rootScope, api, core) {

        var that = this;
        that.api = api;

        that.state = $state;


        that.isAuth = auth.authentication.isLogged;

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });


        that.$onInit = function () {
            that.permissions = restaurant.data.permissions;
        };


        that.logOut = function () {
            auth.logOut();
            $state.go('login')
        }

    }

    navigationController.$inject = ['$state', 'auth', 'restaurant', '$rootScope', 'api', 'core'];

    angular.module('inspinia').component('navigationComponent', {
        templateUrl: 'js/components/navigation/navigation.html',
        controller: navigationController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();