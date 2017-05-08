(function () {

    'use strict';

    function controller($state, auth, api, core, restaurant, localStorageService, $rootScope, alertService) {

        if (!auth.authentication.isLogged) {
            $state.go('login');
            return;
        }

        if ($state.params.id) {
            if (!parseInt($state.params.id)) {
                $state.go('home');
                return
            }
        }

        var that = this;
        that.api = api;
        that.$state = $state;
        that.core = core;
        that.isFood = $state.includes('food.newFoodOrder') || $state.includes('food.editFoodOrder');
        that.isEdit = !!$state.params.id;
        that.vendors = [];
        that.inventories = [];
        that.refbooks = {};
        that.form = {};

        that.inventory_type_id = that.isFood ? '1' : '2';

        that.orderModel = {
            totalItems: 0,
            totalCost: 0,
            inventory_type_id: that.inventory_type_id,
            items: []
        };

        that.order_types = {
            '1': ['Case', 'Pack', 'Each'],
            '2': ['Case', 'Each']
        };

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }


        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

        if (that.isEdit) {
            that.api.get_order($state.params.id, {inventory_type_id: that.inventory_type_id}).then(function (res) {

                var order = res.data.data.order;

                if (_.isEmpty(order)) {
                    window.history.go(-1);
                    return
                }

                if (order) {

                    angular.forEach(order.items, function (v, k) {
                        that.orderModel.items.push({
                            id: v.id,
                            vendor_sku_id: v.vendor_sku_id,
                            vendor_id: v.vendor_id,
                            amount: v.amount,
                            order_type: v.order_type,
                            item_cost: v.item_cost,
                            total_cost: v.total_cost,
                            is_approved: v.is_approved
                        });

                    });


                    that.api.get_active_inventory_by_vendor({
                        vendor_id: order.vendor_id,
                        inventory_type_id: that.inventory_type_id
                    }, that.restaurant_id.restaurant_id).then(function (res) {

                        angular.forEach(that.orderModel.items, function (v, k) {
                            that.inventories[k] = res.data.data.sku;
                            that.calculate(k, v.vendor_sku_id);
                        });

                    });


                } else {
                    var go = that.isFood ? 'food.orderSummary' : 'alcohol.orderSummary';
                    that.$state.go(go);
                }

            }, function () {
                var go = that.isFood ? 'food.orderSummary' : 'alcohol.orderSummary';
                that.$state.go(go);
            });
        }

        that.getOrder = function () {
            if (!that.$state.params.id) return;
            that.api.get_order(that.$state.params.id).then(function (res) {

            });
        };

        that.pushNewItem = function () {
            that.orderModel.items.push({
                vendor_id: null,
                vendor_sku_id: null,
                amount: 0,
                order_type: "Case",
                item_cost: 0,
                total_cost: 0,
                is_approved: 0
            })
        };

        that.delete = function ($index, item) {
            that.orderModel.items.splice($index, 1);
        };

        that.calculate = function ($index, vendor_sku_id) {

            if (!that.inventories[$index]) return;
            if (!_.isArray(that.inventories[$index])) return;

            var totalItemsCost = 0;
            var totalCost = 0;

            //
            angular.forEach(that.orderModel.items, function (v, k) {

                var item;

                for (var i = 0; that.inventories[$index].length > i; i++) {
                    if (that.inventories[$index][i].id === vendor_sku_id) {
                        item = that.inventories[$index][i];
                        break
                    }
                }

                if (!item) return;

                v.item_cost = v.amount ? (v.order_type == 'Case' ? (item.case_cost || 0) : v.order_type == 'Pack' ? (item.pack_cost || 0) : (item.pack_cost || 0)) : 0;
                v.total_cost = (v.item_cost * v.amount) || 0;

                totalItemsCost += v.item_cost;
                totalCost += v.total_cost;

                that.orderModel.totalCost = totalCost;
                that.orderModel.totalItems = totalItemsCost;

            });

        };

        that.addNewOrder = function (form) {

            if (!form.$valid) return;

            var m = {
                inventory_type_id: parseInt(that.inventory_type_id),
                items: []
            };

            for (var i = 0; that.orderModel.items.length > i; i++) {
                m.items.push({
                    id: that.orderModel.items[i].id,
                    vendor_id: that.orderModel.items[i].vendor_id,
                    vendor_sku_id: that.orderModel.items[i].vendor_sku_id,
                    amount: that.orderModel.items[i].amount,
                    order_type: !that.isFood && that.orderModel.items[i].order_type == 'Each' ? 'Pack' : that.orderModel.items[i].order_type,
                    item_cost: that.orderModel.items[i].item_cost,
                    total_cost: that.orderModel.items[i].total_cost,
                    is_approved: that.orderModel.items[i].is_approved
                })
            }

            if (!that.isEdit) {
                that.api.create_order(m).then(function (res) {
                    if (res.data.data.code === 1000) {
                        alertService.showAlertSave();
                        if (that.isFood) {
                            that.$state.go('foodSubCategories');
                        } else {
                            that.$state.go('alcoholSubCategories');
                        }
                    }
                })
            } else {
                that.api.update_order(m, that.$state.params.id).then(function (res) {
                    if (res.data.data.code === 1000) {
                        if (that.isFood) {
                            that.$state.go('foodSubCategories');
                        } else {
                            that.$state.go('alcoholSubCategories');
                        }
                    }
                })
            }
        };

        that.chooseVendor = function ($index, vendor_id) {
            that.api.get_active_inventory_by_vendor({
                vendor_id: vendor_id,
                inventory_type_id: that.inventory_type_id
            }, that.restaurant_id.restaurant_id).then(function (res) {
                that.inventories[$index] = res.data.data.sku;
            });
        };

        that.chooseInventory = function ($index, vendor_sku_id, inventories) {
            // console.log($index, vendor_sku_id, inventories)
        };

        that.$onInit = function () {
            api.get_chosen_vendors(that.restaurant_id.restaurant_id, {vendor_type_id: that.inventory_type_id}).then(function (res) {
                try {
                    that.vendors = res.data.data.vendors
                } catch (e) {
                    console.log(e);
                }
            });

            that.core.getRefbooks().then(function (res) {
                that.refbooks = res;
            });

        };

    }

    controller.$inject = ['$state', 'auth', 'api', 'core', 'restaurant', 'localStorageService', '$rootScope', 'alertService'];

    angular.module('inspinia').component('newOrderComponent', {
        templateUrl: 'js/components/newOrder/newOrder.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();