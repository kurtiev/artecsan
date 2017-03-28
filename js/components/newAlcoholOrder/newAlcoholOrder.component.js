(function () {

    'use strict';

    function controller($state, auth, api, alertService, core, restaurant, localStorageService, $scope, $rootScope, $interval) {

        if (!auth.authentication.isLogged) {
            $state.go('login');
            return;
        }

        var that = this;

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

    }

    controller.$inject = ['$state', 'auth', 'api', 'alertService', 'core', 'restaurant', 'localStorageService', '$scope', '$rootScope', '$interval'];

    angular.module('inspinia').component('newAlcoholOrderComponent', {
        templateUrl: 'js/components/newAlcoholOrder/newAlcoholOrder.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();