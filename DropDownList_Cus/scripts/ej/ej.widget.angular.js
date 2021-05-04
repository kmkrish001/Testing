/*!
*  filename: ej.widget.angular.js
*  version : 12.3
*  Copyright Syncfusion Inc. 2001 - 2014. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
*/
(function (fn) {
    typeof define === 'function' && define.amd ? define(["angular","./ej.core"], fn) : fn();
})
(function () {
	
(function ($, ej, wd, ang, undefined) {
    'use strict';
    var module = ang.module("ejangular", []);
    ej.module = module;
    var eA = {
        firstCap: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        generatePropMap: function (obj, mapObj, prepend, preVal) {
            var maps = mapObj || {}, field;
            if (preVal)
                preVal += ".";
            else preVal = "";
            prepend = prepend || "";
            for (var prop in obj) {
                field = prepend + eA.firstCap(prop.toLowerCase());

                if (ej.isPlainObject(obj[prop])) {
                    eA.generatePropMap(obj[prop], maps, field, preVal + prop);
                }

                maps[field] = preVal + prop;
            }
            return maps;
        },
        getModel: function (maps, attrs, scope, watches, twoWays, isEdit, valPrefix) {
            var model = {}, t, value, attribs = attrs.$attr || attrs, isChild = !maps, idx, getter, setter;
            maps = maps || (attrs === attribs ? {} : attribs), valPrefix = valPrefix || "";
            for (var att in attribs) {
                idx = true; getter = setter = null;
                if (!isChild && (att[0] !== "e" || !/[A-Z]/.test(att[1])))
                    continue;

                value = attrs[att] || "";

                if (!isChild)
                    att = att.slice(1);

                if (typeof value === "object") {
                    var mapAtt = !isChild ? att : maps[att] || att;
                    if (value instanceof Array) {
                        for (var i = 0; i < value.length; i++) {
                            value[i] = eA.getModel(null, value[i], scope, watches, twoWays, isEdit, valPrefix + mapAtt + "[" + i + "]");
                        }
                    } else {
                        var val1 = {};
                        for (var prop in value) {
                            t = value.$attr[prop];
                            if (!t) continue;
                            val1[t] = eA.getModel(null, value[prop], scope, watches, twoWays, isEdit, valPrefix + mapAtt + "." + t);
                        }
                        value = val1;

                        t = ej.getObject(mapAtt, model);
                        if (t) $.extend(true, t, value);
                        continue;
                    }
                    ej.createObject(mapAtt, value, model);
                    continue;
                }

                t = maps[att] || att;

                idx = !isNaN(value) || /^['"].+['"]$/.test(value);
                if (idx === false) {
                    idx = value.indexOf('[');
                    if (idx === -1)
                        idx = !(value.split('.')[0] in scope);
                    else {
                        var t2 = eA.buildProperty(scope, value);
                        idx = !t2.available;
                        if (!idx) {
                            getter = t2.getter;
                            setter = t2.setter;
                        }
                    }
                }
                if (idx === true) {
                    ej.createObject(t, eA.processData(value), model);
                    continue;
                }
                watches.push({ key: value, value: valPrefix + t });
                getter = getter || ej.getObject;
                setter = setter || ej.createObject;

                if (!isChild && twoWays.indexOf(t) !== -1 && !(isEdit && att[0] === "V" && att === "Value"))
                    value = eA.addTwoWays(value, scope, getter(value, scope));
                else
                    value = getter(value, scope);
                ej.createObject(t, value, model);
            }
            return model;
        },
        buildProperty: function (instance, prop) {
            var fn = new Function('prop', 'instance', 'with (instance) { \nreturn ' + prop.replace(/^([^\[.]+)/, "instance['$1']") + '\n}');
            var setter = new Function('prop', 'val', 'instance', 'with (instance) {' + prop.replace(/^([^\[.]+)/, "instance['$1']") + ' = val;\n}');
            if (!("$$ejProperties" in instance))
                instance.$$ejProperties = {};
            instance.$$ejProperties[prop] = {
                getter: fn,
                setter: setter
            };
            return { available: !ej.isNullOrUndefined(fn(prop, instance)), getter: fn, setter: setter };
        },
        addTwoWays: function (prop, scope, value) {
            var setter = ej.createObject;
            if ("$$ejProperties" in scope && prop in scope.$$ejProperties)
                setter = scope.$$ejProperties[prop].setter;
            return function (newVal) {
                if (newVal === undefined)
                    return value;
                value = newVal;
                setter(prop, value, scope)
                eA.applyScope(scope);
            };
        },
        valReplace: /^'(.+)'$|^"(.+)"$/g,
        processData: function (value) {
            var parsed = value.replace(eA.valReplace, '$1$2');
            if (parsed === "true")
                return true;
            if (parsed === "false")
                return false;
            if (parsed !== value)
                return parsed;
            parsed = +parsed;
            return parsed + "" === value ? parsed : value;
        },
        addWatches: function (scope, watches, ctl, raise) {
            var watch, getter, key;
            for (var i = 0; i < watches.length; i++) {
                watch = "$watch";
                getter = ej.getObject;
                key = watches[i].key;
                if ("$$ejProperties" in scope && key in scope.$$ejProperties)
                    getter = scope.$$ejProperties[key].getter;
                if (getter(key, scope) instanceof Array)
                    watch = "$watchCollection";
                scope[watch](key, ej.proxy(raise, scope, { control: ctl, watch: watches[i] }));
            }
        },
        raise: function (e, val, old) {
            if (val === old) return;
            var value = ej.getObject(e.watch.value, e.control.model);
            if (typeof value === "function")
                value = value();

            if ((value === val && !(value instanceof Array)) || (value === old && (value instanceof Array)))
                return;
            if (e.control.observables.indexOf(e.watch.value) !== -1 && !(e.control.type === "editor" && e.watch.value === "value"))
                val = eA.addTwoWays(e.watch.key, this, val);
            e.control.option(e.watch.value, val, val instanceof Array);
        },
        angToEjProp: function (prop, maps) {
            for (var p in maps) {
                if (maps[p] === prop)
                    return p;
            }
        },
        modelChange: function (scope, key) {
            if (!key) return;
            var getter = ej.getObject, setter = ej.createObject;
            if ("$$ejProperties" in scope && key in scope.$$ejProperties) {
                var property = scope.$$ejProperties[key];
                getter = property.getter; setter = property.setter;
            }
            this.option("_change", function (e) {
                if (e.value === getter(key, scope))
                    return;
                setter(key, e.value, scope);
                eA.applyScope(scope);
            });
        },
        getDirectiveName: function (name) {
            if (name.length < 4) return "";
            var startIndex = name[2] === "m" ? 4 : 3;
            return name.slice(0, startIndex) + name.slice(startIndex).toLowerCase();
        },
        applyScope: function (scope) {
            setTimeout(function () {
                scope.$digest();
            }, 0);
        },
        loadTags: function (proto, tags) {
            var res = proto, tmp, attrs;
            if (res) return res;
            res = {};
            for (var i = 0; i < tags.length; i++) {
                tmp = tags[i].attr || [], attrs = {};

                for (var j = 0; j < tmp.length; j++) {
                    if (typeof tmp[j] === "object")
                        attrs["e-tag"] = eA.loadTags(null, tmp[j]);
                    else
                        attrs[tmp[j].toLowerCase().replace(/\./g, "-")] = tmp[j];
                }

                res["e-" + tags[i].tag.toLowerCase().replace(/\./g, "-")] = { field: tags[i].tag, attr: attrs, content: tags[i].content, singular: (tags[i].singular || tags[i].tag.replace(/s$/, "")).replace(/\./g, "-") };
            }
            return res;
        },
        getTagValues: function (tags, element) {
            var childs = $(element).children(), res = { $attr: {} };

            if (childs.length === 0)
                return res;

            for (var i = 0; i < childs.length; i++) {

                var child = $(childs.get(i)), children;
                var tagName = child.prop("tagName").toLowerCase(),
                    key = tags[tagName];
                if (!key) {
                    tagName = child[0].attributes[0];
                    if (!tagName) continue;
                    tagName = tagName.nodeName;
                    key = tags[tagName];
                    if (!key) continue;
                }
                var childTag = "e-" + key.singular, current;
                children = child.children(childTag + ",[" + childTag + "]");
                current = children.toArray().map(function (e) {
                    var r = eA.readAttributes(e, key.attr), t;
                    if (key.content) {
                        t = e.innerHTML;
                        if (t.length) {
                            r[key.content] = e.innerHTML;
                            r.$attr[key.content] = key.content;
                        }
                    } else if (key.attr["e-tag"]) {
                        var rr = eA.getTagValues(key.attr["e-tag"], e);
                        $.extend(true, r || {}, rr);
                    }
                    return r;
                }).filter(function (e) { return e; });
                children.remove();
                child.remove();
                if (current.length) {
                    eA.createAndAddAttr(key.field, current, res);
                    res.$attr[key.field.toLowerCase().replace(/\..+/g, "")] = key.field.replace(/\..+/g, "");
                }
            }
            return res;
        },
        readAttributes: function (el, attr) {
            var attrs = el.attributes, tmp, res = {}, $attr = {};

            for (var i = 0; i < attrs.length; i++) {
                tmp = attrs[i].nodeName.replace(/^e-/i, "").toLowerCase();
                tmp = (attr[tmp] || tmp);
                var t = tmp.toLowerCase().replace(/\.([a-z]?)/g, function (a, x) {
                    return x.toUpperCase();
                });

                res[t] = attrs[i].value || attrs[i].nodeValue;
                $attr[t] = tmp;
            }

            if (attrs.length) {
                res.$attr = $attr;
            }
            return res;
        },
        childRaise: function (e, val, old) {
            if (val === old) return;

            var value = ej.getArrayObject(e.watch.value, e.control.model);

            if (value === val && !(value instanceof Array))
                return;

            ej.setArrayObject(e.watch.value, val, e.control.model);

            var res = eA.parseFnAndIndex(e.watch.value);
            if (e.control[res[0]]) {
                e.control[res[0]](res[1], res[2], val, old);

            }
        },
        parseFnAndIndex: function (str) {
            var fnName = "", eIndex = str.lastIndexOf("]"), tmp = eA.getAllFnIndices(str, []), maps = {};

            for (var i = 0; i < tmp.length; i++) {
                fnName += "_" + tmp[i].prop;
                maps[tmp[i].prop] = tmp[i].index;
            }
            return [fnName.replace(/\./g, "_"), maps, str.slice(eIndex + 1)];
        },
        getAllFnIndices: function (str, res) {
            var sIndex = str.indexOf("["), eIndex;
            if (sIndex === -1)
                return null;
            eIndex = str.indexOf("]");
            res.push({
                index: parseInt(str.substring(sIndex + 1, eIndex), 10),
                prop: str.substring(0, sIndex)
            });
            eA.getAllFnIndices(str.slice(eIndex + 1), res);
            return res;
        },
        addChildTwoway: function (instance, watches, scope) {
            var maps = {}, setter = ej.createObject;
            for (var i = 0; i < watches.length; i++) {
                maps[watches[i].value] = watches[i].key;
            }
            instance._notifyArrayChange = function (property, value) {
                var prop = maps[property];
                if (prop) {
                    if ("$$ejProperties" in scope && prop in scope.$$ejProperties)
                        setter = scope.$$ejProperties[prop].setter;

                    setter(prop, value, scope);
                    eA.applyScope(scope);
                }
                setter = ej.createObject
            }
        },
        refreshTemplate: function (element, $compile, tmpl) {
            var templates = $(element).find(".ej-angular-template");
            for (var template in tmpl) {
                var el = templates.filter("." + tmpl[template].key);
                if (!el.length) {
                    tmpl[template].scope.$destroy();
                    delete tmpl[template];
                    continue;
                }
                $compile(el.not(".ng-scope"))(tmpl[template].scope);
            }
        },
        iterateAndGetModel: function (cur, watches, scope, prefix) {
            var t, t2;
            if (cur instanceof Array) {
                for (var i = 0; i < cur.length; i++) {
                    cur[i] = eA.getModel(null, cur[i], scope, watches, [], false, (prefix.endsWith(".") ? prefix.slice(0, -1) : prefix) + "[" + i + "]");
                }
            } else {
                for (var cr in cur) {
                    if (cr.slice(0, 1) === "$") continue;
                    t2 = cur.$attr && cur.$attr[cr] ? cur.$attr[cr] : cr;
                    t = eA.iterateAndGetModel(cur[cr], watches, scope, prefix + t2 + ".");
                    delete cur[cr];
                    cur[t2] = t;
                }
            }
            return cur;
        },
        createAndAddAttr: function (nameSpace, value, initIn) {
            var splits = nameSpace.split('.'), start = initIn || window, from = start, i, t, length = splits.length;

            for (i = 0; i < length; i++) {
                t = splits[i].toLowerCase();
                if (i + 1 == length) {
                    if (!(t in from) && from.$attr) {
                        from.$attr[t] = splits[i];
                    }
                    from[t] = ej.isNullOrUndefined(value) ? { $attr: {} } : value;
                } else if (ej.isNullOrUndefined(from[t])) {
                    if (from.$attr)
                        from.$attr[t] = splits[i];
                    from[t] = { $attr: {} };
                }

                from = from[t];
            }
            return start;
        },
        destroyWidget: function (instance) {
            instance.element.off(name + "refresh");
            instance.destroy();
            var tmpl = instance["tmpl.$newscope"] || {};
            for (var t in tmpl) {
                tmpl[t].scope.$destroy();
                delete tmpl[t];
            }
            instance = undefined;
        }
    };

    ej.getArrayObject = function (key, instance) {
        key = key.replace(/\[([0-9]+)]/g, ".$1.");
        return ej.getObject(key, instance);
    }
    ej.setArrayObject = function (key, value, instance) {
        key = key.replace(/\[([0-9]+)]/g, ".$1.");
        return ej.createObject(key, value, instance);
    }
    var defaultSetting = {
        transclude: {
            transclude: true,
            template: function () {
                return "<div ng-transclude></div>";
            }
        },
        defaults: {
            terminal: true
        }
    };

    var generateDirective = function (name, proto) {
        map[name] = eA.generatePropMap(proto.defaults);
        proto.observables = proto.observables || [];
        proto._notifyArrayChange = function () { };
        var settings = $.extend({}, defaultSetting[proto.type] || defaultSetting.defaults, proto.angular);
        module.directive(eA.getDirectiveName(name), ['$compile', '$timeout', function ($compile, $timeout) {
            return $.extend({
                restrict: 'CEA',
                compile: function (el) {
                    if (settings.require && settings.require.length) {
                        var ngModel = el.attr('ng-model'), eValue = el.attr('e-value'), ngModelOptions = el.attr('ng-model-options');
                        if ((!ngModel || !eValue) && (ngModel || eValue)) {
                            if (eValue) el.attr('ng-model', eValue);
                            if (ngModel) el.attr('e-value', ngModel);
                            if (!ngModelOptions) el.attr('ng-model-options', "{updateOn: ' '}");
                            return function (scope, el) {
                                $compile(el)(scope);
                            }
                        }
                        el.addClass('ng-pristine').addClass('ng-valid');
                    }

                    return {
                        pre: function (scope, element, attrs, ctrls) {
                            if (ctrls && ctrls.length && ctrls[0]) {
                                var modelCtrl = ctrls[0],
                                    formCtrl = ctrls[1],
                                    ngOptions = ctrls[2];
                                if (formCtrl) {
                                    formCtrl.$addControl(modelCtrl);
                                }
                                if (ngOptions && !element.attr('ng-model-options')) {
                                    ngOptions.$options.updateOn = "";
                                    ngOptions.$options.updateOnDefault = false;
                                }
                            }
                        },
                        post: function (scope, element, attrs, ctrls) {
                            var watches = [], isEdit = proto.type === "editor",
                                model = eA.getModel(map[name], attrs, scope, watches, proto.observables, isEdit),
                                childWatches = [], instanceId = attrs[eA.getDirectiveName(name)] || attrs.id;

                            if (proto._tags && proto._tags.length) {
                                var tags = proto["ob.tags"] = eA.loadTags(proto["ob.tags"], proto._tags);
                                var res = eA.getTagValues(tags, element);
                                res = eA.iterateAndGetModel(res, childWatches, scope, "");
                                delete res.$attr;
                                ej.copyObject(model, res);
                            }
                            if (settings.requireFormatters && ctrls && ctrls.length && ctrls[0]) {
                                model._change = function (e) {
                                    ctrls[0].$setViewValue(e.value);
                                    ctrls[0].$commitViewValue();
                                }
                            }

                            var instance = $(element)[name](model).data(name);

                            if (instanceId && !(instanceId in scope)) {
                                scope[instanceId] = instance;
                                instance.scopeId = instanceId;
                            }

                            eA.addWatches(scope, watches, instance, eA.raise);

                            if (childWatches.length) {
                                eA.addWatches(scope, childWatches, instance, eA.childRaise);
                                eA.addChildTwoway(instance, childWatches, scope);
                            }

                            if (ctrls && ctrls.length && ctrls[0]) {
                                var modelCtrl = ctrls[0];
                                modelCtrl.$setViewValue(element.val());
                                modelCtrl.$setPristine(true);
                                if (settings.requireFormatters) {
                                    modelCtrl.$formatters.push(function () {
                                        return instance.element.val();
                                    });
                                }
                                element.on(name + '_change', function (e) {
                                    if (e.source === 'source'/* this should be 'setModel'*/) return;
                                    var $target = $(e.target);
                                    modelCtrl.$setViewValue(e.value);
                                    modelCtrl.$modelValue = e.model.value;
                                    eA.applyScope(angular.element(e.target).scope());
                                });
                            }

                            if (isEdit) {
                                eA.modelChange.apply(instance, [scope, attrs["eValue"]]);
                            }

                            if ("tmpl.$newscope" in instance) {
                                eA.refreshTemplate(element, $compile, instance["tmpl.$newscope"]);
                            }

                            instance.element.on(name + "refresh", function () {
                                if ("tmpl.$newscope" in instance) {
                                    eA.refreshTemplate(element, $compile, instance["tmpl.$newscope"]);
                                }
                            });
                            scope.$on("$destroy", function () {
                                if (ej.angularMobileSettings && ej.angularMobileSettings.enableAnimation) {
                                    $timeout(function () {
                                        eA.destroyWidget(instance);
                                    }, ej.angularMobileSettings.animationTime);
                                }
                                else {
                                    eA.destroyWidget(instance);
                                }
                            });
                        }
                    }
                }
            }, settings);
        }]);
    }

    module.directive("ejTemplate", ["$compile", function ($compile) {
        return {
            restrict: "EA",
            priority: 999,
            terminal: true,
            link: function (scope, element, attrs) {
                var child = scope.$parent.$new(true);
                if (!scope.ejObject)
                    return;
                child.ejId = scope.ejId;
                child.ejObject = scope.ejObject;
                child.items = scope.items;
                child.model = scope.model;

                child.data = scope.items[attrs["ejProp"]];
                $compile(element.children(), scope)(child);
                if (!scope.$parent.$$phase)
                    child.$digest();
            }
        };
    }]);

    var map = {};
    var widgets = wd.registeredWidgets;
    for (var wid in widgets) {
        generateDirective(widgets[wid].name, widgets[wid].proto);
    }

    ej.widget.extensions = {
        registerWidget: function (name) {
            generateDirective(name, widgets[name].proto);
        }
    };

    Array.prototype.map = Array.prototype.map || function (fn, context) {
        var result = [], i = 0;
        while (i < this.length) {
            result.push(fn.call(context, this[i++]));
        }
        return result;
    };

    ej.template["text/ng-template"] = function (self, selector, data, index) {
        var element = angular.element(self.element[0]), scope, tt, tmpl = self["tmpl.$newscope"];

        if (!tmpl || !tmpl[selector]) {
            tmpl = tmpl || {};
            tmpl[selector] = { scope: element.scope().$new(true), key: ej.getGuid("tmpl") }
            scope = tmpl[selector].scope;
            scope.model = self.model;
            scope.ejId = self._id;
            scope.ejObject = self;

            self["tmpl.$newscope"] = tmpl;
        }

        scope = tmpl[selector].scope;
        if (!ej.isNullOrUndefined(index)) {
            if (!scope.items)
                scope.items = [];
            scope.items[index] = data;
        } else {
            index = 1;
            scope.items = [data];
        }

        tt = selector || "";
        if (tt.startsWith("#"))
            tt = $(tt).html();

        tt = "<div ej-template ej-prop='" + index + "' class='" + tmpl[selector].key + " ej-angular-template'>" + tt + "</div>";

        return tt;
    }

    ej.template.render = ej.template["text/ng-template"];

})(window.jQuery, window.Syncfusion, window.Syncfusion.widget, window.angular);;

});