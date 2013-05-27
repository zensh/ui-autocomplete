'use strict';
/*
 *  AngularJS Autocomplete Wrapper for the jQuery UI Autocomplete Widget - v1.10.3
 *  API @ http://api.jqueryui.com/autocomplete/
 *
 *  wrap jQuery UI Autocomplete Widget
 *  <input type="text" ng-model="modelObj" srs-autocomplete="myOptions">
 *  $scope.myOptions = {
 *      options: {
 *          html: false, // boolean, srsAutocomplete extend, if true, you can use html string or DOM object in data.label for source
 *          onlySelect: false, // boolean, srsAutocomplete extend, if true, element value must be selected from suggestion menu, otherwise set to ''.
 *          focusOpen: false, // boolean, srsAutocomplete extend, if true, the suggestion menu auto open with all source data when focus
 *          appendTo: null, // jQuery UI Autocomplete Widget Options, the same below. http://api.jqueryui.com/autocomplete/#option
 *          autoFocus: false,
 *          delay: 300,
 *          disabled: false,
 *          minLength: 1,
 *          position: { my: "left top", at: "left bottom", collision: "none" },
 *          source: undefined // must be specified
 *      },
 *      events: // jQuery UI Autocomplete Widget Events, http://api.jqueryui.com/autocomplete/#event
 *      methods: // extend jQuery UI Autocomplete Widget Methods to AngularJS, http://api.jqueryui.com/autocomplete/#methods
 *               // then you can invoke methods like this: $scope.myOptions.methods.search('term');
 *               // add a new method 'filter' for filtering source data in AngularJS controller
 *  };
 */

/*global angular, $ */

angular.module('ui.autocomplete', [])
  .directive('uiAutocomplete', function () {
  var proto = $.ui.autocomplete.prototype,
    initSource = proto._initSource,
    methodsName = ['close', 'destroy', 'disable', 'enable', 'option', 'search', 'widget'],
    eventsName = ['autocompletechange', 'autocompleteclose', 'autocompletecreate', 'autocompletefocus', 'autocompleteopen', 'autocompleteresponse', 'autocompletesearch', 'autocompleteselect'];

  function filter(array, term) {
    var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), 'i');
    return $.grep(array, function (value) {
      return matcher.test($('<div>').html(value.label || value.value || value).text());
    });
  }

  $.extend(proto, {
    _initSource: function () {
      if (this.options.html && $.isArray(this.options.source)) {
        this.source = function (request, response) {
          response(filter(this.options.source, request.term));
        };
      } else {
        initSource.call(this);
      }
    },

    _normalize: function (items) {
      // assume all items have the right format
      return $.map(items, function (item) {
        if (typeof item === "string") {
          return {
            label: item,
            value: item
          };
        } else {
          return $.extend({
            label: item.label || item.value,
            value: item.value || item.label
          }, item);
        }
      });
    },

    _renderItem: function (ul, item) {
      var element = item.label || item.value || item || '';
      if (item.groupLabel) {
        if (angular.isObject(item.groupLabel)) {
          element = $(item.groupLabel);
        } else {
          element = $('<div></div>').html(item.groupLabel).addClass('ui-menu-group');
        }
      } else if (this.options.html) {
        if (typeof element === 'string') {
          element = $('<a></a>').html(element);
        } else {
          element = $(element);
          if (element.length > 1 || !element.is('a')) {
            element = $('<a></a>').append(element);
          }
        }
      } else {
        element = $('<a></a>').text(element);
      }
      return $('<li></li>').append(element).appendTo(ul);
    }
  });

  return {
    require: 'ngModel',
    link: function (scope, element, attr, ctrl) {
      var status = false,
        ngModel = null,
        autocomplete = scope.$eval(attr.srsAutocomplete),
        valueMethod = element[['textarea', 'input'].indexOf(element[0].nodeName.toLowerCase()) >= 0 ? 'val' : 'text'];

      function updateHandler(event, ui) {
        // listen 'autocompletechange' event, update view value and Model value
        var value;

        if (autocomplete.options.onlySelect && !status && !ui || !ui.item) {
          // if onlySelect, element value must be selected from search menu, otherwise set to ''.
          valueMethod.call(element, '');
        }
        value = valueMethod.call(element);
        if (!value || !ui.item || !ui.item.value) {
          emptyObj(ngModel);
        } else if (angular.isObject(ngModel)) {
          ui.item.label = angular.isObject(ui.item.label) ? $('<div></div>').append(ui.item.label).html() : ui.item.label;
          angular.extend(ngModel, ui.item);
        }
        if (ctrl.$viewValue !== value) {
          // scope.$apply(function () {
          //     ctrl.$setViewValue(value);
          // });
          ctrl.$setViewValue(value);
        }
      }

      function autoFocusHandler() {
        if (autocomplete.options.focusOpen && !status) {
          element.autocomplete('search', '');
        }
      }

      function checkOptions(options) {
        options = angular.isObject(options) ? options : {};
        // if source not set, disabled autocomplete
        options.disabled = options.source ? options.disabled : true;
        // if focusOpen, minLength must be 0
        options.minLength = options.focusOpen ? 0 : options.minLength;
        return options;
      }

      function emptyObj(a) {
        if (!angular.isObject(a)) {
          return;
        } else {
          if (angular.isArray(a)) {
            a.length = 0;
          } else {
            angular.forEach(a, function (value, key) {
              var type = typeof value;
              if (type === 'number') {
                a[key] = 0;
              } else if (type === 'string') {
                a[key] = '';
              } else if (type === 'boolean') {
                a[key] = false;
              } else if (angular.isArray(value)) {
                a[key].length = 0;
              } else if (angular.isObject(value)) {
                a[key] = {};
              }
            });
          }
        }
      }

      var unregisterWatchModel = scope.$watch(attr.ngModel, function (value) {
        if (angular.isObject(value)) {
          // not only primitive type ngModel, you can also use object type ngModel!
          // there must have a property 'value' in ngModel if object type
          ngModel = scope.$eval(attr.ngModel);
          ctrl.$formatters.push(function (obj) {
            return obj.value;
          });
          ctrl.$parsers.push(function (value) {
            ngModel.value = value;
            return angular.copy(ngModel);
          });
          valueMethod.call(element, ngModel.value);
        }
        if (value) {
          // unregister the watch after get value
          unregisterWatchModel();
        }
      });

      autocomplete.methods = angular.isObject(autocomplete.methods) ? autocomplete.methods : {};
      autocomplete.events = angular.isObject(autocomplete.events) ? autocomplete.events : {};
      autocomplete.options = checkOptions(autocomplete.options);

      if (!autocomplete.options.appendTo) {
        autocomplete.options.appendTo = element.parents('.ng-view')[0] || element.parents('[ng-view]')[0] || null;
      }

      element.autocomplete(angular.extend({}, autocomplete.options, autocomplete.events));

      // extend Autocomplete methods to AngularJS
      angular.forEach(methodsName, function (name) {
        autocomplete.methods[name] = function () {
          var args = [name];
          for (var i = 0; i <= arguments.length - 1; i++) {
            args.push(arguments[i]);
          }
          return element.autocomplete.apply(element, args);
        };
      });
      // add filter method to AngularJS
      autocomplete.methods.filter = filter;
      autocomplete.methods.update = updateHandler;

      //autoupdate options
      scope.$watch(function () {
        return autocomplete.options;
      }, function (value, old) {
        if (!angular.equals(value, old)) {
          value = checkOptions(value);
          element.autocomplete('option', value);
        }
      });

      element.on('focus', autoFocusHandler);
      // emit autocomplete events to AngularJS
      element.on(eventsName.join(' '), function (event, ui) {
        if (event.type === 'autocompleteclose') {
          status = false;
        } else if (event.type === 'autocompleteopen') {
          status = true;
        } else if (event.type === 'autocompletechange') {
          updateHandler(event, ui);
        }
        scope.$emit(event.type, ui);
      });
    }
  };
});