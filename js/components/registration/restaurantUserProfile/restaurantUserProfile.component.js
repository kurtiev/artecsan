(function () {
    'use strict';

    function restaurantUserProfileController(api, $state, auth, core, localStorageService) {

        if (!core.data.new_restaurant) {
            $state.go('registration');
            return;
        }

        if (auth.authentication.isLogged) {
            $state.go('registration');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.restaurant = core.data.new_restaurant;
        that.inRequest = false;

        that.model = {
            first_name: that.restaurant.user.first_name,
            last_name: that.restaurant.user.last_name,
            email: that.restaurant.user.email,
            phone_number: that.restaurant.user.phone_number,
            password: that.restaurant.user.password,
            password_confirm: null
        };

        that.submit = function (form) {

            if (!form.$valid) {
                return
            }

            that.inRequest = true;

            var user_model = {
                "email": that.model.email,
                "password": that.model.password,
                "platform": "WEB",
                "first_name": that.model.first_name,
                "last_name": that.model.last_name,
                "phone_number": that.model.phone_number
            };

            that.api.users_registration(user_model).then(function (res) {
                try {
                    if (res.data.data.user) {

                        localStorageService.set('adminAuthorizationData', {
                            authenticationInfo: auth.setUser(res.data.data.user)
                        });
                        core.data.new_restaurant.user_id = res.data.data.user.id;
                        core.data.new_restaurant.user.first_name = that.model.first_name;
                        core.data.new_restaurant.user.last_name = that.model.last_name;
                        core.data.new_restaurant.user.email = that.model.email;
                        core.data.new_restaurant.user.phone_number = that.model.phone_number;
                        core.data.new_restaurant.user.password = that.model.password;
                        core.data.new_restaurant.user.password_confirm = that.model.password_confirm;

                        $state.go('restaurantProfile');
                    }
                    that.inRequest = false;
                } catch (e) {
                    that.inRequest = false;
                    console.log(e);
                    $state.go('login');
                }
            }, function (error) {
                that.inRequest = false;
                $state.go('login');
            });
        };

        that.back = function () {
            core.data.new_restaurant.user.first_name = that.model.first_name;
            core.data.new_restaurant.user.last_name = that.model.last_name;
            core.data.new_restaurant.user.email = that.model.email;
            core.data.new_restaurant.user.phone_number = that.model.phone_number;
            core.data.new_restaurant.user.password = that.model.password;
            core.data.new_restaurant.user.password_confirm = that.model.password_confirm;
            $state.go('subscription');
        };


    }

    restaurantUserProfileController.$inject = ['api', '$state', 'auth', 'core', 'localStorageService'];

    angular.module('inspinia').component('restaurantUserProfileComponent', {
        templateUrl: 'js/components/registration/restaurantUserProfile/restaurantUserProfile.html',
        controller: restaurantUserProfileController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();