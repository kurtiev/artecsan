(function () {
    'use strict';

    function restaurantProfileController(api, $state, $timeout, core, utils, restaurant, auth, SweetAlert) {

        var that = this;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.$timeout = $timeout;
        that.restaurant = core.data.new_restaurant;
        that.entities = [];
        that.get_refbooks = [];
        that.utils = utils;

        that.model = {};

        var initModel = function () {
            that.model = {
                restaurant_name: core.data.new_restaurant ? core.data.new_restaurant.restaurant.restaurant_name : null,
                entity_type_id: core.data.new_restaurant ? core.data.new_restaurant.restaurant.entity_type_id : null,
                address: core.data.new_restaurant ? core.data.new_restaurant.restaurant.address : null,
                city: core.data.new_restaurant ? core.data.new_restaurant.restaurant.city : null,
                state: core.data.new_restaurant ? core.data.new_restaurant.restaurant.state : null,
                zip: core.data.new_restaurant ? core.data.new_restaurant.restaurant.zip : null,
                phone_number: core.data.new_restaurant ? core.data.new_restaurant.restaurant.phone_number : null
            };
        };

        if (!core.data.new_restaurant && !$state.params.id) {
            $state.go('registration');
            return;
        }

        that.submit = function (form) {
            if (!form.$valid) {
                return
            }

            if (!core.data.new_restaurant.restaurant.city_geoname_id || !core.data.new_restaurant.restaurant.state_geoname_id) {

                SweetAlert.swal({
                    title: 'Please select City or State from autocomplete menu'
                });
                return
            }

            core.data.new_restaurant.restaurant.restaurant_name = that.model.restaurant_name;
            core.data.new_restaurant.restaurant.entity_type_id = that.model.entity_type_id;
            core.data.new_restaurant.restaurant.address = that.model.address;
            core.data.new_restaurant.restaurant.city = that.model.city;
            core.data.new_restaurant.restaurant.state = that.model.state;
            core.data.new_restaurant.restaurant.zip = that.model.zip;
            core.data.new_restaurant.restaurant.phone_number = that.model.phone_number;

            if ($state.params.id) {
                $state.go('payment', {id: $state.params.id})
            } else {
                $state.go('payment')
            }
        };

        that.back = function () {
            core.data.new_restaurant.restaurant.restaurant_name = that.model.restaurant_name;
            core.data.new_restaurant.restaurant.entity_type_id = that.model.entity_type_id;
            core.data.new_restaurant.restaurant.address = that.model.address;
            core.data.new_restaurant.restaurant.city = that.model.city;
            core.data.new_restaurant.restaurant.state = that.model.state;
            core.data.new_restaurant.restaurant.zip = that.model.zip;
            core.data.new_restaurant.restaurant.phone_number = that.model.phone_number;

            if ($state.params.id) {
                $state.go('subscription', {id: $state.params.id})
            } else {
                $state.go('subscription')
            }
        };

        that.$onInit = function () {
            core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
                // get restaurant for edit, run if we can direct going to this step or just after reloading page
                if ($state.params.id && auth.authentication.isLogged && !core.data.new_restaurant) {
                    restaurant.set_to_edit($state.params.id).then(function () {
                        initModel();
                        that.onZipChanged();
                    })
                } else {
                    initModel();
                    if (core.data.new_restaurant) {
                        that.onZipChanged();
                    }
                }
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

        that.onZipChanged = function () {

            if (that.timer) {
                that.$timeout.cancel(that.timer);
            }

            that.timer = that.$timeout(function () {
                var zip = that.model.zip;

                if (zip) {
                    that.api.locations_lookup({search_for: zip}).then(function (response) {

                            if (response.data.data.locations.length) {
                                that.model.city = response.data.data.locations[0].clear_name;
                                core.data.new_restaurant.restaurant.city_geoname_id = response.data.data.locations[0].geoname_id;
                                core.data.new_restaurant.restaurant.state_geoname_id = response.data.data.locations[0].state_geoname_id;

                                for (var i = 0; that.get_refbooks.country_states.length > i; i++) {
                                    if (response.data.data.locations[0].state_geoname_id === that.get_refbooks.country_states[i].geoname_id) {
                                        that.model.state = that.get_refbooks.country_states[i].state;
                                        that.form.zip.$setValidity('zip', true);
                                        break
                                    }
                                }
                            } else {
                                that.form.zip.$setValidity('zip', false);
                                that.model.city = '';
                                that.model.state = '';
                                core.data.new_restaurant.restaurant.city_geoname_id = null;
                                core.data.new_restaurant.restaurant.state_geoname_id = null;
                            }


                        },
                        function (error) {
                            console.log('error');
                        });
                } else {
                    that.form.zip.$setValidity('zip', false);
                    that.model.city = '';
                    that.model.state = '';
                    core.data.new_restaurant.restaurant.city_geoname_id = null;
                    core.data.new_restaurant.restaurant.state_geoname_id = null;
                }
            }, 300);
        };
    }

    restaurantProfileController.$inject = ['api', '$state', '$timeout', 'core', 'utils', 'restaurant', 'auth', 'SweetAlert'];

    angular.module('inspinia').component('restaurantProfileComponent', {
        templateUrl: 'js/components/registration/restaurantProfile/restaurantProfile.html',
        controller: restaurantProfileController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();