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
                    $scope.alert('کاربر مدرس تعریف شد.');
                } else {
                    $scope.alert('کد ملی باید ید عدد 10 رقمی باشد.');
                }
            }
            else
                $scope.alert('کاربر مورد نظر وجود دارد!');
        }
        else
            $scope.alert('ورود کد ملی الزامی است');
    }

    $scope.alert = function(message) {
        $scope.message = message;
        setTimeout(function(){$scope.message = ""; $scope.$apply();}, 2000);
    }

    var teacherexists = function(mc) {
        if (mc) {
            if (String(mc).length===10 && !isNaN(mc)) {
                var itm=0;
                while (itm < $scope.users.length && String($scope.users[itm].melicode) !== String(mc)) {
                    itm+=1;
                }
                if (itm < $scope.users.length) {
                    if ($scope.users[itm].isGuest && ($scope.users[itm].isTeacher + $scope.users[itm].isItUser + $scope.users[itm].isItAdmin + $scope.users[itm].isKarshenas + $scope.users[itm].isMaliUser + $scope.users[itm].isMaliAdmin + $scope.users[itm].isSysAdmin === 0)) {
                        return $scope.users[itm].id;
                    } else {
                        return -2;
                    }
                } else {
                    return 0;
                }
            }
        }
        return -1;
    }

    $scope.removeguestuser = function() {
        var teid = teacherexists($scope.data.useritems.melicode);
        if (teid > 0) {
            var data = {};
            data.id = teid;
            itRequestService.douser(data, $scope.contractuserlogin, 'delete');
            $scope.alert('کاربر حذف گردید');
            $scope.data.useritems.melicode='';
        } else {
            if (te === 0) {
                $scope.alert('کاربر مورد نظر وجود ندارد!');
            } else {
                if (te === -1) {
                    $scope.alert('ورود کد ملی بصورت یک عدد 10 رقمی الزامی است');
                } else {
                    $scope.alert('مجاز به حذف این کاربر نمیباشد');
                }
            }
        }
    }

});
