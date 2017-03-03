(function () {
    'use strict';

    function menuItemsMappingController(api, $state, auth, localStorageService, restaurant, $rootScope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.base_api_url = appConfig.apiDomain;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.items = [];
        that.posSyncList = [];
        that.menus = [];
        that.searchModel = {
            is_active: '1',
            list_type: 'sold_items',
            paginationCount: 25,
            paginationOffset: 0,
            total: 0
        };

        $rootScope.$on('restaurantSelected', function () {
            that.pos_id = $state.params.pos_id || restaurant.data.info.pos_id;
            that.permissions = restaurant.data.permissions;
        });

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }


        that.getItems = function () {

            that.searchModel.inRequest = true;

            var m = {
                is_active: that.searchModel.is_active,
                list_type: that.searchModel.list_type,
                paginationOffset: that.searchModel.paginationOffset,
                paginationCount: that.searchModel.paginationCount

            };

            if (m.paginationOffset > 0) {
                m.paginationOffset = (m.paginationOffset - 1) * m.paginationCount;
            }

            that.api.getItemsForMap(that.restaurant_id.restaurant_id, m).then(function (res) {
                that.items = res.data.data.report_items;
                that.searchModel.total = res.data.data.total; // TODO
            })
        };

        that.getItems();

        that.setMenuItemId = function (item) {
            var m = {
                matched_items: [{
                    id: item.id,
                    name: item.name,
                    focus_item_id: item.focus_item_id,
                    menu_item_id: item.menu_item_id,
                    is_active: item.is_active
                }]
            };

            that.api.setItemsForMap(that.restaurant_id.restaurant_id, m).then(function (res) {

            }, that.getItems)
        };

        that.removeItem = function ($index, item) {

            var m = {
                matched_items: [{
                    id: item.id,
                    name: item.name,
                    focus_item_id: item.focus_item_id,
                    menu_item_id: item.menu_item_id,
                    is_active: item === 1 ? 0 : 1
                }]
            };

            that.api.setItemsForMap(that.restaurant_id.restaurant_id, m).then(function (res) {
                if (res.data.data.code === 1000) {
                    that.getItems();
                    that.api.report_items_match().then(function (res) {
                        $rootScope.report_items_match_to_show = res.data.data.items_to_match;
                    })
                }
            }, that.getItems)
        };

        that.$onInit = function () {
            that.api.get_menus().then(function (res) {
                that.menus = res.data.data.menus_list
            })
        }


    }

    menuItemsMappingController.$inject = ['api', '$state', 'auth', 'localStorageService', 'restaurant', '$rootScope'];

    angular.module('inspinia').component('menuItemsMappingComponent', {
        templateUrl: 'js/components/reports/menuItemsMapping/menuItemsMapping.html',
        controller: menuItemsMappingController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();