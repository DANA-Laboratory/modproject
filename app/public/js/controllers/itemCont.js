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
        var item =  $scope.requestItems[selecteditemid].name;
        if ($scope.itemsclass(null)==='glyphicon-minus') {
          itRequestService.doitem($scope.requestItems[selecteditemid], 'delete');
          $scope.requestItems.splice(selecteditemid, 1);
          return;
        } else {
          if ($scope.itemsclass(null)==='glyphicon-pencil') {
            $scope.selecteditem = $scope.requestItems[selecteditemid].name;
            $('#editRequestModal').modal('show');
            return;
          }
        };
        var idx = $scope.data.requestitems.indexOf(item);
        // is currently selected
        if (idx > -1) {
          $scope.data.requestitems.splice(idx, 1);
        }
        // is newly selected
        else {
          $scope.data.requestitems.push(item);
        }
        if ($scope.requestLevel>0) {
          $scope.updaterequest();
        }
    };
    
    $scope.updateselecteditem = function() {
        $scope.requestItems[selecteditemid].name = $scope.selecteditem;
        itRequestService.doitem($scope.requestItems[selecteditemid], 'update');
        selecteditemid = -1;
        $('#editRequestModal').modal('hide');
    };
        
    $scope.addnewitem = function() {
        var item = { name : $scope.newitem, itemType : 1 }
        selecteditemid = -1;
        itRequestService.doitem(item, 'insert', function(data){
            item.id = data.lastID; 
            $scope.requestItems.push(item);
        });
        $('#addRequestModal').modal('hide');
    };
    
});