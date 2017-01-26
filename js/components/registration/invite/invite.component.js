(function () {
    'use strict';

    var addUserInviteController = function (user, refbooks, $uibModalInstance) {

        var that = this;

        that.form = {};

        that.userTypes = refbooks.user_types;

        that.m = {
            email: user ? user.email : null,
            first_name: user ? user.first_name : null,
            last_name: user ? user.last_name : null,
            type_ids: user ? user.type_ids : null,
            is_active: user ? user.is_active : 1
        };

        that.add = function (form) {

            if (!form.$valid) {
                return
            }

            $uibModalInstance.close(that.m);

        };

        that.close = function () {
            $uibModalInstance.dismiss('cancel');
        }

    };

    function inviteController(api, $state, auth, core, $uibModal, restaurant, alertService) {

        if (!auth.authentication.isLogged) {
            $state.go('registration');
            return;
        }

        if (!restaurant.data.info) {
            $state.go('registration');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.usersList = [];
        that.get_refbooks = [];

        that.usersList = [];

        that.$onInit = function () {
            core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
            });
        };

        that.userTypesFilter = function (type_id) {
            for (var i = 0; that.get_refbooks.user_types.length > 0; i++) {
                if (that.get_refbooks.user_types[i].id === type_id) {
                    return that.get_refbooks.user_types[i].name
                }
            }
        };

        that.delete = function ($index) {
            that.usersList.splice($index, 1)
        };

        that.addUser = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'add-user-for-invite.html',
                controller: addUserInviteController,
                controllerAs: 'vm',
                resolve: {
                    user: function () {
                        return null
                    },
                    refbooks: that.get_refbooks
                }
            });

            modalInstance.result.then(function (user) {
                if (user) {
                    that.usersList.push(user)
                }
            }, function () {

            });
        };

        that.editUser = function (user, $index) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'add-user-for-invite.html',
                controller: addUserInviteController,
                controllerAs: 'vm',
                resolve: {
                    user: function () {
                        return user
                    },
                    refbooks: that.get_refbooks
                }
            });

            modalInstance.result.then(function (user) {
                if (user) {
                    that.usersList[$index] = user
                }
            }, function () {

            });
        };

        that.sentInvitations = function (isExit) {

            if (!that.usersList.length) {
                alert('Please add users before sending');
                return
            }

            var sentList = [];

            for (var i = 0; that.usersList.length > i; i++) {
                var u = {
                    email: that.usersList[i].email,
                    first_name: that.usersList[i].first_name,
                    last_name: that.usersList[i].last_name,
                    type_ids: [that.usersList[i].type_ids],
                    is_active: that.usersList[i].is_active
                };
                sentList.push(u)
            }

            var model = {
                users: sentList,
                restaurant_id: restaurant.data.info.id
            };

            if (restaurant.data.info.id) {
                that.api.users_invite(model).then(function (res) {
                    if (res.data.data.code === 1000) {
                        alertService.showSuccessText('Invitations were sent')
                    }
                    if (!isExit) {
                        $state.go('food.vendorSetup');
                    } else {
                        $state.go('home');
                    }
                })
            }

        };

    }

    inviteController.$inject = ['api', '$state', 'auth', 'core', '$uibModal', 'restaurant', 'alertService'];

    angular.module('inspinia').component('inviteComponent', {
        templateUrl: 'js/components/registration/invite/invite.html',
        controller: inviteController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();