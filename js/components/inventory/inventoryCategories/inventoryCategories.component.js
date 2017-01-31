(function () {
    'use strict';

    function inventoryCategoriesController(api, $state, auth, localStorageService, SweetAlert) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.auth = auth;


        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }


    }
    inventoryCategoriesController.$inject = ['api', '$state', 'auth', 'localStorageService', 'SweetAlert'];

    angular.module('inspinia').component('inventoryCategoriesComponent', {
        templateUrl: 'js/components/inventory/inventoryCategories/inventoryCategories.html',
        controller: inventoryCategoriesController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();