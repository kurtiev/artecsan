(function () {
    'use strict';

    function posSyncController(api, $state, auth, localStorageService, SweetAlert, core) {

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

        that.pos_id = localStorageService.get('pos_id').pos_id;
        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        that.selectSyncPos = function (pos) {
            localStorageService.set('pos_id', {
                pos_id: pos.id
            });
            $state.go('admin.addPosHere', {pos_id: pos.id});
        };

        that.$onInit = function () {
            api.get_pos_list().then(function (res) {
                that.posSyncList = res.data.data.list
            })
        };

    }

    posSyncController.$inject = ['api', '$state', 'auth', 'localStorageService', 'SweetAlert', 'core'];

    angular.module('inspinia').component('posSyncComponent', {
        templateUrl: 'js/components/admin/posSync/posSync.html',
        controller: posSyncController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();