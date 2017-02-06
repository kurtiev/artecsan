(function () {
    'use strict';

    function modalController($uibModalInstance, api) {


        var that = this;

        that.form = {};

        that.api = api;
        that.location = null;

        that.submit = function (form) {

            if (!form.$valid) {
                return
            }

            that.api.get_omnivore_location(that.location).then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                        $uibModalInstance.close();
                    }
                } catch (e) {

                }
            });

        };

        that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    function addPosHereController(api, $state, auth, localStorageService, alertService, $uibModal) {

        if (!auth.authentication.isLogged || !parseInt($state.params.pos_id)) {
            $state.go('home');
            return;
        }


        var that = this;
        that.base_api_url = appConfig.apiDomain;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.$state = $state;
        that.location = null;
        that.posSyncList = [];
        that.instalation_manual = null;
        that.pos_id = $state.params.pos_id;

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        that.connect = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'location_code.html',
                controller: modalController,
                windowClass: "animated fadeIn modal-lgg",
                controllerAs: '$ctr',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                alertService.showAlertSave();
                $state.go('administrator.inventoryComplete')
            });
        };


        that.$onInit = function () {

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

            if (that.$state.includes('foodSetup')) {
                that.$state.go('foodSetup.posSync', {pos_id: $state.params.pos_id});
            } else {
                that.$state.go('administrator.posSync', {pos_id: $state.params.pos_id});
            }

        };


    }

    addPosHereController.$inject = ['api', '$state', 'auth', 'localStorageService', 'alertService', '$uibModal'];

    angular.module('inspinia').component('addPosHereComponent', {
        templateUrl: 'js/components/administrator/addPosHere/addPosHere.html',
        controller: addPosHereController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();