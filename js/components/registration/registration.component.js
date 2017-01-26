(function () {
    'use strict';

    function registrationController(api, $state, auth, core, localStorageService) {

        // if (auth.authentication.isLogged) {
        //     $state.go('home');
        //     return;
        // }

        var createNewAccountConfirmPasswd = localStorageService.get('confirmPopupPasswd');
        if (!createNewAccountConfirmPasswd) {
            $state.go('login');
        }

        var that = this;

        that.loginForm = {};

        that.posList = [];

        that.model = {
            user_id: auth.authentication.isLogged ? auth.authentication.user.id : null,
            subscription_type_id: core.data.new_restaurant ? core.data.new_restaurant.subscription_type_id : null,
            pos_id: core.data.new_restaurant ? core.data.new_restaurant.pos_id : null,
            user: {
                first_name: core.data.new_restaurant ? core.data.new_restaurant.user.first_name : null,
                last_name: core.data.new_restaurant ? core.data.new_restaurant.user.last_name : null,
                email: core.data.new_restaurant ? core.data.new_restaurant.user.email : null,
                phone_number: core.data.new_restaurant ? core.data.new_restaurant.user.phone_number : null,
                password: core.data.new_restaurant ? core.data.new_restaurant.user.password : null,
                password_confirm: core.data.new_restaurant ? core.data.new_restaurant.user.password_confirm : null
            },
            restaurant: {
                restaurant_name: core.data.new_restaurant ? core.data.new_restaurant.restaurant.restaurant_name : null,
                entity_type_id: core.data.new_restaurant ? core.data.new_restaurant.restaurant.entity_type_id : null,
                street_address: core.data.new_restaurant ? core.data.new_restaurant.restaurant.street_address : null,
                city: core.data.new_restaurant ? core.data.new_restaurant.restaurant.city : null,
                state: core.data.new_restaurant ? core.data.new_restaurant.restaurant.state : null,
                zip: core.data.new_restaurant ? core.data.new_restaurant.restaurant.zip : null,
                phone_number: core.data.new_restaurant ? core.data.new_restaurant.restaurant.phone_number : null
            },
            payment: {
                card_number: core.data.new_restaurant ? core.data.new_restaurant.payment.card_number : null,
                expiration_month: core.data.new_restaurant ? core.data.new_restaurant.payment.expiration_month : null,
                expiration_year: core.data.new_restaurant ? core.data.new_restaurant.payment.expiration_year : null,
                coupon_code: core.data.new_restaurant ? core.data.new_restaurant.payment.coupon_code : null,
                first_name: core.data.new_restaurant ? core.data.new_restaurant.payment.first_name : null,
                last_name: core.data.new_restaurant ? core.data.new_restaurant.payment.last_name : null,
                zip: core.data.new_restaurant ? core.data.new_restaurant.payment.zip : null,
                billing_address: core.data.new_restaurant ? core.data.new_restaurant.payment.billing_address : null,
                cv_code: core.data.new_restaurant ? core.data.new_restaurant.payment.cv_code : null
            }
        };

        that.selectPos = function (pos) {
            if (pos.id) {
                that.model.pos_id = pos.id;
                core.data.new_restaurant = that.model;
                $state.go('subscription');
            }
        };

        that.$onInit = function () {
            api.get_pos_list().then(function (res) {
                that.posList = res.data.data.list
            })
        };

    }

    registrationController.$inject = ['api', '$state', 'auth', 'core', 'localStorageService'];

    angular.module('inspinia').component('registrationComponent', {
        templateUrl: 'js/components/registration/registration.html',
        controller: registrationController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();