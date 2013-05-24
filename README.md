# ui-autocomplete directive

AngularJS Autocomplete Wrapper for the jQuery UI Autocomplete Widget - v1.10.3

# Requirements
- ([jQuery](http://jquery.com/download/))
- ([jQuery UI](http://jqueryui.com/download/))
- ([AngularJS](http://code.angularjs.org/))

# Testing



# Usage

Load the script files in your application like this:

    <script type="text/javascript" src="javasript/jquery/jquery.js"></script>
    <script type="text/javascript" src="javasript/jquery-ui/jquery-ui.js"></script>
    <script type="text/javascript" src="javasript/angular/angular.js"></script>
    <script type="text/javascript" src="javasript/angular-ui/autocomplete.js"></script>

Add the autocomplete module as a dependency to your application module:

    var myAppModule = angular.module('MyApp', ['ui.autocomplete'])

Apply the directive to your div elements:

    <input type="text" ng-model="modelObj" ui-autocomplete="myOptions">

## Options

All the Arshaw Fullcalendar options can be passed through the directive. This even means function objects that are declared on the scope. 

    myAppModule.controller('MyController', function ($scope) {
        /* config object */
        $scope.myOptions = {
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
                    data = $scope.myOptions.methods.filter(data, request.term);

                    if (!data.length) {
                        data.push({
                            label: 'not found',
                            value: ''
                        });
                    }
                    // add "Add Language" button to autocomplete menu bottom
                    data.push({
                        label: app.compile('<a class="btn btn-link ui-menu-add" ng-click="addLanguage()">Add Language</a>')($scope),
                        value: ''
                    });
                    response(data);
                }
            },
            methods: {}
        };
    });

    // in html template
    <input type="text" ng-model="modelObj" ui-autocomplete="myOptions">

## Working with ng-model

The ui-autocomplete directive plays nicely with ng-model.

Not only primitive type ngModel, you can also use object type ngModel! There must have a property 'value' in object type ngModel

## Documentation for the Calendar

The autocomplete works alongside of all the documentation represented [here](http://api.jqueryui.com/autocomplete/)
