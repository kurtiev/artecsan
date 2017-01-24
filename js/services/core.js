(function () {

    "use strict";

    var core = function (api, auth, $q) {


        var data = {
            settings: null,
            refbooks: null
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

        var init = function () {
            // get_settings()
        };


        return {
            data: data,
            getSettings: get_settings,
            init: init
        };
    };

    core.$inject = ['api', 'auth', '$q'];
    angular.module('inspinia').factory('core', core);

})();