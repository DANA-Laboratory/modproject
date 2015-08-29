'use strict';

dashboardApp.controller('usermanCont', function ($scope, itRequestService) {
    
    $scope.onLoad = function() {
        itRequestService.getusers(function(data) {
          $scope.users = data; 
          $scope.gotouser(0);
        });
    }
    
    $scope.setUser = function(item) {
        $scope.gotouser($scope.users.indexOf(item));
    }
    
    $scope.gotouser = function(index) {
        $scope.selectedUserIndex = index;
        //copy object
        $scope.selectedUser = JSON.parse(JSON.stringify($scope.users[index]));
        $scope.updateclass = 'disabled';
    }
    
    $scope.insertuser = function() {
        $scope.selectedUser = {'name':'', 'family':'', 'username':'', 'email':''};
        $scope.selectedUserIndex = $scope.users.length;
        $scope.updateclass = 'disabled';
    }
    
    $scope.deleteuser = function() {
        var data = {};
        if ($scope.selectedUser.id) {
            data.id = $scope.selectedUser.id;
            itRequestService.douser(data, $scope.onLoad, 'delete');
        }
        $scope.updateclass = 'disabled';
    }
    
    $scope.updateuser = function() {
        var data = {};
        data.account = $scope.selectedUser;
        if ($scope.selectedUser.id) {
          data.id = $scope.selectedUser.id;
          itRequestService.douser(data, $scope.onLoad, 'update');
        } else {
          itRequestService.douser(data, $scope.onLoad, 'insert');
        }
        $scope.updateclass = 'disabled';
    }
    
    $scope.updateclass = 'disabled';
    $scope.selectedUser = {};
    $scope.selected = undefined;
    $scope.users = [];
    $scope.selectedUserIndex = 0;
 });
