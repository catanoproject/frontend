require('angular');

angular.module('webApp').controller('blockchainController', ['$scope', '$timeout', '$rootScope', '$http', "userService", "$interval", 'blockService', 'blockModal', 'blockInfo', 'userInfo', 'ngTableParams', 'viewFactory',
    function ($rootScope, $timeout, $scope, $http, userService, $interval, blockService, blockModal, blockInfo, userInfo, ngTableParams, viewFactory) {
        $scope.view = viewFactory;
        $scope.view.page = {title: 'Blockchain', previos: null};
        $scope.view.bar = {showBlockSearchBar: true};
        $scope.address = userService.address;
        $scope.loading = true;
        $scope.showAllColumns = false;
        $scope.showFullTime = false;
        $scope.searchBlocks = blockService;
        $scope.countForgingBlocks = 0;

        //Blocks
        $scope.tableBlocks = new ngTableParams({
            page: 1,
            count: 25,
            sorting: {
                height: 'desc'
            }
        }, {
            total: 0,
            counts: [],
            getData: function ($defer, params) {
                $scope.loading = true;
                blockService.getBlocks($scope.searchBlocks.searchForBlock, $defer, params, $scope.filter, function () {
                    $scope.searchBlocks.inSearch = false;
                    $scope.countForgingBlocks = params.total();
                    $scope.loading = false;
                }, null, true);
            }
        });

        $scope.tableBlocks.settings().$scope = $scope;

        $scope.$watch("filter.$", function () {
            $scope.tableBlocks.reload();
        });

        $scope.updateBlocks = function () {
            $scope.tableBlocks.reload();
        };
        //end Blocks

        $scope.$on('updateControllerData', function (event, data) {
            if (data.indexOf('main.blockchain') != -1) {
                $scope.updateBlocks();
            }
        });

        $scope.blocksInterval = $interval(function () {
            $scope.updateBlocks();
        }, 1000 * 60);

        $scope.$on('$destroy', function () {
            $interval.cancel($scope.blocksInterval);
            $scope.blocksInterval = null;
        });

        $scope.showBlock = function (block) {
            $scope.modal = blockModal.activate({block: block});
        }

        $scope.blockInfo = function (block) {
            $scope.modal = blockInfo.activate({block: block});
        }

        $scope.userInfo = function (userId) {
            $scope.modal = userInfo.activate({userId: userId});
        }

        //Search blocks watcher
        var tempSearchBlockID = '',
            searchBlockIDTimeout;
        $scope.$watch('searchBlocks.searchForBlock', function (val) {
            if (searchBlockIDTimeout) $timeout.cancel(searchBlockIDTimeout);
            if (val.trim() != '') {
                $scope.searchBlocks.inSearch = true;
            }
            else {
                $scope.searchBlocks.inSearch = false;
                if (tempSearchBlockID != val) {
                    tempSearchBlockID = val;
                    $scope.updateBlocks();
                    return;
                }
            }
            tempSearchBlockID = val;
            searchBlockIDTimeout = $timeout(function () {
                $scope.searchBlocks.searchForBlock = tempSearchBlockID;
                $scope.updateBlocks();
            }, 2000); // delay 2000 ms
        })


    }]);