require('angular');


angular.module('webApp').controller('forgingController', ['$scope', '$rootScope', '$http', "userService", "$interval", "companyModal", "forgingModal", "delegateService", "viewFactory", "blockInfo",
    function ($rootScope, $scope, $http, userService, $interval, companyModal, forgingModal, delegateService, viewFactory, blockInfo) {

        $scope.allVotes = 100
        * 1000
        * 1000
        * 1000
        * 1000
        * 100;


        $scope.graphs = {
            amountForged: {
                labels: ['1', '2', '3', '4'],
                series: ['Series A', 'Series B'],
                data: [
                    [20, 50, 20, 50],
                    [60, 30, 40, 20]
                ],
                colours: ['#378fe0', '#29b6f6'],
                options: {
                    scaleShowGridLines: false,
                    pointDot: false,
                    showTooltips: false,
                    scaleShowLabels: false,
                    scaleBeginAtZero: true
                }
            },
            totalForged: {
                labels: ['Total Forged'],
                values: [1],
                colours: ['#90a4ae'],
                options: {
                    percentageInnerCutout: 90,
                    animationEasing: "linear",
                    segmentShowStroke: false,
                    showTooltips: false,
                    scaleLineColor: "rgba(0,0,0,0)",
                    scaleGridLineWidth: 0,
                    scaleShowHorizontalLines: false,

                    scaleShowVerticalLines: false
                }
            },
            rank: {
                labels: ['Others', 'Rank'],
                values: [0, 100],
                colours: ['#90a4ae', '#f5f5f5'],
                options: {
                    percentageInnerCutout: 90,
                    animationEasing: "linear",
                    segmentShowStroke: false,
                    showTooltips: false
                }
            },
            uptime: {
                labels: ['Others', 'Uptime'],
                values: [0, 100],
                colours: ['#90a4ae', '#f5f5f5'],
                options: {
                    percentageInnerCutout: 90,
                    animationEasing: "linear",
                    segmentShowStroke: false,
                    showTooltips: false
                }
            },
            approval: {
                labels: ['Others', 'Approval'],
                values: [0, $scope.allVotes],
                colours: ['#90a4ae', '#f5f5f5'],
                options: {
                    percentageInnerCutout: 90,
                    animationEasing: "linear",
                    segmentShowStroke: false,
                    showTooltips: false
                }
            }
        }

        $scope.getApproval = function (vote) {
            return (vote / $scope.allVotes ) * 100;
        };
        $scope.approval = 0;
        $scope.vote = 0;
        $scope.rank = 0;
        $scope.uptime = 0;
        $scope.view = viewFactory;
        $scope.view.page = {title: 'Forging', previos: null};
        $scope.view.bar = {forgingMenu: true};
        $scope.address = userService.address;
        $scope.effectiveBalance = userService.effectiveBalance;
        $scope.totalBalance = userService.balance;
        $scope.unconfirmedBalance = userService.unconfirmedBalance;
        $scope.loadingBlocks = true;


        $scope.getBlocks = function () {
            $http.get("/api/blocks", {
                params: {
                    generatorPublicKey: userService.publicKey,
                    limit: 20,
                    orderBy: "height:desc"
                }
            })
                .then(function (resp) {
                    $scope.blocks = resp.data.blocks;
                    $scope.loadingBlocks = false;
                });
        }

        $scope.getForgedAmount = function () {
            $http.get("/api/delegates/forging/getForgedByAccount", {params: {generatorPublicKey: userService.publicKey}})
                .then(function (resp) {
                    $scope.totalForged = resp.data.fees;
                    $scope.graphs.totalForged.values = [resp.data.fees || 1];
                });
        }


        $scope.getForging = function () {
            $http.get("/api/delegates/forging/status", {params: {publicKey: userService.publicKey}})
                .then(function (resp) {
                    $scope.forging = resp.data.enabled;
                    userService.setForging($scope.forging);
                });
        }

        $scope.infoInterval = $interval(function () {
            $scope.getBlocks();
            $scope.getForgedAmount();
            $scope.getForging();
        }, 1000 * 30);
        

        $scope.getBlocks();
        $scope.getForgedAmount();

        $scope.getForging();


        $scope.enableForging = function () {
            $scope.forgingModal = forgingModal.activate({
                forging: false,
                totalBalance: userService.unconfirmedBalance,
                destroy: function () {
                    $scope.forging = userService.forging;
                    $scope.getForging();
                }
            })
        }

        $scope.disableForging = function () {
            $scope.forgingModal = forgingModal.activate({
                forging: true,
                totalBalance: userService.unconfirmedBalance,
                destroy: function () {
                    $scope.forging = userService.forging;
                    $scope.getForging();
                }
            })
        }

        $scope.newCompany = function () {
            $scope.companyModal = companyModal.activate({
                totalBalance: $scope.unconfirmedBalance,
                destroy: function () {
                    $scope.getInfo();
                }
            });
        }

        $scope.blockInfo = function (block) {
            $scope.modal = blockInfo.activate({block: block});
        }

    }]);