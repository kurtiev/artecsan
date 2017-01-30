(function () {

    'use strict';

    function navigationController($state, auth, restaurant, $rootScope, api, core) {

        var that = this;
        that.api = api;
        that.menuItems = [];
        that.moduleId = null;


        that.isAuth = auth.authentication.isLogged;


        core.getRefbooks().then(function (res) {
            that.menuItems = res.menu_items;
        });


        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;


            that.closeReadingItems = function (menuItemId) {
                for (var i = 0; that.menuItems.length > i; i++) {
                    if (that.menuItems[i].menu_item_id == menuItemId) {
                        that.moduleId = that.menuItems[i].module_id;
                    }
                }

                for (var k in that.permissions) {
                    if (k == that.moduleId) {
                        return that.permissions[k].r;
                    }
                }
            };
        });


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