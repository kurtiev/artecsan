(function () {
    'use strict';

    function menuItemsMappingController(api, $state, auth, localStorageService, restaurant, $rootScope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.base_api_url = appConfig.apiDomain;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.posSyncList = [];

        $rootScope.$on('restaurantSelected', function () {
            that.pos_id = $state.params.pos_id || restaurant.data.info.pos_id;
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






    }

    menuItemsMappingController.$inject = ['api', '$state', 'auth', 'localStorageService', 'restaurant', '$rootScope'];

    angular.module('inspinia').component('menuItemsMappingComponent', {
        templateUrl: 'js/components/reports/menuItemsMapping/menuItemsMapping.html',
        controller: menuItemsMappingController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();