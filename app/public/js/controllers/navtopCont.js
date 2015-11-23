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
    
    //show state click
    $scope.openstate = function() {
        if($scope.selectedstatedate===$scope.statedate)
            alert($scope.selectedstatedate);
        else
            alert('فیش حقوقی در تاریخ ' + $scope.statedate + ' وجود ندارد.')
    };      
    
    //typeahead-on-select
    $scope.setdate = function(item) {
        $scope.selectedstatedate = item;
    }   
    
 });