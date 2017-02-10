(function () {
    'use strict';

    function addUniqueItemsController($uibModalInstance, alertService, api) {


        var that = this;

        that.form = {};


        that.api = api;

        that.model = {
            uniqueItem: []
        };





        that.submit = function (form) {


            if (!form.$valid) {
                return
            }


        };

        that.addUniqueItem = function () {

                that.model.uniqueItem.push({

                })

        };

        that.removeUniqueItem = function ($index) {
            that.model.uniqueItem.splice($index, 1);

        };


        that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    addUniqueItemsController.$inject = ['$uibModalInstance', 'alertService', 'api'];
    angular
        .module('inspinia')
        .controller('addUniqueItemsController', addUniqueItemsController)

})();