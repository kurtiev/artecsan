(function () {
    'use strict';

    function subscriptionController(api, $state, auth, core) {

        if (!core.data.new_restaurant) {
            $state.go('registration');
            return;
        }

        var that = this;

        that.subscriptions = [];
        that.settings = core.data.settings;
        that.restaurant = core.data.new_restaurant;

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
                $state.go('restaurantUserProfile');
            }
        };


    }

    subscriptionController.$inject = ['api', '$state', 'auth', 'core'];

    angular.module('inspinia').component('subscriptionComponent', {
        templateUrl: 'js/components/registration/subscription/subscription.html',
        controller: subscriptionController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();