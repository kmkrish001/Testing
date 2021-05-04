/*!
*  filename: ej.widget.ko.js
*  version : 12.3
*  Copyright Syncfusion Inc. 2001 - 2014. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
*/
(function (fn) {
    typeof define === 'function' && define.amd ? define(["knockout","./ej.core"], fn) : fn();
})
(function (ko) {
	
(function ($, ej, wd, ko, undefined) {
    'use strict';

    var eKO = {
        binder: function (element, valueAccessor, allBindings, viewModel, bindingContext, proto, name) {
            var data = $(element).data(name), evt = !data, value = koUnwrap(valueAccessor, proto["ob.ignore"], !evt), changeFn, modelVal, cur, curModel;

            if(!evt && JSON){
                for(var prop in value){
                    cur = value[prop];
                    if(cur instanceof Array && (curModel = data.model[prop]) instanceof Array
                        && cur.length === curModel.length
                        && JSON.stringify(cur) === JSON.stringify(curModel)){
                        delete value[prop];
                    }
                }
            }

            if (evt && proto.type === "editor" && ko.isObservable(value.value)) {
                modelVal = value.value;
                changeFn = eKO.modelChange(modelVal);
                value = $.extend({}, value, { value: value.value() });
            }
            $(element)[name](value);
            if (changeFn) {
                modelVal.subscribe(eKO.valueChange($(element)[name]("model._change", changeFn).data(name)));
            }
        },
        modelChange: function (accessor) {
            return function (val) {
                accessor(val.value);
            };
        },
        valueChange: function(instance){
            return function (val) {
                instance.option("value", eKO.processData(val));
            };
        },
        processData: function (value) {
            return value === "true" ? true :
                value === "false" ? false :
                +value + "" === value ? +value : value;
        },

        bindKoHandler: function (name, proto) {
            proto["ob.ignore"] = [];
            [].push.apply(proto["ob.ignore"], proto.observables || []);

            ko.bindingHandlers[name] = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                        $(element)[name]("destroy");
                    });
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    eKO.binder(element, valueAccessor, allBindings, viewModel, bindingContext, proto, name);
                }
            };
        }
    }

    var koUnwrap = function (valueAccessor, ignoreProps, removeIgnores, pre) {
        var val = ko.utils.unwrapObservable(valueAccessor), res = {};
        pre = pre || "";
        if (typeof val === "function")
            val = val();
        if (ej.isPlainObject(val)) {
            for (var prop in val) {
                if (ignoreProps.indexOf(pre + prop) === -1) {
                    res[prop] = ko.utils.unwrapObservable(val[prop]);

                    if (ej.isPlainObject(res[prop]) || ko.isObservable(res[prop])) {
                        res[prop] = koUnwrap(res[prop], ignoreProps, removeIgnores, pre + prop + ".");
                    }
                } else {
                    if (removeIgnores)
                        continue;
                    res[prop] = val[prop];
                }
            }
        }
        return res;
    }

    var widgets = wd.registeredWidgets;
    for (var name in widgets) {
        eKO.bindKoHandler(widgets[name].name, widgets[name].proto);
    }

    ej.widget.extensions = {
        registerWidget: function (name) {
            eKO.bindKoHandler(name, widgets[name].proto);
        }
    }

    ej.extensions.ko = {
        subscriptions: {},
        register: function (value, field, instance) {
			if (!ko || !ko.isObservable(value))
                return value;	
				
			var evt = value;			
			if (value.ejComputed !== undefined) {
			    evt = value.ejComputed;
			    value = value.ejValue;
			    instance.isejObservableArray = true;
			}

            ej.widget.observables.subscriptions[field] = evt.subscribe(ej.proxy(ej.widget.observables.raise, { instance: instance, field: field }));
            return value;
        },
        raise: function (value) {
            var obValues = this.instance["ob.values"], isCached = this.field in obValues;
            if (!isCached)
                obValues[this.field] = this.instance.option(this.field);

            if (obValues[this.field] !== value || $.isArray(this.instance.option(this.field)())) {
                this.instance.option(this.field, ej.extensions.modelGUID, true);
                obValues[this.field] = value;
            }
        },
        getValue: function (val, getObservable) {
            if (getObservable)
                return val;
            return typeof val === "function" ? val() : val;
        }
    };
	
	ko.extenders.ejObservableArray = function (target, option) {
        var ejcomputed = ko.computed({
            read: function () {
                return ko.toJS(target);
            },
            write: function (newValue, index, action) {                
                switch (action) {
                    case "insert":
                        var obj = new target.ejObsFunc(newValue);
                        target.splice(index, 0, obj);
                        break;
                    case "remove":
                        target.splice(index, 1);
                        break;
                    case "update":
                        var obj = Object.keys(newValue);
                        for (var j = 0; j < obj.length; j++) {
                            var key = obj[j];
                            target()[index][key](newValue[key]);
                        }
                        break;
                }
            },
        }, this);
        target.ejValue = ko.observableArray(ejcomputed)();
        target.ejComputed = ejcomputed;
        target.ejObsFunc = option;
        return target;
    };

    ej.widget.observables = ej.extensions.ko;
})(window.jQuery, window.Syncfusion, window.Syncfusion.widget, ko || window.ko);;
return ko || window.ko;
});