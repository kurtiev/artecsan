(function () {
    'use strict';

    function inventorySetupController(api, $state, auth, localStorageService, $uibModal) {

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


      that.add = function () {
          var modalInstance = $uibModal.open({
              templateUrl: 'add_new_recipe_item.html',
              controller: ModalInstanceRecipeCtrl,
              windowClass: "animated fadeIn modal-lgg",
              controllerAs: 'vm',
              size: 'lg',
              resolve: {
                  recipe: function () {
                      return null;
                  }
              }
          });

          modalInstance.result.then(function (result) {

          }, function (reason) {

          });
      }

    }

    inventorySetupController.$inject = ['api', '$state', 'auth', 'localStorageService', '$uibModal'];

    angular.module('inspinia').component('recipeSetupComponent', {
        templateUrl: 'js/components/foodSetup/recipeSetup/recipeSetup.html',
        controller: inventorySetupController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();