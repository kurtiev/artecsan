(function () {

    'use strict';

    function loginController(appConfig, $state, auth, api, alertService, core) {

        if (auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;

        that.loginForm = {};

        that.m = {
            email: null,
            password: null,
            captchaKey: appConfig.googleCaptcha,
            errorMessage: null,
            inRequest: false,
            forgotPass: false
        };

        that.login = function (form) {

            if (!form.$valid) {
                return
            }

            that.m.inRequest = true;
            var m = {username: that.m.email, password: that.m.password};
            auth.login(m).then(function () {
                that.m.inRequest = false;
                $state.go('home');
            }, function () {
                that.m.inRequest = false;
            });
        };

        that.forgotPassword = function (form) {

            if (!form.$valid) {
                return
            }

            that.m.inRequest = true;

            api.reset_password({email: that.m.email}).then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                        alertService.showSuccessText('Successful', 'Confirmation link was sent to your email');
                    }
                } catch (e) {
                    console.log(e)
                }
                that.m.inRequest = false;
            }, function (error) {
                that.m.inRequest = false;
            });
        };

        that.$onInit = function () {
            try {
                core.getSettings().then(function (res) {
                    that.settings = res
                });
            } catch (e) {
                console.log(e)
            }
        }


    }

    loginController.$inject = ['appConfig', '$state', 'auth', 'api', 'alertService', 'core'];

    angular.module('inspinia').component('loginComponent', {
        templateUrl: 'js/components/login/login.html',
        controller: loginController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();