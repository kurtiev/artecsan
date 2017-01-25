(function () {

    'use strict';

    function headerController(core, auth, $state, restaurant) {

        var that = this;
        that.isAuth = auth.authentication.isLogged;


        that.$onInit = function () {
            core.getSettings().then(function (res) {
                that.settings = res
            });

            try {
                if (restaurant.data.info) {
                    that.restaurantName = restaurant.data.info.restaurant_name
                }

            } catch (e) {
                console.log(e)
            }
        };

        that.logout = function () {
            auth.logOut();
            $state.go('login')
        }
    }

    headerController.$inject = ['core', 'auth', '$state', 'restaurant'];

    angular.module('inspinia').component('headerComponent', {
        templateUrl: 'js/components/header/header.html',
        controller: headerController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();