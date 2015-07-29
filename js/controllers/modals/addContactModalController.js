require('angular');

angular.module('webApp').controller('addContactModalController', ["$scope", "addContactModal", "$http", "userService", "contactsService", "peerFactory",
    function ($scope, addContactModal, $http, userService, contactsService, peerFactory) {
        $scope.passmode = false;
        $scope.accountValid = true;
        $scope.errorMessage = "";
        $scope.secondPassphrase = userService.secondPassphrase;
        $scope.publicKey = userService.publicKey;
        $scope.rememberedPassword = userService.rememberPassword ? userService.rememberedPassword : false;
        $scope.checkSecondPass = false;
        $scope.focus = 'contact';
        $scope.presendError = false;


        $scope.passcheck = function (fromSecondPass) {
            if (fromSecondPass) {
                $scope.checkSecondPass = false;
                $scope.passmode = $scope.rememberedPassword ? false : true;
                if ($scope.passmode) {
                    $scope.focus = 'secretPhrase';
                }
                else {
                    $scope.focus = 'contact';
                }
                $scope.secondPhrase = '';
                $scope.pass = '';
                return;
            }
            if ($scope.rememberedPassword) {
                var isAddress = /^[0-9]+[C|c]$/g;
                var allowSymbols = /^[a-z0-9!@$&_.]+$/g;
                if ($scope.contact.trim() == '') {
                    $scope.errorMessage = 'Empty contact'
                    $scope.presendError = true;
                } else {
                    if (isAddress.test($scope.contact) || allowSymbols.test($scope.contact.toLowerCase())) {
                        $scope.presendError = false;
                        $scope.errorMessage = ''
                        $scope.addFolower($scope.rememberedPassword);
                    }
                    else {
                        $scope.errorMessage = 'Incorrect contact name or address'
                        $scope.presendError = true;
                    }
                }


            }
            else {
                var isAddress = /^[0-9]+[C|c]$/g;
                var allowSymbols = /^[a-z0-9!@$&_.]+$/g;
                if ($scope.contact.trim() == '') {
                    $scope.errorMessage = 'Empty contact'
                    $scope.presendError = true;
                } else {
                    if (isAddress.test($scope.contact) || allowSymbols.test($scope.contact.toLowerCase())) {
                        $scope.presendError = false;
                        $scope.errorMessage = ''
                        $scope.passmode = !$scope.passmode;
                        $scope.focus = 'secretPhrase';
                        $scope.pass = '';
                    }
                    else {
                        $scope.errorMessage = 'Incorrect contact name or address'
                        $scope.presendError = true;
                    }
                }
            }
        }

        $scope.close = function () {
            if ($scope.destroy) {
                $scope.destroy();
            }

            addContactModal.deactivate();
        }

        $scope.addFolower = function (pass, withSecond) {
            if ($scope.secondPassphrase && !withSecond) {
                $scope.checkSecondPass = true;
                $scope.focus = 'secondPhrase';
                return;
            }

            var isAddress = /^[0-9]+[C|c]$/g;
            if (isAddress.test($scope.contact)) {
                $scope.sendData(pass, withSecond);
            }
            else {

                $http.get(peerFactory.getUsernameUrl() + "/api/accounts/username/get?username=" + $scope.contact).then(function (response) {
                    if (response.data.success) {
                        $scope.contact = response.data.account.address;
                        $scope.sendData(pass, withSecond);
                    }
                    else {
                        $scope.errorMessage = response.data.error
                    }
                });
            }


        }

        $scope.sendData = function (pass, withSecond) {
            var queryParams = {
                secret: pass,
                following: '+' + $scope.contact,
                publicKey: userService.publicKey
            }
            if ($scope.secondPassphrase) {
                queryParams.secondSecret = $scope.secondPhrase;
                if ($scope.rememberedPassword) {
                    queryParams.secret = $scope.rememberedPassword;
                }
            }


            contactsService.addContact(queryParams, function (response) {
                if (response.data.success) {
                    $scope.close();
                }
                else {
                    $scope.errorMessage = response.data.error || response.data.err;
                }
            });
        }
    }]);