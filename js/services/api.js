(function () {
    'use strict';

    var api = function (appConfig, $http, $injector) {

        var serviceBase = appConfig.apiDomain;

        var serviceFactory = {};

        function getAuthConfig() {
            var config = {};
            config.headers = {};
            // config.headers['Content-Type'] = 'application/x-www-form-urlencoded'; // TODO

            var auth = $injector.get('auth');

            if (!auth.authentication.isLogged) {
                config.headers['Authorization'] = appConfig.apiAuthorization;
            } else {
                config.headers['Authorization'] = 'Bearer ' + auth.authentication.token;
            }

            return config;
        }

        serviceFactory.get_settings = function (model) {
            return $http.post(serviceBase + 'rb/get_public_settings', model, getAuthConfig());
        };

        serviceFactory.auth_login = function (model) {
            return $http.post(serviceBase + 'auth/login', model, getAuthConfig());
        };

        serviceFactory.get_pos_list = function () {
            return $http.get(serviceBase + 'rb/get_pos_list', getAuthConfig());
        };

        serviceFactory.rb_subscriptions = function () {
            return $http.get(serviceBase + 'rb/subscriptions', getAuthConfig());
        };

        serviceFactory.reset_password = function (model) {
            return $http.post(serviceBase + 'users/reset_password', model, getAuthConfig());
        };

        serviceFactory.get_restaurants = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'restaurants',
                headers: {
                    'Authorization': 'Bearer ' + auth.authentication.token
                },
                params: model
            });
        };

        serviceFactory.get_refbooks = function (model) {
            return $http.post(serviceBase + 'rb/get_refbooks', model, getAuthConfig());
        };

        serviceFactory.users_registration = function (model) {
            return $http.post(serviceBase + 'users/registration', model, getAuthConfig());
        };

        serviceFactory.create_restaurant = function (model) {
            return $http.post(serviceBase + 'restaurants', model, getAuthConfig());
        };

        serviceFactory.update_restaurant = function (model, id) {
            return $http.put(serviceBase + 'restaurants/' + id, model, getAuthConfig());
        };

        serviceFactory.get_restaurant = function (id) {
            return $http.get(serviceBase + 'restaurants/' + id, getAuthConfig());
        };

        serviceFactory.users_invite = function (model) {
            return $http.post(serviceBase + 'users/invite', model, getAuthConfig());
        };

        serviceFactory.locations_lookup = function (model) {
            return $http.post(serviceBase + 'rb/locations_lookup', model, getAuthConfig());
        };

        serviceFactory.contact_us = function (model) {
            return $http.post(serviceBase + 'users/contact_us', model, getAuthConfig());
        };

        serviceFactory.get_invite_info = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'users/get_invite_info',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.redeem_invitation = function (model) {
            return $http.post(serviceBase + 'users/redeem_invitation', model, getAuthConfig());
        };

        serviceFactory.change_restaurant_employee_status = function (id, model) {
            return $http.put(serviceBase + 'restaurant/' + id + '/employees', model, getAuthConfig());
        };

        serviceFactory.delete_invite = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'DELETE',
                url: serviceBase + 'users/invite',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.set_active_restaurant = function (model) {
            return $http.post(serviceBase + 'users/set_active_restaurant', model, getAuthConfig());
        };

        serviceFactory.get_vendors = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'vendors',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.get_credit_card_checker = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: appConfig.apiBincodesDomain + 'cc/',
                params: model
            });
        };

        return serviceFactory;
    };

    api.$inject = ['appConfig', '$http', '$injector'];
    angular.module('inspinia').factory('api', api);

})();