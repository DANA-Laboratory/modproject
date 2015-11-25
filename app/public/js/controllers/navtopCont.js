'use strict';

dashboardApp.controller('navbarCont', function ($scope, itRequestService) {
    
    $scope.requestStatus = requestStatus;
    var activeid = null;
    
    var active= function (id) {
        var ac = ['btn-default','btn-default','btn-default','btn-default','btn-default','btn-default','btn-default','btn-default','btn-default','btn-default'];
        activeid = null;
        if (id != null) {
            ac[id] = 'btn-info';
            activeid = id;
        }
        return ac
    }
    
    $scope.liclick = function (id) {
        $scope.active = active(id);
        itRequestService.refreshTable(id);
        $scope.$broadcast('topnavClick');
        $scope.userselect = 1;
    };
    
    $scope.active = active(null);
    itRequestService.refereshnavbar(function(data) {$scope.ndata = data;});
    
    $scope.$on('refereshnavbar', function(event){
        itRequestService.refreshTable(activeid);
        itRequestService.refereshnavbar(function(data) {$scope.ndata = data;});
    });
    
    $scope.accountsclick = function() {
        $('#accountsManegement').modal('show');
    }; 
    
    //get list of dates of current user statements
    $scope.maliuserlogin = function() {
        itRequestService.getuserstatedates(function(dates) {
            $scope.dates = dates;
            if ($scope.dates.length>0) {
                $scope.statedate = $scope.dates[$scope.dates.length-1];
                // default selection is newest
                $scope.selectedstatedate =  $scope.statedate;                
            }
        }); 
    };
    
    //show state click
    $scope.openstate = function() {
        if($scope.selectedstatedate && ($scope.selectedstatedate === $scope.statedate))
            $scope.pdfcontent = itRequestService.openuserstate({date : $scope.selectedstatedate}, function(pdfcontent) {$scope.pdfcontent=pdfcontent;});
        else
            alert('فیش حقوقی در تاریخ ' + $scope.statedate + ' وجود ندارد.')
    };      
    
    //typeahead-on-select
    $scope.setdate = function(item) {
        $scope.selectedstatedate = item;
    }   
    
 });