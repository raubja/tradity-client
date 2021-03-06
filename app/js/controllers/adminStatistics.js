(function() { 'use strict';

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

angular.module('tradity').
  controller('AdminStatisticsCtrl', function($scope, $stateParams, $state, $interval, $location, asyncLoadJS, socket) {
    $scope.ticksStatistics = [];
    $scope.ticksStatisticsΔ = [];
    $scope.startTimespanOffsetDays = 10;
    $scope.endTimespanOffsetDays = -1;
    $scope.userlist = [];
    $scope.servers = [];
    
    $scope.loadTickStatistics = function() {
      socket.get('/activity/ticks').then(function(result) {
        if (!result._success)
          return;
        
        $scope.ticksStatistics = result.data.sort(function(a, b) { return a.timeindex - b.timeindex; });
        $scope.ticksStatisticsΔ = [];
        
        for (var i = 0; i < $scope.ticksStatistics.length - 1; ++i) {
          var a = $scope.ticksStatistics[i], b = $scope.ticksStatistics[i+1];
          
          var dt = b.timeindex - a.timeindex;
          var tickdiff = Math.max(b.ticksum / b.tickcount - a.ticksum / a.tickcount, 0);
          
          tickdiff = tickdiff / (b.timeindex - a.timeindex);
          
          $scope.ticksStatisticsΔ.push({time: a.timeindex, tickdiff: tickdiff});
        }
        
        $scope.draw();
      });
    };
    
    socket.get('/users').then(function(result) {
      if (result._success) {
        $scope.userlist = result.data;
        
        $scope.drawRegistrations();
      }
    });
    
    var graph;
    
    $scope.showQContexts = {};
    $scope.qctxDebug = false;
    
    $scope.$watch('startTimespanOffsetDays', function() { $scope.draw(); });
    $scope.$watch('endTimespanOffsetDays', function() { $scope.draw(); });
    
    $scope.curPlot = null;
    $scope.draw = function() {
      var now = new Date().getTime() / 1000;
      var startOfToday = now - now % 86400;
      var tmax = $scope.endTimespanOffsetDays == -1 ? now : startOfToday - $scope.endTimespanOffsetDays * 86400;
      var tmin = startOfToday - $scope.startTimespanOffsetDays * 86400;
      
      var vmin = 1/0,vmax=0;

      var data = $.map($.grep($scope.ticksStatisticsΔ, function(e) {
        return tmin <= e.time && e.time < tmax;
      }), function(e) {
        if (e.tickdiff < vmin) vmin = e.tickdiff;
        if (e.tickdiff > vmax) vmax = e.tickdiff;
        return [[e.time * 1000, e.tickdiff * 3600]];
      });
      
      vmin *= 3600;
      vmax *= 3600;
      tmin *= 1000;
      tmax *= 1000;
      
      var vcenter = (vmin + vmax) / 2;
      var vdiff = (vmax - vcenter) * 1.30;
      
      if (!data || data.length === 0)
        return;

      if ($scope.curPlot)
        $scope.curPlot.destroy();
      
      $scope.curPlot = $.jqplot('chart', [data], {
        title: 'Tickrate',
        axes: {
          xaxis: {
            renderer: $.jqplot.DateAxisRenderer,
            min: tmin,
            max: tmax,
            tickRenderer: $.jqplot.CanvasAxisTickRenderer,
            tickOptions: {
              angle: -30,
              formatString: '%d.%m, %R',
            }
          },
          yaxis: {
            min: vcenter - vdiff,
            max: vcenter + vdiff,
            tickOptions: {
              formatString: '%.2f Ticks/h'
            }
          }
        },

        grid:{
          background:'#fff',
          borderColor:'#F3F3F3',
          gridLineColor:'#F3F3F3',
          borderWidth:1,
          shadow:false,
        },
        highlighter: {
          show: true,
          sizeAdjust: 2
        },
        cursor: {
          show: true,
          zoom: true
        },
        shadow: false,
        shadowAlpha: 1,
        series: [
          {
            showMarker: true,
            markerOptions: { style: 'circle', size: 2 },
            shadow:false
          }
        ]
      });
    };
    
    $scope.regPlot = null;
    $scope.drawRegistrations = function() {
      var registerDays = {};
      var tmin = new Date().getTime() / 1000, tmax = 0;
      
      for (var i = 0; i < $scope.userlist.length; ++i) {
        var rtime = $scope.userlist[i].registertime;
        if (!rtime)
          continue;
        
        var d = rtime - rtime % 86400;
        
        if (registerDays[d])
          registerDays[d]++;
        else
          registerDays[d] = 1;
        
        if (d < tmin) tmin = d;
        if (d > tmax) tmax = d;
      }
      
      var rmax = 0;
      var data = [];
      for (var day in registerDays) {
        if (registerDays[day] > rmax)
          rmax = registerDays[day];
        
        data.push([day * 1000, registerDays[day]]);
      }
      
      tmin *= 1000;
      tmax *= 1000;
      
      if (!data || data.length === 0)
        return;

      if ($scope.regPlot)
        $scope.regPlot.destroy();
      
      $scope.regPlot = $.jqplot('regchart', [data], {
        title: 'Registrierungen',
        axes: {
          xaxis: {
            renderer: $.jqplot.DateAxisRenderer,
            min: tmin,
            max: tmax,
            tickRenderer: $.jqplot.CanvasAxisTickRenderer,
            tickOptions: {
              angle: -30,
              formatString: '%d.%m, %R',
            }
          },
          yaxis: {
            min: 0,
            max: rmax * 1.15,
            tickOptions: {
              formatString: '%d Registrierungen'
            }
          }
        },

        grid:{
          background:'#fff',
          borderColor:'#F3F3F3',
          gridLineColor:'#F3F3F3',
          borderWidth:1,
          shadow:false,
        },
        highlighter: {
          show: true,
          sizeAdjust: 2
        },
        cursor: {
          show: true,
          zoom: true
        },
        shadow: false,
        shadowAlpha: 1,
        series: [
          {
            showMarker: true,
            markerOptions: { style: 'circle', size: 2 },
            shadow:false
          }
        ]
      });
    };
  });

})();
