(function () {
    'use strict';

    function paymentController(api, $state, auth, core) {

        if (!core.data.new_restaurant) {
            $state.go('registration');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.restaurant = core.data.new_restaurant;
        that.entities = [];
        that.get_refbooks = [];

        that.model = {
            card_number: core.data.new_restaurant ? core.data.new_restaurant.payment.card_number : null,
            expiration_month: core.data.new_restaurant ? core.data.new_restaurant.payment.expiration_month : null,
            expiration_year: core.data.new_restaurant ? core.data.new_restaurant.payment.expiration_year : null,
            coupon_code: core.data.new_restaurant ? core.data.new_restaurant.payment.coupon_code : null,
            first_name: core.data.new_restaurant ? core.data.new_restaurant.payment.first_name : null,
            last_name: core.data.new_restaurant ? core.data.new_restaurant.payment.last_name : null,
            zip: core.data.new_restaurant ? core.data.new_restaurant.payment.zip : null,
            billing_address: core.data.new_restaurant ? core.data.new_restaurant.payment.billing_address : null,
            cv_code: core.data.new_restaurant ? core.data.new_restaurant.payment.cv_code : null
        };

        that.submit = function (form) {

            if (!form.$valid) {
                return
            }

            core.data.new_restaurant.payment.card_number = that.model.card_number;
            core.data.new_restaurant.payment.expiration_month = that.model.expiration_month;
            core.data.new_restaurant.payment.expiration_year = that.model.expiration_year;
            core.data.new_restaurant.payment.coupon_code = that.model.coupon_code;
            core.data.new_restaurant.payment.first_name = that.model.first_name;
            core.data.new_restaurant.payment.last_name = that.model.last_name;
            core.data.new_restaurant.payment.zip = that.model.zip;
            core.data.new_restaurant.payment.billing_address = that.model.billing_address;
            core.data.new_restaurant.payment.cv_code = that.model.cv_code;

            $state.go('terms');
        };

        that.back = function () {
            core.data.new_restaurant.payment.card_number = that.model.card_number;
            core.data.new_restaurant.payment.expiration_month = that.model.expiration_month;
            core.data.new_restaurant.payment.expiration_year = that.model.expiration_year;
            core.data.new_restaurant.payment.coupon_code = that.model.coupon_code;
            core.data.new_restaurant.payment.first_name = that.model.first_name;
            core.data.new_restaurant.payment.last_name = that.model.last_name;
            core.data.new_restaurant.payment.zip = that.model.phone_number;
            core.data.new_restaurant.payment.billing_address = that.model.billing_address;
            core.data.new_restaurant.payment.cv_code = that.model.cv_code;

            $state.go('restaurantProfile');
        };

    }

    paymentController.$inject = ['api', '$state', 'auth', 'core'];

    angular.module('inspinia').component('paymentComponent', {
        templateUrl: 'js/components/registration/payment/payment.html',
        controller: paymentController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();