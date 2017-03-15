(function () {
    'use strict';

    function termsController(api, $state, core, alertService, restaurant, localStorageService) {

        if (!core.data.new_restaurant) {
            $state.go('registration');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.agree = false;
        that.restaurant = core.data.new_restaurant;
        that.inRequest = false;

        that.submit = function (form) {

            if (!form.$valid) {
                return
            }

            that.inRequest = true;

            var m = {
                subscription_type_id: core.data.new_restaurant.subscription_type_id,
                pos_id: core.data.new_restaurant.pos_id,
                user_id: core.data.new_restaurant.user_id,
                restaurant: {
                    restaurant_name: core.data.new_restaurant.restaurant.restaurant_name,
                    entity_type_id: core.data.new_restaurant.restaurant.entity_type_id,
                    address: core.data.new_restaurant.restaurant.address,
                    city_geoname_id: core.data.new_restaurant.restaurant.city_geoname_id,
                    logo_content_item_id: core.data.new_restaurant.restaurant.logo_content_item_id,
                    state_geoname_id: core.data.new_restaurant.restaurant.state_geoname_id,
                    zip: core.data.new_restaurant.restaurant.zip,
                    phone_number: core.data.new_restaurant.restaurant.phone_number
                    // pos_report_url: core.data.new_restaurant.restaurant.pos_report_url
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

            that.api.create_restaurant(m).then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                        // set current restaurant
                        alertService.showSuccessText('Congratulations', 'Your restaurant was created.');
                        restaurant.set_restaurant(res.data.data.id).then(function () {
                            $state.go('invite', {id : res.data.data.id});
                        });

                    }
                    that.inRequest = false;
                } catch (e) {
                    console.log(e);
                    that.inRequest = false;
                }
            }, function (error) {
                that.inRequest = false;
            });

        };


        that.back = function () {
            $state.go('payment');
        };

        that.$onInit = function () {
            core.getSettings().then(function (res) {
                that.settings = res;
            });
        }

    }

    termsController.$inject = ['api', '$state', 'core', 'alertService', 'restaurant', 'localStorageService'];

    angular.module('inspinia').component('termsComponent', {
        templateUrl: 'js/components/registration/terms/terms.html',
        controller: termsController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();