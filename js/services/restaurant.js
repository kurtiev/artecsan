(function () {

    "use strict";

    var restaurant = function (api, auth, $q) {

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


        return {
            data: data,
            set_restaurant: set_restaurant
        };
    };

    restaurant.$inject = ['api', 'auth', '$q'];
    angular.module('inspinia').factory('restaurant', restaurant);

})();