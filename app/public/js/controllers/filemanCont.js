'use strict';

dashboardApp.controller('filemanCont', function ($scope, itRequestService) {

    $scope.nothingselected = true;

    $scope.select = function(fi) {
        $scope.selected[fi] = !$scope.selected[fi];
        if ($scope.filemanstatus === 'attachto') {
            $scope.nothingselected = !$scope.selected[fi];
            if ($scope.selected[fi]) {
                for (var i in $scope.selected) {
                    if (i != fi && $scope.selected[i]) {
                        $scope.selected[i] = false;
                    }
                }
            }
        }
    }

    $scope.managefiles = function(whattodo) {
        var callback = function(dir) {
            if($scope.filemanstatus === 'installDataBase') {
                window.location.href = '/';
            } else {
                $scope.selected = {};
                $scope.dir = dir;
                for (var fi in dir) {
                    $scope.selected[dir[fi]] = false;
                }
            }
        }
        if (whattodo === 'upload') {
            var fd = new FormData();
            fd.append('file', $scope.uploadme);
            fd.append('filename', $('#filename').val());
            if($scope.filemanstatus == 'installDataBase') {
                itRequestService.uploadto('admin/import', fd, callback);
            } else {
                itRequestService.uploadto('fileman/' + whattodo, fd, callback);
            }
        } else if (whattodo === 'dir' || whattodo === 'removeall') {
            itRequestService.managefiles(whattodo, {}, callback);
        } else if (whattodo === 'remove' ||  whattodo === 'download') {
            var filename = [];
            for (var fi in $scope.selected) {
                if ($scope.selected[fi]) {
                    filename.push(fi);
                }
            }
            if (filename.length > 0) {
                itRequestService.managefiles(whattodo, {'filename' : filename}, whattodo === 'remove' ? callback : false);
            } else {
                //TODO alert
            }
        } else if (whattodo === 'attachto') {
            var filename = '';
            for (var fi in $scope.selected) {
                if ($scope.selected[fi]) {
                    filename = fi;
                    $scope.selected[fi] = false;
                    itRequestService.managefiles(whattodo, {'filename' : filename, 'requestid' : $scope.requestid, 'attachmentid' : $scope.attachmentid}, false);
                }
            }
        }
    }

    $scope.uploadme = {name:''};

    $scope.$watch('uploadme.name', function(){
        $('#filename').val($scope.uploadme.name);
    });

    $('#fileman').on('show.bs.modal', function () {
      if ($scope.filemanstatus === 'attachto' || $scope.filemanstatus === 'managefiles') {
          for (var i in $scope.selected) {
              if ($scope.selected[i]) {
                  $scope.selected[i] = false;
                  $scope.$apply();
              }
          }
      }
      //TODO set focus $('#myInput').focus()
    });
});
