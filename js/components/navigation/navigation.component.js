(function () {

    'use strict';

    function navigationController($state, auth, restaurant, $rootScope, api, $uibModal, alertService, common) {

        var that = this;
        that.api = api;
        that.auth = auth;
        that.user = auth.authentication.user;
        that.report_items_match_to_show = $rootScope.report_items_match_to_show;
        that.subscription_type_id = $rootScope.subscription_type_id;
        that.state = $state;


        that.isAuth = auth.authentication.isLogged;

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });


        that.$onInit = function () {
            that.permissions = restaurant.data.permissions;
        };

        that.myProfile = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/modal/accountSettings.html',
                controller: myProfileController,
                controllerAs: '$ctr'
            });

            modalInstance.result.then(function () {
                that.user = auth.authentication.user;
                alertService.showAlertSave();
            });
        };

        that.logOut = function () {
            auth.logOut();
            $state.go('login')
        };

        that.linkInventory = function () {

            if ($rootScope.subscription_type_id == 3) {
                $state.go('admin.inventoryCategories');
                return
            }

            if ($rootScope.subscription_type_id == 2) {
                common.beginFoodInventoryCount();
                return
            }

            if ($rootScope.subscription_type_id == 1) {
                common.beginAlcoholInventoryCount();
            }

        };

        that.linkInventoryMain = function () {

            if ($rootScope.subscription_type_id == 3) {
                $state.go('admin.inventoryCategories');
                return
            }

            if ($rootScope.subscription_type_id == 2) {
                $state.go('foodSubCategories');
                return
            }

            if ($rootScope.subscription_type_id == 1) {
                $state.go('alcoholSubCategories');
            }
        }

    }

    navigationController.$inject = ['$state', 'auth', 'restaurant', '$rootScope', 'api', '$uibModal', 'alertService', 'common'];

    angular.module('inspinia').component('navigationComponent', {
        templateUrl: 'js/components/navigation/navigation.html',
        controller: navigationController,
        controllerAs: '$ctr',
        bindings: {}
    });

    var myProfileController = function ($uibModalInstance, auth, api) {
        var that = this;
        that.api = api;
        that.auth = auth;
        var id = auth.authentication.user.id;

        that.m = {
            first_name: auth.authentication.user.first_name,
            last_name: auth.authentication.user.last_name,
            phone_number: auth.authentication.user.phone_number,
            email: auth.authentication.user.email,
            password: null,
            password_confirm: null

        };

        that.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        that.save = function (form) {

            if (!form.$valid) {
                return
            }

            var m = {
                first_name: that.m.first_name,
                last_name: that.m.last_name,
                phone_number: that.m.phone_number,
                email: that.m.email
            };

            if (that.m.password) {
                m.password = that.m.password
            }

            that.api.update_user_info(id, m).then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                        that.api.get_user_info(id).then(function (res) {
                            that.auth.updateMyInfo(res.data.data.user);
                            $uibModalInstance.close();
                        });
                    }
                } catch (e) {

                }
            });
        };
    }

})();