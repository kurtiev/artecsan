(function () {

    'use strict';

    function headerController(core, auth) {

        var that = this;
        that.isAuth = auth.authentication.isLogged;

        that.$onInit = function () {
            core.getSettings().then(function (res) {
                that.settings = res
            });
        }
    }

    headerController.$inject = ['core', 'auth'];

    angular.module('inspinia').component('headerComponent', {
        templateUrl: 'js/components/header/header.html',
        controller: headerController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();