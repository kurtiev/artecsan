(function () {

    "use strict";

    var common = function ($uibModal, $interval) {

        var that = {};

        that.beginFoodInventoryCount = function () {
            return $uibModal.open({
                templateUrl: 'views/modal/begin_food_inventory_count.html',
                controller: function ($uibModalInstance, $scope) {
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                size: 'lg',
                controllerAs: '$ctr'
            })
        };

        that.beginAlcoholInventoryCount = function () {
            return $uibModal.open({
                templateUrl: 'views/modal/begin_alcohol_inventory_count.html',
                controller: function ($uibModalInstance, $scope) {
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                size: 'lg',
                controllerAs: '$ctr'
            })
        };

        return that;
    };

    common.$inject = ['$uibModal', '$interval'];
    angular.module('inspinia').factory('common', common);

})();