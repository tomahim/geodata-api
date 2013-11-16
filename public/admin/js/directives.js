app.factory('MessageAPI', function() {
    return {
        status: null,
        message: null,
        success: function(msg) {
            this.status = 'success';
            this.message = msg;
        },
        error: function(msg) {
            this.status = 'error';
            this.message = msg;
        },
        clear: function() {
            this.status = null;
            this.message = null;
        }
    }
});

app.directive('message', function() {
    return {
        restrict: 'E',
        scope: {
            timeout: "@timeout",
            close : "@close"
        },
        replace: true,
        controller: function($scope, MessageAPI) {
            $scope.show = false;
            $scope.messageM = MessageAPI;

            $scope.$watch('messageM.status', toggledisplay);
            $scope.$watch('messageM.message', toggledisplay);

            $scope.$on('$routeChangeStart', function(event, next, current) {
                $scope.hide();
            });

            $scope.hide = function() {
                $scope.show = false;
                $scope.messageM.clear();
            };

            function toggledisplay() {
                if(!!($scope.messageM.status && $scope.messageM.message)) {
                    $scope.show = true;
                }
                handleTimeout();
            }

            function handleTimeout() {
                var timeout = $scope.timeout || null;
                if(timeout && $scope.show) {
                    setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.hide();
                        });
                    }, timeout);
                }
            }
        },
        template: '<div class="alert alert-{{messageM.status}}" ng-show="show">' +
            '  <button type="button" ng-show="close" class="close" ng-click="hide()">&times;</button>' +
            '  <strong>{{messageM.message}}</strong>' +
            '</div>'
    }
});

app.directive('svg', function() {
    return {
        controller: function($scope, $attrs, D3) {
            D3.contructGraph($attrs.svg);
            $scope.graphName = $attrs.svg;
        },
        template: '<svg class="chart {{graphName}}"></svg>'
    }
});