(function () {

    'use strict';

    function controller($state, auth, api, core, restaurant, localStorageService, $rootScope, $filter) {

        if (!auth.authentication.isLogged) {
            $state.go('login');
            return;
        }

        var that = this;
        that.api = api;
        that.core = core;
        that.isFood = $state.includes('food.orderSummary');
        that.refbooks = {};
        that.form = {};
        that.inventories = [];

        that.inventory_type_id = that.isFood ? '1' : '2';

        that.orderModel = {
            totalInvoice: 0,
            totalOrder: 0,
            inventory_type_id: that.inventory_type_id,
            items: []
        };

        that.searchModel = {
            inventory_type_id: that.inventory_type_id,
            orderBy: 'vendor_name',
            orderWay: "DESC",  //ASC/DESC
            paginationOffset: 0,
            paginationCount: 25,
            paginationTotal: 0
        };

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }


        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

        that.search = function (keyword) {

            that.searchModel.inRequest = true;

            var m = {
                orderBy: that.searchModel.orderBy,
                orderWay: that.searchModel.orderWay,
                paginationOffset: that.searchModel.paginationOffset,
                paginationCount: that.searchModel.paginationCount,

                city: that.searchModel.city,
                item_name: that.searchModel.item_name,
                sub_category: that.searchModel.sub_category,
                vendor_sku: that.searchModel.vendor_sku,
                filter: that.searchModel.filter,
                category: that.searchModel.category,
                inventory_type_id: 2
            };

            for (var i in m) {
                if (!m[i]) {
                    delete  m[i]
                }
            }

            if (keyword) {
                m.paginationOffset = 0;
                if (that.searchModel.orderBy == keyword) {
                    that.searchModel.orderWay = m.orderWay == 'ASC' ? 'DESC' : 'ASC';
                    m.orderWay = m.orderWay == 'ASC' ? 'DESC' : 'ASC'
                } else {
                    that.searchModel.orderBy = keyword;
                    m.orderBy = keyword;
                }
            }
            if (m.paginationOffset > 0 && !keyword) {
                m.paginationOffset = (m.paginationOffset - 1) * m.paginationCount;
            }


            api.get_orders(m).then(function (res) {
                try {
                    that.inventories = res.data.data.orders;
                    that.searchModel.paginationTotal = res.data.data.paginationTotal;
                    that.calculate();
                } catch (e) {
                    console.log(e);
                }
            });
        };

        that.search();

        that.calculate = function () {

            var totalInvoice = 0;
            var totalOrder = 0;

            angular.forEach(that.inventories, function (v, k) {
                totalInvoice += parseFloat(v.invoice_total) || 0;
                totalOrder += parseFloat(v.total) || 0;
            });

            that.orderModel.totalInvoice = totalInvoice;
            that.orderModel.totalOrder = totalOrder;

        };

        that.getDateObj = function (date) {
            var d = new Date(date);
            if (isNaN(d) || !d) return new Date();
            return new Date(d)
        };

        that.$onInit = function () {
            that.core.getRefbooks().then(function (res) {
                that.refbooks = res;
            });
        };

        that.save = function (form) {

            if (!form.$valid) return;

            var m = {
                inventory_type_id: that.inventory_type_id,
                orders: []
            };


            for (var i = 0; that.inventories.length > i; i++) {

                m.orders.push({
                    id: that.inventories[i].id,
                    is_approved: that.inventories[i].is_approved,
                    order_number: that.inventories[i].order_number,
                    order_date: $filter('date')(that.inventories[i].order_date, 'yyyy-MM-dd'),
                    total: that.inventories[i].total,
                    is_delivery_confirmed: that.inventories[i].is_delivery_confirmed,
                    invoice_number: that.inventories[i].invoice_number,
                    invoice_total: that.inventories[i].invoice_total,
                    delivery_date: $filter('date')(that.inventories[i].delivery_date, 'yyyy-MM-dd'),
                    delivery_time: $filter('date')(that.inventories[i].delivery_date, 'HH:mm:ss')
                })
            }

            that.api.update_orders(m).then(function () {

            })
        };

    }

    controller.$inject = ['$state', 'auth', 'api', 'core', 'restaurant', 'localStorageService', '$rootScope', '$filter'];

    angular.module('inspinia').component('orderSummaryComponent', {
        templateUrl: 'js/components/orderSummary/orderSummary.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();