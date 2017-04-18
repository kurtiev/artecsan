(function () {
    'use strict';

    function foodInventoryController(api, $state, auth, localStorageService, alertService, $rootScope, restaurant, core, $scope, SweetAlert, $q) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.get_vendors_categories = [];
        that.selectedRow = null;
        that.inventories = [];
        that.is_final_save = false;
        that.typeInventory = $state.params.typeInventory;  // full, adjustment

        that.pickers = {
            beginDate: {
                open: false,
                date: new Date()
            },
            endDate: {
                open: false,
                date: new Date()
            }
        };

        var INVENTORIES = []; // const for compare, to change model


        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }


        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

        core.getRefbooks().then(function (res) {
            that.refbooks = res;
        });

        that.model = {
            vendor_category_id: null,
            measurement_units_of_delivery: function (id) {
                for (var i = 0; that.refbooks.measurement_units_of_delivery.length > i; i++) {
                    if (that.refbooks.measurement_units_of_delivery[i].id === id) {
                        return that.refbooks.measurement_units_of_delivery[i].name;
                    }
                }
            }
        };

        that.calculateCount = function (item, $index) {

            var totalUnits = item.total_unit_size || 0;

            if (that.inventories[$index].case_or_qty == 'Case') {
                that.inventories[$index].item_qty = (that.inventories[$index].item_qty / totalUnits)
            } else {
                that.inventories[$index].item_qty = (totalUnits * that.inventories[$index].item_qty)
            }
        };

        that.calculateUnitWeight = function (item, $index) {
            that.total_in_uom_of_delivery = 0;
            var totalUnits = item.total_unit_size || 0;
            var size = item.size;

            if (item.inventory_type_id == 2) {
                var tareWeight = that.inventories[$index].nof_bottles * item.tare_weight;
            } else {
                tareWeight = 0;
            }
            that.inventories[$index].total_in_uom_of_delivery = that.inventories[$index].cases_qty * totalUnits + that.inventories[$index].packs_qty * size + (that.inventories[$index].item_qty - tareWeight);
        };

        api.get_vendors_categories({is_restaurant_used_only: 1}).then(function (res) {
            try {
                that.get_vendors_categories = res.data.data.categories;
                that.get_vendors_categories.unshift({id: 'all', category: 'All Items'});
                that.model.vendor_category_id = res.data.data.categories[0].id;
                that.getInventories(that.model.vendor_category_id)
            } catch (e) {
                console.log(e);
            }
        });

        that.getInventories = function (categoryId, categoryOldId) {
            var m = {
                inventory_type_id: 1,
                vendor_cat_id: categoryId == 'all' ? null : categoryId
            };

            if (!_.isEqual(INVENTORIES, that.inventories)) {
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
                            that.saveAll(that.form).then(function () {
                                that.api.get_inventory_audit(m).then(function (res) {
                                    that.inventories = res.data.data.inventory;
                                    INVENTORIES = angular.copy(res.data.data.inventory);
                                })
                            });
                        } else {
                            that.model.vendor_category_id = categoryOldId;
                        }
                    });
            } else {
                that.api.get_inventory_audit(m).then(function (res) {
                    if (that.typeInventory == 'adjustment'){
                        that.inventories = res.data.data.inventory;
                        for (var i = 0; that.inventories.length > i; i++) {
                            for (var key in that.inventories[i]) {
                                if (that.inventories[i][key] == 0){
                                    that.inventories[i][key] = null;
                                }
                            }
                        }
                        INVENTORIES = angular.copy(res.data.data.inventory);
                    } else {
                        that.inventories = res.data.data.inventory;
                        INVENTORIES = angular.copy(res.data.data.inventory);
                    }
                })
            }

        };

        that.saveAll = function (form, is_final_save) {

            var deferred = $q.defer();

            if (!form.$valid) return;

            if (is_final_save && (!that.pickers.beginDate.date || !that.pickers.endDate.date)) {
                return
            }
            if (that.typeInventory == 'adjustment') {
                var is_adjustment = 1;
                    is_final_save = 1;
            }

            var m = {
                inventory_type_id: 1,
                counting_started_at: new Date(that.pickers.beginDate.date).getTime(),
                counting_ended_at: new Date(that.pickers.endDate.date).getTime(),
                is_final_save: is_final_save || 0,
                is_adjustment: is_adjustment || 0,
                inventory_items: []
            };

            for (var i = 0; that.inventories.length > i; i++) {
                if (that.inventories[i].item_qty !== null && that.inventories[i].cases_qty !== null && that.inventories[i].packs_qty !== null) {
                    m.inventory_items.push({
                        id: that.inventories[i].id,
                        item_qty: that.inventories[i].item_qty,
                        cases_qty: that.inventories[i].cases_qty,
                        packs_qty: that.inventories[i].packs_qty,
                        total_in_uom_of_delivery: that.inventories[i].total_in_uom_of_delivery
                    })
                }
             }

            that.api.update_inventory_audit(m).then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                        INVENTORIES = angular.copy(that.inventories);
                        if (is_final_save) {
                            $state.go('admin.homeMenu');
                        } else {
                            that.getInventories(that.model.vendor_category_id);
                        }
                        alertService.showAlertSave();
                        deferred.resolve()
                    }
                } catch (e) {
                    console.log(e);
                    deferred.reject()
                }
            }, function () {
                deferred.reject()
            });

            return deferred.promise;

        };

        $scope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams, options) {
                var toState = toState.name;
                if (!_.isEqual(INVENTORIES, that.inventories)) {
                    event.preventDefault();
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
                                that.saveAll(that.form).then(function () {
                                    INVENTORIES = angular.copy(that.inventories);
                                    window.onbeforeunload = null;
                                    $state.go(toState);
                                });
                            } else {
                                INVENTORIES = angular.copy(that.inventories);
                                window.onbeforeunload = null;
                                $state.go(toState)
                            }
                        });


                }
            });


        that.openCalendar = function (e, picker) {
            that.pickers[picker].open = true;
        };


        // TODO
        // window.onbeforeunload = function() {
        //     return 'You have not yet saved' ;
        // }
    }

    foodInventoryController.$inject = ['api', '$state', 'auth', 'localStorageService', 'alertService', '$rootScope', 'restaurant', 'core', '$scope', 'SweetAlert', '$q'];

    angular.module('inspinia').component('foodInventoryComponent', {
        templateUrl: 'js/components/foodSetup/foodInventory/foodInventory.html',
        controller: foodInventoryController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();