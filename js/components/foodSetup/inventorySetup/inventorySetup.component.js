(function () {
    'use strict';

    function inventorySetupController(api, $state, auth, localStorageService, SweetAlert, $rootScope, restaurant, $uibModal) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.auth = auth;


        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }


        that.inventoryList = [];
        that.vendors = [];
        that.inventoryListSelected = [];
        that.currentVendor = null;
        that.searchModel = {
            order_by: 'vendor_sku', // id, name, city, date, zip
            order_way: "DESC",  //ASC/DESC
            paginationOffset: 0, // 0 by default
            paginationCount: 25, //25 by default,
            inRequest: false,
            paginationTotal: 0,

            city: null,
            item_name: null,
            sub_category: null,
            vendor_sku: null,
            filter: 'any',
            category: null
        };

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

        var getInventoriesByVendor = function () {
            that.api.get_active_inventory_by_vendor({
                vendor_id: that.currentVendor.id,
                inventory_type_id: 1
            }, that.restaurant_id.restaurant_id).then(function (res) {
                that.inventoryListSelected = res.data.data.sku
            });
        };

        that.search = function (keyword) {

            that.searchModel.inRequest = true;

            var m = {
                order_by: that.searchModel.order_by,
                order_way: that.searchModel.order_way,
                paginationOffset: that.searchModel.paginationOffset,
                paginationCount: that.searchModel.paginationCount,

                city: that.searchModel.city,
                item_name: that.searchModel.item_name,
                sub_category: that.searchModel.sub_category,
                vendor_sku: that.searchModel.vendor_sku,
                filter: that.searchModel.filter,
                category: that.searchModel.category,
                inventory_type_id: 1
            };

            for (var i in m) {
                if (!m[i]) {
                    delete  m[i]
                }
            }

            if (keyword) {
                m.paginationOffset = 0;
                if (that.searchModel.order_by == keyword) {
                    that.searchModel.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC';
                    m.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC'
                } else {
                    that.searchModel.order_by = keyword;
                    m.order_by = keyword;
                }
            }
            if (m.paginationOffset > 0 && !keyword) {
                m.paginationOffset = (m.paginationOffset - 1) * m.paginationCount;
            }


            api.get_inventory_by_vendor(m, that.currentVendor.id).then(function (res) {
                try {
                    that.inventoryList = res.data.data.sku;
                    that.searchModel.paginationTotal = res.data.data.total;
                } catch (e) {
                    console.log(e);
                }
                that.searchModel.inRequest = false;
            }, function () {
                that.searchModel.inRequest = false;
            });

            getInventoriesByVendor()
        };

        that.selectVendor = function (vendor) {

            that.vendors.forEach(function (val, key) {
                if (vendor.id == val.id) {
                    val.is_selected = true
                } else {
                    val.is_selected = false
                }
            });

            that.currentVendor = vendor;

            that.search();


        };


        var getChosenVendors = function () {

            api.get_chosen_vendors(that.restaurant_id.restaurant_id).then(function (res) {
                try {
                    that.vendors = res.data.data.vendors;
                    if (!that.vendors.length) {
                        $state.go('foodSetup.vendor');
                        return
                    }
                    that.vendors[0].is_selected = true;
                    that.vendors[0].is_first = true;
                    that.vendors[that.vendors.length - 1].is_last = true;
                    that.currentVendor = that.vendors[0];
                    that.search();
                } catch (e) {
                    console.log(e);
                }
            })
        };


        that.addInventory = function (inventory) {

            var id = that.restaurant_id.restaurant_id;

            var m = {
                vendor_id: that.currentVendor.id,
                sku_id: inventory.id,
                is_active: inventory.is_used,
                inventory_type_id: 1
            };

            that.api.add_inventory(id, m).then(function () {
                getInventoriesByVendor();
                that.search();

            });

        };

        that.deleteInventory = function (inventory) {

            if (inventory.is_used_by_receipts == 1) {
                SweetAlert.swal({
                    title: '',
                    text: 'You can not remove the inventory item, if he has any elements with historical data, or if the item is used in any recipe. Instead, you can disable inventory item, but first remove it from recipes in which it is used.',
                    type: "warning",
                    confirmButtonColor: "#DD6B55"
                });
                return;
            }

            var id = that.restaurant_id.restaurant_id;

            var m = {
                vendor_id: that.currentVendor.id,
                sku_id: inventory.id,
                is_active: 0,
                inventory_type_id: 1
            };

            that.api.add_inventory(id, m).then(function () {
                getInventoriesByVendor();
                that.search();

            });

        };

        that.addUniqueItems = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'js/components/foodSetup/inventorySetup/addUniqueItems/addUniqueItems.html',
                controller: 'addUniqueItemsController',
                windowClass: "animated fadeIn modal-lgg",
                controllerAs: '$ctr',
                size: 'lg2x',
                resolve: {
                    searchParams: {
                        vendor_id: that.currentVendor.id,
                        restaurant_id: that.restaurant_id.restaurant_id,
                        vendors_name: that.vendors
                    }
                }
            });

            modalInstance.result.then(function (result) {
                that.search()
            }, function (reason) {
                that.search()
            });
        };


        that.back = function () {
            if (that.currentVendor.is_first) {
                $state.go('foodSetup.vendor');
            } else {
                var prevVendor;

                for (var i = 0; that.vendors.length > i; i++) {
                    if (that.vendors[i].is_selected) {
                        prevVendor = that.vendors[i - 1]
                    }
                }

                that.selectVendor(prevVendor);
            }
        };

        that.next = function () {

            if (that.currentVendor.is_last) {
                $state.go('foodSetup.recipe');
            } else {
                var nextVendor;

                for (var i = 0; that.vendors.length > i; i++) {
                    if (that.vendors[i].is_selected) {
                        nextVendor = that.vendors[i + 1]
                    }
                }

                that.selectVendor(nextVendor);
            }

            // SweetAlert.swal({
            //     title: 'At first select inventory',
            //     showConfirmButton: false,
            //     type: "error",
            //     timer: 2000
            // });
        };

        that.$onInit = function () {
            getChosenVendors()
        };

    }

    inventorySetupController.$inject = ['api', '$state', 'auth', 'localStorageService', 'SweetAlert', '$rootScope', 'restaurant', '$uibModal'];

    angular.module('inspinia').component('inventorySetupComponent', {
        templateUrl: 'js/components/foodSetup/inventorySetup/inventorySetup.html',
        controller: inventorySetupController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();