'use strict';

var dashboardApp = angular.module('dashboardApp', ['ngRoute', 'ngMask', 'ui.bootstrap']);
var socket = io();
 
socket.on('update', function(data) {
    console.log("need referesh...");
});
socket.on('error', console.error.bind(console));
socket.on('message', console.log.bind(console));

dashboardApp.service('itRequestService', function($http, $sce){
    
    this.requestitems = {};
    this.requesttasks = {};
    
    this.updatetasks = function(callback, tasks) {
      var selectedtasks = [];
      for (var task in tasks) {
        if (tasks[task].selected) {
            selectedtasks.push(tasks[task].name);
        }
      }  
      $http({
          method: 'post',
          url: '/data/updatetasks/' + selectedRequestId,
          data: {tasks: selectedtasks}
      }).success(function(data, status, headers, config) {
          console.log("tasks updated");
          callback();
      }).error(function(data, status, headers, config) {
          console.log("error update tasks");
      });
    };
    
    this.getcities = function(callback) {
      $http({
          method: 'GET',
          url: '/map/irancities'
      }).success(function(data, status, headers, config) {
          callback(data);
      }).error(function(data, status, headers, config) {
          console.log("error get side bar data");
      });
    };
    
    this.refereshnavbar = function(callback) {
      $http({
          method: 'GET',
          url: '/data/nsidebar'
      }).success(function(data, status, headers, config) {
          //data binding
          callback(data);
      }).error(function(data, status, headers, config) {
          console.log("error get side bar data");
      });
    };
    
    this.refreshTable = function (status) {
        if (null==status) {
            $('#requestsTable').bootstrapTable('refresh', {url: '/data/table/itrequest'});
        } else {
            $('#requestsTable').bootstrapTable('refresh', {url: '/data/table/itrequest/' + status});
        }
    }
    
    this.getdata = function (callback) {
        if (selectedRequestId!==-1) {
            $http({
                method: 'GET',
                url: '/data/' + selectedRequestId
            }).success(function(data, status, headers, config) {
                data.requestitems = JSON.parse(data.requestitems);
                callback(data);
            }).error(function(data, status, headers, config) {
                console.log("error get");
            });
        }
    };
  
    this.updatestatus = function (callback, data) {
        $http({
            method: 'post',
            url: '/data/updatestatus/' + selectedRequestId,
            data: data
        }).success(function(data, status, headers, config) {
            console.log("update status OK");
            callback();
        }).error(function(data, status, headers, config) {
            console.log("error update status");
        });
    };
    
    this.selectusercontracts = function (melicode, callback) {
        $http({
            method: 'GET',
            url: '/data/findcontract/' + melicode
        }).success(function(data, status, headers, config) {
            console.log("get user requests OK");
            callback(data);
        }).error(function(data, status, headers, config) {
            console.log("error get user requests");
        });
    };
    
    this.insertrequest = function (callback, data) {
        $http({
            method: 'post',
            url: '/data/insertrequest/',
            data: data
        }).success(function(data, status, headers, config) {
            console.log("insert request OK");
            callback();
        }).error(function(data, status, headers, config) {
            console.log("error insert request");
        });
    };
       
    this.updaterequest = function (callback, data) {
        $http({
            method: 'post',
            url: '/data/updaterequest/',
            data: data
        }).success(function(data, status, headers, config) {
            console.log("update request items OK");
            callback();
        }).error(function(data, status, headers, config) {
            console.log("error update request items");
        });
    };
    
    this.deleterequest = function (callback) {
        $http({
            method: 'post',
            url: '/admin/deleterequest/',
            data: {id: selectedRequestId}
        }).success(function(data, status, headers, config) {
            console.log("delete request OK");
            callback();
        }).error(function(data, status, headers, config) {
            console.log("delete request error");
        });
    };
    
    this.getusers = function (callback) {
        $http({
            method: 'get',
            url: '/admin/select/users/'
        }).success(function(data, status, headers, config) {
            callback(data);
        }).error(function(data, status, headers, config) {
            console.log("error get users list");
        });
    };
    
    this.douser = function (data, callback, whattodo) {
        $http({
            method: 'post',
            url: '/admin/user/' + whattodo,
            data: data
        }).success(function(data, status, headers, config) {
            console.log(whattodo + ' user account OK');
            callback();
        }).error(function(data, status, headers, config) {
            console.log('error ' + whattodo + ' user account');
        });
    };
    
    this.doitem = function (data, whattodo, callback) {
        $http({
            method: 'post',
            url: '/admin/item/' + whattodo,
            data: data
        }).success(function(data, status, headers, config) {
            console.log(whattodo + ' item OK');
            if(callback)
                callback(data);
        }).error(function(data, status, headers, config) {
            console.log('error ' + whattodo + ' item');
        });
    };    
    
    //open contract && statement
    this.openpdf = function (data, callback, userselect) {
        var addr = 'mali';
        if (userselect === 3) {
            addr = 'contract';
        }
        $http({
            method: 'post',
            url: '/' + addr + '/show/',
            responseType: 'arraybuffer',
            data: data
        }).success(function(data, status, headers, config) {
            var file = new Blob([data], {type: 'application/pdf'});
            var fileURL = URL.createObjectURL(file);
            callback($sce.trustAsResourceUrl(fileURL));
        }).error(function(data, status, headers, config) {
            console.log('error Open state');
        });
    };
    
    this.getuserstatedates = function (callback) {
        $http({
            method: 'get',
            url: '/mali/list/'
        }).success(function(data, status, headers, config) {
            callback(data);
        }).error(function(data, status, headers, config) {
            console.log("error get user state dates");
        });
    };
    
});
