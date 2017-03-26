(function () {
    'use strict';

    function modalController($uibModalInstance, schedule, vendors, api, get_vendors_categories) {

        var that = this;

        that.form = {};

        that.schedule = schedule;
        that.vendors = vendors;
        that.get_vendors_categories = get_vendors_categories;
        that.api = api;

        that.model = {
            inventory_type_id: 2,
            vendor_id: schedule ? schedule.vendor_id : null,
            vendor_category_id: schedule ? schedule.vendor_category_id : 0, // todo
            is_on_monday: schedule ? schedule.is_on_monday : 0,
            is_on_tuesday: schedule ? schedule.is_on_tuesday : 0,
            is_on_wednesday: schedule ? schedule.is_on_wednesday : 0,
            is_on_thursday: schedule ? schedule.is_on_thursday : 0,
            is_on_friday: schedule ? schedule.is_on_friday : 0,
            is_on_saturday: schedule ? schedule.is_on_saturday : 0,
            is_on_sunday: schedule ? schedule.is_on_sunday : 0
        };

        that.submit = function (form) {

            if (!form.$valid) {
                return
            }

            var m = {
                inventory_type_id: that.model.inventory_type_id,
                vendor_id: that.model.vendor_id,
                vendor_category_id: that.model.vendor_category_id,
                is_on_monday: that.model.is_on_monday,
                is_on_tuesday: that.model.is_on_tuesday,
                is_on_wednesday: that.model.is_on_wednesday,
                is_on_thursday: that.model.is_on_thursday,
                is_on_friday: that.model.is_on_friday,
                is_on_saturday: that.model.is_on_saturday,
                is_on_sunday: that.model.is_on_sunday
            };

            // create
            if (!that.schedule) {
                that.api.save_delivery(m).then(function (res) {
                    try {
                        if (res.data.data.code === 1000) {
                            $uibModalInstance.close();
                        }
                    } catch (e) {
                        console.log(e)
                    }
                });
            } else {
                // update
                that.api.update_delivery(that.schedule.id, m).then(function (res) {
                    try {
                        if (res.data.data.code === 1000) {
                            $uibModalInstance.close();
                        }
                    } catch (e) {
                        console.log(e)
                    }
                });
            }

        };

        that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    function deliverySetupController(api, $state, auth, localStorageService, $uibModal, core, alertService, SweetAlert, $rootScope, restaurant) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.core = core;
        that.auth = auth;


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

        that.delete = function (schedule) {
            SweetAlert.swal({
                    title: "Are you sure?",
                    text: "This schedule will be deleted",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#ed5565",
                    confirmButtonText: "Confirm"
                },
                function (res) {
                    if (res) {
                        that.api.delete_delivery(schedule.id).then(that.getAllDeliveries);
                    }
                });
        };

        that.getAllDeliveries = function () {
            that.api.delivery_schedules({inventory_type_id: 2}).then(function (res) {
                try {
                    that.deliveries = res.data.data.delivery_schedules_list;
                } catch (e) {

                }
            });
        };

        that.getAllDeliveries();

        that.add = function (schedule) {
            var modalInstance = $uibModal.open({
                templateUrl: 'add_new_delivery_item.html',
                controller: modalController,
                windowClass: "animated fadeIn modal-lgg",
                controllerAs: '$ctr',
                resolve: {
                    schedule: function () {
                        return schedule;
                    },
                    vendors: function () {
                        if (that.vendors) return that.vendors;
                        return api.get_chosen_vendors(that.restaurant_id.restaurant_id, {inventory_type_id: 2}).then(function (res) {
                            try {
                                return that.vendors = res.data.data.vendors;
                            } catch (e) {
                                console.log(e);
                            }
                        })
                    },
                    get_vendors_categories: function () {
                        if (that.get_vendors_categories) return that.get_vendors_categories;
                        return api.get_vendors_categories({
                            is_restaurant_used_only: 1,
                            inventory_type_id: 2
                        }).then(function (res) {
                            try {
                                return that.get_vendors_categories = res.data.data.categories;
                            } catch (e) {
                                console.log(e);
                            }
                        })
                    }
                }
            });

            modalInstance.result.then(function () {
                alertService.showAlertSave();
                that.getAllDeliveries();
            });
        };

    }

    deliverySetupController.$inject = ['api', '$state', 'auth', 'localStorageService', '$uibModal', 'core', 'alertService', 'SweetAlert', '$rootScope', 'restaurant'];

    angular.module('inspinia').component('alcoholDeliverySetupComponent', {
        templateUrl: 'js/components/alcoholSetup/deliverySetup/deliverySetup.html',
        controller: deliverySetupController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();