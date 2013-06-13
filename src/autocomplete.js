'use strict';
/*
 *  AngularJS Autocomplete, version 0.4.0
 *  Wrapper for the jQuery UI Autocomplete Widget - v1.10.3
 *  API @ http://api.jqueryui.com/autocomplete/
 *
 *  <input type="text" ng-model="modelObj" ui-autocomplete="myOptions">
 *  $scope.myOptions = {
 *      options: {
 *          html: false, // boolean, uiAutocomplete extend, if true, you can use html string or DOM object in data.label for source
 *          onlySelect: false, // boolean, uiAutocomplete extend, if true, element value must be selected from suggestion menu, otherwise set to ''.
 *          focusOpen: false, // boolean, uiAutocomplete extend, if true, the suggestion menu auto open with all source data when focus
 *          groupLabel: null, // html string or DOM object, uiAutocomplete extend, it is used to group suggestion result, it can't be seleted.
 *          outHeight: 0, // number, uiAutocomplete extend, it is used to adjust suggestion menu' css style "max-height".
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
  .directive('uiAutocomplete', ['$timeout', '$exceptionHandler',
  function ($timeout, $exceptionHandler) {
    var proto = $.ui.autocomplete.prototype,
      initSource = proto._initSource;

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
          if (item && typeof item === "object") {
            return $.extend({
              label: item.label || item.value,
              value: item.value || item.label
            }, item);
          } else {
            return {
              label: item + '',
              value: item
            };
          }
        });
      },

      _renderItem: function (ul, item) {
        var element = item.groupLabel || item.label;
        if (item.groupLabel) {
          element = $('<div>').append(element).addClass('ui-menu-group');
        } else if (this.options.html) {
          if (typeof element === 'object') {
            element = $(element);
          }
          if (typeof element !== 'object' || element.length > 1 || !element.is('a')) {
            element = $('<a>').append(element);
          }
        } else {
          element = $('<a>').text(element);
        }
        return $('<li>').append(element).appendTo(ul);
      },

      _resizeMenu: function () {
        var that = this;
        setTimeout(function () {
          var ul = that.menu.element;
          var maxHeight = ul.css('max-height') || 0,
            width = Math.max(
              ul.width('').outerWidth() + 1,
              that.element.outerWidth()),
            oHeight = that.element.height(),
            height = $(window).height() - that.options.outHeight - ul.offset().top;
          height = maxHeight && height > maxHeight ? maxHeight : height;
          ul.css({
            width: width,
            maxHeight: height
          });
        }, 10);
      }
    });

    return {
      require: 'ngModel',
      link: function (scope, element, attr, ctrl) {
        var status = false,
          selectItem = null,
          events = {},
          ngModel = null,
          autocomplete = scope.$eval(attr.uiAutocomplete),
          valueMethod = element.val.bind(element),
          methodsName = ['close', 'destroy', 'disable', 'enable', 'option', 'search', 'widget'],
          eventsName = ['change', 'close', 'create', 'focus', 'open', 'response', 'search', 'select'];

        var unregisterWatchModel = scope.$watch(attr.ngModel, function (value) {
          ngModel = value;
          if (angular.isObject(ngModel)) {
            // not only primitive type ngModel, you can also use object type ngModel!
            // there must have a property 'value' in ngModel if object type
            ctrl.$formatters.push(function (obj) {
              return obj.value;
            });
            ctrl.$parsers.push(function (value) {
              ngModel.value = value;
              return ngModel;
            });
            scope.$watch(attr.ngModel + '.value', function (value) {
              if (valueMethod() !== value) {
                ctrl.$viewValue = value;
                ctrl.$render();
              }
            });
            ctrl.$setViewValue(ngModel.value);
          }
          if (value) {
            // unregister the watch after get value
            unregisterWatchModel();
          }
        });

        var uiEvents = {
          open: function (event, ui) {
            status = true;
            selectItem = null;
          },
          close: function (event, ui) {
            status = false;
          },
          select: function (event, ui) {
            selectItem = ui;
            $timeout(function () {
              element.blur();
            }, 0);
          },
          change: function (event, ui) {
            // update view value and Model value
            var value = valueMethod();

            if (!selectItem || !selectItem.item) {
              // if onlySelect, element value must be selected from search menu, otherwise set to ''.
              value = autocomplete.options.onlySelect ? '' : value;
            } else {
              value = selectItem.item.value;
            }
            if (ctrl.$viewValue !== value) {
              scope.$apply(function () {
                ctrl.$setViewValue(value);
                ctrl.$render();
                changeNgModel(selectItem);
              });
            }
          }
        };

        function changeNgModel(data) {
          if (angular.isObject(ngModel)) {
            if (!ctrl.$viewValue && ctrl.$viewValue !== 0) {
              emptyObj(ngModel);
            } else if (data && data.item) {
              data.item.label = angular.isObject(data.item.label) ? $('<div>').append(data.item.label).html() : data.item.label;
              angular.extend(ngModel, data.item);
            }
            angular.forEach(ctrl.$viewChangeListeners, function (listener) {
              try {
                listener();
              } catch (e) {
                $exceptionHandler(e);
              }
            });
          }
        }

        function cleanNgModel() {
          ctrl.$setViewValue('');
          ctrl.$render();
          changeNgModel();
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
          options.outHeight = options.outHeight || 0;
          options.position = options.position || {
            my: 'left top',
            at: 'left bottom',
            collision: 'flipfit'
          };
          return options;
        }

        function emptyObj(a) {
          if (angular.isObject(a)) {
            var reg = /^\$/;
            angular.forEach(a, function (value, key) {
              var type = typeof value;
              if (reg.test(key)) {
                return; // don't clean private property of AngularJS
              } else if (type === 'number') {
                a[key] = 0;
              } else if (type === 'string') {
                a[key] = '';
              } else if (type === 'boolean') {
                a[key] = false;
              } else if (angular.isObject(value)) {
                emptyObj(value);
              }
            });
          }
        }

        if (!angular.isObject(autocomplete)) {
          return;
        }

        autocomplete.methods = {};
        autocomplete.options = checkOptions(autocomplete.options);

        // extend Autocomplete events to Autocomplete
        angular.forEach(eventsName, function (name) {
          events[name] = function (event, ui) {
            if (uiEvents[name]) {
              uiEvents[name](event, ui);
            }
            if (autocomplete.events && typeof autocomplete.events[name] === 'function') {
              autocomplete.events[name](event, ui);
            }
          };
        });

        if (!autocomplete.options.appendTo) {
          autocomplete.options.appendTo = element.parents('.ng-view')[0] || element.parents('[ng-view]')[0] || null;
        }

        // extend Autocomplete methods to AngularJS
        angular.forEach(methodsName, function (name) {
          autocomplete.methods[name] = function () {
            var args = [name];
            angular.forEach(arguments, function (value) {
              args.push(value);
            });
            return element.autocomplete.apply(element, args);
          };
        });
        // add filter method to AngularJS
        autocomplete.methods.filter = filter;
        autocomplete.methods.clean = cleanNgModel;

        //autoupdate options
        scope.$watch(function () {
          return autocomplete.options;
        }, function (value) {
          element.autocomplete('option', checkOptions(value));
        });

        element.on('focus', autoFocusHandler);

        element.autocomplete(angular.extend({}, autocomplete.options, events));
      }
    };
  }
]);