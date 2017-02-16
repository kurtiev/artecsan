(function () {

    "use strict";

    angular.module('inspinia', [
        'ui.router',                    // Routing
        'oc.lazyLoad',                  // ocLazyLoad
        'ui.bootstrap',                 // Ui Bootstrap
        'ngIdle',                       // Idle timer
        'ngSanitize',                   // ngSanitize
        'oitozero.ngSweetAlert',
        'LocalStorageModule',
        'ui.bootstrap.datetimepicker'
    ])
})();

// Other libraries are loaded dynamically in the config.js file using the library ocLazyLoad