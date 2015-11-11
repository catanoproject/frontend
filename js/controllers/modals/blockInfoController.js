require('angular');

angular.module('webApp').controller('blockInfoController', ["$scope", "$http", "blockInfo", "userInfo", "peerFactory", function ($scope, $http, blockInfo, userInfo, peerFactory) {

    $scope.transactions = [];
    $scope.transactionsLength = 0;
    $scope.getTransactionsOfBlock = function (blockId) {
        $http.get(peerFactory.getUrl() + "/api/transactions/", {params: {blockId: blockId}})
            .then(function (resp) {
                $scope.transactions = resp.data.transactions;
                $scope.transactionsLength = $scope.transactions.length;
            });
    };

    $scope.getTransactionsOfBlock($scope.block.id);

    $scope.close = function () {
        blockInfo.deactivate();
    }

    $scope.userInfo = function (userId) {
        blockInfo.deactivate();
        $scope.userInfo = userInfo.activate({userId: userId});
    }


    $scope.showGenerator = function(generatorId){
        blockInfo.deactivate();
        $scope.userInfo = userInfo.activate({userId: generatorId});
    }

    $scope.previousBlock = function (blockId) {
        $http.get(peerFactory.getUrl() + "/api/blocks/get?id=" +
        blockId)
            .then(function (resp) {
                $scope.block = resp.data.block;
                $scope.transactions = [];
                $scope.transactionsLength = 0;
                $scope.getTransactionsOfBlock($scope.block.id);
            });
    }
}]);