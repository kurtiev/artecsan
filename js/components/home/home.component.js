(function () {

    'use strict';

    function homeController(appConfig, $state, auth, api, alertService, core) {

        if (!auth.authentication.isLogged) {
            $state.go('login');
            return;
        }

        var that = this;

        that.restaurantsList = [];

        that.m = {
            order_by: "id",
            order_way: "ASC",
            paginationOffset: 25,
            paginationCount: 25
        };


        that.search = function (keyword) {

            that.inRequest = true;

            let m = {
                order_by: that.m.order_by,
                order_way: that.m.order_way,
                paginationOffset: that.m.paginationOffset,
                paginationCount: that.m.paginationCount,
                inRequest: false
            };

            for (var i in m) {
                if (!m[i]) {
                    delete  m[i]
                }
            }

            if (keyword) {
                if (that.m.order_by == keyword) {
                    that.m.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC';
                    m.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC'
                } else {
                    that.m.order_by = keyword;
                    m.order_by = keyword;
                }
            }


            api.get_restaurants(m).then(function (res) {
                try {
                    that.restaurantsList = res.data.data.restaurants_list;
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


    }

    homeController.$inject = ['appConfig', '$state', 'auth', 'api', 'alertService', 'core'];

    angular.module('inspinia').component('homeComponent', {
        templateUrl: 'js/components/home/home.html',
        controller: homeController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();