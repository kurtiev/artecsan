(function () {
    'use strict';

    function modalController($uibModalInstance, recipe, get_refbooks, ingredients, alertService, api) {


        var that = this;

        that.form = {};

        that.ingredients = ingredients;
        that.recipes = [];
        that.get_refbooks = get_refbooks;
        that.recipe = recipe;
        that.showCategory = false;
        that.api = api;

        that.model = {
            recipe_name: recipe ? recipe.recipe_name : null,
            servings: recipe ? recipe.servings : null,
            recipe_type: recipe ? recipe.recipe_type_id : null,
            shelf_life: recipe ? recipe.shelf_life : null,
            yield: recipe ? recipe.yield : null,
            ingredients: (function () {

                if (!recipe) return [];

                var resArr = [];

                if (recipe.recipe_items) {
                    for (var i = 0; recipe.recipe_items.length > i; i++) {
                        resArr.push({

                            model: null,
                            measurement_like: recipe.recipe_items[i].measurement_like_type_id,
                            unit_of_measure: recipe.recipe_items[i].uom_id,

                            measurement_type: recipe.recipe_items[i].measurement_type_id,
                            ingredient_id: recipe.recipe_items[i].vendor_sku_id,
                            amount: recipe.recipe_items[i].amount,
                            cost: recipe.recipe_items[i].cost,
                            yield: recipe.recipe_items[i].yield,
                            time: new Date().getTime() + i // fix ng-repeat
                        });

                        // find Ingredient Name
                        var last_index = resArr.length - 1;

                        for (i = 0; that.ingredients.length > i; i++) {
                            if (that.ingredients[i].id === resArr[last_index].ingredient_id) {
                                resArr[last_index].model = that.ingredients[i];
                                break
                            }
                        }

                        // find Measure Like
                        for (i = 0; that.get_refbooks.measurement_likes.length > i; i++) {
                            if (that.get_refbooks.measurement_likes[i].id === resArr[last_index].measurement_like) {
                                resArr[last_index].measurement_like = that.get_refbooks.measurement_likes[i];
                                break
                            }
                        }

                        // find Unit of Measure
                        for (i = 0; that.get_refbooks.measurement_units.length > i; i++) {
                            if (that.get_refbooks.measurement_units[i].id === resArr[last_index].unit_of_measure) {
                                resArr[last_index].unit_of_measure = that.get_refbooks.measurement_units[i];
                                break
                            }
                        }
                    }
                }
                return resArr;

            })()
        };


        that.calculateCost = function ($index) {

            var m = that.model.ingredients[$index];

            if (!m.model || (m.measurement_type === 1 && !m.measurement_like) || !m.unit_of_measure || !m.measurement_type || !m.amount) {
                return
            }

            var findMetricLiqDry = function (deliveryIn, measureIn, measurement_type_id) {
                for (var i = 0; that.get_refbooks.liquid_dry_conversion.length > i; i++) {
                    if (that.get_refbooks.liquid_dry_conversion[i].measurement_type_id === measurement_type_id
                        && that.get_refbooks.liquid_dry_conversion[i].unit_of_delivery_table.toLowerCase() == deliveryIn.toLowerCase()
                        && that.get_refbooks.liquid_dry_conversion[i].unit_of_measure_table.toLowerCase() == measureIn.toLowerCase()) {
                        return that.get_refbooks.liquid_dry_conversion[i].metric_conv_liq_dry
                    }
                }
                return 1
            };

            var caseCost = m.model.case_cost;
            var total_unit = m.model.total_unit_size;
            var metric_counter_liq_dry = findMetricLiqDry(m.model.unit_of_delivery, m.unit_of_measure.name, m.measurement_type);
            var amount = m.amount;
            var yeld = m.yield;
            var cost = 0;
            var measure_like;

            if (m.measurement_like) {
                measure_like = m.measurement_like.converter_value || 1
            }

            // measurement_type === DRY
            if (m.measurement_type === 1) {
                cost = caseCost / total_unit * metric_counter_liq_dry * amount * measure_like;
            } else {
                cost = caseCost / total_unit * metric_counter_liq_dry * amount;
            }

            if (yeld !== 100) {
                cost = cost / (yeld / 100)
            }

            that.model.ingredients[$index].cost = cost;
        };

        that.ingredientSelected = function (item, $index) {
            that.model.ingredients[$index].ingredient_id = item.id;
            that.model.ingredients[$index].yield = item.yield * 100;

            var sum = 0;

            var count = 0;

            for (var i = 0; that.model.ingredients.length > i; i++) {
                if (that.model.ingredients[i].ingredient_id) {
                    sum += that.model.ingredients[i].yield;
                    count++
                }
            }
            that.model.yield = parseFloat((sum / count).toFixed(2));
        };

        that.countYield = function ($index) {
            var sum = 0;
            var count = 0;

            for (var i = 0; that.model.ingredients.length > i; i++) {
                if (that.model.ingredients[i].ingredient_id) {
                    sum += that.model.ingredients[i].yield;
                    count++
                }
            }

            that.model.yield = parseFloat((sum / count).toFixed(2));

            that.calculateCost($index);
        };


        that.addIngredient = function () {
            that.model.ingredients.push({
                ingredient_id: null,
                measurement_type: null,
                measurement_like: null,
                unit_of_measure: null,
                amount: null,
                cost: null,
                yield: null,
                time: new Date().getTime() // fix ng-repeat
            })
        };

        that.removeIngredient = function ($index) {
            that.model.ingredients.splice($index, 1);
            if (that.model.ingredients.length) {
                that.countYield($index)
            }

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
                servings: that.model.servings,
                shelf_life: that.model.shelf_life,
                yield: that.model.yield,
                recipe_items: []
            };

            for (var i = 0; that.model.ingredients.length > i; i++) {
                m.recipe_items.push({
                    vendor_sku_id: that.model.ingredients[i].ingredient_id,
                    measurement_type_id: that.model.ingredients[i].measurement_type,
                    uom_id: that.model.ingredients[i].unit_of_measure.id, // unit of measure
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
    }

    function recipeSetupController(api, $state, auth, localStorageService, $uibModal, core, alertService, SweetAlert) {

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
                        return that.api.get_active_inventory_by_vendor(null, that.restaurant_id.restaurant_id).then(function (res) {
                            return res.data.data.sku
                        })
                    }
                }
            });

            modalInstance.result.then(function () {
                alertService.showAlertSave();
                that.getAllRecipes();
            });
        };

        that.$onInit = function () {
            that.core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
            });
        };

    }

    recipeSetupController.$inject = ['api', '$state', 'auth', 'localStorageService', '$uibModal', 'core', 'alertService', 'SweetAlert'];

    angular.module('inspinia').component('recipeSetupComponent', {
        templateUrl: 'js/components/foodSetup/recipeSetup/recipeSetup.html',
        controller: recipeSetupController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();