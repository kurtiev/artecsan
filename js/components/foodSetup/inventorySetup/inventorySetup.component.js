(function () {
    'use strict';

    function inventorySetupController(api, $state, auth, localStorageService) {

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


        that.vendorList = [];
        that.vendorsSelected = [];
        that.searchModel = {
            order_by: 'id', // id, name, city, date, zip
            order_way: "DESC",  //ASC/DESC
            paginationOffset: 0, // 0 by default
            paginationCount: 10, //25 by default,
            inRequest: false,
            search_by: null,
            paginationTotal: 0
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


            // TODO
            // api.get_vendors(m).then(function (res) {
            //     try {
            //         that.restaurantsList = res.data.data.restaurants_list;
            //         that.m.paginationTotal = res.data.data.total;
            //     } catch (e) {
            //         console.log(e);
            //     }
            //     that.m.inRequest = false;
            // }, function (e) {
            //     console.log(e);
            //     that.m.inRequest = false;
            // })
        };


    }

    inventorySetupController.$inject = ['api', '$state', 'auth', 'localStorageService'];

    angular.module('inspinia').component('inventorySetupComponent', {
        templateUrl: 'js/components/foodSetup/inventorySetup/inventorySetup.html',
        controller: inventorySetupController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();