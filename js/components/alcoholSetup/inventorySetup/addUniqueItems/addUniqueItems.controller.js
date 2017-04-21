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

        that.vendorsName = that.searchParams.vendors_name;
        for (var i = 0; that.vendorsName.length > i; i++) {
            if (that.vendorsName[i].is_selected == true) {
                that.vendorsName = that.vendorsName[i].vendor_name;
            }
        }

        that.searchModel = {
            order_by: 'item_name',
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
            that.refbooks = res;
            that.categories = res.vendor_cat;
            that.sub_categories = res.vendor_sub_cat;
        });


        that.api = api;

        that.model = {};

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
                inventory_type_id: 2,
                sku_items: []
            };

            for (var i = 0; that.uniqueItem.length > i; i++) {

                m.sku_items.push({
                    item_name: that.uniqueItem[i].item_name,
                    tare_type_id: that.uniqueItem[i].tare_type_id,  //tare_type_id, refbooks
                    size: that.uniqueItem[i].size || that.uniqueItem[i].content_weight || 1,
                    content_weight: that.uniqueItem[i].size || that.uniqueItem[i].content_weight || 1,
                    full_weight: that.uniqueItem[i].full_weight,
                    tare_weight: that.uniqueItem[i].tare_weight,
                    manufacturer: that.uniqueItem[i].manufacturer,
                    vendor_sku: that.uniqueItem[i].vendor_sku,
                    case_qty: that.uniqueItem[i].case_qty,
                    pack: that.uniqueItem[i].pack,
                    price: that.uniqueItem[i].pack_cost,
                    vendor_cat_id: that.uniqueItem[i].vendor_cat_id,
                    uom_id_of_delivery_unit: 5,
                    vendor_sub_cat_id: that.uniqueItem[i].vendor_sub_cat_id,
                    is_active: that.uniqueItem[i].is_active,
                    minimum_order_type: 'Pack',
                    id: that.uniqueItem[i].id
                });


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

        that.getSizes = function (cat_id, sub_cat_id) {

            if (!cat_id && !sub_cat_id) return [];
            var _a = [];

            for (var i = 0; that.refbooks.default_weights.length > i; i++) {

                if (that.refbooks.default_weights[i].vendor_cat_id === cat_id && that.refbooks.default_weights[i].vendor_sub_cat_id === sub_cat_id) {
                    for (var j = 0; that.refbooks.tare_types.length > j; j++) {
                        if (that.refbooks.tare_types[j].tare_type_id === that.refbooks.default_weights[i].tare_type_id) {

                            if (_a.indexOf(that.refbooks.tare_types[j]) === -1) {
                                _a.push(that.refbooks.tare_types[j])
                            }
                        }
                    }
                }
            }

            return _a;
        };

        that.calculate = function ($index) {
            var t = that.uniqueItem[$index].pack || 1;
            var u = that.uniqueItem[$index].pack_cost || 1;
            var s = 1; // todo clarify that.uniqueItem[$index].size
            var c = that.uniqueItem[$index].case_qty || 1;
            that.uniqueItem[$index].case_cost = parseFloat((t * u * s * c).toFixed(2));
        };

        that.setWeights = function ($index, cat_id, sub_cat_id, tare_type_id) {


            for (var i = 0; that.refbooks.default_weights.length > i; i++) {

                if (that.refbooks.default_weights[i].vendor_sub_cat_id === sub_cat_id
                    && that.refbooks.default_weights[i].vendor_cat_id === cat_id
                    && that.refbooks.default_weights[i].tare_type_id === tare_type_id) {

                    var f = that.uniqueItem[$index].vendor_cat_id === 71 ? that.refbooks.default_weights[i].full_weight : that.uniqueItem[$index].full_weight;
                    var c = that.refbooks.default_weights[i].content_weight;

                    that.uniqueItem[$index].tare_weight = (f - c) || 0;
                    that.uniqueItem[$index].content_weight = c;

                }
            }

        };

        that.addUniqueItem = function () {

            that.uniqueItem.push({
                item_name: null,
                size: null,
                full_weight: null,
                content_weight: null,
                tare_weight: null,
                manufacturer: null,
                vendor_sku: null,
                case_qty: 1,
                total_unit_size: null,
                price: null,
                pack_cost: null,
                vendor_cat_id: that.categories.length ? that.categories[0].id : null,
                uom_id_of_delivery_unit: 5,
                vendor_sub_cat_id: that.sub_categories.length ? that.sub_categories[0].id : null,
                is_active: 1,
                minimum_order_type: 'Pack',
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
                inventory_type_id: 2
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
        .controller('alcoholAddUniqueItemsController', addUniqueItemsController)

})();