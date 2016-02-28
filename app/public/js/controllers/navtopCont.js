'use strict';

dashboardApp.controller('navbarCont', function ($scope, itRequestService) {

    $scope.requestStatus = ['ثبت شده','در دست اقدام','خاتمه يافته','متوقف شده'];
    $scope.isreceive = 1;
    $scope.pageroute = "intro";

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
        $scope.pageroute = "dashboard";
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
            if (data.dates.length>0) {
                $scope.dates = data.dates;
                $scope.selectedstatedate = $scope.dates[$scope.dates.length-1];
                // default selection is newest
            }
            if (data.pids.length>0) {
                $scope.pids = data.pids;
                $scope.pid = $scope.pids[0];
                $scope.selectedpid =  $scope.pid;
            }
        });
    };

    //show state click
    $scope.openstate = function() {
        if($scope.selectedstatedate && $scope.selectedpid)
            $scope.pdfcontent = itRequestService.openpdf({date : $scope.selectedstatedate, pid : $scope.selectedpid}, function(pdfcontent) {$scope.pdfcontent = pdfcontent; $scope.pageroute = 'statement';}, 'statement');
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

    $scope.dir = function() {
    }

    $scope.managefiles = function(whattodo) {
        var callback = function(dir) {
            if($scope.installDataBase) {
                window.location.href = '/';
            } else {
                $scope.dir = dir;
            }
        }
        if (whattodo === 'upload') {
            var fd = new FormData();
            fd.append('file', $scope.uploadme);
            fd.append('filename', $('#filename').val());
            if($scope.installDataBase) {
                itRequestService.managefiles('admin/import', fd, callback);
            } else {
                itRequestService.managefiles('users/' + whattodo, fd, callback);
            }
        } else if (whattodo === 'dir') {
            $scope.selected = {};
            itRequestService.managefiles('users/dir', {}, function(dir) {
                $scope.dir = dir;
                for (var fi in dir) {
                    $scope.selected[dir[fi]] = false;
                }
            });
        } else if (whattodo === 'download') {

        } else if (whattodo === 'remove') {
            var filename = [];
            for (var fi in $scope.selected) {
                if ($scope.selected[fi]) {
                    filename.push(fi)
                }
            }
            itRequestService.managefiles('users/' + whattodo, filename, callback);
        } else if (whattodo === 'attach') {

        }
    }

    $scope.uploadme = {name:''};

    $scope.$watch('uploadme.name', function(){
        $('#filename').val($scope.uploadme.name);
    });
 });
