'use strict';

dashboardApp.controller('taskCont', function ($scope, itRequestService) {

    var itemsclass = "glyphicon-ok";
    $scope.newitem = '';
    var selecteditemid = -1;
    
    $scope.itemsclass = function(itmcls) {
      if (itmcls!==null) {
        itemsclass=itmcls;
      }
      if ($scope.showConfig) {
        return itemsclass;
      } else {
        return "glyphicon-ok";
      }
    }
    
    $scope.taskitemclick = function (id) {
        if ($scope.itemsclass(null) === "glyphicon-ok") {
          $scope.tasks[id].selected = true;
          $scope.message = 'به روز رسانی....';
          itRequestService.updatetasks(function () {setTimeout(function(){$scope.message = ''; $scope.$apply();}, 300);}, $scope.tasks);
        } else {
          if ($scope.itemsclass(null) === "glyphicon-minus") {
            itRequestService.doitem($scope.tasks[id], 'delete');
            $scope.tasks.splice(id,1);
          } else {
            if ($scope.itemsclass(null) === "glyphicon-pencil") {
              $scope.selecteditem = $scope.tasks[id].name;
              selecteditemid = id;
              $('#editTaskModal').modal('show');
            }
          }
        }
    };
    
    $scope.updateselecteditem = function() {
        console.log($scope.selecteditem);
        $scope.tasks[selecteditemid].name = $scope.selecteditem;
        itRequestService.doitem($scope.tasks[selecteditemid], 'update');
        selecteditemid = -1;
        $('#editTaskModal').modal('hide');
    };
    
    $scope.addnewitem = function() {
        var item = { name : $scope.newitem, itemType : 0 } 
        selecteditemid = -1;
        itRequestService.doitem(item, 'insert', function(data){
            item.id = data.lastID;
            $scope.tasks.push(item);
        });
        $('#addTaskModal').modal('hide');
    };
    
    $scope.selectedtaskitemclick = function (id) {
        $scope.tasks[id].selected = false;
        $scope.message = 'به روز رسانی....';
        itRequestService.updatetasks(function () {setTimeout(function(){$scope.message = ''; $scope.$apply();}, 300);}, $scope.tasks);
    };
    
    $scope.clearfilter = function () {
        $scope.filtertext = '';
        for (var item in $scope.tasks) {
            $scope.tasks[item].hide = false;
        }
    };
});