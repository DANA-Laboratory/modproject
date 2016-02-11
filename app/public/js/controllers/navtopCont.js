'use strict';

dashboardApp.controller('navbarCont', function ($scope, itRequestService) {

    $scope.requestStatus = ['ثبت شده','در دست اقدام','خاتمه يافته','متوقف شده'];
    $scope.isreceive = 1;
    $scope.requesttype = false;

    var activeid = null;

    var active = function (id) {
        var ac = ['btn-default','btn-default','btn-default','btn-default','btn-default','btn-default','btn-default','btn-default','btn-default','btn-default'];
        if (!isNaN(id)) {
            ac[id] = 'btn-info';
        }
        return ac
    }

    $scope.liclick = function (id) {
        if (id === "receive") {
            $scope.isreceive = 1;
        }
        if (id === "send") {
            $scope.isreceive = 0;
        }
        activeid = id;
        $scope.active = active(activeid);
        itRequestService.refreshTable(activeid, 'ALL', $scope.isreceive);
        $scope.$broadcast('topnavClick');
        $scope.requesttype= true;
    };

    $scope.active = active("receive");
    itRequestService.refereshnavbar(function(data) {$scope.ndata = data;});

    $scope.$on('refereshnavbar', function(event){
        itRequestService.refreshTable(activeid, 'ALL', $scope.isreceive);
        itRequestService.refereshnavbar(function(data) {$scope.ndata = data;});
    });

    $scope.accountsclick = function() {
        $('#accountsManegement').modal('show');
    };

    //get list of dates of current user statements
    $scope.malilogin = function() {
        itRequestService.getuserstatedates(function(data) {
            if (data.pids.length>0) {
                $scope.dates = data.dates;
                $scope.pids = data.pids;
                $scope.pid = $scope.pids[0];
                $scope.statedate = $scope.dates[$scope.dates.length-1];
                // default selection is newest
                $scope.selectedstatedate =  $scope.statedate;
                $scope.selectedpid =  $scope.pid;
            }
        });
    };

    $scope.contractuserlogin = function() {
        itRequestService.getusers(function(data) {
            $scope.users = [];
            for (var itm in data) {
                if (data[itm].isGuest || data[itm].isTeacher) {
                    $scope.users.push(data[itm]);
                }
            }
            $scope.selectedmelicode = $scope.melicode;
        });
    };

    //show state click
    $scope.openstate = function() {
        if($scope.selectedstatedate && ($scope.selectedstatedate === $scope.statedate))
            $scope.pdfcontent = itRequestService.openpdf({date : $scope.selectedstatedate, pid : $scope.selectedpid}, function(pdfcontent) {$scope.pdfcontent = pdfcontent; $scope.requesttype = 'statement';}, 'statement');
        else
            alert('فیش حقوقی در تاریخ ' + $scope.statedate + ' وجود ندارد.');
    };

    //typeaheads-on-select
    $scope.setdate = function(item) {
        $scope.selectedstatedate = item;
    }

    $scope.setpid = function(item) {
        $scope.selectedpid = item;
    }

    $scope.setmelicode = function(item) {
        $scope.selectedmelicode = $scope.melicode;
        /*TODO somthing with selected teacher*/
    }

    $scope.addguestuser = function() {
        if ($scope.melicode) {
            if($scope.selectedmelicode !== $scope.melicode)
            {
                if (String($scope.melicode).length===10 && !isNaN($scope.melicode)) {
                    var data = {};
                    data.username=$scope.melicode;
                    data.password=$scope.melicode;
                    data.defaultpass=$scope.melicode;
                    data.melicode=$scope.melicode;
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
        if ($scope.melicode) {
            if (String($scope.melicode).length===10 && !isNaN($scope.melicode)) {
                var itm=0;
                console.log($scope.users[0]);
                while (itm < $scope.users.length && String($scope.users[itm].melicode) !== String($scope.melicode)) {
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
            data.username=$scope.melicode;
            $scope.melicode="";
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
