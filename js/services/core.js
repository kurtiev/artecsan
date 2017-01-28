(function () {

    "use strict";

    var core = function (api, auth, $q, restaurant, localStorageService) {


        var data = {
            settings: null,
            refbooks: null,
            new_restaurant: null // can contain data for editable restaurant
        };


        function get_settings() {
            var deferred = $q.defer();
            if (data.settings) {
                deferred.resolve(data.settings);
            } else {
                var keys = {keys: ["email_body_template", "email_invite_on_submission"]};
                api.get_settings(keys).then(function (res) {
                    data.settings = res.data.data.settings;
                    deferred.resolve(data.settings);
                })
            }
            return deferred.promise;
        }

        function get_refbooks() {
            var deferred = $q.defer();
            if (data.refbooks) {
                deferred.resolve(data.refbooks);
            } else {

                var keys = {
                    refbooks: [
                        'country_states',
                        // "platforms",
                        "user_types",
                        // "sex",
                        "entity_types",
                        // "countries",
                        "content_types",
                        // "city",
                        // "city_zips",
                        "invite_status"
                    ]
                };

                api.get_refbooks(keys).then(function (res) {
                    data.refbooks = res.data.data.refbooks;
                    deferred.resolve(data.refbooks);
                })
            }
            return deferred.promise;
        }

        var init = function () {
            var restaurantID = localStorageService.get('restaurant_id');

            if (restaurantID) {
                restaurant.set_restaurant(restaurantID.restaurant_id);
            }

        };


        return {
            data: data,
            getSettings: get_settings,
            getRefbooks: get_refbooks,
            init: init
        };
    };

    core.$inject = ['api', 'auth', '$q', 'restaurant', 'localStorageService'];
    angular.module('inspinia').factory('core', core);

})();