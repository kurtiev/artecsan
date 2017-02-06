(function () {
    'use strict';

    function posSyncController(api, $state, auth, localStorageService, restaurant, $rootScope) {

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
            that.pos_id = $state.params.pos_id || restaurant.data.info.pos_id
        });

        if (restaurant.data.info) {
            that.pos_id = $state.params.pos_id || restaurant.data.info.pos_id
        }

        // that.pos_id = $state.params.pos_id;


        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        that.selectSyncPos = function (pos) {
            if ($state.includes('foodSetup')) {
                $state.go('foodSetup.addPosHere', {pos_id: pos.id});
            } else {
                $state.go('administrator.addPosHere', {pos_id: pos.id});
            }
        };

        that.$onInit = function () {
            api.get_pos_list().then(function (res) {
                that.posSyncList = res.data.data.list
            })
        };

        that.back = function () {
            if ($state.includes('foodSetup')) {
                $state.go('food.setupConfirmation');
            } else {
                $state.go('administrator.menu');
            }

        };

    }

    posSyncController.$inject = ['api', '$state', 'auth', 'localStorageService', 'restaurant', '$rootScope'];

    angular.module('inspinia').component('posSyncComponent', {
        templateUrl: 'js/components/administrator/posSync/posSync.html',
        controller: posSyncController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();