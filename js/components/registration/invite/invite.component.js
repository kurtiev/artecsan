(function () {
    'use strict';

    function inviteController(api, $state, auth, core) {

        if (!auth.authentication.isLogged) {
            $state.go('registration');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.restaurant = core.data.new_restaurant;
        that.entities = [];
        that.get_refbooks = [];

        that.users = [];

        that.submit = function (form) {
            $state.go('terms');
        };

        that.$onInit = function () {
            core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
            });
        }


    }

    inviteController.$inject = ['api', '$state', 'auth', 'core'];

    angular.module('inspinia').component('inviteComponent', {
        templateUrl: 'js/components/registration/invite/invite.html',
        controller: inviteController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();