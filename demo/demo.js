'use strict';
/*global angular */

angular.module('uiAutocompleteDemo', ['ui.event', 'ui.autocomplete']).
controller('uiAutocompleteCtr', ['$scope', '$compile',
    function ($scope, $compile) {
        var uid = 4,
            users = [{
                uid: 1,
                group: 'user',
                name: 'name1',
                age: 25,
                email: 'name1@gmail.com',
                desc: 'user, 111111111111111111'
            }, {
                uid: 2,
                group: 'user',
                name: 'name2',
                age: 26,
                email: 'name2@gmail.com',
                desc: 'user, 222222222222222'
            }, {
                uid: 3,
                group: 'system',
                name: 'name3',
                age: 27,
                email: 'name3@gmail.com',
                desc: 'system, 3333333333333333333'
            }, {
                uid: 4,
                group: 'system',
                name: 'name4',
                age: 28,
                email: 'name4@gmail.com',
                desc: 'system, 44444444'
            }];

        function nameToValue(obj) {
            if (angular.isObject(obj) && angular.isUndefined(obj.value)) {
                obj.value = obj.name;
            }
            return obj;
        }

        function SearchUser() {
            var that = this;
            this.options = {
                html: true,
                minLength: 1,
                outHeight: 100,
                maxWidth: 300,
                source: function (request, response) {
                    // you can $http or $resource service to get data frome server.
                    var list = angular.copy(users);
                    var group = {}, data = [];

                    angular.forEach(list, function (user) {
                        // there must have 'value' property while ngModel is a object.
                        nameToValue(user);
                        // custom html string label
                        user.label = '<strong>' + user.name + '</strong> (' +
                            user.email + ')<br /><i>' + user.desc + '</i>';
                    });

                    // filter data, methods will be added after uiAutocomplete initialized.
                    list = that.methods.filter(list, request.term);

                    angular.forEach(list, function (user) {
                        group[user.group] = group[user.group] || [];
                        group[user.group].push(user);
                    });

                    angular.forEach(group, function (value, key) {
                        // groupLabel
                        data.push({
                            groupLabel: '<strong>' + key + '</strong>'
                        });
                        data = data.concat(value);
                    });

                    // response data to suggestion menu.
                    response(data);
                }
            };
            this.events = {
                change: function (event, ui) {
                    console.log(ui);
                }
            };
        }

        $scope.users = [];
        $scope.users.push(nameToValue(users[0]));

        $scope.changeClass = function (options) {
            var widget = options.methods.widget();
            // remove default class, use bootstrap style
            widget.removeClass('ui-menu ui-corner-all ui-widget-content').addClass('dropdown-menu');
        };

        $scope.myOption = {
            options: {
                html: true,
                minLength: 1,
                onlySelect: true,
                outHeight: 50,
                source: function (request, response) {
                    var data = [
                            "Asp",
                            "BASIC",
                            "C",
                            "C++",
                            "Clojure",
                            "COBOL",
                            "ColdFusion",
                            "Erlang",
                            "Fortran",
                            "Groovy",
                            "Haskell",
                            "Java",
                            "JavaScript",
                            "Lisp",
                            "Perl",
                            "PHP",
                            "Python",
                            "Ruby",
                            "Scala",
                            "Scheme"
                    ];
                    data = $scope.myOption.methods.filter(data, request.term);

                    if (!data.length) {
                        data.push({
                            label: 'not found',
                            value: null
                        });
                    }
                    // add "Add Language" button to autocomplete menu bottom
                    data.push({
                        label: $compile('<a class="ui-menu-add" ng-click="add()">Add Language</a>')($scope),
                        value: null
                    });
                    response(data);
                }
            }
        };
        $scope.searchUser = function () {
            this.searchUser = new SearchUser();
            return this.searchUser;
        };
        $scope.searchGroup = {
            options: {
                focusOpen: true,
                onlySelect: true,
                source: function (request, response) {
                    var data = [
                        "guest",
                        "user",
                        "system"
                    ];
                    data = $scope.myOption.methods.filter(data, request.term);

                    if (!data.length) {
                        data.push({
                            label: 'not found',
                            value: null
                        });
                    }
                    response(data);
                }
            }
        };
        $scope.add = function () {
            alert('You can do some thing!');
        };
        $scope.addUser = function () {
            $scope.users.push({
                uid: ++uid,
                group: 'guest',
                name: '',
                age: 0,
                email: '',
                desc: ''
            });
        };
    }
]).controller('MyController', function ($scope, $compile) {
  $scope.myTestListIds = [ "Country", "Programming", "Planet" ];
  $scope.selecteModel = {};
  $scope.data = {
    "Country": [ "France", "Finland", "USA"],
    "Programming" : [ "Java", "JavaScript", "CSS", "HTML5" ],
    "Planet": [ "Earth", "Mars", "Jupiter", "Saturn" ]
  };

  /* config object */
  $scope.myOption = function(listId) {
    return {
      options: {
            html: true,
            focusOpen: true,
            onlySelect: true,
            source: function (request, response) {
                console.log(123, request, response)
                var listData = $scope.data[listId];
                var result = [];
                angular.forEach(listData, function(s) {
                  result.push({label: s, value:s});
                });

                response(result);
            }
        }
    };
  }
});