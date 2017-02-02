(function () {
    'use strict';

    function modalController($uibModalInstance, recipe, get_refbooks, ingredients, alertService) {


        var that = this;

        that.form = {};

        that.ingredients = ingredients;
        that.recipes = [];
        that.get_refbooks = get_refbooks;
        that.recipe = recipe;
        that.showCategory = false;

        that.model = {
            recipe_name: recipe ? recipe.recipe_name : null,
            servings: recipe ? recipe.servings : null,
            recipe_type: recipe ? recipe.recipe_type_id : null,
            shelf_life: recipe ? recipe.shelf_life : null,
            yield: recipe ? recipe.yield : null,
            ingredients: (function () {

                if (!recipe) return [];

                var resArr = [];

                for (var i = 0; recipe.recipe_items.length > i; i++) {
                    resArr.push({
                        ingredient_id: recipe.recipe_items[i].id,
                        measurement_type: recipe.recipe_items[i].measurement_type_id,
                        measurement_like: recipe.recipe_items[i].measurement_like_type_id,
                        unit_of_measure: null,
                        amount: recipe.recipe_items[i].amount,
                        cost: recipe.recipe_items[i].cost,
                        yield: recipe.recipe_items[i].yield,
                        time: new Date().getTime() + i // fix ng-repeat
                    })
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
                return 0;
            };

            var caseCost = m.model.case_cost;
            var total_unit = m.model.total_unit_size;
            var metric_counter_liq_dry = findMetricLiqDry(m.model.unit_of_delivery, m.unit_of_measure.name, m.measurement_type);
            var amount;
            var yeld;
            var cost;

            var measure_like = m.measurement_like ? m.measurement_like.converter_value : 1; // USE JUST FOR DRY

            console.log(caseCost, total_unit, metric_counter_liq_dry, measure_like);

            //cost = caseCost / total_unit * metric_counter_liq_dry * amount * measure_like / yeld;
            if (m.measurement_type === 1) {
                // DRY

            } else {
                // LIQUID
                // console.log(that.get_refbooks);
                // console.log('LIQUID', m);

            }

            that.model.ingredients[$index].cost = cost;
        };

        that.ingredientSelected = function (item, $index) {
            that.model.ingredients[$index].ingredient_id = item.id;
            that.model.ingredients[$index].yield = item.yield;
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
            that.model.ingredients.splice($index, 1)
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
                    measurement_like_type_id: that.model.ingredients[i].measurement_like_type_id,
                    uom_id: 66,
                    amount: 121.1,
                    cost: 121.25,
                    yield: 0.9563
                })
            }

            that.api.save_recipe().then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                        $uibModalInstance.close(recipe);
                    }
                } catch (e) {
                    console.log(e)
                }
            });

        };

        that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    function recipeSetupController(api, $state, auth, localStorageService, $uibModal, core, alertService) {

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

        that.delete = function (recipe, $index) {
            console.log(recipe);
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

    recipeSetupController.$inject = ['api', '$state', 'auth', 'localStorageService', '$uibModal', 'core', 'alertService'];

    angular.module('inspinia').component('recipeSetupComponent', {
        templateUrl: 'js/components/foodSetup/recipeSetup/recipeSetup.html',
        controller: recipeSetupController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();