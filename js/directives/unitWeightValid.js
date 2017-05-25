function unitWeightValid(SweetAlert) {
    "ngInject";

    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, elem, attr, ngModel) {
            $(elem).blur(function (event) {


                if (ngModel.$viewValue) {
                    var unitWeightFormula = ngModel.$viewValue.match(/\d+((,|\.)\d+)?/g);
                    var tareWeight = scope.$parent.i.tare_weight;

                    angular.forEach(unitWeightFormula, function (unitWeight) {

                        if (unitWeight < tareWeight) {
                            ngModel.$setValidity('unique', false);
                            SweetAlert.swal({
                                title: 'Error',
                                text: 'Each term must be greater than the tare weight = ' + tareWeight + '!' ,
                                showConfirmButton: false,
                                type: "error",
                                timer: 3000
                            });
                        } else {
                            ngModel.$setValidity('unique', true);
                            ngModel.$setPristine();
                        }
                    });
                } else {
                    ngModel.$setValidity('unique', true);
                    ngModel.$setPristine();
                    ngModel.$setUntouched();
                }
            })


        },
        scope: {
            model: '='
        }
    };
}

angular
    .module('inspinia')
    .directive('unitWeightValid', ['SweetAlert', unitWeightValid]);