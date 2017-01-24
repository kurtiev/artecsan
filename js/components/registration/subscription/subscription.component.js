(function () {
    'use strict';

    function registrationController(api, $state, auth) {

        if (auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;

        that.loginForm = {};

        that.m = {

        };

        that.$onInit = function () {
            api.rb_subscriptions().then(function (res) {
                console.log(res)
            })
        };

    }

    registrationController.$inject = ['api', '$state', 'auth'];

    angular.module('inspinia').component('registrationComponent', {
        require: {parentCtrl: '^registrationComponent'},
        templateUrl: 'js/components/registration/registration.html',
        controller: registrationController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();