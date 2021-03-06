'use strict';

var selectedRequestId= -1;
var requestStatus = ['ثبت شده','در دست اقدام','خاتمه يافته','متوقف شده'];

dashboardApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/primary', {
      templateUrl: 'itRequest/panelPrimary'
    })
    .when('/success', {
      templateUrl: 'itRequest/panelSuccess'
    })
    .when('/action', {
      templateUrl: 'itRequest/panelAction'
    })
  }]);
  
dashboardApp.controller('dashboardCont', function ($scope, itRequestService) {
    $scope.pageid = 1;
    $scope.isCreator = null;
    $scope.hidetable =  false;
    $scope.hiderequest = true;
    $scope.showConfig = false;
    
    $scope.setpageid = function (pid) {
        $scope.pageid = pid;
    };
    
    $scope.newrequestclick = function (id) {
        $scope.requestLevel = 0;
        $scope.isCreator = true;
        var date = new Date();
        $scope.data ={ description : "" , requestitems : [] } //owner for IT Requeststs
        $scope.data.initdate = gregorianToJalali(date, '/');
        var minutes = date.getMinutes();
        minutes = (minutes===0) ? ('00') : (minutes<10 ? ('0' + minutes) : minutes);
        $scope.data.inittime = date.getHours() + ':' + minutes;
        $scope.data.applicant = $scope.currentUserFullName;
        $scope.hidetableclick();
    };

    $scope.viewrequestclick = function (id) {
        $scope.readonly = true; 
        $scope.openrequestclick(id);
    };
    
    $scope.openrequestclick = function (id) {
        $scope.hidetableclick();
        $scope.setpageid(1);
    };
    
    $scope.toggleconfig = function () {
        $scope.showConfig = !$scope.showConfig;
    }
    
    $scope.hidetableclick = function () {
        $scope.hidetable =  true;
        $scope.hiderequest = false;
        $scope.showConfig = false;
    };
     
    $scope.backclick = function (id) {
        $scope.data = {};
        selectedRequestId = -1;
        $scope.isCreator = null;
        $scope.$emit('refereshnavbar');
        $scope.hidetable =  false;
        $scope.hiderequest = true;
    };
    
    $scope.deleterequest =function () {
        itRequestService.deleterequest($scope.backclick);
    }
    
    $scope.$on('topnavClick', function(event){
        $scope.data = {};
        selectedRequestId = -1;
        $scope.isCreator = null;
        if ($scope.hidetable) {
            $scope.hidetable =  false;
            $scope.hiderequest = true;
        }
    });
    
    $scope.updaterequest = function() {
        if ($scope.requestLevel>0) {
          $scope.message = 'به روز رسانی....';
          itRequestService.updaterequest(function () {setTimeout(function(){$scope.message = ''; $scope.$apply();}, 300);}, $scope.data);
        }
    };
    
    $scope.insertbtnclick = function (id) {
        itRequestService.insertrequest(function () {$scope.backclick(id);}, $scope.data);
    }
    
    $scope.updatestatus = function (id) {
        $scope.data.status = requestStatus[id];
        var date = new Date();
        $scope.data.actiondate = gregorianToJalali(date , '/');
        var minutes = date.getMinutes();
        minutes = (minutes===0) ? ('00') : (minutes<10 ? ('0' + minutes) : minutes);
        $scope.data.actiontime = date.getHours() + ':' + minutes;
        itRequestService.updatestatus(function () {$scope.backclick(id);}, $scope.data);
    }
    
    $scope.setUserIdName = function(index, val) {
        $scope.data.applicant = val;
    }
    
    var getdataCallback = function(data) {
        $scope.requestLevel = 1 + requestStatus.indexOf(data.status);
        //data binding
        $scope.data = data;
        $scope.isCreator = data.isCreator;
        for (var task in $scope.tasks) {
            if (null!=$scope.data.requesttasks && $scope.data.requesttasks.indexOf($scope.tasks[task].name) > -1) {
                $scope.tasks[task].selected = true;
            } else {
                $scope.tasks[task].selected = false;
            }
        }
        $scope.data.actionuser = $scope.currentUserFullName;
        if ($scope.requestLevel === 3) {
            $scope.data.actiondate = $scope.data.enddate;
            $scope.data.actiontime = $scope.data.endtime;
            $scope.data.actionuser = $scope.data.enduser;
        }
        if ($scope.requestLevel === 4) {
            $scope.data.actiondate = $scope.data.canceldate;
            $scope.data.actiontime = $scope.data.canceltime;
            $scope.data.actionuser = $scope.data.canceluser;
            $scope.data.cancelwhy  = $scope.data.actiondescription;
        }
    }
    
    $(function () {
        $('#requestsTable').on('all.bs.table', function (e, name, args) {
            //console.log('Event:', name, ', data:', args);
        })
        .on('click-row.bs.table', function (e, row, $element) {
        })
        .on('dbl-click-row.bs.table', function (e, row, $element) {
        })
        .on('check.bs.table', function (e, row) {
            selectedRequestId = row.id;
            itRequestService.getdata(getdataCallback);
        })
        .on('uncheck.bs.table', function (e, row) {
        })
        .on('load-success.bs.table', function (e, data) {
        })
        .on('load-error.bs.table', function (e, status) {
        })
        .on('column-switch.bs.table', function (e, field, checked) {
        })
        .on('page-change.bs.table', function (e, number, size) {
        })
        .on('search.bs.table', function (e, text) {
        });
    });
});

function rowStyle(row, index) {
  var rowRequestStatus = requestStatus.indexOf(row.status);
  var classes = ['active', 'info', 'success', 'danger'];
  if (rowRequestStatus>-1) {
    return {
      classes: classes[rowRequestStatus]
      };
  };
  return {};
}
