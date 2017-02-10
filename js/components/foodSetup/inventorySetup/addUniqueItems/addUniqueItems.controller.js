(function () {
    'use strict';

    function addUniqueItemsController($uibModalInstance, alertService, api, core, searchParams) {


        var that = this;

        that.form = {};
        that.uniqueItem = [];
        that.searchParams = searchParams;

console.log(that.searchParams);
        that.api = api;

        that.model = {};


        that.brand_lookup = function (search_for) {
            return that.api.brand_lookup({search_for: search_for}).then(function (res) {
                return res.data.data.brand;
            })

        };




        that.submit = function (form) {



            if (!form.$valid) {
                return
            }




        };

        that.addUniqueItem = function () {

            that.uniqueItem.push({
                vendor_sku: null,
                pack: null,
                sixe: null,
                unit: null,
                brand: null,
                item_name: null,
                vendor_cat_id: null,
                vendor_sub_cat_id: null,
                price: null,
                minimum_order_type: null
            })

        };

        that.removeUniqueItem = function ($index) {
            that.uniqueItem.splice($index, 1);

        };


        that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    addUniqueItemsController.$inject = ['$uibModalInstance', 'alertService', 'api', 'core', 'searchParams'];
    angular
        .module('inspinia')
        .controller('addUniqueItemsController', addUniqueItemsController)

})();