(function () {

    "use strict";

    var alertService = function (SweetAlert) {

        var appServiceFactory = {};

        appServiceFactory.showAlertTimeout = function () {

            SweetAlert.swal({
                title: 'Session timeout',
                text: 'Your session is expired.'
            });
        };

        appServiceFactory.showSuccessText = function (title, text) {
            SweetAlert.swal({
                title: title || 'Successful',
                text: text,
                type: "success"
            });
        };


        appServiceFactory.showAlertSave = function (title, text) {
            SweetAlert.swal({
                title: 'Saved',
                type: "success",
                showConfirmButton: false,
                timer: 1000
            });
        };

        appServiceFactory.showAlertExtendedDate = function (title, text) {
            SweetAlert.swal({
                title: 'Date extended',
                type: "success",
                showConfirmButton: false,
                timer: 1000
            });
        };

        appServiceFactory.showAPIError = function (err) {
            SweetAlert.swal({
                title: err.message,
                showConfirmButton: false,
                type: "error",
                timer: 3000
            });
        };

        appServiceFactory.showError = function (title) {
            SweetAlert.swal({
                title: title,
                showConfirmButton: false,
                type: "error",
                timer: 3000
            });
        };

        return appServiceFactory;
    };

    alertService.$inject = ['SweetAlert'];
    angular.module('inspinia').factory('alertService', alertService);

})();
