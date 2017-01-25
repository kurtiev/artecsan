(function () {

    'use strict';

    function headerController(core, auth, $state) {

        var that = this;
        that.isAuth = auth.authentication.isLogged;

        that.$onInit = function () {
            core.getSettings().then(function (res) {
                that.settings = res
            });
        };

        that.logout = function () {
            auth.logOut();
            $state.go('login')
        }
    }

    headerController.$inject = ['core', 'auth', '$state'];

    angular.module('inspinia').component('headerComponent', {
        templateUrl: 'js/components/header/header.html',
        controller: headerController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();