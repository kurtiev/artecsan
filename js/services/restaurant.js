(function () {

    "use strict";

    var restaurant = function (api, auth, $q, $injector) {

        var data = {
            info: null
        };

        var set_restaurant = function (id) {
            var deferred = $q.defer();
            if (data.info) {
                deferred.resolve(data.info);
            } else {
                api.get_restaurant(id).then(function (res) {
                    data.info = res.data.data.restaurants_list[0];
                    deferred.resolve(data.info);
                })
            }

            return deferred.promise;
        };


        var set_to_edit = function (id) {

            var deferred = $q.defer();

            var core = $injector.get('core');

            api.get_restaurant(id).then(function (res) {

                var restaurant_to_edit = res.data.data.restaurants_list[0];

                if (restaurant_to_edit) {
                    core.data.new_restaurant = {
                        user_id: auth.authentication.user.id,
                        subscription_type_id: restaurant_to_edit.subscription_type_id,
                        pos_id: restaurant_to_edit.pos_id,
                        user: {
                            first_name: null,
                            last_name: null,
                            email: null,
                            phone_number: null,
                            password: null,
                            password_confirm: null
                        },
                        restaurant: {
                            restaurant_name: restaurant_to_edit.restaurant_name,
                            entity_type_id: restaurant_to_edit.entity_type_id,
                            address: restaurant_to_edit.address,
                            city: null,
                            state: null,
                            zip: restaurant_to_edit.zip,
                            city_geoname_id: restaurant_to_edit.city_geoname_id,
                            state_geoname_id: restaurant_to_edit.state_geoname_id,
                            phone_number: restaurant_to_edit.phone_number
                        },
                        payment: {
                            // TODO fake data need while server api can't give us real data, delete later
                            card_number: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.card_number : '12345678912345',
                            expiration_month: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.expiration_month : 12,
                            expiration_year: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.expiration_year : 19,
                            coupon_code: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.coupon_code : '12345',
                            first_name: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.first_name : 'first name',
                            last_name: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.last_name : 'last name',
                            zip: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.zip : 10001,
                            billing_address: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.billing_address : 'billing address',
                            cv_code: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.cv_code : 405
                        }
                    };

                    deferred.resolve(data.info);
                } else {
                    deferred.reject(data.info);
                }
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };


        return {
            data: data,
            set_to_edit: set_to_edit,
            set_restaurant: set_restaurant
        };
    };

    restaurant.$inject = ['api', 'auth', '$q', '$injector'];
    angular.module('inspinia').factory('restaurant', restaurant);

})();