(function () {

    'use strict';

    function homeController(appConfig, $state, auth, api, alertService, core, restaurant, localStorageService, $scope) {

        if (!auth.authentication.isLogged) {
            $state.go('login');
            return;
        }

        var that = this;

        that.restaurantService = restaurant;
        that.restaurantsList = [];
        that.employees_list = [];
        that.api = api;

        core.data.new_restaurant = null; // reset recently editable or added restaurant

        that.m = {
            order_by: "id",
            order_way: "DESC",  //ASC/DESC
            paginationOffset: 0, // 0 by default
            paginationCount: 10, //25 by default,
            inRequest: false,
            search_by: null,
            paginationTotal: 0
        };

        that.selectRestaurant = function (restaurant) {
            that.restaurantService.set_restaurant(restaurant.id).then(function (res) {


                for (var i in res.employees) {
                    console.log(res.employees[i].type_ids);
                    if (res.employees[i].type_ids === 5) {
                        $state.go('admin.inventoryCategories');
                        return;
                    }
                    if (res.employees[i].type_ids === 6) {
                        $state.go('admin.inventoryCategories');
                        return
                    }
                }
                $state.go('admin.homeMenu');
            });
        };

        that.search = function (keyword) {

            that.inRequest = true;

            var m = {
                order_by: that.m.order_by,
                order_way: that.m.order_way,
                paginationOffset: that.m.paginationOffset,
                paginationCount: that.m.paginationCount,
                search_by: that.m.search_by
            };

            for (var i in m) {
                if (!m[i]) {
                    delete  m[i]
                }
            }

            if (keyword) {
                m.paginationOffset = 0;
                if (that.m.order_by == keyword) {
                    that.m.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC';
                    m.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC'
                } else {
                    that.m.order_by = keyword;
                    m.order_by = keyword;
                }
            }
            if (m.paginationOffset > 0 && !keyword) {
                m.paginationOffset = (m.paginationOffset - 1) * m.paginationCount;
            }


            api.get_restaurants(m).then(function (res) {
                try {
                    that.restaurantsList = res.data.data.restaurants_list;
                    that.m.paginationTotal = res.data.data.total;
                } catch (e) {
                    console.log(e);
                }
                that.m.inRequest = false;
            }, function (e) {
                console.log(e);
                that.m.inRequest = false;
            })
        };

        that.search();

        that.editRestaurant = function (restaurant) {
            that.restaurantService.set_to_edit(restaurant.id).then(function () {

                api.get_restaurant(restaurant.id).then(function (res) {
                    that.employees_list = res.data.data.restaurants_list[0].employees;

                    console.log('employees_list -', that.employees_list.length);

                    if (that.employees_list.length) {

                        api.get_chosen_vendors(restaurant.id).then(function (res) {

                            that.vendorsSelected = res.data.data.vendors;

                            console.log('vendorsSelected -', that.vendorsSelected);

                            if (that.vendorsSelected.length) {
                                $state.go('foodSetup.inventory');
                            } else {
                                $state.go('foodSetup.vendor');
                            }

                        });

                        $state.go('foodSetup.vendor');

                    } else {
                        $state.go('invite', {id: restaurant.id});

                    }


                });

            });
        };


    }

    homeController.$inject = ['appConfig', '$state', 'auth', 'api', 'alertService', 'core', 'restaurant', 'localStorageService', '$scope'];

    angular.module('inspinia').component('homeComponent', {
        templateUrl: 'js/components/home/home.html',
        controller: homeController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();