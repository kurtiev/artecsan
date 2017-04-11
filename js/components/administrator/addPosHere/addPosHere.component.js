(function () {
    'use strict';

    function modalController($uibModalInstance, api, alertService) {


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

                    if (!res.data.data.pos_info.errors) {
                        $uibModalInstance.close();
                    } else {
                        var reasons = [];

                        for (var i = 0; res.data.data.pos_info.errors.length > i; i++) {
                            reasons.push(res.data.data.pos_info.errors[i].description)
                        }

                        var message = reasons.join(', ');

                        alertService.showErrorInvitation('', message);
                    }
                } catch (e) {

                }
            });

        };

        that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    function addPosHereController(api, $state, auth, localStorageService, alertService, $uibModal, $rootScope, restaurant, common) {

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
        that.pos_report_url = null;

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
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
                if (that.$state.includes('foodSetup')) {
                    that.$state.go('foodSetup.inventoryComplete', {pos_id: $state.params.pos_id});
                } else if (that.$state.includes('alcoholSetup')) {
                    that.$state.go('alcoholSetup.inventoryComplete', {pos_id: $state.params.pos_id});
                } else {
                    that.$state.go('administrator.posSync', {pos_id: $state.params.pos_id});
                }

            });
        };

        that.updateCsvPath = function (form) {
            if (!form.$valid) {
                return
            }
            that.api.update_csv_path(that.restaurant_id.restaurant_id, {pos_report_url: that.pos_report_url}).then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                        alertService.showAlertSave();
                        if ($rootScope.subscription_type_id == 3) {
                            $state.go('admin.inventoryAuditAsk');
                            return
                        }

                        if ($rootScope.subscription_type_id == 2) {
                            common.beginFoodInventoryCount();
                            return
                        }

                        if ($rootScope.subscription_type_id == 1) {
                            common.beginAlcoholInventoryCount();
                        }

                    }
                } catch (e) {
                    console.log(e);
                }
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

            api.get_restaurant(that.restaurant_id.restaurant_id).then(function (res) {
                try {
                    that.pos_report_url = res.data.data.restaurants_list[0].pos_report_url;
                } catch (e) {
                    console.log(e)
                }
            });

        };

        that.backPosSync = function () {

            if (that.$state.includes('foodSetup')) {
                that.$state.go('foodSetup.posSync', {pos_id: $state.params.pos_id});
            } else if (that.$state.includes('alcoholSetup')) {
                that.$state.go('alcoholSetup.posSync', {pos_id: $state.params.pos_id});
            } else {
                that.$state.go('administrator.posSync', {pos_id: $state.params.pos_id});
            }

        };


    }

    addPosHereController.$inject = ['api', '$state', 'auth', 'localStorageService', 'alertService', '$uibModal', '$rootScope', 'restaurant', 'common'];

    angular.module('inspinia').component('addPosHereComponent', {
        templateUrl: 'js/components/administrator/addPosHere/addPosHere.html',
        controller: addPosHereController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();