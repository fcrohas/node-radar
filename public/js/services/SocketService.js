var nodeRadar = angular.module('ServiceModule', []);

nodeRadar.factory('SocketService', ['$rootScope','$location', function ($rootScope,$location) {
  var socket = io.connect($location.protocol()+'://'+$location.host()+':'+$location.port()+'/socket/flight');

  // Otherwise use custom update
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        //$rootScope.$apply(function () {
          callback.apply(socket, args);
        //});
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        //$rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        //});
      });
    }
  };
}]);