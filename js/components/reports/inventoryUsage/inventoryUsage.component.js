(function () {
    'use strict';

    function controller(api, $state, auth, localStorageService, restaurant, $rootScope, core) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.core = core;
        that.data = [];

        that.isFood = $state.includes('reports.food');

        that.inventory_type_id = that.isFood ? 1 : 2;

        that.searchModel = {
            date_from: new Date(),
            date_to: new Date()
        };

        that.searchModel.date_from = that.searchModel.date_from.setDate(that.searchModel.date_from.getDate() - 7);

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        that.search = function (form) {

            if (!form.$valid) return;

            var m = {
                inventory_type_id: that.inventory_type_id,
                date_from: parseInt(new Date(that.searchModel.date_from).getTime() / 1000),
                date_to: parseInt(new Date(that.searchModel.date_to).getTime() / 1000)
            };

            that.api.inventory_usage_report(m).then(function (res) {
                that.data = res.data.data.inventory_usage_report;
            });

        };

        that.$onInit = function () {
            that.core.getRefbooks().then(function (res) {
                that.refbooks = res;
                that.search(that.form);

            })
        };


    }

    controller.$inject = ['api', '$state', 'auth', 'localStorageService', 'restaurant', '$rootScope', 'core'];

    angular.module('inspinia').component('inventoryUsage', {
        templateUrl: 'js/components/reports/inventoryUsage/inventoryUsage.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();