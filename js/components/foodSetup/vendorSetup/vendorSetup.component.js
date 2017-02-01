(function () {
    'use strict';

    function vendorSetupController(api, $state, auth, localStorageService, SweetAlert) {

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
            order_by: null, // id, name, city, date, zip
            order_way: "DESC",  //ASC/DESC
            paginationOffset: 0, // 0 by default
            paginationCount: 25, //25 by default,
            inRequest: false,
            search_by: null,
            paginationTotal: 0,
            city: null,
            vendor_name: null,
            zip_code: null
        };

        that.search = function (keyword) {

            that.searchModel.inRequest = true;

            var m = {
                order_by: that.searchModel.order_by,
                order_way: that.searchModel.order_way,
                paginationOffset: that.searchModel.paginationOffset,
                paginationCount: that.searchModel.paginationCount,
                search_by: that.searchModel.search_by,
                city: that.searchModel.city,
                vendor_name: that.searchModel.vendor_name,
                zip_code: that.searchModel.zip_code
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


            api.get_vendors(m).then(function (res) {
                try {
                    that.vendorList = res.data.data.vendors;
                    that.searchModel.paginationTotal = res.data.data.total;
                } catch (e) {
                    console.log(e);
                }
                that.searchModel.inRequest = false;
            }, function () {
                that.searchModel.inRequest = false;
            })
        };

        that.search();


        var getChosenVendors = function () {

            api.get_chosen_vendors(that.restaurant_id.restaurant_id).then(function (res) {
                try {
                    that.vendorsSelected = res.data.data.vendors;
                } catch (e) {
                    console.log(e);
                }
            })
        };


        that.addVendor = function (vendor) {

            var id = that.restaurant_id.restaurant_id;
            var m = {
                vendor_id: vendor.id,
                is_active: vendor.is_used,
                inventory_type_id: 2
            };
            that.api.add_vendor(id, m).then(getChosenVendors);

        };

        that.next = function () {

            if (that.vendorsSelected.length) {
                $state.go('foodSetup.inventory');
                return;
            }

            SweetAlert.swal({
                title: 'At first select vendors',
                showConfirmButton: false,
                type: "error",
                timer: 2000
            });
        };

        that.$onInit = function () {
            getChosenVendors()
        };
    }

    vendorSetupController.$inject = ['api', '$state', 'auth', 'localStorageService', 'SweetAlert'];

    angular.module('inspinia').component('vendorSetupComponent', {
        templateUrl: 'js/components/foodSetup/vendorSetup/vendorSetup.html',
        controller: vendorSetupController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();