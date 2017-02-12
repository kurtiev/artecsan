function uniqueSku(api) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {
            $(elem).blur(function (event) {
                if (ngModel.$viewValue) {
                    api.vendors_sku({
                        vendor_sku: ngModel.$viewValue,
                        vendor_id: scope.searchParams.vendor_id
                    }).then(function (res) {
                        if (!res.data.data) {
                            ngModel.$setValidity('unique', false);
                        } else {
                            ngModel.$setValidity('unique', true);
                        }

                    }, function (e) {
                        console.log(e);
                    });
                }
            })
        },
        scope: {
            searchParams: '='
        }
    };
}

angular
    .module('inspinia')
    .directive('uniqueSku', ['api', uniqueSku]);