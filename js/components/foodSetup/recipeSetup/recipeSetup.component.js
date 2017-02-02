(function () {
    'use strict';

    function modalController($uibModalInstance, recipe, get_refbooks, ingredients) {


        var that = this;

        that.form = {};

        that.ingredients = ingredients; // todo group

        that.model = {
            recipe_name: recipe ? recipe.recipe_name : null,
            servings: recipe ? recipe.servings : null,
            recipe_type: recipe ? recipe.recipe_type : null,
            shelf_life: recipe ? recipe.shelf_life : null,
            yield: recipe ? recipe.yield : null,
            ingredients: []
        };

        var mIngredient = {
            ingredient: null,

        };

        this.isEdit = recipe;

        this.recipe = recipe;

        that.addIngredient = function () {
            that.model.ingredients.push(mIngredient)
        };

        that.submit = function (recipe) {
            // $uibModalInstance.close(recipe);
        };

        that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    function recipeSetupController(api, $state, auth, localStorageService, $uibModal, core) {

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


        that.add = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'add_new_recipe_item.html',
                controller: modalController,
                windowClass: "animated fadeIn modal-lgg",
                controllerAs: '$ctr',
                size: 'lg',
                resolve: {
                    recipe: function () {
                        return null;
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

            modalInstance.result.then(function (recipe) {

            }, function (reason) {

            });
        };

        that.$onInit = function () {
            that.core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
            });
        };

    }

    recipeSetupController.$inject = ['api', '$state', 'auth', 'localStorageService', '$uibModal', 'core'];

    angular.module('inspinia').component('recipeSetupComponent', {
        templateUrl: 'js/components/foodSetup/recipeSetup/recipeSetup.html',
        controller: recipeSetupController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();