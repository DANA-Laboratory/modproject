dashboardApp.controller('contractCont', function ($scope, itRequestService) {
    $scope.setmodat = function() {
        if (typeof $scope.data.useritems.startdate !== 'undefined' && typeof $scope.data.useritems.enddate !== 'undefined') {
            $scope.data.useritems.moddat = datediff($scope.data.useritems.startdate, $scope.data.useritems.enddate);
            return $scope.data.useritems.moddat;
        }
        return '';
    }

    $scope.setmablagh = function() {
        if ($scope.data.useritems.mablagh) {
            $scope.data.useritems.mablaghword = adad($scope.data.useritems.mablagh);
            return $scope.data.useritems.mablaghword;
        }
        return '';
    }
});
