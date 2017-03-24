(function () {

    'use strict';

    function controller(api, $state, auth, localStorageService, $rootScope, restaurant, core) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;

        that.form = {};
        that.core = core;
        that.api = api;
        that.auth = auth;

        that.m = {};


        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });


        that.next = function (form) {

            if (!form.$valid) return;

            var m = {

            };

            that.api.save_bar_serving_details(m).then(function (res) {

            });

        };

        that.$onInit = function () {
            var resId = that.restaurant_id.restaurant_id;
            that.api.bar_serving_details(resId).then(function (res) {

                try {
                    var db = res.data.data.bar_servings.serving_details;
                    angular.forEach(db, function (v, k) {
                        that.m[v.serving_type_id.toString()] = v.quantity
                    });
                } catch (e) {
                    console.log(e);
                }

            });
            that.core.getRefbooks().then(function (res) {
                that.bar_serving_details_types = res.bar_serving_details_types;
            });
        };
    }

    controller.$inject = ['api', '$state', 'auth', 'localStorageService', '$rootScope', 'restaurant', 'core'];

    angular.module('inspinia').component('barServingDetails', {
        templateUrl: 'js/components/alcoholSetup/barServingDetails/barServingDetails.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();