(function () {
    'use strict';

    function restaurantProfileController(api, $state, auth, core) {

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
            restaurant_name: core.data.new_restaurant ? core.data.new_restaurant.restaurant.restaurant_name : null,
            entity_type_id: core.data.new_restaurant ? core.data.new_restaurant.restaurant.entity_type_id : null,
            street_address: core.data.new_restaurant ? core.data.new_restaurant.restaurant.street_address : null,
            city: core.data.new_restaurant ? core.data.new_restaurant.restaurant.city : null,
            state: core.data.new_restaurant ? core.data.new_restaurant.restaurant.state : null,
            zip: core.data.new_restaurant ? core.data.new_restaurant.restaurant.zip : null,
            phone_number: core.data.new_restaurant ? core.data.new_restaurant.restaurant.phone_number : null
        };

        that.submit = function (form) {
            if (!form.$valid) {
                return
            }

            if (!core.data.new_restaurant.restaurant.city_geoname_id || !core.data.new_restaurant.restaurant.state_geoname_id) {
                alert('Please select City or State from dropdown menu');
                return
            }

            core.data.new_restaurant.restaurant.restaurant_name = that.model.restaurant_name;
            core.data.new_restaurant.restaurant.entity_type_id = that.model.entity_type_id;
            core.data.new_restaurant.restaurant.street_address = that.model.street_address;
            core.data.new_restaurant.restaurant.city = that.model.city;
            core.data.new_restaurant.restaurant.state = that.model.state;
            core.data.new_restaurant.restaurant.zip = that.model.zip;
            core.data.new_restaurant.restaurant.phone_number = that.model.phone_number;

            $state.go('payment');
        };

        that.back = function () {
            core.data.new_restaurant.restaurant.restaurant_name = that.model.restaurant_name;
            core.data.new_restaurant.restaurant.entity_type_id = that.model.entity_type_id;
            core.data.new_restaurant.restaurant.street_address = that.model.street_address;
            core.data.new_restaurant.restaurant.city = that.model.city;
            core.data.new_restaurant.restaurant.state = that.model.state;
            core.data.new_restaurant.restaurant.zip = that.model.zip;
            core.data.new_restaurant.restaurant.phone_number = that.model.phone_number;

            $state.go('subscription');
        };

        that.$onInit = function () {
            core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
            });
        };

        that.get_location = function (val, type) {
            if (val.length < 3) return;
            return that.api.locations_lookup({search_for: val}).then(function (response) {
                return response.data.data.locations.filter(function (currentValue, index) {
                    return currentValue.type_id === parseInt(type)
                })
            });
        };

        that.selectCity = function (item) {
            core.data.new_restaurant.restaurant.city_geoname_id = item.geoname_id
        };

        that.selectState = function (item) {
            core.data.new_restaurant.restaurant.state_geoname_id = item.geoname_id
        };


    }

    restaurantProfileController.$inject = ['api', '$state', 'auth', 'core'];

    angular.module('inspinia').component('restaurantProfileComponent', {
        templateUrl: 'js/components/registration/restaurantProfile/restaurantProfile.html',
        controller: restaurantProfileController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();