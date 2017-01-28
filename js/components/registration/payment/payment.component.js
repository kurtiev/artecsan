(function () {
    'use strict';

    function paymentController(api, $state, auth, core, restaurant, alertService) {

        if (!core.data.new_restaurant && !$state.params.id) {
            $state.go('registration');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.restaurant = core.data.new_restaurant;
        that.entities = [];
        that.get_refbooks = [];
        that.isEdit = false;
        that.model = {};
        that.$state = $state;
        that.currYear = new Date().getFullYear().toString().slice(-2);

        var initModel = function () {
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
        };


        // get restaurant for edit, run if we direct going to this step or just after reloading page
        if ($state.params.id && auth.authentication.isLogged && !core.data.new_restaurant) {
            restaurant.set_to_edit($state.params.id).then(function () {
                initModel();
                that.isEdit = true;
            })
        } else {
            initModel();
        }

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

            if (parseInt($state.params.id)) {
                var m = {
                    subscription_type_id: core.data.new_restaurant.subscription_type_id,
                    pos_id: core.data.new_restaurant.pos_id,
                    user_id: core.data.new_restaurant.user_id,
                    restaurant: {
                        restaurant_name: core.data.new_restaurant.restaurant.restaurant_name,
                        entity_type_id: core.data.new_restaurant.restaurant.entity_type_id,
                        street_address: core.data.new_restaurant.restaurant.street_address,
                        city_geoname_id: core.data.new_restaurant.restaurant.city_geoname_id,
                        logo_content_item_id: core.data.new_restaurant.restaurant.logo_content_item_id,
                        state_geoname_id: core.data.new_restaurant.restaurant.state_geoname_id,
                        zip: core.data.new_restaurant.restaurant.zip,
                        phone_number: core.data.new_restaurant.restaurant.phone_number
                    },
                    payment: {
                        card_number: core.data.new_restaurant.payment.card_number,
                        expiration_month: core.data.new_restaurant.payment.expiration_month,
                        expiration_year: core.data.new_restaurant.payment.expiration_year,
                        coupon_code: core.data.new_restaurant.payment.coupon_code,
                        first_name: core.data.new_restaurant.payment.first_name,
                        last_name: core.data.new_restaurant.payment.last_name,
                        zip: core.data.new_restaurant.payment.zip,
                        billing_address: core.data.new_restaurant.payment.billing_address,
                        cv_code: core.data.new_restaurant.payment.cv_code
                    }
                };
                that.api.update_restaurant(m, $state.params.id).then(function (res) {
                    try {
                        if (res.data.data.code === 1000) {
                            alertService.showAlertSave();
                            setTimeout(function () {
                                $state.go('invite', {id: $state.params.id});
                            }, 1000);
                        }
                    } catch (e) {
                        console.log(e)
                    }
                });
            } else {
                $state.go('terms');
            }
        };

        that.back = function () {
            core.data.new_restaurant.payment.card_number = that.model.card_number;
            core.data.new_restaurant.payment.expiration_month = that.model.expiration_month;
            core.data.new_restaurant.payment.expiration_year = that.model.expiration_year;
            core.data.new_restaurant.payment.coupon_code = that.model.coupon_code;
            core.data.new_restaurant.payment.first_name = that.model.first_name;
            core.data.new_restaurant.payment.last_name = that.model.last_name;
            core.data.new_restaurant.payment.zip = that.model.zip;
            core.data.new_restaurant.payment.billing_address = that.model.billing_address;
            core.data.new_restaurant.payment.cv_code = that.model.cv_code;

            if ($state.params.id) {
                $state.go('restaurantProfile', {id: $state.params.id})
            } else {
                $state.go('restaurantProfile')
            }
        };

    }

    paymentController.$inject = ['api', '$state', 'auth', 'core', 'restaurant', 'alertService'];

    angular.module('inspinia').component('paymentComponent', {
        templateUrl: 'js/components/registration/payment/payment.html',
        controller: paymentController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();