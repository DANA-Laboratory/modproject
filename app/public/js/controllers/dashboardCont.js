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
    .when('/contractprimary', {
      templateUrl: 'contract/panelPrimary'
    })
    .when('/printpreview', {
      templateUrl: 'contract/panelPrintPreview'
    })
  }]);

dashboardApp.controller('dashboardCont', function ($scope, itRequestService) {
    $scope.pageid = 1;
    $scope.isCreator = null;
    // defult views per userselect
    $scope.hidetable =  false;
    $scope.hiderequest = true;
    $scope.showConfig = false;

    $scope.$on('opencontractclick', function (event, melicode) {
        itRequestService.selectusercontracts(melicode, function callback(data) {
            if(data.length > 0) {
                $scope.data = {};
                data[0].requestitems = JSON.parse(data[0].requestitems);
                data[0].requesttasks = JSON.parse(data[0].requesttasks);
                for(var key in data[0].requestitems) $scope.data[key]=data[0].requestitems[key];
                for(var key in data[0].requesttasks) $scope.data[key]=data[0].requesttasks[key];
                $scope.hidetableclick();
            } else {
                $scope.newrequestclick(melicode);
            }
        })
    });    

    $scope.setpageid = function (pid) {
        $scope.pageid = pid;
    };
    
    $scope.newrequestclick = function (id) {
        $scope.requestLevel = 0;
        $scope.isCreator = true;
        var date = new Date();
        $scope.data = {};
        $scope.data.initdate = gregorianToJalali(date, '/');

        if ($scope.userselect==1) {
            $scope.data.description = '';
            $scope.data.requestitems = [];
        }
        if ($scope.userselect==3) {
            var sd = $scope.data.initdate.split('/');
            $scope.data.enddate = parseInt(sd[0]) + 1 + '/' + sd[1] + '/' + sd[2];
            $scope.data.mablaghtype = 'ساعت آموزش';
            $scope.data.melicode = id;
            $scope.data.startdate = $scope.data.initdate;
        }        

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
     
    $scope.backclick = function () {
        if ($scope.userselect == 1) {
            $scope.data = {};
            selectedRequestId = -1;
            $scope.isCreator = null;
            $scope.$emit('refereshnavbar');
            $scope.hidetable =  false;
            $scope.hiderequest = true;
        } else {
            $scope.$parent.userselect = false;
        };
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
    
    $scope.insertbtnclick = function () {
        if ($scope.userselect==3) {
            $scope.data.moddat = $scope.getmodat();
            $scope.data.mablaghword = $scope.getmablagh();
            $scope.data.requesttype = 'contract';
        } else {
            $scope.data.requesttype = 'itrequest';
        }
        itRequestService.insertrequest($scope.backclick, $scope.data);
    }
    
    $scope.printbtnclick = function () {
        if ($scope.userselect==3) {
            $scope.data.moddat = $scope.getmodat();
            $scope.data.mablaghword = $scope.getmablagh();
            $scope.pdfcontent = itRequestService.openpdf($scope.data, function(pdfcontent) {$scope.pdfcontent = pdfcontent}, $scope.userselect);
        }
    }
    
    $scope.updatestatus = function (id) {
        $scope.data.status = requestStatus[id];
        var date = new Date();
        $scope.data.actiondate = gregorianToJalali(date , '/');
        var minutes = date.getMinutes();
        minutes = (minutes===0) ? ('00') : (minutes<10 ? ('0' + minutes) : minutes);
        $scope.data.actiontime = date.getHours() + ':' + minutes;
        itRequestService.updatestatus($scope.backclick, $scope.data);
    }
    
    $scope.setUserIdName = function(index, val) {
        $scope.data.applicant = val;
    }
    
    $scope.getmodat = function() {
        if ($scope.data) {
            var d = $scope.data.startdate.split('/');
            var id = jalaliToGregorian(parseInt(d[0]), parseInt(d[1]), parseInt(d[2]), '/');
            d = id.split('/'); 
            var idd = new Date(parseInt(d[0]), parseInt(d[1]), parseInt(d[2]), 0, 0, 0, 0);
            
            d = $scope.data.enddate.split('/');
            var ed = jalaliToGregorian(parseInt(d[0]), parseInt(d[1]), parseInt(d[2]), '/');
            d = ed.split('/');
            var edd = new Date(parseInt(d[0]), parseInt(d[1]), parseInt(d[2]), 0, 0, 0, 0);
            
            return Math.ceil((edd.getTime()-idd.getTime())/3600/24/1000);
        }
        return '';
    }
    
    $scope.getmablagh = function() {
        if ($scope.data) {
            if ($scope.data.mablagh) {
                return Adad($scope.data.mablagh);
            }
        }
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
