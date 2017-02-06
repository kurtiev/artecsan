(function () {
    'use strict';

    function addPosHereController(api, $state, auth, localStorageService, restaurant, $rootScope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        $rootScope.$on('restaurantSelected', function () {
            that.pos_id = restaurant.data.info.pos_id
        });

        var that = this;
        that.base_api_url = appConfig.apiDomain;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.posSyncList = [];
        that.instalation_manual = null;
        // that.pos_id = $state.params.pos_id;

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        that.$onInit = function () {

            that.pos_id = restaurant.data.info.pos_id;

            api.get_pos_list().then(function (res) {
                that.posSyncList = res.data.data.list;

                for (var i = 0; that.posSyncList.length > i; i++) {
                    if (that.posSyncList[i].id == that.pos_id) {
                        that.instalation_manual = that.posSyncList[i].instalation_manual;
                    }
                }
            });

        };

        that.backPosSync = function () {
            $state.go('admin.posSync');
        };


    }

    addPosHereController.$inject = ['api', '$state', 'auth', 'localStorageService', 'restaurant', '$rootScope'];

    angular.module('inspinia').component('addPosHereComponent', {
        templateUrl: 'js/components/admin/addPosHere/addPosHere.html',
        controller: addPosHereController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();