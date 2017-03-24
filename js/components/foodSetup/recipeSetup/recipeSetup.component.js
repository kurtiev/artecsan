(function () {
    'use strict';

    function modalController($uibModalInstance, recipe, get_refbooks, ingredients, alertService, api, $q) {


        var that = this;

        that.form = {};
        that.ingredients = ingredients;
        that.recipes = [];
        that.get_refbooks = get_refbooks;
        that.recipe = recipe;
        that.showCategory = false;
        that.api = api;
        that.measurement_units = []; // dynamic array for select menu

        function get_recipe_items() {

            var deferred = $q.defer();

            if (!recipe) {
                deferred.resolve([]);
                return deferred.promise;
            }

            var resArr = [];

            var m = {
                uom_conf: []
            };


            if (recipe.recipe_items) {

                for (var i = 0; recipe.recipe_items.length > i; i++) {

                    resArr.push({

                        model: null,
                        measurement_like: recipe.recipe_items[i].measurement_like_type_id,
                        uom_id: recipe.recipe_items[i].uom_id,

                        measurement_type: recipe.recipe_items[i].measurement_type_id,
                        ingredient_id: recipe.recipe_items[i].vendor_sku_id,
                        amount: recipe.recipe_items[i].amount,
                        cost: recipe.recipe_items[i].cost,
                        time: new Date().getTime() + i // fix ng-repeat
                    });


                    for (var j = 0; that.ingredients.length > j; j++) {
                        if (that.ingredients[j].id === resArr[i].ingredient_id) {
                            resArr[i].model = that.ingredients[j];
                            break
                        }
                    }

                    // find Measure Like
                    for (var l = 0; that.get_refbooks.measurement_likes.length > l; l++) {
                        if (that.get_refbooks.measurement_likes[l].id === resArr[i].measurement_like) {
                            resArr[i].measurement_like = that.get_refbooks.measurement_likes[l];
                            break
                        }
                    }

                    m.uom_conf.push({
                        measurement_type_id: recipe.recipe_items[i].measurement_type_id,
                        vendor_sku_id: recipe.recipe_items[i].vendor_sku_id
                    });
                }

                that.api.get_measure_units(m).then(function (res) {

                    var uomConformity = res.data.data.uomConformity;

                    for (var i = 0; recipe.recipe_items.length > i; i++) {
                        var a = [];

                        for (var j = 0; uomConformity.length > j; j++) {
                            if (uomConformity[j].vendor_sku_id === recipe.recipe_items[i].vendor_sku_id &&
                                (recipe.recipe_items[i].measurement_type_id === uomConformity[j].measurement_type_id)) {

                                // delete duplicates from "a" array
                                for (var l = 0; a.length > l; l++) {

                                    if (a[l].name === uomConformity[j].name
                                        && a[l].measurement_type_id === uomConformity[j].measurement_type_id
                                        && a[l].vendor_sku_id === uomConformity[j].vendor_sku_id) {
                                        a.splice(l, 1)
                                    }

                                }

                                a.push(uomConformity[j]);
                            }
                        }

                        that.measurement_units[i] = a
                    }

                    deferred.resolve(resArr);
                });
            } else {
                deferred.resolve([]);
            }

            return deferred.promise;
        }

        that.model = {
            recipe_name: recipe ? recipe.recipe_name : null,
            servings: recipe ? recipe.servings : 1,
            recipe_type: recipe ? recipe.recipe_type_id : 1,
            shelf_life: recipe ? recipe.shelf_life : 1,
            yield: recipe ? recipe.yield : 100,
            cost: recipe ? recipe.cost : 0,
            ingredients: get_recipe_items(recipe).then(function (res) {
                that.model.ingredients = res
            })
        };


        that.calculateCostYield = function () {

            that.model.cost = 0;
            that.model.yield = 0;
            var totalAmount = 0;
            var yieldValue = 0;
            var yieldTotal = [];

            for (var i = 0; that.model.ingredients.length > i; i++) {

                that.model.cost += that.model.ingredients[i].cost;

                // for dry
                if (that.model.ingredients[i].measurement_like && that.model.ingredients[i].measurement_type === 1) {

                    if (that.model.ingredients[i].measurement_like.yield && that.model.ingredients[i].amount) {

                        yieldTotal.push(that.model.ingredients[i].measurement_like.yield * that.model.ingredients[i].amount);
                        totalAmount += that.model.ingredients[i].amount;

                    }
                }

                // for liquid
                if (that.model.ingredients[i].measurement_type === 2) {
                    yieldTotal.push(1 * that.model.ingredients[i].amount);
                    totalAmount += that.model.ingredients[i].amount;
                }
            }

            for (i = 0; yieldTotal.length > i; i++) {
                yieldValue += yieldTotal[i];
            }


            // that.model.cost = parseFloat(that.model.cost.toFixed(2));

            that.model.yield = parseFloat(((yieldValue / totalAmount) * 100).toFixed(2));

            if (isNaN(that.model.yield)) {
                that.model.yield = 100;
            }


        };

        that.calculate = function ($index) {

            var m = that.model.ingredients[$index];

            if (!m) return;

            if (!m.model || (m.measurement_type === 1 && !m.measurement_like) || !m.uom_id || !m.measurement_type) {
                return
            }

            var findMetricLiqDry = function (deliveryIn, measureIn, measurement_type_id) {
                for (var i = 0; that.get_refbooks.liquid_dry_conversion.length > i; i++) {
                    if (that.get_refbooks.liquid_dry_conversion[i].measurement_type_id === measurement_type_id
                        && that.get_refbooks.liquid_dry_conversion[i].uom_id_of_delivery_unit == deliveryIn
                        && that.get_refbooks.liquid_dry_conversion[i].uom_id == measureIn) {
                        return that.get_refbooks.liquid_dry_conversion[i].metric_conv_liq_dry || 1
                    }
                }
                return 1
            };

            var caseCost = m.model.case_cost;
            var total_unit = m.model.total_unit_size;

            var metric_counter_liq_dry = findMetricLiqDry(m.model.uom_id_of_delivery_unit, m.uom_id, m.measurement_type);
            var amount = m.amount || 0;
            var yeld = m.measurement_like ? m.measurement_like.yield : null;
            var cost = 0;
            var measure_like;
            var pack_cost = m.model.pack_cost / m.model.total_unit_size || (m.model.case_cost / m.model.pack / m.model.total_unit_size);

            // 11 - it is ID of unit measure called "Each ..."
            var unit_cost = m.uom_id !== 11 ? caseCost / total_unit : pack_cost;

            if (m.measurement_like) {
                measure_like = m.measurement_like.converter_value || 1
            }

            // measurement_type === DRY
            if (m.measurement_type === 1) {
                cost = unit_cost * metric_counter_liq_dry * measure_like * amount;
            } else {
                cost = unit_cost * metric_counter_liq_dry * amount;
            }

            if (yeld !== null) {
                cost = cost / yeld
            }

            that.model.ingredients[$index].cost = cost;

            that.calculateCostYield();

        };

        that.ingredientSelected = function (item, $index) {
            that.model.ingredients[$index].ingredient_id = item.id;
        };


        that.addIngredient = function () {
            that.model.ingredients.push({
                ingredient_id: null,
                measurement_type: null,
                measurement_like: null,
                amount: null,
                cost: 0,
                uom_id: null,
                time: new Date().getTime() // fix ng-repeat
            });
            that.measurement_units.push({});
        };

        that.removeIngredient = function ($index) {
            that.measurement_units.splice($index, 1);
            that.model.ingredients.splice($index, 1);
            that.calculateCostYield()

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
                recipe_name: that.model.recipe_name,
                recipe_type_id: that.model.recipe_type,
                servings: that.model.recipe_type === 2 ? that.model.servings : 1,
                shelf_life: that.model.recipe_type === 2 ? that.model.shelf_life : 1,
                yield: that.model.yield,
                cost: that.model.cost,
                recipe_items: []
            };

            for (var i = 0; that.model.ingredients.length > i; i++) {
                m.recipe_items.push({
                    vendor_sku_id: that.model.ingredients[i].ingredient_id,
                    measurement_type_id: that.model.ingredients[i].measurement_type,
                    uom_id: that.model.ingredients[i].uom_id, // unit of measure
                    amount: that.model.ingredients[i].amount,
                    cost: that.model.ingredients[i].cost,
                    yield: that.model.ingredients[i].yield
                });

                if (that.model.ingredients[i].measurement_type === 1) {
                    m.recipe_items[m.recipe_items.length - 1].measurement_like_type_id = that.model.ingredients[i].measurement_like.id
                }
            }

            // create
            if (!that.recipe) {
                that.api.save_recipe(m).then(function (res) {
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
                that.api.update_recipe(that.recipe.id, m).then(function (res) {
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

        that.get_measure_units = function (item, $index) {

            if (!item.measurement_type || !item.ingredient_id) return;

            var m = {
                uom_conf: [{
                    measurement_type_id: item.measurement_type,
                    vendor_sku_id: item.ingredient_id
                }]
            };

            that.api.get_measure_units(m).then(function (res) {
                that.measurement_units[$index] = res.data.data.uomConformity
            });
        };
    }

    function recipeSetupController(api, $state, auth, localStorageService, $uibModal, core, alertService, SweetAlert, $rootScope, restaurant) {

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

        that.edit = function (recipe) {
            that.api.get_recipe(recipe.id).then(function (res) {
                that.add(res.data.data.recipes_list[0]);
            });
        };

        that.delete = function (recipe) {
            SweetAlert.swal({
                    title: "Are you sure?",
                    text: "This recipe will be deleted",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#ed5565",
                    confirmButtonText: "Confirm"
                },
                function (res) {
                    if (res) {
                        that.api.delete_recipe(recipe.id).then(that.getAllRecipes);
                    }
                });
        };

        that.getAllRecipes = function () {
            that.api.get_recipes().then(function (res) {
                try {
                    that.recipes = res.data.data.recipes_list;
                } catch (e) {

                }
            });
        };

        that.getAllRecipes();

        that.add = function (recipe) {
            var modalInstance = $uibModal.open({
                templateUrl: 'add_new_recipe_item.html',
                controller: modalController,
                windowClass: "animated fadeIn modal-lgg",
                controllerAs: '$ctr',
                size: 'lg',
                resolve: {
                    recipe: function () {
                        return recipe;
                    },
                    get_refbooks: function () {
                        if (that.get_refbooks) return that.get_refbooks;
                        return that.core.getRefbooks().then(function (res) {
                            return that.get_refbooks = res;
                        })
                    },
                    ingredients: function () {
                        if (that.ingredients) return that.ingredients;
                        return that.api.get_active_inventory_by_vendor({inventory_type_id: 1}, that.restaurant_id.restaurant_id).then(function (res) {
                            return res.data.data.sku
                        })
                    }
                }
            });

            modalInstance.result.then(function () {
                alertService.showAlertSave();
                that.getAllRecipes();
            }, function () {
                that.getAllRecipes();
            });
        };

        that.$onInit = function () {
            that.core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
            });
        };

    }

    recipeSetupController.$inject = ['api', '$state', 'auth', 'localStorageService', '$uibModal', 'core', 'alertService', 'SweetAlert', '$rootScope', 'restaurant'];

    angular.module('inspinia').component('recipeSetupComponent', {
        templateUrl: 'js/components/foodSetup/recipeSetup/recipeSetup.html',
        controller: recipeSetupController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();