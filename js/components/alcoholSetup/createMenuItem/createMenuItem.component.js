(function () {
    'use strict';

    function modalController($uibModalInstance, menu, get_refbooks, ingredients, alertService, api) {


        var that = this;
        console.log(menu)

        that.form = {};
        that.ingredients = ingredients;
        that.menus = [];
        that.get_refbooks = get_refbooks;
        that.menu = menu;
        that.api = api;

        that.model = {
            menu_item_name: menu ? menu.menu_item_name : null,
            price: menu ? menu.price : null,
            cost: menu ? menu.cost_margin : 0,
            total_cost: menu ? menu.total_cost : 0,
            serving_type: menu ? menu.serving_type : null,
            serving_size: menu ? menu.serving_size : null,
            total_recipe_oz: menu ? menu.total_recipe_oz : 0,
            total_servings: menu ? menu.total_servings : 0,
            description: menu ? menu.description : null,
            ingredients: menu ? menu.menu_items : []
        };


        that.calculate = function ($index) {

        };


        that.addIngredient = function () {
            that.model.ingredients.push(angular.copy({
                recipe_id: null,
                vendor_sku_id: null,
                bar_recipe_uom_id: null,
                recipes_amount: null,
                oz_per_serving: 0,
                usage_in_units: 0,
                cost: 0,
                time: new Date().getTime()
            }));
        };

        that.removeIngredient = function ($index) {
            that.model.ingredients.splice($index, 1);
        };

        that.submit = function (form) {

            if (!that.model.ingredients.length) {
                alertService.showError('Please add at least one ingredient');
                return
            }

            if (!form.$valid) {
                return
            }

            var m = {
                inventory_type_id: 1,
                menu_item_name: that.model.menu_item_name,
                description: that.model.description,
                serving_size: that.model.serving_size,             //-- use for bar only (inventory_type_id = 2), otherwise set as null or not include in the body
                oz_total: that.model.oz_total,                     //-- use for bar only (inventory_type_id = 2), otherwise set as null or not include in the body
                total_servings: that.model.total_servings,          //-- use for bar only (inventory_type_id = 2), otherwise set as null or not include in the body
                price: that.model.price,
                cost_margin: that.model.cost_margin,
                cost: that.model.cost,
                menu_items: []
            };

            for (var i = 0; that.model.ingredients.length > i; i++) {
                m.menu_items.push({
                    recipe_id: that.model.ingredients[i].recipe_id,
                    vendor_sku_id: that.model.ingredients[i].vendor_sku_id,             //-- use for bar only (inventory_type_id = 2), otherwise set as null or not include in the body
                    bar_recipe_uom_id: that.model.ingredients[i].bar_recipe_uom_id,     //-- use for bar only (inventory_type_id = 2), ids of "bar_recipe_measurement_types" refbook
                    recipes_amount: that.model.ingredients[i].recipes_amount,
                    oz_per_serving: that.model.ingredients[i].oz_per_serving,
                    usage_in_units: that.model.ingredients[i].usage_in_units,
                    cost: that.model.ingredients[i].cost
                });
            }

            // create
            if (!that.menu) {
                that.api.save_menu(m).then(function (res) {
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
                that.api.update_menu(that.menu.id, m).then(function (res) {
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

    function controller(api, $state, auth, localStorageService, $uibModal, core, alertService, SweetAlert, $rootScope, restaurant) {

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

        that.edit = function (menu) {
            that.api.get_menu_by_id(menu.id).then(function (res) {
                that.add(res.data.data.menus_list[0]);
            });
        };

        that.delete = function (menu) {
            SweetAlert.swal({
                    title: "Are you sure?",
                    text: "This menu will be deleted",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#ed5565",
                    confirmButtonText: "Confirm"
                },
                function (res) {
                    if (res) {
                        that.api.delete_menu(menu.id).then(that.getAllMenu);
                    }
                });
        };

        that.getAllMenu = function () {
            that.api.get_menus({item_type_id: 2}).then(function (res) {
                try {
                    that.menus = res.data.data.menus_list;
                } catch (e) {

                }
            });
        };

        that.getAllMenu();

        that.add = function (menu) {
            var modalInstance = $uibModal.open({
                templateUrl: 'add_new_menu_item.html',
                controller: modalController,
                windowClass: "animated fadeIn modal-lgg",
                controllerAs: '$ctr',
                size: 'lg',
                resolve: {
                    menu: function () {
                        return menu;
                    },
                    get_refbooks: function () {
                        if (that.get_refbooks) return that.get_refbooks;
                        return that.core.getRefbooks().then(function (res) {
                            return that.get_refbooks = res;
                        })
                    },
                    ingredients: function () {
                        if (that.ingredients) return that.ingredients;
                        return that.api.get_active_inventory_by_vendor({inventory_type_id: 2}, that.restaurant_id.restaurant_id).then(function (res) {
                            return res.data.data.sku
                        })
                    }
                }
            });

            modalInstance.result.then(function () {
                alertService.showAlertSave();
                that.getAllMenu();
            }, function () {
                that.getAllMenu();
            });
        };

        that.$onInit = function () {
            that.core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
            });
        };

    }

    controller.$inject = ['api', '$state', 'auth', 'localStorageService', '$uibModal', 'core', 'alertService', 'SweetAlert', '$rootScope', 'restaurant'];

    angular.module('inspinia').component('alcoholCreateMenuItemComponent', {
        templateUrl: 'js/components/alcoholSetup/createMenuItem/createMenuItem.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();