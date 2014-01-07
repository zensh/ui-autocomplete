# ui-autocomplete directive v0.5.4
Intend to replace Select2!

AngularJS Autocomplete Wrapper for the jQuery UI Autocomplete Widget - v1.10.3

# Requirements
- ([jQuery](http://jquery.com/download/))
- ([jQuery UI](http://jqueryui.com/download/))
- ([AngularJS](http://code.angularjs.org/))

# Testing



# Installation options

    bower install ui-autocomplete

# Usage

Load the script files in your application like this:

    <script type="text/javascript" src="javascript/jquery/jquery.js"></script>
    <script type="text/javascript" src="javascript/jquery-ui/jquery-ui.js"></script>
    <script type="text/javascript" src="javascript/angular/angular.js"></script>
    <script type="text/javascript" src="javascript/angular-ui/autocomplete.js"></script>

Add the autocomplete module as a dependency to your application module:

    var myAppModule = angular.module('MyApp', ['ui.autocomplete'])

Apply the directive to your input elements:

    <input type="text" ng-model="modelObj" ui-autocomplete="myOption">

## ui-autocomplete option

###Options

All the options must be passed through the directive. There have added 5 options besides official options:

- **html** If true, you can use html string or DOM object in sourceData.label
- **focusOpen** If true, the suggestion menu auto open with all source data when element focus
- **onlySelect** If true, element value must be selected from suggestion menu, otherwise the value will be set to ''
- **groupLabel** html string or DOM object, it is used to group suggestion result, it can't be seleted
- **outHeight** number, it is used to adjust suggestion menu' css style "max-height", and you would set css "overflow-y", see demo.

You can config options like this:

    myAppModule.controller('MyController', function ($scope, $compile) {
        /* config object */
        $scope.myOption = {
            options: {
                html: true,
                focusOpen: true,
                onlySelect: true,
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
                            value: ''
                        });
                    }
                    // add "Add Language" button to autocomplete menu bottom
                    data.push({
                        label: $compile('<a class="btn btn-link ui-menu-add" ng-click="addLanguage()">Add Language</a>')($scope),
                        value: ''
                    });
                    response(data);
                }
            },
            methods: {}
        };
    });

    // in html template
    <input type="text" ng-model="modelObj" ui-autocomplete="myOption">

**All official options [Here](http://api.jqueryui.com/autocomplete/#option).**

###Methods

Autocomplete methods will be added to `$scope.myOption.methods` after Autocomplete initialized. There also have added 2 methods:

- **filter** filter html labels besides official methods
- **clean** use to empty ngModal object

You can invoke methods like this:

    $scope.myOption.methods.search('term');

    data = $scope.myOption.methods.filter(data, request.term);

    $scope.myOption.methods.clean();

**All official methods [Here](http://api.jqueryui.com/autocomplete/#methods).**

###Events

Autocomplete events will be emitted just like official events triggered.

You can bind events to initialize the autocomplete like this:

    $scope.myOption.events = {
        change: function( event, ui ) {
            // do something
        },
        close: function( event, ui ) {
            // do something
        },
        //...other event handlers
    };

**All official events [Here](http://api.jqueryui.com/autocomplete/#events).**

## Working with ng-model

The ui-autocomplete directive plays nicely with ng-model.

Not only primitive type ngModel, you can also use object type ngModel! There must have a property **'value'** in object type ngModel.

A object type ngModel like this:

    modelObj = {
        id: 'ae15581f-d8e1-48e8-9d6d-b5989ae77ce5',
        name: 'JavaScript',
        value: 'JavaScript',
        // some other property
    };


## Documentation for the autocomplete

The autocomplete works alongside of all the documentation represented [here](http://api.jqueryui.com/autocomplete/)
