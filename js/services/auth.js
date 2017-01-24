(function () {

    "use strict";

    var authService = function (api, $q, localStorageService, $rootScope, appConfig, $state) {

        var userData = {
            isLogged: false,
            user: null
        };

        $rootScope.userData = userData;

        var _setUser = function (user) {
            userData.isLogged = true;
            userData.user = user;
            appConfig.token = 'Bearer ' + userData.user.access_token;
            $rootScope.userData = userData;
            return userData;
        };

        var clearUserData = function () {
            var userData = {
                isLogged: false,
                user: null
            };
            appConfig.token = null;
            $rootScope.userData = userData;
            // Clear all static data and User info
            localStorageService.clearAll();
        };

        var login = function (model) {
            var deferred = $q.defer();
            api.auth_login(model).then(function (success) {
                if (success.data.data) {
                    if (success.data.data.message === 'OK') {
                        localStorageService.set('adminAuthorizationData', {
                            authenticationInfo: _setUser(success.data.data.user)
                        });
                    }
                    deferred.resolve(success);
                } else {
                    deferred.reject(success);
                }
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        var logOut = function () {
            clearUserData();
            $state.go('login')
        };

        var fillAuthData = function () {

            var authData = localStorageService.get('adminAuthorizationData');
            if (authData) {
                if (authData.authenticationInfo) {
                    _setUser(authData.authenticationInfo.user);
                }
            }

        };

        return {
            login: login,
            logOut: logOut,
            fillAuthData: fillAuthData,
            authentication: userData
        };
    };

    authService.$inject = ['api', '$q', 'localStorageService', '$rootScope', 'appConfig', '$state'];
    angular.module('inspinia').factory('auth', authService);

})();