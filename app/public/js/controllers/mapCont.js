'use strict';

dashboardApp.controller('mapCont', function ($scope, itRequestService) {
    var iranmap = Snap('#iranmap');
    var toggle = '';
    $scope.panelinfo = {title: 'tile', body: 'body', footer: 'footer'};
    $scope.hidelabels = true;
    $scope.hidepanel = true;
    var branchesinfo = {};
    var connectionvline = null;
    var connectionhline = null;
    //iranmap.attr({ viewBox : "0 0 1400 1250", width : 700, height : 625 });
    var hoverin = function () {
      if (toggle === '') {
        this.animate({opacity:1.0, r:15}, 800, mina.elastic);
        connectionvline = iranmap.line(parseInt(this.attr().cx) + 17, parseInt(this.attr().cy), parseInt(this.attr().cx) + 17, 202);
        connectionhline = iranmap.line(parseInt(this.attr().cx) + 17, 202, 402, 202);
        connectionvline.attr({
            stroke: "#000",
            opacity: '0.3',
            strokeWidth: 3
        });        
        connectionhline.attr({
            stroke: "#000",
            opacity: '0.3',
            strokeWidth: 3
        });
        $scope.panelinfo = branchesinfo[this.id];
        $scope.hidepanel = false;
        $scope.$apply();
      }
    };
    var hoverout = function () { 
      if (toggle === '') {
        this.stop(); 
        this.animate({opacity:0.5, r:10}, 200, mina.easeout);
        $scope.hidepanel = true;
        $scope.$apply();
        connectionvline.remove();
        connectionhline.remove();
      }
    };
    var togglebranch= function () { 
      //user must click on toggled item to untoggle
      if (toggle === this.id)
        toggle = '';
      else
        if (toggle === '')
          toggle = this.id;
    };
    var animateIndex = 0;
    var branches = [];
    function animOn(){
      if (animateIndex < branches.length) {
        branches[animateIndex].animate({
          opacity: '1',  
            r: 15
        }, 800, mina.elastic, animOut);
      } else {
        $scope.hidelabels = false;
        $scope.$apply();
        for (var i in branches) {
          branches[i].hover(hoverin, hoverout);//  
          branches[i].click(togglebranch);
        }
      }
    }
    function animOut() {
      branches[animateIndex].animate({
          opacity: '0.5',  
          r: 10
       }, 400, mina.easeout, animOn);
       animateIndex++;
    };
    Snap.load("images/iran.svg", function (f) {
      var allPaths = f.selectAll('path').attr({opacity:0.0});
      var index = 0;
      var max = allPaths.items.length - 1;
      var recursive = function () {
        if (index<max) {
          index++;
          allPaths[index].animate({opacity:1.0}, 20, mina.easeout, recursive);
        } else {
          allPaths[index].animate({opacity:1.0}, 20, mina.easeout, itRequestService.getcities(function (cities) {
            $scope.cities = cities;
            for(var i in cities) {
              var branch = iranmap.circle(cities[i].x, cities[i].y, 0);
              branchesinfo[branch.id] = JSON.parse(cities[i].info);
              branch.attr({
                  fill: "#bada55",
                  stroke: "#000",
                  opacity: '0.0',
                  strokeWidth: 4
              });
              branches.push(branch);
            }
            animOn();
          }));
        }
      }
      allPaths[index].animate({opacity:1.0}, 20, mina.easeout, recursive);
      iranmap.append(f);
      iranmap.append(Snap('#labels'));
    });

});