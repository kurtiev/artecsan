var appConfig = {
    apiDomain: 'http://api-artecsan-dev24.dev2b.net/',
    token: null,
    apiAuthorization: 'Basic T2ZmZXJCb3hXRUJDbDFlbnQ6T2ZmZXJCb3hXRUJTM2NyM3Q=',
    googleCaptcha: '6Lc17RIUAAAAACKwIeV24O6S51nMWvzNqRxX8tm_',
    sessionExpires: 9, // hours
    apiBincodesDomain: 'https://api.bincodes.com/'
};

function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, IdleProvider, localStorageServiceProvider, $httpProvider, $locationProvider) {

    // Configure Idle settings
    IdleProvider.idle(5); // in seconds
    IdleProvider.timeout(120); // in seconds
    localStorageServiceProvider.setPrefix('artecsan');
    $httpProvider.interceptors.push('interceptorService');
    $locationProvider.html5Mode(false).hashPrefix('!');

    $urlRouterProvider.otherwise("/home");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });

    $stateProvider
        .state('admin', {
            abstract: true,
            url: "/admin",
            templateUrl: "views/common/content.html"
        })
        .state('admin.homeMenu', {
            url: "/home_menu",
            templateUrl: "views/homeMenu.html",
            controller: 'homeMenuController',
            data: {pageTitle: 'Home'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                        },
                        {
                            name: 'ui.footable',
                            files: ['js/plugins/footable/angular-footable.js']
                        },
                        {
                            serie: true,
                            files: ['css/plugins/c3/c3.min.css', 'js/plugins/d3/d3.min.js', 'js/plugins/c3/c3.min.js']
                        },
                        {
                            serie: true,
                            name: 'gridshore.c3js.chart',
                            files: ['js/plugins/c3/c3-angular.min.js']
                        }
                    ]);
                }
            }
        })
        .state('admin.managementCategories', {
            url: "/management_categories",
            templateUrl: "views/managementCategories.html",
            data: {pageTitle: 'Management Categories'}
        })
        .state('admin.inventoryCategories', {
            url: "/inventory_categories",
            templateUrl: "views/inventoryCategories.html",
            data: {pageTitle: 'Inventory Categories'}
        })
        .state('admin.comingSoon', {
            url: "/coming_soon",
            templateUrl: "views/comingSoon.html",
            data: {pageTitle: 'Coming Soon'}
        })
        .state('admin.dashboardSubCategories', {
            url: "/dashboard_sub_categories",
            templateUrl: "views/dashboardSubCategories.html",
            data: {pageTitle: 'Dashboard Sub Categories'}
        })
        .state('food', {
            abstract: true,
            url: "/food",
            templateUrl: "views/common/content.html",
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                        },
                        {
                            name: 'ui.footable',
                            files: ['js/plugins/footable/angular-footable.js']
                        }
                    ]);
                }
            }
        })
        .state('food.setupConfirmation', {
            url: "/setup_confirmation",
            templateUrl: "views/setupConfirmation.html",
            data: {pageTitle: 'Setup Confirmation'}
        })
        .state('foodSubCategories', {
            url: "/food_sub_categories",
            templateUrl: "views/foodSubCategories.html",
            data: {pageTitle: 'Food Sub Categories'}
        })
        .state('food.newFoodOrder', {
            url: "/new_food_order",
            templateUrl: "views/newFoodOrder.html",
            data: {pageTitle: 'New Food Order'}
        })
        .state('food.orderSummary', {
            url: "/order_summary",
            templateUrl: "views/orderSummary.html",
            data: {pageTitle: 'Order Summary'}
        })
        .state('food.foodDetail', {
            url: "/food_detail",
            templateUrl: "views/foodDetail.html",
            data: {pageTitle: 'Food Detail'}
        })
        .state('food.inventoryUsage', {
            url: "/inventory_usage",
            templateUrl: "views/inventoryUsage.html",
            data: {pageTitle: 'Inventory Usage'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['js/plugins/moment/moment.min.js']
                        },
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css', 'js/plugins/datapicker/angular-datepicker.js']
                        }

                    ]);
                }
            }
        })
        .state('food.inventoryPurchases', {
            url: "/inventory_purchases",
            templateUrl: "views/inventoryPurchases.html",
            data: {pageTitle: 'Inventory Purchases'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['js/plugins/moment/moment.min.js']
                        },
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css', 'js/plugins/datapicker/angular-datepicker.js']
                        }

                    ]);
                }
            }
        })
        .state('food.costOfSales', {
            url: "/cost_of_sales",
            templateUrl: "views/costOfSales.html",
            data: {pageTitle: 'Cost Of Sales'},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['js/plugins/moment/moment.min.js']
                        },
                        {
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css', 'js/plugins/datapicker/angular-datepicker.js']
                        }

                    ]);
                }
            }
        })
        .state('performanceScore', {
            url: "/performance_score",
            templateUrl: "views/performanceScore.html",
            data: {pageTitle: 'Performance Score'}
        })
}

angular
    .module('inspinia')
    .config(config)
    .constant('appConfig', appConfig)
    .run(function ($rootScope, $state, core, auth) {
        $rootScope.$state = $state;
        core.init();
        auth.fillAuthData();
    });
