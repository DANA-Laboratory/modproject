'use strict';

dashboardApp.controller('itemCont', function ($scope, itRequestService) {

     var itemsclass = '';
     var selecteditemid = -1;
     $scope.newitem = '';
     $scope.selecteditem = '';
   
    $scope.itemsclass = function(itmcls) {
      if (itmcls!==null) {
        itemsclass=itmcls;
      }
      if ($scope.showConfig) {
        return itemsclass;
      } else {
        return "";
      }
    }
    
    $scope.toggleselection = function (indx) {
        selecteditemid = indx;
        var item =  $scope.useritems[selecteditemid].name;
        if ($scope.itemsclass(null)==='glyphicon-minus') {
          itRequestService.doitem($scope.useritems[selecteditemid], 'delete');
          $scope.useritems.splice(selecteditemid, 1);
          return;
        } else {
          if ($scope.itemsclass(null)==='glyphicon-pencil') {
            $scope.selecteditem = $scope.useritems[selecteditemid].name;
            $('#editRequestModal').modal('show');
            return;
          }
        };
        var idx = $scope.data.useritems.indexOf(item);
        // is currently selected
        if (idx > -1) {
          $scope.data.useritems.splice(idx, 1);
        }
        // is newly selected
        else {
          $scope.data.useritems.push(item);
        }
        if ($scope.requestLevel>0) {
          $scope.updaterequest();
        }
    };
    
    $scope.updateselecteditem = function() {
        $scope.useritems[selecteditemid].name = $scope.selecteditem;
        itRequestService.doitem($scope.useritems[selecteditemid], 'update');
        selecteditemid = -1;
        $('#editRequestModal').modal('hide');
    };
        
    $scope.addnewitem = function() {
        var item = { name : $scope.newitem, itemType : 1 }
        selecteditemid = -1;
        itRequestService.doitem(item, 'insert', function(data){
            item.id = data.lastID; 
            $scope.useritems.push(item);
        });
        $('#addRequestModal').modal('hide');
    };
    
});