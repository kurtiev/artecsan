(function () {
    'use strict';


    var homeMenuController = function ($scope, $filter) {
        $scope.formatY = function (price) {
            return $filter('currency')(price, '$');
        };

        $scope.formatX = function (v) {
            return 'Month ' + ++v
        };

        $scope.getRandomColor = function () {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        };

        $scope.pieData = [
            {
                column_id: 'Food and Bev',
                column_values: 30
            }, {
                column_id: 'Labor/Admin/Benefits',
                column_values: 35
            }, {
                column_id: 'Rent and Debt Service',
                column_values: 8
            }, {
                column_id: 'Marketing',
                column_values: 5
            }, {
                column_id: 'Utilities',
                column_values: 3
            }, {
                column_id: 'M&R',
                column_values: 2
            }, {
                column_id: 'Paper and Cleaning',
                column_values: 2
            }, {
                column_id: 'Insurance',
                column_values: 2
            }, {
                column_id: 'Smallwares',
                column_values: 2
            }, {
                column_id: 'Miscellaneous',
                column_values: 2
            }
        ];
    };

    homeMenuController.$inject = ['$scope', '$filter'];


    angular
        .module('inspinia')
        .controller('homeMenuController', homeMenuController)


})();