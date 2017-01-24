(function () {
    'use strict';

    function registrationController(api, $state, auth) {

        if (auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;

        that.loginForm = {};

        that.posList = [];

        that.model = {
            price_id: null,
            pos_id: null,
            user: {
                first_name: null,
                last_name: null,
                email: null,
                phone_number: null,
                password: null
            },
            restaurant: {
                restaurant_name: null,
                entity_type_id: null,
                street_address: null,
                city: null,
                state: null,
                zip: null,
                phone_number: null
            },
            payment: {
                card_number: null,
                expiration_month: null,
                expiration_year: null,
                coupon_code: null,
                first_name: null,
                last_name: null,
                zip: null,
                billing_address: null,
                cv_code: null
            }
        };

        that.selectPos = function (pos) {
            that.model.price_id = pos.id;
        };

        that.$onInit = function () {
            api.get_pos_list().then(function (res) {
                that.posList = res.data.data.list
            })
        };

    }

    registrationController.$inject = ['api', '$state', 'auth'];

    angular.module('inspinia').component('registrationComponent', {
        templateUrl: 'js/components/registration/registration.html',
        controller: registrationController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();