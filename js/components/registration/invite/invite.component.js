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
            is_disabled: user ? user.is_disabled : 1
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

    function inviteController(api, $state, auth, core, $uibModal, alertService, SweetAlert) {

        if (!auth.authentication.isLogged || !parseInt($state.params.id)) {
            $state.go('registration');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.usersList = [];
        that.get_refbooks = [];

        api.get_restaurant($state.params.id).then(function (res) {
            try {
                var restaurant_to_edit = res.data.data.restaurants_list[0];
                that.usersList = restaurant_to_edit.employees;
            } catch (e) {
                $state.go('home');
            }
        });

        that.$onInit = function () {
            core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
            });
        };

        that.userTypesFilter = function (type_id) {
            if (that.get_refbooks.user_types) {
                for (var i = 0; that.get_refbooks.user_types.length > i; i++) {
                    if (that.get_refbooks.user_types[i].id === type_id) {
                        return that.get_refbooks.user_types[i].name
                    }
                }
            }

        };

        that.delete = function ($index) {
            if (that.usersList[$index].id) {

                var m = {
                    user_type_id: that.usersList[$index].type_ids,
                    ids: [that.usersList[$index].id]
                };

                that.api.delete_invite(m).then(function (res) {
                    if (res.data.data.code === 1000) {
                        that.usersList.splice($index, 1)
                    }
                });

            } else {
                that.usersList.splice($index, 1)
            }
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

        that.changeUserStatus = function (user, $index) {
            if (user.id) {
                SweetAlert.swal({
                        title: "Are you sure?",
                        text: "This user will be blocked and wouldn't be able work with this restaurant",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#ed5565",
                        confirmButtonText: "Confirm"
                    },
                    function (res) {
                        if (res) {
                            var id = $state.params.id;
                            var m = {
                                employees: [{
                                    user_id: user.id,
                                    is_disabled: user.is_disabled
                                }]
                            };

                            that.api.change_restaurant_employee_status(id, m).then(function (res) {

                            }, function (error) {
                                that.usersList[$index].is_disabled = user.is_disabled === 1 ? 0 : 1;
                            });
                        } else {
                            that.usersList[$index].is_disabled = user.is_disabled === 1 ? 0 : 1;
                        }
                    });
            }

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
                    is_disabled: that.usersList[i].is_disabled // confuse
                };
                sentList.push(u)
            }

            var model = {
                users: sentList,
                restaurant_id: $state.params.id
            };

            that.api.users_invite(model).then(function (res) {
                if (res.data.data.code === 1000) {
                    alertService.showSuccessText('Invitations were sent')
                }
                if (!isExit) {
                    $state.go('foodSetup.vendor');
                } else {
                    $state.go('home');
                }
            })

        };

        that.back = function () {
            $state.go('payment', {id: $state.params.id});
        }

    }

    inviteController.$inject = ['api', '$state', 'auth', 'core', '$uibModal', 'alertService', 'SweetAlert'];

    angular.module('inspinia').component('inviteComponent', {
        templateUrl: 'js/components/registration/invite/invite.html',
        controller: inviteController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();