(function () {
    'use strict';

    function foodInventoryController(api, $state, auth, localStorageService, SweetAlert, $rootScope, restaurant) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.get_vendors_categories = [];
        that.selectedRow = null;
        that.updateInventoryItem = [];


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

        that.model = {
            vendor_category_id: null,
            inventory_item: null
        };


        that.vendors_categories = function () {
            api.get_vendors_categories({is_restaurant_used_only: 1}).then(function (res) {
                try {
                    that.get_vendors_categories = res.data.data.categories;
                } catch (e) {
                    console.log(e);
                }
            })
        };

        that.vendors_categories();

        that.getInventoryItem = function (categoryId) {
            console.log(categoryId);
        };


        that.setInventoryItem = function(index, item){

            console.log(item);


            console.log(that.updateInventoryItem);
            that.selectedRow = index;
        };


        //
        // that.$onInit = function () {
        //     getChosenVendors()
        // };

    }

    foodInventoryController.$inject = ['api', '$state', 'auth', 'localStorageService', 'SweetAlert', '$rootScope', 'restaurant'];

    angular.module('inspinia').component('foodInventoryComponent', {
        templateUrl: 'js/components/foodSetup/foodInventory/foodInventory.html',
        controller: foodInventoryController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();