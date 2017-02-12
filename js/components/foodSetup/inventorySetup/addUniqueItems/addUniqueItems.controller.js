(function () {
    'use strict';

    function addUniqueItemsController($uibModalInstance, alertService, api, core, searchParams) {


        var that = this;

        that.form = {};
        that.uniqueItem = [];
        that.searchParams = searchParams;


        core.getRefbooks().then(function (res) {
            that.deliveryMeasure = res.measurement_units_of_delivery;
            that.categories = res.vendor_cat;
            that.sub_categories = res.vendor_sub_cat;
        });


        that.api = api;

        that.model = {};


        that.brand_lookup = function (search_for) {
            return that.api.brand_lookup({search_for: search_for}).then(function (res) {
                return res.data.data.brand.slice(0, 10);
            })

        };


        that.submit = function (form) {


            if (!form.$valid) {
                return
            }

            var id = that.searchParams.vendor_id;

            var m = {
                sku_items: []
            };

            for (var i = 0; that.uniqueItem.length > i; i++) {
                m.sku_items.push({
                    vendor_sku: that.uniqueItem[i].vendor_sku,
                    pack: that.uniqueItem[i].pack,
                    size: that.uniqueItem[i].size,
                    uom_id_of_delivery_unit: that.uniqueItem[i].unit,
                    brand: typeof that.uniqueItem[i].brand == 'object' ? that.uniqueItem[i].brand.brand : that.uniqueItem[i].brand,
                    brand_id: typeof that.uniqueItem[i].brand == 'object' ? that.uniqueItem[i].brand.id : null,
                    item_name: that.uniqueItem[i].item_name,
                    vendor_cat_id: that.uniqueItem[i].vendor_cat_id,
                    vendor_sub_cat_id: that.uniqueItem[i].vendor_sub_cat_id,
                    yield: 1,
                    price: that.uniqueItem[i].price,
                    minimum_order_type: that.uniqueItem[i].minimum_order_type,
                    is_active: that.uniqueItem[i].is_active,
                    id: that.uniqueItem[i].id
                })
            }

            that.api.add_update_own_inventory(id, m).then(function (res) {
                if (res.data.data.code === 1000) {
                    alertService.showAlertSave();
                    that.getMyItems();
                }
            });

        };

        that.addUniqueItem = function () {

            that.uniqueItem.push({
                vendor_sku: null,
                pack: null,
                unit: null,
                brand: null,
                item_name: null,
                vendor_cat_id: null,
                vendor_sub_cat_id: null,
                is_active: 1,
                size: null,
                price: null,
                minimum_order_type: null,
                id: null
            })

        };

        that.removeUniqueItem = function ($index) {
            that.uniqueItem.splice($index, 1);
        };

        
        that.getMyItems = function () {
            console.log('that.getMyItems');
            return that.api.brand_lookup({search_for: search_for}).then(function (res) {
                return res.data.data.brand;
            })
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