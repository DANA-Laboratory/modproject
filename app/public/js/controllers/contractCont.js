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

    $scope.contractuserlogin = function() {
        itRequestService.getusers(function(data) {
            $scope.users = [];
            for (var itm in data) {
                if (data[itm].isGuest || data[itm].isTeacher) {
                    $scope.users.push(data[itm]);
                }
            }
            $scope.selectedmelicode = $scope.data.useritems.melicode;
        });
    };

    $scope.setmelicode = function(item) {
        $scope.selectedmelicode = item.melicode;
        $scope.data.owneritems.name = item.name;
        $scope.data.owneritems.family = item.family;
        /*TODO somthing with selected teacher*/
    }

    $scope.addguestuser = function() {
        var mc = $scope.data.useritems.melicode;
        if (mc) {
            if($scope.selectedmelicode !== mc)
            {
                if (String(mc).length===10 && !isNaN(mc)) {
                    var data = {};
                    data.username=mc;
                    data.password=mc;
                    data.defaultpass=mc;
                    data.melicode=mc;
                    data.isGuest=1;
                    itRequestService.douser(data, $scope.contractuserlogin, 'insert');
                }
                else
                    alert('کد ملی باید یک عدد 10 رقمی باشد');
            }
            else
                alert('کاربر مورد نظر وجود دارد!');
        }
        else
            alert('ورود کد ملی الزامی است');
    }

    var teacherexists = function() {
        var mc = $scope.data.useritems.melicode;
        if (mc) {
            if (String(mc).length===10 && !isNaN(mc)) {
                var itm=0;
                console.log($scope.users[0]);
                while (itm < $scope.users.length && String($scope.users[itm].melicode) !== String(mc)) {
                    itm+=1;
                }
                if (itm < $scope.users.length) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
        return -1;
    }

    $scope.removeguestuser = function() {
        var te = teacherexists();
        if (te === 1) {
            var data = {};
            data.username = $scope.selectedmelicode;
            $scope.data.useritems.melicode = "";
            itRequestService.douser(data, $scope.contractuserlogin, 'delete');
        } else {
            if (te === 0) {
                alert('کاربر مورد نظر وجود ندارد!');
            } else {
                alert('ورود کد ملی بصورت یک عدد 10 رقمی الزامی است');
            }
        }
    }

});
