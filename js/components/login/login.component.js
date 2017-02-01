(function () {

    'use strict';

    function loginController(appConfig, $state, auth, api, alertService, core, $uibModal) {

        if (auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;

        that.loginForm = {};
        that.popupForm = {};

        that.m = {
            email: null,
            password: null,
            captchaKey: appConfig.googleCaptcha,
            errorMessage: null,
            inRequest: false,
            forgotPass: false,
            popup_passwd: null
        };

        that.createNewAccountPopup = function (self) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modal/create_new_account.html',
                controller: function ($uibModalInstance, localStorageService) {
                    this.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                    this.confirmPopupPasswd = function (form, passwd) {
                        if (!form.$valid) {
                            return
                        }
                        if (passwd == 'ARTECSAN') {
                            localStorageService.set('confirmPopupPasswd', {
                                passwd: passwd
                            });
                            $state.go('registration');
                            this.close();
                        } else {
                            alertService.showError('User password are invalid');
                        }
                    };
                },
                windowClass: "animated fadeIn",
                controllerAs: '$ctr',
                size: 'sm',
                resolve: {
                    user: function () {
                        return null;
                    }
                }
            });

            modalInstance.result.then(function (result) {
                self.selected = result;
            }, function (reason) {

            });
        };




        that.login = function (form) {

            if (!form.$valid) {
                return
            }

            that.m.inRequest = true;
            var m = {username: that.m.email, password: that.m.password};
            auth.login(m).then(function (res) {
                that.m.inRequest = false;
                $state.go('home');
            }, function (error) {
                that.m.errorMessage = true;
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

    loginController.$inject = ['appConfig', '$state', 'auth', 'api', 'alertService', 'core', '$uibModal'];

    angular.module('inspinia').component('loginComponent', {
        templateUrl: 'js/components/login/login.html',
        controller: loginController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();