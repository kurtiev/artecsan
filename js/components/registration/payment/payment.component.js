(function () {
    'use strict';

    function paymentController(api, $state, auth, core, restaurant, alertService, localStorageService) {

        var that = this;
        that.isAdministratorEdit = ($state.includes('administrator.restaurantPayment') && (typeof localStorageService.get('restaurant_id') === 'object'));
        that.form = {};
        that.api = api;
        that.restaurant = core.data.new_restaurant;
        that.entities = [];
        that.get_refbooks = [];
        that.isEdit = false;
        that.model = {};
        that.$state = $state;
        that.currYear = new Date().getFullYear().toString().slice(-2);
        that.formatCardApi = 'json';
        that.CardApiKey = 'c208cd8b5d695cd2a3f761fb890e87f3';
        that.invalidCard = false;

        var restaurant_id = $state.params.id;

        if (that.isAdministratorEdit) {
            restaurant_id = localStorageService.get('restaurant_id').restaurant_id;
        }

        if (!core.data.new_restaurant && !restaurant_id && !that.isAdministratorEdit) {
            $state.go('registration');
            return;
        }

        if (!restaurant_id && that.isAdministratorEdit) {
            $state.go('administrator.menu');
            return;
        }

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
        if (restaurant_id && auth.authentication.isLogged && !core.data.new_restaurant) {
            restaurant.set_to_edit(restaurant_id).then(function () {
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

            api.get_credit_card_checker({
                format: that.formatCardApi,
                api_key: that.CardApiKey,
                cc: that.model.card_number
            }).then(function (res) {
                that.validCard = res.data.valid;
                if (!that.validCard) {
                    that.invalidCard = true;
                    alertService.showError('Invalid Credit Card or Debit Card Number');
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


                if (parseInt(restaurant_id)) {
                    var m = {
                        subscription_type_id: core.data.new_restaurant.subscription_type_id,
                        pos_id: core.data.new_restaurant.pos_id,
                        // user_id: core.data.new_restaurant.user_id,
                        restaurant: {
                            restaurant_name: core.data.new_restaurant.restaurant.restaurant_name,
                            entity_type_id: core.data.new_restaurant.restaurant.entity_type_id,
                            address: core.data.new_restaurant.restaurant.address,
                            city_geoname_id: core.data.new_restaurant.restaurant.city_geoname_id,
                            logo_content_item_id: core.data.new_restaurant.restaurant.logo_content_item_id,
                            state_geoname_id: core.data.new_restaurant.restaurant.state_geoname_id,
                            zip: core.data.new_restaurant.restaurant.zip ? core.data.new_restaurant.restaurant.zip.toString() : null,
                            phone_number: core.data.new_restaurant.restaurant.phone_number,
                            pos_report_url: core.data.new_restaurant.restaurant.pos_report_url


                        },
                        payment: {
                            card_number: core.data.new_restaurant.payment.card_number,
                            expiration_month: core.data.new_restaurant.payment.expiration_month,
                            expiration_year: core.data.new_restaurant.payment.expiration_year,
                            coupon_code: core.data.new_restaurant.payment.coupon_code ? core.data.new_restaurant.payment.coupon_code.toString() : core.data.new_restaurant.payment.coupon_code,
                            first_name: core.data.new_restaurant.payment.first_name,
                            last_name: core.data.new_restaurant.payment.last_name,
                            zip: core.data.new_restaurant.payment.zip ? core.data.new_restaurant.payment.zip.toString() : null,
                            billing_address: core.data.new_restaurant.payment.billing_address,
                            cv_code: core.data.new_restaurant.payment.cv_code
                        }
                    };
                    that.api.update_restaurant(m, restaurant_id).then(function (res) {
                        try {
                            if (res.data.data.code === 1000) {
                                alertService.showAlertSave();
                                if (!that.isAdministratorEdit) {
                                    setTimeout(function () {
                                        $state.go('invite', {id: restaurant_id});
                                    }, 1000);
                                }
                            }
                        } catch (e) {
                            console.log(e)
                        }
                    });
                } else {
                    $state.go('terms');
                }
            });


        };

        that.back = function () {

            if (!that.isAdministratorEdit) {
                core.data.new_restaurant.payment.card_number = that.model.card_number;
                core.data.new_restaurant.payment.expiration_month = that.model.expiration_month;
                core.data.new_restaurant.payment.expiration_year = that.model.expiration_year;
                core.data.new_restaurant.payment.coupon_code = that.model.coupon_code;
                core.data.new_restaurant.payment.first_name = that.model.first_name;
                core.data.new_restaurant.payment.last_name = that.model.last_name;
                core.data.new_restaurant.payment.zip = that.model.zip;
                core.data.new_restaurant.payment.billing_address = that.model.billing_address;
                core.data.new_restaurant.payment.cv_code = that.model.cv_code;

                $state.go('restaurantProfile', {id: restaurant_id})

            } else {
                $state.go('administrator.restaurantProfile')
            }
        };

    }

    paymentController.$inject = ['api', '$state', 'auth', 'core', 'restaurant', 'alertService', 'localStorageService'];

    angular.module('inspinia').component('paymentComponent', {
        templateUrl: 'js/components/registration/payment/payment.html',
        controller: paymentController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();