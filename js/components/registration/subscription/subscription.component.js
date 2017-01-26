(function () {
    'use strict';

    var subscriptionContactUs = function (user, $uibModalInstance, api, alertService) {

        var that = this;

        that.form = {};

        that.m = {
            email: null,
            first_name: null,
            last_name: null,
            phone_number: null,
            message: null
        };

        that.contactUs = function (form) {

            if (!form.$valid) {
                return
            }

            var m = {
                first_name: that.m.first_name,
                last_name: that.m.last_name,
                phone_number: that.m.phone_number,
                email: that.m.email,
                message: that.m.message
            };

            api.contact_us(m).then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                        alertService.successfullySent('Successfully sent');
                        that.close();
                    }
                } catch (e) {
                    console.log(e);
                }
            }, function (e) {
                console.log(e);
            })

        };

        that.close = function () {
            $uibModalInstance.dismiss('cancel');
        }

    };

    function subscriptionController(api, $state, auth, core, $uibModal) {

        if (!core.data.new_restaurant) {
            $state.go('registration');
            return;
        }

        var that = this;

        that.subscriptions = [];
        that.settings = core.data.settings;
        that.restaurant = core.data.new_restaurant;

        that.contactUsPopup = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'contact_us.html',
                controller: subscriptionContactUs,
                controllerAs: 'vm',
                resolve: {
                    user: function () {
                        return null
                    }
                }
            });

            modalInstance.result.then(function (user) {
                if (user) {
                    that.usersList.push(user)
                }
            }, function () {

            });
        };

        that.$onInit = function () {
            api.rb_subscriptions().then(function (res) {
                that.subscriptions = res.data.data.subscriptions;
                that.restaurant.subscription_type_id = that.restaurant.subscription_type_id ? that.restaurant.subscription_type_id : that.subscriptions[1].subscription_id
            });
        };

        that.select = function (subscription, is_sign_up) {
            if (subscription) {
                that.restaurant.subscription_type_id = subscription.subscription_id;
            } else {
                that.restaurant.subscription_type_id = 0;
            }

            if (is_sign_up && that.restaurant.subscription_type_id !== 0) {
                core.data.new_restaurant.subscription_type_id = that.restaurant.subscription_type_id;
                if (auth.authentication.isLogged) {
                    $state.go('restaurantProfile');
                } else {
                    $state.go('restaurantUserProfile');
                }
            }
        };


    }

    subscriptionController.$inject = ['api', '$state', 'auth', 'core', '$uibModal'];

    angular.module('inspinia').component('subscriptionComponent', {
        templateUrl: 'js/components/registration/subscription/subscription.html',
        controller: subscriptionController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();