(function () {
    'use strict';

    function addUniqueItemsController($uibModalInstance, alertService, api, core, searchParams, SweetAlert, $q) {


        var that = this;

        that.form = {};
        that.uniqueItem = [];
        that.searchParams = searchParams;

        var INVENTORIES = []; // const for compare, that model was changed, -- copy from that.uniqueItem

        var checkChanges = function () {
            return _.isEqual(INVENTORIES, JSON.parse(angular.toJson(that.uniqueItem)))
        };

        that.vandorsNmae = that.searchParams.vendors_name;
        for (var i = 0; that.vandorsNmae.length > i; i++) {
            if (that.vandorsNmae[i].is_selected == true) {
                that.vandorNmae = that.vandorsNmae[i].vendor_name;
            }
        }

        that.searchModel = {
            order_by: 'vendor_sku', // "upc", "vendor_sku", "item_name", "item_desc", 'pack', 'size','unit_of_delivery', 'brand', 'category', 'sub_category', 'case_cost', 'minimum_order_type'
            order_way: "DESC",  //ASC/DESC
            paginationOffset: 0, // 0 by default
            paginationCount: 9999,
            inRequest: false,
            paginationTotal: 0,

            city: null,
            item_name: null,
            sub_category: null,
            vendor_sku: null,
            filter: 'own',
            category: null
        };

        that.categories = [];
        that.sub_categories = [];


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


        that.submit = function (form, get_list) {

            var deferred = $q.defer();

            if (!form.$valid) {
                deferred.reject();
                return deferred.promise;
            }

            if (!that.uniqueItem.length) {
                alertService.showError('Please, add at least one item');
                deferred.reject();
                return deferred.promise;
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
                    uom_id_of_delivery_unit: that.uniqueItem[i].uom_id_of_delivery_unit,
                    brand: typeof that.uniqueItem[i].brand == 'object' ? that.uniqueItem[i].brand.brand : that.uniqueItem[i].brand,
                    brand_id: typeof that.uniqueItem[i].brand == 'object' ? that.uniqueItem[i].brand.id : null,
                    item_name: that.uniqueItem[i].item_name,
                    vendor_cat_id: that.uniqueItem[i].vendor_cat_id,
                    vendor_sub_cat_id: that.uniqueItem[i].vendor_sub_cat_id,
                    yield: 1,
                    price: that.uniqueItem[i].case_cost,
                    minimum_order_type: that.uniqueItem[i].minimum_order_type,
                    is_active: that.uniqueItem[i].is_active,
                    id: that.uniqueItem[i].id
                })
            }

            that.api.add_update_own_inventory(id, m).then(function (res) {
                if (res.data.data.code === 1000) {
                    alertService.showAlertSave();
                    deferred.resolve();
                    if (get_list) {
                        _search();
                    }
                }
            });

            return deferred.promise;

        };

        that.addUniqueItem = function () {

            that.uniqueItem.push({
                vendor_sku: null,
                pack: null,
                uom_id_of_delivery_unit: null,
                brand: null,
                item_name: null,
                vendor_cat_id: that.categories.length ? that.categories[0].id : null,
                vendor_sub_cat_id: that.sub_categories.length ? that.sub_categories[0].id : null,
                is_active: 1,
                size: null,
                case_cost: null,
                minimum_order_type: 'Case',
                id: null
            })
        };

        that.removeUniqueItem = function ($index, item) {
            if (!that.uniqueItem[$index].id) {
                that.uniqueItem.splice($index, 1);
            } else {

                var vendor_id = that.searchParams.vendor_id;

                that.api.delete_my_sku(vendor_id, that.uniqueItem[$index].id).then(function (res) {
                        if (res.data.data.code === 1000) {
                            for (var i = 0; that.uniqueItem.length > i; i++) {
                                if (item.id === that.uniqueItem[i].id) {
                                    that.uniqueItem.splice(i, 1);
                                    break;
                                }
                            }

                        }
                    }
                    // that.getMyItems
                )
            }
        };


        var _search = function (keyword) {

            that.searchModel.inRequest = true;

            var m = {
                order_by: that.searchModel.order_by,
                order_way: that.searchModel.order_way,
                paginationOffset: that.searchModel.paginationOffset,
                paginationCount: that.searchModel.paginationCount,

                filter: that.searchModel.filter,
                inventory_type_id: 1
            };

            for (var i in m) {
                if (!m[i]) {
                    delete  m[i]
                }
            }

            if (keyword) {
                if (that.searchModel.order_by == keyword) {
                    that.searchModel.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC';
                    m.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC'
                } else {
                    that.searchModel.order_by = keyword;
                    m.order_by = keyword;
                }
            }

            var vendorId = that.searchParams.vendor_id;

            that.api.get_inventory_by_vendor(m, vendorId).then(function (res) {
                try {
                    that.uniqueItem = res.data.data.sku;
                    INVENTORIES = angular.copy(that.uniqueItem);
                    that.searchModel.inRequest = false;
                } catch (e) {
                    console.log(e);
                    that.searchModel.inRequest = false;
                }
            }, function () {
                that.searchModel.inRequest = false;
            });
        };

        that.getMyItems = function (keyword) {

            if (!checkChanges()) {
                SweetAlert.swal({
                        title: "Save changes?",
                        text: "Changes not been saved yet!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#337ab7",
                        confirmButtonText: "Save"
                    },
                    function (res) {
                        if (res) {
                            that.form.$setSubmitted();
                            that.submit(that.form).then(function () {
                                _search(keyword)
                            })
                        } else {
                            _search(keyword)
                        }
                    });
            } else {
                _search(keyword)
            }
        };

        that.getMyItems();


        that.cancel = function () {
            if (!checkChanges()) {
                SweetAlert.swal({
                        title: "Save changes?",
                        text: "Changes not been saved yet!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#337ab7",
                        confirmButtonText: "Save"
                    },
                    function (res) {
                        if (res) {
                            that.form.$setSubmitted();
                            that.submit(that.form).then(function () {
                                $uibModalInstance.dismiss('cancel');
                            })
                        } else {
                            $uibModalInstance.dismiss('cancel');
                        }
                    });
            } else {
                $uibModalInstance.dismiss('cancel');
            }
        };
    }

    addUniqueItemsController.$inject = ['$uibModalInstance', 'alertService', 'api', 'core', 'searchParams', 'SweetAlert', '$q'];
    angular
        .module('inspinia')
        .controller('addUniqueItemsController', addUniqueItemsController)

})();