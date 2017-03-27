(function () {
    'use strict';

    function modalController($uibModalInstance, menu, get_refbooks, recipes_list, alertService, api) {


        var that = this;

        that.form = {};

        that.recipes = recipes_list;
        that.get_refbooks = get_refbooks;
        that.menu = menu;
        that.api = api;

        that.model = {
            menu_item_name: that.menu ? that.menu.menu_item_name : null,
            description: that.menu ? that.menu.description : null,
            price: that.menu ? that.menu.price : null,
            cost_margin: that.menu ? that.menu.cost_margin : null,
            cost: that.menu ? that.menu.cost : null,
            menu_items: []
        };

        if (that.menu) {
            if (that.menu.menu_items) {

                for (var j = 0; that.recipes.length > j; j++) {

                    for (var i = 0; that.menu.menu_items.length > i; i++) {

                        if (that.menu.menu_items[i].recipe_id === that.recipes[j].id) {
                            that.model.menu_items.push({
                                recipe: that.recipes[j],
                                cost: that.menu.menu_items[i].cost,
                                id: that.menu.menu_items[i].id,
                                time: new Date().getTime() + i// fix ng-repeat
                            });

                        }
                    }

                }

            }
        }

        that.addRecipe = function () {
            that.model.menu_items.push({
                recipe: null,
                cost: null,
                time: new Date().getTime() // fix ng-repeat
            })
        };

        that.countCost = function () {
            var sum = 0;

            var count = 0;

            for (var i = 0; that.model.menu_items.length > i; i++) {
                if (that.model.menu_items[i].recipe.id) {
                    sum += that.model.menu_items[i].recipe.cost;
                    count++
                }
            }

            that.model.cost = parseFloat((sum).toFixed(2));

            that.model.cost_margin = parseFloat(((that.model.cost / that.model.price) * 100).toFixed(2));

            // that.model.cost_margin = parseFloat((that.model.price - that.model.cost).toFixed(2));

        };

        that.remove = function ($index) {
            that.model.menu_items.splice($index, 1);
            if (that.model.menu_items.length) {
                that.countCost($index)
            }
        };

        that.submit = function (form) {

            if (!that.model.menu_items.length) {
                alertService.showError('Please add at least one recipe');
                return
            }

            if (!form.$valid) {
                return
            }

            var m = {
                inventory_type_id: 1,
                menu_item_name: that.model.menu_item_name,
                description: that.model.description,
                price: that.model.price,
                cost_margin: that.model.cost_margin,
                cost: that.model.cost,
                menu_items: []
            };

            for (var i = 0; that.model.menu_items.length > i; i++) {
                m.menu_items.push({
                    recipe_id: that.model.menu_items[i].recipe.id,
                    id: that.model.menu_items[i].id,
                    cost: that.model.menu_items[i].recipe.cost
                })
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

    function menuSetupController(api, $state, auth, localStorageService, $uibModal, core, alertService, SweetAlert, $rootScope, restaurant) {

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
                        that.api.delete_menu(menu.id).then(that.getAllMenus);
                    }
                });
        };

        that.getAllMenus = function () {
            that.api.get_menus({inventory_type_id: 1}).then(function (res) {
                try {
                    that.menus = res.data.data.menus_list;
                } catch (e) {

                }
            });
        };

        that.getAllMenus();

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
                    recipes_list: function () {
                        if (that.recipes) return that.recipes;
                        return that.api.get_recipes().then(function (res) {
                            return res.data.data.recipes_list
                        })
                    }
                }
            });

            modalInstance.result.then(function () {
                alertService.showAlertSave();
                that.getAllMenus();
            });
        };

        that.$onInit = function () {
            that.core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
            });
        };

    }

    menuSetupController.$inject = ['api', '$state', 'auth', 'localStorageService', '$uibModal', 'core', 'alertService', 'SweetAlert', '$rootScope', 'restaurant'];

    angular.module('inspinia').component('menuSetupComponent', {
        templateUrl: 'js/components/foodSetup/menuSetup/menuSetup.html',
        controller: menuSetupController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();