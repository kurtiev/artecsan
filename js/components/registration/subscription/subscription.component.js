(function () {
    'use strict';

    var subscriptionContactUs = function ($uibModalInstance, api, alertService) {

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

    function subscriptionController(api, $state, auth, core, $uibModal, restaurant) {

        var that = this;
        that.auth = auth;

        that.subscriptions = [];
        that.settings = core.data.settings;
        that.restaurant = core.data.new_restaurant;
        var isEdit = core.data.new_restaurant ? true : false;

        // get restaurant for edit, run if we can direct going to this step or just after reloading page
        if ($state.params.id && auth.authentication.isLogged && !core.data.new_restaurant) {
            restaurant.set_to_edit($state.params.id).then(function () {
                that.restaurant = core.data.new_restaurant;
                isEdit = true;
            })
        }

        if (!core.data.new_restaurant && !that.auth.authentication.isLogged) {
            $state.go('registration');
            return;
        }

        that.contactUsPopup = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'contact_us.html',
                controller: subscriptionContactUs,
                controllerAs: 'vm'
            });

            modalInstance.result.then(function () {
                if (that.auth.authentication.isLogged) {
                    $state.go('home');
                }
            }, function () {

            });
        };

        that.$onInit = function () {
            api.rb_subscriptions().then(function (res) {
                that.subscriptions = res.data.data.subscriptions;

                // if user is not logged, then set him default subscription_type_id (price plan)
                if (!that.auth.authentication.isLogged) {
                    that.restaurant.subscription_type_id = that.restaurant.subscription_type_id ? that.restaurant.subscription_type_id : that.subscriptions[1].subscription_id
                }
            });
        };

        that.back = function () {
            if ($state.params.id) {
                $state.go('registration', {id : $state.params.id})
            } else {
                $state.go('registration')
            }
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
                    if (isEdit) {
                        $state.go('restaurantProfile', {id: $state.params.id});
                    } else {
                        $state.go('restaurantProfile');
                    }
                } else {
                    $state.go('restaurantUserProfile');
                }
            }
        };


    }

    subscriptionController.$inject = ['api', '$state', 'auth', 'core', '$uibModal', 'restaurant'];

    angular.module('inspinia').component('subscriptionComponent', {
        templateUrl: 'js/components/registration/subscription/subscription.html',
        controller: subscriptionController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();