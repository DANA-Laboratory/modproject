'use strict';

dashboardApp.controller('filemanCont', function ($scope, itRequestService) {
    $scope.managefiles = function(whattodo) {
        var callback = function(dir) {
            if($scope.installDataBase) {
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
            if($scope.installDataBase) {
                itRequestService.uploadto('admin/import', fd, callback);
            } else {
                itRequestService.uploadto('users/' + whattodo, fd, callback);
            }
        } else if (whattodo === 'dir' || whattodo === 'removeall') {
            itRequestService.managefiles('users/' + whattodo, {}, callback);
        } else if (whattodo === 'remove' ||  whattodo === 'download') {
            var filename = [];
            for (var fi in $scope.selected) {
                if ($scope.selected[fi]) {
                    filename.push(fi);
                    $scope.selected[fi] = false;
                }
            }
            if (filename.length > 0) {
                itRequestService.managefiles('users/' + whattodo, {'filename' : filename}, whattodo === 'remove' ? callback : false);
            } else {
                //TODO alert
            }
        } else if (whattodo === 'attach') {

        }
    }

    $scope.uploadme = {name:''};

    $scope.$watch('uploadme.name', function(){
        $('#filename').val($scope.uploadme.name);
    });
});
