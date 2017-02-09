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
                    that.inventories = res.data.data.inventory;
                    INVENTORIES = angular.copy(res.data.data.inventory);
                })
            }

        };

        that.saveAll = function (form, is_final_save) {

            var deferred = $q.defer();

            if (!form.$valid) return;

            var m = {
                inventory_type_id: 1,
                is_final_save: is_final_save || 0,
                inventory_items: []
            };

            for (var i = 0; that.inventories.length > i; i++) {
                m.inventory_items.push({
                    id: that.inventories[i].id,
                    item_qty: that.inventories[i].item_qty,
                    cases_qty: that.inventories[i].cases_qty,
                    packs_qty: that.inventories[i].packs_qty
                })
            }

            that.api.update_inventory_audit(m).then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                        that.getInventories(that.model.vendor_category_id);
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
                                    $state.go(toState);
                                });
                            } else {
                                INVENTORIES = angular.copy(that.inventories);
                                $state.go(toState)
                            }
                        });


                }
            })


    }

    foodInventoryController.$inject = ['api', '$state', 'auth', 'localStorageService', 'alertService', '$rootScope', 'restaurant', 'core', '$scope', 'SweetAlert', '$q'];

    angular.module('inspinia').component('foodInventoryComponent', {
        templateUrl: 'js/components/foodSetup/foodInventory/foodInventory.html',
        controller: foodInventoryController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();