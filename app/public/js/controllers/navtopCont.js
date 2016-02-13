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
 });
