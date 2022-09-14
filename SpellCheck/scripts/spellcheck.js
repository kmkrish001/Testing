/*!
*  filename: spellcheck.js
*  version : 20.2.0.43
*  Copyright Syncfusion Inc. 2001 - 2022. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
*/


window.ej = window.Syncfusion = window.Syncfusion || {};


(function ($, ej, undefined) {
    'use strict';

    ej.version = "20.2.0.43";

    ej.consts = {
        NamespaceJoin: '-'
    };
    ej.TextAlign = {
        Center: 'center',
        Justify: 'justify',
        Left: 'left',
        Right: 'right'
    };
    ej.Orientation = { Horizontal: "horizontal", Vertical: "vertical" };

    ej.serverTimezoneOffset = 0;

    ej.parseDateInUTC = false;

    ej.persistStateVersion = null;

    ej.locales = ej.locales || [];

    if (!Object.prototype.hasOwnProperty) {
        Object.prototype.hasOwnProperty = function (obj, prop) {
            return obj[prop] !== undefined;
        };
    }

    //to support toISOString() in IE8
    if (!Date.prototype.toISOString) {
        (function () {
            function pad(number) {
                var r = String(number);
                if (r.length === 1) {
                    r = '0' + r;
                }
                return r;
            }
            Date.prototype.toISOString = function () {
                return this.getUTCFullYear()
                    + '-' + pad(this.getUTCMonth() + 1)
                    + '-' + pad(this.getUTCDate())
                    + 'T' + pad(this.getUTCHours())
                    + ':' + pad(this.getUTCMinutes())
                    + ':' + pad(this.getUTCSeconds())
                    + '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5)
                    + 'Z';
            };
        }());
    }

    String.format = function () {
        var source = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++)
            source = source.replace(new RegExp("\\{" + i + "\\}", "gm"), arguments[i + 1]);

        source = source.replace(/\{[0-9]\}/g, "");
        return source;
    };

    jQuery.uaMatch = function (ua) {
        ua = ua.toLowerCase();

        var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
            /(webkit)[ \/]([\w.]+)/.exec(ua) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
            /(msie) ([\w.]+)/.exec(ua) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
            [];

        return {
            browser: match[1] || "",
            version: match[2] || "0"
        };
    };
    // Function to create new class
    ej.defineClass = function (className, constructor, proto, replace) {
        /// <summary>Creates the javascript class with given namespace & class name & constructor etc</summary>
        /// <param name="className" type="String">class name prefixed with namespace</param>
        /// <param name="constructor" type="Function">constructor function</param>
        /// <param name="proto" type="Object">prototype for the class</param>
        /// <param name="replace" type="Boolean">[Optional]Replace existing class if exists</param>
        /// <returns type="Function">returns the class function</returns>
        if (!className || !proto) return undefined;

        var parts = className.split(".");

        // Object creation
        var obj = window, i = 0;
        for (; i < parts.length - 1; i++) {

            if (ej.isNullOrUndefined(obj[parts[i]]))
                obj[parts[i]] = {};

            obj = obj[parts[i]];
        }

        if (replace || ej.isNullOrUndefined(obj[parts[i]])) {

            //constructor
            constructor = typeof constructor === "function" ? constructor : function () {
            };

            obj[parts[i]] = constructor;

            // prototype
            obj[parts[i]].prototype = proto;
        }

        return obj[parts[i]];
    };

    ej.util = {
        getNameSpace: function (className) {
            /// <summary>Internal function, this will create namespace for plugins using class name</summary>
            /// <param name="className" type="String"></param>
            /// <returns type="String"></returns>
            var splits = className.toLowerCase().split(".");
            splits[0] === "ej" && (splits[0] = "e");

            return splits.join(ej.consts.NamespaceJoin);
        },

        getObject: function (nameSpace, from) {
            if (!from || !nameSpace) return undefined;
			(typeof(nameSpace) != "string") && (nameSpace = JSON.stringify(nameSpace));
            var value = from, splits = nameSpace.split('.');

            for (var i = 0; i < splits.length; i++) {

                if (ej.util.isNullOrUndefined(value)) break;

                value = value[splits[i]];
            }

            return value;
        },

        createObject: function (nameSpace, value, initIn) {
            var splits = nameSpace.split('.'), start = initIn || window, from = start, i, t, length = splits.length;

            for (i = 0; i < length; i++) {
                t = splits[i];
                if (i + 1 == length)
                    from[t] = value;
                else if (ej.isNullOrUndefined(from[t]))
                    from[t] = {};

                from = from[t];
            }

            return start;
        },

        isNullOrUndefined: function (value) {
            /// <summary>Util to check null or undefined</summary>
            /// <param name="value" type="Object"></param>
            /// <returns type="Boolean"></returns>
            return value === undefined || value === null;
        },
        exportAll: function (action, controlIds) {
            var inputAttr = [], widget, locale = [], index, controlEle, controlInstance, controlObject, modelClone;
            var attr = { action: action, method: 'post', "data-ajax": "false" };
            var form = ej.buildTag('form', "", null, attr);
            if (controlIds.length != 0) {
                for (var i = 0; i < controlIds.length; i++) {
                    index = i;
                    controlEle = $("#" + controlIds[i]);
                    controlInstance = $("#" + controlIds[i]).data();
                    widget = controlInstance["ejWidgets"];
                    controlObject = $(controlEle).data(widget[0]);
                    locale.push({ id: controlObject._id, locale: controlObject.model.locale });
                    if (!ej.isNullOrUndefined(controlObject)) {
                        modelClone = controlObject._getExportModel(controlObject.model);
                        inputAttr.push({ name: widget[0], type: 'hidden', value: controlObject.stringify(modelClone) });
                        var input = ej.buildTag('input', "", null, inputAttr[index]);
                        form.append(input);
                    }
                }
                $('body').append(form);
                form.submit();
                setTimeout(function () {
                    var ctrlInstance, ctrlObject;
                    if (locale.length) {
                        for (var j = 0; j < locale.length; j++) {
                            if (!ej.isNullOrUndefined(locale[j].locale)) {
                                ctrlInstance = $("#" + locale[j].id).data();
                                widget = ctrlInstance["ejWidgets"];
                                ctrlObject = $("#" + locale[j].id).data(widget[0]);
                                ctrlObject.model.locale = locale[j].locale;
                            }
                        }
                    }
                }, 0);
                form.remove();
            }
            return true;
        },
        print: function (element, printWin) {
            var $div = ej.buildTag('div')
            var elementClone = element.clone();
            $div.append(elementClone);
            if (!printWin)
                var printWin = window.open('', 'print', "height=452,width=1024,tabbar=no");
            printWin.document.write('<!DOCTYPE html>');
            var links = $('head').find('link').add("style");
            if (ej.browserInfo().name === "msie") {
                var a = ""
                links.each(function (index, obj) {
                    if (obj.tagName == "LINK")
                        $(obj).attr('href', obj.href);
                    a += obj.outerHTML;
                });
                printWin.document.write('<html><head></head><body>' + a + $div[0].innerHTML + '</body></html>');
            }
            else {
                var a = ""
                printWin.document.write('<html><head>')
                links.each(function (index, obj) {
                    if (obj.tagName == "LINK")
                        $(obj).attr('href', obj.href);
                    a += obj.outerHTML;
                });
                printWin.document.writeln(a + '</head><body>')
                printWin.document.writeln($div[0].innerHTML + '</body></html>')
            }
            printWin.document.close();
            printWin.focus();
            setTimeout(function () {
                if (!ej.isNullOrUndefined(printWin.window)) {
                    printWin.print();
                    setTimeout(function () { printWin.close() }, 1000);
                }
            }, 1000);
        },
        ieClearRemover: function (element) {
            var searchBoxHeight = $(element).height();
            element.style.paddingTop = parseFloat(searchBoxHeight / 2) + "px";
            element.style.paddingBottom = parseFloat(searchBoxHeight / 2) + "px";
            element.style.height = "1px";
            element.style.lineHeight = "1px";
        },
        //To send ajax request
        sendAjaxRequest: function (ajaxOptions) {
            $.ajax({
                type: ajaxOptions.type,
                cache: ajaxOptions.cache,
                url: ajaxOptions.url,
                dataType: ajaxOptions.dataType,
                data: ajaxOptions.data,
                contentType: ajaxOptions.contentType,
                async: ajaxOptions.async,
                success: ajaxOptions.successHandler,
                error: ajaxOptions.errorHandler,
                beforeSend: ajaxOptions.beforeSendHandler,
                complete: ajaxOptions.completeHandler
            });
        },

        buildTag: function (tag, innerHtml, styles, attrs) {
            /// <summary>Helper to build jQuery element</summary>
            /// <param name="tag" type="String">tagName#id.cssClass</param>
            /// <param name="innerHtml" type="String"></param>
            /// <param name="styles" type="Object">A set of key/value pairs that configure styles</param>
            /// <param name="attrs" type="Object">A set of key/value pairs that configure attributes</param>
            /// <returns type="jQuery"></returns>
            var tagName = /^[a-z]*[0-9a-z]+/ig.exec(tag)[0];

           var id = /#([_a-z0-9-&@\/\\,+()$~%:*?<>{}\[\]]+\S)/ig.exec(tag);
            id = id ? id[id.length - 1].replace(/[&@\/\\,+()$~%.:*?<>{}\[\]]/g, ''): undefined;

            var className = /\.([a-z]+[-_0-9a-z ]+)/ig.exec(tag);
            className = className ? className[className.length - 1] : undefined;

            return $(document.createElement(tagName))
                .attr(id ? { "id": id } : {})
                .addClass(className || "")
                .css(styles || {})
                .attr(attrs || {})
                .html(innerHtml || "");
        },
        _preventDefaultException: function (el, exceptions) {
            if (el) {
                for (var i in exceptions) {
                    if (exceptions[i].test(el[i])) {
                        return true;
                    }
                }
            }

            return false;
        },

        //Gets the maximum z-index in the document
        getMaxZindex: function () {
            var maxZ = 1;
            maxZ = Math.max.apply(null, $.map($('body *'), function (e, n) {
                if ($(e).css('position') == 'absolute' || $(e).css('position') == 'fixed')
                    return parseInt($(e).css('z-index')) || 1;
            })
            );
            if (maxZ == undefined || maxZ == null)
                maxZ = 1;
            return maxZ;
        },

        //To prevent default actions for the element
        blockDefaultActions: function (e) {
            e.cancelBubble = true;
            e.returnValue = false;
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
        },

        //To get dimensions of the element when its hidden
        getDimension: function (element, method) {
            var value;
            var $hidden = $(element).parents().andSelf().filter(':hidden');
            if ($hidden) {
                var prop = { visibility: 'hidden', display: 'block' };
                var tmp = [];
                $hidden.each(function () {
                    var temp = {}, name;
                    for (name in prop) {
                        temp[name] = this.style[name];
                        this.style[name] = prop[name];
                    }
                    tmp.push(temp);
                });
                value = /(outer)/g.test(method) ?
                $(element)[method](true) :
               $(element)[method]();

                $hidden.each(function (i) {
                    var temp = tmp[i], name;
                    for (name in prop) {
                        this.style[name] = temp[name];
                    }
                });
            }
            return value;
        },
        //Get triggers when transition End
        transitionEndEvent: function () {
            var transitionEnd = {
                '': 'transitionend',
                'webkit': 'webkitTransitionEnd',
                'Moz': 'transitionend',
                'O': 'otransitionend',
                'ms': 'MSTransitionEnd'
            };

            return transitionEnd[ej.userAgent()];
        },
        //Get triggers when transition End
        animationEndEvent: function () {
            var animationEnd = {
                '': 'animationend',
                'webkit': 'webkitAnimationEnd',
                'Moz': 'animationend',
                'O': 'webkitAnimationEnd',
                'ms': 'animationend'
            };

            return animationEnd[ej.userAgent()];
        },
        //To return the start event to bind for element
        startEvent: function () {
            return (ej.isTouchDevice() || $.support.hasPointer) ? "touchstart" : "mousedown";
        },
        //To return end event to bind for element
        endEvent: function () {
            return (ej.isTouchDevice() || $.support.hasPointer) ? "touchend" : "mouseup"
        },
        //To return move event to bind for element
        moveEvent: function () {
            return (ej.isTouchDevice() || $.support.hasPointer) ? ($.support.hasPointer && !ej.isMobile()) ? "ejtouchmove" : "touchmove" : "mousemove";
        },
        //To return cancel event to bind for element
        cancelEvent: function () {
            return (ej.isTouchDevice() || $.support.hasPointer) ? "touchcancel" : "mousecancel";
        },
        //To return tap event to bind for element
        tapEvent: function () {
            return (ej.isTouchDevice() || $.support.hasPointer) ? "tap" : "click";
        },
        //To return tap hold event to bind for element
        tapHoldEvent: function () {
            return (ej.isTouchDevice() || $.support.hasPointer) ? "taphold" : "click";
        },
        //To check whether its Device
        isDevice: function () {
            if (ej.getBooleanVal($('head'), 'data-ej-forceset', false))
                return ej.getBooleanVal($('head'), 'data-ej-device', this._device());
            else
                return this._device();
        },
        //To check whether its portrait or landscape mode
        isPortrait: function () {
            var elem = document.documentElement;
            return (elem) && ((elem.clientWidth / elem.clientHeight) < 1.1);
        },
        //To check whether its in lower resolution
        isLowerResolution: function () {
            return ((window.innerWidth <= 640 && ej.isPortrait() && ej.isDevice()) || (window.innerWidth <= 800 && !ej.isDevice()) || (window.innerWidth <= 800 && !ej.isPortrait() && ej.isWindows() && ej.isDevice()) || ej.isMobile());
        },
        //To check whether its iOS web view
        isIOSWebView: function () {
            return (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent));
        },
        //To check whether its Android web view
        isAndroidWebView: function () {
            return (!(typeof (Android) === "undefined"));
        },
        //To check whether its windows web view
        isWindowsWebView: function () {
            return location.href.indexOf("x-wmapp") != -1;
        },
        _device: function () {
            return (/Android|BlackBerry|iPhone|iPad|iPod|IEMobile|kindle|windows\sce|palm|smartphone|iemobile|mobile|pad|xoom|sch-i800|playbook/i.test(navigator.userAgent.toLowerCase()));
        },
        //To check whether its Mobile
        isMobile: function () {
            return ((/iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(navigator.userAgent.toLowerCase()) && /mobile/i.test(navigator.userAgent.toLowerCase()))) || (ej.getBooleanVal($('head'), 'data-ej-mobile', false) === true);
        },
        //To check whether its Tablet
        isTablet: function () {
            return (/ipad|xoom|sch-i800|playbook|tablet|kindle/i.test(navigator.userAgent.toLowerCase())) || (ej.getBooleanVal($('head'), 'data-ej-tablet', false) === true) || (!ej.isMobile() && ej.isDevice());
        },
        //To check whether its Touch Device
        isTouchDevice: function () {
            return (('ontouchstart' in window || (window.navigator.msPointerEnabled && ej.isMobile())) && this.isDevice());
        },
        //To get the outerHTML string for object
        getClearString: function (string) {
            return $.trim(string.replace(/\s+/g, " ").replace(/(\r\n|\n|\r)/gm, "").replace(new RegExp("\>[\n\t ]+\<", "g"), "><"));
        },
        //Get the attribute value with boolean type of element
        getBooleanVal: function (ele, val, option) {
            /// <summary>Util to get the property from data attributes</summary>
            /// <param name="ele" type="Object"></param>
            /// <param name="val" type="String"></param>
            /// <param name="option" type="GenericType"></param>
            /// <returns type="GenericType"></returns>
            var value = $(ele).attr(val);
            if (value != null)
                return value.toLowerCase() == "true";
            else
                return option;
        },
        //Gets the Skew class based on the element current position
        _getSkewClass: function (item, pageX, pageY) {
            var itemwidth = item.width();
            var itemheight = item.height();
            var leftOffset = item.offset().left;
            var rightOffset = item.offset().left + itemwidth;
            var topOffset = item.offset().top;
            var bottomOffset = item.offset().top + itemheight;
            var widthoffset = itemwidth * 0.3;
            var heightoffset = itemheight * 0.3;
            if (pageX < leftOffset + widthoffset && pageY < topOffset + heightoffset)
                return "e-m-skew-topleft";
            if (pageX > rightOffset - widthoffset && pageY < topOffset + heightoffset)
                return "e-m-skew-topright";
            if (pageX > rightOffset - widthoffset && pageY > bottomOffset - heightoffset)
                return "e-m-skew-bottomright";
            if (pageX < leftOffset + widthoffset && pageY > bottomOffset - heightoffset)
                return "e-m-skew-bottomleft";
            if (pageX > leftOffset + widthoffset && pageY < topOffset + heightoffset && pageX < rightOffset - widthoffset)
                return "e-m-skew-top";
            if (pageX < leftOffset + widthoffset)
                return "e-m-skew-left";
            if (pageX > rightOffset - widthoffset)
                return "e-m-skew-right";
            if (pageY > bottomOffset - heightoffset)
                return "e-m-skew-bottom";
            return "e-m-skew-center";
        },
        //Removes the added Skew class on the element
        _removeSkewClass: function (element) {
            $(element).removeClass("e-m-skew-top e-m-skew-bottom e-m-skew-left e-m-skew-right e-m-skew-topleft e-m-skew-topright e-m-skew-bottomleft e-m-skew-bottomright e-m-skew-center e-skew-top e-skew-bottom e-skew-left e-skew-right e-skew-topleft e-skew-topright e-skew-bottomleft e-skew-bottomright e-skew-center");
        },
        //Object.keys  method to support all the browser including IE8.
        _getObjectKeys: function (obj) {
            var i, keys = [];
            obj = Object.prototype.toString.call(obj) === Object.prototype.toString() ? obj : {};
            if (!Object.keys) {
                for (i in obj) {
                    if (obj.hasOwnProperty(i))
                        keys.push(i);
                }
                return keys;
            }
            if (Object.keys)
                return Object.keys(obj);
        },
        _touchStartPoints: function (evt, object) {
            if (evt) {
                var point = evt.touches ? evt.touches[0] : evt;
                object._distX = 0;
                object._distY = 0;
                object._moved = false;
                object._pointX = point.pageX;
                object._pointY = point.pageY;
            }
        },
        _isTouchMoved: function (evt, object) {
            if (evt) {
                var point = evt.touches ? evt.touches[0] : evt,
                deltaX = point.pageX - object._pointX,
                deltaY = point.pageY - object._pointY,
                timestamp = Date.now(),
                newX, newY,
                absDistX, absDistY;
                object._pointX = point.pageX;
                object._pointY = point.pageY;
                object._distX += deltaX;
                object._distY += deltaY;
                absDistX = Math.abs(object._distX);
                absDistY = Math.abs(object._distY);
                return !(absDistX < 5 && absDistY < 5);
            }
        },
        //To bind events for element
        listenEvents: function (selectors, eventTypes, handlers, remove, pluginObj, disableMouse) {
            for (var i = 0; i < selectors.length; i++) {
                ej.listenTouchEvent(selectors[i], eventTypes[i], handlers[i], remove, pluginObj, disableMouse);
            }
        },
        //To bind touch events for element
        listenTouchEvent: function (selector, eventType, handler, remove, pluginObj, disableMouse) {
            var event = remove ? "removeEventListener" : "addEventListener";
            var jqueryEvent = remove ? "off" : "on";
            var elements = $(selector);
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                switch (eventType) {
                    case "touchstart":
                        ej._bindEvent(element, event, eventType, handler, "mousedown", "MSPointerDown", "pointerdown", disableMouse);
                        break;
                    case "touchmove":
                        ej._bindEvent(element, event, eventType, handler, "mousemove", "MSPointerMove", "pointermove", disableMouse);
                        break;
                    case "touchend":
                        ej._bindEvent(element, event, eventType, handler, "mouseup", "MSPointerUp", "pointerup", disableMouse);
                        break;
                    case "touchcancel":
                        ej._bindEvent(element, event, eventType, handler, "mousecancel", "MSPointerCancel", "pointercancel", disableMouse);
                        break;
                    case "tap": case "taphold": case "ejtouchmove": case "click":
                        $(element)[jqueryEvent](eventType, handler);
                        break;
                    default:
                        if (ej.browserInfo().name == "msie" && ej.browserInfo().version < 9)
                            pluginObj["_on"]($(element), eventType, handler);
                        else
                            element[event](eventType, handler, true);
                        break;
                }
            }
        },
        //To bind events for element
        _bindEvent: function (element, event, eventType, handler, mouseEvent, pointerEvent, ie11pointerEvent, disableMouse) {
            if ($.support.hasPointer)
                element[event](window.navigator.pointerEnabled ? ie11pointerEvent : pointerEvent, handler, true);
            else
                element[event](eventType, handler, true);
        },
        _browser: function () {
            return (/webkit/i).test(navigator.appVersion) ? 'webkit' : (/firefox/i).test(navigator.userAgent) ? 'Moz' : (/trident/i).test(navigator.userAgent) ? 'ms' : 'opera' in window ? 'O' : '';
        },
        styles: document.createElement('div').style,
        /**
       * To get the userAgent Name     
       * @example             
       * &lt;script&gt;
       *       ej.userAgent();//return user agent name
       * &lt;/script&gt         
       * @memberof AppView
       * @instance
       */
        userAgent: function () {
            var agents = 'webkitT,t,MozT,msT,OT'.split(','),
            t,
            i = 0,
            l = agents.length;

            for (; i < l; i++) {
                t = agents[i] + 'ransform';
                if (t in ej.styles) {
                    return agents[i].substr(0, agents[i].length - 1);
                }
            }

            return false;
        },
        addPrefix: function (style) {
            if (ej.userAgent() === '') return style;

            style = style.charAt(0).toUpperCase() + style.substr(1);
            return ej.userAgent() + style;
        },
        //To Prevent Default Exception

        //To destroy the mobile widgets
        destroyWidgets: function (element) {
            var dataEl = $(element).find("[data-role *= ejm]");
            dataEl.each(function (index, element) {
                var $element = $(element);
                var plugin = $element.data("ejWidgets");
                if (plugin)
                    $element[plugin]("destroy");
            });
        },
        //Get the attribute value of element
        getAttrVal: function (ele, val, option) {
            /// <summary>Util to get the property from data attributes</summary>
            /// <param name="ele" type="Object"></param>
            /// <param name="val" type="String"></param>
            /// <param name="option" type="GenericType"></param>
            /// <returns type="GenericType"></returns>
            var value = $(ele).attr(val);
            if (value != null)
                return value;
            else
                return option;
        },

        // Get the offset value of element
        getOffset: function (ele) {
            var pos = {};
            var offsetObj = ele.offset() || { left: 0, top: 0 };
            $.extend(true, pos, offsetObj);
            if ($("body").css("position") != "static") {
                var bodyPos = $("body").offset();
                pos.left -= bodyPos.left;
                pos.top -= bodyPos.top;
            }
            return pos;
        },

        // Z-index calculation for the element
        getZindexPartial: function (element, popupEle) {
            if (!ej.isNullOrUndefined(element) && element.length > 0) {
                var parents = element.parents(), bodyEle;
                bodyEle = $('body').children();
                if (!ej.isNullOrUndefined(element) && element.length > 0)
                    bodyEle.splice(bodyEle.index(popupEle), 1);
                $(bodyEle).each(function (i, ele) { parents.push(ele); });

                var maxZ = Math.max.apply(maxZ, $.map(parents, function (e, n) {
                    if ($(e).css('position') != 'static') return parseInt($(e).css('z-index')) || 1;
                }));
                if (!maxZ || maxZ < 10000) maxZ = 10000;
                else maxZ += 1;
                return maxZ;
            }
        },

        isValidAttr: function (element, attribute) {
            var element = $(element)[0];
            if (typeof element[attribute] != "undefined")
                return true;
            else {
                var _isValid = false;
                $.each(element, function (key) {
                    if (key.toLowerCase() == attribute.toLowerCase()) {
                        _isValid = true;
                        return false;
                    }
                });
            }
            return _isValid;
        }

    };

    $.extend(ej, ej.util);

    // base class for all ej widgets. It will automatically inhertied
    ej.widgetBase = {
        droppables: { 'default': [] },
        resizables: { 'default': [] },

        _renderEjTemplate: function (selector, data, index, prop, ngTemplateType) {
            var type = null;
            if (typeof selector === "object" || selector.startsWith("#") || selector.startsWith("."))
                type = $(selector).attr("type");
            if (type) {
                type = type.toLowerCase();
                if (ej.template[type])
                    return ej.template[type](this, selector, data, index, prop);
            }
            // For ejGrid Angular2 Template Support
            else if (!ej.isNullOrUndefined(ngTemplateType))
                 return ej.template['text/x-'+ ngTemplateType](this, selector, data, index, prop);
            return ej.template.render(this, selector, data, index, prop);
        },

        destroy: function () {

            if (this._trigger("destroy"))
                return;

            if (this.model.enablePersistence) {
                this.persistState();
                $(window).off("unload", this._persistHandler);
            }

            try {
                this._destroy();
            } catch (e) { }

            var arr = this.element.data("ejWidgets") || [];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == this.pluginName) {
                    arr.splice(i, 1);
                }
            }
            if (!arr.length)
                this.element.removeData("ejWidgets");

            while (this._events) {
                var item = this._events.pop(), args = [];

                if (!item)
                    break;

                for (var i = 0; i < item[1].length; i++)
                    if (!$.isPlainObject(item[1][i]))
                        args.push(item[1][i]);

                $.fn.off.apply(item[0], args);
            }

            this._events = null;

            this.element
                .removeClass(ej.util.getNameSpace(this.sfType))
                .removeClass("e-js")
                .removeData(this.pluginName);

            this.element = null;
            this.model = null;
        },

        _on: function (element) {
            if (!this._events)
                this._events = [];
            var args = [].splice.call(arguments, 1, arguments.length - 1);

            var handler = {}, i = args.length;
            while (handler && typeof handler !== "function") {
                handler = args[--i];
            }

            args[i] = ej.proxy(args[i], this);

            this._events.push([element, args, handler, args[i]]);

            $.fn.on.apply(element, args);

            return this;
        },

        _off: function (element, eventName, selector, handlerObject) {
            var e = this._events, temp;
            if (!e || !e.length)
                return this;
            if (typeof selector == "function") {
                temp = handlerObject;
                handlerObject = selector;
                selector = temp;
            }
            var t = (eventName.match(/\S+/g) || [""]);
            for (var i = 0; i < e.length; i++) {
                var arg = e[i],
                r = arg[0].length && (!handlerObject || arg[2] === handlerObject) && (arg[1][0] === eventName || t[0]) && (!selector || arg[1][1] === selector) && $.inArray(element[0], arg[0]) > -1;
                if (r) {
                    $.fn.off.apply(element, handlerObject ? [eventName, selector, arg[3]] : [eventName, selector]);
                    e.splice(i, 1);
                    break;
                }
            }

            return this;
        },

        // Client side events wire-up / trigger helper.
        _trigger: function (eventName, eventProp) {
            var fn = null, returnValue, args, clientProp = {};
            $.extend(clientProp, eventProp)

            if (eventName in this.model)
                fn = this.model[eventName];

            if (fn) {
                if (typeof fn === "string") {
                    fn = ej.util.getObject(fn, window);
                }

                if ($.isFunction(fn)) {

                    args = ej.event(eventName, this.model, eventProp);

                    
                    returnValue = fn.call(this, args);

                    // sending changes back - deep copy option should not be enabled for this $.extend 
                    if (eventProp) $.extend(eventProp, args);

                    if (args.cancel || !ej.isNullOrUndefined(returnValue))
                        return returnValue === false || args.cancel;
                }
            }

            var isPropDefined = Boolean(eventProp);
            eventProp = eventProp || {};
            eventProp.originalEventType = eventName;
            eventProp.type = this.pluginName + eventName;

            args = $.Event(eventProp.type, ej.event(eventProp.type, this.model, eventProp));

            this.element && this.element.trigger(args);

            // sending changes back - deep copy option should not be enabled for this $.extend 
            if (isPropDefined) $.extend(eventProp, args);

            if (ej.isOnWebForms && args.cancel == false && this.model.serverEvents && this.model.serverEvents.length)
                ej.raiseWebFormsServerEvents(eventName, eventProp, clientProp);

            return args.cancel;
        },

        setModel: function (options, forceSet) {
            // check for whether to apply values are not. if _setModel function is defined in child,
            //  this will call that function and validate it using return value

            if (this._trigger("modelChange", { "changes": options }))
                return;

            for (var prop in options) {
                if (!forceSet) {
                    if (this.model[prop] === options[prop]) {
                        delete options[prop];
                        continue;
                    }
                    if ($.isPlainObject(options[prop])) {
                        iterateAndRemoveProps(this.model[prop], options[prop]);
                        if ($.isEmptyObject(options[prop])) {
                            delete options[prop];
                            continue;
                        }
                    }
                }

                if (this.dataTypes) {
                    var returnValue = this._isValidModelValue(prop, this.dataTypes, options);
                    if (returnValue !== true)
                        throw "setModel - Invalid input for property :" + prop + " - " + returnValue;
                }
                if (this.model.notifyOnEachPropertyChanges && this.model[prop] !== options[prop]) {
                    var arg = {
                        oldValue: this.model[prop],
                        newValue: options[prop]
                    };

                    options[prop] = this._trigger(prop + "Change", arg) ? this.model[prop] : arg.newValue;
                }
            }
            if ($.isEmptyObject(options))
                return;

            if (this._setFirst) {
                var ds = options.dataSource;
                if (ds) delete options.dataSource;

                $.extend(true, this.model, options);
                if (ds) {
                    this.model.dataSource = (ds instanceof Array) ? ds.slice() : ds;
                    options["dataSource"] = this.model.dataSource;
                }
                !this._setModel || this._setModel(options);

            } else if (!this._setModel || this._setModel(options) !== false) {
                $.extend(true, this.model, options);
            }
            if ("enablePersistence" in options) {
                this._setState(options.enablePersistence);
            }
        },
        option: function (prop, value, forceSet) {
            if (!prop)
                return this.model;

            if ($.isPlainObject(prop))
                return this.setModel(prop, forceSet);

            if (typeof prop === "string") {
                prop = prop.replace(/^model\./, "");
                var oldValue = ej.getObject(prop, this.model);

                if (value === undefined && !forceSet)
                    return oldValue;

                if (prop === "enablePersistence")
                    return this._setState(value);

                if (forceSet && value === ej.extensions.modelGUID) {
                    return this._setModel(ej.createObject(prop, ej.getObject(prop, this.model), {}));
                }

                if (forceSet || ej.getObject(prop, this.model) !== value)
                    return this.setModel(ej.createObject(prop, value, {}), forceSet);
            }
            return undefined;
        },

        _isValidModelValue: function (prop, types, options) {
            var value = types[prop], option = options[prop], returnValue;

            if (!value)
                return true;

            if (typeof value === "string") {
                if (value == "enum") {
                    options[prop] = option ? option.toString().toLowerCase() : option;
                    value = "string";
                }

                if (value === "array") {
                    if (Object.prototype.toString.call(option) === '[object Array]')
                        return true;
                }
                else if (value === "data") {
                    return true;
                }
                else if (value === "parent") {
                    return true;
                }
                else if (typeof option === value)
                    return true;

                return "Expected type - " + value;
            }

            if (option instanceof Array) {
                for (var i = 0; i < option.length; i++) {
                    returnValue = this._isValidModelValue(prop, types, option[i]);
                    if (returnValue !== true) {
                        return " [" + i + "] - " + returnValue;
                    }
                }
                return true;
            }

            for (var innerProp in option) {
                returnValue = this._isValidModelValue(innerProp, value, option);
                if (returnValue !== true)
                    return innerProp + " : " + returnValue;
            }

            return true;
        },

        _returnFn: function (obj, propName) {
            if (propName.indexOf('.') != -1) {
                this._returnFn(obj[propName.split('.')[0]], propName.split('.').slice(1).join('.'));
            }
            else
                obj[propName] = obj[propName].call(obj.propName);
        },

        _removeCircularRef: function (obj) {
            var seen = [];
            function detect(obj, key, parent) {
                if (typeof obj != 'object') { return; }
                if (!Array.prototype.indexOf) {
                    Array.prototype.indexOf = function (val) {
                        return jQuery.inArray(val, this);
                    };
                }
                if (seen.indexOf(obj) >= 0) {
                    delete parent[key];
                    return;
                }
                seen.push(obj);
                for (var k in obj) { //dive on the object's children
                    if (obj.hasOwnProperty(k)) { detect(obj[k], k, obj); }
                }
                seen.pop();
                return;
            }
            detect(obj, 'obj', null);
            return obj;
        },

        stringify: function (model, removeCircular) {
            var observables = this.observables;
            for (var k = 0; k < observables.length; k++) {
                var val = ej.getObject(observables[k], model);
                if (!ej.isNullOrUndefined(val) && typeof (val) === "function")
                    this._returnFn(model, observables[k]);
            }
            if (removeCircular) model = this._removeCircularRef(model);
            return JSON.stringify(model);
        },

        _setState: function (val) {
            if (val === true) {
                this._persistHandler = ej.proxy(this.persistState, this);
                $(window).on("unload", this._persistHandler);
            } else {
                this.deleteState();
                $(window).off("unload", this._persistHandler);
            }
        },

        _removeProp: function (obj, propName) {
            if (!ej.isNullOrUndefined(obj)) {
                if (propName.indexOf('.') != -1) {
                    this._removeProp(obj[propName.split('.')[0]], propName.split('.').slice(1).join('.'));
                }
                else
                    delete obj[propName];
            }
        },

        persistState: function () {
            var model;

            if (this._ignoreOnPersist) {
                model = copyObject({}, this.model);
                for (var i = 0; i < this._ignoreOnPersist.length; i++) {
                    this._removeProp(model, this._ignoreOnPersist[i]);
                }
                model.ignoreOnPersist = this._ignoreOnPersist;
            } else if (this._addToPersist) {
                model = {};
                for (var i = 0; i < this._addToPersist.length; i++) {
                    ej.createObject(this._addToPersist[i], ej.getObject(this._addToPersist[i], this.model), model);
                }
                model.addToPersist = this._addToPersist;
            } else {
                model = copyObject({}, this.model);
            }

            if (this._persistState) {
                model.customPersists = {};
                this._persistState(model.customPersists);
            }

            if (window.localStorage) {
                if (!ej.isNullOrUndefined(ej.persistStateVersion) && window.localStorage.getItem("persistKey") == null)
                    window.localStorage.setItem("persistKey", ej.persistStateVersion);
                window.localStorage.setItem("$ej$" + this.pluginName + this._id, JSON.stringify(model));
            }
            else if (document.cookie) {
                if (!ej.isNullOrUndefined(ej.persistStateVersion) && ej.cookie.get("persistKey") == null)
                    ej.cookie.set("persistKey", ej.persistStateVersion);
                ej.cookie.set("$ej$" + this.pluginName + this._id, model);
            }
        },

        deleteState: function () {
            var model;
            if (window.localStorage)
                window.localStorage.removeItem("$ej$" + this.pluginName + this._id);
            else if (document.cookie)
                ej.cookie.set("$ej$" + this.pluginName + this._id, model, new Date());
        },

        restoreState: function (silent) {
            var value = null;
            if (window.localStorage)
                value = window.localStorage.getItem("$ej$" + this.pluginName + this._id);
            else if (document.cookie)
                value = ej.cookie.get("$ej$" + this.pluginName + this._id);

            if (value) {
                var model = JSON.parse(value);

                if (this._restoreState) {
                    this._restoreState(model.customPersists);
                    delete model.customPersists;
                }

                if (ej.isNullOrUndefined(model) === false)
                    if (!ej.isNullOrUndefined(model.ignoreOnPersist)) {
                        this._ignoreOnPersist = model.ignoreOnPersist;
                        delete model.ignoreOnPersist;
                    } else if (!ej.isNullOrUndefined(model.addToPersist)) {
                        this._addToPersist = model.addToPersist;
                        delete model.addToPersist;
                    }
            }
            if (!ej.isNullOrUndefined(model) && !ej.isNullOrUndefined(this._ignoreOnPersist)) {
                for(var i = 0, len =  this._ignoreOnPersist.length; i < len; i++) {
					if (this._ignoreOnPersist[i].indexOf('.') !== -1)
                        ej.createObject(this._ignoreOnPersist[i], ej.getObject(this._ignoreOnPersist[i], this.model), model);
                    else
                        model[this._ignoreOnPersist[i]] = this.model[this._ignoreOnPersist[i]];
				}
				if(this.model.ngTemplateId && this.model.ngTemplateId != model.ngTemplateId)
				   model.ngTemplateId = this.model.ngTemplateId;			   
                this.model = model;
            }
            else
                this.model = $.extend(true, this.model, model);

            if (!silent && value && this._setModel)
                this._setModel(this.model);
        },

        //to prevent persistence
        ignoreOnPersist: function (properties) {
            var collection = [];
            if (typeof (properties) == "object")
                collection = properties;
            else if (typeof (properties) == 'string')
                collection.push(properties);
            if (this._addToPersist === undefined) {
                this._ignoreOnPersist = this._ignoreOnPersist || [];
                for (var i = 0; i < collection.length; i++) {
                    this._ignoreOnPersist.push(collection[i]);
                }
            } else {
                for (var i = 0; i < collection.length; i++) {
                    var index = this._addToPersist.indexOf(collection[i]);
                    this._addToPersist.splice(index, 1);
                }
            }
        },

        //to maintain persistence
        addToPersist: function (properties) {
            var collection = [];
            if (typeof (properties) == "object")
                collection = properties;
            else if (typeof (properties) == 'string')
                collection.push(properties);
            if (this._addToPersist === undefined) {
                this._ignoreOnPersist = this._ignoreOnPersist || [];
                for (var i = 0; i < collection.length; i++) {
                    var index = this._ignoreOnPersist.indexOf(collection[i]);
                    this._ignoreOnPersist.splice(index, 1);
                }
            } else {
                for (var i = 0; i < collection.length; i++) {
                    if ($.inArray(collection[i], this._addToPersist) === -1)
                        this._addToPersist.push(collection[i]);
                }
            }
        },

        // Get formatted text 
        formatting: function (formatstring, str, locale) {
            formatstring = formatstring.replace(/%280/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            locale = ej.preferredCulture(locale) ? locale : "en-US";
            var s = formatstring;
            var frontHtmlidx, FrontHtml, RearHtml, lastidxval;
            frontHtmlidx = formatstring.split("{0:");
            lastidxval = formatstring.split("}");
            FrontHtml = frontHtmlidx[0];
            RearHtml = lastidxval[1];
            if (typeof (str) == "string" && $.isNumeric(str))
                str = Number(str);
            if (formatstring.indexOf("{0:") != -1) {
                var toformat = new RegExp("\\{0(:([^\\}]+))?\\}", "gm");
                var formatVal = toformat.exec(formatstring);
                if (formatVal != null && str != null) {
                    if (FrontHtml != null && RearHtml != null)
                        str = FrontHtml + ej.format(str, formatVal[2], locale) + RearHtml;
                    else
                        str = ej.format(str, formatVal[2], locale);
                } else if (str != null)
                    str = str;
                else
                    str = "";
                return str;
            } else if (s.startsWith("{") && !s.startsWith("{0:")) {
                var fVal = s.split(""), str = (str || "") + "", strSplt = str.split(""), formats = /[0aA\*CN<>\?]/gm;
                for (var f = 0, f, val = 0; f < fVal.length; f++)
                    fVal[f] = formats.test(fVal[f]) ? "{" + val++ + "}" : fVal[f];
                return String.format.apply(String, [fVal.join("")].concat(strSplt)).replace('{', '').replace('}', '');
            } else if (this.data != null && this.data.Value == null) {
                $.each(this.data, function (dataIndex, dataValue) {
                    s = s.replace(new RegExp('\\{' + dataIndex + '\\}', 'gm'), dataValue);
                });
                return s;
            } else {
                return this.data.Value;
            }
        },
    };

    ej.WidgetBase = function () {
    }

    var iterateAndRemoveProps = function (source, target) {
		if(source instanceof Array) {
			for (var i = 0, len = source.length; i < len; i++) {
				prop = source[i];
				if(prop === target[prop])
					delete target[prop];
				if ($.isPlainObject(target[prop]) && $.isPlainObject(prop))
					iterateAndRemoveProps(prop, target[prop]);
			}
		}
		else {
			for (var prop in source) {
				if (source[prop] === target[prop])
					delete target[prop];
				if ($.isPlainObject(target[prop]) && $.isPlainObject(source[prop]))
					iterateAndRemoveProps(source[prop], target[prop]);
			}
		}
    }

    ej.widget = function (pluginName, className, proto) {
        /// <summary>Widget helper for developers, this set have predefined function to jQuery plug-ins</summary>
        /// <param name="pluginName" type="String">the plugin name that will be added in jquery.fn</param>
        /// <param name="className" type="String">the class name for your plugin, this will help create default cssClas</param>
        /// <param name="proto" type="Object">prototype for of the plug-in</param>

        if (typeof pluginName === "object") {
            proto = className;
            for (var prop in pluginName) {
                var name = pluginName[prop];

                if (name instanceof Array) {
                    proto._rootCSS = name[1];
                    name = name[0];
                }

                ej.widget(prop, name, proto);

                if (pluginName[prop] instanceof Array)
                    proto._rootCSS = "";
            }

            return;
        }

        var nameSpace = proto._rootCSS || ej.getNameSpace(className);

        proto = ej.defineClass(className, function (element, options) {

            this.sfType = className;
            this.pluginName = pluginName;
            this.instance = pInstance;

            if (ej.isNullOrUndefined(this._setFirst))
                this._setFirst = true;

            this["ob.values"] = {};

            $.extend(this, ej.widgetBase);

            if (this.dataTypes) {
                for (var property in options) {
                    var returnValue = this._isValidModelValue(property, this.dataTypes, options);
                    if (returnValue !== true)
                        throw "setModel - Invalid input for property :" + property + " - " + returnValue;
                }
            }

            var arr = (element.data("ejWidgets") || []);
            arr.push(pluginName);
            element.data("ejWidgets", arr);

            for (var i = 0; ej.widget.observables && this.observables && i < this.observables.length; i++) {
                var t = ej.getObject(this.observables[i], options);
                if (t) ej.createObject(this.observables[i], ej.widget.observables.register(t, this.observables[i], this, element), options);
            }

            this.element = element.jquery ? element : $(element);
            this.model = copyObject(true, {}, proto.prototype.defaults, options);
            this.model.keyConfigs = copyObject(this.keyConfigs);

            this.element.addClass(nameSpace + " e-js").data(pluginName, this);

            this._id = element[0].id;

            if (this.model.enablePersistence) {
                if (window.localStorage && !ej.isNullOrUndefined(ej.persistStateVersion) && window.localStorage.getItem("persistKey") != ej.persistStateVersion) {
                    for (var i in window.localStorage) {
                        if (i.indexOf("$ej$") != -1) {
                            window.localStorage.removeItem(i); //removing the previously stored plugin item from local storage
							window.localStorage.setItem("persistKey", ej.persistStateVersion);
						}				
                    }
                }
                else if (document.cookie && !ej.isNullOrUndefined(ej.persistStateVersion) && ej.cookie.get("persistKey") != ej.persistStateVersion) {
                    var model;
                    var splits = document.cookie.split(/; */);
                    for (var k in splits) {
                        if (k.indexOf("$ej$") != -1) {
                            ej.cookie.set(k.split("=")[0], model, new Date()); //removing the previously stored plugin item from local storage
							ej.cookie.set("persistKey", ej.persistStateVersion);
						}		
                    }
                }
                this._persistHandler = ej.proxy(this.persistState, this);
                $(window).on("unload", this._persistHandler);
                this.restoreState(true);
            }

            this._init(options);

            if (typeof this.model.keyConfigs === "object" && !(this.model.keyConfigs instanceof Array)) {
                var requiresEvt = false;
                if (this.model.keyConfigs.focus)
                    this.element.attr("accesskey", this.model.keyConfigs.focus);

                for (var keyProps in this.model.keyConfigs) {
                    if (keyProps !== "focus") {
                        requiresEvt = true;
                        break;
                    }
                }

                if (requiresEvt && this._keyPressed) {
                    var el = element, evt = "keydown";

                    if (this.keySettings) {
                        el = this.keySettings.getElement ? this.keySettings.getElement() || el : el;
                        evt = this.keySettings.event || evt;
                    }

                    this._on(el, evt, function (e) {
                        if (!this.model.keyConfigs) return;

                        var action = keyFn.getActionFromCode(this.model.keyConfigs, e.which, e.ctrlKey, e.shiftKey, e.altKey);
                        var arg = {
                            code: e.which,
                            ctrl: e.ctrlKey,
                            alt: e.altKey,
                            shift: e.shiftKey
                        };
                        if (!action) return;

                        if (this._keyPressed(action, e.target, arg, e) === false)
                            e.preventDefault();
                    });
                }
            }
            this._trigger("create");
        }, proto);

        $.fn[pluginName] = function (options) {
            var opt = options, args;
            for (var i = 0; i < this.length; i++) {

                var $this = $(this[i]),
                    pluginObj = $this.data(pluginName),
                    isAlreadyExists = pluginObj && $this.hasClass(nameSpace),
                    obj = null;

                if (this.length > 0 && $.isPlainObject(opt))
                    options = ej.copyObject({}, opt);

                // ----- plug-in creation/init
                if (!isAlreadyExists) {
                    if (proto.prototype._requiresID === true && !$(this[i]).attr("id")) {
                        $this.attr("id", getUid("ejControl_"));
                    }
                    if (!options || typeof options === "object") {
                        if (proto.prototype.defaults && !ej.isNullOrUndefined(ej.setCulture) && "locale" in proto.prototype.defaults && pluginName != "ejChart") {
                            if (options && !("locale" in options)) options.locale = ej.setCulture().name;
                            else if (ej.isNullOrUndefined(options)) {
                                options = {}; options.locale = ej.setCulture().name;
                            }
                        }
                        new proto($this, options);
                    }
                    else {
                        throwError(pluginName + ": methods/properties can be accessed only after plugin creation");
                    }
                    continue;
                }

                if (!options) continue;

                args = [].slice.call(arguments, 1);

                if (this.length > 0 && args[0] && opt === "option" && $.isPlainObject(args[0])) {
                    args[0] = ej.copyObject({}, args[0]);
                }

                // --- Function/property set/access
                if ($.isPlainObject(options)) {
                    // setModel using JSON object
                    pluginObj.setModel(options);
                }

                    // function/property name starts with "_" is private so ignore it.
                else if (options.indexOf('_') !== 0
                    && !ej.isNullOrUndefined(obj = ej.getObject(options, pluginObj))
                    || options.indexOf("model.") === 0) {

                    if (!obj || !$.isFunction(obj)) {

                        // if property is accessed, then break the jquery chain
                        if (arguments.length == 1)
                            return obj;

                        //setModel using string input
                        pluginObj.option(options, arguments[1]);

                        continue;
                    }

                    var value = obj.apply(pluginObj, args);

                    // If function call returns any value, then break the jquery chain
                    if (value !== undefined)
                        return value;

                } else {
                    throwError(className + ": function/property - " + options + " does not exist");
                }
            }
            if (pluginName.indexOf("ejm") != -1)
                ej.widget.registerInstance($this, pluginName, className, proto.prototype);
            // maintaining jquery chain
            return this;
        };

        ej.widget.register(pluginName, className, proto.prototype);
        ej.loadLocale(pluginName);
    };

    ej.loadLocale = function (pluginName) {
        var i, len, locales = ej.locales;
        for (i = 0, len = locales.length; i < len; i++)
            $.fn["Locale_" + locales[i]](pluginName);
    };


    $.extend(ej.widget, (function () {
        var _widgets = {}, _registeredInstances = [],

        register = function (pluginName, className, prototype) {
            if (!ej.isNullOrUndefined(_widgets[pluginName]))
                throwError("ej.widget : The widget named " + pluginName + " is trying to register twice.");

            _widgets[pluginName] = { name: pluginName, className: className, proto: prototype };

            ej.widget.extensions && ej.widget.extensions.registerWidget(pluginName);
        },
        registerInstance = function (element, pluginName, className, prototype) {
            _registeredInstances.push({ element: element, pluginName: pluginName, className: className, proto: prototype });
        }

        return {
            register: register,
            registerInstance: registerInstance,
            registeredWidgets: _widgets,
            registeredInstances: _registeredInstances
        };

    })());

    ej.widget.destroyAll = function (elements) {
        if (!elements || !elements.length) return;

        for (var i = 0; i < elements.length; i++) {
            var data = elements.eq(i).data(), wds = data["ejWidgets"];
            if (wds && wds.length) {
                for (var j = 0; j < wds.length; j++) {
                    if (data[wds[j]] && data[wds[j]].destroy)
                        data[wds[j]].destroy();
                }
            }
        }
    };

    ej.cookie = {
        get: function (name) {
            var value = RegExp(name + "=([^;]+)").exec(document.cookie);

            if (value && value.length > 1)
                return value[1];

            return undefined;
        },
        set: function (name, value, expiryDate) {
            if (typeof value === "object")
                value = JSON.stringify(value);

            value = escape(value) + ((expiryDate == null) ? "" : "; expires=" + expiryDate.toUTCString());
            document.cookie = name + "=" + value;
        }
    };

    var keyFn = {
        getActionFromCode: function (keyConfigs, keyCode, isCtrl, isShift, isAlt) {
            isCtrl = isCtrl || false;
            isShift = isShift || false;
            isAlt = isAlt || false;

            for (var keys in keyConfigs) {
                if (keys === "focus") continue;

                var key = keyFn.getKeyObject(keyConfigs[keys]);
                for (var i = 0; i < key.length; i++) {
                    if (keyCode === key[i].code && isCtrl == key[i].isCtrl && isShift == key[i].isShift && isAlt == key[i].isAlt)
                        return keys;
                }
            }
            return null;
        },
        getKeyObject: function (key) {
            var res = {
                isCtrl: false,
                isShift: false,
                isAlt: false
            };
            var tempRes = $.extend(true, {}, res);
            var $key = key.split(","), $res = [];
            for (var i = 0; i < $key.length; i++) {
                var rslt = null;
                if ($key[i].indexOf("+") != -1) {
                    var k = $key[i].split("+");
                    for (var j = 0; j < k.length; j++) {
                        rslt = keyFn.getResult($.trim(k[j]), res);
                    }
                }
                else {
                    rslt = keyFn.getResult($.trim($key[i]), $.extend(true, {}, tempRes));
                }
                $res.push(rslt);
            }
            return $res;
        },
        getResult: function (key, res) {
            if (key === "ctrl")
                res.isCtrl = true;
            else if (key === "shift")
                res.isShift = true;
            else if (key === "alt")
                res.isAlt = true;
            else res.code = parseInt(key, 10);
            return res;
        }
    };

    ej.getScrollableParents = function (element) {
        return $(element).parentsUntil("html").filter(function () {
            return $(this).css("overflow") != "visible";
        }).add($(window));
    }
    ej.browserInfo = function () {
        var browser = {}, clientInfo = [],
        browserClients = {
            opera: /(opera|opr)(?:.*version|)[ \/]([\w.]+)/i, edge: /(edge)(?:.*version|)[ \/]([\w.]+)/i, webkit: /(chrome)[ \/]([\w.]+)/i, safari: /(webkit)[ \/]([\w.]+)/i, msie: /(msie|trident) ([\w.]+)/i, mozilla: /(mozilla)(?:.*? rv:([\w.]+)|)/i
        };
        for (var client in browserClients) {
            if (browserClients.hasOwnProperty(client)) {
                clientInfo = navigator.userAgent.match(browserClients[client]);
                if (clientInfo) {
                    browser.name = clientInfo[1].toLowerCase() == "opr" ? "opera" : clientInfo[1].toLowerCase();
                    browser.version = clientInfo[2];
                    browser.culture = {};
                    browser.culture.name = browser.culture.language = navigator.language || navigator.userLanguage;
                    if (typeof (ej.globalize) != 'undefined') {
                        var oldCulture = ej.preferredCulture().name;
                        var culture = (navigator.language || navigator.userLanguage) ? ej.preferredCulture(navigator.language || navigator.userLanguage) : ej.preferredCulture("en-US");
                        for (var i = 0; (navigator.languages) && i < navigator.languages.length; i++) {
                            culture = ej.preferredCulture(navigator.languages[i]);
                            if (culture.language == navigator.languages[i])
                                break;
                        }
                        ej.preferredCulture(oldCulture);
                        $.extend(true, browser.culture, culture);
                    }
                    if (!!navigator.userAgent.match(/Trident\/7\./)) {
                        browser.name = "msie";
                    }
                    break;
                }
            }
        }
        browser.isMSPointerEnabled = (browser.name == 'msie') && browser.version > 9 && window.navigator.msPointerEnabled;
        browser.pointerEnabled = window.navigator.pointerEnabled;
        return browser;
    };
    ej.eventType = {
        mouseDown: "mousedown touchstart",
        mouseMove: "mousemove touchmove",
        mouseUp: "mouseup touchend",
        mouseLeave: "mouseleave touchcancel",
        click: "click touchend"
    };

    ej.event = function (type, data, eventProp) {

        var e = $.extend(eventProp || {},
            {
                "type": type,
                "model": data,
                "cancel": false
            });

        return e;
    };

    ej.proxy = function (fn, context, arg) {
        if (!fn || typeof fn !== "function")
            return null;

        if ('on' in fn && context)
            return arg ? fn.on(context, arg) : fn.on(context);

        return function () {
            var args = arg ? [arg] : []; args.push.apply(args, arguments);
            return fn.apply(context || this, args);
        };
    };

    ej.hasStyle = function (prop) {
        var style = document.documentElement.style;

        if (prop in style) return true;

        var prefixs = ['ms', 'Moz', 'Webkit', 'O', 'Khtml'];

        prop = prop[0].toUpperCase() + prop.slice(1);

        for (var i = 0; i < prefixs.length; i++) {
            if (prefixs[i] + prop in style)
                return true;
        }

        return false;
    };

    Array.prototype.indexOf = Array.prototype.indexOf || function (searchElement) {
        var len = this.length;

        if (len === 0) return -1;

        for (var i = 0; i < len; i++) {
            if (i in this && this[i] === searchElement)
                return i;
        }
        return -1;
    };

    String.prototype.startsWith = String.prototype.startsWith || function (key) {
        return this.slice(0, key.length) === key;
    };
    var copyObject = ej.copyObject = function (isDeepCopy, target) {
        var start = 2, current, source;
        if (typeof isDeepCopy !== "boolean") {
            start = 1;
        }
        var objects = [].slice.call(arguments, start);
        if (start === 1) {
            target = isDeepCopy;
            isDeepCopy = undefined;
        }

        for (var i = 0; i < objects.length; i++) {
            for (var prop in objects[i]) {
                current = target[prop], source = objects[i][prop];

                if (source === undefined || current === source || objects[i] === source || target === source)
                    continue;
                if (source instanceof Array) {
                    if (i === 0 && isDeepCopy) {
                        if (prop === "dataSource" || prop === "data" || prop === "predicates")
                            target[prop] = source.slice();
					  else  {
                        target[prop] = new Array();
                        for (var j = 0; j < source.length; j++) {
                            copyObject(true, target[prop], source);
                        }
					  }
                    }
                    else
                        target[prop] = source.slice();
                }
                else if (ej.isPlainObject(source)) {
                    target[prop] = current || {};
                    if (isDeepCopy)
                        copyObject(isDeepCopy, target[prop], source);
                    else
                        copyObject(target[prop], source);
                } else
                    target[prop] = source;
            }
        }
        return target;
    };
    var pInstance = function () {
        return this;
    }

    var _uid = 0;
    var getUid = function (prefix) {
        return prefix + _uid++;
    }

    ej.template = {};

    ej.template.render = ej.template["text/x-jsrender"] = function (self, selector, data, index, prop) {
        if (selector.slice(0, 1) !== "#")
            selector = ["<div>", selector, "</div>"].join("");
        var property = { prop: prop, index: index };
        return $(selector).render(data, property);
    }

    ej.isPlainObject = function (obj) {
        if (!obj) return false;
        if (ej.DataManager !== undefined && obj instanceof ej.DataManager) return false;
        if (typeof obj !== "object" || obj.nodeType || jQuery.isWindow(obj)) return false;
        try {
            if (obj.constructor &&
                !obj.constructor.prototype.hasOwnProperty("isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            return false;
        }

        var key, ownLast = ej.support.isOwnLast;
        for (key in obj) {
            if (ownLast) break;
        }

        return key === undefined || obj.hasOwnProperty(key);
    };
    var getValueFn = false;
    ej.util.valueFunction = function (prop) {
        return function (value, getObservable) {
            var val = ej.getObject(prop, this.model);

            if (getValueFn === false)
                getValueFn = ej.getObject("observables.getValue", ej.widget);

            if (value === undefined) {
                if (!ej.isNullOrUndefined(getValueFn)) {
                    return getValueFn(val, getObservable);
                }
                return typeof val === "function" ? val.call(this) : val;
            }

            if (typeof val === "function") {
                this["ob.values"][prop] = value;
                val.call(this, value);
            }
            else
                ej.createObject(prop, value, this.model);
        }
    };
    ej.util.getVal = function (val) {
        if (typeof val === "function")
            return val();
        return val;
    };
    ej.support = {
        isOwnLast: function () {
            var fn = function () { this.a = 1; };
            fn.prototype.b = 1;

            for (var p in new fn()) {
                return p === "b";
            }
        }(),
        outerHTML: function () {
            return document.createElement("div").outerHTML !== undefined;
        }()
    };

    var throwError = ej.throwError = function (er) {
        try {
            throw new Error(er);
        } catch (e) {
            throw e.message + "\n" + e.stack;
        }
    };

    ej.getRandomValue = function (min, max) {
        if (min === undefined || max === undefined)
            return ej.throwError("Min and Max values are required for generating a random number");

        var rand;
        if ("crypto" in window && "getRandomValues" in crypto) {
            var arr = new Uint16Array(1);
            window.crypto.getRandomValues(arr);
            rand = arr[0] % (max - min) + min;
        }
        else rand = Math.random() * (max - min) + min;
        return rand | 0;
    }

    ej.extensions = {};
    ej.extensions.modelGUID = "{0B1051BA-1CCB-42C2-A3B5-635389B92A50}";
})(window.jQuery, window.Syncfusion);
(function () {
    $.fn.addEleAttrs = function (json) {
        var $this = $(this);
        $.each(json, function (i, attr) {
            if (attr && attr.specified) {
                $this.attr(attr.name, attr.value);
            }
        });

    };
    $.fn.removeEleAttrs = function (regex) {
        return this.each(function () {
            var $this = $(this),
                names = [],
                attrs = $(this.attributes).clone();
            $.each(attrs, function (i, attr) {
                if (attr && attr.specified && regex.test(attr.name)) {
                    $this.removeAttr(attr.name);
                }
            });
        });
    };
    $.fn.attrNotStartsWith = function (regex) {
        var proxy = this;
        var attributes = [], attrs;
        this.each(function () {
            attrs = $(this.attributes).clone();
        });
        for ( var i = 0; i < attrs.length; i++) {
            if (attrs[i] && attrs[i].specified && regex.test(attrs[i].name)) {
                continue
            }
            else
                attributes.push(attrs[i])
        }
        return attributes;

    }
    $.fn.removeEleEmptyAttrs = function () {
        return this.each(function () {
            var $this = $(this),
                names = [],
                attrs = $(this.attributes).clone();
            $.each(attrs, function (i, attr) {
                if (attr && attr.specified && attr.value === "") {
                    $this.removeAttr(attr.name);
                }
            });
        });
    };
    $.extend($.support, {
        has3d: ej.addPrefix('perspective') in ej.styles,
        hasTouch: 'ontouchstart' in window,
        hasPointer: navigator.msPointerEnabled,
        hasTransform: ej.userAgent() !== false,
        pushstate: "pushState" in history &&
        "replaceState" in history,
        hasTransition: ej.addPrefix('transition') in ej.styles
    });
    //Ensuring elements having attribute starts with 'ejm-' 
    $.extend($.expr[':'], {
        attrNotStartsWith: function (element, index, match) {
            var i, attrs = element.attributes;
            for (i = 0; i < attrs.length; i++) {
                if (attrs[i].nodeName.indexOf(match[3]) === 0) {
                    return false;
                }
            }
            return true;
        }
    });
    //addBack() is supported from Jquery >1.8 and andSelf() supports later version< 1.8. support for both the method is provided by extending the JQuery function.
    var oldSelf = $.fn.andSelf || $.fn.addBack;
    $.fn.andSelf = $.fn.addBack = function () {
        return oldSelf.apply(this, arguments);
    };
})();;
;
window.ej = window.Syncfusion = window.Syncfusion || {};

(function ($, ej, doc, undefined) {
    'use strict';

  
    ej.DataManager = function (dataSource, query, adaptor) {
          if (!(this instanceof ej.DataManager))
            return new ej.DataManager(dataSource, query, adaptor);

        if (!dataSource)
            dataSource = [];
        adaptor = adaptor || dataSource.adaptor;

        if (typeof (adaptor) === "string") 
            adaptor = new ej[adaptor]();
        var data = [], self = this;

        if (dataSource instanceof Array) {
            // JSON array
            data = {
                json: dataSource,
                offline: true
            };

        } else if (typeof dataSource === "object") {
            if ($.isPlainObject(dataSource)) {
                if (!dataSource.json)
                    dataSource.json = [];
                if (dataSource.table)
                    dataSource.json = this._getJsonFromElement(dataSource.table, dataSource.headerOption);
                data = {
                    url: dataSource.url,
                    insertUrl: dataSource.insertUrl,
                    removeUrl: dataSource.removeUrl,
                    updateUrl: dataSource.updateUrl,
                    crudUrl: dataSource.crudUrl,
                    batchUrl: dataSource.batchUrl,
                    json: dataSource.json,
                    headers: dataSource.headers,
                    accept: dataSource.accept,
                    data: dataSource.data,
					async : dataSource.async,
                    timeTillExpiration: dataSource.timeTillExpiration,
                    cachingPageSize: dataSource.cachingPageSize,
                    enableCaching: dataSource.enableCaching,
                    requestType: dataSource.requestType,
                    key: dataSource.key,
                    crossDomain: dataSource.crossDomain,
                    antiForgery: dataSource.antiForgery,
                    jsonp: dataSource.jsonp,
                    dataType: dataSource.dataType,
                    enableAjaxCache: dataSource.enableAjaxCache,
                    offline: dataSource.offline !== undefined ? dataSource.offline : dataSource.adaptor == "remoteSaveAdaptor" || dataSource.adaptor instanceof ej.remoteSaveAdaptor ? false : dataSource.url ? false : true,
                    requiresFormat: dataSource.requiresFormat
                };
            } else if (dataSource.jquery || isHtmlElement(dataSource)) {
                data = {
                    json: this._getJsonFromElement(dataSource),
                    offline: true,
                    table: dataSource
                };
            }
        } else if (typeof dataSource === "string") {
            data = {
                url: dataSource,
                offline: false,
                dataType: "json",
                json: []
            };
        }

        if (data.requiresFormat === undefined && !ej.support.cors)
            data.requiresFormat = isNull(data.crossDomain) ? true : data.crossDomain;
         if(data.antiForgery){
        this.antiForgeryToken();
        }
        if (data.dataType === undefined)
            data.dataType = "json";
        this.dataSource = data;
        this.defaultQuery = query;

        if (data.url && data.offline && !data.json.length) {
            this.isDataAvailable = false;
            this.adaptor = adaptor || new ej.ODataAdaptor();
            this.dataSource.offline = false;
            this.ready = this.executeQuery(query || ej.Query()).done(function (e) {
                self.dataSource.offline = true;
                self.isDataAvailable = true;
                data.json = e.result;
                self.adaptor = new ej.JsonAdaptor();
            });
        }
        else
            this.adaptor = data.offline ? new ej.JsonAdaptor() : new ej.ODataAdaptor();
        if (!data.jsonp && this.adaptor instanceof ej.ODataAdaptor)
            data.jsonp = "callback";
        this.adaptor = adaptor || this.adaptor;
        if (data.enableCaching)
            this.adaptor = new ej.CacheAdaptor(this.adaptor, data.timeTillExpiration, data.cachingPageSize);
        return this;
    };

    ej.DataManager.prototype = {
        setDefaultQuery: function (query) {
            this.defaultQuery = query;
        },
	
        executeQuery: function (query, done, fail, always) {
            if (typeof query === "function") {
                always = fail;
                fail = done;
                done = query;
                query = null;
            }

            if (!query)
                query = this.defaultQuery;

            if (!(query instanceof ej.Query))
                throwError("DataManager - executeQuery() : A query is required to execute");

            var deffered = $.Deferred();

            deffered.then(done, fail, always);
            var args = { query: query };

            if (!this.dataSource.offline && this.dataSource.url != undefined) {
				 var result = this.adaptor.processQuery(this, query);
                if (!ej.isNullOrUndefined(result.url))
                    this._makeRequest(result, deffered, args, query);
                else {
                    nextTick(function () {
                        args = this._getDeferedArgs(query, result, args);
                        deffered.resolveWith(this, [args]);;
                    }, this);
                }
            } else {
				if(!ej.isNullOrUndefined(this.dataSource.async) && this.dataSource.async == false)
					this._localQueryProcess(query, args, deffered);
				else{
					nextTick(function () {
						this._localQueryProcess(query, args, deffered);
					}, this);
				}
            }
            return deffered.promise();
        },
		_localQueryProcess: function(query, args, deffered){
			var res = this.executeLocal(query);
			args = this._getDeferedArgs(query, res, args);
			deffered.resolveWith(this, [args]);
		},
        _getDeferedArgs: function (query, result, args) {
            if (query._requiresCount) {
                args.result = result.result;
                args.count = result.count;
            } else
                args.result = result;
            args.getTableModel = getTableModel(query._fromTable, args.result, this);
            args.getKnockoutModel = getKnockoutModel(args.result);
            return args;
        },
	
        executeLocal: function (query) {
            if (!this.defaultQuery && !(query instanceof ej.Query))
                throwError("DataManager - executeLocal() : A query is required to execute");

            if (!this.dataSource.json)
                throwError("DataManager - executeLocal() : Json data is required to execute");

            query = query || this.defaultQuery;

            var result = this.adaptor.processQuery(this, query);

            if (query._subQuery) {
                var from = query._subQuery._fromTable, lookup = query._subQuery._lookup,
                    res = query._requiresCount ? result.result : result;

                if (lookup && lookup instanceof Array) {
                    buildHierarchy(query._subQuery._fKey, from, res, lookup, query._subQuery._key);
                }

                for (var j = 0; j < res.length; j++) {
                    if (res[j][from] instanceof Array) {
                        res[j] = $.extend({}, res[j]);
                        res[j][from] = this.adaptor.processResponse(query._subQuery.using(ej.DataManager(res[j][from].slice(0))).executeLocal(), this, query);
                    }
                }
            }

            return this.adaptor.processResponse(result, this, query);
        },

        _makeRequest: function (url, deffered, args, query) {
            var isSelector = !!query._subQuerySelector;

            var fnFail = $proxy(function (e) {
                args.error = e;
                deffered.rejectWith(this, [args]);
            }, this);

            var process = $proxy(function (data, count, xhr, request, actual, aggregates, virtualSelectRecords) {
                if (isSelector) return;

                args.xhr = xhr;
                args.count = parseInt(count, 10);
                args.result = data;
                args.request = request;
                args.aggregates = aggregates;
                args.getTableModel = getTableModel(query._fromTable, data, this);
                args.getKnockoutModel = getKnockoutModel(data);
                args.actual = actual;
                args.virtualSelectRecords = virtualSelectRecords;
                deffered.resolveWith(this, [args]);

            }, this);

            var fnQueryChild = $proxy(function (data, selector) {
                var subDeffer = $.Deferred(),
                    childArgs = { parent: args };

                query._subQuery._isChild = true;

                var subUrl = this.adaptor.processQuery(this, query._subQuery, data ? this.adaptor.processResponse(data) : selector);

                var childReq = this._makeRequest(subUrl, subDeffer, childArgs, query._subQuery);

                if(!isSelector)
                    subDeffer.then(function (subData) {
                        if (data) {
                            buildHierarchy(query._subQuery._fKey, query._subQuery._fromTable, data, subData, query._subQuery._key);
                            process(data);
                        }
                    }, fnFail);

                return childReq;
            }, this);

            var fnSuccess = proxy(function (data, status, xhr, request) {
                if (xhr.getResponseHeader("Content-Type").indexOf("xml") == -1 && ej.dateParse)
                    data = ej.parseJSON(data);
                var result = this.adaptor.processResponse(data, this, query, xhr, request), count = 0, aggregates = null;
                var virtualSelectRecords = data.virtualSelectRecords;
                if (query._requiresCount) {
                    count = result.count;
                    aggregates = result.aggregates;
                    result = result.result;
                }

                if (!query._subQuery) {
                    process(result, count, xhr, request, data, aggregates, virtualSelectRecords);
                    return;
                }

                if (!isSelector)
                    fnQueryChild(result);

            }, this);

            var req = $.extend({
                type: "GET",
                dataType: this.dataSource.dataType,
                crossDomain: this.dataSource.crossDomain,
                jsonp: this.dataSource.jsonp,
                cache: ej.isNullOrUndefined(this.dataSource.enableAjaxCache) ? true: this.dataSource.enableAjaxCache,
                beforeSend: $proxy(this._beforeSend, this),
                processData: false,
                success: fnSuccess,
                error: fnFail
            }, url);

            if ("async" in this.dataSource)
                req.async = this.dataSource.async;

            req = $.ajax(req);

            if (isSelector) {
                var res = query._subQuerySelector.call(this, { query: query._subQuery, parent: query });

                if (res && res.length) {
                    req = $.when(req, fnQueryChild(null, res));

                    req.then(proxy(function (pData, cData, requests) {
                        var pResult = this.adaptor.processResponse(pData[0], this, query, pData[2], requests[0]), count = 0;
                        if (query._requiresCount) {
                            count = pResult.count;
                            pResult = pResult.result;
                        }
                        var cResult = this.adaptor.processResponse(cData[0], this, query._subQuery, cData[2], requests[1]), count = 0;
                        if (query._subQuery._requiresCount) {
                            count = cResult.count;
                            cResult = cResult.result;
                        }

                        buildHierarchy(query._subQuery._fKey, query._subQuery._fromTable, pResult, cResult, query._subQuery._key);
                        isSelector = false;
                        process(pResult, count, pData[2]);

                    }, this), fnFail);
                } else {
                    isSelector = false;
                }
            }

            return req;
        },

        _beforeSend: function (request, settings) {
            this.adaptor.beforeSend(this, request, settings);

            var headers = this.dataSource.headers, props;
            for (var i = 0; headers && i < headers.length; i++) {
                props = [];
                for (var prop in headers[i]) {
                    props.push(prop);
                    request.setRequestHeader(prop, headers[i][prop]);
                }
            }
        },
	
        saveChanges: function (changes, key, tableName, query) {

            if (tableName instanceof ej.Query) {
                query = tableName;
                tableName = null;
            }

            var args = {
                url: tableName,
                key: key || this.dataSource.key
            };

            var req = this.adaptor.batchRequest(this, changes, args, query);

            if (this.dataSource.offline) {
                return req;
            }

            var deff = $.Deferred();
            $.ajax($.extend({
                beforeSend: $proxy(this._beforeSend, this),
                success: proxy(function (data, status, xhr, request) {
                    deff.resolveWith(this, [this.adaptor.processResponse(data, this, null, xhr, request, changes, key)]);
                }, this),
                error: function (e) {
                    deff.rejectWith(this, [{ error: e }]);
                }
            }, req));

            return deff.promise();
        },
	
        insert: function (data, tableName, query) {       
            // Additional paramater is included based on the task (JS-56499) to prevent addition of serverOffset multiple times
            data = p.replacer(data, true);

            if (tableName instanceof ej.Query) {
                query = tableName;
                tableName = null;
            }

            var res = this.adaptor.insert(this, data, tableName, query);

            if (this.dataSource.offline) {
                return res;
            }            

            var deffer = $.Deferred();

            $.ajax($.extend({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                processData: false,
                beforeSend: $proxy(this._beforeSend, this),
                success: proxy(function (record, status, xhr, request) {
                    try {
                        if (ej.isNullOrUndefined(record))
                            record = [];
                        else
                            p.parseJson(record);
                    }
                    catch (e) {
                        record = [];
                    }
                    record = this.adaptor.processResponse(p.parseJson(record), this, null, xhr, request);
                    deffer.resolveWith(this, [{ record: record, dataManager: this }]);
                }, this),
                error: function (e) {
                    deffer.rejectWith(this, [{ error: e, dataManager: this }]);
                }
            }, res));

            return deffer.promise();
        },
        antiForgeryToken: function () {
           var tokens = {};
           if(ej.isNullOrUndefined($("input[name='_ejRequestVerifyToken']").val()))
                var input = ej.buildTag("input", "", "", { type: "hidden", name: "_ejRequestVerifyToken" , value: ej.getGuid()}).appendTo("body"); 
           else
               $("input[name='_ejRequestVerifyToken']").val(ej.getGuid());
            ej.cookie.set("_ejRequestVerifyToken", $("input[name='_ejRequestVerifyToken']").val());
            tokens ={name: "_ejRequestVerifyToken", value: $("input[name='_ejRequestVerifyToken']").val()}
            return tokens;
        },
        remove: function (keyField, value, tableName, query) {
            if (typeof value === "object")
                value = value[keyField];

            if (tableName instanceof ej.Query) {
                query = tableName;
                tableName = null;
            }

            var res = this.adaptor.remove(this, keyField, value, tableName, query);

            if (this.dataSource.offline)
                return res;          

            var deffer = $.Deferred();
            $.ajax($.extend({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                beforeSend: $proxy(this._beforeSend, this),
                success: proxy(function (record, status, xhr, request) {
                    try {
                        if (ej.isNullOrUndefined(record))
                            record = [];
                        else
                            p.parseJson(record);
                    }
                    catch (e) {
                        record = [];
                    }
                    record = this.adaptor.processResponse(p.parseJson(record), this, null, xhr, request);
                    deffer.resolveWith(this, [{ record: record, dataManager: this }]);
                }, this),
                error: function (e) {
                    deffer.rejectWith(this, [{ error: e, dataManager: this }]);
                }
            }, res));
            return deffer.promise();
        },
	
        update: function (keyField, value, tableName, query) {
            // Additional paramater is included based on this task (JS-56499) to prevent addition of serverOffset multiple times
            value = p.replacer(value, true);

            if (tableName instanceof ej.Query) {
                query = tableName;
                tableName = null;
            }

            var res = this.adaptor.update(this, keyField, value, tableName, query);

            if (this.dataSource.offline) {
                return res;
            }           

            var deffer = $.Deferred();

           $.ajax($.extend({
                contentType: "application/json; charset=utf-8",
                beforeSend: $proxy(this._beforeSend, this),
                success: proxy(function (record, status, xhr, request) {
                    try {
                        if (ej.isNullOrUndefined(record))
                            record = [];
                        else
                            p.parseJson(record);
                    }
                    catch (e) {
                        record = [];
                    }
                    record = this.adaptor.processResponse(p.parseJson(record), this, null, xhr, request);
                    deffer.resolveWith(this, [{ record: record, dataManager: this }]);
                }, this),
                error: function (e) {
                    deffer.rejectWith(this, [{ error: e, dataManager: this }]);
                }
           }, res));

           return deffer.promise();
        },

        _getJsonFromElement: function (ds) {
            if (typeof (ds) == "string")
                ds = $($(ds).html());

            ds = ds.jquery ? ds[0] : ds;

            var tagName = ds.tagName.toLowerCase();

            if (tagName !== "table")
                throwError("ej.DataManager : Unsupported htmlElement : " + tagName);

            return ej.parseTable(ds);
        }
    };

    var buildHierarchy = function (fKey, from, source, lookup, pKey) {
        var i, grp = {}, t;
        if (lookup.result) lookup = lookup.result;

        if (lookup.GROUPGUID)
            throwError("ej.DataManager: Do not have support Grouping in hierarchy");

        for (i = 0; i < lookup.length; i++) {
            var fKeyData = ej.getObject(fKey, lookup[i]);
            t = grp[fKeyData] || (grp[fKeyData] = []);

            t.push(lookup[i]);
        }

        for (i = 0; i < source.length; i++) {
            source[i][from] = grp[ej.getObject(pKey || fKey, source[i])];
        }
    };

    var oData = {
        accept: "application/json;odata=light;q=1,application/json;odata=verbose;q=0.5",
        multipartAccept: "multipart/mixed",
        batch: "$batch",
        changeSet: "--changeset_",
        batchPre: "batch_",
        contentId: "Content-Id: ",
        batchContent: "Content-Type: multipart/mixed; boundary=",
        changeSetContent: "Content-Type: application/http\nContent-Transfer-Encoding: binary ",
        batchChangeSetContentType: "Content-Type: application/json; charset=utf-8 "
    };
    var p = {
        parseJson: function (jsonText) {
            var type = typeof jsonText;
            if (type === "string") {
                jsonText = JSON.parse(jsonText, p.jsonReviver);
            } else if (jsonText instanceof Array) {
                p.iterateAndReviveArray(jsonText);
            } else if (type === "object")
                p.iterateAndReviveJson(jsonText);
            return jsonText;
        },
        iterateAndReviveArray: function (array) {
            for (var i = 0; i < array.length; i++) {
                if (typeof array[i] === "object")
                    p.iterateAndReviveJson(array[i]);
                else if (typeof array[i] === "string" && !/^[\s]*\[|^[\s]*\{|\"/g.test(array[i]))
                    array[i] = p.jsonReviver("",array[i]);
                else
                    array[i] = p.parseJson(array[i]);
            }
        },
        iterateAndReviveJson: function (json) {
            var value;
            for (var prop in json) {
                if (prop.startsWith("__"))
                    continue;

                value = json[prop];
                if (typeof value === "object") {
                    if (value instanceof Array)
                        p.iterateAndReviveArray(value);
                    else
                        p.iterateAndReviveJson(value);
                } else
                    json[prop] = p.jsonReviver(prop, value);
            }
        },
        jsonReviver: function (field, value) {
            var s = value, regex = /[\-,/,\,.,:,]+/;
            if (typeof value === "string") {
                var ms = /^\/Date\(([+-]?[0-9]+)([+-][0-9]{4})?\)\/$/.exec(value);
                if (ms)
                    return ej.parseDateInUTC ? p.isValidDate(ms[0]) : p.replacer(new Date(parseInt(ms[1])));
                else if (ej.dateParse ? (/^(?:(\d{4}\-\d\d\-\d\d)|(\d{4}\-\d\d\-\d\d([tT][\d:\.]*){1})([zZ]|([+\-])(\d\d):?(\d\d))?)$/.test(value)) : (/^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*){1})([zZ]|([+\-])(\d\d):?(\d\d))?$/.test(value))) {
					var a = s.split(/[^0-9]/);
					if(/^(\d{4}\-\d\d\-\d\d)$/.test(value))
					  value = new Date(a[ej.dateFormat.split(regex).indexOf("yyyy")], a[ej.dateFormat.split(regex).indexOf("MM")]-1, a[ej.dateFormat.split(regex).indexOf("dd")]);					 
					else{
			          value = ej.parseDateInUTC ? p.isValidDate(value) : p.replacer(new Date(value));
                      if (isNaN(value)) 
                        value = p.replacer(new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]));						
					}
                }
            }
            return value;
        },
        isValidDate: function (value) {
            var prop = value;
            if (typeof (prop) === "string" && prop.indexOf("/Date(") == 0) {
                value = prop.replace(/\d+/, function (n) {
                    var offsetMiliseconds = new Date(parseInt(n)).getTimezoneOffset() * 60000;
                    var ticks = parseInt(n) + offsetMiliseconds;
                    return p.replacer(new Date(parseInt(ticks)));
                });
            }
            if (typeof value === "string") {
                value = value.replace("/Date(", function () { return ""; });
                value = value.replace(")/", function () { return ""; })
                var ms = new Date(value) instanceof Date;
                if (ms)
                    return new Date(value);
                else return value;
            }
            return value;
        },
        isJson: function (jsonData) {
            if(typeof jsonData[0]== "string")
                return jsonData;
            return ej.parseJSON(jsonData);
        },
        isGuid: function (value) {
            var regex = /[A-Fa-f0-9]{8}(?:-[A-Fa-f0-9]{4}){3}-[A-Fa-f0-9]{12}/i;
            var match = regex.exec(value);
            return match != null;
        },
        // Additional paramater is included based on this task (JS-56499) to prevent addition of serverOffset multiple times
        replacer: function (value, serverOffset) {

            if (ej.isPlainObject(value))
                return p.jsonReplacer(value, serverOffset);

            if (value instanceof Array)
                return p.arrayReplacer(value);

            if (value instanceof Date)
                return p.jsonReplacer({ val: value }, serverOffset).val;

            return value;
        },
        jsonReplacer: function (val, serverOffset) {
            var value;
            for (var prop in val) {
                value = val[prop];

                if (!(value instanceof Date))
                    continue;
                // checking for update and insert operation and then including the proper offset, based on this task (JS-56499) 
                var offset = ej.serverTimezoneOffset * 60 * 60 * 1000 * (ej.isNullOrUndefined(serverOffset) || (serverOffset === false) ? (1) : -(1));
                val[prop] = new Date(+value + offset);
            }

            return val;
        },
        arrayReplacer: function (val) {

            for (var i = 0; i < val.length; i++) {            
                if (ej.isPlainObject(val[i]))
                    val[i] = p.jsonReplacer(val[i]);
                else if (val[i] instanceof Date)
                    val[i] = p.jsonReplacer({ date: val[i] }).date;
            }

            return val;
        }
    };

    ej.isJSON = p.isJson;
    ej.parseJSON = p.parseJson;
    ej.dateParse = true;
	 ej.dateFormat = "yyyy-MM-dd";
    ej.isGUID = p.isGuid;
    ej.Query = function (from) {
        if (!(this instanceof ej.Query))
            return new ej.Query(from);

        this.queries = [];
        this._key = "";
        this._fKey = "";

        if (typeof from === "string")
            this._fromTable = from || "";
        else if (from && from instanceof Array)
            this._lookup = from;

        this._expands = [];
        this._sortedColumns = [];
        this._groupedColumns = [];
        this._subQuery = null;
        this._isChild = false;
        this._params = [];
        return this;
    };

    ej.Query.prototype = {
        key: function (field) {
            if (typeof field === "string")
                this._key = field;

            return this;
        },
	
        using: function (dataManager) {
            if (dataManager instanceof ej.DataManager) {
                this.dataManagar = dataManager;
                return this;
            }

            return throwError("Query - using() : 'using' function should be called with parameter of instance ej.DataManager");
        },
	
        execute: function (dataManager, done, fail, always) {
            dataManager = dataManager || this.dataManagar;

            if (dataManager && dataManager instanceof ej.DataManager)
                return dataManager.executeQuery(this, done, fail, always);

            return throwError("Query - execute() : dataManager needs to be is set using 'using' function or should be passed as argument");
        },
	
        executeLocal: function (dataManager) {
            // this does not support for URL binding
            

            dataManager = dataManager || this.dataManagar;

            if (dataManager && dataManager instanceof ej.DataManager)
                return dataManager.executeLocal(this);

            return throwError("Query - executeLocal() : dataManager needs to be is set using 'using' function or should be passed as argument");
        },
	
        clone: function () {
            var cl = new ej.Query();
            cl.queries = this.queries.slice(0);
            cl._key = this._key;
            cl._isChild = this._isChild;
            cl.dataManagar = this.dataManager;
            cl._fromTable = this._fromTable;
            cl._params = this._params.slice(0);
            cl._expands = this._expands.slice(0);
            cl._sortedColumns = this._sortedColumns.slice(0);
            cl._groupedColumns = this._groupedColumns.slice(0);
            cl._subQuerySelector = this._subQuerySelector;
            cl._subQuery = this._subQuery;
            cl._fKey = this._fKey;
            cl._requiresCount = this._requiresCount;
            return cl;
        },
	
        from: function (tableName) {
            if (typeof tableName === "string")
                this._fromTable = tableName;

            return this;
        },
	
        addParams: function (key, value) {
            if (typeof value !== "function" && !ej.isPlainObject(value))
                this._params.push({ key: key, value: value });
            else if (typeof value === "function")
                this._params.push({ key: key, fn: value });

            return this;
        },
	
        expand: function (tables) {
            if (typeof tables === "string")
                this._expands = [].slice.call(arguments, 0);
            else
                this._expands = tables.slice(0);

            return this;
        },
	
        where: function (fieldName, operator, value, ignoreCase,ignoreAccent) {
            operator = (operator || ej.FilterOperators.equal).toLowerCase();
            var predicate = null;

            if (typeof fieldName === "string")
                predicate = new ej.Predicate(fieldName, operator, value, ignoreCase,ignoreAccent);
            else if (fieldName instanceof ej.Predicate)
                predicate = fieldName;
            else
                throwError("Query - where : Invalid arguments");

            this.queries.push({
                fn: "onWhere", 
                e: predicate
            });
            return this;
        },
	
        search: function (searchKey, fieldNames, operator, ignoreCase, ignoreAccent) {
            if (!fieldNames || typeof fieldNames === "boolean") {
                fieldNames = [];
                ignoreCase = fieldNames;
            } else if (typeof fieldNames === "string")
                fieldNames = [fieldNames];

            if (typeof operator === "boolean") {
                ignoreCase = operator;
                operator = null;
            }
            operator = operator || ej.FilterOperators.contains;
            if (operator.length < 3)
                operator = ej.data.operatorSymbols[operator];

            var comparer = ej.data.fnOperators[operator] || ej.data.fnOperators.processSymbols(operator);

            this.queries.push({
                fn: "onSearch",
                e: {
                    fieldNames: fieldNames,
                    operator: operator,
                    searchKey: searchKey,
                    ignoreCase: ignoreCase,
                    ignoreAccent: ignoreAccent,
                    comparer: comparer
                }
            });
            return this;
        },
		
        sortBy: function (fieldName, comparer, isFromGroup) {
            var order = ej.sortOrder.Ascending, sorts, t;

            if (typeof fieldName === "string" && fieldName.toLowerCase().endsWith(" desc")) {
                fieldName = fieldName.replace(/ desc$/i, '');
                comparer = ej.sortOrder.Descending;
            }
            if (fieldName instanceof Array) {
                for(var i=0;i<fieldName.length;i++)
                   this.sortBy(fieldName[i],comparer,isFromGroup);
                return this;
            }
            if (typeof comparer === "boolean")
                comparer = !comparer ? ej.sortOrder.Ascending : ej.sortOrder.Descending;
            else if (typeof comparer === "function")
                order = "custom";

            if (!comparer || typeof comparer === "string") {
                order = comparer ? comparer.toLowerCase() : ej.sortOrder.Ascending;
                comparer = ej.pvt.fnSort(comparer);
            }
            if (isFromGroup) {
                sorts = filterQueries(this.queries, "onSortBy");

                for (var i = 0; i < sorts.length; i++) {
                    t = sorts[i].e.fieldName;
                    if (typeof t === "string") {
                        if (t === fieldName) return this;
                    } else if (t instanceof Array) {
                        for (var j = 0; j < t.length; j++)
                            if (t[j] === fieldName || fieldName.toLowerCase() === t[j] + " desc")
                                return this;
                    }
                }
            }

            this.queries.push({
                fn: "onSortBy",
                e: {
                    fieldName: fieldName,
                    comparer: comparer,
                    direction: order
                }
            });

            return this;
        },
		
        sortByDesc: function (fieldName) {
            return this.sortBy(fieldName, ej.sortOrder.Descending);
        },
		
        group: function (fieldName,fn) {
            this.sortBy(fieldName, null, true);

            this.queries.push({
                fn: "onGroup",
                e: {
                    fieldName: fieldName,
                    fn: fn
                }
            });
            return this;
        },
	
        page: function (pageIndex, pageSize) {
            this.queries.push({
                fn: "onPage",
                e: {
                    pageIndex: pageIndex,
                    pageSize: pageSize
                }
            });
            return this;
        },
	
        range: function (start, end) {
            if (typeof start !== "number" || typeof end !== "number")
                throwError("Query() - range : Arguments type should be a number");

            this.queries.push({
                fn: "onRange",
                e: {
                    start: start,
                    end: end
                }
            });
            return this;
        },
	

        take: function (nos) {
            if (typeof nos !== "number")
                throwError("Query() - Take : Argument type should be a number");

            this.queries.push({
                fn: "onTake",
                e: {
                    nos: nos
                }
            });
            return this;
        },
	
        skip: function (nos) {
            if (typeof nos !== "number")
                throwError("Query() - Skip : Argument type should be a number");

            this.queries.push({
                fn: "onSkip",
                e: { nos: nos }
            });
            return this;
        },
	
        select: function (fieldNames) {
            if (typeof fieldNames === "string")
                fieldNames = [].slice.call(arguments, 0);

            if (!(fieldNames instanceof Array)) {
                throwError("Query() - Select : Argument type should be String or Array");
            }

            this.queries.push({
                fn: "onSelect",
                e: { fieldNames: fieldNames }
            });
            return this;
        },
	
        hierarchy: function (query, selectorFn) {
            if (!query || !(query instanceof ej.Query))
                throwError("Query() - hierarchy : query must be instance of ej.Query");

            if (typeof selectorFn === "function")
                this._subQuerySelector = selectorFn;

            this._subQuery = query;
            return this;
        },
	
        foreignKey: function (key) {
            if (typeof key === "string")
                this._fKey = key;

            return this;
        },
	
        requiresCount: function () {
            this._requiresCount = true;

            return this;
        },
        //type - sum, avg, min, max
        aggregate: function (type, field) {
            this.queries.push({
                fn: "onAggregates",
                e: { field: field, type: type }
            });
        }
    };

    ej.Adaptor = function (ds) {
        this.dataSource = ds;
        this.pvt = {};
		this.init.apply(this, [].slice.call(arguments, 1));
    };

    ej.Adaptor.prototype = {
        options: {
            from: "table",
            requestType: "json",
            sortBy: "sorted",
            select: "select",
            skip: "skip",
            group: "group",
            take: "take",
            search: "search",
            count: "requiresCounts",
            where: "where",
            aggregates: "aggregates",
            antiForgery: "antiForgery"
        },
        init: function () {
        },
        extend: function (overrides) {
            var fn = function (ds) {
                this.dataSource = ds;

                if (this.options)
                    this.options = $.extend({}, this.options);
				this.init.apply(this, [].slice.call(arguments, 0));

                this.pvt = {};
            };
            fn.prototype = new this.type();
            fn.prototype.type = fn;

            var base = fn.prototype.base = {};
            for (var p in overrides) {
                if (fn.prototype[p])
                    base[p] = fn.prototype[p];
            }
            $.extend(true, fn.prototype, overrides);
            return fn;
        },
        processQuery: function (dm, query) {
            // this needs to be overridden
        },
        processResponse: function (data, ds, query, xhr) {
            if (data.d)
               return data.d;
            return data;
        },
        convertToQueryString: function (req, query, dm) {
            return $.param(req);
        },
        type: ej.Adaptor
    };

    ej.UrlAdaptor = new ej.Adaptor().extend({
        processQuery: function (dm, query, hierarchyFilters) {
            var sorted = filterQueries(query.queries, "onSortBy"),
                grouped = filterQueries(query.queries, "onGroup"),
                filters = filterQueries(query.queries, "onWhere"),
                searchs = filterQueries(query.queries, "onSearch"),
                aggregates = filterQueries(query.queries, "onAggregates"),
                singles = filterQueryLists(query.queries, ["onSelect", "onPage", "onSkip", "onTake", "onRange"]),
                params = query._params,
                url = dm.dataSource.url, tmp, skip, take = null,
                op = this.options;

            var r = {
                sorted: [],
                grouped: [],
                filters: [],
                searches: [],
                aggregates: []
            };

            // calc Paging & Range
            if (singles["onPage"]) {
                tmp = singles["onPage"];
                skip = getValue(tmp.pageIndex, query);
                take = getValue(tmp.pageSize, query);
				skip = (skip - 1) * take;
            } else if (singles["onRange"]) {
                tmp = singles["onRange"];
                skip = tmp.start;
                take = tmp.end - tmp.start;
            }

            // Sorting
            for (var i = 0; i < sorted.length; i++) {
                tmp = getValue(sorted[i].e.fieldName, query);

                r.sorted.push(callAdaptorFunc(this, "onEachSort", { name: tmp, direction: sorted[i].e.direction }, query));
            }

            // hierarchy
            if (hierarchyFilters) {
                tmp = this.getFiltersFrom(hierarchyFilters, query);
                if (tmp)
                    r.filters.push(callAdaptorFunc(this, "onEachWhere", tmp.toJSON(), query));
            }

            // Filters
            for (var i = 0; i < filters.length; i++) {
                r.filters.push(callAdaptorFunc(this, "onEachWhere", filters[i].e.toJSON(), query));

                for (var prop in r.filters[i]) {
                    if (isNull(r[prop]))
                        delete r[prop];
                }
            }

            // Searches
            for (var i = 0; i < searchs.length; i++) {
                tmp = searchs[i].e;
                r.searches.push(callAdaptorFunc(this, "onEachSearch", {
                    fields: tmp.fieldNames,
                    operator: tmp.operator,
                    key: tmp.searchKey,
                    ignoreCase: tmp.ignoreCase
                }, query));
            }

            // Grouping
            for (var i = 0; i < grouped.length; i++) {
                r.grouped.push(getValue(grouped[i].e.fieldName, query));
            }

            // aggregates
            for (var i = 0; i < aggregates.length; i++) {
                tmp = aggregates[i].e; 
                r.aggregates.push({ type: tmp.type, field: getValue(tmp.field, query) });
            }

            var req = {};
            req[op.from] = query._fromTable;
            if (op.expand) req[op.expand] = query._expands;
            req[op.select] = singles["onSelect"] ? callAdaptorFunc(this, "onSelect", getValue(singles["onSelect"].fieldNames, query), query) : "";
            req[op.count] = query._requiresCount ? callAdaptorFunc(this, "onCount", query._requiresCount, query) : "";
            req[op.search] = r.searches.length ? callAdaptorFunc(this, "onSearch", r.searches, query) : "";
            req[op.skip] = singles["onSkip"] ? callAdaptorFunc(this, "onSkip", getValue(singles["onSkip"].nos, query), query) : "";
            req[op.take] = singles["onTake"] ? callAdaptorFunc(this, "onTake", getValue(singles["onTake"].nos, query), query) : "";
            req[op.antiForgery] = (dm.dataSource.antiForgery) ? dm.antiForgeryToken().value : "";
            req[op.where] = r.filters.length || r.searches.length ? callAdaptorFunc(this, "onWhere", r.filters, query) : "";
            req[op.sortBy] = r.sorted.length ? callAdaptorFunc(this, "onSortBy", r.sorted, query) : "";
            req[op.group] = r.grouped.length ? callAdaptorFunc(this, "onGroup", r.grouped, query) : "";
            req[op.aggregates] = r.aggregates.length ? callAdaptorFunc(this, "onAggregates", r.aggregates, query) : "";
			req["param"] = [];
			
            // Params
			callAdaptorFunc(this, "addParams", { dm: dm, query: query, params: params, reqParams: req });

            // cleanup
            for (var prop in req) {
                if (isNull(req[prop]) || req[prop] === "" || req[prop].length === 0 || prop === "params")
                    delete req[prop];
            }

            if (!(op.skip in req && op.take in req) && take !== null) {
                req[op.skip] = callAdaptorFunc(this, "onSkip", skip, query);
                req[op.take] = callAdaptorFunc(this, "onTake", take, query);
            }
            var p = this.pvt;
            this.pvt = {};

            if (this.options.requestType === "json") {
                return {
                    data: JSON.stringify(req),
                    url: url,
                    ejPvtData: p,
                    type: "POST",
                    contentType: "application/json; charset=utf-8"
                }
            }
            tmp = this.convertToQueryString(req, query, dm);
            tmp =  (dm.dataSource.url.indexOf("?")!== -1 ? "&" : "/") + tmp;
            return {
                type: "GET",
                url: tmp.length ? url.replace(/\/*$/, tmp) : url,
                ejPvtData: p
            };
        },
        convertToQueryString: function (req, query, dm) {
            if (dm.dataSource.url && dm.dataSource.url.indexOf("?") !== -1)
                return $.param(req);
            return "?" + $.param(req);
        },
        processResponse: function (data, ds, query, xhr, request, changes) {
            var pvt = request.ejPvtData || {};
			var groupDs= data.groupDs;
			if (xhr && xhr.getResponseHeader("Content-Type") && xhr.getResponseHeader("Content-Type").indexOf("xml") != -1 && data.nodeType == 9)
                return query._requiresCount ? { result: [], count: 0 } : [];
            var d = JSON.parse(request.data);
            if (d && d.action === "batch" && data.added) {
                changes.added = data.added;
                return changes;
            }
            if (data.d)
                data = data.d;

            if (pvt && pvt.aggregates && pvt.aggregates.length) {
                var agg = pvt.aggregates, args = {}, fn, res = {};
                if ('count' in data) args.count = data.count;
                if (data["result"]) args.result = data.result;
                if (data["aggregate"]) data = data.aggregate;
                for (var i = 0; i < agg.length; i++) {
                    fn = ej.aggregates[agg[i].type];
                    if (fn)
                        res[agg[i].field + " - " + agg[i].type] = fn(data, agg[i].field);
                }
                args["aggregates"] = res;
                data = args;
            }

            if (pvt && pvt.groups && pvt.groups.length) {
                var groups = pvt.groups, args = {};
                if ('count' in data) args.count = data.count;
                if (data["aggregates"]) args.aggregates = data.aggregates;
                if (data["result"]) data = data.result;
                for (var i = 0; i < groups.length; i++){
                    var level = null;
                    var format = getColFormat(groups[i], query.queries);
                    if (!ej.isNullOrUndefined(groupDs))
                        groupDs = ej.group(groupDs, groups[i], null, format);
                    data = ej.group(data, groups[i], pvt.aggregates, format, level, groupDs);
                }
                if (args.count != undefined)
                    args.result = data;
                else
                    args = data;
                return args;
            }
            return data;
        },
        onGroup: function (e) {
            this.pvt.groups = e;
        },
        onAggregates: function (e) {
            this.pvt.aggregates = e;
        },
        batchRequest: function (dm, changes, e, query) {
            var res = {
                changed: changes.changed,
                added: changes.added,
                deleted: changes.deleted,
                action: "batch",
                table: e.url,
                key: e.key,
				antiForgery: (dm.dataSource.antiForgery) ? dm.antiForgeryToken().value : ""
            };
            if (query)
                this.addParams({ dm: dm, query: query, params: query._params, reqParams: res });

            return {
                type: "POST",
                url: dm.dataSource.batchUrl || dm.dataSource.crudUrl || dm.dataSource.removeUrl || dm.dataSource.url,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(res)
            };
        },
        beforeSend: function (dm, request) {
        },
        insert: function (dm, data, tableName, query) {
            var res = {
                value: data,
                table: tableName,
                action: "insert",
                antiForgery: (dm.dataSource.antiForgery) ? dm.antiForgeryToken().value : ""
            };
            if (query)
                this.addParams({ dm: dm, query: query, params: query._params, reqParams: res });

            return {
                url: dm.dataSource.insertUrl || dm.dataSource.crudUrl || dm.dataSource.url,
                data: JSON.stringify(res)
            };
        },
        remove: function (dm, keyField, value, tableName, query) {
            var res = {
                key: value,
                keyColumn: keyField,
                table: tableName,
                action: "remove",
                antiForgery: (dm.dataSource.antiForgery) ? dm.antiForgeryToken().value : ""
            };
            if (query)
                this.addParams({ dm: dm, query: query, params: query._params, reqParams: res });

            return {
                type: "POST",
                url: dm.dataSource.removeUrl || dm.dataSource.crudUrl || dm.dataSource.url,
                data: JSON.stringify(res)
            };
        },
        update: function (dm, keyField, value, tableName, query) {
            var res = {
                value: value,
                action: "update",
                keyColumn: keyField,
                key: value[keyField],
                table: tableName,
                antiForgery: (dm.dataSource.antiForgery) ? dm.antiForgeryToken().value : ""
            };
            if (query)
                this.addParams({ dm: dm, query: query, params: query._params, reqParams: res });

            return {
                type: "POST",
                url: dm.dataSource.updateUrl || dm.dataSource.crudUrl || dm.dataSource.url,
                data: JSON.stringify(res)
            };
        },
        getFiltersFrom: function (data, query) {
            if (!(data instanceof Array) || !data.length)
                throwError("ej.SubQuery: Array of key values required");
            var key = query._fKey, value, prop = key, pKey = query._key, predicats = [],
                isValues = typeof data[0] !== "object";

            if (typeof data[0] !== "object") prop = null;

            for (var i = 0; i < data.length; i++) {
                value = !isValues ? ej.pvt.getObject(pKey || prop, data[i]) : data[i];
                predicats.push(new ej.Predicate(key, "equal", value));
            }

            return ej.Predicate.or(predicats);
        },
        addParams: function (options) {
            var dm = options.dm, query = options.query, params = options.params, req = options.reqParams; req["params"] = {};
            for (var i = 0, tmp; tmp = params[i]; i++) {
                if (req[tmp.key]) throwError("ej.Query: Custom Param is conflicting other request arguments");
                req[tmp.key] = tmp.value;
                if (tmp.fn)
                    req[tmp.key] = tmp.fn.call(query, tmp.key, query, dm);                
                req["params"][tmp.key] = req[tmp.key];
            }
        }
    });
    ej.WebMethodAdaptor = new ej.UrlAdaptor().extend({
        processQuery: function (dm, query, hierarchyFilters) {
            var obj = ej.UrlAdaptor.prototype.processQuery(dm, query, hierarchyFilters);
            var data = ej.parseJSON(obj.data), result = {};

            result["value"] = data;

            //Params             
            callAdaptorFunc(this, "addParams", { dm: dm, query: query, params: query._params, reqParams: result });

            return {
                data: JSON.stringify(result),
                url: obj.url,
                ejPvtData: obj.ejPvtData,
                type: "POST",
                contentType: "application/json; charset=utf-8"
            }
        },
        addParams: function (options) {
            var dm = options.dm, query = options.query, params = options.params, req = options.reqParams; req["params"] = {};
            for (var i = 0, tmp; tmp = params[i]; i++) {
                if (req[tmp.key]) throwError("ej.Query: Custom Param is conflicting other request arguments");
                var webkey = tmp.key, webvalue = tmp.value;
                if (tmp.fn)
                    webvalue = tmp.fn.call(query, tmp.key, query, dm);
                req[webkey] = webvalue;
                req["params"][webkey] = req[webkey];
            }
        }
    });
    ej.CacheAdaptor = new ej.UrlAdaptor().extend({
        init: function (adaptor, timeStamp, pageSize) {
            if (!ej.isNullOrUndefined(adaptor)) {
                this.cacheAdaptor = adaptor;
            }
            this.pageSize = pageSize;
            this.guidId = ej.getGuid("cacheAdaptor");
            var obj = { keys: [], results: [] };
            if (window.localStorage)
                window.localStorage.setItem(this.guidId, JSON.stringify(obj));
            var guid = this.guidId;
            if (!ej.isNullOrUndefined(timeStamp)) {
                setInterval(function () {
                    var data = ej.parseJSON(window.localStorage.getItem(guid));
                    var forDel = [];
                    for (var i = 0; i < data.results.length; i++) {
                        data.results[i].timeStamp = new Date() - new Date(data.results[i].timeStamp)
                        if (new Date() - new Date(data.results[i].timeStamp) > timeStamp)
                            forDel.push(i);
                    }
                    var d = forDel;
                    for (var i = 0; i < forDel.length; i++) {
                        data.results.splice(forDel[i], 1);
                        data.keys.splice(forDel[i], 1);
                    }
                    window.localStorage.removeItem(guid);
                    window.localStorage.setItem(guid, JSON.stringify(data));
                }, timeStamp);
            }
        },
        generateKey: function (url, query) {
            var sorted = filterQueries(query.queries, "onSortBy"),
                grouped = filterQueries(query.queries, "onGroup"),
                filters = filterQueries(query.queries, "onWhere"),
                searchs = filterQueries(query.queries, "onSearch"),
				pageQuery = filterQueries(query.queries, "onPage"),
                singles = filterQueryLists(query.queries, ["onSelect", "onPage", "onSkip", "onTake", "onRange"]),
                params = query._params;
            var key = url;
            if (singles["onPage"])
              key += singles["onPage"].pageIndex;
              sorted.forEach(function (obj) {
                   key += obj.e.direction + obj.e.fieldName;
              });
                grouped.forEach(function (obj) {
                    key += obj.e.fieldName;
                });
                searchs.forEach(function (obj) {
                    key += obj.e.searchKey;
                });
            
            for (var filter = 0; filter < filters.length; filter++) {
                var currentFilter = filters[filter];
                if (currentFilter.e.isComplex) {
                    var newQuery = query.clone();
                    newQuery.queries = [];
                    for (var i = 0; i < currentFilter.e.predicates.length; i++) {
                        newQuery.queries.push({ fn: "onWhere", e: currentFilter.e.predicates[i], filter: query.queries.filter });
                    }
                    key += currentFilter.e.condition + this.generateKey(url, newQuery);
                }
                else
                    key += currentFilter.e.field + currentFilter.e.operator + currentFilter.e.value
            }
            return key;
        },
        processQuery: function (dm, query, hierarchyFilters) {
            var key = this.generateKey(dm.dataSource.url, query);
            var cachedItems;
            if (window.localStorage)
                cachedItems = ej.parseJSON(window.localStorage.getItem(this.guidId));
            var data = cachedItems ? cachedItems.results[cachedItems.keys.indexOf(key)] : null;
            if (data != null && !this._crudAction && !this._insertAction) {
                return data;
            }
            this._crudAction = null; this._insertAction = null;
            return this.cacheAdaptor.processQuery.apply(this.cacheAdaptor, [].slice.call(arguments, 0))
        },
        processResponse: function (data, ds, query, xhr, request, changes) {
            if (this._insertAction || (request && this.cacheAdaptor.options.batch && request.url.endsWith(this.cacheAdaptor.options.batch) && request.type.toLowerCase() === "post")) {
                return this.cacheAdaptor.processResponse(data, ds, query, xhr, request, changes);
            }
            var data = this.cacheAdaptor.processResponse.apply(this, [].slice.call(arguments, 0));
            var key = this.generateKey(ds.dataSource.url, query)
            var obj = {};
            if (window.localStorage)
                obj = ej.parseJSON(window.localStorage.getItem(this.guidId));
            var index = $.inArray(key, obj.keys);
            if (index != -1) {
                obj.results.splice(index, 1);
                obj.keys.splice(index, 1);
            }
            obj.results[obj.keys.push(key) - 1] = { keys: key, result: data.result, timeStamp: new Date(), count: data.count }
            while (obj.results.length > this.pageSize) {
                obj.results.splice(0, 1);
                obj.keys.splice(0, 1);
            }
            window.localStorage.setItem(this.guidId, JSON.stringify(obj));
            return data;
        },
        update: function (dm, keyField, value, tableName) {
            this._crudAction = true;
            return this.cacheAdaptor.update(dm, keyField, value, tableName);
        },
        insert: function (dm, data, tableName) {
            this._insertAction = true;
            return this.cacheAdaptor.insert(dm, data, tableName);
        },
        remove: function (dm, keyField, value, tableName) {
            this._crudAction = true;
            return this.cacheAdaptor.remove(dm, keyField, value, tableName);
        },
        batchRequest: function (dm, changes, e) {
            return this.cacheAdaptor.batchRequest(dm, changes, e);
        }
    });
    var filterQueries = function (queries, name) {
        return queries.filter(function (q) {
            return q.fn === name;
        }) || [];
    };
    var filterQueryLists = function (queries, singles) {
        var filtered = queries.filter(function (q) {
            return singles.indexOf(q.fn) !== -1;
        }), res = {};
        for (var i = 0; i < filtered.length; i++) {
            if (!res[filtered[i].fn])
                res[filtered[i].fn] = filtered[i].e;
        }
        return res;
    };
    var callAdaptorFunc = function (obj, fnName, param, param1) {
        if (obj[fnName]) {
            var res = obj[fnName](param, param1);
            if (!isNull(res)) param = res;
        }
        return param;
    };

    ej.ODataAdaptor = new ej.UrlAdaptor().extend({
        options: {
            requestType: "get",
            accept: "application/json;odata=light;q=1,application/json;odata=verbose;q=0.5",
            multipartAccept: "multipart/mixed",
            sortBy: "$orderby",
            select: "$select",
            skip: "$skip",
            take: "$top",
            count: "$inlinecount",
            where: "$filter",
            expand: "$expand",
            batch: "$batch",
            changeSet: "--changeset_",
            batchPre: "batch_",
            contentId: "Content-Id: ",
            batchContent: "Content-Type: multipart/mixed; boundary=",
            changeSetContent: "Content-Type: application/http\nContent-Transfer-Encoding: binary ",
            batchChangeSetContentType: "Content-Type: application/json; charset=utf-8 "
        },
        onEachWhere: function (filter, requiresCast) {
            return filter.isComplex ? this.onComplexPredicate(filter, requiresCast) : this.onPredicate(filter, requiresCast);
        },
		_typeStringQuery: function (pred, requiresCast,val,field,guid) {
			if(val.indexOf("'") != -1)
			    val = val.replace(new RegExp(/'/g), "''");
			var specialCharFormat = /[ !@@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/; 
			if (specialCharFormat.test(val)) { 
			    val = encodeURIComponent(val)
			}
            val = "'" + val + "'";
            if (requiresCast) {
                field = "cast(" + field + ", 'Edm.String')";
            }
            if (ej.isGUID(val))
                guid = 'guid';
            if (pred.ignoreCase) {
                !guid ? field = "tolower(" + field + ")" : field;
                val = val.toLowerCase();
            }
			return {"val":val,"guid":guid ,"field":field};
		},
        onPredicate: function (pred, query, requiresCast) {
            var returnValue = "",
                operator,guid,
                val = pred.value,
                type = typeof val,
                field = this._p(pred.field);

            if (val instanceof Date)
                val = "datetime'" + p.replacer(val).toJSON() + "'";

            if (type === "string") {
				var args = this._typeStringQuery(pred,requiresCast,val,field , guid);
				val = args["val"]; field = args["field"]; guid = args["guid"];
            }

            operator = ej.data.odBiOperator[pred.operator];
			if(pred.anyCondition != "" && operator) {
				returnValue += val["table"];
				returnValue += ("/"+pred.anyCondition);
				returnValue += "(d:d/";
				returnValue += field;
				returnValue += operator;
				returnValue += val["value"];
				returnValue += ")";
				return returnValue;
			}
			if( pred.operator == "in" || pred.operator == "notin" ) {
				returnValue += "(";
				for(var index = 0; index < val.length; index++ ) {
					if (val[index] instanceof Date)
						val[index] = "datetime'" + p.replacer(val[index]).toJSON() + "'";
					if (typeof val[index] === "string") {
						var args = this._typeStringQuery(pred,requiresCast,val[index],field , guid);
						val[index] = args["val"]; field = args["field"]; guid = args["guid"];
					}
					returnValue += field;
					returnValue += operator;
					returnValue += val[index];
					if( index != val.length -1 ) returnValue += ( pred.operator == "in") ? " or " : " and ";
				}
				returnValue += ")";
				return returnValue;
			}
		    if (operator) {
		        return this.onOperation(returnValue, operator, field, val, guid);
		    }

            operator = ej.data.odUniOperator[pred.operator];
            if (!operator || type !== "string") return "";

            if (operator === "substringof") {
                var t = val;
                val = field;
                field = t;
            }

            returnValue += operator + "(";
            returnValue += field + ",";
            if (guid) returnValue += guid;
            returnValue += val + ")";
			
			if( pred.operator == "notcontains" ) {
				returnValue += " eq false"
			}
			if(pred.anyCondition != "" && operator) {
				var returnValue1;
				returnValue1 += val["table"];
				returnValue1 += ("/"+pred.anyCondition);
				returnValue1 += "(d:d/";
				returnValue += returnValue;
				returnValue1 += ")";
				return returnValue1;
			}
            return returnValue;
		},
		onOperation: function (returnValue, operator, field, val, guid) {
		        returnValue += field;
		        returnValue += operator;
		        if (guid)
		            returnValue += guid;
		        return returnValue + val;
        },
        onComplexPredicate: function (pred, requiresCast) {
            var res = [];
            for (var i = 0; i < pred.predicates.length; i++) {
                res.push("(" + this.onEachWhere(pred.predicates[i], requiresCast) + ")");
            }
            return res.join(" " + pred.condition + " ");
        },
        onWhere: function (filters) {
            if (this.pvt.searches)
                filters.push(this.onEachWhere(this.pvt.searches, null, true));

            return filters.join(" and ");
        },
        onEachSearch: function (e) {
            if (e.fields.length === 0)
                throwError("Query() - Search : oData search requires list of field names to search");

            var filter = this.pvt.searches || [];
            for (var i = 0; i < e.fields.length; i++) {
                filter.push(new ej.Predicate(e.fields[i], e.operator, e.key, e.ignoreCase));
            }
            this.pvt.searches = filter;
        },
        onSearch: function (e) {
            this.pvt.searches = ej.Predicate.or(this.pvt.searches);
            return "";
        },
        onEachSort: function (e) {
            var res = [];
            if (e.name instanceof Array) {
                for (var i = 0; i < e.name.length; i++)
                    res.push(this._p(e.name[i]));
            } else {
                res.push(this._p(e.name) + (e.direction === "descending" ? " desc" : ""));
            }
            return res.join(",");
        },
        onSortBy: function (e) {
            return e.reverse().join(",");
        },
        onGroup: function (e) {
            this.pvt.groups = e;
            return "";
        },
        onSelect: function (e) {
            for (var i = 0; i < e.length; i++)
                e[i] = this._p(e[i]);

            return e.join(',');
        },
        onAggregates: function(e){
            this.pvt.aggregates = e;
            return "";
        },
        onCount: function (e) {
            return e === true ? "allpages" : "";
        },
        beforeSend: function (dm, request, settings) {
            if (settings.url.endsWith(this.options.batch) && settings.type.toLowerCase() === "post") {
                request.setRequestHeader("Accept", oData.multipartAccept);
                request.setRequestHeader("DataServiceVersion", "2.0");
                request.overrideMimeType("text/plain; charset=x-user-defined");
            }

            if (!dm.dataSource.crossDomain) {
                request.setRequestHeader("DataServiceVersion", "2.0");
                request.setRequestHeader("MaxDataServiceVersion", "2.0");
            }
        },
        processResponse: function (data, ds, query, xhr, request, changes) {
            if (!ej.isNullOrUndefined(data.d)) {
                var dataCopy = (query && query._requiresCount) ? data.d.results : data.d;
                if (!ej.isNullOrUndefined(dataCopy))
                    for (var i = 0; i < dataCopy.length; i++) {
                        !ej.isNullOrUndefined(dataCopy[i].__metadata) && delete dataCopy[i].__metadata;
                    }
            }
            var pvt = request && request.ejPvtData;
            if (xhr && xhr.getResponseHeader("Content-Type") && xhr.getResponseHeader("Content-Type").indexOf("xml") != -1 && data.nodeType == 9)
                return query._requiresCount ? { result: [], count: 0 } : [];
            if (request && this.options.batch && request.url.endsWith(this.options.batch) && request.type.toLowerCase() === "post") {
                var guid = xhr.getResponseHeader("Content-Type"), cIdx, jsonObj;
                guid = guid.substring(guid.indexOf("=batchresponse") + 1);
                data = data.split(guid);
                if (data.length < 2) return;

                data = data[1];
                var exVal = /(?:\bContent-Type.+boundary=)(changesetresponse.+)/i.exec(data);
                data.replace(exVal[0], "");

                var changeGuid = exVal[1];
                data = data.split(changeGuid);

                for (var i = data.length; i > -1; i--) {
                    if (!/\bContent-ID:/i.test(data[i]) || !/\bHTTP.+201/.test(data[i]))
                        continue;

                    cIdx = parseInt(/\bContent-ID: (\d+)/i.exec(data[i])[1]);

                    if (changes.added[cIdx]) {
                        jsonObj = p.parseJson(/^\{.+\}/m.exec(data[i])[0]);
                        $.extend(changes.added[cIdx], this.processResponse(jsonObj));
                    }
                }
                return changes;
            }
            var version = xhr && xhr.getResponseHeader("DataServiceVersion"), count = null, aggregateResult = {};
            version = (version && parseInt(version, 10)) || 2;

            if (query && query._requiresCount) {
                if (data.__count || data['odata.count']) count = data.__count || data['odata.count'];
                if (data.d) data = data.d;
                if (data.__count || data['odata.count']) count = data.__count || data['odata.count'];
            }

            if (version === 3 && data.value) data = data.value;
            if (data.d) data = data.d;
            if (version < 3 && data.results) data = data.results;

            if (pvt && pvt.aggregates && pvt.aggregates.length) {
                var agg = pvt.aggregates, args = {}, fn, res = {};
                for (var i = 0; i < agg.length; i++) {
                    fn = ej.aggregates[agg[i].type];
                    if (fn)
                        res[agg[i].field + " - " + agg[i].type] = fn(data, agg[i].field);
                }
                aggregateResult = res;
            }
            if (pvt && pvt.groups && pvt.groups.length) {
                var groups = pvt.groups;
                for (var i = 0; i < groups.length; i++) {
                    var format = getColFormat(groups[i], query.queries)
                    data = ej.group(data, groups[i], pvt.aggregates, format);
                }
            }
            return isNull(count) ? data : { result: data, count: count, aggregates: aggregateResult };
        },
        convertToQueryString: function (req, query, dm) {
            var res = [], tableName = req.table || "";
            delete req.table;

            if (dm.dataSource.requiresFormat)
                req["$format"] = "json";

            for (var prop in req)
                res.push(prop + "=" + req[prop]);

            res = res.join("&");

            if (dm.dataSource.url && dm.dataSource.url.indexOf("?") !== -1 && !tableName)
                return res;

            return res.length ? tableName + "?" + res : tableName || "";
        },
        insert: function (dm, data, tableName) {
            return {
                url: dm.dataSource.url.replace(/\/*$/, tableName ? '/' + tableName : ''),
                data: JSON.stringify(data)
            }
        },
        remove: function (dm, keyField, value, tableName) {
            if(typeof(value) == "string"){
                return {
                    type: "DELETE",
                    url: ej.isGUID(value) ? dm.dataSource.url.replace(/\/*$/, tableName ? '/' + tableName : '') + "(" + value + ")" : dm.dataSource.url.replace(/\/*$/, tableName ? '/' + tableName : '') + "('" + value + "')"
                };
            }
            return {
                type: "DELETE",
                url: dm.dataSource.url.replace(/\/*$/, tableName ? '/' + tableName : '') + '(' + value + ')'
            };
        },
        update: function (dm, keyField, value, tableName) {
			var url;
			if(typeof value[keyField] === "string")
			    url = ej.isGUID(value[keyField]) ? dm.dataSource.url.replace(/\/*$/, tableName ? '/' + tableName : '') + "(" + value[keyField] + ")" : dm.dataSource.url.replace(/\/*$/, tableName ? '/' + tableName : '') + "('" + value[keyField] + "')";
			else 
				url = dm.dataSource.url.replace(/\/*$/, tableName ? '/' + tableName : '') + '(' + value[keyField] + ')';
            return {
                type: "PUT",
                url: url,
                data: JSON.stringify(value),
                accept: this.options.accept
            };
        },
        batchRequest: function (dm, changes, e) {
            var initialGuid = e.guid = ej.getGuid(oData.batchPre);
            var url = dm.dataSource.url.replace(/\/*$/, '/' + this.options.batch);
            var args = {
                url: e.url,
                key: e.key,
                cid: 1,
                cSet: ej.getGuid(oData.changeSet)
            };
            var req = "--" + initialGuid + "\n";

            req += "Content-Type: multipart/mixed; boundary=" + args.cSet.replace("--", "") + "\n";

            this.pvt.changeSet = 0;

            req += this.generateInsertRequest(changes.added, args);
            req += this.generateUpdateRequest(changes.changed, args);
            req += this.generateDeleteRequest(changes.deleted, args);

            req += args.cSet + "--\n";
            req += "--" + initialGuid + "--";

            return {
                type: "POST",
                url: url,
                contentType: "multipart/mixed; charset=UTF-8;boundary=" + initialGuid,
                data: req
            };
        },
        generateDeleteRequest: function (arr, e) {
            if (!arr) return "";
            var req = "", val;

            for (var i = 0; i < arr.length; i++) {
                req += "\n" + e.cSet + "\n";
                req += oData.changeSetContent + "\n\n";
                req += "DELETE ";
                val = typeof arr[i][e.key] == "string" ? "'" + arr[i][e.key] + "'" : arr[i][e.key];
                req += e.url + "(" + val + ") HTTP/1.1\n";
                req += "If-Match : * \n"
                req += "Accept: " + oData.accept + "\n";
                req += "Content-Id: " + this.pvt.changeSet++ + "\n";
                req += oData.batchChangeSetContentType + "\n";
            }

            return req + "\n";
        },
        generateInsertRequest: function (arr, e) {
            if (!arr) return "";
            var req = "";

            for (var i = 0; i < arr.length; i++) {
                req += "\n" + e.cSet + "\n";
                req += oData.changeSetContent + "\n\n";
                req += "POST ";
                req += e.url + " HTTP/1.1\n";
                req += "Accept: " + oData.accept + "\n";
                req += "Content-Id: " + this.pvt.changeSet++ + "\n";
                req += oData.batchChangeSetContentType + "\n\n";

                req += JSON.stringify(arr[i]) + "\n";
            }

            return req;
        },
        generateUpdateRequest: function (arr, e) {
            if (!arr) return "";
            var req = "", val;

            for (var i = 0; i < arr.length; i++) {
                req += "\n" + e.cSet + "\n";
                req += oData.changeSetContent + "\n\n";
                req += "PUT ";
                val = typeof arr[i][e.key] == "string" ? "'" + arr[i][e.key] + "'" : arr[i][e.key];
                req += e.url + "(" + val + ")" + " HTTP/1.1\n";
                req += "If-Match : * \n"
                req += "Accept: " + oData.accept + "\n";
                req += "Content-Id: " + this.pvt.changeSet++ + "\n";
                req += oData.batchChangeSetContentType + "\n\n";

                req += JSON.stringify(arr[i]) + "\n\n";
            }

            return req;
        },
        _p: function (prop) {
            return prop.replace(/\./g, "/");
        }
    });
    ej.ODataV4Adaptor = new ej.ODataAdaptor().extend({
        options: {
            requestType: "get",
            accept: "application/json;odata=light;q=1,application/json;odata=verbose;q=0.5",
            multipartAccept: "multipart/mixed",
            sortBy: "$orderby",
            select: "$select",
            skip: "$skip",
            take: "$top",
            count: "$count",
            search: "$search",
            where: "$filter",
            expand: "$expand",
            batch: "$batch",
            changeSet: "--changeset_",
            batchPre: "batch_",
            contentId: "Content-Id: ",
            batchContent: "Content-Type: multipart/mixed; boundary=",
            changeSetContent: "Content-Type: application/http\nContent-Transfer-Encoding: binary ",
            batchChangeSetContentType: "Content-Type: application/json; charset=utf-8 "
        },
        onCount: function (e) {
            return e === true ? "true" : "";
        },
        onPredicate: function (pred, query, requiresCast) {
            var returnValue = "",
                val = pred.value,
                isDate = val instanceof Date;               
            ej.data.odUniOperator["contains"] = "contains";
            returnValue = ej.ODataAdaptor.prototype.onPredicate.call(this, pred, query, requiresCast);
            ej.data.odUniOperator["contains"] = "substringof";
                if (isDate)
                    returnValue = returnValue.replace(/datetime'(.*)'$/, "$1");

            return returnValue;
        },
        onOperation: function (returnValue, operator, field, val, guid) {
            if (guid) {
                returnValue += "(" + field;
                returnValue += operator;
                returnValue += val.replace(/["']/g, "") + ")";
            } else {
                returnValue += field;
                returnValue += operator;
                returnValue += val;
            }
            return returnValue;
        },
        onEachSearch: function (e) {
			 var search = this.pvt.search || [];
			 search.push(e.key);
			 this.pvt.search = search;
		},
		onSearch: function (e) {
			 return this.pvt.search.join(" OR ");
		},
        beforeSend: function (dm, request, settings) {
 
        },
        processQuery: function (ds, query) {
            var digitsWithSlashesExp = /\/[\d*\/]*/g;
            var poppedExpand = "";
            for (var i = query._expands.length - 1; i > 0; i--) {
                if (poppedExpand.indexOf(query._expands[i]) >= 0) { // If current expand is child of previous
                    query._expands.pop(); // Just remove it because its in the expand already
                }
                else {
                    if (digitsWithSlashesExp.test(query._expands[i])) { //If expanded to subentities
                        poppedExpand = query._expands.pop();
                        var r = poppedExpand.replace(digitsWithSlashesExp, "($expand="); //Rewrite into odata v4 expand
                        for (var j = 0; j < poppedExpand.split(digitsWithSlashesExp).length - 1; j++) {
                            r = r + ")"; // Add closing brackets
                        }
                        query._expands.unshift(r); // Add to the front of the array
                        i++;
                    }
                }
            }
            return ej.ODataAdaptor.prototype.processQuery.apply(this, [ds, query]);
        },
        processResponse: function (data, ds, query, xhr, request, changes) {
            var pvt = request && request.ejPvtData;
            if (xhr && xhr.getResponseHeader("Content-Type") && xhr.getResponseHeader("Content-Type").indexOf("xml") != -1 && data.nodeType == 9)
                return query._requiresCount ? { result: [], count: 0 } : [];
            if (request && this.options.batch && request.url.endsWith(this.options.batch) && request.type.toLowerCase() === "post") {
                var guid = xhr.getResponseHeader("Content-Type"), cIdx, jsonObj;
                guid = guid.substring(guid.indexOf("=batchresponse") + 1);
                data = data.split(guid);
                if (data.length < 2) return;

                data = data[1];
                var exVal = /(?:\bContent-Type.+boundary=)(changesetresponse.+)/i.exec(data);
                data.replace(exVal[0], "");

                var changeGuid = exVal[1];
                data = data.split(changeGuid);

                for (var i = data.length; i > -1; i--) {
                   if (!/\bContent-ID:/i.test(data[i]) || !/\bHTTP.+201/.test(data[i]))
                        continue;

                    cIdx = parseInt(/\bContent-ID: (\d+)/i.exec(data[i])[1]);

                    if (changes.added[cIdx]) {
                        jsonObj = p.parseJson(/^\{.+\}/m.exec(data[i])[0]);
                        $.extend(changes.added[cIdx], this.processResponse(jsonObj));
                    }
                }
                return changes;
           }
            var count = null, aggregateResult = {};
            if (query && query._requiresCount)
                if ('@odata.count' in data) count = data['@odata.count'];

            data = ej.isNullOrUndefined(data.value) ? data : data.value;
           if (pvt && pvt.aggregates && pvt.aggregates.length) {
               var agg = pvt.aggregates, args = {}, fn, res = {};
               for (var i = 0; i < agg.length; i++) {
                   fn = ej.aggregates[agg[i].type];
                   if (fn)
                       res[agg[i].field + " - " + agg[i].type] = fn(data, agg[i].field);
               }
               aggregateResult = res;
           }
            if (pvt && pvt.groups && pvt.groups.length) {
                var groups = pvt.groups;
                for (var i = 0; i < groups.length; i++) {
                    var format = getColFormat(groups[i], query.queries);
                    data = ej.group(data, groups[i], pvt.aggregates, format);
                }
            }
            return isNull(count) ? data : { result: data, count: count, aggregates: aggregateResult };
        },
    });
    ej.JsonAdaptor = new ej.Adaptor().extend({
        processQuery: function (ds, query) {
            var result = ds.dataSource.json.slice(0), count = result.length, cntFlg = true, ret, key, agg = {};

            for (var i = 0; i < query.queries.length; i++) {
                key = query.queries[i];
                ret = this[key.fn].call(this, result, key.e, query);
                if (key.fn == "onAggregates")
                    agg[key.e.field + " - " + key.e.type] = ret;
                else
                result = ret !== undefined ? ret : result;

                if (key.fn === "onPage" || key.fn === "onSkip" || key.fn === "onTake" || key.fn === "onRange") cntFlg = false;

                if (cntFlg) count = result.length;
            }

            if (query._requiresCount) {
                result = {
                    result: result,
                    count: count,
                    aggregates: agg
                };
            }

            return result;
        },
        batchRequest: function (dm, changes, e) {
            var i;
            for (i = 0; i < changes.added.length; i++)
                this.insert(dm, changes.added[i]);
            for (i = 0; i < changes.changed.length; i++)
                this.update(dm, e.key, changes.changed[i]);
            for (i = 0; i < changes.deleted.length; i++)
                this.remove(dm, e.key, changes.deleted[i]);
            return changes;
        },
        onWhere: function (ds, e) {
            if (!ds) return ds;

            return ds.filter(function (obj) {
                return e.validate(obj);
            });
        },
        onAggregates: function(ds, e){
            var fn = ej.aggregates[e.type];
            if (!ds || !fn || ds.length == 0) return null;
            return fn(ds, e.field);
        },
        onSearch: function (ds, e) {
            if (!ds || !ds.length) return ds;

            if (e.fieldNames.length === 0) {
                ej.pvt.getFieldList(ds[0], e.fieldNames);
            }

            return ds.filter(function (obj) {
                for (var j = 0; j < e.fieldNames.length; j++) {
                    if (e.comparer.call(obj, ej.pvt.getObject(e.fieldNames[j], obj), e.searchKey, e.ignoreCase,e.ignoreAccent))
                        return true;
                }
                return false;
            });
        },
        onSortBy: function (ds, e, query) {
            if (!ds) return ds;
            var fnCompare, field = getValue(e.fieldName, query);
            if (!field)
                return ds.sort(e.comparer);

            if (field instanceof Array) {
                field = field.slice(0);

                for (var i = field.length - 1; i >= 0; i--) {
                    if (!field[i]) continue;

                    fnCompare = e.comparer;

                    if (field[i].endsWith(" desc")) {
                        fnCompare = ej.pvt.fnSort(ej.sortOrder.Descending);
                        field[i] = field[i].replace(" desc", "");
                    }

                    ds = stableSort(ds, field[i], fnCompare, []);
                }
                return ds;
            }
            return stableSort(ds, field, e.comparer, query ? query.queries : []);
        },
        onGroup: function (ds, e, query) {
            if (!ds) return ds;
            var aggQuery = filterQueries(query.queries, "onAggregates"), agg = [];
            if (aggQuery.length) {
                var tmp;
                for (var i = 0; i < aggQuery.length; i++) {
                    tmp = aggQuery[i].e;
                    agg.push({ type: tmp.type, field: getValue(tmp.field, query) });
                }
            }
            var format = getColFormat(e.fieldName, query.queries);
            return ej.group(ds, getValue(e.fieldName, query), agg, format);
        },
        onPage: function (ds, e, query) {
            var size = getValue(e.pageSize, query),
                start = (getValue(e.pageIndex, query) - 1) * size, end = start + size;

            if (!ds) return ds;

            return ds.slice(start, end);
        },
        onRange: function (ds, e) {
            if (!ds) return ds;
            return ds.slice(getValue(e.start), getValue(e.end));
        },
        onTake: function (ds, e) {
            if (!ds) return ds;

            return ds.slice(0, getValue(e.nos));
        },
        onSkip: function (ds, e) {
            if (!ds) return ds;
            return ds.slice(getValue(e.nos));
        },
        onSelect: function (ds, e) {
            if (!ds) return ds;
            return ej.select(ds, getValue(e.fieldNames));
        },
        insert: function (dm, data) {
            return dm.dataSource.json.push(data);
        },
        remove: function (dm, keyField, value, tableName) {
            var ds = dm.dataSource.json, i;
            if (typeof value === "object")
                value = ej.getObject(keyField, value);
            for (i = 0; i < ds.length; i++) {
                if (ej.getObject(keyField, ds[i]) === value) break;
            }

            return i !== ds.length ? ds.splice(i, 1) : null;
        },
        update: function (dm, keyField, value, tableName) {
            var ds = dm.dataSource.json, i, key = ej.getObject(keyField, value);

            for (i = 0; i < ds.length; i++) {
                if (ej.getObject(keyField, ds[i]) === key) break;
            }

            return i < ds.length ? $.extend(ds[i], value) : null;
        }
    });
    ej.ForeignKeyAdaptor = function (data, type) {
        var foreignObj = new ej[type || "JsonAdaptor"]().extend({
            init: function () {
                this.foreignData = [];
                this.key = [];
                this.adaptorType = type;
                this.value = [];
                this.fValue = [];
                this.keyField = [];
                var dataObj = data;
                for (var i = 0; i < dataObj.length; i++) {
                    this.foreignData[i] = dataObj[i].dataSource;
                    this.key[i] = dataObj[i].foreignKeyField;
                    this.fValue[i] = ej.isNullOrUndefined(dataObj[i].field)? dataObj[i].foreignKeyValue : dataObj[i].field + "_" + dataObj[i].foreignKeyValue;
                    this.value[i] = dataObj[i].foreignKeyValue;
                    this.keyField[i] = dataObj[i].field || dataObj[i].foreignKeyField;
                    this.initial = true;
                }
            },
            processQuery: function (ds, query) {
                var data = ds.dataSource.json;
                if (this.initial) {
                    for (var i = 0; i < data.length; i++) {
                        var proxy = this;
                        for (var j = 0; j < this.foreignData.length; j++) {
                            this.foreignData[j].filter(function (col) { //filtering the foreignKey dataSource
                                if (ej.getObject(proxy.key[j], col) == ej.getObject(proxy.keyField[j], data[i]))
                                    data[i][proxy.fValue[j]] = ej.getObject(proxy.value[j], col);
                            });
                        }
                    }
                    this.initial = false;
                }
                return this.base.processQuery.apply(this, [ds, query]);
            },
            setValue: function (value) {
                for (var i = 0; i < this.foreignData.length; i++) {
                    var proxy = this;
                    var keyValue = value[this.fValue[i]];
                    if (typeof keyValue == "string" && !isNaN(keyValue))
                        keyValue = ej.parseFloat(keyValue);
                    var data = $.grep(proxy.foreignData[i], function (e) {
                        return e[proxy.value[i]] == keyValue;
                    })[0];
                    if (ej.isNullOrUndefined(data)) {
                        data = $.grep(proxy.foreignData[i], function (e) {
                            return e[proxy.key[i]] == keyValue;
                        })[0];
                        if (ej.getObject(this.value[i], data) != undefined)
                            ej.createObject(proxy.value[i], ej.getObject(this.value[i], data), value);
                    }
                    if (ej.getObject(this.value[i], data) != undefined)
                        ej.createObject(this.keyField[i], ej.getObject(this.key[i], data), value);
                }
            },
            insert: function (dm, data, tableName) {
                this.setValue(data);
                return {
                    url: dm.dataSource.insertUrl || dm.dataSource.crudUrl || dm.dataSource.url,
                    data: JSON.stringify({
                        value: data,
                        table: tableName,
                        action: "insert",
                        antiForgery: (dm.dataSource.antiForgery) ? dm.antiForgeryToken().value : ""
                    })
                };
            },
            update: function (dm, keyField, value, tableName) {
                this.setValue(value);
                ej.JsonAdaptor.prototype.update(dm, keyField, value, tableName);
                return {
                    type: "POST",
                    url: dm.dataSource.updateUrl || dm.dataSource.crudUrl || dm.dataSource.url,
                    data: JSON.stringify({
                        value: value,
                        action: "update",
                        keyColumn: keyField,
                        key: value[keyField],
                        table: tableName,
                        antiForgery: (dm.dataSource.antiForgery) ? dm.antiForgeryToken().value : ""
                    })
                };
            }
        });
        $.extend(this, new foreignObj());
        return this;
    }
    ej.remoteSaveAdaptor = new ej.JsonAdaptor().extend({
        beforeSend: ej.UrlAdaptor.prototype.beforeSend,
        insert: ej.UrlAdaptor.prototype.insert,
        update: ej.UrlAdaptor.prototype.update,
        remove: ej.UrlAdaptor.prototype.remove,
        addParams: ej.UrlAdaptor.prototype.addParams,
        batchRequest: function (dm, changes, e, query) { 
			var res = {
                changed: changes.changed,
                added: changes.added,
                deleted: changes.deleted,
                action: "batch",
                table: e.url,
                key: e.key,
                antiForgery: (dm.dataSource.antiForgery) ? dm.antiForgeryToken().value : ""
            };
            if (query)
                this.addParams({ dm: dm, query: query, params: query._params, reqParams: res });
            return {
                type: "POST",
                url: dm.dataSource.batchUrl || dm.dataSource.crudUrl || dm.dataSource.url,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(res)
            };
        },
        processResponse: function (data, ds, query, xhr, request, changes, key) {
            if(!ej.isNullOrUndefined(changes)){
            if (data.d)
                data = data.d;
            if(data.added)changes.added = ej.parseJSON(data.added);
            if(data.changed)changes.changed = ej.parseJSON(data.changed);
            if(data.deleted)changes.deleted = ej.parseJSON(data.deleted);
            var i;
            for (i = 0; i < changes.added.length; i++)
                ej.JsonAdaptor.prototype.insert(ds, changes.added[i]);
            for (i = 0; i < changes.changed.length; i++)
                ej.JsonAdaptor.prototype.update(ds, key, changes.changed[i]);
            for (i = 0; i < changes.deleted.length; i++)
                ej.JsonAdaptor.prototype.remove(ds, key, changes.deleted[i]);
            return data;
             }
            else{
                if (data.d)
               return data.d;
            return data;
            }
        }
    });
    ej.WebApiAdaptor = new ej.ODataAdaptor().extend({
        insert: function (dm, data, tableName) {
            return {
                type: "POST",
                url: dm.dataSource.url,
                data: JSON.stringify(data)
            };
        },
        remove: function (dm, keyField, value, tableName) {
            return {
                type: "DELETE",
                url: dm.dataSource.url + "/" + value,
                data: JSON.stringify(value)
            };
        },
        update: function (dm, keyField, value, tableName) {
            return {
                type: "PUT",
                url: dm.dataSource.url,
                data: JSON.stringify(value)
            };
        },
		batchRequest: function (dm, changes, e) {
            var initialGuid = e.guid = ej.getGuid(oData.batchPre);
            var req = [];

		    //insertion 
		
			$.each(changes.added, function (i, d) {
			    req.push('--' + initialGuid);
			    req.push('Content-Type: application/http; msgtype=request', '');
			    req.push('POST' + ' ' + dm.dataSource.insertUrl + ' HTTP/1.1');
			    req.push('Content-Type: ' + 'application/json; charset=utf-8');
			    req.push('Host: ' + location.host);
			    req.push('', d ? JSON.stringify(d) : '');
			});
			
			//updation
			$.each(changes.changed, function (i, d) {
			    req.push('--' + initialGuid);
			    req.push('Content-Type: application/http; msgtype=request', '');
			    req.push('PUT' + ' ' + dm.dataSource.updateUrl + ' HTTP/1.1');
			    req.push('Content-Type: ' + 'application/json; charset=utf-8');
			    req.push('Host: ' + location.host);
			    req.push('', d ? JSON.stringify(d) : '');
			});
			
			//deletion
			$.each(changes.deleted, function (i, d) {
			    req.push('--' + initialGuid);
                req.push('Content-Type: application/http; msgtype=request', '');
                req.push('DELETE' + ' ' + dm.dataSource.removeUrl +"/"+ d[e.key] + ' HTTP/1.1');
                req.push('Content-Type: ' + 'application/json; charset=utf-8');
                req.push('Host: ' + location.host);
                req.push('', d ? JSON.stringify(d) : '');		
			});
			req.push('--' + initialGuid + '--', '');
            return {
				type: 'POST',
				url: dm.dataSource.batchUrl || dm.dataSource.crudUrl || dm.dataSource.url,
                data: req.join('\r\n'),
                contentType: 'multipart/mixed; boundary="' + initialGuid + '"',
            };
        },
        processResponse: function (data, ds, query, xhr, request, changes) {

            var pvt = request && request.ejPvtData;
            if (request && request.type.toLowerCase() != "post") {
                var version = xhr && xhr.getResponseHeader("DataServiceVersion"), count = null, aggregateResult = {};
                version = (version && parseInt(version, 10)) || 2;

                if (query && query._requiresCount) {
                     if (!isNull(data.Count)) count = data.Count;
                }

                if (version < 3 && data.Items) data = data.Items;

                if (pvt && pvt.aggregates && pvt.aggregates.length) {
                    var agg = pvt.aggregates, args = {}, fn, res = {};
                    for (var i = 0; i < agg.length; i++) {
                        fn = ej.aggregates[agg[i].type];
                        if (fn)
                            res[agg[i].field + " - " + agg[i].type] = fn(data, agg[i].field);
                    }
                    aggregateResult = res;
                }
                if (pvt && pvt.groups && pvt.groups.length) {
                    var groups = pvt.groups;
                    for (var i = 0; i < groups.length; i++) {
                        var format = getColFormat(groups[i], query.queries);
                        data = ej.group(data, groups[i], pvt.aggregates, format);
                    }
                }
                return isNull(count) ? data : { result: data, count: count, aggregates: aggregateResult };
            }
        }
    });
    var getValue = function (value, inst) {
        if (typeof value === "function")
            return value.call(inst || {});
        return value;
    }

    ej.TableModel = function (name, jsonArray, dataManager, modelComputed) {
        if (!instance(this, ej.TableModel))
            return new ej.TableModel(jsonArray);

        if (!instance(jsonArray, Array))
            throwError("ej.TableModel - Json Array is required");

        var rows = [], model, dirtyFn = $proxy(setDirty, this);

        for (var i = 0; i < jsonArray.length; i++) {
            model = new ej.Model(jsonArray[i], this);
            model.state = "unchanged";
            model.on("stateChange", dirtyFn);
            if (modelComputed)
                model.computes(modelComputed);
            rows.push(model);
        }

        this.name = name || "table1";

        this.rows = ej.NotifierArray(rows);
        this._deleted = [];

        this._events = $({});

        this.dataManager = dataManager;

        this._isDirty = false;

        return this;
    };

    ej.TableModel.prototype = {
        on: function (eventName, handler) {
            this._events.on(eventName, handler);
        },

        off: function (eventName, handler) {
            this._events.off(eventName, handler);
        },

        setDataManager: function (dataManager) {
            this.dataManagar = dataManager;
        },

        saveChanges: function () {
            if (!this.dataManager || !instance(this.dataManager, ej.DataManager))
                throwError("ej.TableModel - saveChanges : Set the dataManager using setDataManager function");

            if (!this.isDirty())
                return;

            var promise = this.dataManager.saveChanges(this.getChanges(), this.key, this.name);

            promise.done($proxy(function (changes) {
                var rows = this.toArray();
                for (var i = 0; i < rows.length; i++) {
                    if (rows.state === "added") {
                        rows.set(this.key, changes.added.filter(function (e) {
                            return e[this.key] === rows.get(this.key);
                        })[0][this.key]);
                    }
                    rows[i].markCommit();
                }

                this._events.triggerHandler({ type: "save", table: this });

            }, this));

            promise.fail($proxy(function (e) {
                this.rejectChanges();
                this._events.triggerHandler({ type: "reject", table: this, error: e });
            }, this));

            this._isDirty = false;
        },

        rejectChanges: function () {
            var rows = this.toArray();
            for (var i = 0; i < rows.length; i++)
                rows[i].revert(true);

            this._isDirty = false;
            this._events.triggerHandler({ type: "reject", table: this });
        },

        insert: function (json) {
            var model = new ej.Model(json);
            model._isDirty = this._isDirty = true;

            this.rows.push(model);

            this._events.triggerHandler({ type: "insert", model: model, table: this });
        },

        update: function (value) {
            if (!this.key)
                throwError("TableModel - update : Primary key should be assigned to TableModel.key");

            var row = value, model, key = this.key, keyValue = row[key];

            model = this.rows.array.filter(function (obj) {
                return obj.get(key) === keyValue;
            });

            model = model[0];

            for (var col in row) {
                model.set(col, row[col]);
            }

            this._isDirty = true;

            this._events.triggerHandler({ type: "update", model: model, table: this });
        },

        remove: function (key) {
            if (!this.key)
                throwError("TableModel - update : Primary key should be assigned to TableModel.key");

            var field = this.key;

            var index = -1, model;

            if (key && typeof key === "object") {
                key = key[field] !== undefined ? key[field] : key.get(field);
            }

            for (var i = 0; i < this.rows.length() ; i++) {
                if (this.rows.array[i].get(field) === key) {
                    index = i;
                    break;
                }
            }

            if (index > -1) {
                model = this.rows.removeAt(index);
                model.markDelete();

                this._deleted.push({ model: model, position: index });

                this._isDirty = true;
                this._events.triggerHandler({ type: "remove", model: model, table: this });
            }
        },

        isDirty: function () {
            return this._isDirty;
        },

        getChanges: function () {

            var changes = {
                added: [],
                changed: []
            };
            var rows = this.toArray();
            for (var i = 0; i < rows.length; i++) {
                if (changes[rows[i].state])
                    changes[rows[i].state].push(rows[i].json);
            }

            changes.deleted = ej.select(this._deleted, ["model"]);

            return changes;
        },

        toArray: function () {
            return this.rows.toArray();
        },

        setDirty: function (dirty, model) {
            if (this._isDirty === !!dirty) return;

            this._isDirty = !!dirty;

            this._events.triggerHandler({ type: "dirty", table: this, model: model });
        },
        get: function (index) {
            return this.rows.array[index];
        },
        length: function () {
            return this.rows.array.length;
        },

        bindTo: function (element) {
            var marker = tDiv, template = $(element.html()), rows = this.toArray(), cur;
            if ($.inArray(element.prop("tagName").toLowerCase(), ["table", "tbody"]))
                marker = tTR;

            marker.insertBefore(element);
            element.detach().empty();

            for (var i = 0; i < rows.length; i++) {
                cur = template.clone();
                rows[i].bindTo(cur);
                element.append(cur);
            }

            element.insertAfter(marker);
            marker.remove();
        }
    };

    var tDiv = doc ? $(document.createElement("div")) : {},
        tTR = doc ? $(document.createElement("tr")) : {};

    ej.Model = function (json, table, name) {
        if (typeof table === "string") {
            name = table;
            table = null;
        }
        this.$id = getUid("m");

        this.json = json;
        this.table = table instanceof ej.TableModel ? table : null;
        this.name = name || (this.table && this.table.name);
        this.dataManager = (table instanceof ej.DataManager) ? table : table.dataManagar;
        this.actual = {};
        this._events = $({});
        this.isDirty = false;
        this.state = "added";
        this._props = [];
        this._computeEls = {};
        this._fields = {};
        this._attrEls = {};
        this._updates = {};
        this.computed = {};
    };

    ej.Model.prototype = {
        computes: function (value) {
            $.extend(this.computed, value);
        },
        on: function (eventName, handler) {
            this._events.on(eventName, handler);
        },
        off: function (eventName, handler) {
            this._events.off(eventName, handler);
        },
        set: function (field, value) {
            var obj = this.json, actual = field, prev;
            field = field.split('.');

            for (var i = 0; i < field.length - 1; i++) {
                field = field[0];
                obj = obj[field[0]];
            }

            this.isDirty = true;
            this.changeState("changed", { from: "set" });

            prev = obj[field];

            if (this.actual[field] === undefined && !(field in this.actual))
                this.actual[field] = value; // Complex property ?

            obj[field] = value;

            this._updateValues(field, value);
            this._events.triggerHandler({ type: actual, current: value, previous: prev, model: this });
        },
        get: function (field) {
            return ej.pvt.getObject(field, this.json);
        },
        revert: function (suspendEvent) {
            for (var prop in this.actual) {
                this.json[prop] = this.actual[prop];
            }

            this.isDirty = false;

            if (suspendEvent)
                this.state = "unchanged";
            else
                this.changeState("unchanged", { from: "revert" });
        },
        save: function (dm, key) {
            dm = dm || this.dataManagar;
            key = key || dm.dataSource.key;
            if (!dm) throwError("ej.Model - DataManager is required to commit the changes");
            if (this.state === "added") {
                return dm.insert(this.json, this.name).done(ej.proxy(function (e) {
                    $.extend(this.json, e.record);
                }, this));
            }
            else if (this.state === "changed") {
                return dm.update(key, this.json, this.name);
            }
            else if (this.state === "deleted") {
                return dm.remove(key, this.json, this.name);
            }
        },
        markCommit: function () {
            this.isDirty = false;
            this.changeState("unchanged", { from: "commit" });
        },
        markDelete: function () {
            this.changeState("deleted", { from: "delete" });
        },
        changeState: function (state, args) {
            if (this.state === state) return;

            if (this.state === "added") {
                if (state === "deleted")
                    state = "unchanged";
                else return;
            }

            var prev = state;
            args = args || {};

            this.state = state;
            this._events.triggerHandler($.extend({ type: "stateChange", current: state, previous: prev, model: this }, args));
        },
        properties: function () {
            if (this._props.length)
                return this._props;

            for (var pr in this.json) {
                this._props.push(pr);
                this._updates[pr] = { read: [], input: [] };
            }

            return this._props;
        },
        bindTo: function (element) {
            var el = $(element), ctl, field,
                elements = el.find("[ej-observe], [ej-computed], [ej-prop]"), len = elements.length;

            el.data("ejModel", this);
            var unbindData = { fields: [], props: [], computes: [] };
            for (var i = 0; i < len; i++) {
                ctl = elements.eq(i);

                field = ctl.attr("ej-prop");
                if (field) {
                    this._processAttrib(field, ctl, unbindData);
                }
                field = ctl.attr("ej-observe");
                if (field && this._props.indexOf(field) !== -1) {
                    this._processField(ctl, field, unbindData);
                    continue;
                }

                field = ctl.attr("ej-computed");
                if (field) {
                    this._processComputed(field, ctl, unbindData);
                    continue;
                }
            }
            el.data("ejModelBinding" + this.$id, unbindData);
        },
        unbind: function (element) {
            var tmp, data = {
                props: this._attrEls,
                computes: this._computeEls
            }, isCustom = false;

            if (element) {
                data = $(element).removeData("ejModel").data("ejModelBinding" + this.$id) || data;
                isCustom = true;
            }

            for (var p in this.computed) {
                tmp = data.computes[p], p = this.computed[p];
                if (tmp && p.deps) {
                    this.off(p.deps.join(' '), tmp.handle);
                    if (isCustom)
                        delete this._computeEls[p];
                }
            }
            if (!isCustom)
                this._computeEls = {};

            for (var p in data.props) {
                tmp = data.props[p];
                if (tmp) {
                    this.off(tmp.deps.join(' '), tmp.handle);
                    delete data.props[p];
                    if (isCustom)
                        delete this._attrEls[p];
                }
            }
            if (!isCustom)
                this._attrEls = {};

            if (data.fields && data.fields.length) {
                var len = data.fields.length, ctl, idx, ty;
                for (var i = 0; i < len; i++) {
                    ctl = data.fields[i];
                    $(ctl).off("change", null, this._changeHandler);

                    ty = this.formElements.indexOf(ctl.tagName.toLowerCase()) !== -1 ? "input" : "read";
                    idx = this._updates[ty].indexOf(ctl);
                    if (idx !== -1)
                        this._updates[ty].splice(idx, 1);
                }
            }
        },
        _processComputed: function (value, element, data) {
            if (!value) return;

            var val, deps, safeVal = safeStr(value),
            type = this.formElements.indexOf(element[0].tagName.toLowerCase()) !== -1 ? "val" : "html";

            if (!this.computed[value] || !this.computed[safeVal]) {
                this.computed[safeVal] = {
                    value: new Function("var e = this; return " + value),
                    deps: this._generateDeps(value)
                }
                value = safeVal;
            }

            val = this.computed[value];
            if (!val.get) {
                val.get = function () {
                    val.value.call(this.json);
                }
            }

            deps = val.deps;
            val = val.value;

            this._updateDeps(deps);
            this._updateElement(element, type, val);

            val = { el: element, handle: $proxy(this._computeHandle, this, { value: value, type: type }) };
            this._computeEls[value] = val;
            data.computes[value] = val;

            this.on(deps.join(' '), val.handle);
        },
        _computeHandle: function (e) {
            var el = this._computeEls[e.value];
            if (el && this.computed[e.value])
                this._updateElement(el.el, e.type, this.computed[e.value].value);
        },
        _updateElement: function (el, type, val) {
            el[type](val.call($.extend({}, this.json, this.computed)));
        },
        _updateDeps: function (deps) {
            for (var i = 0; i < deps.length; i++) {
                if (!(deps[i] in this.json) && deps[i] in this.computed)
                    ej.merge(deps, this.computed[deps[i]].deps);
            }
        },
        _generateDeps: function (value) {
            var splits = value.replace(/(^e\.)|( e\.)/g, '#%^*##ej.#').split("#%^*#"),
                field, deps = [];

            for (var i = 0; i < splits.length; i++) {
                if (splits[i].startsWith("#ej.#")) {
                    field = splits[i].replace("#ej.#", "").split(' ')[0];
                    if (field && this._props.indexOf(field) !== -1)
                        deps.push(field);
                }
            }

            return deps;
        },
        _processAttrib: function (value, el, data) {
            var prop, val, res = {};
            value = value.replace(/^ +| +$/g, "").split(";");
            for (var i = 0; i < value.length; i++) {
                value[i] = value[i].split(":");
                if (value[i].length < 2) continue;

                prop = value[i][0].replace(/^ +| +$/g, "").replace(/^'|^"|'$|"$/g, "");
                res[prop] = value[i][1].replace(/^ +| +$/g, "").replace(/^'|^"|'$|"$/g, "");
            }
            value = res;
            var deps = [];
            for (prop in value)
                deps.push(value[prop]);

            this._updateDeps(deps);
            this._updateProps(el, value);

            res = getUid("emak");
            val = { el: el, handle: $proxy(this._attrHandle, this, res), value: value, deps: deps };
            el.prop("ejmodelattrkey", res);

            data.props[res] = val;
            this._attrEls[res] = val;

            this.on(deps.join(' '), val.handle);
        },
        _attrHandle: function (res) {
            var el = this._attrEls[res];
            if (el)
                this._updateProps(el.el, el.value);
        },
        _updateProps: function (element, value) {
            var json = this.json, t, c = this.computed;
            for (var prop in value) {
                t = value[prop];
                if (t in json)
                    t = json[t];
                else if (t in c) {
                    t = c[t];
                    if (t) {
                        t = t.value.call($.extend({}, this.json, c));
                    }
                }

                if (!isNull(t)) {
                    element.prop(prop, t);
                }
            }
        },
        _updateValues: function (prop, value) {
            var arr = this._updates[prop];

            if (!arr || (!arr.read && !arr.input)) return;

            this._ensureItems(arr.read, "html", value);
            this._ensureItems(arr.input, "val", value);
        },
        _ensureItems: function (a, type, value) {
            if (!a) return;

            for (var i = a.length - 1; i > -1; i--) {
                if (!a[i].offsetParent) {
                    a.splice(i, 1);
                    continue;
                }
                $(a[i])[type](value);
            }
        },
        _changeHandler: function (e) {
            e.data.self.set(e.data.prop, $(this).val());
        },
        _processField: function (ctl, field, data) {
            var e = { self: this, prop: field }, val = this.get(field);

            data.fields.push(ctl[0]);

            if (this.formElements.indexOf(ctl[0].tagName.toLowerCase()) === -1) {
                ctl.html(val);
                return this._updates[field].read.push(ctl[0]);
            }

            ctl.val(val)
                    .off("change", null, this._changeHandler)
                    .on("change", null, e, this._changeHandler);

            return this._updates[field].input.push(ctl[0]);
        },
        formElements: ["input", "select", "textarea"]
    };

    var safeReg = /[^\w]+/g;
    var safeStr = function (value) {
        return value.replace(safeReg, "_");
    };
    var setDirty = function (e) {
        this.setDirty(true, e.model);
    };

    ej.Predicate = function (field, operator, value, ignoreCase, ignoreAccent) {
        if (!(this instanceof ej.Predicate))
            return new ej.Predicate(field, operator, value, ignoreCase,ignoreAccent);

        this.ignoreAccent = false;

        if (typeof field === "string") {
			var checkAny = "";
			if(operator.toLowerCase().indexOf(" any") != -1) {
				operator = operator.replace(" any","");
				checkAny = "any";
			} 
			else if(operator.toLowerCase().indexOf(" all") != -1) {
				operator = operator.replace(" all","");
				checkAny = "all";
			} 
            this.field = field;
            this.operator = operator;
            this.value = value;
            this.ignoreCase = ignoreCase;
            this.ignoreAccent = ignoreAccent;
            this.isComplex = false;
			this.anyCondition = checkAny;

            this._comparer = ej.data.fnOperators.processOperator(checkAny != "" ? checkAny:this.operator);

        } else if (field instanceof ej.Predicate && value instanceof ej.Predicate || value instanceof Array) {
            this.isComplex = true;
            this.condition = operator.toLowerCase();
            this.predicates = [field];
            if (value instanceof Array)
                [].push.apply(this.predicates, value);
            else
                this.predicates.push(value);
        }
        return this;
    };

    ej.Predicate.and = function () {
        return pvtPredicate._combinePredicates([].slice.call(arguments, 0), "and");
    };

    ej.Predicate.or = function () {
        return pvtPredicate._combinePredicates([].slice.call(arguments, 0), "or");
    };

    ej.Predicate.fromJSON = function (json) {
        if (instance(json, Array)) {
            var res = [];
            for (var i = 0, len = json.length; i < len; i++)
                res.push(pvtPredicate._fromJSON(json[i]));
            return res;
        }

        return pvtPredicate._fromJSON(json);
    };

    // Private fn
    var pvtPredicate = {
        _combinePredicates: function (predicates, operator) {
            if (!predicates.length) return undefined;
            if (predicates.length === 1) {
                if (!instance(predicates[0], Array))
                    return predicates[0];
                predicates = predicates[0];
            }
            return new ej.Predicate(predicates[0], operator, predicates.slice(1));
        },

        _combine: function (pred, field, operator, value, condition, ignoreCase, ignoreAccent) {
            if (field instanceof ej.Predicate)
                return ej.Predicate[condition](pred, field);

            if (typeof field === "string")
                return ej.Predicate[condition](pred, new ej.Predicate(field, operator, value, ignoreCase,ignoreAccent));

            return throwError("Predicate - " + condition + " : invalid arguments");
        },

        _fromJSON: function (json) {

            if (!json || instance(json, ej.Predicate))
                return json;

            var preds = json.predicates || [], len = preds.length, predicates = [], result;

            for (var i = 0; i < len; i++)
                predicates.push(pvtPredicate._fromJSON(preds[i]));                     

            if(!json.isComplex)
                result = new ej.Predicate(json.field, json.operator, ej.parseJSON({ val: json.value }).val, json.ignoreCase,json.ignoreAccent);
            else
                result = new ej.Predicate(predicates[0], json.condition, predicates.slice(1));

            return result;
        }
    };

    ej.Predicate.prototype = {
        and: function (field, operator, value, ignoreCase,ignoreAccent) {
            return pvtPredicate._combine(this, field, operator, value, "and", ignoreCase,ignoreAccent);
        },
        or: function (field, operator, value, ignoreCase,ignoreAccent) {
            return pvtPredicate._combine(this, field, operator, value, "or", ignoreCase,ignoreAccent);
        },
        validate: function (record) {
            var p = this.predicates, isAnd, ret;

            if (!this.isComplex) {
                return this._comparer.call(this, ej.pvt.getObject(this.field, record), this.value, this.ignoreCase,this.ignoreAccent);
            }

            isAnd = this.condition === "and";

            for (var i = 0; i < p.length; i++) {
                ret = p[i].validate(record);
                if (isAnd) {
                    if (!ret) return false;
                } else {
                    if (ret) return true;
                }
            }

            return isAnd;
        },
        toJSON: function () {
            var predicates, p;
            if (this.isComplex) {
                predicates = [], p = this.predicates;
                for (var i = 0; i < p.length; i++)
                    predicates.push(p[i].toJSON());
            }
            return {
                isComplex: this.isComplex,
                field: this.field,
                operator: this.operator,
                value: this.value,
                ignoreCase: this.ignoreCase,
                ignoreAccent: this.ignoreAccent,
                condition: this.condition,
                predicates: predicates,
				anyCondition: this.anyCondition
            }
        }
    };

    ej.dataUtil = {
        swap: function (array, x, y) {
            if (x == y) return;

            var tmp = array[x];
            array[x] = array[y];
            array[y] = tmp;
        },

        mergeSort: function (jsonArray, fieldName, comparer) {
            if (!comparer || typeof comparer === "string")
                comparer = ej.pvt.fnSort(comparer, true);

            if (typeof fieldName === "function") {
                comparer = fieldName;
                fieldName = null;
            }

            return ej.pvt.mergeSort(jsonArray, fieldName, comparer);
        },

        max: function (jsonArray, fieldName, comparer) {
            if (typeof fieldName === "function") {
                comparer = fieldName;
                fieldName = null;
            }

            return ej.pvt.getItemFromComparer(jsonArray, fieldName, comparer || ej.pvt.fnDescending);
        },

        min: function (jsonArray, fieldName, comparer) {
            if (typeof fieldName === "function") {
                comparer = fieldName;
                fieldName = null;
            }

            return ej.pvt.getItemFromComparer(jsonArray, fieldName, comparer || ej.pvt.fnAscending);
        },

        distinct: function (json, fieldName, requiresCompleteRecord) {
            var result = [], val, tmp = {};
            for (var i = 0; i < json.length; i++) {
                val = getVal(json, fieldName, i);
                if (!(val in tmp)) {
                    result.push(!requiresCompleteRecord ? val : json[i]);
                    tmp[val] = 1;
                }
            }
            return result;
        },

        sum: function (json, fieldName) {
            var result = 0, val, castRequired = typeof getVal(json, fieldName, 0) !== "number";

            for (var i = 0; i < json.length; i++) {
                val = getVal(json, fieldName, i);
                if (!isNaN(val) && val !== null) {
                    if (castRequired)
                       val = +val;
                   result += val;
                }
            }
            return result;
        },

        avg: function (json, fieldName) {
            return ej.sum(json, fieldName) / json.length;
        },

        select: function (jsonArray, fields) {
            var newData = [];

            for (var i = 0; i < jsonArray.length; i++) {
                newData.push(ej.pvt.extractFields(jsonArray[i], fields));
            }

            return newData;
        },

        group: function (jsonArray, field, agg, format,/* internal */ level,groupDs) {
            level = level || 1;

            if (jsonArray.GROUPGUID == ej.pvt.consts.GROUPGUID) {
                for (var j = 0; j < jsonArray.length; j++) {
                    if(!ej.isNullOrUndefined(groupDs)){
                        var indx = -1;
                        var temp = $.grep(groupDs,function(e){return e.key==jsonArray[j].key});
                        indx = groupDs.indexOf(temp[0]);
                        jsonArray[j].items = ej.group(jsonArray[j].items, field, agg, format, jsonArray.level + 1, groupDs[indx].items);
                        jsonArray[j].count = groupDs[indx].count;
                    }
                    else{
                        jsonArray[j].items = ej.group(jsonArray[j].items, field, agg, format, jsonArray.level + 1);
                        jsonArray[j].count = jsonArray[j].items.length;
                    }  
                }

                jsonArray.childLevels += 1;
                return jsonArray;
            }

            var grouped = {}, groupedArray = [];

            groupedArray.GROUPGUID = ej.pvt.consts.GROUPGUID;
            groupedArray.level = level;
            groupedArray.childLevels = 0;
            groupedArray.records = jsonArray;

            for (var i = 0; i < jsonArray.length; i++) {
                var val = getVal(jsonArray, field, i);
                if (!ej.isNullOrUndefined(format)) val = format(val, field);

                if (!grouped[val]) {
                    grouped[val] = {
                        key: val,
                        count: 0,
                        items: [],
                        aggregates: {},
                        field: field
                    };
                    groupedArray.push(grouped[val]);
					if(!ej.isNullOrUndefined(groupDs)) {
                        var tempObj = $.grep(groupDs,function(e){return e.key==grouped[val].key});
                       grouped[val].count = tempObj[0].count
                    }
                }

                grouped[val].count = !ej.isNullOrUndefined(groupDs) ? grouped[val].count :  grouped[val].count += 1;
                grouped[val].items.push(jsonArray[i]);
            }
            if (agg && agg.length) {

                for (var i = 0; i < groupedArray.length; i++) {
                    var res = {}, fn;
                    for (var j = 0; j < agg.length; j++) {

                        fn = ej.aggregates[agg[j].type];
                        if(!ej.isNullOrUndefined(groupDs)) {
                            var temp = $.grep(groupDs,function(e){return e.key==groupedArray[i].key});
                            if(fn)
                                res[agg[j].field + " - " + agg[j].type] = fn(temp[0].items, agg[j].field);
                        }
                        else{
                            if (fn)
                                res[agg[j].field + " - " + agg[j].type] = fn(groupedArray[i].items, agg[j].field);
                        }

                    }
                    groupedArray[i]["aggregates"] = res;
                }
            }
            return groupedArray;
        },

        parseTable: function (table, headerOption, headerRowIndex) {
            var tr = table.rows, headerRow, headerTds = [], data = [], i;

            if (!tr.length) return [];

            headerRowIndex = headerRowIndex || 0;

            switch ((headerOption || "").toLowerCase()) {
                case ej.headerOption.tHead:
                    headerRow = table.tHead.rows[headerRowIndex];
                    break;
                case ej.headerOption.row:
                default:
                    headerRow = table.rows[headerRowIndex];
                    break;
            }

            var hTd = headerRow.cells;

            for (i = 0; i < hTd.length; i++)
                headerTds.push($.trim(hTd[i].innerHTML));

            for (i = headerRowIndex + 1; i < tr.length; i++) {
                var json = {}, td = tr[i].cells;
                for (var j = 0; j < td.length; j++) {
                    var temp = td[j].innerHTML;
                    if (typeof temp == "string" && $.isNumeric(temp))
                       json[headerTds[j]] = Number(temp);
				    else
                       json[headerTds[j]] = temp;
                }
                data.push(json);
            }
            return data;
        }
    };

    ej.headerOption = {
        tHead: "thead",
        row: "row"
    };

    ej.aggregates = {
        sum: function (ds, field) {
            return ej.sum(ds, field);
        },
        average: function (ds, field) {
            return ej.avg(ds, field);
        },
        minimum: function (ds, field) {
            return ej.getObject(field, ej.min(ds, field));
        },
        maximum: function (ds, field) {
            return  ej.getObject(field, ej.max(ds, field));
        },
        truecount: function (ds, field){
            var predicate = ej.Predicate(field, "equal", true);
            return ej.DataManager(ds).executeLocal(ej.Query().where(predicate)).length;
        },
        falsecount: function (ds, field) {
            var predicate = ej.Predicate(field, "equal", false);
            return ej.DataManager(ds).executeLocal(ej.Query().where(predicate)).length;
        },
        count: function (ds, field) {
            return ds.length;
        }

    };
    ej.pvt = {
        filterQueries: filterQueries,
        mergeSort: function (jsonArray, fieldName, comparer) {
            if (jsonArray.length <= 1)
                return jsonArray;

            // else list size is > 1, so split the list into two sublists
            var middle = parseInt(jsonArray.length / 2, 10);

            var left = jsonArray.slice(0, middle),
                right = jsonArray.slice(middle);

            left = ej.pvt.mergeSort(left, fieldName, comparer);
            right = ej.pvt.mergeSort(right, fieldName, comparer);

            return ej.pvt.merge(left, right, fieldName, comparer);
        },

        getItemFromComparer: function (array, field, comparer) {
            var keyVal, current, key, i = 0,castRequired = typeof getVal(array, field, 0) == "string";
            if (array.length)
            while (ej.isNullOrUndefined(keyVal) && i < array.length) {
                keyVal = getVal(array, field, i);
                key = array[i++];
            }
            for (; i < array.length; i++) {
                current = getVal(array, field, i);
                if (ej.isNullOrUndefined(current))
                    continue;
                if (castRequired) {
                    keyVal = +keyVal;
                    current = +current;
                }
                if (comparer(keyVal, current) > 0) {
                    keyVal = current;
                    key = array[i];
                }
            }
            return key;
        },

        quickSelect: function (array, fieldName, left, right, k, comparer) {
            if (left == right)
                return array[left];

            var pivotNewIndex = ej.pvt.partition(array, fieldName, left, right, comparer);

            var pivotDist = pivotNewIndex - left + 1;

            if (pivotDist == k)
                return array[pivotNewIndex];

            else if (k < pivotDist)
                return ej.pvt.quickSelect(array, fieldName, left, pivotNewIndex - 1, k, comparer);
            else
                return ej.pvt.quickSelect(array, fieldName, pivotNewIndex + 1, right, k - pivotDist, comparer);
        },

        extractFields: function (obj, fields) {
            var newObj = {};

            if (fields.length == 1)
                return ej.pvt.getObject(fields[0], obj);

            for (var i = 0; i < fields.length; i++) {
                newObj[fields[i].replace('.', ej.pvt.consts.complexPropertyMerge)] = ej.pvt.getObject(fields[i], obj);
            }

            return newObj;
        },

        partition: function (array, field, left, right, comparer) {

            var pivotIndex = parseInt((left + right) / 2, 10),
                pivot = getVal(array, field, pivotIndex);

            ej.swap(array, pivotIndex, right);

            pivotIndex = left;

            for (var i = left; i < right; i++) {
                if (comparer(getVal(array, field, i), pivot)) {
                    ej.swap(array, i, pivotIndex);
                    pivotIndex++;
                }
            }

            ej.swap(array, pivotIndex, right);

            return pivotIndex;
        },

        fnSort: function (order) {
            order = order ? order.toLowerCase() : ej.sortOrder.Ascending;

            if (order == ej.sortOrder.Ascending)
                return ej.pvt.fnAscending;

            return ej.pvt.fnDescending;
        },

        fnGetComparer: function (field, fn) {
            return function (x, y) {
                return fn(ej.pvt.getObject(field, x), ej.pvt.getObject(field, y));
            }
        },

        fnAscending: function (x, y) {
            if(ej.isNullOrUndefined(y) && ej.isNullOrUndefined(x))
                return -1;
                        
            if (y === null || y === undefined)
                return -1;

            if (typeof x === "string")
                return x.localeCompare(y);

            if (x === null || x === undefined)
                return 1;

            return x - y;
        },

        fnDescending: function (x, y) {
            if(ej.isNullOrUndefined(y) && ej.isNullOrUndefined(x))
                return -1;            

            if (y === null || y === undefined)
                return 1;

            if (typeof x === "string")
                return x.localeCompare(y) * -1;

            if (x === null || x === undefined)
                return -1;

            return y - x;
        },

        merge: function (left, right, fieldName, comparer) {
            var result = [], current;

            while (left.length > 0 || right.length > 0) {
                if (left.length > 0 && right.length > 0) {
                    if (comparer)
                        current = comparer(getVal(left, fieldName, 0), getVal(right, fieldName, 0)) <= 0 ? left : right;
                    else
                        current = left[0][fieldName] < left[0][fieldName] ? left : right;
                } else {
                    current = left.length > 0 ? left : right;
                }

                result.push(current.shift());
            }

            return result;
        },

        getObject: function (nameSpace, from) {
            if (!from) return undefined;
            if (!nameSpace) return from;

            if (nameSpace.indexOf('.') === -1) return from[nameSpace];

            var value = from, splits = nameSpace.split('.');

            for (var i = 0; i < splits.length; i++) {

                if (value == null) break;

                value = value[splits[i]];
            }

            return value;
        },

        createObject: function (nameSpace, value, initIn) {
            var splits = nameSpace.split('.'), start = initIn || window, from = start, i;

            for (i = 0; i < splits.length; i++) {

                if (i + 1 == splits.length)
                    from[splits[i]] = value === undefined ? {} : value;
                else if (from[splits[i]] == null)
                    from[splits[i]] = {};

                from = from[splits[i]];
            }

            return start;
        },

        ignoreDiacritics :function (value) {
            if (typeof value !== 'string') {
                return value;
            }
            var result = value.split('');
            var newValue = result.map(function (temp) { return temp in ej.data.diacritics ? ej.data.diacritics[temp] : temp; });
            return newValue.join('');
        },


        getFieldList: function (obj, fields, prefix) {
            if (prefix === undefined)
                prefix = "";

            if (fields === undefined || fields === null)
                return ej.pvt.getFieldList(obj, [], prefix);

            for (var prop in obj) {
                if (typeof obj[prop] === "object" && !(obj[prop] instanceof Array))
                    ej.pvt.getFieldList(obj[prop], fields, prefix + prop + ".");
                else
                    fields.push(prefix + prop);
            }

            return fields;
        }
    };

    ej.FilterOperators = {
        lessThan: "lessthan",
        greaterThan: "greaterthan",
        lessThanOrEqual: "lessthanorequal",
        greaterThanOrEqual: "greaterthanorequal",
        equal: "equal",
        contains: "contains",
        startsWith: "startswith",
        endsWith: "endswith",
        notEqual: "notequal"
    };

    ej.data = {};

    ej.data.operatorSymbols = {
        "<": "lessthan",
        ">": "greaterthan",
        "<=": "lessthanorequal",
        ">=": "greaterthanorequal",
        "==": "equal",
        "!=": "notequal",
        "*=": "contains",
        "$=": "endswith",
        "^=": "startswith"
    };

    ej.data.odBiOperator = {
        "<": " lt ",
        ">": " gt ",
        "<=": " le ",
        ">=": " ge ",
        "==": " eq ",
        "!=": " ne ",
        "lessthan": " lt ",
        "lessthanorequal": " le ",
        "greaterthan": " gt ",
        "greaterthanorequal": " ge ",
        "equal": " eq ",
        "notequal": " ne ",
		"in":" eq ",
		"notin": " ne "
    };

    ej.data.odUniOperator = {
        "$=": "endswith",
        "^=": "startswith",
        "*=": "substringof",
        "endswith": "endswith",
        "startswith": "startswith",
        "contains": "substringof",
		"notcontains":"substringof"
    };
    ej.data.diacritics = {
        '\u24B6': 'A',
        '\uFF21': 'A',
        '\u00C0': 'A',
        '\u00C1': 'A',
        '\u00C2': 'A',
        '\u1EA6': 'A',
        '\u1EA4': 'A',
        '\u1EAA': 'A',
        '\u1EA8': 'A',
        '\u00C3': 'A',
        '\u0100': 'A',
        '\u0102': 'A',
        '\u1EB0': 'A',
        '\u1EAE': 'A',
        '\u1EB4': 'A',
        '\u1EB2': 'A',
        '\u0226': 'A',
        '\u01E0': 'A',
        '\u00C4': 'A',
        '\u01DE': 'A',
        '\u1EA2': 'A',
        '\u00C5': 'A',
        '\u01FA': 'A',
        '\u01CD': 'A',
        '\u0200': 'A',
        '\u0202': 'A',
        '\u1EA0': 'A',
        '\u1EAC': 'A',
        '\u1EB6': 'A',
        '\u1E00': 'A',
        '\u0104': 'A',
        '\u023A': 'A',
        '\u2C6F': 'A',
        '\uA732': 'AA',
        '\u00C6': 'AE',
        '\u01FC': 'AE',
        '\u01E2': 'AE',
        '\uA734': 'AO',
        '\uA736': 'AU',
        '\uA738': 'AV',
        '\uA73A': 'AV',
        '\uA73C': 'AY',
        '\u24B7': 'B',
        '\uFF22': 'B',
        '\u1E02': 'B',
        '\u1E04': 'B',
        '\u1E06': 'B',
        '\u0243': 'B',
        '\u0182': 'B',
        '\u0181': 'B',
        '\u24B8': 'C',
        '\uFF23': 'C',
        '\u0106': 'C',
        '\u0108': 'C',
        '\u010A': 'C',
        '\u010C': 'C',
        '\u00C7': 'C',
        '\u1E08': 'C',
        '\u0187': 'C',
        '\u023B': 'C',
        '\uA73E': 'C',
        '\u24B9': 'D',
        '\uFF24': 'D',
        '\u1E0A': 'D',
        '\u010E': 'D',
        '\u1E0C': 'D',
        '\u1E10': 'D',
        '\u1E12': 'D',
        '\u1E0E': 'D',
        '\u0110': 'D',
        '\u018B': 'D',
        '\u018A': 'D',
        '\u0189': 'D',
        '\uA779': 'D',
        '\u01F1': 'DZ',
        '\u01C4': 'DZ',
        '\u01F2': 'Dz',
        '\u01C5': 'Dz',
        '\u24BA': 'E',
        '\uFF25': 'E',
        '\u00C8': 'E',
        '\u00C9': 'E',
        '\u00CA': 'E',
        '\u1EC0': 'E',
        '\u1EBE': 'E',
        '\u1EC4': 'E',
        '\u1EC2': 'E',
        '\u1EBC': 'E',
        '\u0112': 'E',
        '\u1E14': 'E',
        '\u1E16': 'E',
        '\u0114': 'E',
        '\u0116': 'E',
        '\u00CB': 'E',
        '\u1EBA': 'E',
        '\u011A': 'E',
        '\u0204': 'E',
        '\u0206': 'E',
        '\u1EB8': 'E',
        '\u1EC6': 'E',
        '\u0228': 'E',
        '\u1E1C': 'E',
        '\u0118': 'E',
        '\u1E18': 'E',
        '\u1E1A': 'E',
        '\u0190': 'E',
        '\u018E': 'E',
        '\u24BB': 'F',
        '\uFF26': 'F',
        '\u1E1E': 'F',
        '\u0191': 'F',
        '\uA77B': 'F',
        '\u24BC': 'G',
        '\uFF27': 'G',
        '\u01F4': 'G',
        '\u011C': 'G',
        '\u1E20': 'G',
        '\u011E': 'G',
        '\u0120': 'G',
        '\u01E6': 'G',
        '\u0122': 'G',
        '\u01E4': 'G',
        '\u0193': 'G',
        '\uA7A0': 'G',
        '\uA77D': 'G',
        '\uA77E': 'G',
        '\u24BD': 'H',
        '\uFF28': 'H',
        '\u0124': 'H',
        '\u1E22': 'H',
        '\u1E26': 'H',
        '\u021E': 'H',
        '\u1E24': 'H',
        '\u1E28': 'H',
        '\u1E2A': 'H',
        '\u0126': 'H',
        '\u2C67': 'H',
        '\u2C75': 'H',
        '\uA78D': 'H',
        '\u24BE': 'I',
        '\uFF29': 'I',
        '\u00CC': 'I',
        '\u00CD': 'I',
        '\u00CE': 'I',
        '\u0128': 'I',
        '\u012A': 'I',
        '\u012C': 'I',
        '\u0130': 'I',
        '\u00CF': 'I',
        '\u1E2E': 'I',
        '\u1EC8': 'I',
        '\u01CF': 'I',
        '\u0208': 'I',
        '\u020A': 'I',
        '\u1ECA': 'I',
        '\u012E': 'I',
        '\u1E2C': 'I',
        '\u0197': 'I',
        '\u24BF': 'J',
        '\uFF2A': 'J',
        '\u0134': 'J',
        '\u0248': 'J',
        '\u24C0': 'K',
        '\uFF2B': 'K',
        '\u1E30': 'K',
        '\u01E8': 'K',
        '\u1E32': 'K',
        '\u0136': 'K',
        '\u1E34': 'K',
        '\u0198': 'K',
        '\u2C69': 'K',
        '\uA740': 'K',
        '\uA742': 'K',
        '\uA744': 'K',
        '\uA7A2': 'K',
        '\u24C1': 'L',
        '\uFF2C': 'L',
        '\u013F': 'L',
        '\u0139': 'L',
        '\u013D': 'L',
        '\u1E36': 'L',
        '\u1E38': 'L',
        '\u013B': 'L',
        '\u1E3C': 'L',
        '\u1E3A': 'L',
        '\u0141': 'L',
        '\u023D': 'L',
        '\u2C62': 'L',
        '\u2C60': 'L',
        '\uA748': 'L',
        '\uA746': 'L',
        '\uA780': 'L',
        '\u01C7': 'LJ',
        '\u01C8': 'Lj',
        '\u24C2': 'M',
        '\uFF2D': 'M',
        '\u1E3E': 'M',
        '\u1E40': 'M',
        '\u1E42': 'M',
        '\u2C6E': 'M',
        '\u019C': 'M',
        '\u24C3': 'N',
        '\uFF2E': 'N',
        '\u01F8': 'N',
        '\u0143': 'N',
        '\u00D1': 'N',
        '\u1E44': 'N',
        '\u0147': 'N',
        '\u1E46': 'N',
        '\u0145': 'N',
        '\u1E4A': 'N',
        '\u1E48': 'N',
        '\u0220': 'N',
        '\u019D': 'N',
        '\uA790': 'N',
        '\uA7A4': 'N',
        '\u01CA': 'NJ',
        '\u01CB': 'Nj',
        '\u24C4': 'O',
        '\uFF2F': 'O',
        '\u00D2': 'O',
        '\u00D3': 'O',
        '\u00D4': 'O',
        '\u1ED2': 'O',
        '\u1ED0': 'O',
        '\u1ED6': 'O',
        '\u1ED4': 'O',
        '\u00D5': 'O',
        '\u1E4C': 'O',
        '\u022C': 'O',
        '\u1E4E': 'O',
        '\u014C': 'O',
        '\u1E50': 'O',
        '\u1E52': 'O',
        '\u014E': 'O',
        '\u022E': 'O',
        '\u0230': 'O',
        '\u00D6': 'O',
        '\u022A': 'O',
        '\u1ECE': 'O',
        '\u0150': 'O',
        '\u01D1': 'O',
        '\u020C': 'O',
        '\u020E': 'O',
        '\u01A0': 'O',
        '\u1EDC': 'O',
        '\u1EDA': 'O',
        '\u1EE0': 'O',
        '\u1EDE': 'O',
        '\u1EE2': 'O',
        '\u1ECC': 'O',
        '\u1ED8': 'O',
        '\u01EA': 'O',
        '\u01EC': 'O',
        '\u00D8': 'O',
        '\u01FE': 'O',
        '\u0186': 'O',
        '\u019F': 'O',
        '\uA74A': 'O',
        '\uA74C': 'O',
        '\u01A2': 'OI',
        '\uA74E': 'OO',
        '\u0222': 'OU',
        '\u24C5': 'P',
        '\uFF30': 'P',
        '\u1E54': 'P',
        '\u1E56': 'P',
        '\u01A4': 'P',
        '\u2C63': 'P',
        '\uA750': 'P',
        '\uA752': 'P',
        '\uA754': 'P',
        '\u24C6': 'Q',
        '\uFF31': 'Q',
        '\uA756': 'Q',
        '\uA758': 'Q',
        '\u024A': 'Q',
        '\u24C7': 'R',
        '\uFF32': 'R',
        '\u0154': 'R',
        '\u1E58': 'R',
        '\u0158': 'R',
        '\u0210': 'R',
        '\u0212': 'R',
        '\u1E5A': 'R',
        '\u1E5C': 'R',
        '\u0156': 'R',
        '\u1E5E': 'R',
        '\u024C': 'R',
        '\u2C64': 'R',
        '\uA75A': 'R',
        '\uA7A6': 'R',
        '\uA782': 'R',
        '\u24C8': 'S',
        '\uFF33': 'S',
        '\u1E9E': 'S',
        '\u015A': 'S',
        '\u1E64': 'S',
        '\u015C': 'S',
        '\u1E60': 'S',
        '\u0160': 'S',
        '\u1E66': 'S',
        '\u1E62': 'S',
        '\u1E68': 'S',
        '\u0218': 'S',
        '\u015E': 'S',
        '\u2C7E': 'S',
        '\uA7A8': 'S',
        '\uA784': 'S',
        '\u24C9': 'T',
        '\uFF34': 'T',
        '\u1E6A': 'T',
        '\u0164': 'T',
        '\u1E6C': 'T',
        '\u021A': 'T',
        '\u0162': 'T',
        '\u1E70': 'T',
        '\u1E6E': 'T',
        '\u0166': 'T',
        '\u01AC': 'T',
        '\u01AE': 'T',
        '\u023E': 'T',
        '\uA786': 'T',
        '\uA728': 'TZ',
        '\u24CA': 'U',
        '\uFF35': 'U',
        '\u00D9': 'U',
        '\u00DA': 'U',
        '\u00DB': 'U',
        '\u0168': 'U',
        '\u1E78': 'U',
        '\u016A': 'U',
        '\u1E7A': 'U',
        '\u016C': 'U',
        '\u00DC': 'U',
        '\u01DB': 'U',
        '\u01D7': 'U',
        '\u01D5': 'U',
        '\u01D9': 'U',
        '\u1EE6': 'U',
        '\u016E': 'U',
        '\u0170': 'U',
        '\u01D3': 'U',
        '\u0214': 'U',
        '\u0216': 'U',
        '\u01AF': 'U',
        '\u1EEA': 'U',
        '\u1EE8': 'U',
        '\u1EEE': 'U',
        '\u1EEC': 'U',
        '\u1EF0': 'U',
        '\u1EE4': 'U',
        '\u1E72': 'U',
        '\u0172': 'U',
        '\u1E76': 'U',
        '\u1E74': 'U',
        '\u0244': 'U',
        '\u24CB': 'V',
        '\uFF36': 'V',
        '\u1E7C': 'V',
        '\u1E7E': 'V',
        '\u01B2': 'V',
        '\uA75E': 'V',
        '\u0245': 'V',
        '\uA760': 'VY',
        '\u24CC': 'W',
        '\uFF37': 'W',
        '\u1E80': 'W',
        '\u1E82': 'W',
        '\u0174': 'W',
        '\u1E86': 'W',
        '\u1E84': 'W',
        '\u1E88': 'W',
        '\u2C72': 'W',
        '\u24CD': 'X',
        '\uFF38': 'X',
        '\u1E8A': 'X',
        '\u1E8C': 'X',
        '\u24CE': 'Y',
        '\uFF39': 'Y',
        '\u1EF2': 'Y',
        '\u00DD': 'Y',
        '\u0176': 'Y',
        '\u1EF8': 'Y',
        '\u0232': 'Y',
        '\u1E8E': 'Y',
        '\u0178': 'Y',
        '\u1EF6': 'Y',
        '\u1EF4': 'Y',
        '\u01B3': 'Y',
        '\u024E': 'Y',
        '\u1EFE': 'Y',
        '\u24CF': 'Z',
        '\uFF3A': 'Z',
        '\u0179': 'Z',
        '\u1E90': 'Z',
        '\u017B': 'Z',
        '\u017D': 'Z',
        '\u1E92': 'Z',
        '\u1E94': 'Z',
        '\u01B5': 'Z',
        '\u0224': 'Z',
        '\u2C7F': 'Z',
        '\u2C6B': 'Z',
        '\uA762': 'Z',
        '\u24D0': 'a',
        '\uFF41': 'a',
        '\u1E9A': 'a',
        '\u00E0': 'a',
        '\u00E1': 'a',
        '\u00E2': 'a',
        '\u1EA7': 'a',
        '\u1EA5': 'a',
        '\u1EAB': 'a',
        '\u1EA9': 'a',
        '\u00E3': 'a',
        '\u0101': 'a',
        '\u0103': 'a',
        '\u1EB1': 'a',
        '\u1EAF': 'a',
        '\u1EB5': 'a',
        '\u1EB3': 'a',
        '\u0227': 'a',
        '\u01E1': 'a',
        '\u00E4': 'a',
        '\u01DF': 'a',
        '\u1EA3': 'a',
        '\u00E5': 'a',
        '\u01FB': 'a',
        '\u01CE': 'a',
        '\u0201': 'a',
        '\u0203': 'a',
        '\u1EA1': 'a',
        '\u1EAD': 'a',
        '\u1EB7': 'a',
        '\u1E01': 'a',
        '\u0105': 'a',
        '\u2C65': 'a',
        '\u0250': 'a',
        '\uA733': 'aa',
        '\u00E6': 'ae',
        '\u01FD': 'ae',
        '\u01E3': 'ae',
        '\uA735': 'ao',
        '\uA737': 'au',
        '\uA739': 'av',
        '\uA73B': 'av',
        '\uA73D': 'ay',
        '\u24D1': 'b',
        '\uFF42': 'b',
        '\u1E03': 'b',
        '\u1E05': 'b',
        '\u1E07': 'b',
        '\u0180': 'b',
        '\u0183': 'b',
        '\u0253': 'b',
        '\u24D2': 'c',
        '\uFF43': 'c',
        '\u0107': 'c',
        '\u0109': 'c',
        '\u010B': 'c',
        '\u010D': 'c',
        '\u00E7': 'c',
        '\u1E09': 'c',
        '\u0188': 'c',
        '\u023C': 'c',
        '\uA73F': 'c',
        '\u2184': 'c',
        '\u24D3': 'd',
        '\uFF44': 'd',
        '\u1E0B': 'd',
        '\u010F': 'd',
        '\u1E0D': 'd',
        '\u1E11': 'd',
        '\u1E13': 'd',
        '\u1E0F': 'd',
        '\u0111': 'd',
        '\u018C': 'd',
        '\u0256': 'd',
        '\u0257': 'd',
        '\uA77A': 'd',
        '\u01F3': 'dz',
        '\u01C6': 'dz',
        '\u24D4': 'e',
        '\uFF45': 'e',
        '\u00E8': 'e',
        '\u00E9': 'e',
        '\u00EA': 'e',
        '\u1EC1': 'e',
        '\u1EBF': 'e',
        '\u1EC5': 'e',
        '\u1EC3': 'e',
        '\u1EBD': 'e',
        '\u0113': 'e',
        '\u1E15': 'e',
        '\u1E17': 'e',
        '\u0115': 'e',
        '\u0117': 'e',
        '\u00EB': 'e',
        '\u1EBB': 'e',
        '\u011B': 'e',
        '\u0205': 'e',
        '\u0207': 'e',
        '\u1EB9': 'e',
        '\u1EC7': 'e',
        '\u0229': 'e',
        '\u1E1D': 'e',
        '\u0119': 'e',
        '\u1E19': 'e',
        '\u1E1B': 'e',
        '\u0247': 'e',
        '\u025B': 'e',
        '\u01DD': 'e',
        '\u24D5': 'f',
        '\uFF46': 'f',
        '\u1E1F': 'f',
        '\u0192': 'f',
        '\uA77C': 'f',
        '\u24D6': 'g',
        '\uFF47': 'g',
        '\u01F5': 'g',
        '\u011D': 'g',
        '\u1E21': 'g',
        '\u011F': 'g',
        '\u0121': 'g',
        '\u01E7': 'g',
        '\u0123': 'g',
        '\u01E5': 'g',
        '\u0260': 'g',
        '\uA7A1': 'g',
        '\u1D79': 'g',
        '\uA77F': 'g',
        '\u24D7': 'h',
        '\uFF48': 'h',
        '\u0125': 'h',
        '\u1E23': 'h',
        '\u1E27': 'h',
        '\u021F': 'h',
        '\u1E25': 'h',
        '\u1E29': 'h',
        '\u1E2B': 'h',
        '\u1E96': 'h',
        '\u0127': 'h',
        '\u2C68': 'h',
        '\u2C76': 'h',
        '\u0265': 'h',
        '\u0195': 'hv',
        '\u24D8': 'i',
        '\uFF49': 'i',
        '\u00EC': 'i',
        '\u00ED': 'i',
        '\u00EE': 'i',
        '\u0129': 'i',
        '\u012B': 'i',
        '\u012D': 'i',
        '\u00EF': 'i',
        '\u1E2F': 'i',
        '\u1EC9': 'i',
        '\u01D0': 'i',
        '\u0209': 'i',
        '\u020B': 'i',
        '\u1ECB': 'i',
        '\u012F': 'i',
        '\u1E2D': 'i',
        '\u0268': 'i',
        '\u0131': 'i',
        '\u24D9': 'j',
        '\uFF4A': 'j',
        '\u0135': 'j',
        '\u01F0': 'j',
        '\u0249': 'j',
        '\u24DA': 'k',
        '\uFF4B': 'k',
        '\u1E31': 'k',
        '\u01E9': 'k',
        '\u1E33': 'k',
        '\u0137': 'k',
        '\u1E35': 'k',
        '\u0199': 'k',
        '\u2C6A': 'k',
        '\uA741': 'k',
        '\uA743': 'k',
        '\uA745': 'k',
        '\uA7A3': 'k',
        '\u24DB': 'l',
        '\uFF4C': 'l',
        '\u0140': 'l',
        '\u013A': 'l',
        '\u013E': 'l',
        '\u1E37': 'l',
        '\u1E39': 'l',
        '\u013C': 'l',
        '\u1E3D': 'l',
        '\u1E3B': 'l',
        '\u017F': 'l',
        '\u0142': 'l',
        '\u019A': 'l',
        '\u026B': 'l',
        '\u2C61': 'l',
        '\uA749': 'l',
        '\uA781': 'l',
        '\uA747': 'l',
        '\u01C9': 'lj',
        '\u24DC': 'm',
        '\uFF4D': 'm',
        '\u1E3F': 'm',
        '\u1E41': 'm',
        '\u1E43': 'm',
        '\u0271': 'm',
        '\u026F': 'm',
        '\u24DD': 'n',
        '\uFF4E': 'n',
        '\u01F9': 'n',
        '\u0144': 'n',
        '\u00F1': 'n',
        '\u1E45': 'n',
        '\u0148': 'n',
        '\u1E47': 'n',
        '\u0146': 'n',
        '\u1E4B': 'n',
        '\u1E49': 'n',
        '\u019E': 'n',
        '\u0272': 'n',
        '\u0149': 'n',
        '\uA791': 'n',
        '\uA7A5': 'n',
        '\u01CC': 'nj',
        '\u24DE': 'o',
        '\uFF4F': 'o',
        '\u00F2': 'o',
        '\u00F3': 'o',
        '\u00F4': 'o',
        '\u1ED3': 'o',
        '\u1ED1': 'o',
        '\u1ED7': 'o',
        '\u1ED5': 'o',
        '\u00F5': 'o',
        '\u1E4D': 'o',
        '\u022D': 'o',
        '\u1E4F': 'o',
        '\u014D': 'o',
        '\u1E51': 'o',
        '\u1E53': 'o',
        '\u014F': 'o',
        '\u022F': 'o',
        '\u0231': 'o',
        '\u00F6': 'o',
        '\u022B': 'o',
        '\u1ECF': 'o',
        '\u0151': 'o',
        '\u01D2': 'o',
        '\u020D': 'o',
        '\u020F': 'o',
        '\u01A1': 'o',
        '\u1EDD': 'o',
        '\u1EDB': 'o',
        '\u1EE1': 'o',
        '\u1EDF': 'o',
        '\u1EE3': 'o',
        '\u1ECD': 'o',
        '\u1ED9': 'o',
        '\u01EB': 'o',
        '\u01ED': 'o',
        '\u00F8': 'o',
        '\u01FF': 'o',
        '\u0254': 'o',
        '\uA74B': 'o',
        '\uA74D': 'o',
        '\u0275': 'o',
        '\u01A3': 'oi',
        '\u0223': 'ou',
        '\uA74F': 'oo',
        '\u24DF': 'p',
        '\uFF50': 'p',
        '\u1E55': 'p',
        '\u1E57': 'p',
        '\u01A5': 'p',
        '\u1D7D': 'p',
        '\uA751': 'p',
        '\uA753': 'p',
        '\uA755': 'p',
        '\u24E0': 'q',
        '\uFF51': 'q',
        '\u024B': 'q',
        '\uA757': 'q',
        '\uA759': 'q',
        '\u24E1': 'r',
        '\uFF52': 'r',
        '\u0155': 'r',
        '\u1E59': 'r',
        '\u0159': 'r',
        '\u0211': 'r',
        '\u0213': 'r',
        '\u1E5B': 'r',
        '\u1E5D': 'r',
        '\u0157': 'r',
        '\u1E5F': 'r',
        '\u024D': 'r',
        '\u027D': 'r',
        '\uA75B': 'r',
        '\uA7A7': 'r',
        '\uA783': 'r',
        '\u24E2': 's',
        '\uFF53': 's',
        '\u00DF': 's',
        '\u015B': 's',
        '\u1E65': 's',
        '\u015D': 's',
        '\u1E61': 's',
        '\u0161': 's',
        '\u1E67': 's',
        '\u1E63': 's',
        '\u1E69': 's',
        '\u0219': 's',
        '\u015F': 's',
        '\u023F': 's',
        '\uA7A9': 's',
        '\uA785': 's',
        '\u1E9B': 's',
        '\u24E3': 't',
        '\uFF54': 't',
        '\u1E6B': 't',
        '\u1E97': 't',
        '\u0165': 't',
        '\u1E6D': 't',
        '\u021B': 't',
        '\u0163': 't',
        '\u1E71': 't',
        '\u1E6F': 't',
        '\u0167': 't',
        '\u01AD': 't',
        '\u0288': 't',
        '\u2C66': 't',
        '\uA787': 't',
        '\uA729': 'tz',
        '\u24E4': 'u',
        '\uFF55': 'u',
        '\u00F9': 'u',
        '\u00FA': 'u',
        '\u00FB': 'u',
        '\u0169': 'u',
        '\u1E79': 'u',
        '\u016B': 'u',
        '\u1E7B': 'u',
        '\u016D': 'u',
        '\u00FC': 'u',
        '\u01DC': 'u',
        '\u01D8': 'u',
        '\u01D6': 'u',
        '\u01DA': 'u',
        '\u1EE7': 'u',
        '\u016F': 'u',
        '\u0171': 'u',
        '\u01D4': 'u',
        '\u0215': 'u',
        '\u0217': 'u',
        '\u01B0': 'u',
        '\u1EEB': 'u',
        '\u1EE9': 'u',
        '\u1EEF': 'u',
        '\u1EED': 'u',
        '\u1EF1': 'u',
        '\u1EE5': 'u',
        '\u1E73': 'u',
        '\u0173': 'u',
        '\u1E77': 'u',
        '\u1E75': 'u',
        '\u0289': 'u',
        '\u24E5': 'v',
        '\uFF56': 'v',
        '\u1E7D': 'v',
        '\u1E7F': 'v',
        '\u028B': 'v',
        '\uA75F': 'v',
        '\u028C': 'v',
        '\uA761': 'vy',
        '\u24E6': 'w',
        '\uFF57': 'w',
        '\u1E81': 'w',
        '\u1E83': 'w',
        '\u0175': 'w',
        '\u1E87': 'w',
        '\u1E85': 'w',
        '\u1E98': 'w',
        '\u1E89': 'w',
        '\u2C73': 'w',
        '\u24E7': 'x',
        '\uFF58': 'x',
        '\u1E8B': 'x',
        '\u1E8D': 'x',
        '\u24E8': 'y',
        '\uFF59': 'y',
        '\u1EF3': 'y',
        '\u00FD': 'y',
        '\u0177': 'y',
        '\u1EF9': 'y',
        '\u0233': 'y',
        '\u1E8F': 'y',
        '\u00FF': 'y',
        '\u1EF7': 'y',
        '\u1E99': 'y',
        '\u1EF5': 'y',
        '\u01B4': 'y',
        '\u024F': 'y',
        '\u1EFF': 'y',
        '\u24E9': 'z',
        '\uFF5A': 'z',
        '\u017A': 'z',
        '\u1E91': 'z',
        '\u017C': 'z',
        '\u017E': 'z',
        '\u1E93': 'z',
        '\u1E95': 'z',
        '\u01B6': 'z',
        '\u0225': 'z',
        '\u0240': 'z',
        '\u2C6C': 'z',
        '\uA763': 'z',
        '\u0386': '\u0391',
        '\u0388': '\u0395',
        '\u0389': '\u0397',
        '\u038A': '\u0399',
        '\u03AA': '\u0399',
        '\u038C': '\u039F',
        '\u038E': '\u03A5',
        '\u03AB': '\u03A5',
        '\u038F': '\u03A9',
        '\u03AC': '\u03B1',
        '\u03AD': '\u03B5',
        '\u03AE': '\u03B7',
        '\u03AF': '\u03B9',
        '\u03CA': '\u03B9',
        '\u0390': '\u03B9',
        '\u03CC': '\u03BF',
        '\u03CD': '\u03C5',
        '\u03CB': '\u03C5',
        '\u03B0': '\u03C5',
        '\u03C9': '\u03C9',
        '\u03C2': '\u03C3'
    };


    ej.data.fnOperators = {
        equal: function (actual, expected, ignoreCase,ignoreAccent) {
            if (ignoreAccent) {
                actual = ej.pvt.ignoreDiacritics(actual);
                expected = ej.pvt.ignoreDiacritics(expected);
            }
            if (ignoreCase)
                return toLowerCase(actual) == toLowerCase(expected);

            return actual == expected;
        },
        notequal: function (actual, expected, ignoreCase,ignoreAccent) {
            if (ignoreAccent) {
                actual = ej.pvt.ignoreDiacritics(actual);
                expected = ej.pvt.ignoreDiacritics(expected);
            }
            return !ej.data.fnOperators.equal(actual, expected, ignoreCase);
        },
		notin: function (actual, expected, ignoreCase) {
			for(var i = 0; i < expected.length; i++) 
				if(ej.data.fnOperators.notequal(actual, expected[i], ignoreCase) == false) return false;
            return true;
        },
        lessthan: function (actual, expected, ignoreCase) {
            if (ignoreCase)
                return toLowerCase(actual) < toLowerCase(expected);

            return actual < expected;
        },
        greaterthan: function (actual, expected, ignoreCase) {
            if (ignoreCase)
                return toLowerCase(actual) > toLowerCase(expected);

            return actual > expected;
        },
        lessthanorequal: function (actual, expected, ignoreCase) {
            if (ignoreCase)
                return toLowerCase(actual) <= toLowerCase(expected);

            return actual <= expected;
        },
        greaterthanorequal: function (actual, expected, ignoreCase) {
            if (ignoreCase)
                return toLowerCase(actual) >= toLowerCase(expected);

            return actual >= expected;
        },
        contains: function (actual, expected, ignoreCase,ignoreAccent) {
            if (ignoreAccent) {
                actual = ej.pvt.ignoreDiacritics(actual);
                expected = ej.pvt.ignoreDiacritics(expected);
            }
            if (ignoreCase)
                return !isNull(actual) && !isNull(expected) && toLowerCase(actual).indexOf(toLowerCase(expected)) != -1;

            return !isNull(actual) && !isNull(expected) && actual.toString().indexOf(expected) != -1;
        },
		notcontains: function (actual, expected, ignoreCase,ignoreAccent) {
            if (ignoreAccent) {
                actual = ej.pvt.ignoreDiacritics(actual);
                expected = ej.pvt.ignoreDiacritics(expected);
            }
			 return !ej.data.fnOperators.contains(actual, expected, ignoreCase);
		},
        notnull: function (actual) {
            return actual !== null;
        },
        isnull: function (actual) {
            return actual === null;
        },
        startswith: function (actual, expected, ignoreCase,ignoreAccent) {
            if (ignoreAccent) {
                actual = ej.pvt.ignoreDiacritics(actual);
                expected = ej.pvt.ignoreDiacritics(expected);
            }
            if (ignoreCase)
                return actual && expected && toLowerCase(actual).startsWith(toLowerCase(expected));

            return actual && expected && actual.startsWith(expected);
        },
        endswith: function (actual, expected, ignoreCase,ignoreAccent) {
            if (ignoreAccent) {
                actual = ej.pvt.ignoreDiacritics(actual);
                expected = ej.pvt.ignoreDiacritics(expected);
            }
            if (ignoreCase)
                return actual && expected && toLowerCase(actual).endsWith(toLowerCase(expected));

            return actual && expected && actual.endsWith(expected);
        },
		all: function (actual, expected, ignoreCase ) {
			for(var i = 0; i < expected.length; i++)
				if (ej.data.fnOperators[this.operator](actual, expected[i], ignoreCase) == false) return false;
            return true;
		},
		any: function (actual, expected, ignoreCase ) {
			for(var i = 0; i < expected.length; i++)
				if (ej.data.fnOperators[this.operator](actual, expected[i], ignoreCase) == true) return true;
            return false;
		},
        processSymbols: function (operator) {
            var fnName = ej.data.operatorSymbols[operator];
            if (fnName) {
                var fn = ej.data.fnOperators[fnName];
                if (fn) return fn;
            }

            return throwError("Query - Process Operator : Invalid operator");
        },

        processOperator: function (operator) {
            var fn = ej.data.fnOperators[operator];
            if (fn) return fn;
            return ej.data.fnOperators.processSymbols(operator);
        }
    };

    ej.data.fnOperators["in"] = function (actual, expected, ignoreCase) {
        for(var i = 0; i < expected.length; i++)
            if (ej.data.fnOperators.equal(actual, expected[i], ignoreCase) == true) return true;
        return false;
    };

    ej.NotifierArray = function (array) {
        if (!instance(this, ej.NotifierArray))
            return new ej.NotifierArray(array);

        this.array = array;

        this._events = $({});
        this._isDirty = false;

        return this;
    };

    ej.NotifierArray.prototype = {
        on: function (eventName, handler) {
            this._events.on(eventName, handler);
        },
        off: function (eventName, handler) {
            this._events.off(eventName, handler);
        },
        push: function (item) {
            var ret;

            if (instance(item, Array))
                ret = [].push.apply(this.array, item);
            else
                ret = this.array.push(item);

            this._raise("add", { item: item, index: this.length() - 1 });

            return ret;
        },
        pop: function () {
            var ret = this.array.pop();

            this._raise("remove", { item: ret, index: this.length() - 1 });

            return ret;
        },
        addAt: function (index, item) {
            this.array.splice(index, 0, item);

            this._raise("add", { item: item, index: index });

            return item;
        },
        removeAt: function (index) {
            var ret = this.array.splice(index, 1)[0];

            this._raise("remove", { item: ret, index: index });

            return ret;
        },
        remove: function (item) {
            var index = this.array.indexOf(item);

            if (index > -1) {
                this.array.splice(index, 1);
                this._raise("remove", { item: item, index: index });
            }

            return index;
        },
        length: function () {
            return this.array.length;
        },
        _raise: function (e, args) {
            this._events.triggerHandler($.extend({ type: e }, args));
            this._events.triggerHandler({ type: "all", name: e, args: args });
        },
        toArray: function () {
            return this.array;
        }
    };

    $.extend(ej, ej.dataUtil);

    // For IE8
    Array.prototype.forEach = Array.prototype.forEach || function (fn, scope) {
        for (var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope, this[i], i, this);
        }
    };

    Array.prototype.indexOf = Array.prototype.indexOf || function (searchElement) {
        var len = this.length;

        if (len === 0) return -1;

        for (var i = 0; i < len; i++) {
            if (i in this && this[i] === searchElement)
                return i;
        }
        return -1;
    };

    Array.prototype.filter = Array.prototype.filter || function (fn) {
        if (typeof fn != "function")
            throw new TypeError();

        var res = [];
        var thisp = arguments[1] || this;
        for (var i = 0; i < this.length; i++) {
            var val = this[i]; // in case fun mutates this
            if (fn.call(thisp, val, i, this))
                res.push(val);
        }

        return res;
    };

    String.prototype.endsWith = String.prototype.endsWith || function (key) {
        return this.slice(-key.length) === key;
    };

    String.prototype.startsWith = String.prototype.startsWith || function (key) {
        return this.slice(0, key.length) === key;
    };

    if (!ej.support) ej.support = {};
    ej.support.stableSort = function () {
        var res = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].sort(function () { return 0; });
		for(var i = 0; i < 17; i++){
		    if(i !== res[i]) return false;
		}
        return true;
    }();
    ej.support.cors = $.support.cors;

    if (!$.support.cors && window.XDomainRequest) {
        var httpRegEx = /^https?:\/\//i;
        var getOrPostRegEx = /^get|post$/i;
        var sameSchemeRegEx = new RegExp('^' + location.protocol, 'i');
        var xmlRegEx = /\/xml/i;

        // ajaxTransport exists in jQuery 1.5+
        $.ajaxTransport('text html xml json', function (options, userOptions, jqXHR) {
            // XDomainRequests must be: asynchronous, GET or POST methods, HTTP or HTTPS protocol, and same scheme as calling page
            if (options.crossDomain && options.async && getOrPostRegEx.test(options.type) && httpRegEx.test(userOptions.url) && sameSchemeRegEx.test(userOptions.url)) {
                var xdr = null;
                var userType = (userOptions.dataType || '').toLowerCase();
                return {
                    send: function (headers, complete) {
                        xdr = new XDomainRequest();
                        if (/^\d+$/.test(userOptions.timeout)) {
                            xdr.timeout = userOptions.timeout;
                        }
                        xdr.ontimeout = function () {
                            complete(500, 'timeout');
                        };
                        xdr.onload = function () {
                            var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
                            var status = {
                                code: 200,
                                message: 'success'
                            };
                            var responses = {
                                text: xdr.responseText
                            };

                            try {
                                if (userType === 'json') {
                                    try {
                                        responses.json = JSON.parse(xdr.responseText);
                                    } catch (e) {
                                        status.code = 500;
                                        status.message = 'parseerror';
                                        //throw 'Invalid JSON: ' + xdr.responseText;
                                    }
                                } else if ((userType === 'xml') || ((userType !== 'text') && xmlRegEx.test(xdr.contentType))) {
                                    var doc = new ActiveXObject('Microsoft.XMLDOM');
                                    doc.async = false;
                                    try {
                                        doc.loadXML(xdr.responseText);
                                    } catch (e) {
                                        doc = undefined;
                                    }
                                    if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
                                        status.code = 500;
                                        status.message = 'parseerror';
                                        throw 'Invalid XML: ' + xdr.responseText;
                                    }
                                    responses.xml = doc;
                                }
                            } catch (parseMessage) {
                                throw parseMessage;
                            } finally {
                                complete(status.code, status.message, responses, allResponseHeaders);
                            }
                        };
                        xdr.onerror = function () {
                            complete(500, 'error', {
                                text: xdr.responseText
                            });
                        };
						if(navigator.userAgent.indexOf("MSIE 9.0") != -1)
							xdr.onprogress = function() {};
                        xdr.open(options.type, options.url);
                        xdr.send(userOptions.data);
                        //xdr.send();
                    },
                    abort: function () {
                        if (xdr) {
                            xdr.abort();
                        }
                    }
                };
            }
        });
    }

    $.support.cors = true;

    ej.sortOrder = {
        Ascending: "ascending",
        Descending: "descending"
    };

    // privates
    ej.pvt.consts = {
        GROUPGUID: "{271bbba0-1ee7}",
        complexPropertyMerge: "_"
    };

    // private utils
    var nextTick = function (fn, context) {
        if (context) fn = $proxy(fn, context);
        (window.setImmediate || window.setTimeout)(fn, 0);
    };

    ej.support.enableLocalizedSort = false;

    var stableSort = function (ds, field, comparer, queries) {
        if (ej.support.stableSort) {
            if(!ej.support.enableLocalizedSort && typeof ej.pvt.getObject(field, ds[0] || {}) == "string" 
                && (comparer === ej.pvt.fnAscending || comparer === ej.pvt.fnDescending)
                && queries.filter(function(e){return e.fn === "onSortBy";}).length === 1)
                return fastSort(ds, field, comparer === ej.pvt.fnDescending);
            return ds.sort(ej.pvt.fnGetComparer(field, comparer));
        }
        return ej.mergeSort(ds, field, comparer);
    };
    var getColFormat = function (field, query) {
        var grpQuery = $.grep(query, function (args) { return args.fn == "onGroup" });
        for (var grp = 0; grp < grpQuery.length; grp++) {
            if (ej.getObject("fieldName", grpQuery[grp].e) == field) {
                return ej.getObject("fn", grpQuery[grp].e);
            }
        }
    };
    var fastSort = function(ds, field, isDesc){
        var old = Object.prototype.toString;
        Object.prototype.toString = (field.indexOf('.') === -1) ? function(){
            return this[field];
        }:function(){
            return ej.pvt.getObject(field, this);
        };
        ds = ds.sort();
        Object.prototype.toString = old;
        if(isDesc)
            ds.reverse();
    }

    var toLowerCase = function (val) {
        return val ? val.toLowerCase ? val.toLowerCase() : val.toString().toLowerCase() : (val === 0 || val === false) ? val.toString() : "";
    };

    var getVal = function (array, field, index) {
        return field ? ej.pvt.getObject(field, array[index]) : array[index];
    };

    var isHtmlElement = function (e) {
        return typeof HTMLElement === "object" ? e instanceof HTMLElement :
            e && e.nodeType === 1 && typeof e === "object" && typeof e.nodeName === "string";
    };

    var instance = function (obj, element) {
        return obj instanceof element;
    };

    var getTableModel = function (name, result, dm, computed) {
        return function (tName) {
            if (typeof tName === "object") {
                computed = tName;
                tName = null;
            }
            return new ej.TableModel(tName || name, result, dm, computed);
        };
    };

    var getKnockoutModel = function (result) {
        return function (computedObservables, ko) {
            ko = ko || window.ko;

            if (!ko) throwError("Knockout is undefined");

            var model, koModels = [], prop, ob;
            for (var i = 0; i < result.length; i++) {
                model = {};
                for (prop in result[i]) {
                    if (!prop.startsWith("_"))
                        model[prop] = ko.observable(result[i][prop]);
                }
                for (prop in computedObservables) {
                    ob = computedObservables[prop];

                    if ($.isPlainObject(ob)) {
                        if (!ob.owner) ob.owner = model;
                        ob = ko.computed(ob);
                    } else
                        ob = ko.computed(ob, model);

                    model[prop] = ob;
                }
                koModels.push(model);
            }

            return ko.observableArray(koModels);
        };
    };

    var uidIndex = 0;
    var getUid = function (prefix) {
        uidIndex += 1;
        return prefix + uidIndex;
    };

    ej.getGuid = function (prefix) {
        var hexs = '0123456789abcdef', rand;
        return (prefix || "") + '00000000-0000-4000-0000-000000000000'.replace(/0/g, function (val, i) {
            if ("crypto" in window && "getRandomValues" in crypto) {
                var arr = new Uint8Array(1)
                window.crypto.getRandomValues(arr);
                rand = arr[0] % 16|0
            }
            else rand = Math.random() * 16 | 0;
            return hexs[i === 19 ? rand & 0x3 | 0x8 : rand];
        });
    };

    var proxy = function (fn, context) {
        return function () {
            var args = [].slice.call(arguments, 0);
            args.push(this);

            return fn.apply(context || this, args);
        };
    };

    var $proxy = function (fn, context, arg) {
        if ('bind' in fn)
            return arg ? fn.bind(context, arg) : fn.bind(context);

        return function () {
            var args = arg ? [arg] : []; args.push.apply(args, arguments);
            return fn.apply(context || this, args);
        };
    };

    ej.merge = function (first, second) {
        if (!first || !second) return;

        Array.prototype.push.apply(first, second);
    };

    var isNull = function (val) {
        return val === undefined || val === null;
    };

    var throwError = function (er) {
        try {
            throw new Error(er);
        } catch (e) {
            throw e.message + "\n" + e.stack;
        }
    };

})(window.jQuery, window.Syncfusion, window.document);;
(function($, undefined){
    
ej.globalize = {};
ej.cultures = {};

ej.cultures['default'] = ej.cultures['en-US'] = $.extend(true, {
    name: 'en-US',
    englishName: "English",
    nativeName: "English",
    language: 'en',
    isRTL: false,
    numberFormat: {
        pattern: ["-n"],
        decimals: 2,
        ',': ",",
        '.': ".",
        groupSizes: [3],
        '+': "+",
        '-': "-",
        percent: {
            pattern: ["-n %", "n %"],
            decimals: 2,
            groupSizes: [3],
            ',': ",",
            '.': ".",
            symbol: '%'
        },
        currency: {
            pattern: ["($n)", "$n"],
            decimals: 2,
            groupSizes: [3],
            ',': ",",
            '.': ".",
            symbol: '$'
        }
    },
    calendars: {
    	standard: {
	        '/': '/',
	        ':': ':',
	        firstDay: 0,
			week:{
			name:"Week",
			nameAbbr:"Wek",
			nameShort:"Wk"
			},
	        days: {
	            names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	            namesAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	            namesShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
	        },
	        months: {
	            names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ""],
	            namesAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""]
	        },
	        AM: ['AM', 'am', 'AM'],
	        PM: ['PM', 'pm', 'PM'],
            twoDigitYearMax: 2029,
	        patterns: {
                d: "M/d/yyyy",
                D: "dddd, MMMM dd, yyyy",
                t: "h:mm tt",
                T: "h:mm:ss tt",
                f: "dddd, MMMM dd, yyyy h:mm tt",
                F: "dddd, MMMM dd, yyyy h:mm:ss tt",
                M: "MMMM dd",
                Y: "yyyy MMMM",
                S: "yyyy\u0027-\u0027MM\u0027-\u0027dd\u0027T\u0027HH\u0027:\u0027mm\u0027:\u0027ss"

	        }
    	}
    }
}, ej.cultures['en-US']);

ej.cultures['en-US'].calendar = ej.cultures['en-US'].calendar || ej.cultures['en-US'].calendars.standard; 



// *************************************** Numbers ***************************************
var regexTrim = /^\s+|\s+$/g,
    regexInfinity = /^[+-]?infinity$/i,
    regexHex = /^0x[a-f0-9]+$/i,
	regexExpo = /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)/,
    regexParseFloat = /^[+-]?\d*\.?\d*(e[+-]?\d+)?$/;
var charMap =  {
                '9': "[0-9 ]",
				'0': "[0-9 ]",
                'a': "[A-Za-z0-9 ]",
                'A': "[A-Za-z0-9]",
                'N': "[0-9]",
                '#': "[0-9]",
                '&': '[^\x7f]+',
                '<': "",
                '>': "",
                'C': "[A-Za-z ]",
                '?': "[A-Za-z]",
            };

function  formatMapper (format, value) {
    var mask = format || "", rules = charMap, value = value.toString(), isDecimal = value.indexOf(".") > -1 || format.indexOf(".") > -1, diff = 0, stIdx = 0, preFormat = "", escFormat = "",
		separator = format.split(","), newChar = "0", expValue, exponentIdx = format.toLowerCase().indexOf("e"), valueColl, formatColl, hashIdx = mask.indexOf("#");
	if(format.indexOf("\\") > -1) {
		escFormat = format.substr(0, format.lastIndexOf("\\") + 1);
		format = format.substr(format.lastIndexOf("\\") + 1, format.length);
		hashIdx = format.indexOf("#");
	}
	if(exponentIdx > -1) {
		var maskFirst = "", mask = "";
		formatColl = format.toLowerCase().split("e");
		expValue = format.indexOf("+") > -1 ? format.split("+")[1] : format.split("-")[1];
		value = parseInt(value).toExponential();
		valueColl = value.split("e");
		diff = formatColl[1].length - valueColl[1].length;
		for(var k = formatColl[1].length - 1; k > 0; k--) {
			if(formatColl[1][k] != "0")
				mask += formatColl[1][k];
			else if(diff > 1) {
				mask += "#";
				diff--;
			}
			else
				mask += "0";
		}
		var oprMask = (format.indexOf("+") > -1) ? "+" : "";
		mask = oprMask + mask.split("").reverse().join("");
		for(var k = 0; k < valueColl[0].length; k++)
			maskFirst = (valueColl[0][k] != ".") ? maskFirst.concat("#") : maskFirst.concat(".");
		if(maskFirst.length > formatColl[0].length)
			maskFirst = formatColl[0];
		mask = escFormat + maskFirst + "e" + mask;
	}
	else if(isDecimal) {
		formatColl = format.split(".");
		valueColl = value.split(".");
		formatColl[1] = formatColl[1].replace(/[,.]/g, "");
		diff = formatColl[0].replace(/[,.]/g, "").length - valueColl[0].replace(/[,.]/g, "").length;
		if(diff < 0 && ej.isNullOrUndefined(format.match(/[\[\(\)\]]/g))) {
			separator = formatColl[0].split(",");
			preFormat = formatColl[0].split(",")
			for(var j = separator.length - 1;j >= 0; j--) {
				if(separator[j]) {
					var cnt = separator[j].length;
					for(var k = 0, len = Math.abs(diff); k < len; k++) {
						if(cnt === 3) {
							break;
							cnt = 0;
						}
						preFormat[j] = "0" + preFormat[j];
						cnt++;
						diff++;
					}
				}
			}
			preFormat = preFormat.join();
			if(diff < 0) {
				(!ej.isNullOrUndefined(cnt) && cnt != 3) && (preFormat = "," + preFormat);
				for(var k = 0, len = Math.abs(diff); k < len; k++) {
					if(cnt === 3) {
						preFormat = "," + preFormat;
						cnt = 0;
					}
					preFormat = "0" + preFormat;
					cnt++;
				}
			}
			diff = 0;
			mask = escFormat + preFormat + "." + formatColl[1];
		}
		else if(ej.isNullOrUndefined(format.match(/[\[\(\)\]]/g))){
			preFormat = formatColl[0].replace(/[,.]/g, "");
			var postFormat = "";
			var cnt = 0;
			for(var i = preFormat.length - 1; i >= 0; i--) {
				if(cnt === 3) {
					postFormat = "," + postFormat;
					cnt = 0;
				}
				else
					cnt++;
				postFormat = preFormat[i] + postFormat;
			}
			mask = escFormat + postFormat + "." + formatColl[1];
		}
	}
	else {
		var hashCount = 0, separatorColl = separator.splice(1, separator.length);
		diff = format.replace(/[,.\[\(\]\)]/g, "").length - value.replace(/[,.]/g, "").length;
		if(hashIdx > -1) {
			for(var f = 0, len = format.length; f < len; f++)
				(format[f] === "#") && hashCount++;
			if(hashCount === 1 || (separator[1] && hashCount === 2))
				newChar = "#";
			(hashCount === 1) && (separatorColl = separator[0]);
		}
		if(diff < 0) {
			formatColl = mask.split(",");
			preFormat = formatColl.splice(1, formatColl.length);	
			for(var j = separator.length - 1;j >= 0; j--) {
				if(separatorColl[j]) {
					var cnt = separatorColl[j].length;
					!preFormat[j] && (preFormat[j] = "");
					for(var k = 0, len = Math.abs(diff) + 1; k < len; k++) {
						if(hashCount != 1 && cnt === 3) {
							cnt = 0;
							break;
						}
						preFormat[j] = preFormat[j].concat(newChar);
						cnt++;
						diff++;
					}
				}
			}
			preFormat = preFormat.join();
			if(diff < 0) {
				(!ej.isNullOrUndefined(cnt) && cnt != 3) && (preFormat = "," + preFormat);
				for(var k = 0, len = Math.abs(diff) + 1; k < len; k++) {
					if(hashCount != 1 && cnt === 3) {
						preFormat = "," + preFormat;
						cnt = 0;
					}
					preFormat = newChar + preFormat;
					cnt++;
				}
			}
			diff = 0;
			mask = escFormat + preFormat;
		}
		stIdx = 0;
	}
	var mapper = [], maskChars = mask.split(""), mapperIdx = 0, i = 0, idx = 0, chr, rule, isEscChar = false, isExp = false, escIdx = format.indexOf("\\");
    for (; i < mask.length; i++) {
        chr = maskChars[i];
		if(chr === "e")
			isExp = true;
        if((chr === "0" && hashIdx < 0)) {
			if((diff > 0 && stIdx <= i)) {
				diff--;
				stIdx++;
			}
			else if(diff > 0)
				diff--;
			else
				rule = rules[chr];
		}
		else if(chr != "0" || (!isExp && chr == "0")) 
			rule = rules[chr];
		if(chr === "0" && escIdx > -1) 
			rule = rules[chr];
		if(i === mask.lastIndexOf("\\"))
			isEscChar = false;
        if (rule && !isEscChar) {
            mapper[mapperIdx] = { rule: rule };
            mapperIdx += 1;
        } else {
            if (chr === "\\") {
                chr = "";
				!(i === mask.lastIndexOf("\\")) && (isEscChar = true);
            }
            chr = chr.split("");
            for (var j = 0; j < chr.length; j++) {
                mapper[mapperIdx] = chr[j];
                mapperIdx += 1;
            }
        }
    }
    rules = mapper;
	return {"rules": rules, "format": mask};
}

function customFormat(value, format, locale) {
	if(ej.isNullOrUndefined(value) || typeof value === "string" || !format)
		throw "Bad Number Format Exception";
	var formatLength, formatObj, formatModel, rules, orgFormat = format;
	formatObj = formatMapper(format, value);
	rules = formatObj.rules;
	format = formatObj.format;
    if (!(format.indexOf("\\") >= 0))
        formatModel = format.replace(/[9?CANa#&]/g, '_');
    else {
		var escIdx = format.lastIndexOf("\\"), first = format.slice(0, escIdx), second = format.slice(escIdx + 1, format.length), altFormat;
		second = second.replace(/[9?CANa#&]/g, '_');
		altFormat = first + second;
        formatModel = altFormat.replace(/[\\]/g, "");
		format = format.replace(/[\\]/g, "");
	}
    formatModel = changeCulture(formatModel, locale);
    return validateValue(value, format, formatModel, rules, locale, orgFormat);
}

function changeCulture(formatModel, locale) {
	if (formatModel.length != 0) {
        var preferredlocale = ej.preferredCulture(locale), groupSep, currecySymbol, decimalSep,unmask = "";
        groupSep = preferredlocale.numberFormat[','];
        currecySymbol = preferredlocale.numberFormat.currency.symbol;
        decimalSep = preferredlocale.numberFormat['.'];
        for (var i = 0; i < formatModel.length; i++) {
            if (formatModel[i] == ",")
                unmask += groupSep;
            else if (formatModel[i] == ".")
                unmask += decimalSep;
            else if (formatModel[i] == "$")
                unmask += currecySymbol;
            else
                unmask += formatModel[i];
        }
        formatModel = unmask;
    }
	return formatModel;
}

function validateValue(value, format, formatModel, rules, locale, orgFormat) {
	if(ej.isNullOrUndefined(value))
		return;
	if(format.toLowerCase().indexOf("e") > -1) {
		var expValue = orgFormat.indexOf("+") > -1 ? orgFormat.split("+")[1] : orgFormat.split("-")[1];
		value = value.toExponential();
		(orgFormat.indexOf("-") > -1) && (value = value.replace("+", "")); 
    }
    var oldvalue, replacestring, i, tvalue;
	var tempValue = oldvalue = replacestring = value.toString(), tempModel = formatModel, maskIndex = i = 0, chr, prompt = "_", rule,
		strBefore, strAfter, charValue, isBracket = format.match(/[\(\[\]\)]/g);
    if (!format.indexOf("\\") >= 0)
        tempValue = value = replacestring.replace(/[\(\)-]/g, "");
    else
        tempValue = tvalue;
	var j = rules.length - 1;
	var v = oldvalue.length - 1;
	if(!ej.isNullOrUndefined(isBracket)) {
		while (j >= 0) {
			chr = oldvalue[v];
			rule = rules[j];
			if (chr == undefined) break;
			if (chr === rule || chr === prompt || (chr === "e" && (chr === rule.toLowerCase()))) {
				chr === prompt ? prompt : "";
				strBefore = tempModel.substring(0, j+1);
				strAfter = tempModel.substring(j+1);
				chr = changeCulture(chr, locale);
				tempModel = strBefore.substr(0, strBefore.length - 1)  + chr + strAfter;
				j--;
				v--;
			}
			else if (rules[j].rule != undefined ) {
				var charCode = oldvalue.charCodeAt(v);
				if (validateChars(format, charCode, j)) {
					strBefore = tempModel.substring(0, j +1);
					strAfter = tempModel.substring(j+1);
					charValue = getRoundValue(oldvalue, v, j, format, formatModel);
					tempModel = strBefore.substr(0, strBefore.length - 1) + charValue + strAfter;
					j--;
					v--;
				} else 
					j--;
			} 
			else
				j--;
			if (i > tempValue.length || j<0) break;
		}
	}
	else {
		while (maskIndex < rules.length) {
			chr = oldvalue[i];
			rule = rules[maskIndex];
			if (chr == undefined) break;
			if (chr === rule || chr === prompt || (chr === "e" && (chr === rule.toLowerCase()))) {
				chr === prompt ? prompt : "";
				strBefore = tempModel.substring(0, maskIndex);
				strAfter = tempModel.substring(maskIndex);
				chr = changeCulture(chr, locale);
				tempModel = strBefore + chr + strAfter.substr(1, strAfter.length);
				i += 1;
				maskIndex += 1;
			}
			else if (rules[maskIndex].rule != undefined ) {
				var charCode = oldvalue.charCodeAt(i);
				if (validateChars(format, charCode, maskIndex)) {
					strBefore = tempModel.substring(0, maskIndex);
					strAfter = tempModel.substring(maskIndex);
					charValue = getRoundValue(oldvalue, i, maskIndex, format, formatModel);
					tempModel = strBefore + charValue + strAfter.substr(1, strAfter.length);
					maskIndex++;
					i++;
				} else
					maskIndex++;
			} 
			else {
				if(rule === "e")
					i = oldvalue.indexOf("e") + 1;
				maskIndex++;
			}
			if (i > tempValue.length || j<0) break;
		}
	}
    if (value) {
		if((tempModel.indexOf("_") - tempModel.indexOf(",") === 1) || (tempModel.indexOf("_") - tempModel.indexOf(".") === 1))
			tempModel = tempModel.slice(0, tempModel.indexOf("_")-1);
        var strippedValue = $.trim(tempModel.replace(/[_]/g, "")) == "" ? null : tempModel.replace(/[_]/g, "");
		return strippedValue;
	}
}

function validateChars (format, keyChar, caretPos){
	var charmap = charMap, match = false, maskChar = format.substr(caretPos, 1), actualkey = String.fromCharCode(keyChar);
    $.each(charmap, function (key, value) {
        if (maskChar == key) {
            if (actualkey.match(new RegExp(value))) match = true;
                else match = false;
        }
    });
    return match;
}

function getRoundValue(value, valIdx, maskIndex, format, formatModel) {
	var isCeil = false;
	if(format.indexOf(".") > -1 && (maskIndex === formatModel.length - 1))
		(value[valIdx + 1] > 5) && (isCeil = true);
	return (isCeil ? (parseInt(value[valIdx]) + 1).toString() : value[valIdx]);
}

function patternStartsWith(value, pattern) {
    return value.indexOf( pattern ) === 0;
}

function patternEndsWith(value, pattern) {
    return value.substr( value.length - pattern.length ) === pattern;
}

function trim(value) {
    return (value+"").replace( regexTrim, "" );
}

function truncate(value){
    if(isNaN(value))
        return NaN;
    
    return Math[value < 0 ? "ceil" : "floor"](value);
}

function padWithZero(str, count, left) {
    for (var l = str.length; l < count; l++) {
        str = (left ? ('0' + str) : (str + '0'));
    }
    return str;
}

function parseNumberWithNegativePattern(value, nf, negativePattern) {
    var neg = nf["-"],
        pos = nf["+"],
        ret;
    switch (negativePattern) {
        case "n -":
            neg = ' ' + neg;
            pos = ' ' + pos;
            // fall through
        case "n-":
            if ( patternEndsWith( value, neg ) ) {
                ret = [ '-', value.substr( 0, value.length - neg.length ) ];
            }
            else if ( patternEndsWith( value, pos ) ) {
                ret = [ '+', value.substr( 0, value.length - pos.length ) ];
            }
            break;
        case "- n":
            neg += ' ';
            pos += ' ';
            // fall through
        case "-n":
            if ( patternStartsWith( value, neg ) ) {
                ret = [ '-', value.substr( neg.length ) ];
            }
            else if ( patternStartsWith(value, pos) ) {
                ret = [ '+', value.substr( pos.length ) ];
            }
            break;
        case "(n)":
            if ( patternStartsWith( value, '(' ) && patternEndsWith( value, ')' ) ) {
                ret = [ '-', value.substr( 1, value.length - 2 ) ];
            }
            break;
    }
    return ret || [ '', value ];
}

function getFullNumber(number, precision, formatInfo) {
    var groupSizes = formatInfo.groupSizes || [3],
        curSize = groupSizes[0],
        curGroupIndex = 1,
        rounded = ej._round(number, precision);
    if (!isFinite(rounded)) {
        rounded = number;
    }
    number = rounded;

    var numberString = number + "",
        right = "",
        split = numberString.split(/e/i),
        exponent = split.length > 1 ? parseInt(split[1], 10) : 0;
    numberString = split[0];
    split = numberString.split(".");
    numberString = split[0];
    right = split.length > 1 ? split[1] : "";

    var l;
    if (exponent > 0) {
        right = padWithZero(right, exponent, false);
        numberString += right.slice(0, exponent);
        right = right.substr(exponent);
    } else if (exponent < 0) {
        exponent = -exponent;
        numberString = padWithZero(numberString, exponent + 1, true);
        right = numberString.slice(-exponent, numberString.length) + right;
        numberString = numberString.slice(0, -exponent);
    }

    var dot = formatInfo['.'] || '.';
    if (precision > 0) {
        right = dot +
            ((right.length > precision) ? right.slice(0, precision) : padWithZero(right, precision));
    } else {
        right = "";
    }

    var stringIndex = numberString.length - 1,
        sep = formatInfo[","] || ',',
        ret = "";

    while (stringIndex >= 0) {
        if (curSize === 0 || curSize > stringIndex) {
            return numberString.slice(0, stringIndex + 1) + (ret.length ? (sep + ret + right) : right);
        }
        ret = numberString.slice(stringIndex - curSize + 1, stringIndex + 1) + (ret.length ? (sep + ret) : "");

        stringIndex -= curSize;

        if (curGroupIndex < groupSizes.length) {
            curSize = groupSizes[curGroupIndex];
            curGroupIndex++;
        }
    }
    return numberString.slice(0, stringIndex + 1) + sep + ret + right;
}

function formatNumberToCulture(value, format, culture) {
    if (!format || format === 'i') {
        return culture.name.length ? value.toLocaleString() : value.toString();
    }
    format = format || "D";

    var nf = culture.numberFormat,
        number = Math.abs(value),
        precision = -1,
        pattern;

    if (format.length > 1) precision = parseInt(format.slice(1), 10);

    var current = format.charAt(0).toUpperCase(),
        formatInfo;

    switch (current) {
        case 'D':
            pattern = 'n';
            number = truncate(number);
            if (precision !== -1) {
                number = padWithZero("" + number, precision, true);
            }
            if (value < 0) number = -number;
            break;
        case 'N':
            formatInfo = nf;
            formatInfo.pattern = formatInfo.pattern || ['-n'];
            // fall through
        case 'C':
            formatInfo = formatInfo || nf.currency;
            formatInfo.pattern = formatInfo.pattern || ['-$n', '$n'];
            // fall through
        case 'P':
            formatInfo = formatInfo || nf.percent;
            formatInfo.pattern = formatInfo.pattern || ['-n %', 'n %'];
            pattern = value < 0 ? (formatInfo.pattern[0] || "-n") : (formatInfo.pattern[1] || "n");
            if (precision === -1) precision = formatInfo.decimals;
            number = getFullNumber(number * (current === "P" ? 100 : 1), precision, formatInfo);
            break;
        default:
			return customFormat(value, format, culture);
    }

    return matchNumberToPattern(number, pattern, nf);
}



function matchNumberToPattern(number, pattern, nf){
    var patternParts = /n|\$|-|%/g,
        ret = "";
    for (;;) {
        var index = patternParts.lastIndex,
            ar = patternParts.exec(pattern);

        ret += pattern.slice(index, ar ? ar.index : pattern.length);

        if (!ar) {
            break;
        }

        switch (ar[0]) {
            case "n":
                ret += number;
                break;
            case "$":
                ret += nf.currency.symbol || "$";
                break;
            case "-":
                // don't make 0 negative
                if (/[1-9]/.test(number)) {
                    ret += nf["-"] || "-";
                }
                break;
            case "%":
                ret += nf.percent.symbol || "%";
                break;
        }
    }

    return ret;
}

function parseValue(value, culture, radix ) {
		// make radix optional
    if (typeof radix === "string") {
        culture = radix;
        radix = 10;
    }
    culture = ej.globalize.findCulture(culture);
    var ret = NaN, nf = culture.numberFormat, npattern = culture.numberFormat.pattern[0];
    value = value.replace(/ /g, '');
    if (value.indexOf(culture.numberFormat.currency.symbol) > -1) {
        // remove currency symbol
        value = value.replace(culture.numberFormat.currency.symbol || "$", "");
        // replace decimal seperator
        value = value.replace(culture.numberFormat.currency["."] || ".", culture.numberFormat["."] || ".");
        // pattern of the currency
        npattern = trim(culture.numberFormat.currency.pattern[0].replace("$", ""));
    } else if (value.indexOf(culture.numberFormat.percent.symbol) > -1) {
        // remove percentage symbol
        value = value.replace(culture.numberFormat.percent.symbol || "%", "");
        // replace decimal seperator
        value = value.replace(culture.numberFormat.percent["."] || ".", culture.numberFormat["."] || ".");
        // pattern of the percent
        npattern = trim(culture.numberFormat.percent.pattern[0].replace("%", ""));
    }

    // trim leading and trailing whitespace
    value = trim( value );

    // allow infinity or hexidecimal
    if (regexInfinity.test(value)) {
        ret = parseFloat(value, "" ,radix);
    }
    else if (regexHex.test(value)) {
        ret = parseInt(value, 16);
    }
    else {
        var signInfo = parseNumberWithNegativePattern( value, nf, npattern ),
            sign = signInfo[0],
            num = signInfo[1];
        // determine sign and number
        if ( sign === "" && nf.pattern[0] !== "-n" ) {
            signInfo = parseNumberWithNegativePattern( value, nf, "-n" );
            sign = signInfo[0];
            num = signInfo[1];
        }
        sign = sign || "+";
        // determine exponent and number
        var exponent,
            intAndFraction,exponentPos = -1;
		if(regexExpo.test(num))
		{
           exponentPos = num.indexOf( 'e' );
        if ( exponentPos < 0 ) exponentPos = num.indexOf( 'E' );
		}
        if ( exponentPos < 0 ) {
            intAndFraction = num;
            exponent = null;
        }
        else {
            intAndFraction = num.substr( 0, exponentPos );
            exponent = num.substr( exponentPos + 1 );
        }
        // determine decimal position
        var integer,
            fraction,
            decSep = nf['.'] || '.',
            decimalPos = intAndFraction.indexOf( decSep );
        if ( decimalPos < 0 ) {
            integer = intAndFraction;
            fraction = null;
        }
        else {
            integer = intAndFraction.substr( 0, decimalPos );
            fraction = intAndFraction.substr( decimalPos + decSep.length );
        }
        // handle groups (e.g. 1,000,000)
        var groupSep = nf[","] || ",";
        integer = integer.split(groupSep).join('');
        var altGroupSep = groupSep.replace(/\u00A0/g, " ");
        if ( groupSep !== altGroupSep ) {
            integer = integer.split(altGroupSep).join('');
        }
        // build a natively parsable number string
        var p = sign + integer;
        if ( fraction !== null ) {
            p += '.' + fraction;
        }
        if ( exponent !== null ) {
            // exponent itself may have a number patternd
            var expSignInfo = parseNumberWithNegativePattern( exponent, nf, npattern );
            p += 'e' + (expSignInfo[0] || "+") + expSignInfo[1];
        }
        if ( !radix && regexParseFloat.test( p ) ) {
            ret = parseFloat( p );
        }
		else if(radix)
			ret = parseInt(p, radix);
    }
    return ret;
}

// *************************************** Dates ***************************************

var dateFormat = {
    DAY_OF_WEEK_THREE_LETTER : "ddd",
    DAY_OF_WEEK_FULL_NAME : "dddd",
    DAY_OF_MONTH_SINGLE_DIGIT : "d",
    DAY_OF_MONTH_DOUBLE_DIGIT : "dd",
    MONTH_THREE_LETTER : "MMM",
    MONTH_FULL_NAME : "MMMM",
    MONTH_SINGLE_DIGIT : "M",
    MONTH_DOUBLE_DIGIT : "MM",
    YEAR_SINGLE_DIGIT : "y",
    YEAR_DOUBLE_DIGIT : "yy",
    YEAR_FULL : "yyyy",
    HOURS_SINGLE_DIGIT_12_HOUR_CLOCK : "h",
    HOURS_DOUBLE_DIGIT_12_HOUR_CLOCK : "hh",
    HOURS_SINGLE_DIGIT_24_HOUR_CLOCK : "H",
    HOURS_DOUBLE_DIGIT_24_HOUR_CLOCK : "HH",
    MINUTES_SINGLE_DIGIT : "m",
    MINUTES_DOUBLE_DIGIT : "mm",
    SECONDS_SINGLE_DIGIT : "s",
    SECONDS_DOUBLE_DIGIT : "ss",
    MERIDIAN_INDICATOR_SINGLE : "t",
    MERIDIAN_INDICATOR_FULL : "tt",
    DECISECONDS : "f",
    CENTISECONDS: "ff",
    MILLISECONDS : "fff",
    TIME_ZONE_OFFSET_SINGLE_DIGIT : "z",
    TIME_ZONE_OFFSET_DOUBLE_DIGIT : "zz",
    TIME_ZONE_OFFSET_FULL : "zzz",
    DATE_SEPARATOR : "/"
};

function valueOutOfRange(value, low, high) {
    return value < low || value > high;
}

function expandYear(cal, year) {
    // expands 2-digit year into 4 digits.
    var now = new Date();
    if ( year < 100 ) {
        var twoDigitYearMax = cal.twoDigitYearMax;
        twoDigitYearMax = typeof twoDigitYearMax === 'string' ? new Date().getFullYear() % 100 + parseInt( twoDigitYearMax, 10 ) : twoDigitYearMax;
        var curr = now.getFullYear();
        year += curr - ( curr % 100 );
        if ( year > twoDigitYearMax ) {
            year -= 100;
        }
    }
    return year;
}

function arrayIndexOf( array, item ) {
    if ( array.indexOf ) {
        return array.indexOf( item );
    }
    for ( var i = 0, length = array.length; i < length; i++ ) {
        if ( array[ i ] === item ) return i;
    }
    return -1;
}

function toUpper(value) {
    // 'he-IL' has non-breaking space in weekday names.
    return value.split( "\u00A0" ).join(' ').toUpperCase();
}

function toUpperArray(arr) {
    var results = [];
    for ( var i = 0, l = arr.length; i < l; i++ ) {
        results[i] = toUpper(arr[i]);
    }
    return results;
}

function getIndexOfDay(cal, value, abbr) {
    var ret,
        days = cal.days,
        upperDays = cal._upperDays;
    if ( !upperDays ) {
        cal._upperDays = upperDays = [
            toUpperArray( days.names ),
            toUpperArray( days.namesAbbr ),
            toUpperArray( days.namesShort )
        ];
    }
    value = toUpper( value );
    if ( abbr ) {
        ret = arrayIndexOf( upperDays[ 1 ], value );
        if ( ret === -1 ) {
            ret = arrayIndexOf( upperDays[ 2 ], value );
        }
    }
    else {
        ret = arrayIndexOf( upperDays[ 0 ], value );
    }
    return ret;
}

function getIndexOfMonth(cal, value, abbr) {
    var months = cal.months,
        monthsGen = cal.monthsGenitive || cal.months,
        upperMonths = cal._upperMonths,
        upperMonthsGen = cal._upperMonthsGen;
    if ( !upperMonths ) {
        cal._upperMonths = upperMonths = [
            toUpperArray( months.names ),
            toUpperArray( months.namesAbbr )
        ];
        cal._upperMonthsGen = upperMonthsGen = [
            toUpperArray( monthsGen.names ),
            toUpperArray( monthsGen.namesAbbr )
        ];
    }
    value = toUpper( value );
    var i = arrayIndexOf( abbr ? upperMonths[ 1 ] : upperMonths[ 0 ], value );
    if ( i < 0 ) {
        i = arrayIndexOf( abbr ? upperMonthsGen[ 1 ] : upperMonthsGen[ 0 ], value );
    }
    return i;
}

function appendMatchStringCount(preMatch, strings) {
    var quoteCount = 0,
        escaped = false;
    for ( var i = 0, il = preMatch.length; i < il; i++ ) {
        var c = preMatch.charAt( i );
        if(c == '\''){
            escaped ? strings.push( "'" ) : quoteCount++;
            escaped = false;
        } else if( c == '\\'){
            if (escaped) strings.push( "\\" );
            escaped = !escaped;
        } else {
            strings.push( c );
            escaped = false;
        }
    }
    return quoteCount;
}


function parseDayByInt(value, format, culture, cal) {
    if (!value) {
        return null;
    }
    var index = 0, valueX = 0, day = null;
    format = format.split("");
    var length = format.length;
    var countDays = function (match) {
        var i = 0;
        while (format[index] === match) {
            i++;
            index++;
        }
        if (i > 0) {
            index -= 1;
        }
        return i;
    },
    getNumber = function (size) {
        var rg = new RegExp('^\\d{1,' + size + '}'),
            match = value.substr(valueX, size).match(rg);

        if (match) {
            match = match[0];
            valueX += match.length;
            return parseInt(match, 10);
        }
        return null;
    },
    getName = function (names, lower) {
        var i = 0,
            length = names.length,
            name, nameLength,
            subValue;

        for (; i < length; i++) {
            name = names[i];
            nameLength = name.length;
            subValue = value.substr(valueX, nameLength);

            if (lower) {
                subValue = subValue.toLowerCase();
            }

            if (subValue == name) {
                valueX += nameLength;
                return i + 1;
            }
        }
        return null;
    },
     lowerArray = function (data) {
         var index = 0,
             length = data.length,
             array = [];

         for (; index < length; index++) {
             array[index] = (data[index] + "").toLowerCase();
         }

         return array;
     },
     lowerInfo = function (localInfo) {
         var newLocalInfo = {}, property;

         for (property in localInfo) {
             newLocalInfo[property] = lowerArray(localInfo[property]);
         }

         return newLocalInfo;
     };
    for (; index < length; index++) {
        var ch = format[index];
        if (ch === "d") {
            var count = countDays("d");
            if (!cal._lowerDays) {
                cal._lowerDays = lowerInfo(cal.days);
            }
            day = count < 3 ? getNumber(2) : getName(cal._lowerDays[count == 3 ? "namesAbbr" : "names"], true)
        }
    }
    return day;
}


function getFullDateFormat(cal, format) {
    // expands unspecified or single character date formats into the full pattern.
    format = format || "F";
    var pattern,
        patterns = cal.patterns,
        len = format.length;
    if ( len === 1 ) {
        pattern = patterns[ format ];
        if ( !pattern ) {
            throw "Invalid date format string '" + format + "'.";
        }
        format = pattern;
    }
    else if ( len === 2  && format.charAt(0) === "%" ) {
        // %X escape format -- intended as a custom format string that is only one character, not a built-in format.
        format = format.charAt( 1 );
    }
    return format;
}

ej.globalize._getDateParseRegExp = function (cal, format) {
    // converts a format string into a regular expression with groups that
    // can be used to extract date fields from a date string.
    // check for a cached parse regex.
    var re = cal._parseRegExp;
    if ( !re ) {
        cal._parseRegExp = re = {};
    }
    else {
        var reFormat = re[ format ];
        if ( reFormat ) {
            return reFormat;
        }
    }

    // expand single digit formats, then escape regular expression characters.
    var expFormat = getFullDateFormat( cal, format ).replace( /([\^\$\.\*\+\?\|\[\]\(\)\{\}])/g, "\\\\$1" ),
        regexp = ["^"],
        groups = [],
        index = 0,
        quoteCount = 0,
        tokenRegExp = /\/|dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|zzz|zz|z|gg|g/g,
        match;

    // iterate through each date token found.
    while ( (match = tokenRegExp.exec( expFormat )) !== null ) {
        var preMatch = expFormat.slice( index, match.index );
        index = tokenRegExp.lastIndex;

        // don't replace any matches that occur inside a string literal.
        quoteCount += appendMatchStringCount( preMatch, regexp );
        if ( quoteCount % 2 ) {
            regexp.push( match[ 0 ] );
            continue;
        }

        // add a regex group for the token.
        var m = match[ 0 ],
            len = m.length,
            add;
            
        switch ( m ) {
            case dateFormat.DAY_OF_WEEK_THREE_LETTER: case dateFormat.DAY_OF_WEEK_FULL_NAME:
            case dateFormat.MONTH_FULL_NAME: case dateFormat.MONTH_THREE_LETTER:
                add = "(\\D+)";
                break;
            case dateFormat.MERIDIAN_INDICATOR_FULL: case dateFormat.MERIDIAN_INDICATOR_SINGLE:
                add = "(\\D*)";
                break;
            case dateFormat.YEAR_FULL:
            case dateFormat.MILLISECONDS:
            case dateFormat.CENTISECONDS:
            case dateFormat.DECISECONDS:
                add = "(\\d{" + len + "})";
                break;
            case dateFormat.DAY_OF_MONTH_DOUBLE_DIGIT: case dateFormat.DAY_OF_MONTH_SINGLE_DIGIT:
            case dateFormat.MONTH_DOUBLE_DIGIT: case dateFormat.MONTH_SINGLE_DIGIT:
            case dateFormat.YEAR_DOUBLE_DIGIT: case dateFormat.YEAR_SINGLE_DIGIT:
            case dateFormat.HOURS_DOUBLE_DIGIT_24_HOUR_CLOCK: case dateFormat.HOURS_SINGLE_DIGIT_24_HOUR_CLOCK:
            case dateFormat.HOURS_DOUBLE_DIGIT_12_HOUR_CLOCK: case dateFormat.HOURS_SINGLE_DIGIT_12_HOUR_CLOCK:
            case dateFormat.MINUTES_DOUBLE_DIGIT: case dateFormat.MINUTES_SINGLE_DIGIT:
            case dateFormat.SECONDS_DOUBLE_DIGIT: case dateFormat.SECONDS_SINGLE_DIGIT:
                add = "(\\d\\d?)";
                break;
            case dateFormat.TIME_ZONE_OFFSET_FULL:
                add = "([+-]?\\d\\d?:\\d{2})";
                break;
            case dateFormat.TIME_ZONE_OFFSET_DOUBLE_DIGIT: case dateFormat.TIME_ZONE_OFFSET_SINGLE_DIGIT:
                add = "([+-]?\\d\\d?)";
                break;
            case dateFormat.DATE_SEPARATOR:
                add = "(\\" + cal["/"] + ")";
                break;
            default:
                throw "Invalid date format pattern '" + m + "'.";
                break;
        }
        if ( add ) {
            regexp.push( add );
        }
        groups.push( match[ 0 ] );
    }
    appendMatchStringCount( expFormat.slice( index ), regexp );
    regexp.push( "$" );

    // allow whitespace to differ when matching formats.
    var regexpStr = regexp.join( '' ).replace( /\s+/g, "\\s+" ),
        parseRegExp = {'regExp': regexpStr, 'groups': groups};

    // cache the regex for this format.
    return re[ format ] = parseRegExp;
}

function getParsedDate(value, format, culture) {
    // try to parse the date string by matching against the format string
    // while using the specified culture for date field names.
    value = trim( value );
    format = trim(format);
    var cal = culture.calendar,
        // convert date formats into regular expressions with groupings.
        parseInfo = ej.globalize._getDateParseRegExp(cal, format),
        match = new RegExp(parseInfo.regExp).exec(value);
        if (match === null) 
	   {   
          formats = [];
          var idx = 0;
		  isArray = $.isArray;
		  numRegExp = /^(\+|-?)\d+(\.?)\d*$/,
		  formats.push(format);
		  formats = isArray(formats) ? formats: [formats];
          length = formats.length;
          
		  for (; idx < length; idx++) {
            date = parseExact(value, formats[idx], culture);
            if (date) {
                return date;
            }
        }
		 
		 return date || null;
	}
	
    // found a date format that matches the input.
    var groups = parseInfo.groups,
        year = null, month = null, date = null, weekDay = null,
        hour = 0, hourOffset, min = 0, sec = 0, msec = 0, tzMinOffset = null,
        pmHour = false;
    // iterate the format groups to extract and set the date fields.
    for ( var j = 0, jl = groups.length; j < jl; j++ ) {
        var matchGroup = match[ j + 1 ];
        if ( matchGroup ) {
            var current = groups[ j ],
                clength = current.length,
                matchInt = parseInt( matchGroup, 10 );
            
            switch ( current ) {
                case dateFormat.DAY_OF_MONTH_DOUBLE_DIGIT: case dateFormat.DAY_OF_MONTH_SINGLE_DIGIT:
                    date = matchInt;
                    if ( valueOutOfRange( date, 1, 31 ) ) return null;
                    break;
                case dateFormat.MONTH_THREE_LETTER:
                case dateFormat.MONTH_FULL_NAME:
                    month = getIndexOfMonth( cal, matchGroup, clength === 3 );
                    if ( valueOutOfRange( month, 0, 11 ) ) return null;
                    break;
                case dateFormat.MONTH_SINGLE_DIGIT: case dateFormat.MONTH_DOUBLE_DIGIT:
                    month = matchInt - 1;
                    if ( valueOutOfRange( month, 0, 11 ) ) return null;
                    break;
                case dateFormat.YEAR_SINGLE_DIGIT: case dateFormat.YEAR_DOUBLE_DIGIT:
                case dateFormat.YEAR_FULL:
                    year = clength < 4 ? expandYear( cal, matchInt ) : matchInt;
                    if ( valueOutOfRange( year, 0, 9999 ) ) return null;
                    break;
                case dateFormat.HOURS_SINGLE_DIGIT_12_HOUR_CLOCK: case dateFormat.HOURS_DOUBLE_DIGIT_12_HOUR_CLOCK:
                    hour = matchInt;
                    if ( hour === 12 ) hour = 0;
                    if ( valueOutOfRange( hour, 0, 11 ) ) return null;
                    break;
                case dateFormat.HOURS_SINGLE_DIGIT_24_HOUR_CLOCK: case dateFormat.HOURS_DOUBLE_DIGIT_24_HOUR_CLOCK:
                    hour = matchInt;
                    if ( valueOutOfRange( hour, 0, 23 ) ) return null;
                    break;
                case dateFormat.MINUTES_SINGLE_DIGIT: case dateFormat.MINUTES_DOUBLE_DIGIT:
                    min = matchInt;
                    if ( valueOutOfRange( min, 0, 59 ) ) return null;
                    break;
                case dateFormat.SECONDS_SINGLE_DIGIT: case dateFormat.SECONDS_DOUBLE_DIGIT:
                    sec = matchInt;
                    if ( valueOutOfRange( sec, 0, 59 ) ) return null;
                    break;
                case dateFormat.MERIDIAN_INDICATOR_FULL: case dateFormat.MERIDIAN_INDICATOR_SINGLE:
                    pmHour = cal.PM && ( matchGroup === cal.PM[0] || matchGroup === cal.PM[1] || matchGroup === cal.PM[2] );
                    if ( !pmHour && ( !cal.AM || (matchGroup !== cal.AM[0] && matchGroup !== cal.AM[1] && matchGroup !== cal.AM[2]) ) ) return null;
                    break;
                case dateFormat.DECISECONDS:
                case dateFormat.CENTISECONDS:
                case dateFormat.MILLISECONDS:
                    msec = matchInt * Math.pow( 10, 3-clength );
                    if ( valueOutOfRange( msec, 0, 999 ) ) return null;
                    break;
                case dateFormat.DAY_OF_WEEK_THREE_LETTER:
                    date = parseDayByInt(value, format, culture, cal);
                    break;
                case dateFormat.DAY_OF_WEEK_FULL_NAME:
                     getIndexOfDay( cal, matchGroup, clength === 3 );
                    if ( valueOutOfRange( weekDay, 0, 6 ) ) return null;
                    break;
                case dateFormat.TIME_ZONE_OFFSET_FULL:
                    var offsets = matchGroup.split( /:/ );
                    if ( offsets.length !== 2 ) return null;

                    hourOffset = parseInt( offsets[ 0 ], 10 );
                    if ( valueOutOfRange( hourOffset, -12, 13 ) ) return null;
                    
                    var minOffset = parseInt( offsets[ 1 ], 10 );
                    if ( valueOutOfRange( minOffset, 0, 59 ) ) return null;
                    
                    tzMinOffset = (hourOffset * 60) + (patternStartsWith( matchGroup, '-' ) ? -minOffset : minOffset);
                    break;
                case dateFormat.TIME_ZONE_OFFSET_SINGLE_DIGIT: case dateFormat.TIME_ZONE_OFFSET_DOUBLE_DIGIT:
                    // Time zone offset in +/- hours.
                    hourOffset = matchInt;
                    if ( valueOutOfRange( hourOffset, -12, 13 ) ) return null;
                    tzMinOffset = hourOffset * 60;
                    break;
            }
        }
    }
    var result = new Date(), defaultYear, convert = cal.convert;
    defaultYear = convert ? convert.fromGregorian( result )[ 0 ] : result.getFullYear();
    if ( year === null ) {
        year = defaultYear;
    }
    
    // set default day and month to 1 and January, so if unspecified, these are the defaults
    // instead of the current day/month.
    if ( month === null ) {
        month = 0;
    }
    if ( date === null ) {
        date = 1;
    }
    // now have year, month, and date, but in the culture's calendar.
    if ( convert ) {
        result = convert.toGregorian( year, month, date );
        if ( result === null ) return null;
    }
    else {
        // have to set year, month and date together to avoid overflow based on current date.
        result.setFullYear( year, month, date );
        // check to see if date overflowed for specified month (only checked 1-31 above).
        if ( result.getDate() !== date ) return null;
        // invalid day of week.
        if ( weekDay !== null && result.getDay() !== weekDay ) {
            return null;
        }
    }
    // if pm designator token was found make sure the hours fit the 24-hour clock.
    if ( pmHour && hour < 12 ) {
        hour += 12;
    }
    result.setHours( hour, min, sec, msec );
    if ( tzMinOffset !== null ) {
        var adjustedMin = result.getMinutes() - ( tzMinOffset + result.getTimezoneOffset() );
        result.setHours( result.getHours() + parseInt( adjustedMin / 60, 10 ), adjustedMin % 60 );
    }
    return result;
}
 function lowerArray(data) {
        var idx = 0,
            length = data.length,
            array = [];

        for (; idx < length; idx++) {
            array[idx] = (data[idx] + "").toLowerCase();
        }

        return array;
    }

    function LocalInfo(localInfo) {
        var newLocalInfo = {}, property;

        for (property in localInfo) {
            newLocalInfo[property] = lowerArray(localInfo[property]);
        }

        return newLocalInfo;
    }
 function parseExact(value, format, culture) {
        if (!value) {
            return null;
        }

        var charCount = function (match) {
                var i = 0;
                while (format[idx] === match) {
                    i++;
                    idx++;
                }
                if (i > 0) {
                    idx -= 1;
                }
                return i;
            },
            getNumber = function(size) {
                var rg = numRegExp[size] || new RegExp('^\\d{1,' + size + '}'),
                    match = value.substr(valueIdx, size).match(rg);

                if (match) {
                    match = match[0];
                    valueIdx += match.length;
                    return parseInt(match, 10);
                }
                return null;
            },
            getIndexByName = function (names, lower) {
                var i = 0,
                    length = names.length,
                    name, nameLength,
                    subValue;

                for (; i < length; i++) {
                    name = names[i];
                    nameLength = name.length;
                    subValue = value.substr(valueIdx, nameLength);

                    if (lower) {
                        subValue = subValue.toLowerCase();
                    }

                    if (subValue == name) {
                        valueIdx += nameLength;
                        return i + 1;
                    }
                }
                return null;
            },
            checkLiteral = function() {
                var result = false;
                if (value.charAt(valueIdx) === format[idx]) {
                    valueIdx++;
                    result = true;
                }
                return result;
            },
            calendar = culture.calendars.standard,
            year = null,
            month = null,
            day = null,
            hours = null,
            minutes = null,
            seconds = null,
            milliseconds = null,
            idx = 0,
            valueIdx = 0,
            literal = false,
            date = new Date(),
            twoDigitYearMax = calendar.twoDigitYearMax || 2029,
            defaultYear = date.getFullYear(),
            ch, count, length, pattern,
            pmHour, UTC, ISO8601, matches,
            amDesignators, pmDesignators,
            hoursOffset, minutesOffset,
            hasTime;

        if (!format) {
            format = "d"; //shord date format
        }

        //if format is part of the patterns get real format
        pattern = calendar.patterns[format];
        if (pattern) {
            format = pattern;
        }

        format = format.split("");
        length = format.length;

        for (; idx < length; idx++) {
            ch = format[idx];

            if (literal) {
                if (ch === "'") {
                    literal = false;
                } else {
                    checkLiteral();
                }
            } else {
                if (ch === "d") {
                    count = charCount("d");
                    if (!calendar._lowerDays) {
                        calendar._lowerDays = LocalInfo(calendar.days);
                    }

                    day = count < 3 ? getNumber(2) : getIndexByName(calendar._lowerDays[count == 3 ? "namesAbbr" : "names"], true);

                    if (day === null || outOfRange(day, 1, 31)) {
                        return null;
                    }
                } else if (ch === "M") {
                    count = charCount("M");
                    if (!calendar._lowerMonths) {
                        calendar._lowerMonths = LocalInfo(calendar.months);
                    }
                    month = count < 3 ? getNumber(2) : getIndexByName(calendar._lowerMonths[count == 3 ? 'namesAbbr' : 'names'], true);

                    if (month === null || outOfRange(month, 1, 12)) {
                        return null;
                    }
                    month -= 1; //because month is zero based
                } else if (ch === "y") {
                    count = charCount("y");
                    year = getNumber(count);

                    if (year === null) {
                        return null;
                    }

                    if (count == 2) {
                        if (typeof twoDigitYearMax === "string") {
                            twoDigitYearMax = defaultYear + parseInt(twoDigitYearMax, 10);
                        }

                        year = (defaultYear - defaultYear % 100) + year;
                        if (year > twoDigitYearMax) {
                            year -= 100;
                        }
                    }
                } else if (ch === "h" ) {
                    charCount("h");
                    hours = getNumber(2);
                    if (hours == 12) {
                        hours = 0;
                    }
                    if (hours === null || outOfRange(hours, 0, 11)) {
                        return null;
                    }
                } else if (ch === "H") {
                    charCount("H");
                    hours = getNumber(2);
                    if (hours === null || outOfRange(hours, 0, 23)) {
                        return null;
                    }
                } else if (ch === "m") {
                    charCount("m");
                    minutes = getNumber(2);
                    if (minutes === null || outOfRange(minutes, 0, 59)) {
                        return null;
                    }
                } else if (ch === "s") {
                    charCount("s");
                    seconds = getNumber(2);
                    if (seconds === null || outOfRange(seconds, 0, 59)) {
                        return null;
                    }
                } else if (ch === "f") {
                    count = charCount("f");
                    milliseconds = getNumber(count);

                    if (milliseconds !== null && count > 3) {
                        milliseconds = parseInt(milliseconds.toString().substring(0, 3), 10);
                    }

                    if (milliseconds === null || outOfRange(milliseconds, 0, 999)) {
                        return null;
                    }

                } else if (ch === "t") {
                    count = charCount("t");
                    amDesignators = calendar.AM;
                    pmDesignators = calendar.PM;

                    if (count === 1) {
                        amDesignators = mapDesignators(amDesignators);
                        pmDesignators = mapDesignators(pmDesignators);
                    }

                    pmHour = getIndexByName(pmDesignators);
                    if (!pmHour && !getIndexByName(amDesignators)) {
                        return null;
                    }
                }
                else if (ch === "z") {
                    UTC = true;
                    count = charCount("z");

                    if (value.substr(valueIdx, 1) === "Z") {
                        if (!ISO8601) {
                            return null;
                        }

                        checkLiteral();
                        continue;
                    }

                    matches = value.substr(valueIdx, 6)
                                   .match(count > 2 ? longTimeZoneRegExp : shortTimeZoneRegExp);

                    if (!matches) {
                        return null;
                    }

                    matches = matches[0];
                    valueIdx = matches.length;
                    matches = matches.split(":");

                    hoursOffset = parseInt(matches[0], 10);
                    if (outOfRange(hoursOffset, -12, 13)) {
                        return null;
                    }

                    if (count > 2) {
                        minutesOffset = parseInt(matches[1], 10);
                        if (isNaN(minutesOffset) || outOfRange(minutesOffset, 0, 59)) {
                            return null;
                        }
                    }
                } else if (ch === "T") {
                    ISO8601 = checkLiteral();
                } else if (ch === "'") {
                    literal = true;
                    checkLiteral();
                } else if (!checkLiteral()) {
                    return null;
                }
            }
        }

        hasTime = hours !== null || minutes !== null || seconds || null;

        if (year === null && month === null && day === null && hasTime) {
            year = defaultYear;
            month = date.getMonth();
            day = date.getDate();
        } else {
            if (year === null) {
                year = defaultYear;
            }

            if (day === null) {
                day = 1;
            }
        }

        if (pmHour && hours < 12) {
            hours += 12;
        }

        if (UTC) {
            if (hoursOffset) {
                hours += -hoursOffset;
            }

            if (minutesOffset) {
                minutes += -minutesOffset;
            }

            value = new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));
        } else {
            value = new Date(year, month, day, hours, minutes, seconds, milliseconds);
            adjustDST(value, hours);
        }

        if (year < 100) {
            value.setFullYear(year);
        }

        if (value.getDate() !== day && UTC === undefined) {
            return null;
        }

        return value;
    }
 function outOfRange(value, start, end) {
        return !(value >= start && value <= end);
    }
	
 function adjustDST(date, hours) {
        if (!hours && date.getHours() === 23) {
            date.setHours(date.getHours() + 2);
        }
    }
function formatDateToCulture(value, format, culture) {
    var cal = culture.calendar,
        convert = cal.convert;
    if ( !format || !format.length || format === 'i' ) {
        var ret;
        if ( culture && culture.name.length ) {
            if ( convert ) {
                // non-gregorian calendar, so we cannot use built-in toLocaleString()
                ret = formatDateToCulture( value, cal.patterns.F, culture );
            }
            else {
                ret = value.toLocaleString();
            }
        }
        else {
            ret = value.toString();
        }
        return ret;
    }

    var sortable = format === "s";
        format = getFullDateFormat(cal, format);


    // Start with an empty string
    ret = [];
    var hour,
        zeros = ['0','00','000'],
        foundDay,
        checkedDay,
        dayPartRegExp = /([^d]|^)(d|dd)([^d]|$)/g,
        quoteCount = 0,
        tokenRegExp = /\/|dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|zzz|zz|z|gg|g/g,
        converted;

    function padWithZeros(num, c) {
        var r, s = num+'';
        if ( c > 1 && s.length < c ) {
            r = ( zeros[ c - 2 ] + s);
            return r.substr( r.length - c, c );
        }
        else {
            r = s;
        }
        return r;
    }

    function hasDay() {
        if ( foundDay || checkedDay ) {
            return foundDay;
        }
        foundDay = dayPartRegExp.test( format );
        checkedDay = true;
        return foundDay;
    }

    if ( !sortable && convert ) {
        converted = convert.fromGregorian( value );
    }

    for (;;) {
        // Save the current index
        var index = tokenRegExp.lastIndex,
            // Look for the next pattern
            ar = tokenRegExp.exec( format );

        // Append the text before the pattern (or the end of the string if not found)
        var preMatch = format.slice( index, ar ? ar.index : format.length );
        quoteCount += appendMatchStringCount( preMatch, ret );

        if ( !ar ) {
            break;
        }

        // do not replace any matches that occur inside a string literal.
        if ( quoteCount % 2 ) {
            ret.push( ar[ 0 ] );
            continue;
        }

        var current = ar[ 0 ],
            clength = current.length;


        switch ( current ) {
            case dateFormat.DAY_OF_WEEK_THREE_LETTER:
            case dateFormat.DAY_OF_WEEK_FULL_NAME:
                var names = (clength === 3) ? cal.days.namesAbbr : cal.days.names;
                ret.push( names[ value.getDay() ] );
                break;
            case dateFormat.DAY_OF_MONTH_SINGLE_DIGIT:
            case dateFormat.DAY_OF_MONTH_DOUBLE_DIGIT:
                foundDay = true;
                ret.push( padWithZeros( (converted ? converted[2] : value.getDate()), clength ) );
                break;
            case dateFormat.MONTH_THREE_LETTER:
            case dateFormat.MONTH_FULL_NAME:
                var part = converted ? converted[1] : value.getMonth();
                ret.push( (cal.monthsGenitive && hasDay())
                    ? cal.monthsGenitive[ clength === 3 ? "namesAbbr" : "names" ][ part ]
                    : cal.months[ clength === 3 ? "namesAbbr" : "names" ][ part ] );
                break;
            case dateFormat.MONTH_SINGLE_DIGIT:
            case dateFormat.MONTH_DOUBLE_DIGIT:
                ret.push( padWithZeros((converted ? converted[1] : value.getMonth()) + 1, clength ) );
                break;
            case dateFormat.YEAR_SINGLE_DIGIT:
            case dateFormat.YEAR_DOUBLE_DIGIT:
            case dateFormat.YEAR_FULL:
                part = converted ? converted[ 0 ] : value.getFullYear();
                if ( clength < 4 ) {
                    part = part % 100;
                }
                ret.push( padWithZeros( part, clength ) );
                break;
            case dateFormat.HOURS_SINGLE_DIGIT_12_HOUR_CLOCK:
            case dateFormat.HOURS_DOUBLE_DIGIT_12_HOUR_CLOCK:
                hour = value.getHours() % 12;
                if ( hour === 0 ) hour = 12;
                ret.push( padWithZeros( hour, clength ) );
                break;
            case dateFormat.HOURS_SINGLE_DIGIT_24_HOUR_CLOCK:
            case dateFormat.HOURS_DOUBLE_DIGIT_24_HOUR_CLOCK:
                ret.push( padWithZeros( value.getHours(), clength ) );
                break;
            case dateFormat.MINUTES_SINGLE_DIGIT:
            case dateFormat.MINUTES_DOUBLE_DIGIT:
                ret.push( padWithZeros( value.getMinutes(), clength ) );
                break;
            case dateFormat.SECONDS_SINGLE_DIGIT:
            case dateFormat.SECONDS_DOUBLE_DIGIT:
                ret.push( padWithZeros(value .getSeconds(), clength ) );
                break;
            case dateFormat.MERIDIAN_INDICATOR_SINGLE:
            case dateFormat.MERIDIAN_INDICATOR_FULL:
                part = value.getHours() < 12 ? (cal.AM ? cal.AM[0] : " ") : (cal.PM ? cal.PM[0] : " ");
                ret.push( clength === 1 ? part.charAt( 0 ) : part );
                break;
            case dateFormat.DECISECONDS:
            case dateFormat.CENTISECONDS:
            case dateFormat.MILLISECONDS:
                ret.push( padWithZeros( value.getMilliseconds(), 3 ).substr( 0, clength ) );
                break;
            case dateFormat.TIME_ZONE_OFFSET_SINGLE_DIGIT:
            case dateFormat.TIME_ZONE_OFFSET_DOUBLE_DIGIT:
                hour = value.getTimezoneOffset() / 60;
                ret.push( (hour <= 0 ? '+' : '-') + padWithZeros( Math.floor( Math.abs( hour ) ), clength ) );
                break;
            case dateFormat.TIME_ZONE_OFFSET_FULL:
                hour = value.getTimezoneOffset() / 60;
                ret.push( (hour <= 0 ? '+' : '-') + padWithZeros( Math.floor( Math.abs( hour ) ), 2 ) +
                    ":" + padWithZeros( Math.abs( value.getTimezoneOffset() % 60 ), 2 ) );
                break;
            case dateFormat.DATE_SEPARATOR:
                ret.push( cal["/"] || "/" );
                break;
            default:
                throw "Invalid date format pattern '" + current + "'.";
                break;
        }
    }
    return ret.join( '' );
}

//add new culture into ej 
ej.globalize.addCulture = function (name, culture) {
    ej.cultures[name] = $.extend(true, $.extend(true, {}, ej.cultures['default'], culture), ej.cultures[name]);
	ej.cultures[name].calendar = ej.cultures[name].calendars.standard;
}

//return the specified culture or default if not found
ej.globalize.preferredCulture = function (culture) {
    culture = (typeof culture != "undefined" && typeof culture === typeof this.cultureObject) ? culture.name : culture;
    this.cultureObject = ej.globalize.findCulture(culture);
    return this.cultureObject;
}
ej.globalize.setCulture = function (culture) {
	if (ej.isNullOrUndefined(this.globalCultureObject)) this.globalCultureObject = ej.globalize.findCulture(culture);
	culture = (typeof culture != "undefined" && typeof culture === typeof this.globalCultureObject) ? culture.name : culture;
    if (culture) this.globalCultureObject = ej.globalize.findCulture(culture);
    ej.cultures.current = this.globalCultureObject;
    return this.globalCultureObject;
}
ej.globalize.culture=function(name){
    ej.cultures.current = ej.globalize.findCulture(name);
}

//return the specified culture or current else default if not found
ej.globalize.findCulture = function (culture) {
    var cultureObject;
    if (culture) {

        if ($.isPlainObject(culture) && culture.numberFormat) {
            cultureObject = culture;
        }
        if (typeof culture === "string") {
            var cultures = ej.cultures;
            if (cultures[culture]) {
                return cultures[culture];
            }
            else {
                if (culture.indexOf("-") > -1) {
                    var cultureShortName = culture.split("-")[0];
                    if (cultures[cultureShortName]) {
                        return cultures[cultureShortName];
                    }
                }
                else {
                    var cultureArray = $.map(cultures, function (el) { return el });
                    for (var i = 0; i < cultureArray.length; i++) {
                        var shortName = cultureArray[i].name.split("-")[0];
                        if (shortName === culture) {
                            return cultureArray[i];
                        }
                    };
                }
            }
            return ej.cultures["default"];
        }
    }
    else {
        cultureObject = ej.cultures.current || ej.cultures["default"];
    }

    return cultureObject;
}
//formatting date and number based on given format
ej.globalize.format = function (value, format, culture) {
    var cultureObject =  ej.globalize.findCulture(culture);
    if (typeof(value) === 'number') {
        value = formatNumberToCulture(value, format, cultureObject);
    } else if(value instanceof Date){
    	value = formatDateToCulture(value, format, cultureObject);
    }

    return value;
}

ej.globalize._round = function(number, precision){
	var factor = Math.pow(10, precision);
	return Math.round(number * factor) / factor;
},

//parsing integer takes string as input and return as number
ej.globalize.parseInt = function(value, radix, culture) {
	if(!radix)
		radix = 10;
    return Math.floor( parseValue( value, culture, radix ) );
}

//returns the ISO date string from date object
ej.globalize.getISODate = function(value) {
    if(value instanceof Date) return value.toISOString();
}

//parsing floationg poing number takes string as input and return as number
ej.globalize.parseFloat = function(value, radix, culture) {
	if (typeof radix === "string") {
        culture = radix;
        radix = 10;
    }
    return parseValue( value, culture);
}

//parsing date takes string as input and return as date object
ej.globalize.parseDate = function(value, formats, culture) {
    culture = ej.globalize.findCulture(culture);

    var date, prop, patterns;
    if ( formats ) {
        if ( typeof formats === "string" ) {
            formats = [ formats ];
        }
        if ( formats.length ) {
            for ( var i = 0, l = formats.length; i < l; i++ ) {
                var format = formats[ i ];
                if ( format ) {
                    date = getParsedDate( value, format, culture );
                    if ( date ) break;
                }
            }
        }
    }
    else {
        patterns = culture.calendar.patterns;
        for ( prop in patterns ) {
            date = getParsedDate( value, patterns[prop], culture );
            if ( date ) break;
        }
    }
    return date || null;
}

function getControlObject(obj, stringArray){
    return stringArray.length ? getControlObject(obj[stringArray[0]], stringArray.slice(1)) : obj;
}

//return localized constants as object for the given widget control and culture
ej.globalize.getLocalizedConstants = function(controlName, culture){
    var returnObject,
        controlNameArray = controlName.replace("ej.", "").split(".");
    
    returnObject = getControlObject(ej, controlNameArray);

    return ( $.extend(true, {}, returnObject.Locale['default'], returnObject.Locale[culture ? culture : this.cultureObject.name]) ) ;
}

$.extend(ej, ej.globalize);

}(jQuery));;

/**
* @fileOverview Plugin to style the Html ScrollBar elements
* @copyright Copyright Syncfusion Inc. 2001 - 2015. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
* @version 12.1 
* @author <a href="mailto:licensing@syncfusion.com">Syncfusion Inc</a>
*/
(function ($, ej, window, undefined) {
    'use strict';

    ej.widget("ejScrollBar", "ej.ScrollBar", {
        defaults: {

            orientation: "horizontal",

            viewportSize: 0,

            height: 18,

            width: 18,

            smallChange: 57,

            largeChange: 57,

            value: 0,

            maximum: 0,

            minimum: 0,

            buttonSize: 18,

            infiniteScrolling: false
        },
        validTags: ["div"],
        type: "transclude",
        dataTypes: {
            buttonSize: "number",
            smallChange: "number",
            largeChange: "number",
        },
        observables: ["value"],
        value: ej.util.valueFunction("value"),
        _enabled: true,
        content: function () {
            if (!this._content || !this._content.length) {
                if (this.model.orientation === "horizontal") {
                    this._content = this.element.find(".e-hhandle");
                }
                else {
                    this._content = this.element.find(".e-vhandle");
                }
            }
            return this._content;
        },
        _init: function () {
            this.element.addClass("e-widget");
            this._ensureScrollers();
            this.content();
            this._setInitialValues();

        },

        _setInitialValues: function () {
            var xy = "X";
            if (this.model.orientation === ej.ScrollBar.Orientation.Horizontal) {
                this.element.addClass("e-hscrollbar");
            }
            else {
                this.element.addClass("e-vscrollbar");
                xy = "Y";
            }
            if (this.value() !== 0 || this.model.minimum !== 0) {
                if (this.value() < this.model.minimum)
                    this.value(this.model.minimum);
                this["scroll"](this.value(), "none");
            }
        },

        _ensureScrollers: function () {
            var jqVersion = $.fn.jquery, height, width;
            if (this.model.height) {
                this.element.height(this.model.height);
            }
            if (this.model.width) {
                this.element.width(this.model.width);
            }
            var d2;
            if (!this._scrollData) {
                if (this.model.orientation === "vertical") {
                    this._scrollData = this._createScroller("Height", "Y", "Top", "e-v");
                }
                else {
                    this._scrollData = this._createScroller("Width", "X", "Left", "e-h");
                }
            }
        },

        _setModel: function (option) {
            for (var prop in option) {
                if (prop === "value") {
                    if (this.value()) {
                        this.scroll(this.value(), "none");
                    }
                } else {
                    this.refresh();
                    break;
                }
            }
        },

        _createScroller: function (dimension, xy, position, css) {
            var height;
            var d = {};
            var jqVersion = $.fn.jquery;
            d.dimension = dimension;
            d.xy = xy;
            d.position = position;
            d.css = css;
            d.uDimension = dimension;

            this._calculateLayout(d);
            this._createLayout(d);
            var buttons = this[d.main].find(".e-button");

            this._off(buttons, "mousedown")
                ._on(buttons, "mousedown", { d: d, step: 1 }, this._spaceMouseDown);
            this._off(this[d.scroll], "mousedown")
                ._on(this[d.scroll], "mousedown", { d: d }, this._spaceMouseDown);
            this._off(this[d.handler], "mousedown touchstart")
                ._on(this[d.handler], "mousedown touchstart", { d: d }, this._mouseDown);

            return d;
        },
        _createLayout: function (d) {
            var divString = "<div class='" + d.css + "{0}' style='" + d.dimension + ":{1}px'>{2}</div>";
            var jqVersion = $.fn.jquery;
            var lit = {}, height;
            lit[d.dimension] = d.modelDim;

            var el = ej.buildTag(
                "div." + d.css + "scroll e-box",
                String.format(divString, "up e-chevron-up_01 e-icon e-box e-button", d.buttonSize) +
                String.format(divString, "handlespace", d.handleSpace,
                    String.format(divString, "handle e-box e-pinch", d.handle)) +
                String.format(divString, "down e-chevron-down_01 e-icon e-box e-button", d.buttonSize),
                lit
            );

            this.element.append(el);
            this.element.find('.e-vhandle').addClass("e-v-line e-icon");
            this.element.find('.e-hhandle').addClass("e-h-line e-icon");
            jqVersion === "1.7.1" || jqVersion === "1.7.2" ? height = d.uDimension.toLowerCase() : height = "outer" + d.uDimension;
            this[d.handler] = this.element.find("." + d.handler);
            this[d.handler].css("transition", "none");
            this[d.scroll] = this[d.handler].parent();
            this[d.main] = this[d.scroll].parent();
            this[d.main].find(".e-button")["outer" + d.uDimension](d.buttonSize);
        },
        _calculateLayout: function (d) {
            d.scrollDim = "scroll" + d.dimension;
            d.lPosition = d.position.toLowerCase();
            d.clientXy = "page" + d.xy;
            d.scrollVal = "scroll" + d.position;
            d.scrollOneStepBy = this.model.smallChange;
            d.modelDim = this.model[(d.dimension = d.dimension.toLowerCase())];
            d.handler = d.css + "handle";
            d.buttonSize = this.model.buttonSize;
            d.main = d.css + "scroll";
            d.scroll = d.css + "ScrollSpace";
            d.handleSpace = d.modelDim - 2 * d.buttonSize;
            d.scrollable = (this.model.maximum - this.model.minimum);
            var trackLength = this.model.height;
            if (this.model.orientation === "horizontal")
                trackLength = this.model.width;
            d.handle = (this.model.viewportSize / ((this.model.maximum - this.model.minimum) + this.model.viewportSize)) * (trackLength - 2 * this.model.buttonSize);
            var check;
            !ej.isNullOrUndefined(this.model.elementHeight) && typeof this.model.elementHeight === "string" && this.model.elementHeight.indexOf("%") != -1 ? check = true : check = false;
            if (d.handle < 20 && !check) d.handle = 20;
            d.onePx = d.scrollable / (d.handleSpace - d.handle);
            d.fromScroller = false;
            d.up = true;
            d.vInterval = undefined;
        },
        _updateLayout: function (d) {
            this.element.height(this.model.height);
            this.element.width(this.model.width);
            var handle = this.element.find("." + d.css + "handle");
            var handleSpace = this.element.find("." + d.css + "handlespace");
            var size = d.dimension == "width" ? handle.css('left') : handle.css('top');
            var dimension = d.dimension == "width" ? handleSpace.outerWidth() : handleSpace.outerHeight();
            if (size !== undefined && size !== "auto") {
                if (!(dimension >= d.handle + parseFloat(size)))
                    if (this.model.enableRTL) handle.css(d.dimension === "width" ? 'left' : 'top', (parseFloat(dimension) - d.handle));
                    else handle.css(d.dimension === "width" ? 'left' : 'top', (parseFloat(dimension) - d.handle) > 0 ? (parseFloat(dimension) - d.handle) : 0);
            }
            this.element.find("." + d.css + "scroll").css(d.dimension, d.modelDim + "px")
                .find(".e-button").css(d.dimension, this.model.buttonSize).end()
                .find("." + d.css + "handlespace").css(d.dimension, d.handleSpace + "px")
                .find("." + d.css + "handle").css(d.dimension, d.handle + "px");
        },
        refresh: function () {
            this._ensureScrollers();
            if (this.value()) {
                this.scroll(this.value(), "none");
            }
            if (this._scrollData) {
                this._calculateLayout(this._scrollData);
                this._updateLayout(this._scrollData);
            }
        },

        scroll: function (pixel, source, triggerEvent, e) {
            var dS = this._scrollData;
            if (!triggerEvent) {
                if (this.model.orientation === ej.ScrollBar.Orientation.Horizontal) {
                    if (this._trigger("scroll", { source: source || "custom", scrollData: this._scrollData, scrollLeft: pixel, originalEvent: e }))
                        return;
                }
                else {
                    if (this._trigger("scroll", { source: source || "custom", scrollData: this._scrollData, scrollTop: pixel, originalEvent: e }))
                        return;
                }
            }
            if (this._scrollData) {
                if (this._scrollData.enableRTL && (e == "mousemove" || e == "touchmove") && ej.browserInfo().name != "msie")
                    this.value(-dS.scrollable + pixel);
                else {
                    if (this._scrollData.enableRTL && (e == "mousemove" || e == "touchmove") && ej.browserInfo().name == "msie") this.value(-1 * pixel);
                    else this.value(pixel);
                }
                if (this.content().length > 0) {
                    if (this.model.orientation === ej.ScrollBar.Orientation.Horizontal) {
                        var left = (this.element.find('.e-hhandlespace').width() - this.element.find('.e-hhandle').outerWidth());
                        pixel = left < ((pixel - this.model.minimum) / this._scrollData.onePx) ? left : ((pixel - this.model.minimum) / this._scrollData.onePx);
                        if (this._scrollData.enableRTL && (e == "mousemove" || e == "touchmove") && ej.browserInfo().name != "msie") {
                            pixel = left - pixel;
                            pixel > 0 ? pixel = pixel * -1 : pixel;
                        }
                        if (this._scrollData.enableRTL && (e == "mousemove" || e == "touchmove") && ej.browserInfo().name == "msie") pixel = -pixel;
                        this._scrollData.enableRTL && pixel > 0 && !this._scrollData._scrollleftflag ? pixel = 0 : pixel
                        if (this._scrollData._scrollleftflag) {

                            pixel > 0 ? pixel = pixel * -1 : pixel;
                            this.value(pixel);
                        }
                        this.content()[0].style.left = pixel + "px";
                        this._scrollData._scrollleftflag = false;
                    }
                    else {
                        var top = (this.element.find('.e-vhandlespace').height() - this.element.find('.e-vhandle').outerHeight());
                        pixel = top < ((pixel - this.model.minimum) / this._scrollData.onePx) ? top : ((pixel - this.model.minimum) / this._scrollData.onePx);
                        if (ej.browserInfo().name == "msie" && isNaN(pixel)) pixel = "";
                        this.content()[0].style.top = pixel + "px";
                            }
                        }
                    }
        },

        _changeTop: function (d, step, source) {
            var start, t;
            if (d.dimension === "height")
                start = this.value();
            else
                start = this.value();
            t = start + step;
            d.step = step;
            if ((d.enableRTL && step < 0) || (step > 0 && !d.enableRTL)) {
                if (d.enableRTL) {
                    if (t < this.model.maximum * -1)
                        t = this.model.maximum * -1;
                }
                else {
                    if (t > this.model.maximum)
                        t = this.model.maximum;
                }
            }
            else {
                if (d.enableRTL) {
                    if (t > this.model.minimum)
                        t = this.model.minimum;
                }
                else {
                    if (t < this.model.minimum)
                        t = this.model.minimum;
                }
            }
            if (t !== start || this.model.infiniteScrolling) {
                this["scroll"](t, source);
            }
            return t !== start;
        },

        _mouseUp: function (e) {
            if (!e.data) return;
            var d = e.data.d;
            clearInterval(d.vInterval);
            if (e.type == "touchend") $(e.target).removeClass("e-touch");
            if (e.type === "mouseup" || e.type === "touchend" || (!e.toElement && !e.relatedTarget && !e.target)) {
                this._prevY = this._d = this._data = null;
                this._off($(document), "mousemove touchmove", this._mouseMove);
                $(document).off("mouseup touchend", ej.proxy(this._mouseUp, this));
                d.fromScroller = false;
                this[d.scroll].off("mousemove");
                this[d.handler].off("mousemove").css("transition", "");
                if (e.data.source === "thumb" && !ej.isNullOrUndefined(this.model)) {
                    $.when(this.content()).done(ej.proxy(function () {
                        this._trigger("thumbEnd", { originalEvent: e, scrollData: d });
                    }, this));
                }
            }
            d.up = true;
        },


        _mouseDown: function (down) {
            if (!this._enabled) return;
            this._d = down;
            this._data = this._d.data.d,
                this._data.target = this._d.target;
            this._data.fromScroller = true;
            this[this._data.handler].css("transition", "none");
            this._on($(document), "mousemove touchmove", { d: this._data, source: "thumb" }, this._mouseMove);
            this._trigger("thumbStart", { originalEvent: this._d, scrollData: this._data });
            $(document).one("mouseup touchend", { d: this._data, source: "thumb" }, ej.proxy(this._mouseUp, this));
            if (down.type == "touchstart") $(down.target).addClass("e-touch");
        },
        _mouseCall: function (move) {
            move.type = "mouseup";
            this._mouseUp(move);
        },
        _mouseMove: function (move) {
            var value, step = 0, top = parseInt(this[this._data.handler].css(this._data.lPosition)) || 0;
            move.preventDefault();
            var skip = 1;
            if (ej.isNullOrUndefined(move.target.tagName)) {
                if ($(move.target).is(document)) {
                    this._mouseCall(move);
                    return;
                }
            }
            else if (move.target.tagName.toLowerCase() === "iframe") { this._mouseCall(move); return; }
            var pageXY = move.type == "mousemove" ? move[this._data.clientXy] : move.originalEvent.changedTouches[0][this._data.clientXy];
            if (this._prevY && pageXY !== this._prevY) {
                step = (pageXY - this._prevY);
                if (this.model.infiniteScrolling) {
                    top = top + step;
                    this._data.step = step;
                    if (this._data.enableRTL ? top > 0 : top < 0) top = 0;
                    if ((top * (this._data.enableRTL ? -1 : 1)) + this._data.handle >= this._data.handleSpace)
                        top = (this._data.handleSpace - this._data.handle) * (this._data.enableRTL ? -1 : 1);
                    value = Math.ceil(top * this._data.onePx);
                    this["scroll"](value, "thumb");
                }
                else {
                    value = step * this._data.onePx;
                    this._changeTop(this._data, value, "thumb", this._d);
                }
                this._trigger("thumbMove", { originalEvent: move, direction: (this._data.step > 0) ? +1 : -1, scrollData: this._data });
            }
            if (skip === 1)
                this._prevY = pageXY;
        },

        _spaceMouseDown: function (e) {
            if (!e.data || !this._enabled) return;
            var d = e.data.d;
            var offsetValue = this[d.handler][0].getBoundingClientRect();
            if (e.which !== 1 || e.target === this[d.handler][0]) return;
            var step = e.data.step ? this.model.smallChange : this.model.largeChange, hTop = e.data.top || offsetValue[d.lPosition];
            e[d.clientXy] = e[d.clientXy] || 0;
            if ((e[d.clientXy] - window.pageYOffset) < hTop) step *= -1;
            d.target = e.target;
            this._changeTop(d, step, step === 3 ? "track" : "button", e);
            if (e.data.step !== 1) {
                this[d.scroll].mousemove(function () {
                    d.up = true;
                });
            }
            d.up = false;
            d.vInterval = setInterval(ej.proxy(function () {
                if (step < 0 ? hTop + (step / d.onePx) < e[d.clientXy] : hTop + d.handle + (step / d.onePx) > e[d.clientXy])
                    d.up = true;
                if (d.up) {
                    clearInterval(d.vInterval);
                    return;
                }
                this._changeTop(d, step, step === 3 ? "track" : "button", e);
                e.data ? hTop = e.data.top || offsetValue[d.lPosition] : hTop = offsetValue[d.lPosition];
            }, this), 150);

            $(document).one("mouseup", { d: d }, ej.proxy(this._mouseUp, this));
            $(document).mouseout({ d: d }, ej.proxy(this._mouseUp, this));
        },

        _remove: function () {
            if (this.model.orientation === ej.ScrollBar.Orientation.Horizontal)
                this.element.find(".e-hscroll").remove();
            if (this.model.orientation === ej.ScrollBar.Orientation.Vertical)
                this.element.find(".e-vscroll").remove();
            this._scrollData = null;
            this._content = null;
        },

        _destroy: function () {
            this.element.remove();
        },
    });

    ej.ScrollBar.Orientation = {
        Horizontal: "horizontal",
        Vertical: "vertical"
    };
})(jQuery, Syncfusion, window);;

/**
* @fileOverview Plugin to style the Html Scroller elements
* @copyright Copyright Syncfusion Inc. 2001 - 2015. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
* @version 12.1 
* @author <a href="mailto:licensing@syncfusion.com">Syncfusion Inc</a>
*/


(function ($, ej, window, undefined) {
    'use strict';

    ej.widget("ejScroller", "ej.Scroller", {
        _addToPersist: ["scrollLeft", "scrollTop"],
        defaults: {

            height: 250,

            autoHide: false,

            animationSpeed: 600,

            width: 0,

            scrollOneStepBy: 57,

            buttonSize: 18,

            scrollLeft: 0,

            scrollTop: 0,

            targetPane: null,

            scrollerSize: 18,

            enablePersistence: false,

            enableRTL: undefined,

            enableTouchScroll: true,

            preventDefault: false,

            enabled: true,

            create: null,

            destroy: null,

            wheelStart: null,

            wheelMove: null,

            wheelStop: null
        },
        validTags: ["div"],
        type: "transclude",

        dataTypes: {
            buttonSize: "number",
            scrollOneStepBy: "number"
        },
        observables: ["scrollTop", "scrollLeft"],
        scrollTop: ej.util.valueFunction("scrollTop"),
        scrollLeft: ej.util.valueFunction("scrollLeft"),

        keyConfigs: {
            up: "38",
            down: "40",
            left: "37",
            right: "39",
            pageUp: "33",
            pageDown: "34",
            pageLeft: "ctrl+37",
            pageRight: "ctrl+39"
        },

        content: function () {
            if (!this._contentOffsetParent && this._content && this._content[0]) this._contentOffsetParent = this._content[0].offsetParent;
            if (!this._content || !this._content.length || !this._contentOffsetParent)
                this._content = this.element.children().first().addClass("e-content");

            return this._content;
        },
        _setFirst: true,
        _updateScroll: false,

        _init: function () {
            if (!ej.isNullOrUndefined(this.content()[0])) {
                this._isJquery3 = (parseInt($.fn.jquery) >= 3) ? true : false;
                this._tempWidth = this.model.width;
                this._prevScrollWidth = this.content()[0].scrollWidth, this._prevScrollHeight = this.content()[0].scrollHeight;
                this.element.addClass("e-widget");
                this.content();
                this._browser = ej.browserInfo().name;
                this._wheelStart = true;
                this._eleHeight = this.model.height;
                this._eleWidth = this.model.width;
                this._isNativeScroll = ej.isDevice();
                this.model.targetPane != null && this.content().find(this.model.targetPane).addClass('e-target-pane');
                if (this.model.enableRTL === undefined) {
                    this.model.enableRTL = this.element.css("direction") === "rtl";
                }
                this.model.autoHide && this._on((this.element), "mousedown", this._mouseDownInitContent);
                this._ensureScrollers();
                if (this.model.enableRTL) {
                    this.element.addClass("e-rtl");
                    this._rtlScrollLeftValue = this.content().scrollLeft();
                }
                this._isNativeScroll && this.element.addClass("e-native-scroll");
                this._on(this.content(), "scroll", this._scroll);
                this.model.targetPane != null && this._on(this.content().find(this.model.targetPane), "scroll", this._scroll);
                if (this.scrollLeft())
                    this._setScrollLeftValue(this.scrollLeft());
                if (this.scrollTop())
                    this.scrollTop(this._isJquery3 ? Math.ceil(this.scrollTop()) : this.scrollTop());
                this.content().scrollTop(this.scrollTop());

                if (this.model.autoHide) {
                    this._autohide();
                }
                if (this.model.enabled) {
                    this.enable();
                }
                else {
                    this.disable();
                }
                this._setDimension();
                if (this._prevScrollWidth !== this.content()[0].scrollWidth || this._prevScrollHeight !== this.content()[0].scrollHeight) this.refresh();
            }
            this._addActionClass();
            this._isNativeScroll && this._on(this.content(), "scrollstop", this._touchDown);
        },
        _mouseDownInitContent: function () {
            this.model.autoHide && this._on($(document), "mouseup", this._mouseUpContent);
            this.element.addClass("e-scroll-focus");
        },
        _addActionClass: function () {
            //e-pinch class enables the touch mode operations in IE browsers
            if (this._browser == "msie") {
                this.content().removeClass('e-pinch e-pan-x e-pan-y');
                if (this._vScrollbar && this._hScrollbar) this.content().addClass('e-pinch');
                else if (this._vScrollbar && !this._hScrollbar) this.content().addClass('e-pan-x');
                else if (this._hScrollbar && !this._vScrollbar) this.content().addClass('e-pan-y');
            }
        },
        _setDimension: function () {
            if (!ej.isNullOrUndefined(this.model.height) && typeof this.model.height === "string" && this.model.height.indexOf("%") != -1) {
                if (!(this._vScroll || this._hScroll)) $(this.content()[0]).height("");
                else this.model.height = this._convertPercentageToPixel(parseInt(this._eleHeight), this.element.parent().height());
            }
            if (!ej.isNullOrUndefined(this.model.width) && typeof this.model.width === "string" && this.model.width.indexOf("%") != -1) {
                if (!(this._hScroll || this._vScroll)) $(this.content()[0]).width("");
                else this.model.width = this._convertPercentageToPixel(parseInt(this._eleWidth), this.element.parent().width());
            }
        },
        _setScrollLeftValue: function (leftValue) {
            if (this.model.enableRTL) {
                if (ej.browserInfo().name == "mozilla")
                    leftValue = leftValue < 0 ? leftValue : (leftValue * -1);
                else if (!ej.isNullOrUndefined(this._rtlScrollLeftValue) && (ej.browserInfo().name == "chrome" || this._rtlScrollLeftValue > 0))
                    leftValue = leftValue < 0 ? (this._rtlScrollLeftValue + leftValue) : (this._rtlScrollLeftValue - leftValue);
                else
                    leftValue = Math.abs(leftValue);
            }
            this.content().scrollLeft(leftValue);
        },


        _ensureScrollers: function () {
            var jqVersion = $.fn.jquery, height, width;
            this.model.height = typeof this.model.height == "string" && this.model.height.indexOf("px") != -1 ? parseInt(this.model.height) : this.model.height;
            this.model.width = typeof this.model.width == "string" && this.model.width.indexOf("px") != -1 ? parseInt(this.model.width) : this.model.width;
            if (this.model.height) {
                this.element.height(this.model.height);
            }
            if (this.model.width) {
                this.element.width(this.model.width);
            }

            this._off(this.content(), "mousedown touchstart");
            if (this.content().length > 0) {
                if (this.isVScroll()) {
                    if (!this._tempVscrollbar) {
                        this._vScrollbar = this._createScrollbar(ej.ScrollBar.Orientation.Vertical, this.isHScroll());
                        this._tempVscrollbar = this._vScrollbar;
                    }
                    if (this.model.enableTouchScroll)
                        this._on(this.content(), "mousedown touchstart", { d: this._vScrollbar._scrollData }, this._mouseDownOnContent);
                } else {
                    this._vScrollbar = null;
                    this._tempVscrollbar = this._vScrollbar;
                    this.element.children(".e-vscrollbar").remove();
                }
                if (this.isHScroll()) {
                    if (!this._tempHscrollbar) {
                        this._hScrollbar = this._createScrollbar(ej.ScrollBar.Orientation.Horizontal, this.isVScroll());
                        this._tempHscrollbar = this._hScrollbar;
                    }
                    if (this.model.enableTouchScroll)
                        this._on(this.content(), "mousedown touchstart", { d: this._hScrollbar._scrollData }, this._mouseDownOnContent);
                } else {
                    this._hScrollbar = null;
                    this._tempHscrollbar = this._hScrollbar;
                    this.element.children(".e-hscrollbar").remove();
                }

                if (!this._vScrollbar && !this._hScrollbar)
                    this.content().css({ width: "auto", height: "auto" });

                if (!(this.element.find(".e-hscroll").length > 0)) {
                    if (this._vScrollbar) {
                        this.content().outerHeight(this.content().outerHeight() - 1);
                    }
                }
                jqVersion === "1.7.1" || jqVersion === "1.7.2" ? (this._contentHeight = "height", this._contentWidth = "width") : (this._contentHeight = "outerHeight", this._contentWidth = "outerWidth");
                this._hScroll = this.isHScroll(), this._vScroll = this.isVScroll();
                if (this._hScroll || this._vScroll) {
                    this.content().addClass("e-content");
                    var rect = this._exactElementDimension(this.element);
                    this._elementDimension(rect);
                    if (this.model.targetPane !== null && this.content().find(this.model.targetPane)[0] !== undefined) this.content().find(this.model.targetPane)[0].scrollLeft = this.scrollLeft();
                    else if (!this.isHScroll() && (this.element.children(".e-hscrollbar").length > 0)) this._ensureScrollers();
                    if ((isNaN(this._eleWidth) && (this._eleWidth.indexOf("%") > 0)) && (isNaN(this._eleHeight) && (this._eleHeight.indexOf("%") > 0))) $(window).on('resize', $.proxy(this._resetScroller, this));
                } else
                    this.content().removeClass("e-content");
                this._setDimension();
                this._parentHeight = $(this.element).parent().height(); this._parentWidth = $(this.element).parent().width();
            }
        },
        _elementDimension: function (rect) {
            this._ElementHeight = rect.height - (this["border_bottom"] + this["border_top"] + this["padding_bottom"] + this["padding_top"]);
            this.content()[this._contentHeight](this._ElementHeight - ((this._hScroll && !this.model.autoHide) ? this.model.scrollerSize :
                this.element.find(".e-hscrollbar").is(':visible') ? this.model.scrollerSize : 0));
            this._ElementWidth = rect.width - (this["border_left"] + this["border_right"] + this["padding_left"] + this["padding_right"]);
            this.content()[this._contentWidth](this._ElementWidth - ((this._vScroll && !this.model.autoHide) ? this.model.scrollerSize :
                this.element.find(".e-vscrollbar").is(':visible') ? this.model.scrollerSize : 0));
        },
        _convertPercentageToPixel: function (ele, outer) {
            return Math.floor((ele * outer) / 100);
        },

        isHScroll: function () {
            var updatedWidth = (parseFloat($.fn.jquery) >= 3) ? Math.ceil(this.element.width()) : this.element.width();
            var modelWidth = this.model.width;
            if (!ej.isNullOrUndefined(this.model.width)) {
                if (typeof this.model.width === "string" && this.model.width.indexOf("%") != -1) {
                    modelWidth = updatedWidth;
                } else {
                    modelWidth = (parseFloat($.fn.jquery) >= 3 && !isNaN(parseFloat(this.model.width))) ? Math.ceil(parseFloat(this.model.width)) : this.model.width;
                }
            }
            if (!ej.isNullOrUndefined(this._tempWidth) && typeof this._tempWidth === "string" && this._tempWidth.indexOf("%") != -1) {
                if (!ej.isNullOrUndefined(this.model.width) && typeof this.model.width === "string" && this.model.width.indexOf("%") != -1)
                    return this.content()[0].scrollWidth > updatedWidth;
                else if (this.content()[0].scrollWidth > updatedWidth) return true;
            }
            else {
                if (modelWidth > 0) {
                    var $paneObject = this.content().find(this.model.targetPane);
                    if (this.model.targetPane != null && $paneObject.length)
                        return ($paneObject[0].scrollWidth + $paneObject.siblings().width()) > modelWidth;
                    else {
                        if (this.content()[0].scrollWidth > modelWidth) return true;
                        else if (this.content()[0].scrollWidth == modelWidth)
                            if (this.model.autoHide && $(this.content()[0]).find('> *').length > 0) return $(this.content()[0]).find('> *')[0].scrollWidth > $(this.content()[0]).width();
                            else if ($(this.content()[0]).find('> *').length > 0) return $(this.content()[0]).find('> *')[0].scrollWidth > (!ej.isNullOrUndefined(this._tempVscrollbar) ? modelWidth - this.model.scrollerSize : modelWidth);
                        return false;
                    }
                    return false;
                }
                return false;
            }
        },

        isVScroll: function () {
            //To avoid unnecessarilly render the vertical scrollbar for 1 or 2 px difference range.
            var border = 2;
            if (!ej.isNullOrUndefined(this.model.height) && typeof this.model.height === "string" && this.model.height.indexOf("%") != -1)
                return this.content()[0].scrollHeight > this.element.outerHeight(); //this._convertPercentageToPixel(parseInt(this._eleHeight), this.element.parent().height());        
            else if (this.model.height > 0) {
                if ((this.content()[0].scrollHeight > Math.ceil(this.model.height))) return true;
                else if (this.isHScroll()) if ((this.content()[0].scrollHeight == this.model.height || (this.content()[0].scrollHeight > this.model.height - (this.model.scrollerSize - border)))) return true;
            }
            return false;
        },
        _setModel: function (option) {
            for (var prop in option) {
                switch (prop) {
                    case "enableRTL":
                        if (option[prop]) {
                            this.element.addClass("e-rtl");
                            this._rtlScrollLeftValue = this.content().scrollLeft();
                            if (!ej.isNullOrUndefined(this._hScrollbar)) this._hScrollbar._scrollData.enableRTL = true;

                        } else {
                            this.element.removeClass("e-rtl");
                            if (!ej.isNullOrUndefined(this._hScrollbar)) this._hScrollbar._scrollData.enableRTL = false;
                        }
                        if (this._hScrollbar) {
                            this.element.find(".e-hhandle").css("left", 0);
                            this._hScrollbar.value(0);
                        }
                        break;
                    case "preventDefault": this.model.preventDefault = option[prop];
                        break;
                    case "scrollLeft":
                        if (parseFloat(ej.util.getVal(option[prop])) < 0 || !this._hScroll) option[prop] = 0;
                        if (this._hScrollbar) option[prop] = parseFloat(ej.util.getVal(option[prop])) > this._hScrollbar._scrollData.scrollable ? this._hScrollbar._scrollData.scrollable : parseFloat(ej.util.getVal(option[prop]));
                        this._setScrollLeftValue(parseFloat(option[prop]));
                        this["scrollLeft"](option[prop]);
                        if (this._hScrollbar && !(this._hScrollbar._scrollData._scrollleftflag && this.model.enableRTL))
                            this.scrollX(option[prop], true);
                        break;
                    case "scrollTop":
                        if (this._vScrollbar) option[prop] = parseFloat(ej.util.getVal(option[prop])) > this._vScrollbar._scrollData.scrollable ? this._vScrollbar._scrollData.scrollable : parseFloat(ej.util.getVal(option[prop]));
                        if (parseFloat(option[prop]) < 0 || !this._vScroll) option[prop] = 0;
                        this.content().scrollTop(parseFloat(option[prop]));
                        this["scrollTop"](option[prop]);
                        this.scrollY(option[prop], true);
                        break;
                    case "touchScroll":
                        if (!this.model.enableTouchScroll)
                            this._off(this.content(), "mousedown touchstart");
                        else {
                            if (this._vScrollbar)
                                this._on(this.content(), "mousedown touchstart", { d: this._vScrollbar._scrollData }, this._mouseDownOnContent);
                            if (this._hScrollbar)
                                this._on(this.content(), "mousedown touchstart", { d: this._hScrollbar._scrollData }, this._mouseDownOnContent);
                        }
                        break;
                    case "scrollOneStepBy":
                        if (this._vScrollbar) {
                            this._vScrollbar._scrollData.scrollOneStepBy = option[prop];
                            this._vScrollbar.model.smallChange = option[prop];
                        }
                        if (this._hScrollbar) {
                            this._hScrollbar._scrollData.scrollOneStepBy = option[prop];
                            this._hScrollbar.model.smallChange = option[prop];
                        }
                        break;
                    case "buttonSize":
                        if (this._vScrollbar) this._vScrollbar.model.buttonSize = this.model.buttonSize;
                        if (this._hScrollbar) this._hScrollbar.model.buttonSize = this.model.buttonSize;
                        this.refresh();
                        break;
                    case "height": this._eleHeight = option[prop];
                        this.refresh();
                        break;
                    case "width": this._eleWidth = option[prop];
                        this.refresh();
                        break;
                    case "enabled":
                        if (!option[prop]) this.disable();
                        else this.enable();
                        break;
                    default:
                        this.refresh();
                }
            }
        },

        _createScrollbar: function (orientation, isOtherScroll) {
            var proxy = this;
            var id, viewportSize, width, height, maximum, value;
            var div = document.createElement("div");
            if (orientation === ej.ScrollBar.Orientation.Vertical) {
                width = this.model.scrollerSize;
                if (!ej.isNullOrUndefined(this.model.height) && typeof this.model.height === "string" && this.model.height.indexOf("%") != -1)
                    height = viewportSize = this.element.height() - (isOtherScroll ? this.model.scrollerSize : 0);
                else
                    height = viewportSize = this.model.height - (isOtherScroll ? this.model.scrollerSize : 0);
                maximum = this.content()[0]["scrollHeight"];
                value = this.scrollTop();
            }
            else {
                width = viewportSize = this.model.width - (isOtherScroll ? this.model.scrollerSize : 0);
                height = this.model.scrollerSize;
                if (!ej.isNullOrUndefined(this.model.width) && typeof this.model.width === "string" && this.model.width.indexOf("%") != -1) {
                    width = viewportSize = this.element.width() - (isOtherScroll ? this.model.scrollerSize : 0);
                    maximum = this.content()[0]["scrollWidth"];
                }
                else {
                    var $pane = this.content().find(this.model.targetPane);
                    if (this.model.targetPane != null && $pane.length)
                        maximum = $pane[0]["scrollWidth"] + $pane.parent().width() - $pane.width();
                    else
                        maximum = this.content()[0]["scrollWidth"];
                }
                value = this.scrollLeft();
            }
            if (this.element.children(".e-hscrollbar").length > 0)
                $(this.element.children(".e-hscrollbar")).before(div);
            else
                this.element.append(div);
            $(div).ejScrollBar({
                elementHeight: proxy._eleHeight,
                elementWidth: proxy._eleWidth,
                buttonSize: proxy.model.buttonSize,
                orientation: orientation,
                viewportSize: viewportSize,
                height: height,
                width: width,
                maximum: maximum - viewportSize,
                value: value,
                smallChange: this.model.scrollOneStepBy,
                largeChange: 3 * this.model.scrollOneStepBy,
                scroll: ej.proxy(this._scrollChanged, this),
                thumbEnd: ej.proxy(this._thumbEnd, this),
                thumbStart: ej.proxy(this._thumbStart, this),
                thumbMove: ej.proxy(this._thumbMove, this),
            });
            var scrollbar = $(div).ejScrollBar("instance");
            (orientation === ej.ScrollBar.Orientation.Vertical || !isOtherScroll) && this._off(this.element, this._browser == "msie" ? "wheel mousewheel" : "mousewheel DOMMouseScroll", this._mouseWheel)
                ._on(this.element, this._browser == "msie" ? "wheel mousewheel" : "mousewheel DOMMouseScroll", { d: scrollbar._scrollData }, this._mouseWheel);
            if (orientation === ej.ScrollBar.Orientation.Horizontal) {
                this._scrollXdata = scrollbar._scrollData;
            }
            else
                this._scrollYdata = scrollbar._scrollData;
            if (orientation === ej.ScrollBar.Orientation.Horizontal && this.model.enableRTL) {
                scrollbar._scrollData.enableRTL = true;
            }
            scrollbar._enabled = this.model.enabled;
            return scrollbar;
        },

        _updateScrollbar: function (orientation, isOtherScroll) {
            var scrollbar = orientation === ej.ScrollBar.Orientation.Vertical ? this._vScrollbar : this._hScrollbar;
            if (scrollbar) {
                if (orientation === ej.ScrollBar.Orientation.Vertical) {
                    scrollbar.model.width = this.model.scrollerSize;
                    scrollbar.model.height = scrollbar.model.viewportSize = this.model.height - (isOtherScroll ? this.model.scrollerSize : 0);
                    scrollbar.model.maximum = this.content()[0]["scrollHeight"] - scrollbar.model.viewportSize;
                    scrollbar.model.value = this.scrollTop();
                }
                else {
                    scrollbar.model.width = scrollbar.model.viewportSize = this.model.width - (isOtherScroll ? this.model.scrollerSize : 0);
                    scrollbar.model.height = this.model.scrollerSize;
                    scrollbar.model.maximum = ((this.model.targetPane != null && this.content().find(this.model.targetPane).length > 0) ? this.content().find(this.model.targetPane)[0]["scrollWidth"] + (this.content().width() - this.content().find($(this.model.targetPane)).outerWidth()) : this.content()[0]["scrollWidth"]) - scrollbar.model.viewportSize;
                    if (!this.model.enableRTL)
                        scrollbar.model.value = this.scrollLeft();
                }
            }
        },

        _autohide: function () {
            if (this.model.autoHide) {
                this.element.addClass("e-autohide");
                this._on(this.element, "mouseenter mouseleave touchstart touchend", this._scrollerHover);
                if (!$(':hover').filter(this.element[0]).length) this.content().siblings(".e-scrollbar.e-js").hide();
                this._elementDimension(this._exactElementDimension(this.element));
            }
            else {
                this.element.removeClass("e-autohide");
                this._off(this.element, "mouseenter mouseleave touchstart touchend", this._scrollerHover);
                this.content().siblings(".e-scrollbar.e-js").show();
            }
        },

        _mouseUpContent: function (e) {
            if (e.type == "mouseup") {
                this.element.removeClass("e-scroll-focus");
                this._autohide();
                this._off($(document), "mouseup", this._mouseUpContent);
            }
        },
        _scrollChanged: function (e) {
            this._updateScroll = true;
            if (e.scrollTop !== undefined)
                this.scrollY(e.scrollTop, true, "", e.source);
            else if (e.scrollLeft !== undefined)
                this.scrollX(e.scrollLeft, true, "", e.source);
            this._updateScroll = false;
            var proxy = this;
            $.when(this.content()).done(ej.proxy(function () {
                proxy._trigger("scrollEnd", { scrollData: e });
            }));
        },
        _bindBlurEvent: function (scrollObj, e) {
            this._scrollEle = $(scrollObj).data('ejScrollBar');
            this._event = e; var proxy = this;
            this._listener = function (e) {
                this._scrollEle._off($(document), "mousemove touchmove", this._scrollEle._mouseMove);
                $(document).off("mouseup touchend", ej.proxy(this._scrollEle._mouseUp, this._scrollEle));
                this._scrollEle._prevY = null;
                this._off($(document), "mousemove touchmove", this._mouseMove);
                this._off($(document), "mouseup touchend", this._mouseUp);
                this._off($(window), "blur");
                if (this._evtData.handler === "e-vhandle") this._scrollEle._trigger("thumbEnd", { originalEvent: this._event, scrollData: this._evtData });
                else this._scrollEle._trigger("thumbEnd", { originalEvent: this._event, scrollData: this._evtData });
            };
            this._on($(window), "blur", this._listener);
        },
        _thumbStart: function (e) {
            this._evtData = e.scrollData;
            var scrollObj = e.scrollData.handler === "e-vhandle" ? this.element.find('.' + e.scrollData.handler).closest('.e-scrollbar') : this.element.find('.' + e.scrollData.handler).closest('.e-scrollbar'); var scrollObj = e.scrollData.handler === "e-vhandle" ? this.element.find('.' + e.scrollData.handler).closest('.e-scrollbar') : this.element.find('.' + e.scrollData.handler).closest('.e-scrollbar');
            this._bindBlurEvent(scrollObj, e);
            this._trigger("thumbStart", e);
        },
        _thumbMove: function (e) {
            this._trigger("thumbMove", e);
        },
        _thumbEnd: function (e) {
            this._trigger("thumbEnd", e);
            this._off($(window), "blur");
        },

        refresh: function (needRefresh) {
            if (!needRefresh) {
                this.element.find(">.e-content").removeAttr("style");
            }
            else {
                this._tempVscrollbar = null;
                this.element.children(".e-vscrollbar").remove();
                this._tempHscrollbar = null;
                this.element.children(".e-hscrollbar").remove();
            }

            if (!ej.isNullOrUndefined(this._eleHeight) && typeof this._eleHeight === "string" && this._eleHeight.indexOf("%") != -1 && this._parentHeight != $(this.element).parent().height()) {
                var element = this._exactElementDimension(this.element.parent());
                element = element.height - (this["border_bottom"] + this["border_top"] + this["padding_bottom"] + this["padding_top"]);
                this.model.height = this._convertPercentageToPixel(parseInt(this._eleHeight), element);
            }
            if (!ej.isNullOrUndefined(this._eleWidth) && typeof this._eleWidth === "string" && this._eleWidth.indexOf("%") != -1 && this._parentWidth != $(this.element).parent().width()) {
                var element = this._exactElementDimension(this.element.parent());
                element = element.width - (this["border_left"] + this["border_right"] + this["padding_left"] + this["padding_right"]);
                this.model.width = this._convertPercentageToPixel(parseInt(this._eleWidth), element);
            }

            this._ensureScrollers();
            var scrollLeftValue = this.model.scrollLeft;
            if (this.model.enableRTL) {
                !this.element.hasClass("e-rtl") && this.element.addClass("e-rtl");
                this._rtlScrollLeftValue = this.content().scrollLeft();
                scrollLeftValue > 0 ? this.content().scrollLeft(this._rtlScrollLeftValue - scrollLeftValue) : this._setScrollLeftValue(scrollLeftValue);
            }
            else
                this.content().scrollLeft(scrollLeftValue);
            if ((this.scrollTop() && ej.isNullOrUndefined(this._vScrollbar)) || (!ej.isNullOrUndefined(this._vScrollbar) && (this._vScrollbar && this._vScrollbar._scrollData != null) && !this._vScrollbar._scrollData.skipChange))
                this.scrollTop(this._isJquery3 ? Math.ceil(this.scrollTop()) : this.scrollTop());
            this.content().scrollTop(this.scrollTop());

            if (this._vScrollbar) {
                this._vScrollbar._scrollData.dimension = "Height";
                this._updateScrollbar(ej.ScrollBar.Orientation.Vertical, this._hScroll);
                this._vScroll && !this._vScrollbar._calculateLayout(this._vScrollbar._scrollData) && this._vScrollbar._updateLayout(this._vScrollbar._scrollData);
            }
            if (this._hScrollbar) {
                this._hScrollbar._scrollData.dimension = "Width";
                this._updateScrollbar(ej.ScrollBar.Orientation.Horizontal, this._vScroll);
                this._hScroll && !this._hScrollbar._calculateLayout(this._hScrollbar._scrollData) && this._hScrollbar._updateLayout(this._hScrollbar._scrollData);
            }
            if (ej.browserInfo().name == "msie" && ej.browserInfo().version == "8.0")
                this.element.find(".e-hhandle").css("left", "0px");
            else
                this.model.targetPane != null && this._on(this.content().find(this.model.targetPane), "scroll", this._scroll);
            this._addActionClass();
            this._autohide();
        },
        _exactElementDimension: function (element) {
            var rect = element.get(0).getBoundingClientRect(), direction = ["left", "right", "top", "bottom"], width, height;
            rect.width ? width = rect.width : width = rect.right - rect.left;
            rect.height ? height = rect.height : height = rect.bottom - rect.top;
            for (var i = 0; i < direction.length; i++) {
                this["border_" + direction[i]] = isNaN(parseFloat(element.css("border-" + direction[i] + "-width"))) ? 0 : parseFloat(element.css("border-" + direction[i] + "-width"));
                this["padding_" + direction[i]] = isNaN(parseFloat(element.css("padding-" + direction[i]))) ? 0 : parseFloat(element.css("padding-" + direction[i]));
            }
            return rect = { width: width, height: height };
        },
        _keyPressed: function (action, target) {
            if (!this.model.enabled) return;
            if (["input", "select", "textarea"].indexOf(target.tagName.toLowerCase()) !== -1)
                return true;

            var d, iChar;

            if (["up", "down", "pageUp", "pageDown"].indexOf(action) !== -1) {
                if (this._vScrollbar) {
                    if (ej.browserInfo().name == "msie" && this.model.allowVirtualScrolling)
                        this._content.focus();
                    d = this._vScrollbar._scrollData;
                }
                iChar = "o";
            } else if (["left", "right", "pageLeft", "pageRight"].indexOf(action) !== -1) {
                if (this._hScrollbar)
                    d = this._hScrollbar._scrollData;
                iChar = "i";
            } else return true;
            if (!d) return true;

            return !this._changeTop(d, (action.indexOf(iChar) < 0 ? -1 : 1) * (action[0] !== "p" ? 1 : 3) * d.scrollOneStepBy, "key");
        },

        scrollY: function (pixel, disableAnimation, animationSpeed, source, e) {
            var proxy = this;
            if (pixel === "") return;
            if (disableAnimation) {
                var e = { source: source || "custom", scrollData: this._vScrollbar ? this._vScrollbar._scrollData : null, scrollTop: pixel, originalEvent: e };
                pixel = (!this._isJquery3) ? e.scrollTop : Math.ceil(e.scrollTop);
                this.scrollTop(pixel);
                if (this._trigger("scroll", e)) return;
                this.content().scrollTop(pixel);
                return;
            }
            if (ej.isNullOrUndefined(animationSpeed) || animationSpeed === "") animationSpeed = 100;
            if (this._vScrollbar) pixel = parseFloat(pixel) > this._vScrollbar._scrollData.scrollable ? this._vScrollbar._scrollData.scrollable : parseFloat(pixel)
            pixel = (!this._isJquery3) ? pixel : Math.ceil(pixel);
            this.scrollTop(pixel);
            this.content().stop().animate({
                scrollTop: pixel
            }, animationSpeed, 'linear', function () {
                if (proxy._trigger("scroll", { source: source || "custom", scrollData: proxy._vScrollbar ? proxy._vScrollbar._scrollData : null, scrollTop: pixel, originalEvent: e })) return;
            })
        },

        scrollX: function (pixel, disableAnimation, animationSpeed, source, e) {
            var proxy = this;
            if (pixel === "") return;
            if (this._hScrollbar) pixel = parseFloat(pixel) > this._hScrollbar._scrollData.scrollable ? this._hScrollbar._scrollData.scrollable : parseFloat(pixel);
            var browserName = ej.browserInfo().name;
            if (this.model.enableRTL && browserName != "mozilla" && browserName != "chrome") {
                if (pixel < 0) pixel = Math.abs(pixel);
                var content = this.model.targetPane != null ? this.content().find(this.model.targetPane)[0] : this.content()[0];
                if (e != "mousemove" && e != "touchmove" && (browserName != "msie")) if (browserName != "msie") pixel = this._hScrollbar._scrollData.scrollable - pixel;
            }
            this.scrollLeft(pixel);
            if (disableAnimation) {
                if (this._trigger("scroll", { source: source || "custom", scrollData: this._hScrollbar ? this._hScrollbar._scrollData : null, scrollLeft: pixel, originalEvent: e }))
                    return;
                if (this.model.targetPane != null && this.content().find(this.model.targetPane).length)
                    this.content().find(this.model.targetPane).scrollLeft(pixel);
                else
                    this.content().scrollLeft(pixel);
                return;
            }
            if (ej.isNullOrUndefined(animationSpeed) || animationSpeed === "") animationSpeed = 100;
            if (this.model.targetPane != null && this.content().find(this.model.targetPane).length)
                this.content().find(this.model.targetPane).stop().animate({
                    scrollLeft: pixel
                }, animationSpeed, 'linear');
            else this.content().stop().animate({
                scrollLeft: pixel
            }, animationSpeed, 'linear', function () {
                if (proxy._trigger("scroll", { source: source || "custom", scrollData: proxy._hScrollbar ? proxy._hScrollbar._scrollData : null, scrollLeft: pixel, originalEvent: e })) return;
            });
        },

        enable: function () {
            var scroller = this.element.find(".e-vscrollbar,.e-hscrollbar,.e-vscroll,.e-hscroll,.e-vhandle,.e-hhandle,.e-vscroll .e-icon,.e-hscroll .e-icon");
            if (scroller.hasClass("e-disable")) {
                scroller.removeClass("e-disable").attr({ "aria-disabled": false });
                this.model.enabled = true;
            }
            if (this._vScrollbar)
                this._vScrollbar._enabled = this.model.enabled;
            if (this._hScrollbar)
                this._hScrollbar._enabled = this.model.enabled;
        },

        disable: function () {
            var scroller = this.element.find(".e-vscrollbar,.e-hscrollbar,.e-vscroll,.e-hscroll,.e-vhandle,.e-hhandle,.e-vscroll .e-icon,.e-hscroll .e-icon");
            scroller.addClass("e-disable").attr({ "aria-disabled": true });
            this.model.enabled = false;
            if (this._vScrollbar)
                this._vScrollbar._enabled = this.model.enabled;
            if (this._hScrollbar)
                this._hScrollbar._enabled = this.model.enabled;
        },

        _changeTop: function (d, step, source, e) {
            var start = Math.ceil(this.model.targetPane != null && d.dimension != "height" ? this.content().find(this.model.targetPane)[d.scrollVal]() : this.content()[d.scrollVal]()), t;

            if (d.dimension == "height" && start == 0)
                start = this.scrollTop() != 0 ? this.scrollTop() : 0;
            t = start + step;
            if (!d.enableRTL ? t > d.scrollable : t < d.scrollable) t = Math.round(d.scrollable);
            if (!d.enableRTL ? t < 0 : t > 0) t = 0;

            if (t !== start) {
                this["scroll" + d.xy](t, true, "", source, e);
                if (d.xy === "X" && !ej.isNullOrUndefined(this._hScrollbar))
                    this._hScrollbar["scroll"](t, source, true, e);
                else if (!ej.isNullOrUndefined(this._vScrollbar))
                    this._vScrollbar["scroll"](t, source, true, e);
            }

            return t !== start;
        },

        _mouseWheel: function (e) {
            if (this._vScrollbar && e.ctrlKey)
                return;
            if (!this._vScrollbar && !e.shiftKey)
                return;
            if (!e.data || !this.model.enabled) return;
            var delta = 0, data = e.data.d, ori = e, direction;
            e = e.originalEvent;
            this._wheelStart && this._trigger("wheelStart", { originalEvent: e, scrollData: ori.data.d });
            this._wheelStart = false;
            clearTimeout($.data(this, 'timer'));
            if (this._wheelx != 1 && (e.wheelDeltaX == 0 || e.wheelDeltaY == 0))
                this._wheelx = 1;
            if (navigator.platform.indexOf("Mac") == 0 && (this._wheelx == 0)) {
                if (this._browser == "webkit" || this._browser == "chrome")
                    return true;
            }
            if (this._browser == "mozilla")
                e.axis == e.HORIZONTAL_AXIS ? data = (this._scrollXdata ? this._scrollXdata: data) : this._scrollYdata;
            else if (this._browser == "msie") {
                if ((e.type == "wheel")) delta = e.deltaX / 120;
                if ((e.type == "mousewheel" && e.shiftKey)) {
                    data = this._scrollXdata;
                    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
                }
            }
            else if (this._wheelx && e.wheelDeltaX != 0 && e.wheelDeltaY == 0 && this._scrollXdata)
                data = this._scrollXdata;
            if (e.wheelDeltaX == 0) this._wheelx = e.wheelDeltaX;
            if (e.wheelDelta) {
                delta = this._normalizingDelta(e);
                if (window.opera) {
                    if (parseFloat(window.opera.version, 10) < 10)
                        delta = -delta;
                }
            } else if (e.detail) delta = e.detail / 3;
            if (!delta) return;
            if ((ori.originalEvent))
                if (ori.originalEvent.wheelDelta && ori.originalEvent.wheelDelta > 0 || ori.originalEvent.detail && ori.originalEvent.detail < 0) direction = -1;
                else direction = 1;
            if (this._changeTop(data, delta * data.scrollOneStepBy, "wheel", e)) {
                e.preventDefault ? e.preventDefault() : ori.preventDefault();
                this._trigger("wheelMove", { originalEvent: e, scrollData: ori.data.d, direction: direction });
            }
            else {
                this._trigger("scrollEnd", { originalEvent: e, scrollData: ori });
                this._wheelx = 0;
            }
            var proxy = this;
            $.data(this, 'timer', setTimeout(function () {
                proxy._wheelStart = true;
                proxy._trigger("wheelStop", { originalEvent: e, scrollData: ori.data.d, direction: direction });
            }, 250));
        },

        _normalizingDelta: function (e) {
            var delta = navigator.platform.indexOf("Mac") == 0 ? ((Math.abs(e.wheelDelta) !== 120) ? -e.wheelDelta / 3: -e.wheelDelta / 80) : -e.wheelDelta / 120;
            return delta;
        },

        _contentHeightWidth: function () {
            if (this.content().siblings().css("display") == "block" && this.model.autoHide) {
                this._hScroll && this.content()[this._contentHeight](this._ElementHeight - (this.model.scrollerSize));
                this._vScroll && this.content()[this._contentWidth](this._ElementWidth - (this.model.scrollerSize));
            }
            else if (this.content().siblings().css("display") == "none" && this.model.autoHide && (this._vScroll || this._hScroll)) {
                this.content()[this._contentHeight](this._ElementHeight);
                this.content()[this._contentWidth](this._ElementWidth);
            }
        },
        _scrollerHover: function (e) {
            if (this.model.enabled) {
                if ((e.type == "mouseenter" || e.type == "touchstart") && !this.content().siblings().is(":visible")) {
                    this.content().siblings().css("display", "block");
                    this._contentHeightWidth();
                    this._ensureScrollers();
                    this._setScrollLeftValue(this.model.scrollLeft);
                    this._trigger("scrollVisible", { originalEvent: e });
                }
                else if ((e.type == "mouseleave" || e.type == "touchend") && !this.element.hasClass("e-scroll-focus")) {
                    this.content().siblings().hide();
                    this._contentHeightWidth();
                    this._trigger("scrollHide", { originalEvent: e });
                }
            }
        },

        _mouseUp: function (e) {
            if (!e.data) return;
            var d = e.data.d;
            if (this.model.enableRTL && (e.type == "mouseup" || e.type == "touchend")) {
                this.model.scrollLeft = this._rtlScrollLeftValue - this.model.scrollLeft;
            }
            if (e.type === "mouseup" || e.type === "touchend" || (!e.toElement && !e.relatedTarget)) {
                this.content().css("cursor", "default");
                this._off($(document), "mousemove touchmove");
                this._off(this.content(), "touchmove", this._touchMove);
                this._off($(document), "mouseup touchend", this._mouseUp);
                d.fromScroller = false;
                if (this._mouseMoved === true && e.data.source === "thumb" && !ej.isNullOrUndefined(this.model)) {
                    $.when(this.content()).done(ej.proxy(function () {
                        this._trigger("thumbEnd", { originalEvent: e, scrollData: d });
                    }, this));
                    this._off($(window), "blur");
                }
            }
            d.up = true;
            this._mouseMoved = false;
            window.ontouchmove = null;
        },

        _mouseDownOnContent: function (down) {
            this._startX = (down.clientX != undefined) ? down.clientX : down.originalEvent.changedTouches[0].clientX;
            this._startY = (down.clientY != undefined) ? down.clientY : down.originalEvent.changedTouches[0].clientY;
            this._timeStart = down.timeStamp || Date.now();
            if (!this.model.enabled) return;
            var d = down.data.d;
            this._evtData = down.data;
            var scrollObj = d.handler === "e-vhandle" ? this.element.find('.' + d.handler).closest('.e-scrollbar') : this.element.find('.' + d.handler).closest('.e-scrollbar');
            this._bindBlurEvent(scrollObj, down);
            if (this._trigger("thumbStart", { originalEvent: down, scrollData: d }))
                return;
            if (down.which == 3 && down.button == 2) return;
            d.fromScroller = true;
            var prevY = null, skip = 1, min = 5, direction;
            this._document = $(document); this._window = $(window);
            this._mouseMove = function (move) {
                if (this.model.enableRTL) {
                    this._UpdateScrollLeftValue(down);
                }
                if (this._startX + this._startY != move.clientX + move.clientY) {
                    this._relDisX = ((move.clientX != undefined) ? this._startx = move.clientX : this._startx = move.originalEvent.changedTouches[0].clientX) - this._startX;
                    this._relDisY = ((move.clientY != undefined) ? this._starty = move.clientY : this._starty = move.originalEvent.changedTouches[0].clientY) - this._startY;
                    this._duration = (move.timeStamp || Date.now()) - this._timeStart;
                    this._velocityY = Math.abs(this._relDisY) / this._duration;
                    this._velocityX = Math.abs(this._relDisX) / this._duration;
                    if (Math.abs(this._relDisX) > Math.abs(this._relDisY))
                        this._swipe = (this._relDisX > 0) ? "left" : "right";
                    else
                        this._swipe = (this._relDisY > 0) ? "up" : "down";
                    if (!ej.isNullOrUndefined(move.target.tagName) && move.target.tagName.toLowerCase() === "iframe") {
                        move.type = "mouseup";
                        this._mouseUp(move);
                        return;
                    }
                    var pageXY = move.type == "mousemove" ? move[d.clientXy] : move.originalEvent.changedTouches[0][d.clientXy];
                    if (prevY && pageXY !== prevY) {
                        this._mouseMoved = true;
                        var diff = pageXY - prevY, sTop = this.model[d.scrollVal] - (diff);

                        if (skip == 1 && Math.abs(diff) > min) {
                            direction = d.position;
                            skip = 0;
                        }
                        if (skip == 0) prevY = pageXY;

                        if (sTop >= 0 && sTop <= d.scrollable && direction === d.position) {
                            var top = this._velocityY > 0.5 && this._duration < 50 && d.position == "Top";
                            var left = this._velocityX > 0.5 && this._duration < 50 && d.position == "Left";
                            var swipeXY = ((this._velocityY > 0.5) || (this._velocityX > 0.5)) && this._duration < 50;
                            if (swipeXY) {
                                if (top) {
                                    sTop = Math.abs(this._relDisY) + (this._duration * this._velocityY);
                                    if (this._startY > this._starty) {
                                        sTop += this.scrollTop();
                                        if (sTop > d.scrollable) sTop = d.scrollable;
                                    }
                                    else {
                                        if (sTop < this.scrollTop()) sTop = Math.abs(sTop - this.scrollTop());
                                        if (sTop > this.scrollTop())
                                            sTop = 0;
                                    }
                                    if (this.scrollTop() <= d.scrollable) this["scrollY"](sTop, false, this.model.animationSpeed, "thumb");
                                }
                                else if (left) {
                                    sTop = Math.abs(this._relDisX);
                                    if (this._startX > this._startx) {
                                        sTop += this.scrollLeft();
                                        if (sTop > d.scrollable) sTop = d.scrollable;
                                    }
                                    else {
                                        sTop -= this.scrollLeft();
                                        sTop = Math.abs(sTop);
                                        if (sTop > d.scrollable || sTop >= this.scrollLeft()) sTop = 0;
                                    }
                                    if (this.scrollLeft() <= d.scrollable) this["scrollX"](sTop, false, this.model.animationSpeed, "thumb");
                                }
                            }
                            else {
                                this["scroll" + d.xy](sTop, true, "", "thumb", move.type);
                                if (d.xy === "X")
                                    this._hScrollbar["scroll"](sTop, "thumb", true, move.type);
                                else if (!ej.isNullOrUndefined(this._vScrollbar))
                                    this._vScrollbar["scroll"](sTop, "thumb", true, move.type);
                                this.content().css("cursor", "pointer");
                                this._trigger("thumbMove", { originalEvent: move, direction: (this._swipe == "down" || this._swipe == "right") ? 1 : -1, scrollData: d });
                            }
                        }
                    }
                    window.ontouchmove = function (e) {
                        e = e || window.event;
                        if (e.preventDefault) e.preventDefault();

                        e.returnValue = false;
                    }
                    if (prevY == null) prevY = pageXY;
                    if (((Math.round(this._content["scrollTop"]()) == 0) && this._swipe == "down" || ((Math.ceil(this._content["scrollTop"]()) == d.scrollable || Math.ceil(this._content["scrollTop"]()) + 1 == d.scrollable) && this._swipe == "up"))) {
                        this._trigger("scrollEnd", { originalEvent: move.originalEvent, scrollData: move });
                        window.ontouchmove = null;
                    }
                }
            }
            this._trigger("touchStart", { originalEvent: down, direction: (this._swipe == "down" || this._swipe == "right") ? 1 : -1, scrollData: this._scrollData, scrollTop: this.content().scrollTop(), scrollLeft: this.content().scrollLeft() });
            this._on($(document), "mousemove", { d: d, source: "thumb" }, this._mouseMove);
            if (!this._isNativeScroll) this._on($(document), "touchmove", { d: d, source: "thumb" }, this._mouseMove);
            else {
                this._on(this.content(), "touchmove", { d: d, source: "thumb" }, this._touchMove);
            }
            this._on($(document), "mouseup touchend", { d: d, source: "thumb" }, this._mouseUp);
        },

        _touchMove: function (e) {
            this.content().css("cursor", "pointer");
            this._mouseMoved = true;
            this._tempLeft = this.model.targetPane != null ? this.content().find(this.model.targetPane).scrollLeft() : this.content().scrollLeft();
            this._tempTop = this.content().scrollTop();
        },

        _touchDown: function (e) {
            var data;
            if (this._tempLeft != this.scrollLeft()) data = this._scrollXdata;
            else if (this._tempTop != this.scrollTop()) data = this._scrollYdata;
            else data = (!this._scrollYdata) ? this._scrollXdata : this._scrollYdata;
            this._trigger("scrollStop", { source: "thumb" || "custom", originalEvent: e, scrollData: data, scrollTop: this.content().scrollTop(), scrollLeft: this.content().scrollLeft() });
        },

        _speedScrolling: function (e) {
            if (this._mouseMoved) {
                if (this.element.find(".e-vhandle").length > 0) {
                    var scrollTop = this.content().scrollTop();
                    if (this._tempTop !== scrollTop) {
                        this._trigger("thumbMove", { originalEvent: e, direction: (this._swipe == "down" || this._swipe == "right") ? 1 : -1, scrollData: this._scrollData });
                        this._vScrollbar["scroll"](this.content().scrollTop(), "thumb", true, "touchmove");
                        var e = { source: "thumb" || "custom", scrollData: this._vScrollbar ? this._vScrollbar._scrollData : null, scrollTop: this.content().scrollTop(), originalEvent: e };
                        var pixel = (!this._isJquery3) ? e.scrollTop : Math.ceil(e.scrollTop);
                        this.scrollTop(pixel);
                        if (this._trigger("scroll", e)) return;
                    }
                }
                if (this.element.find(".e-hhandle").length > 0) {
                    var contentArea = this.model.targetPane != null ? this.content().find(this.model.targetPane) : this.content();
                    var scrollLeft = contentArea.scrollLeft();
                    if (this._tempLeft !== scrollLeft) {
                        this._trigger("thumbMove", { originalEvent: e, direction: (this._swipe == "down" || this._swipe == "right") ? 1 : -1, scrollData: this._scrollData });
                        this._hScrollbar["scroll"](contentArea.scrollLeft(), "thumb", true, "touchmove");
                        var e = { source: "thumb" || "custom", scrollData: this._hScrollbar ? this._hScrollbar._scrollData : null, scrollLeft: this.content().scrollLeft(), originalEvent: e };
                        var pixel = (!this._isJquery3) ? e.scrollLeft : Math.ceil(e.scrollLeft);
                        this.scrollLeft(pixel);
                        if (this._trigger("scroll", e)) return;
                    }
                }
                this.content().css("cursor", "pointer");
            }
        },

        _scroll: function (e) {
            var dS = [this._vScrollbar ? this._vScrollbar._scrollData : null, this._hScrollbar ? this._hScrollbar._scrollData : null];

            if (this._evtData) var data = this._evtData.d ? this._evtData.d : this._evtData;

            for (var i = 0; i < 2; i++) {
                var d = dS[i];
                if (!d || d.skipChange) continue;
                if (this.model && ((!this.model.targetPane) || (this.model.targetPane && data && data.xy != "X")))
                    d.dimension === "height" ? this.scrollTop(e.target[d.scrollVal]) : this.scrollLeft(e.target[d.scrollVal])
                if (this.model && this.model.targetPane != null && i == 1 && this.content().find(this.model.targetPane).length)
                    d.sTop = this.content().find(this.model.targetPane)[0][d.scrollVal];
                else d.scrollVal == "scrollTop" ? d.sTop = this.scrollTop() : d.sTop = this.scrollLeft();
                this[d.scrollVal](d.sTop);
                if (d.fromScroller) continue;
                if (i === 1) {
                    var content = this.content()[0];
                    if (this._rtlScrollLeftValue && content.scrollWidth - content.clientWidth != this._rtlScrollLeftValue)
                        this._rtlScrollLeftValue = content.scrollWidth - content.clientWidth;
                    d.sTop = (this.model && ej.browserInfo().name != "mozilla" && this.model.enableRTL && !this._hScrollbar._scrollData._scrollleftflag) ? (this._rtlScrollLeftValue == 0 ? (d.sTop * -1) : (d.sTop - this._rtlScrollLeftValue)) : d.sTop;
                    this._hScrollbar["scroll"](d.sTop, "", true);
                } else
                    this._vScrollbar["scroll"](d.sTop, "", true);
                if (dS.length == 2 && i == 1 || dS.length == 1 && i == 0) {
                    this._externalScroller = false;
                    this.model && this._trigger('scroll', { source: "custom", scrollData: this._hScrollbar ? this._hScrollbar._scrollData : null, scrollLeft: this.scrollLeft(), originalEvent: e });
                }
            }
            if (this._isNativeScroll && this.model.enableTouchScroll) this._speedScrolling(e);
            this._UpdateScrollLeftValue(e);
            var proxy = this;
            if (this._vScrollbar && this._scrollYdata && this.model) {
                if ((this._scrollYdata.scrollable - this.model.scrollOneStepBy) >= this.scrollTop()) {
                    if (!$(':hover').filter(this.element[0]).length) proxy._off(ej.getScrollableParents(proxy.wrapper), "scroll", null);
                    if(ej.browserInfo().name != "chrome"){
                        window.onmousewheel = function (args) {
                            if (proxy.model && proxy.model.preventDefault && $(':hover').filter(proxy.element[0]).length) args.preventDefault();
                        }
                    } else {
                        window.addEventListener("wheel", function (args) {
                            if (proxy.model && proxy.model.preventDefault && $(':hover').filter(proxy.element[0]).length) args.preventDefault();
                         },{passive: false});
                    }
                }
            }
        },

        _UpdateScrollLeftValue: function (e) {
            if (this.model && e.type != "touchstart" && e.type != "mousedown" && this.model.enableRTL && this._rtlScrollLeftValue && this.model.scrollLeft != this._previousScrollLeft) {
                this.model.scrollLeft = this._rtlScrollLeftValue - this.model.scrollLeft;
                this._previousScrollLeft = this.model.scrollLeft;
            }
            if ((this.model && e.type == "touchstart" || e.type == "mousedown") && this.model.enableRTL) {
                this.model.scrollLeft = this.content().scrollLeft();
                this.option("scrollLeft", this.content().scrollLeft());
            }
        },

        _changevHandlerPosition: function (top) {
            var scrollbar = this._vScrollbar;
            if (scrollbar) {
                top = scrollbar._scrollData != null && top >= scrollbar._scrollData.scrollable ? scrollbar._scrollData.scrollable : top;
                if (scrollbar != null && top >= 0 && top <= scrollbar._scrollData.scrollable)
                    scrollbar[scrollbar._scrollData.handler].css(scrollbar._scrollData.lPosition, (top / scrollbar._scrollData.onePx) + "px");
            }
        },

        _changehHandlerPosition: function (left) {
            var scrollbar = this._hScrollbar;
            if (scrollbar) {
                left = scrollbar._scrollData != null && left >= scrollbar._scrollData.scrollable ? scrollbar._scrollData.scrollable : left;
                if (scrollbar != null && top >= 0 && left <= scrollbar._scrollData.scrollable)
                    scrollbar[scrollbar._scrollData.handler].css(scrollbar._scrollData.lPosition, (left / scrollbar._scrollData.onePx) + "px");
            }
        },

        _destroy: function () {
            this._off(this.content(), "scrollstop", this._touchDown);
            this._off($(document), "mouseup", this._mouseUpContent);
            this.element.css({ "width": "", "height": "" }).children(".e-vscrollbar,.e-hscrollbar").remove();
            this.content().removeClass("e-content").css({ "width": "", "height": "" });
            this.element.removeClass("e-widget");
        },
        _preventDefault: function (e) {
            e = e || window.event;
            if (e.preventDefault) e.preventDefault();

            e.returnValue = false;
        }
    });
})(jQuery, Syncfusion, window);;
/**
* @fileOverview Plugin to drag the html elements
* @copyright Copyright Syncfusion Inc. 2001 - 2015. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
* @version 12.1 
* @author <a href="mailto:licensing@syncfusion.com">Syncfusion Inc</a>
*/
(function ($, ej, undefined) { 
    ej.widget("ejDraggable", "ej.Draggable", {
        
        element: null,

        
        model: null,
        validTags: ["div", "span", "a"],

        
        defaults: {
            
            scope: 'default', 
            
            handle: null,  
            
            dragArea: null,
            
            clone: false,
            
            distance: 1, 
			
			dragOnTaphold: false,
            
            cursorAt: { top: -1, left: -2 }, 
            
            dragStart: null, 
            
            drag: null, 
            
            dragStop: null, 
			
			create: null,
            
            destroy: null,
            
            autoScroll:false,

            scrollSensitivity: 20,

            scrollSpeed: 20,
            
            helper: function () {
                return $('<div class="e-drag-helper" />').html("draggable").appendTo(document.body);
            }
        },

        
        _init: function () {
            this.handler = function () { },
			this.resizables = {};
            this._wireEvents();
            this._browser = ej.browserInfo();
            this._isIE8 = this._browser.name == "msie" && this._browser.version == "8.0";
            this._isIE9 = this._browser.name == "msie" && this._browser.version == "9.0";
            //e-pinch class enables the touch mode operations in IE browsers
            this._browser.name == "msie" && this.element.addClass("e-pinch");
            this._browser.name == "edge" && this.element.css("touch-action", "none");
        },

        _setModel: function (options) {
            for (var key in options) {
                switch (key) {
                    case "dragArea":
                        this.model.dragArea = options[key];
                        break;
						case "dragOnTaphold":
                        this.model.dragOnTaphold = options[key];
                        break;
                        case "autoScroll":
                        this.model.autoScroll=options[key];
                        break; 
                }
            }
        },
        
        
        _destroy: function () {
            $(document)
                .off(ej.eventType.mouseUp, this._destroyHandler)
                .off(ej.eventType.mouseUp, this._dragStopHandler)
                .off(ej.eventType.mouseMove, this._dragStartHandler)
                .off(ej.eventType.mouseMove, this._dragHandler)
                .off("mouseleave", this._dragMouseOutHandler)
                .off('selectstart', false);

            

            ej.widgetBase.droppables[this.scope] = null;
            
        },

        _initialize: function (e) {
            if( e.target && e.target.nodeName && $( e.target ).closest( "input[type='text'], input[type='checkbox'], textarea, select, option" ).length) return true;
            var ori = e;
			e.preventDefault();
            e = this._getCoordinate(e);
            this.target = $(ori.currentTarget);
            this._initPosition = { x: e.pageX, y: e.pageY };
            
            $(document).on(ej.eventType.mouseMove, this._dragStartHandler).on(ej.eventType.mouseUp, this._destroyHandler);
            if (!this.model.clone) {
                var _offset = this.element.offset();
                this._relXposition = e.pageX - _offset.left;
                this._relYposition = e.pageY - _offset.top;
            }
            $(document.documentElement).trigger(ej.eventType.mouseDown, ori); // The next statement will prevent 'mousedown', so manually trigger it.
           //return false;
        },
        _setDragArea: function () {
            var _dragElement = $(this.model.dragArea)[0]; if (!_dragElement) return;
            var elementArea, elementWidthBound, elementHeightBound, elementArea, direction = ["left", "right", "bottom", "top"], top, left;
            if (!ej.isNullOrUndefined(_dragElement.getBoundingClientRect)) {
                elementArea = _dragElement.getBoundingClientRect();
                elementArea.width ? elementWidthBound = elementArea.width : elementWidthBound = elementArea.right - elementArea.left;
                elementArea.height ? elementHeightBound = elementArea.height : elementHeightBound = elementArea.bottom - elementArea.top;
                for (var j = 0; j < direction.length; j++) {
                    this["border-" + direction[j] + "-width"] = isNaN(parseFloat($($(this.model.dragArea)[0]).css("border-" + direction[j] + "-width"))) ? 0 : parseFloat($($(this.model.dragArea)[0]).css("border-" + direction[j] + "-width"));
                    this["padding-" + direction[j]] = isNaN(parseFloat($($(this.model.dragArea)[0]).css("padding-" + direction[j]))) ? 0 : parseFloat($($(this.model.dragArea)[0]).css("padding-" + direction[j]));
                }
                top = $(this.model.dragArea).offset().top; left = $(this.model.dragArea).offset().left;
            } else {
                elementWidthBound = $(this.model.dragArea).outerWidth();
                elementHeightBound = $(this.model.dragArea).outerHeight();
                for (var j = 0; j < direction.length; j++) {
                    this["border-" + direction[j] + "-width"] = 0;
                    this["padding-" + direction[j]] = 0;
                }
                top = left = 0;
            }
            this._left = ej.isNullOrUndefined($(this.model.dragArea).offset()) ? 0 + this["border-left-width"] + this["padding-left"] : left + this["border-left-width"] + this["padding-left"];
            this._top = ej.isNullOrUndefined($(this.model.dragArea).offset()) ? 0 + this["border-top-width"] + this["padding-top"] : top + this["border-top-width"] + this["padding-top"];
            this._right = left + elementWidthBound - [this["border-right-width"] + this["padding-right"]];
            this._bottom = top + elementHeightBound - [this["border-bottom-width"] + this["padding-bottom"]];
        },
        _dragStart: function (e) {
            var scrollElement;
            if(e.type =="touchmove" || ( e.type =="mousemove" && ((e.buttons !== undefined ? e.buttons : e.which) == 1) || (this._isIE8 || this._isIE9))){
            var ori = e;
            e = this._getCoordinate(e);
            this.margins = {
                left: (parseInt(this.element.css("marginLeft"), 10) || 0),
                top: (parseInt(this.element.css("marginTop"), 10) || 0),
                right: (parseInt(this.element.css("marginRight"), 10) || 0),
                bottom: (parseInt(this.element.css("marginBottom"), 10) || 0)
            };
            this.offset = this.element.offset();
            this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            };
            this.position = this._getMousePosition(ori);
            var x = this._initPosition.x - e.pageX, y = this._initPosition.y - e.pageY;
            var distance = Math.sqrt((x * x) + (y * y));

            if (distance >= this.model.distance) {
			    var ele = this.model.helper({ sender: ori, element: this.target });
				if(!ele || ej.isNullOrUndefined(ele)) return;
                var dragTargetElmnt = this.model.handle = this.helper = ele;
                if (this.model.dragStart) {
                    var currTarget = null;
                    if (ori.type == 'touchmove') {
                        var coor = ori.originalEvent.changedTouches[0];
                        currTarget = document.elementFromPoint(coor.clientX, coor.clientY);
                    }
                    else currTarget = ori.originalEvent.target || ori.target;
					if(this.model.cursorAt["top"] == 0 && this.model.cursorAt["left"] ==0)
						currTarget = this._checkTargetElement(e) || currTarget;   
                    if (this._trigger("dragStart", { event: ori, element: this.element, target: currTarget, currentTarget: this._getCurrTarget(e)})) {
                        this._destroy();
                        return false;
                    }
                }
                if (this.model.dragArea) this._setDragArea();
                else {
                    this._left = this._top = this._right = this._bottom = 0;
                    this["border-top-width"] = this["border-left-width"] = 0;
                }
                
                if (!ej.isNullOrUndefined(dragTargetElmnt) && dragTargetElmnt.length > 0) {
                    var pos = dragTargetElmnt.offsetParent().offset();
                    $(document).off(ej.eventType.mouseMove, this._dragStartHandler).off(ej.eventType.mouseUp, this._destroyHandler)
                        .on(ej.eventType.mouseMove, this._dragHandler).on(ej.eventType.mouseUp, this._dragStopHandler).on("mouseleave", this._dragMouseOutHandler).on("selectstart", false);
                    ej.widgetBase.droppables[this.model.scope] = {
                        draggable: this.element,
                        helper: dragTargetElmnt.css({ position: 'absolute', left: (this.position.left - pos.left), top: (this.position.top - pos.top) }),
                        destroy: this._destroyHandler
                    }
                }
            }
            }
            if(this.model.autoScroll && e.type =="touchmove" || ( e.type =="mousemove" && ((e.buttons !== undefined ? e.buttons : e.which) == 1) || (this._isIE8 || this._isIE9))){
                scrollElement = this._getScrollParent(ori.target);
            }
        },

        _drag: function (e) {
            var left, top, pageX, pageY, scrollElement;
			e.preventDefault();
            this.position = this._getMousePosition(e);
            if (this.position.top < 0)
                this.position.top = 0;
            if ($(document).height() < this.position.top)
                this.position.top = $(document).height();
            if ($(document).width() < this.position.left)
                this.position.left = $(document).width();
            var helperElement = ej.widgetBase.droppables[this.model.scope].helper;
            if (this.model.drag) {
                var currTarget = null;
                if (e.type == 'touchmove') {
                    var coor = e.originalEvent.changedTouches[0];
                    currTarget = document.elementFromPoint(coor.clientX, coor.clientY);
                }
                else currTarget = e.originalEvent.target || e.target;
				if(this.model.cursorAt["top"] == 0 && this.model.cursorAt["left"] ==0 )
                    currTarget = this._checkTargetElement(e)|| currTarget; 
                var eventArgs = { event: e, element: this.target, target: currTarget, currentTarget: this._getCurrTarget(e), position: { left: null, top: null } };
                this._trigger("drag", eventArgs);// Raise the dragging event
            }
            var element = this._checkTargetElement(e);
            if (!ej.isNullOrUndefined(element)) {
                e.target = e.toElement = element;
                element.object._over(e); 
                this._hoverTarget = element; 
            }
            else if (this._hoverTarget) {
                e.target = e.toElement = this._hoverTarget;
                this._hoverTarget.object._out(e);
                this._hoverTarget = null;
            }
            var helperElement = ej.widgetBase.droppables[this.model.scope].helper;
			var pos= helperElement.offsetParent().offset();			 
            pageX = (ej.isNullOrUndefined(e.pageX) || e.pageX === 0 && e.type == "touchmove") ? e.originalEvent.changedTouches[0].pageX : e.pageX;
            pageY = (ej.isNullOrUndefined(e.pageY) || e.pageY === 0 && e.type == "touchmove") ? e.originalEvent.changedTouches[0].pageY : e.pageY;
            if (this.model.dragArea) {
                if (this._pageX != pageX) {
                    if (this._left > this.position.left) left = this._left;
                    else if (this._right < this.position.left + helperElement.outerWidth(true)) left = this._right - helperElement.outerWidth(true);
                    else left = this.position.left;
                }
                if (this._pageY != pageY) {
                    if (this._top > this.position.top) top = this._top;
                    else if (this._bottom < this.position.top + helperElement.outerHeight(true)) top = this._bottom - helperElement.outerHeight(true);
                    else top = this.position.top;
                }
            }
            else {
                left = this.position.left;
                top = this.position.top;
            }
            if (top < 0 || top - [pos.top + this["border-top-width"]] < 0) top = [pos.top + this["border-top-width"]];
            if (left < 0 || left - [pos.left + this["border-left-width"]] < 0) left = [pos.left + this["border-left-width"]];
            left = (eventArgs && eventArgs.position && eventArgs.position.left) ? eventArgs.position.left : left;
            top = (eventArgs && eventArgs.position && eventArgs.position.top) ? eventArgs.position.top : top;
            helperElement.css({ left: (eventArgs && eventArgs.position && eventArgs.position.left) ? left : left - [pos.left + this["border-left-width"]], top: (eventArgs && eventArgs.position && eventArgs.position.top) ? top : top - [pos.top + this["border-top-width"]] });
            this.position.left = left;
            this.position.top = top;
            this._pageX = pageX;
            this._pageY = pageY;

            if(this.model.autoScroll){
               
                if(scrollElement && scrollElement != document && scrollElement.tagName != "HTML"){

                    if($(scrollElement).offset().top + scrollElement.clientHeight - pageY < this.model.scrollSensitivity){
                        scrollElement.scrollTop = scrollElement.scrollTop + this.model.scrollSpeed;
                    } else if(pageY - $(scrollElement).offset().top < this.model.scrollSensitivity){
                        scrollElement.scrollTop = scrollElement.scrollTop - this.model.scrollSpeed;
                    }
                    
                    if($(scrollElement).offset().left + scrollElement.clientWidth - pageX < this.model.scrollSensitivity){
                        scrollElement.scrollLeft = scrollElement.scrollLeft + this.model.scrollSpeed;
                    } else if(pageX - $(scrollElement).offset().left < this.model.scrollSensitivity){
                        scrollElement.scrollLeft = scrollElement.scrollLeft + this.model.scrollSpeed;
                    } 

               }

              else{
                if (pageY - $(document).scrollTop() < this.model.scrollSensitivity) {
                    $(document).scrollTop($(document).scrollTop() - this.model.scrollSpeed);
                } else if ($(window).height() - (pageY - $(document).scrollTop()) < this.model.scrollSensitivity) {
                    $(document).scrollTop($(document).scrollTop() + this.model.scrollSpeed);
                }
                
                if (pageX - $(document).scrollLeft() < this.model.scrollSensitivity) {
                     $(document).scrollLeft($(document).scrollLeft() - this.model.scrollSpeed);
                } else if ($(window).width() - (pageX - $(document).scrollLeft()) < this.model.scrollSensitivity) {
                     $(document).scrollLeft($(document).scrollLeft() + this.model.scrollSpeed);
                }
            }
           
        }
        },

        _dragStop: function (e) {
            if (e.type == 'mouseup' || e.type == 'touchend') 
                this._destroy(e);
            if (this.model.dragStop) {
                var currTarget = null;
                if (e.type == 'touchend') {
                if(this.model.cursorAt["top"] == 0 && this.model.cursorAt["left"] ==0)
				currTarget = e.originalEvent.target || e.target;  
                else{
                    var coor = e.originalEvent.changedTouches[0];
                    currTarget = document.elementFromPoint(coor.clientX, coor.clientY);
                }  
                }
                else currTarget = e.originalEvent.target || e.target;                
                if(this.model.cursorAt["top"] == 0 && this.model.cursorAt["left"] ==0)
                    currTarget = this._checkTargetElement(e) || currTarget;              
                this._trigger("dragStop", { event: e, element: this.target, target: currTarget, currentTarget: this._getCurrTarget(e) });// Raise the dragstop event
            }
            this._dragEnd(e);
        },
        _dragEnd: function (e) {
            var element = this._checkTargetElement(e);
            if (!ej.isNullOrUndefined(element)) {
                e.target = e.toElement = element;
                element.object._drop(e, this.element);
            }
        },

        _dragMouseEnter: function (e) {
            $(document).off("mouseenter", this._dragMouseEnterHandler);
            if (this._isIE9)
                this._dragManualStop(e);
            else if (this._isIE8) {
                if (e.button == 0)
                    this._dragManualStop(e);
            }
            else if (e.buttons == 0)
                this._dragManualStop(e);
        },

        _dragManualStop: function (e) {
            if (this.model.dragStop != null)
                this._trigger("dragStop", { event: e, element: this.target, target: e.originalEvent.target || e.target, currentTarget: this._getCurrTarget(e) });  // Raise the dragstop event
            this._destroy(e);
        },

        _dragMouseOut: function (e) {
            $(document).on("mouseenter", this._dragMouseEnterHandler);
        },

        _checkTargetElement:function(e)
        {
            var target ;
			if (e.type == "touchmove" || e.type == "touchstart" || e.type == "touchend" || e.type=="taphold") {
				var coor = e.originalEvent.changedTouches[0];
				target = document.elementFromPoint(coor.clientX, coor.clientY);
			}
			else
				target = e.target;
            if (this.helper && this._contains(this.helper[0], target)) {
                this.helper.hide();
                target = this._elementUnderCursor(e);
                this.helper.show();
                return this._withDropElement(target);
            }
            return this._withDropElement(target);
        },
        _getCurrTarget: function(e) {
            var target = (e.originalEvent && e.originalEvent.target) || e.target;
            if(!ej.isNullOrUndefined(target.style)){
            var styleVal = target.style.display;
            if (this.element.is(target))
                target.style.display = "none";
			var currTarget = null;
			if((!ej.isNullOrUndefined(e.pageX)) && !(ej.isNullOrUndefined(e.pageY)))
				currTarget = document.elementFromPoint(e.pageX, e.pageY);
            target.style.display = styleVal;
            return currTarget;
            }
        },
        _withDropElement:function(target)
        {
            if (target) {
                var dropObj = $(target).data('ejDroppable');
                if (ej.isNullOrUndefined(dropObj)) dropObj = this._checkParentElement($(target));
                if (!ej.isNullOrUndefined(dropObj)) {
                    return $.extend(target, { object: dropObj });
                }
            }
        },
        _checkParentElement: function (element) {
            var target = $(element).closest('.e-droppable');
            if (target.length > 0) {
                var dropObj = $(target).data('ejDroppable');
                if (!ej.isNullOrUndefined(dropObj)) return dropObj;
            }
        },
        _elementUnderCursor:function(e){
            if(e.type == "touchmove" || e.type == "touchstart" || e.type == "touchend" || e.type=="taphold")
                return document.elementFromPoint(e.originalEvent.changedTouches[0].clientX, e.originalEvent.changedTouches[0].clientY);
            else return document.elementFromPoint(e.clientX, e.clientY);
        },
        _contains:function(parent, child) {
            try {
                return $.contains(parent, child) || parent == child;
            } catch (e) {
                    return false;
                }
        },
        _wireEvents: function () {
			if(ej.isDevice()==true && this.model.dragOnTaphold==true)
            this._on(this.element, "taphold", this._initialize);
		else
            this._on(this.element, ej.eventType.mouseDown, this._initialize);
            this._dragStartHandler = $.proxy(this._dragStart, this);
            this._destroyHandler = $.proxy(this._destroy, this);
            this._dragStopHandler = $.proxy(this._dragStop, this);
            this._dragHandler = $.proxy(this._drag, this);
            this._dragMouseEnterHandler = $.proxy(this._dragMouseEnter, this);
            this._dragMouseOutHandler = $.proxy(this._dragMouseOut, this);
        },
        _getMousePosition: function (event) {
            event = this._getCoordinate(event);
            var pageX = this.model.clone ? event.pageX : event.pageX - this._relXposition;
            var pageY = this.model.clone ? event.pageY : event.pageY - this._relYposition;
            return { left: pageX - [this.margins.left + this.model.cursorAt.left ], top: pageY - [this.margins.top + this.model.cursorAt.top ] };
        },
        _getCoordinate: function (evt) {
            var coor = evt;
            if (evt.type == "touchmove" || evt.type == "touchstart" || evt.type == "touchend" || evt.type== "taphold" && ej.browserInfo().name !="msie")
                coor = evt.originalEvent.changedTouches[0];
            return coor;
        },
        _getScrollParent: function(node){
            if (node && node.scrollHeight > node.clientHeight){
                return node;
            } else if(node && node.parentNode){
                return this._getScrollParent(node.parentNode) ;
            }
        }
    });

})(jQuery, Syncfusion);

/**
* @fileOverview Plugin to drop the html elements
* @copyright Copyright Syncfusion Inc. 2001 - 2015. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
* @version 12.1 
* @author <a href="mailto:licensing@syncfusion.com">Syncfusion Inc</a>
*/
(function ($, ej, undefined) { 
    ej.widget("ejDroppable", "ej.Droppable", {
        
        element: null,        
        model: null,
        validTags: ["div", "span", "a"],
        dropElements : [],
        defaults: {
            
            accept: null,
            
            scope: 'default',
            
            drop: null,
            
            over: null,
            
            out: null,
			
			create: null,
            
            destroy: null
        },

        
        _init: function () {
            this._mouseOver = false;
			this.dropElements.push(this);
        },

        _setModel: function (options) {

        },
        
        
        _destroy: function () {
			 $(this.element).off('mouseup', $.proxy(this._drop, this));
        },

        _over: function (e) {
            if (!this._mouseOver) {
                this._trigger("over", e);
                this._mouseOver = true;
            }
        },
        _out: function (e) {
            if (this._mouseOver) {
                this._trigger("out", e);
                this._mouseOver = false;
            }
        },
        _drop: function (e, dragElement) {
			var _target = e.target; 
			var _parents = $(_target).parents(".e-droppable");
			if($(_target).hasClass("e-droppable")) _parents.push(_target);
			for (var i =0; i< this.dropElements.length; i++ ){
				if ($(_parents).is($(this.dropElements[i].element)))
					this.dropElements[i]._dropEvent.call( this.dropElements[i], e, dragElement );
			}
        },
		_dropEvent : function (e, dragElement){
			var drag = ej.widgetBase.droppables[this.model.scope];
            var isDragged = !ej.isNullOrUndefined(drag.helper) && drag.helper.is(":visible");
			if(isDragged && e.type == "touchend") $(drag.helper).hide();
            var area = this._isDropArea(e);
			if(isDragged && e.type == "touchend") $(drag.helper).show();
            if (drag && !ej.isNullOrUndefined(this.model.drop) && isDragged && area.canDrop) {
                this.model.drop($.extend(e, { dropTarget: area.target , dragElement : dragElement }, true), drag);
            }
		},
        _isDropArea: function (e) {
            // check for touch devices only
            var area = { canDrop: true, target: $(e.target) };
            if (e.type == "touchend") {
                var coor = e.originalEvent.changedTouches[0], _target;
                _target = document.elementFromPoint(coor.clientX, coor.clientY);
                area.canDrop = false;
                var _parents = $(_target).parents();

                for (var i = 0; i < this.element.length; i++) {
                    if ($(_target).is($(this.element[i]))) area = { canDrop: true, target: $(_target) };
                    else for (var j = 0; j < _parents.length; j++) {
                        if ($(this.element[i]).is($(_parents[j]))) {
                            area = { canDrop: true, target: $(_target) };
                            break;
                        }
                    }
                    if (area.canDrop) break;
                }
            }
            return area;
        }
    });

})(jQuery, Syncfusion);

/**
* @fileOverview Plugin to resize the Html elements
* @copyright Copyright Syncfusion Inc. 2001 - 2015. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
* @version 12.1 
* @author <a href="mailto:licensing@syncfusion.com">Syncfusion Inc</a>
*/
(function ($, ej, undefined) { 
    ej.widget("ejResizable", "ej.resizable", {
        
        element: null,        
        model: null,
        validTags: ["div", "span", "a"],
        
        defaults: {
            
            scope: 'default',
            
            handle: null,
            
            distance: 1,
            
            maxHeight: null,
            
            maxWidth: null,
            
            minHeight: 10,
            
            minWidth: 10,
            
            cursorAt: { top: 1, left: 1 },
            
            resizeStart: null,
            
            resize: null,
            
            resizeStop: null,
			
			create: null,
            
            destroy: null,
            
            helper: function () {
                return $('<div class="e-resize-helper" />').html("resizable").appendTo(document.body);
            }
        },
        
        _init: function () {
            this.target = this.element;
            this._browser = ej.browserInfo();
            this._isIE8 = this._browser.name == "msie" && this._browser.version == "8.0";
            this._isIE9 = this._browser.name == "msie" && this._browser.version == "9.0";
            if (this.handle != null) {
                $(this.target).delegate(this.handle, ej.eventType.mouseDown, $.proxy(this._mousedown, this))
                .delegate(this.handle, 'resizestart', this._blockDefaultActions);
            }
            else {
                $(this.target).on(ej.eventType.mouseDown, $.proxy(this._mousedown, this));                                
            }
            this._resizeStartHandler = $.proxy(this._resizeStart, this);
            this._destroyHandler = $.proxy(this._destroy, this);
            this._resizeStopHandler = $.proxy(this._resizeStop, this);
            this._resizeHandler = $.proxy(this._resize, this);
            this._resizeMouseEnterHandler = $.proxy(this._resizeMouseEnter, this);
        },
        _mouseover: function (e) {
            if ($(e.target).hasClass("e-resizable")) {
                $(e.target).css({ cursor: "se-resize" });
                $(this.target).on(ej.eventType.mouseDown, $.proxy(this._mousedown, this));
            }
            else {
                $(this.target).off(ej.eventType.mouseDown);
                $(this.target).css({ cursor: "" });
            }
        },
        _blockDefaultActions: function (e) {
            e.cancelBubble = true;
            e.returnValue = false;
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
        },
        _setModel: function (options) {

        },
        _mousedown: function (e) {
            var ori = e;
            e = this._getCoordinate(e);
            this.target = $(ori.currentTarget);
            this._initPosition = { x: e.pageX, y: e.pageY };
            this._pageX = e.pageX;
            this._pageY = e.pageY;

            $(document).on(ej.eventType.mouseMove, this._resizeStartHandler).on(ej.eventType.mouseUp, this._destroyHandler);

            $(document.documentElement).trigger(ej.eventType.mouseDown, ori); // The next statement will prevent 'mousedown', so manually trigger it.
            return false;
        },

        _resizeStart: function (e) {
            if ($(e.target).hasClass("e-resizable")) {
                e = this._getCoordinate(e);
                var x = this._initPosition.x - e.pageX, y = this._initPosition.y - e.pageY, _width, _height;
                var distance = Math.sqrt((x * x) + (y * y));
                if (distance >= this.model.distance) {
                    if (this.model.resizeStart != null) 
                        if (this._trigger("resizeStart", { event: e, element: this.target }))  // Raise the resize start event
                            return;
                    var resizeTargetElmnt = this.model.helper({ element: this.target });
                    _width = (e.pageX - this._pageX) + resizeTargetElmnt.outerWidth();
                    _height = (e.pageY - this._pageY) + resizeTargetElmnt.outerHeight();
                    this._pageX = e.pageX;
                    this._pageY = e.pageY;
                    var pos = this.getElementPosition(resizeTargetElmnt);
                    $(document).off(ej.eventType.mouseMove, this._resizeStartHandler).off(ej.eventType.mouseUp, this._destroyHandler)
                        .on(ej.eventType.mouseMove, this._resizeHandler).on(ej.eventType.mouseUp, this._resizeStopHandler).on("mouseenter", this._resizeMouseEnterHandler).on("selectstart", false);
                    ej.widgetBase.resizables[this.scope] = {
                        resizable: this.target,
                        helper: resizeTargetElmnt.css({ width: _width, height: _height }),
                        destroy: this._destroyHandler
                    }
                }
            }
        },

        _resize: function (e) {
            var _width, _height, _diff;
            e = this._getCoordinate(e);
            var pos = this.getElementPosition(ej.widgetBase.resizables[this.scope].helper);
            var resizeTargetElmnt = this.model.helper({ element: this.target });
            _width = (e.pageX - this._pageX) + resizeTargetElmnt.outerWidth();
            _height = (e.pageY - this._pageY) + resizeTargetElmnt.outerHeight();
            this._pageX = e.pageX;
            this._pageY = e.pageY;
            if (_width < this.model.minWidth) {
                _diff = this.model.minWidth - _width;
                _width = this.model.minWidth;
                this._pageX = e.pageX + _diff;
            }
            if (_height < this.model.minHeight) {
                _diff = this.model.minHeight - _height;
                _height = this.model.minHeight;
                this._pageY = e.pageY + _diff;
            }
            if (this.model.maxHeight != null && _height > this.model.maxHeight) {
                _diff = _height - this.model.maxHeight;
                _height = this.model.maxHeight;
                this._pageY = e.pageY - _diff;
            }
            if (this.model.maxWidth != null && _width > this.model.maxWidth) {
                _diff = _width - this.model.maxWidth;
                _width = this.model.maxWidth;
                this._pageX = e.pageX - _diff;
            }
            ej.widgetBase.resizables[this.scope].helper.css({ width: _width, height: _height });
            this._trigger("resize", { element: this.target }) // Raise the resize event
        },

        _resizeStop: function (e) {
            if (this.model.resizeStop != null)
                this._trigger("resizeStop", { element: this.target });  // Raise the resize stop event
            if (e.type == 'mouseup' || e.type == 'touchend')
                this._destroy(e);
        },

        _resizeMouseEnter: function (e) {
            if (this._isIE9)
                this._resizeManualStop(e);
            else if (this._isIE8) {
                if (e.button == 0)
                    this._resizeManualStop(e);
            }
            else if (e.buttons == 0)
                this._resizeManualStop(e);
        },

        _resizeManualStop: function (e) {
            if (this.model.resizeStop != null)
                this._trigger("resizeStop", { element: this.target });  // Raise the resize stop event
            this._destroy(e);
        },

        
        _destroy: function (e) {
            $(document)
                .off(ej.eventType.mouseUp, this._destroyHandler)
                .off(ej.eventType.mouseUp, this._resizeStopHandler)
                .off(ej.eventType.mouseMove, this._resizeStartHandler)
                .off(ej.eventType.mouseMove, this._resizeHandler)
                .off("mouseenter", this._resizeMouseEnterHandler)
                .off('selectstart', false);            
            ej.widgetBase.resizables[this.scope] = null;
            
        },

        getElementPosition: function (elemnt) {
            if (elemnt != null && elemnt.length > 0)
                return {
                    left: elemnt[0].offsetLeft,
                    top: elemnt[0].offsetTop
                };
            else
                return null;
        },
        _getCoordinate: function (evt) {
            var coor = evt;
            if (evt.type == "touchmove" || evt.type == "touchstart" || evt.type == "touchend")
                coor = evt.originalEvent.changedTouches[0];
            return coor;
        }
    });

})(jQuery, Syncfusion);;

/**
* @fileOverview Plugin to style the Dialog control
* @copyright Copyright Syncfusion Inc. 2001 - 2015. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
* @version 12.1 
* @author <a href="mailto:licensing@syncfusion.com">Syncfusion Inc</a>
*/
(function ($, ej, undefined) {

    ej.widget("ejDialog", "ej.Dialog", {
        _rootCSS: "e-dialog",

        element: null,
        _ignoreOnPersist: ["drag", "dragStart", "dragStop", "resizeStop", "resizeStart", "resize", "beforeClose", "beforeOpen", "collapse", "expand", "close", "open", "destroy", "create", "ajaxSuccess", "ajaxError", "contentLoad", "actionButtonClick", "enableResize"],

        model: null,
        validTags: ["div", "span"],
        _setFirst: false,
        angular: {
            terminal: false
        },

        defaults: {

            showOnInit: true,

            closeOnEscape: true,

            //currently we have deprecated this API
            closeIconTooltip: "close",

            enableAnimation: true,

            allowDraggable: true,

            backgroundScroll: true,

            height: "auto",

            minHeight: 120,

            minWidth: 200,

            maxHeight: null,

            maxWidth: null,

            enableModal: false,

            position: { X: "", Y: "" },

            containment: null,

            enableResize: true,

            htmlAttributes: {},

            showHeader: true,

            showFooter: false,

            contentType: null,

            contentUrl: null,

            ajaxSettings: {

                type: 'GET',

                cache: false,

                data: {},

                dataType: "html",

                contentType: "html",

                async: true
            },

            title: "",

            width: 400,

            zIndex: 1000,

            cssClass: "",

            enableRTL: false,

            allowKeyboardNavigation: true,

            showRoundedCorner: false,

            actionButtons: ["close"],

            animation:{
                show:{
                    effect:"fade",
                    duration:400
                },
                hide:{
                    effect:"fade",
                    duration:400
                }
            },            

            tooltip:{
                close: "Close",
                collapse: "Collapse",
                restore: "Restore",
                maximize: "Maximize",
                minimize: "Minimize",
                expand: "Expand",
                unPin: "UnPin",
                pin: "Pin"
            },

            footerTemplateId: null,
            
            locale:"en-US",
            
            faviconCSS: null,

            content: null,

            target: null,

            enablePersistence: false,

            enabled: true,

            isResponsive: false,

            actionButtonClick: null,

            beforeClose: null,

            close: null,            

            expand: null,

            collapse: null,

            beforeOpen: null,

            open: null,

            drag: null,

            dragStart: null,

            dragStop: null,

            resize: null,

            resizeStart: null,

            resizeStop: null,

            contentLoad: null,

            ajaxSuccess: null,

            ajaxError: null,

            create: null,

            destroy: null,

            /*Deprecated*/            
            Close:null
        },

        dataTypes: {
            showOnInit: "boolean",
            closeOnEscape: "boolean",
            enableAnimation: "boolean",
            backgroundScroll: "boolean",
            position: "data",
            animation:"data",
            closeIconTooltip: "string",
            tooltip: "data",
            allowDraggable: "boolean",
            enableModal: "boolean",
            enableResize: "boolean",
            isResponsive: "boolean",
            showHeader: "boolean",
            showFooter: "boolean",
            title: "string",
            faviconCSS:"string",
            zIndex: "number",
            cssClass: "string",
            enablePersistence: "boolean",
            contentUrl: "string",
            contentType: "string",
            enableRTL: "boolean",
            enabled: "boolean",
            allowKeyboardNavigation: "boolean",
            showRoundedCorner: "boolean",
            locale: "string",
            htmlAttributes: "data",
            ajaxSettings: "data",
            actionButtons: "array",
			footerTemplateId: "string"
        },

        _setModel: function (options) {
            for (var key in options) {
                switch (key) {
                    case "closeIconTooltip": this._dialogClose.attr("title", options[key]); break;
                    case "tooltip": this._tooltipText(options[key]); break;
                    case "title":
                        this.model.title = options[key];
                        if (this._ejDialog.find("span.e-title").length <= 0) 
                            this._addTitleText();
                        else
                            this._ejDialog.find("span.e-title").html(options[key]);
                        this._updateCaptionWidth();
                        break;
                    case "width": this.model.width = options[key]; this._changeSize(); this._updateCaptionWidth(); options[key] = this.model.width; break;
                    case "height": this.model.height = options[key]; this._changeSize(); options[key] = this.model.height; break;
                    case "position": this.model.position = options[key]; this._dialogPosition(); break;
                    case "cssClass": this._changeSkin(options[key]); break;
                    case "showRoundedCorner": this.model.showRoundedCorner=options[key]; this._roundedCorner(options[key]); break;
                    case "contentType": { this.model.contentType = options[key]; this._appendContent(options[key]); break; }
                    case "enabled": { this.model.enabled = options[key]; this._enabledAction(options[key]); break; }
                    case "contentUrl": { this.model.contentUrl = options[key]; this._appendContent(this.model.contentType); break; }
					case "backgroundScroll":
						this.model.backgroundScroll = options[key]; 
						if (!this.model.backgroundScroll && this.model.enableModal) $("body").addClass("e-dialog-modal");
						else $("body").removeClass("e-dialog-modal");
						break;
                    case "content":
                    case "target": 
                        this._ejDialog.appendTo($(options[key]));
                        this.model.target = this.model.content = options[key];
                        this._dialogPosition();
                        break;
                    case "containment":
                        this._setDragArea(options[key]);
                        !ej.isNullOrUndefined(this._target) ? this._ejDialog.appendTo(this._target) : this._ejDialog.appendTo(document.body);
                        this.model.position.X = this.model.position.Y = "";
                        this._dialogPosition();
                        this.model.containment = options[key] = this._target;
                        this.model.enableModal && this._createOverlay();
                        this._dialogTitlebar.ejDraggable({ dragArea: this._target });
                        break;
                    case "locale":
					    this.model.locale = options[key];
                        this.localizedLabels = this._getLocalizedLabels(); 
                        this._setLocaleCulture(this.localizedLabels, true);
                        this._tooltipText(this.model.tooltip);
						if (this._ejDialog.find("span.e-title").length <= 0) 
                            this._addTitleText();
                        else
                            this._ejDialog.find("span.e-title").html(this.model.title);
                        this._updateCaptionWidth();                       				
                        break;
                    case "minHeight": { this.model.minHeight = options[key]; this._ejDialog.css("minHeight", options[key]); this._minMaxValidation(); this._resetScroller(); this._resizeDialog(); break; }
                    case "minWidth": { this.model.minWidth = options[key]; this._ejDialog.css("minWidth", options[key]); this._minMaxValidation(); this._resetScroller(); this._resizeDialog(); break; }
                    case "maxHeight": { this.model.maxHeight = options[key]; this._ejDialog.css("maxHeight", options[key]); this._minMaxValidation(); this._resetScroller(); this._resizeDialog(); break; }
                    case "maxWidth": { this.model.maxWidth = options[key]; this._ejDialog.css("maxWidth", options[key]); this._minMaxValidation(); this._resetScroller(); this._resizeDialog(); break; }
                    case "zIndex": { this._ejDialog.css('z-index', options[key]); break; }
                    case "faviconCSS":
                        this.model.faviconCSS = options[key]; this._favIcon();this._updateCaptionWidth(); break;
                    case "isResponsive": {
                        this.model.isResponsive = options[key];
                        this.model.isResponsive ? this._ejDialog.addClass("e-dialog-resize") : this._ejDialog.removeClass("e-dialog-resize");
                        this._wireResizing();
                        break;
                    }
                    case "allowDraggable": {
                        this.model.allowDraggable = options[key];
                        if (options[key])
                            this._enableDrag();
                        else {
                            this._dialogTitlebar.removeClass("e-draggable");
                        }
                        break;
                    }
                    case "enableResize": {
                        this.model.enableResize = options[key];
                        if (options[key])
                            this._enableResize();
                        else {
                            this._ejDialog.removeClass("e-resizable");
                            this._ejDialog.find(".e-resize-handle").remove();
                        }
                        this._reRenderScroller();
                        break;
                    }
                    case "showHeader": {
                        this.model.showHeader = options[key];
                        if (options[key]) {
                            this._renderTitleBar();
                            this._iconsRender(this.model.actionButtons);
                            if (this.model.faviconCSS) { this._dialogFavIcon = false; this._favIcon(); }
                            this._enableDrag();
                            if (!this._maximize) this._updateScroller((!ej.isNullOrUndefined(this.contentDiv)) ? (this.contentDiv.css('border-width') == "0px") : false ? (this._ejDialog.outerHeight(true) - (this._dialogTitlebar.outerHeight(true))) : this._ejDialog.outerHeight(true) - 1 - (this._dialogTitlebar.outerHeight(true)), (!ej.isNullOrUndefined(this.contentDiv)) ? (this.contentDiv.css('border-width') == "0px") : false ? this._ejDialog.width() : this._ejDialog.width() - 2);
                        }
                        else {
                            this._ejDialog.find(".e-titlebar").remove();
                            this._maximize ? this.refresh() : this._updateScroller((!ej.isNullOrUndefined(this.contentDiv)) ? (this.contentDiv.css('border-width') == "0px") : false ? this._ejDialog.outerHeight(true) : this._ejDialog.outerHeight(true) - 1, (!ej.isNullOrUndefined(this.contentDiv)) ? (this.contentDiv.css('border-width') == "0px") : false ? this._ejDialog.width() : this._ejDialog.width() - 2);
                        }
                        this._roundedCorner(this.model.showRoundedCorner);
                        if (this.model.showFooter) this._setContainerSize()._resetScroller();
                        break;
                    }
                    case "showFooter": {
                        this.model.showFooter = options[key];
                        if (options[key]) {
                            this._appendContent();
                            this._ejDialog.find(".e-resizable").remove();
                        }
                        else 
                            this._ejDialog.find(".e-footerbar").remove();
                        this._enableResize()._enableDrag()._sizeInPercent();
                        this._reRenderScroller();
                        this._setContainerSize()._resetScroller();
                        this._roundedCorner(this.model.showRoundedCorner);
                        break;
                    }
                    case "footerTemplateId": {
                        this.model.footerTemplateId = options[key];
                        if (this.model.showFooter) {
                            this._ejDialog.find(".e-footerbar").empty();
                            var templateContent = $('body').find("#" + this.model.footerTemplateId).html();
                            this._dialogFooterbar.append(templateContent);
                            this._enableResize();
                        }
                        break;
                    }
                    case "enableRTL":
                        {
                            this.model.enableRTL = options[key];
                            if (this.model.faviconCSS) this._favIcon();
                            if (options[key]) {
                                this._ejDialog.addClass("e-rtl");
                                this.iframe && this.iframe.contents().find("body").css("direction", "rtl");
                                if (this.scroller) 
                                    this._resetScroller();
                            } else {
                                this._ejDialog.removeClass("e-rtl");
                                this.iframe && this.iframe.contents().find("body").css("direction", "ltr");
                                if (this.scroller) 
                                    this._resetScroller();
                            }
                            break;
                        }
                    case "actionButtons":
                        {
                            if (!ej.isNullOrUndefined(this._dialogTitlebar) ){
                                this._removeAllIcons();
                                this._iconsRender(options[key]);
                            }
                            this.model.actionButtons = options[key];
                            this._updateCaptionWidth();
                            break;
                        }
                    case "enableModal": {
                        this._enableModal(options[key]);
                        break;
                    }
                    case "htmlAttributes": this._addAttr(options[key]); break;
                }
            }
        },


        _destroy: function () {
            if (this._overLay) this._overLay.remove();
            this._cloneElement.appendTo(this._ejDialog.parent());
            this._ejDialog.remove();
            if (this.model.enableAnimation) this._ejDialog.stop();
            this._cloneElement.removeClass("e-dialog");
            this.element = this._cloneElement;
            this._isOpen = false;
            $(window).off("resize", $.proxy(this._reSizeHandler, this));
        },

        keyConfigs: [37, 38, 39, 40],

        _init: function () {
			this._init=true;
            this._widthPercent = null;
            this._heightPercent = null;
            this._windowSize = { outerWidth: $(window).outerWidth(), outerHeight: $(window).outerHeight() };
            this._initSize = { width: this.model.width, height: this.model.height };
            this._sizeType = { width: isNaN(this.model.width) ? this.model.width.match(/px|%|auto/g)[0] : null, height: isNaN(this.model.height) ? this.model.height.match(/px|%|auto/g)[0] : null };
            this._isOpen = this._maximize = this._minimize = false;
            this.localizedLabels = this._getLocalizedLabels(); 
            this._setLocaleCulture(this.localizedLabels);
            this._setDimension();
            if (!this.model.close) this.model.close = this.model.Close;
            if (!this.model.target) this.model.target = this.model.content;
			this._responsive();
            this._renderControl();
            this._wireEvents();    
            this.scrObj= this._ejDialog.closest(".e-dialog.e-js").data("ejDialog")
            if(this.scrObj) this.scrObj._resetScroller(); 
			this.hidden=false;			
            this._init=false;
            this._keyNavigation=false;	
        },
		
		_responsive: function () {
            this.width = this.model.width;
            $(this.element).width(this.width);

            this.height = this.model.height;
            $(this.element).height(this.height);
            $(window).on("resize", $.proxy(this._resizeHandler, this));
        },
        
        _resizeHandler: function () {
            if (this._maximize) {
                this.width = $(this._dialogTitlebar).outerWidth();
                $(this.contentDiv).width(this.width);
                $(this.contentDiv).children().width(this.width);

                this.model.height = this.height = $(window).height();
                this._ejDialog.css({ height: this.height });
                this.contentDiv.height(this._ejDialog.height() - $(this._dialogTitlebar).outerHeight() - $(this._dialogFooterbar).outerHeight());
                this.element.height(this.contentDiv.height());
            }
			if(!ej.isNullOrUndefined(this.element) && !this._collapsible) this._resetScroller();
        },
       
        _setLocaleCulture:function(localizedLabels, isSetModel){
            //Deprecated closeIconTooltip locale
            if(this.defaults.closeIconTooltip===this.model.closeIconTooltip)
                this.model.closeIconTooltip=localizedLabels.closeIconTooltip;
			
                if (isSetModel) {	
                 	 this.model.tooltip= this.localizedLabels.tooltip ;
                     this.model.title= this.localizedLabels.title;			 
				} 
				if(JSON.stringify(this.model.tooltip) === JSON.stringify(this.defaults.tooltip))
                this.model.tooltip=localizedLabels.tooltip;  				
				if(this.model.title === this.defaults.title)
				this.model.title=localizedLabels.title;  
        },

        _setDragArea: function (value) {
            if (!ej.isNullOrUndefined(value))
            {
                if (typeof value == "string") {
                    if (value == "parent") this._target = $(this.element).parent();
                    if (value.toLowerCase() == "document") this._target = $(document);
                    if (value.toLowerCase() == "window") this._target = $(window);
                    else if ($(value).length > 0) this._target = $(value);
                } else if (typeof value == "object") {
                    if (value.length > 0) this._target = value;
                }
                else this._target = null;
            } else this._target = null;
        },
        _addAttr: function (htmlAttr) {
            var proxy = this;
            $.map(htmlAttr, function (value, key) {
                if (key == "class") proxy._ejDialog.addClass(value);
                else if (key == "disabled" && value == "disabled") { proxy.model.enabled = false; proxy._enabledAction(false); }
                else{
					if(proxy._ejDialog[0].hasAttribute("style")){
					 var newValue = proxy._ejDialog[0].getAttribute("style") + value;
					 proxy._ejDialog.attr(key, newValue);
					}					
				} 
            });
        },
        _tooltipText: function(data){
            $.extend(this.model.tooltip, data);
            if(!ej.isNullOrUndefined(this._dialogClose) && this._dialogClose.hasClass('e-close'))
                this._dialogClose.attr("title", this.model.tooltip.close);
            if (!ej.isNullOrUndefined(this._dialogCollapsible) && (data.collapse || data.expand)) {
                if (this._dialogCollapsible.hasClass('e-arrowhead-up'))
                    this._dialogCollapsible.attr("title", this.model.tooltip.collapse);
                if (this._dialogCollapsible.hasClass('e-arrowhead-down'))
                    this._dialogCollapsible.attr("title", this.model.tooltip.expand);
            }
            if (!ej.isNullOrUndefined(this._dialogMaximize) && (data.maximize || data.restore)) {
                if (this._dialogMaximize.hasClass('e-maximize'))
                    this._dialogMaximize.attr("title", this.model.tooltip.maximize);
                if (this._dialogMaximize.hasClass('e-restore'))
                    this._dialogMaximize.attr("title", this.model.tooltip.restore);
            }
            if (!ej.isNullOrUndefined(this._dialogMinimize) && (data.minimize || data.restore)) {
                if (this._dialogMinimize.hasClass('e-minus'))
                    this._dialogMinimize.attr("title", this.model.tooltip.minimize);
                if (this._dialogMinimize.hasClass('e-restore'))
                    this._dialogMinimize.attr("title", this.model.tooltip.restore);
            }
            if (!ej.isNullOrUndefined(this._dialogPin) && (data.pin || data.unPin)) {
                if (this._dialogPin.hasClass('e-unpin'))
                    this._dialogPin.attr("title", this.model.tooltip.pin);
                if (this._dialogPin.hasClass('e-pin'))
                    this._dialogPin.attr("title", this.model.tooltip.unPin);
            }
        },
        _renderControl: function () {
            this._cloneElement = this.element.clone();
            this.element.attr("tabindex", 0).attr({ "role": "dialog"});
            if(this.model.showHeader) this.element.attr({"aria-labelledby": this.element.prop("id") + "_title"});
            this._ejDialog = ej.buildTag("div.e-dialog e-widget e-box " + this.model.cssClass + " e-dialog-wrap e-shadow#" + (this.element.prop("id") == "" ? "" : this.element.prop("id") + "_wrapper"), "", { display: "none", zIndex: this.model.zIndex }, { tabindex: 0 });
            if(this.model.isResponsive) this._ejDialog.addClass("e-dialog-resize");
            this.wrapper = this._ejDialog;
            this._addAttr(this.model.htmlAttributes);
            this._setDragArea(this.model.containment);
            if(!ej.isNullOrUndefined(this.model.containment) && !ej.isNullOrUndefined(this._target)) var target = this._target;                
            else if(!ej.isNullOrUndefined(this.model.target)) var target = this.model.target;
            var wrapperTarget = !ej.isNullOrUndefined(target) ? target : document.body;
            var oldWrapper = $(wrapperTarget).find("#" + this._id + "_wrapper").get(0);
            if (oldWrapper) $(oldWrapper).remove();
            this._ejDialog.appendTo(wrapperTarget);
            if (this.model.enableRTL) this._ejDialog.addClass("e-rtl");
            if (this.model.showHeader) {
                this._renderTitleBar();
                this._iconsRender(this.model.actionButtons);
                if (this.model.faviconCSS) this._favIcon();
            }
            this._appendContent(this.model.contentType);
            this._enableResize()._enableDrag()._setSize();
			if(this.model.height != "auto") this._sizeInPercent();
            if (this.model.contentType != "ajax"){                                                                  
                if (this.model.showOnInit && this.open()) {
                    this._setContainerSize()._resetScroller();
                }
                else this._setHiddenDialogSize();
            }
            this._roundedCorner(this.model.showRoundedCorner);
            this._enabledAction(this.model.enabled);
            if (this._sizeType.width == "auto") this._maxWidth = this.model.width;
            if (this._sizeType.height == "auto") this._maxHeight = this.model.height;
        },

        _setContainerSize: function () {
            if (this.model.height != "auto") {
                var cntHeight = this._ejDialog.outerHeight() - ((this.model.showHeader)? $(this._ejDialog.find("div.e-titlebar")).outerHeight(true) : 0)  + ((this.model.showFooter)? $(this._ejDialog.find("div.e-footerbar")).outerHeight(true) : 0) - 1;
                this.contentDiv.height(cntHeight);
                this.element.outerHeight(cntHeight);
            }
            return this;
        },

        _changeSize: function () {
            this._initSize = { width: this.model.width, height: this.model.height };
            this._sizeType.width = isNaN(this.model.width) ? this.model.width.match(/px|%|auto/g) : null;
            this._sizeType.height = isNaN(this.model.height) ? this.model.height.match(/px|%|auto/g) : null;
            this._setSize()._sizeInPercent()._setContainerSize()._resetScroller();
        },

        _enableDrag: function () {
            if (this.model.allowDraggable && this.model.showHeader) {
                this._dialogTitlebar.addClass("e-draggable");
                this._dragDialog();
            }
            return this;
        },

        _enableResize: function () {
            if (this.model.enableResize) {
                this._ejDialog.addClass("e-resizable");
                var resizeDiv = ej.buildTag("div.e-icon e-resize-handle");
                if (this.model.showFooter) 
                    resizeDiv.appendTo(this._dialogFooterbar);
                else
                    resizeDiv.appendTo(this._ejDialog);
                this._resizeDialog();
            }
            return this;
        },


        _changeSkin: function (skin) {
            if (this.model.cssClass != skin) {
                this._ejDialog.removeClass(this.model.cssClass).addClass(skin);
            }
        },
        _enableModal: function (value) {
            if (value) this._isOpen && this._createOverlay();
            else if (this._overLay) this._overLay.remove();
        },

        _enabledAction: function (flag) {
            if (flag) {
                this._ejDialog.removeClass("e-disable");
                this.wrapper.children(".e-disable-overlay").remove();
                if (!ej.isNullOrUndefined(this.scroller))
                    this.scroller.enable();
            }
            else {
                this._ejDialog.addClass("e-disable");
                ej.buildTag("div.e-disable-overlay").appendTo(this.wrapper);
                if (!ej.isNullOrUndefined(this.scroller))
                    this.scroller.disable();
            }
        },

        _renderTitleBar: function () {
            this._elementTitle = this.element.attr("title");
            if (typeof this._elementTitle !== "string")
                this._elementTitle = "";
            this.model.title = this.model.title || this._elementTitle;
            this._dialogTitlebar = ej.buildTag("div#" + this.element.prop("id") + "_title.e-titlebar e-dialog-header e-dialog e-header").prependTo(this._ejDialog);
            this._addTitleText();
        },

        _renderFooterBar: function () {
            this._dialogFooterbar = ej.buildTag("div#" + this.element.prop("id") + "_foot.e-footerbar e-dialog-footer e-dialog e-js").appendTo(this._ejDialog);
        },

        _addTitleText: function () {
            if (this.model.title) 
                this._titleText = ej.buildTag("span.e-title", this.model.title).prependTo(this._dialogTitlebar);
            return this;
        },
        _updateCaptionWidth: function () {
            var addWidth=this.model.faviconCSS && !ej.isNullOrUndefined(this._dialogFavIcon)?this._dialogFavIcon.outerWidth():0;
			if(this._titleText && !ej.isNullOrUndefined(this._dialogTitlebar))
			    this._titleText.css("max-width", (this._dialogTitlebar.width() - 20 - (this._dialogTitlebar.find(".e-dialog-icon").width() * this._dialogTitlebar.find(".e-dialog-icon").length) - addWidth));
			return this;
        },
        _iconsRender: function (iconArray) {
            for (var icon = 0; icon < iconArray.length; icon++) {
                switch ((ej.browserInfo().name == "msie" && ej.browserInfo().version <= 8) ? $.trim(iconArray[icon]) : iconArray[icon].trim()) {
                    case "close": {
                        this._closeIcon();
                        break;
                    }
                    case "collapse":
                    case "collapsible": {
                        this._collapsibleIcon();
                        break;
                    }
                    case "maximize": {
                        this._maximizeIcon();
                        break;
                    }
                    case "minimize": {
                        this._minimizeIcon();
                        break;
                    }
                    case "pin": {
                        this._pinIcon();
                        break;
                    }
                    default: {
                        this._customIconsRender(iconArray[icon]);
                        break;
                    }
                }
            }
        },

        _customIconsRender: function (icon) {
            this._customIcon = ej.util.buildTag("div#" + this.element[0].id + "_" + icon + "button.e-dialog-icon e-icon e-" + icon, null, null).attr('tabIndex', '0').attr('title', icon);
            this._customIcon.appendTo(this._dialogTitlebar);
            this._on(this._customIcon, "touchstart click", this._iconClick);
        },

        _iconClick: function (event) {
            
            if (!this.element.hasClass("e-disable")) {
                var args = {
                    cancel: false,
                    buttonID: $(event.target).attr("id"),
                    event: event.type,
                    model: this.model,
                    currentTarget: event.currentTarget.title
                }
                this._trigger("actionButtonClick", args);
            }
        },

        _removeAllIcons: function () {
            this._dialogTitlebar.find("div.e-dialog-icon").remove();
        },

        _appendContent: function (contentType) {
            this.contentDiv = ej.isNullOrUndefined(this.contentDiv) ? ej.buildTag("div.e-dialog-scroller") : this.contentDiv;
            this.element.removeAttr("title").addClass("e-widget-content e-box");
            var proxy = this;
            if (!ej.isNullOrUndefined(this.model.contentUrl) && !ej.isNullOrUndefined(contentType)) {
                if (contentType == "ajax") {
                    this.model.ajaxSettings.url = this.model.contentUrl;
                    this._sendAjaxOptions(this.element, this.model.ajaxSettings.url);
                }
                else if (contentType == "iframe") {
                    if (this.element.children('.e-iframe').length > 0) {
                        this.iframe = this.element.find('iframe.e-iframe');
                        this.iframe.attr('src', this.model.contentUrl);
                    }
                    else {
                        this.iframe = ej.buildTag("iframe.e-iframe", "", { width: "100%", height:"100%" }, { scrolling: "auto", frameborder: 0, src: this.model.contentUrl });
                        this.element.appendTo(this.contentDiv).append(this.iframe).show();
                    }
                    if (this.model.enableRTL) {
                        $(this.iframe).load(function () {
                            proxy.iframe.contents().find("body").css("direction", "rtl");
                        });
                    }
                    this._trigger("contentLoad", { contentType: contentType, url: this.model.contentUrl });
                }
                else if (contentType == "image") {
                    var img = ej.buildTag("img.e-images", "", "", { src: this.model.contentUrl });
                    this.element.append(img).show().appendTo(this.contentDiv);
                    $(img).on("load", function () {
                        proxy._dialogPosition();
                    });
                    this._trigger("contentLoad", { contentType: contentType, url: this.model.contentUrl });
                }
                else
                    this.element.show().appendTo(this.contentDiv);
            }
            else {
				this.dialogIframeContent = this.element.children().find('iframe').contents()[0];
				if (!ej.isNullOrUndefined(this.dialogIframeContent)) {
				   this.element.show().appendTo(this.contentDiv).find('iframe').append(this.dialogIframeContent.lastChild);
				}
				else
					this.element.show().appendTo(this.contentDiv);
			}
            if (this._ejDialog.find("div.e-resize-handle").length > 0) {
                if (this._ejDialog.find(".e-footerbar").length == 0)
				this.contentDiv.insertBefore(this._ejDialog.find("div.e-resize-handle"));
			}
			else {
				var dialogIframeContent = this.element.children().find('iframe').contents()[0];
				if (!ej.isNullOrUndefined(dialogIframeContent)) {
                    this.contentDiv.appendTo(this._ejDialog);
					var getid = $("#"+this.contentDiv.find('iframe').attr('id'));
					$(getid[0].contentDocument.lastChild).remove();
				    getid[0].contentDocument.appendChild(dialogIframeContent);
					if(ej.browserInfo().name == "mozilla")
					setTimeout(function () {
						$(getid[0].contentDocument.lastChild).remove();
				        getid[0].contentDocument.appendChild(dialogIframeContent);
                    },500);
				}
				else {
					if(this._ejDialog.find(".e-footerbar").length == 0)
					this.contentDiv.appendTo(this._ejDialog);
				    else
                    this.contentDiv.insertBefore(this._dialogFooterbar);
				     }
				}
            if (this.model.showFooter && this._ejDialog.find(".e-footerbar").length == 0) {
                this._renderFooterBar();
                if (this.model.footerTemplateId != null) {
                    var templateContent = $('body').find("#" + this.model.footerTemplateId).html();
                    this._dialogFooterbar.append(templateContent);
                }
            }
        },

        _roundedCorner: function (value) {
            this._ejDialog[(value ? "addClass" : "removeClass")]('e-corner');
            this.contentDiv.removeClass('e-dialog-top e-dialog-bottom e-dialog-content');
            if (this.model.showRoundedCorner) {
                this.model.showHeader && !this.model.showFooter ? this.contentDiv.addClass('e-dialog-bottom') : !this.model.showHeader && this.model.showFooter ? this.contentDiv.addClass('e-dialog-top') : !this.model.showHeader && !this.model.showFooter ? this.contentDiv.addClass('e-dialog-content') : true;
            }
        },

        _reRenderScroller: function () {
            if (this.scroller != undefined) {
                    this.scroller.refresh(true);
                if (!this.model.enableRTL) {
                    if ((this.scroller._vScrollbar && this.scroller._vScrollbar._scrollData) && this.model.enableResize) {
                        if (this.model.showFooter) 
                            var height = this.scroller._vScrollbar.element.find('> div.e-vscroll').height(), padngSpace = 0, resizeHandleSize = 0;
                        else
                            var height = this.scroller._vScrollbar.element.find('> div.e-vscroll').height(), padngSpace = 2, resizeHandleSize = this._ejDialog.find('div.e-resize-handle').outerHeight();
	                    if (Math.floor(this.contentDiv.outerHeight()) === Math.floor(this.scroller._vScrollbar.model.height + 1)) {
                            this.scroller._vScrollbar.model.height -= resizeHandleSize + padngSpace;
                            this.scroller._vScrollbar._scrollData.handle -= resizeHandleSize;
                            this.scroller._vScrollbar._scrollData.handleSpace -= resizeHandleSize + padngSpace;
                            this.scroller._vScrollbar._updateLayout(this.scroller._vScrollbar._scrollData);
                            this.scroller._vScrollbar.element.find('> div.e-vscroll').height(height - resizeHandleSize - padngSpace);
                        }
                    }
                    if (!(this.scroller._vScrollbar && this.scroller._vScrollbar._scrollData) && (this.scroller._hScrollbar && this.scroller._hScrollbar._scrollData) && this.model.enableResize) {
                        if (this.model.showFooter) 
                            var width = this.scroller._hScrollbar.element.find('> div.e-hscroll').width(), padngSpace = 0, resizeHandleSize = 0;
                        else
                            var width = this.scroller._hScrollbar.element.find('> div.e-hscroll').width(), padngSpace = 2, resizeHandleSize = this._ejDialog.find('div.e-resize-handle').outerWidth();
                        this.scroller._hScrollbar.model.width -= resizeHandleSize + padngSpace;
                        this.scroller._hScrollbar._scrollData.handle -= resizeHandleSize + padngSpace;
                        this.scroller._hScrollbar._scrollData.handleSpace -= resizeHandleSize + padngSpace;
                        this.scroller._hScrollbar._updateLayout(this.scroller._hScrollbar._scrollData);
                        this.scroller._hScrollbar.element.find('> div.e-hscroll').width(width - resizeHandleSize - padngSpace);
                    }
                }
            }
        },       

        _dialogMaxZindex: function () {
            var parents = this.element.parents(), bodyEle, contEle;
            bodyEle = $('body').children();
            $(bodyEle).each(function (i, ele) { parents.push(ele); });
            contEle = $(this.model.target).children();
            $(contEle).each(function (i, ele) { parents.push(ele); });
            var maxZ = Math.max.apply(maxZ, $.map(parents, function (e, n) {
                if ($(e).css('position') != 'static') return parseInt($(e).css('z-index')) || 1;
            }));
            if (!maxZ || maxZ < 10000) maxZ = 10000;
            else maxZ += 1;
            return maxZ;
        },

        _setZindex: function () {
            var zindex = this._dialogMaxZindex();
            if (this.model.zIndex <= zindex)
                this._ejDialog.css({ zIndex: zindex + 1 });
        },

        _createOverlay: function () {
            var zindex = this._ejDialog.css('zIndex'), target, element, position;
            !ej.isNullOrUndefined(this._overLay) && this._overLay.remove();
            if (!this.model.backgroundScroll) $("body").addClass("e-dialog-modal");
            this._overLay = ej.buildTag("div#" + this.element.attr("id") + "_overLay.e-overlay", "", { zIndex: zindex - 1 });
			$(this._overLay).addClass("e-widget");
            if (!ej.isNullOrUndefined(this.model.containment) && !ej.isNullOrUndefined(this._target)) target = this._target;
            else if (!ej.isNullOrUndefined(this.model.target)) target = this.model.target;
            this._overLay.appendTo(!ej.isNullOrUndefined(target) ? target : document.body);
            var position = !ej.isNullOrUndefined(this.model.containment) && !ej.isNullOrUndefined(this._target) ? "absolute" : "fixed";
            var left =(ej.isNullOrUndefined(target) || position=="fixed") ? 0 : $(target).css('position').toLowerCase() != "static" ? 0 : $(target).offset().left;
            var top = (ej.isNullOrUndefined(target) || position=="fixed") ? 0 : $(target).css('position').toLowerCase() != "static" ? 0 : $(target).offset().top;
            this._overLay.css({ top: top, left: left, position: position });
        },

        _sendAjaxOptions: function (content, link) {
            //load waiting popup
            content.addClass("e-load");
            var proxy = this;
            var curTitle = this.model.title;
            var hrefLink = link;
            var ajaxOptions = {
                "success": function (data) {
                    try { proxy._ajaxSuccessHandler(data, content, link, curTitle); }
                    catch (e) { }
                },
                "error": function (e) {
                    try { proxy._ajaxErrorHandler({ "status": e.status, "responseText": e.responseText, "statusText": e.statusText }, content, link, curTitle); }
                    catch (e) { }
                },
                "complete": function () {
                    try {
                        proxy._setContainerSize();
                        proxy._resetScroller();
                        if (!proxy.model.showOnInit) proxy._setHiddenDialogSize();
                    } catch (e) {}
                }
            };
            $.extend(true, ajaxOptions, this.model.ajaxSettings);
            this._sendAjaxRequest(ajaxOptions);
        },

        _setHiddenDialogSize: function () {
            if (!this._isOpen) {
                this._ejDialog.css({ "display": "block", "visibility": "hidden" });
                this._setContainerSize()._resetScroller();
                this._ejDialog.css({ "display": "none", "visibility": "" });
            }
        },

        _sendAjaxRequest: function (ajaxOptions) {
            $.ajax({
                type: ajaxOptions.type,
                cache: ajaxOptions.cache,
                url: ajaxOptions.url,
                dataType: ajaxOptions.dataType,
                data: ajaxOptions.data,
                contentType: ajaxOptions.contentType,
                async: ajaxOptions.async,
                success: ajaxOptions.success,
                error: ajaxOptions.error,
                beforeSend: ajaxOptions.beforeSend,
                complete: ajaxOptions.complete
            });
        },

        _ajaxSuccessHandler: function (data, content, link, curTitle) {
            content.removeClass("e-load");
            content.html(data).addClass("e-dialog-loaded").appendTo(this._ejDialog);
            content.appendTo(this.contentDiv);
            this._dialogPosition();
            if (this.model.showOnInit)
                this.open();
            this._trigger("ajaxSuccess", { data: data, url: link });
        },

        _ajaxErrorHandler: function (data, content, link, curTitle) {
            content.addClass("e-dialog-loaded").appendTo(this.contentDiv);
            this._dialogPosition().open();
            this._trigger("ajaxError", { data: data, url: link });
        },
        _closeIcon: function () {
            this._dialogClose = ej.util.buildTag("div#" + this.element[0].id + "_closebutton.e-dialog-icon e-icon e-close",null,null).attr('tabIndex','0');            
            if(this.model.closeIconTooltip == "close" && this.model.tooltip.close == "Close")
                this._dialogClose.appendTo(this._dialogTitlebar).attr("title", this.model.tooltip.close);
            else if(this.model.closeIconTooltip != "close" && this.model.tooltip.close == "Close")
                this._dialogClose.appendTo(this._dialogTitlebar).attr("title", this.model.closeIconTooltip);
            else if(this.model.closeIconTooltip == "close" && this.model.tooltip.close != "Close")
                this._dialogClose.appendTo(this._dialogTitlebar).attr("title", this.model.tooltip.close);
            else   this._dialogClose.appendTo(this._dialogTitlebar).attr("title", this.model.tooltip.close);
            this._on(this._dialogClose, "touchstart click", this._closeClick);
        },
		
        _collapsibleIcon: function () {            
            this._dialogCollapsible = ej.util.buildTag("div#" + this.element[0].id + "_collapsbutton.e-dialog-icon e-icon",null,null).attr('tabIndex','0');             
            if (this._collapsible) {
                this._dialogCollapsible.appendTo(this._dialogTitlebar).attr("title", this.model.tooltip.expand).addClass("e-arrowhead-down").removeClass("e-arrowhead-up");
            }
            else {
                this._dialogCollapsible.appendTo(this._dialogTitlebar).attr("title", this.model.tooltip.collapse).addClass("e-arrowhead-up").removeClass("e-arrowhead-down");
            }
            this._on(this._dialogCollapsible, "touchstart click", this._collapsibleClick);
        },

        _maximizeIcon: function () {
            this._dialogMaximize = ej.util.buildTag("div#" + this.element[0].id + "_maximizebutton.e-dialog-icon e-icon",null,null).attr('tabIndex','0'); 
            if (this._maximize) {
                this._dialogMaximize.appendTo(this._dialogTitlebar).attr("title", this.model.tooltip.restore).addClass("e-restore").removeClass("e-maximize");
            }
            else {
                this._dialogMaximize.appendTo(this._dialogTitlebar).attr("title", this.model.tooltip.maximize).addClass("e-maximize").removeClass("e-restore");
            }
            this._on(this._dialogMaximize, "touchstart click", this._maximizeClick);
        },

        _minimizeIcon: function () {
            this._dialogMinimize = ej.util.buildTag("div#" + this.element[0].id + "_minimizebutton.e-dialog-icon e-icon",null,null).attr('tabIndex','0');           
            if (this._minimize) {
                this._dialogMinimize.appendTo(this._dialogTitlebar).attr("title", this.model.tooltip.restore).addClass("e-restore").removeClass("e-minus");
            }
            else {
                this._dialogMinimize.appendTo(this._dialogTitlebar).attr("title", this.model.tooltip.minimize).addClass("e-minus").removeClass("e-restore");
            }
            this._on(this._dialogMinimize, "touchstart click", this._minimizeClick);
        },

        _pinIcon: function () {
            this._dialogPin = ej.util.buildTag("div#" + this.element[0].id + "_pinbutton.e-dialog-icon e-icon",null,null).attr('tabIndex','0'); 
            this._dialogPin.appendTo(this._dialogTitlebar).attr("title", this.dialogPin ? this.model.tooltip.unPin : this.model.tooltip.pin).addClass(this.dialogPin ? "e-pin" : "e-unpin").removeClass(this.dialogPin ? "e-unpin" : "e-pin");
            this._on(this._dialogPin, "touchstart click", this._pinClick);
        },

        _favIcon: function () {
            if (!this._dialogFavIcon) {
                this._dialogFavIcon = ej.util.buildTag("div.e-dialog-favicon", "", {}, { style: "float:"+ (this.model.enableRTL?"right":"left") });
                var span = ej.util.buildTag("span.e-dialog-custom", "", {}, { role: "presentation" });
                span.appendTo(this._dialogFavIcon);
                this._dialogFavIcon.appendTo(this._dialogTitlebar);
            }
            else 
                span = this._dialogFavIcon.find("span").removeClass().addClass("e-dialog-custom");
            if (!this.model.faviconCSS) this._dialogFavIcon.remove();
            else span.addClass(this.model.faviconCSS); this._dialogFavIcon.css("float", (this.model.enableRTL ? "right" : "left"));
        },

        _minMaxValidation: function () {
            var _minWidth = parseInt(this.model.minWidth), _minHeight = parseInt(this.model.minHeight), _maxWidth = parseInt(this.model.maxWidth), _maxHeight = parseInt(this.model.maxHeight),_width = parseInt(this.model.width), _height = parseInt(this.model.height), parentObj = this._getParentObj();
            if (isNaN(this.model.minWidth) && (this.model.minWidth.indexOf("%") > 0))
                _minWidth = this._convertPercentageToPixel(parentObj.outerWidth(), _minWidth);
            if (isNaN(this.model.minHeight) && (this.model.minHeight.indexOf("%") > 0))
                _minHeight = this._convertPercentageToPixel(parentObj.outerHeight(), _minHeight);
            if (isNaN(this.model.maxWidth) && (this.model.maxWidth.indexOf("%") > 0))
                _maxWidth = this._convertPercentageToPixel(parentObj.innerWidth(), _maxWidth);
            if (isNaN(this.model.maxHeight) && (this.model.maxHeight.indexOf("%") > 0))
                _maxHeight = this._convertPercentageToPixel(parentObj.innerHeight(), _maxHeight);
			if (isNaN(this.model.width) && (this.model.width.indexOf("%") > 0))
                _width = this._convertPercentageToPixel(parentObj.innerWidth(), _width);
            if (isNaN(this.model.height) && (this.model.height.indexOf("%") > 0))
                _height = this._convertPercentageToPixel(parentObj.innerHeight(), _height);
            if (_maxWidth && _width > _maxWidth || _minWidth && _width < _minWidth) {
                if (_width > _maxWidth) this.model.width = _maxWidth;
                else this.model.width = _minWidth;
            }
            if (_maxHeight && _height >_maxHeight || _minHeight && _height< _minHeight) {
                if (_height > _maxHeight) this.model.height = _maxHeight;
                else this.model.height = _minHeight;
            }
			 
        },

        _setSize: function () {
            var mdl = this.model;
            this._minMaxValidation();
            this._ejDialog.css({ width: mdl.width, minWidth: mdl.minWidth, maxWidth: mdl.maxWidth });
            this._ejDialog.css({ height: mdl.height, minHeight: mdl.minHeight, maxHeight: mdl.maxHeight });
            this._dialogPosition();
            return this;
        },

        _resetScroller: function () {		
			this.element.css({ "height": "auto", "max-width": "", "max-height": "", "width": "" });
            var scrHeight = this._ejDialog.outerHeight(true) - ((this.model.showHeader)? $(this._ejDialog.find("div.e-titlebar")).outerHeight(true) : 0)-((this.model.showFooter)? $(this._ejDialog.find("div.e-footerbar")).outerHeight(true) : 0), eleHeight;
            var scrModel = { width: (this.contentDiv.css('border-width') == "0px" || this.contentDiv.css('border-left-width') == "0px") ? Math.round(this._ejDialog.width()) : Math.round(this._ejDialog.width() - 2), enableRTL: this.model.enableRTL, height: (this.contentDiv.css('border-width') == "0px") ? scrHeight : scrHeight - 1, enableTouchScroll: false }; // 2px border width
            if ((this.model.height == "auto") && (this.element.height() < this.model.maxHeight || !this.model.maxHeight) && !this._maximize)
                scrModel.height = "auto";
            if (this.model.width == "auto" && !this._maximize)
                scrModel.width = this.model.width;
            this.contentDiv.ejScroller(scrModel);
            this.scroller = this.contentDiv.data("ejScroller");
            this._reRenderScroller();
            this._padding = parseInt($(this.element).css("padding-top")) + parseInt($(this.element).css("padding-bottom"));
            if(($(this._ejDialog).css("display"))=="none"){
				  this.hidden=true;         
                  this._ejDialog.css({"display":"block"}); 
			}		
			if (!ej.isNullOrUndefined(this.contentDiv.height()) && this.contentDiv.height() > 0) {
                if (!ej.isNullOrUndefined(this.scroller))
                    if (!this.scroller._hScrollbar && this.scroller._vScrollbar)
                        eleHeight = this.contentDiv.outerHeight();
                    else if (this.scroller._hScrollbar)
                         eleHeight = this.contentDiv.outerHeight() - this.scroller.model.buttonSize;
                     else  eleHeight = this.contentDiv.outerHeight();
                 else
                    eleHeight = this.contentDiv.outerHeight() - this._padding;
                if ((this.model.height != "auto" && this.model.height != "100%"))
                    this.element.css({ "height": eleHeight-1 });
                else
                    this.element.css("height", this.model.height);
                if ((this.model.height == "auto" || this.model.height == "100%") && !this.scroller._vScrollbar)
                    this.element.css({ "min-height": this.model.minHeight -((this.model.showHeader)? $(this._ejDialog.find("div.e-titlebar")).outerHeight(true) : 0)});
                if (!this.scroller._vScrollbar && (this.model.width != "auto" && this.model.width != "100%"))
                    this.element.outerWidth((this.contentDiv.css('border-width') == "0px" || this.contentDiv.css('border-left-width') == "0px") ? this._ejDialog.width() : this._ejDialog.width() - 2);
                else if (!this.scroller._vScrollbar)
                    this.element.css("width", this.model.width);
                this.element.css({"max-width": this.model.maxWidth, "max-height": this.model.maxHeight });
            }
			if(this.hidden) this._ejDialog.css({"display":"none"});					
			this.hidden=false;
        },

        _updateScroller: function (height, width) {
            this.contentDiv.ejScroller({ width: width, height: height, enableRTL: this.model.enableRTL, enableTouchScroll: false });
            this.scroller = this.contentDiv.data("ejScroller");
            this._reRenderScroller();
			this._changeSize();
        },

        _dragDialog: function () {
            var proxy = this;
            var pos = this._ejDialog.parents(".e-dialog-scroller");
            this._dialogTitlebar.ejDraggable({
                handle: ".e-titlebar",
                cursorAt: { top: 0, left: 0 },
                dragArea: proxy._target,
                dragStart: function (event) {
					event.element.attr('aria-grabbed', true);
                    proxy._clickHandler();
                    if (proxy.dialogPin || !proxy.model.allowDraggable || !proxy.model.enabled) {
                        event.cancel = true;
                        return false;
                    }
                    if (proxy._trigger("dragStart", { event: event })) {
                        event.cancel = true;
                        return false;
                    }
                },
                drag: function (event) {
                    proxy._trigger("drag", { event: event });
                },
                dragStop: function (event) {
                    proxy._ejDialog.focus();
					event.element.attr('aria-grabbed', false);
                    if (proxy.element.find("> .e-draggable.e-titlebar")) {
                       var dragobject = $("#" + proxy.element.find("> .e-draggable.e-titlebar").attr("id")).data("ejDraggable");
                        if (dragobject)
                            dragobject.option("cursorAt", proxy.element.offset());
                    }
                    var pos = this.helper.offsetParent().offset();
                    proxy._trigger("dragStop", { event: event });
                    proxy.model.position.X = ej.isNullOrUndefined(this.position.left) ? parseInt(this.helper.css('left')) : this.position.left - [pos.left + parseFloat(this.helper.offsetParent().css('border-left-width'))];
                    proxy.model.position.Y = ej.isNullOrUndefined(this.position.top) ? parseInt(this.helper.css('top')) : this.position.top - [pos.top + parseFloat(this.helper.offsetParent().css('border-top-width'))];
                    proxy._positionChanged = true;
                    proxy.dlgresized = true;
                },
                helper: function (event) {
                    return $(proxy._ejDialog).addClass("dragClone");
                }
            });
            return this;
        },

        _resizeDialog: function () {
            if (!this.model.enableResize)  return;
            var proxy = this, started = false, parentObj;
            var _minWidth = parseInt(this.model.minWidth), _minHeight = parseInt(this.model.minHeight);
            var _maxWidth = parseInt(this.model.maxWidth), _maxHeight = parseInt(this.model.maxHeight);
            parentObj = this._getParentObj();
            if (isNaN(this.model.minWidth) && (this.model.minWidth.indexOf("%") > 0))
                _minWidth = this._convertPercentageToPixel(parentObj.outerWidth(), _minWidth);
            if (isNaN(this.model.minHeight) && (this.model.minHeight.indexOf("%") > 0))
                _minHeight = this._convertPercentageToPixel(parentObj.outerHeight(), _minHeight);
            if (isNaN(this.model.maxWidth) && (this.model.maxWidth.indexOf("%") > 0))
                _maxWidth = this._convertPercentageToPixel(parentObj.innerWidth(), _maxWidth);
            if (isNaN(this.model.maxHeight) && (this.model.maxHeight.indexOf("%") > 0))
                _maxHeight = this._convertPercentageToPixel(parentObj.innerHeight(), _maxHeight);
            this._ejDialog.find("div.e-resize-handle").ejResizable(
                {
                    minHeight: _minHeight,
                    minWidth: _minWidth,
                    maxHeight: _maxHeight,
                    maxWidth: _maxWidth,
                    handle: "e-widget-content",
                    resizeStart: function (event) {
                        proxy.dlgresized=true;
                        if (!proxy.model.enabled)
                            return false;
                        !started && proxy._trigger("resizeStart", { event: event });
                        started = true;
                        proxy.model.position = { X: proxy._ejDialog.css("left"), Y: proxy._ejDialog.css("top") };
                        proxy._dialogPosition();
                    },
                    resize: function (event) {
                        proxy.dlgresized=true;
                        var reElement = $(event.element).parents("div.e-dialog-wrap");
                        proxy.model.height = $(reElement).outerHeight();
                        proxy.model.width = $(reElement).outerWidth();
                        proxy._setSize();
                        proxy._setContainerSize();
                        proxy._resetScroller();
                        proxy._updateCaptionWidth();
                        proxy._trigger("resize", { event: event });
                        proxy._sizeType = { width: "px", height: "px" };
                        if(this.scrObj) this.scrObj._resetScroller();                      
                    },
                    resizeStop: function (event) {
                        proxy.dlgresized=true;
                        proxy._ejDialog.focus();
                        proxy._sizeInPercent();
                        var reElement = $(event.element).parents("div.e-dialog-wrap");
                        proxy.model.height = $(reElement).outerHeight();
                        proxy.model.width = $(reElement).outerWidth();
                        proxy._setSize();
                        proxy._setContainerSize();
                        proxy._resetScroller();
                        started && proxy._trigger("resizeStop", { event: event });
                        started = false;
                        proxy._setDimension();
                    },
                    helper: function (event) {
                        return $(proxy._ejDialog);
                    }
                });
            return this;
        },

        _dialogPosition: function () {
            if (this._ejDialog.parents("form").length > 0 && ej.isNullOrUndefined(this.model.containment) && ej.isNullOrUndefined(this.model.target)) {
                this._ejDialog.appendTo(this._ejDialog.parents("form"));
            }
            if (this.model.position.X != "" || this.model.position.Y != "") {
                this._ejDialog.css("position", "absolute");
                if(ej.isNullOrUndefined(this.model.target) && ej.isNullOrUndefined(this.model.containment)) {
                this._ejDialog.css("left", this.model.position.X);
                this._ejDialog.css("top", this.model.position.Y);
				}
				else {
					  var containerEle=ej.isNullOrUndefined(this.model.containment)?this.model.target:this.model.containment;
					  if (this.dlgresized || this._keyNavigation){
                         this._ejDialog.css("left", this.model.position.X);
                         this._ejDialog.css("top", this.model.position.Y);                   
                                    }
                      else{
                      this._ejDialog.css("left", $(containerEle).offset()["left"]+ parseInt(this.model.position.X));
					  this._ejDialog.css("top", $(containerEle).offset()["top"]+ parseInt(this.model.position.Y));
				}
            }
            }
            else {
                this._centerPosition();
            }
            return this;
        },
        _centerPosition:function(){
            var x = 0, y = 0;
            if (!ej.isNullOrUndefined(this.model.target) ||!ej.isNullOrUndefined(this._target) && !$(this._target).is($(document)) && !($(this._target).is($(window)))) {
                var $content = !ej.isNullOrUndefined(this._target) ? $(this._target) : $(this.model.target);
                if ($content.css("position") == 'static') {
                    var parentOffset = $content.offsetParent().offset();
                    var contentOffset = $content.offset();
                    x = contentOffset.left - parentOffset.left;
                    y = contentOffset.top - parentOffset.top;
                }
                if ($content.outerWidth() > this._ejDialog.width()) x += ($content.outerWidth() - this._ejDialog.width()) / 2;
                if ($content.outerHeight() > this._ejDialog.height()) y += ($content.outerHeight() - this._ejDialog.height()) / 2;
            }
            else {
                var doc = document.documentElement;
                x = (($(window).outerWidth() > this._ejDialog.width()) ? ($(window).outerWidth() - this._ejDialog.outerWidth()) / 2 : 0) + (window.pageXOffset || doc.scrollLeft);
                y = (($(window).outerHeight() > this._ejDialog.height()) ? ($(window).outerHeight() - this._ejDialog.outerHeight()) / 2 : 0) + (window.pageYOffset || doc.scrollTop);
            }
            this._ejDialog.css({ top: y, left: x });
            this._ejDialog.css("position", "absolute");
        },
        _closeClick: function (event) {
			if(event.type == "touchstart")
		    	event.preventDefault();
            if (this.model.enabled) {
                event.stopPropagation();
                this.close(event);
            }
        },

        _collapsibleClick: function (e) {
            if (this.model.enabled) {
                if ($(e.target).hasClass("e-arrowhead-up")) {
                    this._actionCollapse(e);
                }
                else if ($(e.target).hasClass("e-arrowhead-down")) {
                    this._actionExpand(e);
                }
            }
        },
        _actionCollapse: function (e) {
            if (!this._minimize) {
                this._dialogCollapsible&& this._dialogCollapsible.removeClass("e-arrowhead-up").addClass("e-arrowhead-down");
                this._dialogCollapsible && this._dialogCollapsible.attr("title", this.model.tooltip.expand);
                this._ejDialog.find("div.e-resize-handle").hide();
                this._ejDialog.find(".e-widget-content").parent().slideUp("fast");
                if(this.model.showFooter)  this._dialogFooterbar.slideUp("fast");
                this._ejDialog.removeClass("e-shadow");
                this._ejDialog.css("minHeight", "0");
                this._ejDialog.height("auto");
                this._trigger("collapse",{isInteraction :(e ? true : false )});
                this._collapsible = true;
            }
        },
        _actionExpand: function (e) {
            if (!this._minimize) {
                this._dialogCollapsible&& this._dialogCollapsible.removeClass("e-arrowhead-down").addClass("e-arrowhead-up");
                this._dialogCollapsible && this._dialogCollapsible.attr("title", this.model.tooltip.collapse);
                this._ejDialog.addClass("e-shadow");
                this._ejDialog.find(".e-widget-content").parent().slideDown("fast");
                if (this.model.showFooter) this._dialogFooterbar.slideDown("fast");
                if (this._maximize) {
                    this._ejDialog.css({ width: "100%", height: "100%" });
                    this.element.css({ width: "100%", height: "100%" });
                    this.contentDiv.css({ width: "100%", height: "100%" });
                }
                else this._ejDialog.height(this.model.height);
                this._ejDialog.find("div.e-resize-handle").show();
                this._trigger("expand",{isInteraction :(e ? true : false )});
                this._collapsible = false;
            }
        },

        _maximizeClick: function (e) {
            if (this.model.enabled) {
                var _target = $(e.target);
                var hideIcon = this._dialogMaximize;
                if (_target.hasClass("e-maximize")) {
                    this._actionMaximize();
                    if (this._dialogTitlebar){
                        this._dialogTitlebar.find('.e-restore').removeClass('e-restore').addClass('e-minus');
                        this._dialogMinimize && this._dialogMinimize.attr('title', this.model.tooltip.minimize);
                    }
                    _target.removeClass("e-maximize").addClass("e-restore");
                    this._dialogMaximize.attr('title', this.model.tooltip.restore);
                    this._hideIcon(true);
                }
                else if (_target.hasClass("e-restore")) {
                    this._actionRestore();
                    _target.removeClass("e-restore").addClass("e-maximize");
                    this._dialogMaximize.attr('title', this.model.tooltip.maximize);
                    if (!ej.isNullOrUndefined(hideIcon) && $(hideIcon).hasClass('e-arrowhead-down')){
                        $(hideIcon).removeClass('e-arrowhead-down').addClass('e-arrowhead-up');
                        this._dialogMaximize.attr('title', this.model.tooltip.collapse);
                    }
                    this._hideIcon(true);
                }
            }
			this._resetScroller();
        },
        _actionMaximize: function () {
            this._ejDialog.css("top", "0px").css("left", "0px").css("overflow", "hidden").css("position", (this.model.containment ? "absolute" : this.model.target ? "absolute" : "fixed"));
            this._ejDialog.css({ width: "100%", height: "100%" });
            this.element.css({ width: "100%", height: "100%" });
            this.contentDiv.css({ width: "100%", height: "100%" });
            this._maximize = true;
            this._minimize = false;
            var proxy=this;
            if (this._dialogCollapsible && !ej.isNullOrUndefined(this._dialogCollapsible.hasClass("e-arrowhead-down"))) {
                this._dialogCollapsible.removeClass("e-arrowhead-down").addClass("e-arrowhead-up");
                this._dialogCollapsible.attr('title', this.model.tooltip.collapse);
                this._collapseValue = true
            }
            if(this._collapseValue == true) {
                this._ejDialog.find(".e-widget-content").parent().slideDown("fast",function(){
					proxy.refresh();
                    proxy._reRenderScroller();
                });
            }
            this._resetScroller();
			if($(this.contentDiv).is(":hidden"))
			    this.contentDiv.show();
        },
        _actionRestore: function () {
            this.element.height("").width("");
            this.contentDiv.height("").width("");
            this._restoreDialog();
            this._maximize = this._minimize = false;
        },

        _minimizeClick: function (e) {
            if (this.model.enabled) {
                var _target = $(e.target);
                var hideIcon = this._dialogMinimize.hasClass("e-icon")&& this._dialogMinimize;
                if (_target.hasClass("e-minus")) {
                    if (this._maximize)
                        this._setSize();
                    this._actionMinimize();
                } else if (_target.hasClass("e-restore")) {
                    this._actionRestore();
                    _target.removeClass("e-restore").addClass("e-minus");
                    this._dialogMinimize.attr('title', this.model.tooltip.minimize);
                    if (!ej.isNullOrUndefined(hideIcon) && $(hideIcon).hasClass('e-arrowhead-down')){
                        $(hideIcon).removeClass('e-arrowhead-down').addClass('e-arrowhead-up');
                        this._dialogMinimize.attr('title', this.model.tooltip.collapse);
                    }
                    this._hideIcon(true);
                }
            }
        },

        _actionMinimize: function () {
            var top = ($(window).height() - this._ejDialog.height()) + this.element.height() + 14, _height;
            this._ejDialog.css("top", "").css("bottom", "0").css("left", "0").css("position", (this.model.containment ? "absolute" : this.model.target ? "absolute" : "fixed"));
            this._ejDialog.css("minHeight", "0");
            if (this._dialogTitlebar) {
                this._dialogTitlebar.find('.e-restore').removeClass('e-restore').addClass('e-maximize');
                this._dialogMaximize && this._dialogMaximize.attr('title', this.model.tooltip.maximize);
                this._dialogTitlebar.find(".e-minus").removeClass("e-minus").addClass("e-restore");
                this._dialogMinimize && this._dialogMinimize.attr('title', this.model.tooltip.restore);
                if (this._isOpen)
                    _height = this._dialogTitlebar.outerHeight();
                else {
                    this._ejDialog.css({ "display": "block", "visibility": "hidden" });
                    _height = this._dialogTitlebar.outerHeight();
                    this._ejDialog.css({ "display": "none", "visibility": "" });
                }
                this._ejDialog.css("height", _height + 2); // 1px bordertop + 1px borderbottom of the dialog wrapper is added
                this._hideIcon(false);
            } else this._ejDialog.css("height", "");
            this.contentDiv.hide();
			if(this.model.showFooter) this._dialogFooterbar.hide();
            this._maximize = false;
            this._minimize = true;
        },

        _hideIcon: function (value) {
            var hideIcon = this._dialogCollapsible ? this._dialogCollapsible : null;
            if (value) {
                if (!ej.isNullOrUndefined(hideIcon)) $(hideIcon).parent('.e-dialog-icon').show();
                this._ejDialog.find("div.e-resize-handle").show();
            } else {
                if (!ej.isNullOrUndefined(hideIcon)) $(hideIcon).parent('.e-dialog-icon').hide();
                this._ejDialog.find("div.e-resize-handle").hide();
            }
        },

        _pinClick: function (e) {
            if (this.model.enabled) {
                var _target = $(e.target);
                if (_target.hasClass("e-unpin")) {
                    this.dialogPin = true;
                    _target.removeClass("e-unpin").addClass("e-pin");
                    this._dialogPin.attr('title', this.model.tooltip.unPin);
                }
                else if (_target.hasClass("e-pin")) {
                    this.dialogPin = false;
                    _target.removeClass("e-pin").addClass("e-unpin");
                    this._dialogPin.attr('title', this.model.tooltip.pin);
                }
            }
        },

        _restoreDialog: function () {
            this.contentDiv.show();
			if(this.model.showFooter) this._dialogFooterbar.show();
            this._ejDialog.css({"position": "absolute", "bottom": ""}).addClass("e-shadow");
            this._setSize()._resetScroller();
            if (this._dialogTitlebar) {
                this._dialogTitlebar.find(".e-minus").parent().show();
                if (this._dialogCollapsible) {
                    this._dialogCollapsible.removeClass("e-arrowhead-down").addClass("e-arrowhead-up");
                    this._dialogCollapsible.attr("title", this.model.tooltip.collapse);
                }
            }
        },

        _clickHandler: function (e) {
            var zindex = this._dialogMaxZindex();
            if (parseInt(this._ejDialog.css("zIndex")) < zindex) 
                this._ejDialog.css({ zIndex: zindex + 1 });            
        },

        _mouseClick: function (e) {
			if(e.currentTarget==this._id)
				if ($(e.target).hasClass("e-dialog") || $(e.target).hasClass("e-icon e-resize-handle")) {
					this._setZindex();
					$(e.target).closest(".e-dialog.e-widget").focus();
				}
        },

        _keyDown: function (e) {
            var code;
            if (e.keyCode) code = e.keyCode; // ie and mozilla/gecko
            else if (e.which) code = e.which; // ns4 and opera
            else code = e.charCode;
            if (this.model.allowKeyboardNavigation && this.model.enabled && $(e.target).hasClass("e-dialog"))
                if ($.inArray(code, this.keyConfigs) > -1 && this.model.allowDraggable && !this.dialogPin) {
                    this._keyPressed(code, e.ctrlKey);
                    e.preventDefault();
                }            
            if (this.model.closeOnEscape && code === 27 && this.model.enabled) 
                if (!this.element.find(".e-js.e-dialog").first().is(":visible")) {
                    this.close(e);
                    e.preventDefault();
                }
            if (code===13 && this.model.enabled){
                if($(e.target).hasClass("e-close")) this.close(e);
                else if ($(e.target).hasClass("e-arrowhead-up") || $(e.target).hasClass("e-arrowhead-down")) this._collapsibleClick(e);                
                if ($(e.target).hasClass("e-maximize") || ($(e.target).hasClass("e-restore") && $(e.target).is(this._dialogMaximize)))
				    this._maximizeClick(e);
                else if ($(e.target).hasClass("e-minus") || ($(e.target).hasClass("e-restore") && $(e.target).is(this._dialogMinimize)))
				    this._minimizeClick(e);
				if ($(e.target).hasClass("e-pin") || $(e.target).hasClass("e-unpin")){
				    this._pinClick(e);
					}
            }
            if (code == 9 && this.model.enableModal)
                this._focusOnTab(e);
        },

        _focusOnTab: function (e) {
            var focusEle = this._ejDialog.find("a, button, :input, select, [tabindex]:not('-1')");
            focusEle = $(focusEle).find("a, button, :input, select, [tabindex]:not('')");
            if (e.shiftKey) {
                if (!focusEle[focusEle.index(e.target) - 1]) {
                    e.preventDefault();
                    focusEle.last().focus();
                }
            }
            else if (!focusEle[focusEle.index(e.target) + 1]) {
                e.preventDefault();
                focusEle[0].focus();
            }
        },

        _keyPressed: function (code, ctrlKey) {
            this._keyNavigation=true;
            switch (code) {
                case 40:
                    ctrlKey ?  this._resizing("height", (this._ejDialog.outerHeight() + 3)) : this.option("position", { X: this._ejDialog.position().left, Y: (this._ejDialog.position().top + 3) });
                    break;
                case 39:
                    ctrlKey ? this._resizing("width", (this._ejDialog.outerWidth() + 3)) : this.option("position", { X: (this._ejDialog.position().left + 3), Y: this._ejDialog.position().top });
                    break;
                case 38:
                    ctrlKey ? this._resizing("height", (this._ejDialog.outerHeight() - 3)) : this.option("position", { 
						X: (this._ejDialog.position().left == 0 ? 0 : this._ejDialog.position().left),
						Y: (this._ejDialog.position().top > 3 ? this._ejDialog.position().top - 3 : 0) 
					});
                    break;
                case 37:
                    ctrlKey ? this._resizing("width", (this._ejDialog.outerWidth() - 3)) : this.option("position", { 
						X: (this._ejDialog.position().left > 3 ? this._ejDialog.position().left - 3 : 0), 
						Y: (this._ejDialog.position().top == 0 ? 0 : this._ejDialog.position().top)
					});
                    break;
            }
        },

        _resizing:function(key, value){
            if (this.model.enableResize) this.option(key, value);
        },

        _sizeInPercent: function () {
            if (!this._enableWindowResize()) return this;
            var parentObj = this._getParentObj();
            if (this._sizeType.width == "%") this._widthPercent = parseFloat(this.model.width);
            else this._widthPercent = this._convertPixelToPercentage(parentObj.outerWidth(), this._ejDialog.outerWidth());
            if (this._sizeType.height == "%") this._heightPercent = parseFloat(this.model.height);
            else this._heightPercent = this._convertPixelToPercentage(parentObj.outerHeight(), this._ejDialog.outerHeight());
            if (this._widthPercent >= 100) {
                this._widthPercent = 100;
                this._ejDialog.outerWidth(parentObj.outerWidth());
                this.model.width = this._ejDialog.width();
            }
            if (this._heightPercent >= 100) {
                this._heightPercent = 100;
                this._ejDialog.outerHeight(parentObj.outerHeight());
                this.model.height = this._ejDialog.height();
            }
            return this;
        },

        _getParentObj: function () {
            return (!ej.isNullOrUndefined(this.model.containment) ? $(this.model.containment) : !ej.isNullOrUndefined(this.model.target) ? $(this.model.target) : $(document));
        },

        _convertPercentageToPixel: function (parent, child) {
            return Math.round((child * parent) / 100);
        },

        _convertPixelToPercentage: function (parent, child) {
            return Math.round((child / parent) * 100);
        },

        _reSizeHandler: function () {
            var parentObj;
            if (this._maximize) { this._resetScroller(); return; }
            if (this.model.position.X == "" || this.model.position.Y == "" && !this._minimize) this._centerPosition();
            parentObj = this._getParentObj();
            this._change = false;
            if (this._windowSize.outerWidth != $(window).outerWidth()) {
                if (this._sizeType.width == "%") this._percentageWidthDimension(parentObj);
                else this._pixelsWidthDimension(parentObj);
            }
            else if (this._windowSize.outerHeight != $(window).outerHeight()) {
                if (this._sizeType.height == "%") this._percentageHeightDimension(parentObj);
                else this._pixelsHeightDimension(parentObj);
            }
            this._change && this._resizeContainer(parentObj);
            this._windowSize = { outerWidth: $(window).outerWidth(), outerHeight: $(window).outerHeight() };
			this._centerPosition();
        },
        _setDimension:function(){
            if (ej.isNullOrUndefined(this.model.maxWidth)) {
                if (ej.isNullOrUndefined(this._sizeType.width)) this._maxWidth = +this.model.width;
                else if (this._sizeType.width == "px" || this._sizeType.width == "auto") this._maxWidth = this.model.width;
            } else this._maxWidth = this.model.maxWidth;
            if (ej.isNullOrUndefined(this.model.maxHeight)) {
                if (ej.isNullOrUndefined(this._sizeType.height)) this._maxHeight = +this.model.height;
                else if (this._sizeType.height == "px" || this._sizeType.height == "auto") this._maxHeight = this.model.height;
            } else this._maxHeight = this.model.maxHeight;
        },
        _percentageWidthDimension: function (parentObj) {
            this._ejDialog.outerWidth(this._convertPercentageToPixel(parentObj.outerWidth(), this._widthPercent));
            this._change = true;
        },
        _percentageHeightDimension: function (parentObj) {
            this._ejDialog.outerHeight(this._convertPercentageToPixel(parentObj.outerHeight(), this._heightPercent));
            this._change = true;
        },
        _pixelsWidthDimension: function (parentObj) {
            if ($(parentObj).outerWidth() <= this._ejDialog.outerWidth()) this._setWidth(parentObj);
            if (($(parentObj).outerHeight() <= this._ejDialog.outerHeight()) && !this.model.isResponsive) this._setHeight(parentObj);
            if (parseInt(this._ejDialog.css("width")) < parseInt(this._maxWidth)) {
                if (parseInt(this._maxWidth) < $(parentObj).outerWidth()) this._ejDialog.outerWidth((parseInt(this._maxWidth)));
                else this._ejDialog.outerWidth((parentObj.outerWidth()));
                this._change = true;
            }
        },
        _pixelsHeightDimension: function (parentObj) {
            if (($(parentObj).outerHeight() <= this._ejDialog.outerHeight()) && !this.model.isResponsive) this._setHeight(parentObj);
            if ($(parentObj).outerWidth() <= this._ejDialog.outerWidth()) this._setWidth(parentObj);
            if (parseInt(this._ejDialog.css("height")) < parseInt(this._maxHeight)) {
                if (parseInt(this._maxHeight) < $(parentObj).outerHeight()) this._ejDialog.outerWidth((parseInt(this._maxHeight)));
                else this._ejDialog.outerHeight((parentObj.outerHeight()));
                this._change = true;
            }
        },
        _setWidth: function (parentObj) {
            this._ejDialog.outerWidth((parentObj.outerWidth()));
            this._change = true;
        },
        _setHeight: function (parentObj) {
            this._ejDialog.outerHeight((parentObj.outerHeight()));
            this._change = true;
        },
        _resizeContainer: function (parentObj) {
            this.contentDiv.width(this._ejDialog.width());
            this.element.outerWidth(this.contentDiv.width());
            var contentDivheight = this._ejDialog.height() - ((this.model.showHeader) ? $(this._ejDialog.find("div.e-titlebar")).outerHeight(true) : 0);
            this.contentDiv.height((!ej.isNullOrUndefined(this.contentDiv)) ? (this.contentDiv.css('border-width') == "0px") : false ? contentDivheight : contentDivheight - 1);
            this.element.outerHeight((!ej.isNullOrUndefined(this.contentDiv)) ? (this.contentDiv.css('border-width') == "0px") : false ? contentDivheight : contentDivheight - 1);
            this.scroller = this.contentDiv.ejScroller({ width: (!ej.isNullOrUndefined(this.contentDiv)) ? (this.contentDiv.css('border-width') == "0px") ? this._ejDialog.width() : this._ejDialog.width() - 2 : false , height: (!ej.isNullOrUndefined(this.contentDiv)) ? (this.contentDiv.css('border-width') == "0px") ? this.element.outerHeight() : this.element.outerHeight() - 2 : false, rtl: this.model.rtl, enableTouchScroll: false });
            this.scroller = this.contentDiv.data("ejScroller");
            this._reRenderScroller();
            if ((this.model.position.X == "" || this.model.position.Y == "" && !this._minimize)||(this._positionChanged)) this._centerPosition();
            else this._ejDialog.css("height", this._dialogTitlebar.outerHeight());
            this._updateCaptionWidth();
            this._change = false;
        },
        _getLocalizedLabels:function(){
            return ej.getLocalizedConstants(this.sfType, this.model.locale);
        }, 

        _enableWindowResize: function () {
            return (this.model.isResponsive || ((isNaN(this.model.width) && (this.model.width.indexOf("%") > 0)) && (isNaN(this.model.height) && (this.model.height.indexOf("%") > 0) && (this.model.height != "auto")))) ? true : false;
        },

        _wireResizing: function () {             
            $(window)[(this._enableWindowResize() ? "on" : "off")]('resize', $.proxy(this._reSizeHandler, this));                        
        },

        _wireEvents: function () {
            this._on(this._ejDialog, "keydown", this._keyDown);
            this._on(this._ejDialog, "click", this._mouseClick);
            this._wireResizing();
        },

        refresh: function () {
            this._resetScroller();
        },

        open: function () {
            if (this._isOpen) return true;
            if (true == this._trigger("beforeOpen")) return false;
            this.element.css("display", "block");
            this._setZindex();
            if (!this._minimize && !this._maximize && !this._init) this._dialogPosition();
            var proxy = this, effect = {}, height;
            this._ejDialog.show();
            if (this.model.enableAnimation) {
                this._ejDialog.css({ "opacity": 0});
                if (this.model.animation.show.effect == "slide") {
                    var eLeft = this._ejDialog.css("left");
                    this._ejDialog.css({ "left": -this._ejDialog.width() });
                    effect = { left: eLeft, opacity: 1 };
                }
                else {
                    effect = { opacity: 1 };
                }
            }
            this._ejDialog.animate(effect, (this.model.enableAnimation ? Number(this.model.animation.show.duration) : 0), function () {
                if (proxy.model) {
					  if (proxy._ejDialog.css("display") == "none") proxy._ejDialog.show();
                    proxy._ejDialog.eq(0).focus();
                    proxy._ejDialog.css({ "opacity": "" });
                    proxy.contentDiv.find("a:visible:enabled, button:visible:enabled, :input:visible:enabled, select:visible:enabled, .e-input").first().focus();
                    proxy._trigger("open");
                    proxy._updateCaptionWidth();
					if(proxy.model.enableModal && !proxy.model.backgroundScroll)
					{
						if( proxy._ejDialog.height() > $(window).height()) proxy._ejDialog.css("height",$(window).height());
						proxy.model.height=$(window).height(); proxy._overLay.css("position","fixed");
						proxy.scroller.refresh(true); proxy.refresh();
					}
                    if (proxy.model.maxHeight || proxy.model.maxWidth)
                    {
                        height = proxy._ejDialog.outerHeight(true) - ((proxy._dialogTitlebar ? proxy._dialogTitlebar.outerHeight(true) : 0));
                        if ((proxy.model.height == "auto" || proxy.model.height == "100%"))
                            height = proxy.model.height;
                        proxy._updateScroller((!ej.isNullOrUndefined(this.contentDiv)) ? (this.contentDiv.css('border-width') == "0px") : false ? height : height - 2, (!ej.isNullOrUndefined(this.contentDiv)) ? (this.contentDiv.css('border-width') == "0px") : false ? proxy._ejDialog.width() : proxy._ejDialog.width() - 2);
						proxy.scroller.refresh();
                    }
                }
            });
            if (this.model.enableModal == true) this._createOverlay();
            this._isOpen = true;
            if (this.element.find("> .e-draggable.e-titlebar")) {
               var dragobject = $("#" + this.element.find("> .e-draggable.e-titlebar").attr("id")).data("ejDraggable");
                if (dragobject)
                    dragobject.option("cursorAt", this.element.offset());
            }
            return this;
        },

        close: function (event) {
            if (!this._isOpen || !this.model.enabled) return true;
            var isInteraction= event ? true : false;            
            if (true == this._trigger("beforeClose", { event: event,isInteraction:isInteraction })) return false;
            this._isOpen = false;
            var proxy = this, effect = {};
            if (this.model.enableAnimation) 
            effect = this.model.animation.hide.effect == "slide" ? { left: -this._ejDialog.width(), opacity: 0 } : { opacity: 0 };
            this._ejDialog.animate(effect, (this.model.enableAnimation ? Number(this.model.animation.hide.duration) : 0), function () {
                proxy._trigger("close", { event: event, isInteraction:isInteraction });
                proxy._ejDialog.hide();
            });
            if (this.model.enableModal){
                if (this._overLay) this._overLay.remove();
                if (!this.model.backgroundScroll) $("body").removeClass("e-dialog-modal");
            }
            return this;
        },

        isOpened: function () { return this.isOpen() },
        isOpen: function () { return this._isOpen; },

        setTitle: function (titleText) {
            this.model.title = titleText;
            this._titleText.text(titleText);
            this._updateCaptionWidth();
            return this;
        },

        setContent: function (htmlContent) {
            if (!this.model.enabled) return false;
            this.element.html(htmlContent);
            this._resetScroller();
            return this;
        },      

        focus: function () {
            this._setZindex();
            this.element.focus();
            return this;
        },

        minimize: function () {
			if(this.model.showHeader){
            this._actionMinimize();
            $(this.wrapper.find(".e-minus")[0]).parent().hide();
            return this;
			}
        },

        maximize: function () {
			if(this.model.showHeader){
            this._actionMaximize();
            $(this.wrapper.find(".e-maximize")[0]).removeClass("e-maximize").addClass("e-restore");
            $(this.wrapper.find(".e-restore")[1]).removeClass("e-restore").addClass("e-minus");
            this._dialogMaximize && this._dialogMaximize.attr('title', this.model.tooltip.restore);
            this._dialogTitlebar && this._dialogTitlebar.find(".e-minus").parent().show();
            this._hideIcon(true);
            return this;
			}
        },

        restore: function () {
			if(this.model.showHeader){
            var action = this._minimize;
            this._actionRestore();
            $(this.wrapper.find(".e-restore")[0]).removeClass("e-restore").addClass(action ? "e-minus" : "e-maximize");
            this._dialogMaximize && this._dialogMaximize.attr('title', this.model.tooltip.maximize);
            this._hideIcon(true);
            return this;
			}
        },

        pin: function () {
			if(this.model.showHeader){
            this.dialogPin = true;
            $(this.wrapper.find(".e-unpin")[0]).removeClass("e-unpin").addClass("e-pin");
            this._dialogPin && this._dialogPin.attr('title', this.model.tooltip.unPin);
            return this;
			}
        },

        unpin: function () {
            if(this.model.showHeader){
			this.dialogPin = false;
            $(this.wrapper.find(".e-pin")[0]).removeClass("e-pin").addClass("e-unpin");
            this._dialogPin && this._dialogPin.attr('title', this.model.tooltip.pin);
            return this;
			}
        },

        collapse: function () {
			if(this.model.showHeader){
            this._actionCollapse();
            this._collapseValue=true;
            return this;
			}
        },

        expand: function () {
			if(this.model.showHeader){
            this._actionExpand();
            return this;
			}
        }
    });
    
ej.Dialog.Locale = ej.Dialog.Locale || {} ;
    
ej.Dialog.Locale["default"] = ej.Dialog.Locale["en-US"] = {
    tooltip:{
                close: "Close",
                collapse: "Collapse",
                restore: "Restore",
                maximize: "Maximize",
                minimize: "Minimize",
                expand: "Expand",
                unPin: "UnPin",
                pin: "Pin"
            },
    title:"",
     //currently we have deprecated this API
    closeIconTooltip: "close"
};

})(jQuery, Syncfusion);;
/**
* @fileOverview Plugin to style the Html Button elements
* @copyright Copyright Syncfusion Inc. 2001 - 2015. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
* @version 12.1 
* @author <a href="mailto:licensing@syncfusion.com">Syncfusion Inc</a>
*/
(function ($, ej, undefined) {

    ej.widget("ejButton", "ej.Button", {

        element: null,

        model: null,
        validTags: ["button", "input"],
        _setFirst: false,

        _rootCSS: "e-button",
        _requiresID: true,

        defaults: {

            size: "normal",

            type: "submit",

            height: "",

            width: "",

            enabled: true,

            htmlAttributes: {},

            text: null,

            contentType: "textonly",

            imagePosition: "imageleft",

            showRoundedCorner: false,

            cssClass: "",

            prefixIcon: null,

            suffixIcon: null,

            enableRTL: false,

            repeatButton: false,

            timeInterval: "150",

            create: null,

            click: null,

            destroy: null
        },


        dataTypes: {
            size: "enum",
            enabled: "boolean",
            type: "enum",
            showRoundedCorner: "boolean",
            text: "string",
            contentType: "enum",
            imagePosition: "enum",
            prefixIcon: "string",
            suffixIcon: "string",
            cssClass: "string",
            repeatButton: "boolean",
            enableRTL: "boolean",
            timeInterval: "string",
            htmlAttributes: "data"
        },

        disable: function () {
            this.element.addClass("e-disable").attr("aria-disabled", true);
            this.model.enabled = false;
        },

        enable: function () {
            this.element.removeClass("e-disable").attr("aria-disabled", false);
            this.model.enabled = true;
        },

        _init: function () {
            this._cloneElement = this.element.clone();
            this._initialize();
            this._render();
            this._controlStatus(this.model.enabled);
            this._wireEvents(this.model.repeatButton);
            this._addAttr(this.model.htmlAttributes);
        },
        _addAttr: function (htmlAttr) {
            var proxy = this;
            $.map(htmlAttr, function (value, key) {
                if (key == "class") proxy.element.addClass(value);
                else proxy.element.attr(key, value);
                if (key == "disabled" && value == "disabled") proxy.disable();
            });
        },

        _destroy: function () {
            this._off(this.element, "blur", this._btnBlur);
            this.element.removeClass(this.model.cssClass + "e-ntouch e-btn e-txt e-select e-disable e-corner e-widget").removeAttr("role aria-describedby aria-disabled");
            !this._cloneElement.attr("type") && this.element.attr("type") && this.element.removeAttr("type");			
            this.element.removeClass("e-btn-" + this.model.size);
            this.model.contentType && this.model.contentType != "textonly" ? this.element.append(this._cloneElement.text()) && this.imgtxtwrap[0].remove() : "";
            
        },


        _setModel: function (options) {
            var option;
            for (option in options) {
                switch (option) {
                    case "size":
                        this._setSize(options[option]);
                        break;
                    case "height":
                        this._setHeight(options[option]);
                        break;
                    case "width":
                        this._setWidth(options[option]);
                        break;
                    case "contentType":
                        this._setContentType(options[option]);
                        break;
                    case "imagePosition":
                        this._setImagePosition(options[option]);
                        break;
                    case "text":
                        this._setText(options[option]);
                        break;
                    case "prefixIcon":
                        if (!this.element.is("input"))
                        this._setMajorIcon(options[option]);
                        break;
                    case "suffixIcon":
                        if (!this.element.is("input"))
                        this._setMinorIcon(options[option]);
                        break;
                    case "enabled":
                        this._controlStatus(options[option]);
                        break;
                    case "showRoundedCorner":
                        this._roundedCorner(options[option]);
                        break;
                    case "cssClass":
                        this._setSkin(options[option]);
                        break;
                    case "enableRTL":
                        this._setRTL(options[option]);
                        break;
                    case "timeInterval":
                        this.model.timeInterval = options[option];
                        break;
                    case "htmlAttributes": this._addAttr(options[option]); break;
                }
            }
        },


        _setSize: function (val) {
            this.element.removeClass('e-btn-mini e-btn-medium e-btn-small e-btn-large e-btn-normal');
            this.element.addClass("e-btn-" + val);
        },
        _setType: function (val) {
            this.element.prop({ "type": val });
        },

        _setHeight: function (val) {
            this.element.css('height', val);
        },

        _setWidth: function (val) {
            this.element.css('width', val);
        },

        _setText: function (val) {
            if (this.buttonType == "inputButton") {
                this.element.val(val);
            } else {
                if (this.model.contentType == ej.ContentType.TextOnly) {
                    this.element.html(val);
                } else {
                    this.textspan.html(val);
                }
            }
            this.model.text = val;
        },

        _setMajorIcon: function (val) {
            this.majorimgtag.removeClass(this.model.prefixIcon);
            this.majorimgtag.addClass(val);
            this.model.prefixIcon = val;
        },

        _setMinorIcon: function (val) {
            this.minorimgtag.removeClass(this.model.suffixIcon);
            this.minorimgtag.addClass(val);
            this.model.suffixIcon = val;
        },

        _setContentType: function (val) {
            if (val != this.model.contentType) {
                this.element.empty();
                this.model.contentType = val;
                if (!this.element.is("input"))
                this._renderButtonNormal();
            }
        },

        _setImagePosition: function (val) {
            if ((this.model.contentType == ej.ContentType.TextAndImage) && (val != this.model.imagePosition)) {
                this.element.empty();
                this.model.imagePosition = val;
                if (!this.element.is("input"))
                this._renderButtonNormal();
            }
        },

        _setRTL: function (val) {
            if (val) {
                this.element.addClass("e-rtl");
            } else {
                this.element.removeClass("e-rtl");
            }
        },

        _controlStatus: function (value) {
            if (!value) {
                this.disable();
            } else {
                this.enable();
            }
        },

        _setSkin: function (skin) {
            if (this.model.cssClass != skin) {
                this.element.removeClass(this.model.cssClass);
                this.element.addClass(skin);
            }
        },

        _initialize: function () {
            if(!ej.isTouchDevice()) this.element.addClass("e-ntouch");
            if (this.element.is("input")) {
                this.buttonType = "inputButton";
            }
            else if ((this.element.is("a")) || (this.element.is("button"))) {
                this.buttonType = "tagButton";
            }
            else {
                this.element.removeClass("e-button");
            }
            if (this.element.attr("type")) {
                this.model.type = this.element.attr("type");
            }
            else
                this._setType(this.model.type);
            this._timeout = null;
        },


        _render: function () {
            this._setSize(this.model.size);
            this._setHeight(this.model.height);
            this._setWidth(this.model.width);
            this._setRTL(this.model.enableRTL);
            this.element.addClass(this.model.cssClass + " e-btn e-select e-widget").attr("role", "button");
            if (this.buttonType == "inputButton") {
                this.element.addClass("e-txt");
                if ((this.model.text != null) && (this.model.text != "")) {
                    this.element.val(this.model.text);
                } else {
                    this.model.text = this.element.val();
                }
            } else { this._renderButtonNormal(); }
            this._roundedCorner(this.model.showRoundedCorner);
            if (this.element[0].id)
                this.element.attr("aria-describedby", this.element[0].id);
        },

        _renderButtonNormal: function () {
            if ((this.model.text == null) || (this.model.text == "")) {
                this.model.text = this.element.html();
            }
            this.element.empty();
            /*Image and Text*/
            this.textspan = ej.buildTag('span.e-btntxt', this.model.text);
            if (this.model.contentType.indexOf("image") > -1) {
                this.majorimgtag = ej.buildTag('span').addClass(this.model.prefixIcon);
                this.minorimgtag = ej.buildTag('span').addClass(this.model.suffixIcon);
                this.imgtxtwrap = ej.buildTag('span').addClass('e-btn-span');
            }

            if (this.model.contentType == ej.ContentType.TextAndImage) {
                switch (this.model.imagePosition) {
                    case ej.ImagePosition.ImageRight:
                        this.imgtxtwrap.append(this.textspan, this.majorimgtag);
                        break;
                    case ej.ImagePosition.ImageLeft:
                        this.imgtxtwrap.append(this.majorimgtag, this.textspan);
                        break;
                    case ej.ImagePosition.ImageBottom:
                        this.majorimgtag.attr("style", "display:inherit");
                        this.imgtxtwrap.append(this.textspan, this.majorimgtag);
                        break;
                    case ej.ImagePosition.ImageTop:
                        this.majorimgtag.attr("style", "display:inherit");
                        this.imgtxtwrap.append(this.majorimgtag, this.textspan);
                        break;
                }
                this.element.append(this.imgtxtwrap);
            } else if (this.model.contentType == ej.ContentType.ImageTextImage) {
                this.imgtxtwrap.append(this.majorimgtag, this.textspan, this.minorimgtag);
                this.element.append(this.imgtxtwrap);
            } else if (this.model.contentType == ej.ContentType.ImageBoth) {
                this.imgtxtwrap.append(this.majorimgtag, this.minorimgtag);
                this.element.append(this.imgtxtwrap);
            } else if (this.model.contentType == ej.ContentType.ImageOnly) {
                this.imgtxtwrap.append(this.majorimgtag);
                this.element.append(this.imgtxtwrap);
            } else {
                this.element.addClass("e-txt");
                this.element.html(this.model.text);
            }
        },

        _roundedCorner: function (value) {
            value == true ? this.element.addClass('e-corner') : this.element.removeClass('e-corner');
        },

        _wireEvents: function (val) {
            if (val) {
                this._on(this.element, "mousedown", this._btnRepatMouseClickEvent);
                this._on($(document), 'mouseup', this._mouseUpClick);
                this._on(this.element, "keyup", this._btnRepatKeyUpEvent);
                this._on($(document), "keypress", this._btnRepatKeyDownEvent);

            }
            this._on(this.element, "click", this._btnMouseClickEvent);
            this._on(this.element, "blur", this._btnBlur);
        },

        _btnBlur:function(e){
            this.element.removeClass("e-animate");
        },

        _btnMouseClickEvent: function (e) {
            var self = this;
            this.element.addClass("e-animate");
            if(!self.model.enabled) return false;
            if (!self.element.hasClass("e-disable")) {
                // here aregument 'e' used in serverside events 
                var args = { target: e.currentTarget, e : e , status:self.model.enabled};
				//Trigger _click function to apply scope changes
                self._trigger("_click", args);
                self._trigger("click", args);
            } 
        },

        _btnRepatMouseClickEvent: function (e) {
            var self = this;
            if(!self.model.enabled) return false;
            if (!self.element.hasClass("e-disable")) {
                var args = { status: self.model.enabled };
                if ((e.button == 0) || (e.which == 1)) {

                    self._timeout = setInterval(function () { self._trigger("click", { target: e.currentTarget, status: self.model.enabled }); }, this.model.timeInterval);
                }
            }
        },

        _mouseUpClick: function (event) {
            clearTimeout(this._timeout);
        },

        _btnRepatKeyDownEvent: function (e) {
            var self = this;
            if (!self.element.hasClass("e-disable")) {
                var args = { status: self.model.enabled };
                if ((e.keyCode == 32) || (e.keyCode == 13)) {
                    self._trigger("click", args);
                }
            }
        },

        _btnRepatKeyUpEvent: function (e) {
            if ((e.keyCode == 32) || (e.keyCode == 13)) {
                clearTimeout(this._timeout);
            }
        },
    });


    ej.ContentType = {
		/**  Supports only for text content only */
		TextOnly: "textonly", 
		/** Supports only for image content only */
		ImageOnly: "imageonly", 
		/** Supports image for both ends of the button */
		ImageBoth: "imageboth", 
		/** Supports image with the text content */
		TextAndImage: "textandimage", 
		/** Supports image with both ends of the text */
        ImageTextImage: "imagetextimage"
    };


    ej.ImagePosition = {
		/**  support for aligning text in left and image in right. */
		ImageRight: "imageright", 
		/**  support for aligning text in right and image in left. */
		ImageLeft: "imageleft",
		/**  support for aligning text in bottom and image in top. */
		ImageTop: "imagetop", 
		/**  support for aligning text in top and image in bottom. */
		ImageBottom: "imagebottom"
    };

    ej.ButtonSize = {
		/**  Creates button with inbuilt default size height, width specified */
		Normal : "normal",
		/**  Creates button with inbuilt mini size height, width specified */
		Mini: "mini", 
		/**  Creates button with inbuilt small size height, width specified */
		Small: "small",
		/**  Creates button with inbuilt medium size height, width specified */
		Medium:"medium", 
		/**  Creates button with inbuilt large size height, width specified */
        Large: "large"
    };

    ej.ButtonType = {
		/**  Creates button with inbuilt button type specified */
		Button : "button",
		/**  Creates button with inbuilt reset type specified */
		Reset: "reset", 
		/**  Creates button with inbuilt submit type specified */
		Submit: "submit"
    };
})(jQuery, Syncfusion);
;
/**
* @fileOverview Plugin to style the Html UL elements
* @copyright Copyright Syncfusion Inc. 2001 - 2015. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
* @version 12.1 
* @author <a href="mailto:licensing@syncfusion.com">Syncfusion Inc</a>
*/
(function ($, ej, undefined) {

    ej.widget("ejListBox", "ej.ListBox", {

        element: null,
        _ignoreOnPersist: ["dataSource", "query", "itemRequestCount", "fields", "create", "change", "select", "unselect", "itemDragStart", "itemDrag", "itemDragStop", "itemDrop", "checkChange", "destroy", "actionComplete", "actionFailure", "actionSuccess", "actionBegin", "itemDropped", "selected"],
        model: null,
        validTags: ["ul"],
        _setFirst: false,
        _rootCSS: "e-listbox",
        defaults: {
            itemsCount: null,
            totalItemsCount: null,
            dataSource: null,
            query: ej.Query(),
            itemRequestCount: 5,
            itemHeight:null,
            fields: {
                id: null,
                text: null,
                imageUrl: null,
                imageAttributes: null,
                spriteCssClass: null,
                htmlAttributes: null,
                tooltipText: null,
                selectBy: null,
                checkBy: null,
                groupBy: null,
                tableName: null,

                //deprecated field properties
                selected: null,
                category: null,
                toolTipText: null
            },
            height: "auto",
            width: "200",
            template: null,
            text: "",
            selectedIndex: null,
            checkedIndices: [],
            selectedIndices: [],
            cascadeTo: null,
            value: "",
            cssClass: "",
            targetID: null,
            htmlAttributes: {},
            showRoundedCorner: false,
            enableRTL: false,
            enabled: true,
            showCheckbox: false,
            allowVirtualScrolling: false,
            virtualScrollMode: "normal",
            enablePersistence: false,
            allowMultiSelection: false,
            allowDrag: false,
            allowDrop: false,
            enableIncrementalSearch: false,
            enableWordWrap:true,
            caseSensitiveSearch: false,
            loadDataOnInit: true,
            create: null,
            change: null,
            select: null,
            unselect: null,
            itemDragStart: null,
            itemDrag: null,
            itemDragStop: null,
            itemDrop: null,
            checkChange: null,
            destroy: null,
            actionComplete: null,
            actionSuccess: null,
            actionBeforeSuccess:null,
            focusIn:null,
            focusOut:null,
            actionFailure: null,
            actionBegin: null,
			cascade: null,
            sortOrder: "none",

            //Deprecated Members
            enableVirtualScrolling: false,
            checkAll: false,
            uncheckAll: false,
            enableLoadOnDemand: false,
            itemRequest: null,
            allowDragAndDrop: undefined,
            selectedItemIndex: null,
            enableItemsByIndex: null,
            checkItemsByIndex: null,
            disableItemsByIndex: null,
            uncheckItemsByIndex: null,
            itemDropped: null,
            selected: null,
            selectIndexChanged: null,
            selectedItems: [],
            checkedItems: [],
            checkedItemlist: [],
            selectedItemlist: [],
        },
        dataTypes: {
            cssClass: "string",
            itemsCount: "number",
            itemRequestCount: "number",
            allowDrag: "boolean",
            allowDrop: "boolean",
            enableWordWrap:"boolean",
            enableIncrementalSearch: "boolean",
            caseSensitiveSearch: "boolean",
            template: "string",
            targetID: "string",
            cascadeTo: "string",
            showRoundedCorner: "boolean",
            enableRTL: "boolean",
            enablePersistence: "boolean",
            enabled: "boolean",
            allowMultiSelection: "boolean",
            dataSource: "data",
            query: "data",
            checkedIndices: "data",
            selectedIndices: "data",
            htmlAttributes: "data",
            loadDataOnInit: "boolean",
            showCheckbox: "boolean",
            sortOrder: "enum"
        },
        observables: ["value", "dataSource"],
        value: ej.util.valueFunction("value"),
        dataSource: ej.util.valueFunction("dataSource"),
        enable: function () {
            if (this.listContainer.hasClass("e-disable")) {
                this.target.disabled = false;
                this.model.enabled = this.model.enabled = true;
                this.element.removeAttr("disabled");
                this.listContainer.removeClass('e-disable');
                if (this.model.allowMultiSelection) this.listContainer.removeClass("e-disable");
                var scroller = this.listContainer.find(".e-vscrollbar,.e-hscrollbar");
                if (this.model.showCheckbox) { 
                    var items = this.listContainer.find('li:not(.e-disable)');
                    items.find(".listcheckbox").ejCheckBox("enable");
                }
                if (scroller.length > 0)
                    this.scrollerObj.enable();
            }
        },
        disable: function () {
            if (!this.listContainer.hasClass("e-disable")) {
                this.target.disabled = true;
                this.model.enabled = this.model.enabled = false;
                this.element.attr("disabled", "disabled");
                this.listContainer.addClass('e-disable');
                if (this.model.allowMultiSelection) this.listContainer.addClass("e-disable");
                var scroller = this.listContainer.find(".e-vscrollbar,.e-hscrollbar");
                if (this.model.showCheckbox) this.element.find(".listcheckbox").ejCheckBox("disable");
                if (scroller.length > 0)
                    this.scrollerObj.disable();
            }
        },
        selectItemByIndex: function (index) {            
            var prevSelectedItem = this._lastEleSelect = this.model.selectedIndex, listitems= (this.listitems)?this.listitems:this.listitem;
			if(index!=0) index=parseInt(index);       
            if (index != null) {				
                if ((index > this.element.find("li:not('.e-ghead')").length) || (index < 0) || ((1 / index) == -Infinity))
					 index=this.model.selectedIndex;                    				
                var activeitem = $(this.element.find("li:not('.e-ghead')")[index]);
                if (!activeitem.hasClass("e-select")) {
                    this._activeItem = index;
                    this.element.children("li").removeClass("e-select");
                    this._selectedItems = [];
                    this.model.selectedIndices = [];
                    activeitem.addClass("e-select");
                    if (this.model.showCheckbox) {
                        if (!($(activeitem).find('.listcheckbox').ejCheckBox('isChecked'))) {
                            $(activeitem).find('.listcheckbox').ejCheckBox('option', 'checked', true);
                            activeitem.removeClass("e-select");
                            if (!($.inArray(this._activeItem, this._checkedItems) > -1)) this._checkedItems.push(this._activeItem);
                            if (!($.inArray(activeitem[0], this.model.checkedIndices) > -1)) this.model.checkedIndices.push(this._activeItem);
                        }
                    }
                    this._selectedItems.push(activeitem);
                    this.model.selectedIndices.push(index);
                    var selectData = this._getItemObject(activeitem, null);
                    selectData["isInteraction"] = false;
                    if (this.model.select)
                        this._trigger('select', selectData);
                }
            }
            if (this.model.cascadeTo) {
                this._activeItem = index;
                this._cascadeAction();
            }
            this._setSelectionValues()._onlistselection(prevSelectedItem, this._activeItem);;
        },
        checkItemByIndex: function (index) {
            if (typeof (index) == "number")
                this.checkItemsByIndices(index.toString());
        },
        uncheckItemByIndex: function (index) {
            if (typeof (index) == "number")
                this.uncheckItemsByIndices(index.toString());
        },
        checkItemsByIndices: function (index) {
            if ((ej.isNullOrUndefined(index))) return false;
            var checkitems = index.toString().split(',');
            if (checkitems.length > 0) {
                for (var i = 0; i < checkitems.length; i++) {
                    if (checkitems[i] != null) {
                        this._activeItem = parseInt(checkitems[i]);
                        if (this._activeItem < 0) this._activeItem = 0;
                        var activeitem = $(this.element.children("li:not('.e-ghead')")[this._activeItem]);
                        if (this.model.showCheckbox) {
                            if (!($(activeitem).find('.listcheckbox').ejCheckBox('isChecked'))) {
                                $(activeitem).find('.listcheckbox').ejCheckBox('option', 'checked', true);
                                this.checkedStatus = true;
                                if (!($.inArray(this._activeItem, this._checkedItems) > -1)) this._checkedItems.push(this._activeItem);
                                if (!($.inArray(activeitem[0], this.model.checkedIndices) > -1)) this.model.checkedIndices.push(this._activeItem);
                                var checkData = this._getItemObject(activeitem, null);
                                checkData["isInteraction"] = false;
                                if (this.model.checkChange)
                                    this._trigger('checkChange', checkData);
                            }
                        }
                    }
                }
            }
            this._setSelectionValues();
        },
        uncheckItemsByIndices: function (value) {
            if ((ej.isNullOrUndefined(value))) return false;
            var checkitems = value.toString().split(',');
            if (checkitems.length > 0) {
                for (var i = 0; i < checkitems.length; i++) {
                    if (checkitems[i] != null) {
                        var index = parseInt(checkitems[i]);
                        var unselectitem = $(this.element.children("li:not('.e-ghead')")[parseInt(index)]);
                        if (this.model.showCheckbox) {
                            if (($(unselectitem).find('.listcheckbox').ejCheckBox('isChecked'))) {
                                $(unselectitem).find('.listcheckbox').ejCheckBox('option', 'checked', false);
                                this.checkedStatus = false;
                                var itemIndex = $.inArray(index, this.model.checkedIndices);
                                if ($.inArray(index, this._checkedItems) > -1) this._checkedItems.splice(itemIndex, 1);
                                if (itemIndex > -1) this.model.checkedIndices.splice(itemIndex, 1);
                                var unselectData = this._getItemObject(unselectitem, null);
                                unselectData["isInteraction"] = false;
                                if (this.model.checkChange)
                                    this._trigger('checkChange', unselectData);
                            }
                        }
                    }
                }
            }
            this._setSelectionValues();
        },
        selectAll: function () {
            if (!this.model.showCheckbox && this.model.allowMultiSelection) {
                var activeItem = this.element.children("li:not('.e-ghead')");
                for (var i = 0; i < activeItem.length; i++) {
                    if (!$(activeItem[i]).hasClass("e-select") && !$(activeItem[i]).hasClass("e-disable")) {
                        $(activeItem[i]).addClass("e-select");
                        this._selectedItems.push($(activeItem[i]));
                        this.model.selectedIndices.push(i);
                        var selectData = this._getItemObject(activeItem, null);
                        selectData["isInteraction"] = false;
                        if (this.model.select)
                            this._trigger('select', selectData);
                    }
                }
            }
            this._setSelectionValues();
        },
        //Deprecated Method
        unSelectAll: function () { this.unselectAll(); },
        unselectAll: function () {
            if (!this.model.showCheckbox)
                this._removeListHover();
            this._setSelectionValues();
            return this;
        },
        //deprecated function
        selectItemsByIndex: function (value) {
            this.selectItemsByIndices(value);
        },
        selectItemsByIndices: function (value) {
            if (ej.isNullOrUndefined(value)) return false;
            var selectitems = value.toString().split(',');
            if (this.model.allowMultiSelection) {
                for (var i = 0; i < selectitems.length; i++) {
                    if (selectitems[i] != null && !isNaN(parseInt(selectitems[i])) && selectitems[i] < this.element.children('li').length) {
                        var index = parseInt(selectitems[i]);
                        this._activeItem = index;
                        var activeitem = $(this.element.children("li:not('.e-ghead')")[this._activeItem]);
                        if (!activeitem.hasClass("e-select")) {
                            activeitem.addClass("e-select");
                            this._selectedItems.push(activeitem);
                            this.model.selectedIndices.push(index);
                            if (this.model.showCheckbox) {
                                if (!($(activeitem).find('.listcheckbox').ejCheckBox('isChecked'))) {
                                    $(activeitem).find('.listcheckbox').ejCheckBox('option', 'checked', true);
                                    activeitem.removeClass("e-select");
                                    if (!($.inArray(this._activeItem, this._checkedItems) > -1)) this._checkedItems.push(this._activeItem);
                                    if (!($.inArray(activeitem[0], this.model.checkedIndices) > -1)) this.model.checkedIndices.push(this._activeItem);
                                }
                            }
                            var selectData = this._getItemObject(activeitem, null);
                            selectData["isInteraction"] = false;
                            if (this.model.select)
                                this._trigger('select', selectData);
                        }
                    }
                }
            }
            this._setSelectionValues();
        },
        //deprecated property
        unselectItemsByIndex: function (value) {
            this.unselectItemsByIndices(value);
        },
        unselectItemsByIndices: function (value) {
            var selectitems = value.toString().split(',');
            for (var i = 0; i < selectitems.length; i++) {
                if (selectitems[i] != null) {
                    var index = parseInt(selectitems[i]);
                    var activeitem = $(this.listItemsElement[index]);
                    this._activeItem = index;
                    activeitem.removeClass('e-active e-select');
                    if (this.model.showCheckbox) {
                        if (($(activeitem).find('.listcheckbox').ejCheckBox('isChecked'))) {
                            $(activeitem).find('.listcheckbox').ejCheckBox('option', 'checked', false);
                            var itemIndex = $.inArray(index, this.model.checkedIndices);
                            if ($.inArray(index, this._checkedItems) > -1) this._checkedItems.splice(itemIndex, 1);
                            if (itemIndex > -1) this.model.checkedIndices.splice(itemIndex, 1);
                        }
                    }
                    if (this.model.selectedIndex == index) this.model.selectedIndex = this._activeItem = null;
                    var itemIndex = this._selectedItems.indexOf(activeitem[0]);
                    this._selectedItems.splice(this.model.selectedIndices.indexOf(itemIndex), 1);
                    this.model.selectedIndices.splice(this.model.selectedIndices.indexOf(itemIndex), 1);

                    var unselectData = this._getItemObject(activeitem, null);
                    unselectData["isInteraction"] = false;
                    if (this.model.unselect)
                        this._trigger('unselect', unselectData);
                }
            }
            this._setSelectionValues();
        },
        unselectItemByIndex: function (index) {
            index = parseInt(index);
            var unselectitem = $(this.element.children("li:not('.e-ghead')")[index]);
            if (this.model.showCheckbox) {
                if (($(unselectitem).find('.listcheckbox').ejCheckBox('isChecked'))) {
                    $(unselectitem).find('.listcheckbox').ejCheckBox('option', 'checked', false);
                    var itemIndex = $.inArray(index, this.model.checkedIndices);
                    if ($.inArray(index, this._checkedItems) > -1) this._checkedItems.splice(itemIndex, 1);
                    if (itemIndex > -1) this.model.checkedIndices.splice(itemIndex, 1);
                }
            }
            if (unselectitem.hasClass('e-select')) {
                unselectitem.removeClass('e-active e-select');
                if (this.model.selectedIndex == index) this.model.selectedIndex = this._activeItem = null;
                var itemIndex = this._selectedItems.indexOf(unselectitem[0]);
                this._selectedItems.splice(this.model.selectedIndices.indexOf(itemIndex), 1);
                this.model.selectedIndices.splice(this.model.selectedIndices.indexOf(itemIndex), 1);
                var unselectData = this._getItemObject(unselectitem, null);
                unselectData["isInteraction"] = false;
                if (this.model.unselect)
                    this._trigger('unselect', unselectData);
            }
            this._setSelectionValues();
        },
        selectItemByText: function (text) {
            if (!ej.isNullOrUndefined(text))
            this[(this.model.allowMultiSelection ? "selectItemsByIndices" : "selectItemByIndex")](this.getIndexByText(text));
        },
        selectItemByValue: function (value) {
            this[(this.model.allowMultiSelection ? "selectItemsByIndices" : "selectItemByIndex")](this.getIndexByValue(value));
        },
        unselectItemByText: function (text) {
            this[(this.model.allowMultiSelection ? "unselectItemsByIndices" : "unselectItemByIndex")](this.getIndexByText(text));
        },
        unselectItemByValue: function (value) {
            this[(this.model.allowMultiSelection ? "unselectItemsByIndices" : "unselectItemByIndex")](this.getIndexByValue(value));
        },
        getSelectedItems: function () {
            var items = [], proxy = this;
            $(proxy.model.selectedIndices).each(function (index, elementIndex) {
                items.push(proxy.getItemByIndex(elementIndex));
            });
            return items;
        },
        getCheckedItems: function () {
            var items = [], proxy = this;
            $(proxy.model.checkedIndices).each(function (index, elementIndex) {
                items.push(proxy.getItemByIndex(elementIndex));
            });
            return items;
        },
        removeItem: function () {
            return this.removeSelectedItems();
        },
        removeItemByText: function (text) {
            if (ej.isNullOrUndefined(this.getItemByText(text))) return false;
            return this.removeItemByIndex(this.getItemByText(text).index);
        },
        hideSelectedItems: function () {
            var items = this.getSelectedItems();
            this._hideOrShowItemsByIndex(items, "hide");
        },
        hideCheckedItems: function () {
            var items = this.getCheckedItems();
            this._hideOrShowItemsByIndex(items, "hide");
        },
        _hideOrShowItemsByIndex: function (items, hideOrShow) {
            if ($.type(items) == "number") {
                if (hideOrShow == "hide") {
                    $(this.listItemsElement[items]).hide();
                    if ($(this.listItemsElement[items]).next().hasClass('e-ghead'))
                        $(this.listItemsElement[items]).prev().hide();
                }
                else {
                    $(this.listItemsElement[items]).show();
                    if ($(this.listItemsElement[items]).prev().hasClass('e-ghead'))
                        $(this.listItemsElement[items]).prev().show();
                }
            }
            else {
                for (var litem = 0; litem < items.length; litem++) {
                    if (hideOrShow == "hide")
                        items[litem].item ? items[litem].item.hide() : $(this.listItemsElement[items[litem]]).hide();
                    else
                        items[litem].item ? items[litem].item.show() : $(this.listItemsElement[items[litem]]).show();
                }
            }
            this._refreshScroller();
        },
        showItemsByIndices: function (items) {
            this._hideOrShowItemsByIndex(items, "show");
        },
        hideItemsByIndices: function (items) {
            this._hideOrShowItemsByIndex(items, "hide");
        },
        _hideOrShowItemsByValue: function (values, hideOrShow) {
            if ($.type(values) == "array") {
				for(var i=0;i < this.listItemsElement.length;i++){
					 for (var length = 0; length <= values.length; length++) {
                        if ($(this.listItemsElement[i]).attr("value") == values[length])
                            (hideOrShow == "hide") ? $(this.listItemsElement[i]).hide() : $(this.listItemsElement[i]).show();
                    }			
			 }                
            }
            else {
                for(var i=0;i < this.listItemsElement.length;i++){
                    if ($(this.listItemsElement[i]).attr("value") == values)
                        (hideOrShow == "hide") ? $(this.listItemsElement[i]).hide() :$(this.listItemsElement[i]).show();
                }
            }
            this._refreshScroller();
        },
        showItemsByValues: function (value) {
            this._hideOrShowItemsByValue(value, "show");
        },
        hideItemsByValues: function (value) {
            this._hideOrShowItemsByValue(value, "hide");
        },
        showItemByValue: function (value) {
            this._hideOrShowItemsByValue(value, "show");
        },
        hideItemByValue: function (value) {
            this._hideOrShowItemsByValue(value, "hide");
        },
        showItemByIndex: function (item) {
            this._hideOrShowItemsByIndex(item, "show");
        },
        hideItemByIndex: function (item) {
            this._hideOrShowItemsByIndex(item, "hide");
        },
        hide: function () {
            this.listContainer.hide();
        },
        show: function () {
            this.listContainer.show()
        },
        hideAllItems: function () {
            this.element.find("li:visible").hide()
            this._refreshScroller();
        },
        showAllItems: function () {
            this.element.find("li:hidden").show()
            this._refreshScroller();
        },
        _stateMaintained: function (index) {
            var lenth, len, value, j;
            this.model.disableItemsByIndex = [];
            this.model.selectedIndices = [];
            this.model.checkedIndices = [];
            if (this.model.selectedIndex >= index && this.model.selectedIndex != null) {
                if (this.model.selectedIndex == index || $(this.element.children()[index - 1]).hasClass('e-disable'))
                    this.model.selectedIndex = null;
                else if (this.model.selectedIndex != index)
                    this.model.selectedIndex -= 1;
            }
            len = $(index).length;
            if (len > 1) {
                for (var i = len; i >= 0; i--)
                    $(this.element.children()[index[i]]).remove();
                lenth = this.element.children().length;
                for (j = 0; j < lenth; j++)
                    if ($(this.element.children()[j]).hasClass('e-disable'))
                        this.model.disableItemsByIndex.push(j);
            }
            else {
                value = index - 1;
                for (value; value >= 0; value--) {
                    if ($(this.element.children()[value]).hasClass('e-disable'))
                        this.model.disableItemsByIndex.push(value);
                    if ($(this.element.children()[value]).hasClass('e-select'))
                        this.model.selectedIndices.push(value);
                    if ($(this.element.children()[value]).find('.listcheckbox').ejCheckBox('isChecked'))
                        this.model.checkedIndices.push(value);
                }
                index = parseInt(index) + 1;
                for (index; index < this._listSize; index++) {
                    if ($(this.element.children()[index]).hasClass('e-disable'))
                        this.model.disableItemsByIndex.push(index - 1);
                    if ($(this.element.children()[index]).hasClass('e-select'))
                        this.model.selectedIndices.push(index - 1);
                    if ($(this.element.children()[index]).find('.listcheckbox').ejCheckBox('isChecked'))
                        this.model.checkedIndices.push(index - 1);
                }
            }
        },
        removeAll: function () {
            if (ej.isNullOrUndefined(this.dataSource())) {
                var text = [], lbItems = this.element.find("li");
                $(lbItems).each(function (i, e) {
                    text.push($(this).text());
                    e.remove();
                });
                this._refreshItems();
                return text;
            }
            else if (!(this.dataSource() instanceof ej.DataManager)) {
                var elements = [], count = $(this.listItemsElement).length;
                for (var i = 0; i < count; i++) {
                    elements.push(this._getRemovedItems([parseInt(0)]));
                }
                return elements;
            }
        },
        removeItemByIndex: function (index) {
            var text, selectItem = this.model.selectedIndex,removedElem=this.element.find("li:not('.e-ghead')");
            if (ej.isNullOrUndefined(this.dataSource())) {
                text = $(removedElem[index]).remove().text();
                this._stateMaintained(index);
                this._refreshItems();
            }
            else if (!(this.dataSource() instanceof ej.DataManager)) text = this._getRemovedItems([parseInt(index)]);
            this.model.selectedIndex = (index == selectItem) ? null : index < selectItem ? selectItem - 1 : selectItem;
            return text;
        },
        removeSelectedItems: function () {
            if (this.model.showCheckbox) return false;
            if (ej.isNullOrUndefined(this.dataSource())) {
                var text = this.value();
                $(this.getSelectedItems()).each(function (i, e) {
                    e.item.remove()
                });
                this._refreshItems();
                return text;
            }
            else if (!(this.dataSource() instanceof ej.DataManager)) {
                this.model.selectedIndex = null;
                return this._getRemovedItems(this.model.selectedIndices);
            }
        },
        _getRemovedItems: function (index) {
            var removedItems = [];
            this._stateMaintained(index);
            this.value(null);
            this._activeItem = null;
            this.dataSource(this.dataSource().filter(function (e, i) {
                if (index.indexOf(i) != -1)
                    removedItems.push(e);
                else
                    return true;
            }));
            this.refresh(true);
            return removedItems;
        },
        getIndexByValue: function (value) {
            var index;
			for(var i=0;i < this.listItemsElement.length;i++){
				if($(this.listItemsElement[i]).attr("value") == value){
					index=i;
                    break;					
				}             
			}                     
			return index;
        },
        getIndexByText: function (text) {
            var index;
            if (this.model.allowMultiSelection) {
                var text = text.split(",");
                index = [];
            }
			for(var i=0;i < this.listItemsElement.length;i++){
				if (typeof text == "object") {
                    for (var j = 0; j < text.length; j++) {
                        if ($(this.listItemsElement[i]).text() == text[j]) {                           
                            index.push(i);                          
                            break;							
                        }
                    }
                }
                else if ($(this.listItemsElement[i]).text() == text) {
                    index = i;  
                    break;					
                }				
				}			                    
            return index;
        },
        getTextByIndex: function (index) {
            return $(this.element.find("li:not('.e-ghead')")[index]).text();
        },
        getItemByText: function (text) {
            var proxy = this, obj;
            this.listItemsElement.each(function () {
                if ($(this).text() == text) {
                    obj = proxy._getItemObject($(this));
                    return false;
                }
            });
            return obj;
        },
        getItemByIndex: function (index) {
            return this._getItemObject($(this.element.children("li:not('.e-ghead')")[index]));
        },
        getListData: function () {
            if (ej.DataManager && this.dataSource() instanceof ej.DataManager) {
                if(this.model.allowVirtualScrolling) {
                    this.listitems = this.element.find('li');
                    return this.listitems;
                }
                else
                    return this.listitems;
            }
            else if (this.dataSource()){
				if(this.model.sortOrder != "none" && !(this.mapCateg && this.mapCateg != ""))
				{
                    var sortQuery = ej.Query().sortBy(this.model.fields.text, this.model.sortOrder, true);
                    var sublist = ej.DataManager(this.dataSource()).executeLocal(sortQuery);              
				    return sublist;
				}
			
			     return this.dataSource();
		}
            else
                return;
        },
        enableItem: function (text) {
            var proxy = this;
            this.listItemsElement.each(function () {
                if ($(this).text() == text) {
                    $(this).removeClass("e-disable");
                    if (proxy.model.showCheckbox) $(this).find(".listcheckbox").ejCheckBox("enable");
                    proxy._disabledItems.splice($(this).index().toString());
                    return false;
                }
            });
        },
        disableItem: function (text) {
            var proxy = this;
            this.listItemsElement.each(function () {
                if ($(this).text() == text) {
                    $(this).addClass("e-disable");
                    if (proxy.model.showCheckbox) $(this).find(".listcheckbox").ejCheckBox("disable");
                    proxy._disabledItems.push($(this).index().toString());
                    return false;
                }
            });
        },
        moveUp: function () {
            var process = (this.model.fields.groupBy != null) ? (this.model.allowMultiSelection || this.model.showCheckbox) ? false : true : true;
            if (process) {
                this.checkedorselected = this.model.checkedIndices.length == 0 ? this.model.selectedIndices.reverse() : this.model.checkedIndices.reverse();
				this._checkstate(true);
               
            }
        },
				
        moveDown: function () {
            var process = (this.model.fields.groupBy != null) ? (this.model.allowMultiSelection || this.model.showCheckbox) ? false : true : true;
            if (process) {
                this.checkedorselected = this.model.checkedIndices.length == 0 ? this.model.selectedIndices : this.model.checkedIndices;   this._checkstate();
                }
        },
		
		_checkstate:function(ismoveup){			
			 var curItem = $(this.element.children("li:not('.e-ghead')")[this.checkedorselected[0]]);
                if ((ismoveup && !curItem.prev().hasClass("e-ghead")) || !curItem.next().hasClass("e-ghead") ) {
                    if (!ej.isNullOrUndefined(this.checkedorselected)) {
                        var selectIndex = 0;
                        var listval = this._getItem(this.checkedorselected[selectIndex]);
                        this._moveupdown(listval, selectIndex, ismoveup ? "up":"down");
                    }
                }			
		},
		
        _moveItem: function (item, list, direction) {
            var selectedItem = item, index = item.index(), moveup = (direction == "up"), movedown = (direction == "down");
			this._addListHover();
			this._getItem(this._selectedItem).removeClass("e-hover");
            if (moveup) {
                list.insertAfter(selectedItem);
                if (list.hasClass('e-disable') && $.inArray(index.toString(), this._disabledItems) > -1) {
                    this._disabledItems.splice($.inArray(index.toString(), this._disabledItems), 1);
                    this._disabledItems.push((index + 1).toString());
                }
				  this._selectedItem -= 1;
                  this._refreshItems();
            } else if (movedown) {
                list.insertBefore(selectedItem);
                if (list.hasClass('e-disable') && $.inArray(index.toString(), this._disabledItems) > -1) {
                    this._disabledItems.splice($.inArray(index.toString(), this._disabledItems), 1);
                    this._disabledItems.push((index - 1).toString());
                }
				 this._selectedItem += 1;
                 this._refreshItems();
            }
        },
        _moveupdown: function (list, index, direction) {

            var j = this.checkedorselected[index], next, k;
            var i = 0, i = j;
            while (i < $(this.element.children("li:not('.e-ghead')")).length) {
                next = $(this.element.children("li:not('.e-ghead')")[i]);
                if (ej.isNullOrUndefined(next)) break;
                if (next.hasClass("e-select") || next.find("span").hasClass("e-checkmark")) {
                    k = i;
                    direction == "down" ? eval(i++) : eval(i--);
                    continue;
                }
                else break;
            }
            if (!ej.isNullOrUndefined(next) && i < $(this.element.children("li")).length) this._moveItem(list, next, direction);

            if (index < this.checkedorselected.length) {
                var ele = $(this.element.children("li")[this.checkedorselected[index]]);
                if (ele.next().hasClass("e-select") || ele.next().find("span").hasClass("e-checkmark")) var oneafter = direction == "down" ? true : false;
                else if (ej.isNullOrUndefined(ele[0])) var oneafter = direction == "up" ? true : false;
                else if (ele.hasClass("e-select") || ele.find("span").hasClass("e-checkmark")) {
                    this._moveupdown(ele, index + 1, direction);
                }

            }

            var length = this.element.children("li:not('.e-ghead')").length;
            if (this.model.checkedIndices.length == 0) {
                this.model.selectedIndices = [];
                for (var i = 0; i < length; i++) {
                    if ($(this.element.children("li:not('.e-ghead')")[i]).hasClass('e-select'))
                        this.model.selectedIndices.push(i);
                }
            } else {
                this.model.checkedIndices = [];
                for (var j = 0; j < length; j++)
                    if ($.parseJSON($(this.element.children("li:not('.e-ghead')")[j]).find("span").attr("aria-checked")))
                        this.model.checkedIndices.push(j);
            }

        },


        checkAll: function () {
            if (!this.model.showCheckbox) return false;
            var items = this.element.find("li:not('.e-ghead')");
            for (var i = 0; i < items.length; i++) {
                if (!($(items[i].firstChild).find('.listcheckbox').ejCheckBox('isChecked'))) {
                    $(items[i].firstChild).find('.listcheckbox').ejCheckBox('option', 'checked', true);
                    this._checkedItems.push(items[i]);
                    this.model.checkedIndices.push(i);
                }
            }
			this._setSelectionValues();
            this.model.uncheckAll = false;
        },
        //Deprecated Method
        unCheckAll: function () { this.uncheckAll(); },
        uncheckAll: function () {
            if (!this.model.showCheckbox) return false;
            var items = this.element.find("li:not('.e-ghead')");
            for (var i = 0; i < items.length; i++)
                if ($(items[i].firstChild).find('.listcheckbox').ejCheckBox('isChecked'))
                    $(items[i].firstChild).find('.listcheckbox').ejCheckBox('option', 'checked', false);
            this._checkedItems = [];
            this.model.checkedIndices = [];
			this._setSelectionValues();
            this.model.checkAll = false;
        },
        addItem: function (val, index) {
            var text, value, id;
            var index = (!ej.isNullOrUndefined(index) && index <= this.element.find("li:not('.e-ghead')").length) ? index : this.element.find("li:not('.e-ghead')").length;
            var proxy = this, num = index;
            if (ej.isNullOrUndefined(this.dataSource())) {
                if (!(val instanceof Array)) {
					 if(this.model.fields.groupBy && typeof val == "object" ){ 
                          var _query = ej.Query().group(this.model.fields.groupBy);
                          var groupedList = ej.DataManager([val]).executeLocal(_query);
                            this.dataSource([]);  
                            for (var i = 0; i < groupedList.length; i++) {
							this._setMapFields();
                            this.dummyUl.push(ej.buildTag('li.e-ghead', groupedList[i].key)[0]);
                            this._loadlist(groupedList[i].items);
                            this.dataSource(this.dataSource().concat(groupedList[i].items));										
					               } 
					    }
					 else{						 
					     text = (typeof val == "object") ? val[this.model.fields.text] : val;
					     value = (!ej.isNullOrUndefined(this.model.fields.value)) ? val[this.model.fields.value] : "";
					     id = (!ej.isNullOrUndefined(this.model.fields.id)) ? val[this.model.fields.id] : "";
                    this.listitem = (this.element.find("li:not('.e-ghead')").length ?
                                        ((index - 1 < 0) ? $(this.element.find("li:not('.e-ghead')")[0]).before('<li role="option" value="' + value + '" id="' + id + '">' + text + '</li>') : $(this.element.find("li:not('.e-ghead')")[index - 1]).after('<li role="option" value="' + value + '" id="' + id + '">' + text + '</li>'))
                                         : $(this.element).html('<li role="option" value="' + value + '" id="' + id + '">' + text + '</li>'));
					 }
                    this.listitems = this.element.find("li:not('.e-ghead')");
                    this._addItemIndex = index;
                    if (this.model.showCheckbox) {
                        var $checkbox = ej.buildTag("input.listcheckbox e-align#popuplist" + (this.listitems.length - 1) + "_" + this._id, "", {}, {
                            type: "checkbox",
                            name: "list" + (this.listitems.length - 1)
                        });
                        $(this.listitems[index]).prepend($checkbox);
                        $($(this.listitems[index]).find(".listcheckbox")).ejCheckBox({
                            change: $.proxy(this._onClickCheckList, this)
                        });
                    }
                    if (this.model.allowDrag || this.model.allowDrop) this._enableDragDrop();
                    this._addItemIndex = null;
                    this._refreshItems();
                }
                else {
                    $(val).each(function (i, e) {
                        proxy.addItem(e, index);
                        index = index + 1;
                    })
                }
            }
            else if (!(this.dataSource() instanceof ej.DataManager)) {
                if (proxy.dataSource() instanceof Object) {
					var dup = new Object();
                    if (!(val instanceof Object)) {
                        dup[proxy.model.fields.text] = val;
                        val = dup;
                    }
                }
                else if (!(val instanceof Array)) val = [val];
                $(val).each(function (i, e) {
                    if(proxy.model.fields.groupBy==null||!ej.isNullOrUndefined(e[proxy.model.fields.groupBy])){
                    proxy.dataSource().splice(index, 0, e);
                    index = index + 1;
                 }
                })
                this.model.disableItemsByIndex = [];
                this.model.selectedIndices = [];
                this.model.checkedIndices = [];
                if (this.model.selectedIndex >= num)
                    this.model.selectedIndex += 1;
                var value = num - 1;
                for (value; value >= 0; value--) {
                    if ($(this.element.find("li:not('.e-ghead')")[value]).hasClass('e-disable'))
                        this.model.disableItemsByIndex.push(value);
                    if ($(this.element.find("li:not('.e-ghead')")[value]).hasClass('e-select'))
                        this.model.selectedIndices.push(value);
                    if ($(this.element.children()[value]).hasClass("e-checkmark"))
                        this.model.checkedIndices.push(value);
                }
                for (num; num < this._listSize; num++) {
                    if ($(this.element.find("li:not('.e-ghead')")[num]).hasClass('e-disable'))
                        this.model.disableItemsByIndex.push(num + 1);
                    if ($(this.element.find("li:not('.e-ghead')")[num]).hasClass('e-select'))
                        this.model.selectedIndices.push(num + 1);
                    if ($(this.element.find("li:not('.e-ghead')")[num]).find('.listcheckbox').ejCheckBox('isChecked'))
                        this.model.checkedIndices.push(num + 1);
                }
                this.refresh(true);
				this.listItemsElement=this.element.find("li:not('.e-ghead')");
            }
        },
        enableItemByIndex: function (index) {
            if (typeof (index) == "number")
                this.enableItemsByIndices(index.toString());
        },
        disableItemByIndex: function (index) {
            if (typeof (index) == "number")
                this.disableItemsByIndices(index.toString());
        },
        disableItemsByIndices: function (value) {
            if (ej.isNullOrUndefined(value)) return false;
            var selectitems = value.toString().split(',');
            for (var i = 0; i < selectitems.length; i++) {
                if (selectitems.length > 0 && !($.inArray(selectitems[i], this._disabledItems) > -1)) {
                    var disable = $(this.element.children("li:not('.e-ghead')")[parseInt(selectitems[i])]).addClass('e-disable');
                    disable.find(".listcheckbox").ejCheckBox("disable");
                    this._disabledItems.push(selectitems[i]);
                }
            }
        },
        enableItemsByIndices: function (value) {
            var selectitems = value.toString().split(','), index;
            for (var i = 0; i < selectitems.length; i++) {
                if (selectitems.length > 0 && ($.inArray(selectitems[i], this._disabledItems) > -1)) {
                    index = $.inArray(selectitems[i], this._disabledItems);
                    var enable = $(this.element.children("li:not('.e-ghead')")[parseInt(selectitems[i])]).removeClass('e-disable');
                    enable.find(".listcheckbox").ejCheckBox("enable");
                    this._disabledItems.splice(index, 1);
                }
            }
        },
        _init: function () {
            this._id = this.element[0].id;
            this._isMozilla = ej.browserInfo().name == "mozilla" ? true : false;
            this._cloneElement = this.element.clone();
            this._deprecatedValue()._initialize()._render()._wireEvents();
            this._initValue = this.focused = this.datamerged = this.groupData = false;
            this._typeInterval = null;
            this._dummyVirtualUl = [];
            this._virtualCount = 0;
            this._liItemHeight = 0;
            this._typingThreshold = 2000;
            this._dataUrl = this.dataSource();
            //deprecatedFunction
            if (this.model.checkAll)
                this.checkAll();
            if (this.model.uncheckAll)
                this.uncheckAll();
            if (this.model.disableItemsByIndex)
                this.disableItemsByIndices(this.model.disableItemsByIndex.toString());
            if (this.model.enableItemsByIndex)
                this.enableItemsByIndices(this.model.enableItemsByIndex.toString());
            if (this.model.uncheckItemsByIndex)
                this.uncheckItemsByIndices(this.model.uncheckItemsByIndex.toString());
            this._deprecatedValue()._enabled(this.model.enabled);
			if(this.listContainer)
			  this.listContainer.attr("role","listbox");
		    this.element.children("li").attr("role","option");

        },
        _deprecatedValue: function () {
            this.model.itemDrop = (this.model.itemDrop || this.model.itemDropped);
            this.model.change = (this.model.change || this.model.selectIndexChanged);
            this.model.fields.checkBy = this.model.fields.selected || this.model.fields.checkBy;
            this.model.fields.tooltipText = this.model.fields.toolTipText || this.model.fields.tooltipText;
            this.model.fields.groupBy = this.model.fields.category || this.model.fields.groupBy;
            this.model.select = (this.model.select || this.model.selected);
            if (this.model.allowDragAndDrop != undefined)
                this.model.allowDrag = this.model.allowDrop = true;
            this.model.selectedIndex = this.model.selectedIndex != null ? this.model.selectedIndex : this.model.selectedItemIndex;
            this.model.checkedIndices = ((this.model.checkedIndices.length ? this.model.checkedIndices : null) || (this.model.checkItemsByIndex ? this.model.checkItemsByIndex : null) || (this.model.checkedItems.length ? this.model.checkedItems : null) || (this.model.checkedItemlist.length ? this.model.checkedItemlist : []));
            this.model.selectedIndices = ((this.model.selectedIndices.length ? this.model.selectedIndices : null) || (this.model.selectedItems.length ? this.model.selectedItems : null) || (this.model.selectedItemlist.length ? this.model.selectedItemlist : []));
            return this;
        },
        _setModel: function (options) {
            var option, refresh = false;
            for (option in options) {
                switch (option) {
                    case "value":
                        this._setText(ej.util.getVal(options[option]));
                        break;
                    case "dataSource":
                        if (!ej.isNullOrUndefined(this._isCasCadeTarget))
                            this.model.selectedIndex = null;
						this.model.checkedIndices = [];
                        options[option] = ej.util.getVal(options[option])
                        this._checkModelDataBinding(options[option]);
                        break;
                    case "query":
                        this._queryCheck(options[option]);
                        break;
                    case "fields":
                        this.model.fields = $.extend(this.model.fields, options[option]);
                        this._checkModelDataBinding(this.dataSource());
                        break;
                    case "template":
                        this.model.template = options[option];
                        this.refresh(true);
                        break;
                    case "loadDataOnInit":
                        this._loadContent = options[option];
                        this._checkModelDataBinding(this.dataSource());
                        break;
                    case "enableRTL":
                        this.model.enableRTL = options[option];
                        (this.model.enableRTL) ? this.listContainer.addClass("e-rtl") : this.listContainer.removeClass("e-rtl");
                        break;
                    case "enabled":
                        this.model.enabled = options[option];
                        this._enabled(options[option]);
                        break;
				    case "enableWordWrap":
					      this.model.enableWordWrap=options[option];
					      this._wordWrapItems(options[option]);
						  break;
                    case "height":
                    case "width":
                        this.model[option] = options[option];
                        this._setDimensions();
                        break;
                    case "cssClass":
                        this.model.cssClass = options[option];
                        this.listContainer.addClass(this.model.cssClass);
                        break;
                    case "showCheckbox":
                        this._checkboxHideShow(options[option]); if (options[option]) this._removeListHover();
                        break;
                    case "showRoundedCorner":
                        this.model.showRoundedCorner=options[option];
                        this._roundedCorner();
                        break;
                    case "selectedItemIndex":
                    case "selectedIndex":
                         if (this.listitem[options[option]] || options[option] == null || this.listitems[options[option]]) {
                            this.selectItemByIndex(options[option]);
                            this.model.selectedIndex = this.model.selectedItemIndex = options[option];
                        } else options[option] = this.model.selectedIndex;
                        break;
                    case "sortOrder":
                        this.model.sortOrder = options[option];
						this.display = true;
                        if (this.dataSource() != null)
                            this._showFullList();
                        else
                            this._renderlistContainer();
                        break;
                    case "checkItemsByIndex":
                    case "checkedItemlist":
                    case "checkedItems":
                    case "checkedIndices":
                        this.uncheckAll();
                        this.checkItemsByIndices(options[option].toString());
                        options[option] = this.model[option] = this.model.checkedIndices;
                        break;
                    case "uncheckItemsByIndex":
                        this.uncheckItemsByIndices(options[option].toString());
                        this.model[option] = options[option];
                        break;
                    case "selectedItemlist":
                    case "selectedItems":
                    case "selectedIndices":
                        this.unselectAll();
                        this.selectItemsByIndices(options[option].toString());
                        options[option] = this.model.selectedIndices;
                        break;
                    case "enableItemsByIndex":
                        this.model[option] = options[option];
                        this.enableItemsByIndices(options[option].toString());
                        break;
                    case "disableItemsByIndex":
                        this.model[option] = options[option];
                        this.disableItemsByIndices(options[option].toString());
                        break;
                    case "enableVirtualScrolling":
                        this.model.allowVirtualScrolling = options[option]; refresh = true;
                        break;
                    case "allowDrag":
                    case "allowDrop":
                    case "allowDragAndDrop":
                    case "allowVirtualScrolling":
                    case "virtualScrollMode":
                        this.model[option] = options[option]; refresh = true;
                        break;
                    case "checkAll":
                        this.model[option] = options[option]; if (options[option]) this.checkAll(); else this.uncheckAll();
                        break;
                    case "uncheckAll":
                        this.model[option] = options[option]; if (options[option]) this.uncheckAll(); else this.checkAll();
                        break;
                    case "htmlAttributes":
                        this._addAttr(options[option]);
                        break;
                    case "itemsCount":
                        var items = this.model.itemsCount;
                        if (this.model.height) {
                            this.model.itemsCount = options[option];
                            this._setItemsCount()._setDimensions();
                        } else options[option] = items;
                        break;
                    case "itemHeight":
                        var $liElements = this.listItemsElement;
                        var optionHeight = ej.isNullOrUndefined(options[option]) ? options[option] : options[option].toString().replace("px", "");
                        var modelHeight= ej.isNullOrUndefined(this.model.itemHeight) ? this.model.itemHeight :this.model.itemHeight.toString().replace("px", "");
                        for (var z = 0; z < $liElements.length; z++) {
                            var style = ej.isNullOrUndefined(options[option]) ? { "min-height": ej.isNullOrUndefined(this.model.itemHeight)? "20px":modelHeight } : { "min-height": optionHeight + "px", "height": optionHeight + "px" };
                            $liElements.eq(z).css(style);
                        } this.refresh();
                        break;
                    case "allowMultiSelection":
                        this.model.allowMultiSelection = options[option];
                        if (!options[option]) {
                            var index = this.model.selectedIndex;
                            this._removeListHover();
                            ej.isNullOrUndefined(index) ? "" : this.selectItemByIndex(index);
                        };
                        break;
                    case "totalItemsCount":
                        if (!ej.isNullOrUndefined(this.dataSource())) {
                            this.model.totalItemsCount = options[option];
                            if (this.model.query)
                                this._queryCheck(this.model.query);
                        }
                        break;
                }
            }
            if (refresh) this._refresh();
        },
        _destroy: function () {
            if (!ej.isNullOrUndefined(this._lilist)) $(this._lilist).ejDraggable("destroy");
            this.element.insertAfter(this.listContainer);
            this.element.find(".e-chkbox-wrap").remove();
            this.listContainer.remove();
			this.element.removeClass("e-ul");
            if (!this._isList) this.element.empty();
            $(window).off("resize", $.proxy(this._OnWindowResize, this));
			this._ListEventUnbind(this.element.children("li"));
            return this;
        },
		_ListEventUnbind: function (_ListItemsContainer) {
			_ListItemsContainer.off("contextmenu", $.proxy(this._OnMouseContext, this));
            _ListItemsContainer.off("click", $.proxy(this._OnMouseClick, this));
            _ListItemsContainer.off("touchstart mouseenter", $.proxy(this._OnMouseEnter, this));
            _ListItemsContainer.off("touchend mouseleave", $.proxy(this._OnMouseLeave, this));
		},
        _refresh: function () {
            this._destroy()._init();
        },
        _finalize: function () {
            if (this.model.selectedIndex != null)
                this.selectItemByIndex(this.model.selectedIndex);
            else if ((this.model.showCheckbox == true) && (this._selectedItems.length > 0))
                this._selectCheckedItem(this._selectedItems);
            if (this.model.checkedIndices != null) this.checkItemsByIndices(this.model.checkedIndices.toString());
            return this;
        },
        _initialize: function () {
            this._isList = this.element.children().length ? true : false;
            this.target = this.element[0];
            this._queryString = null;
            this._disabledItems = [];
            this._itemId = null;
            this._up = this._down = this._ctrlClick = false;
            this.checkedStatus = this._isScrollComplete = false;
            this._incqueryString = "";
            this._totalCount = 0;
            this._activeItem = null;
            this._initValue = true;
            this.model.allowVirtualScrolling = (this.model.allowVirtualScrolling) ? this.model.allowVirtualScrolling : this.model.enableLoadOnDemand;
            this.model.virtualScrollMode = (this.model.enableVirtualScrolling) ? "continuous" : this.model.virtualScrollMode;
            this._selectedItems = [];
            this._checkedItems = [];
            this._loadContent = this.model.loadDataOnInit;
            this._loadInitialRemoteData = true;
            this._skipInitialRemoteData = false;
            if (this.model.enableVirtualScrolling) this.model.allowVirtualScrolling = true;
            this._setItemsCount();
            return this;
        },
        _render: function () {
            this._savedQueries = this.model.query.clone();
            if (this.model.totalItemsCount)
                this._savedQueries.take(this.model.totalItemsCount);
            this._renderContainer()._addAttr(this.model.htmlAttributes);
            if (ej.DataManager && this.dataSource() instanceof ej.DataManager) {
                if (this._loadInitialRemoteData)
                    this._initDataSource(this.dataSource());
            }
            else
                this._showFullList();
            if (!this.dataSource()) this._finalize();
			this.listItemsElement=this.element.find("li:not('.e-ghead')");
            if (this.model.showRoundedCorner)
                this._roundedCorner();
            return this;
        },
        _queryCheck: function (value) {
            this._savedQueries = value.clone();
            this.element.empty();
            if (this.dataSource())
                this._checkModelDataBinding(this.dataSource());
        },
        _checkModelDataBinding: function (source) {
            this.mergeValue = null;
            this.dataSource(source);
            if (source != null && source.length != 0) {
                if (ej.DataManager && source instanceof ej.DataManager) this._initDataSource(source);
                else this._showFullList();
            } else { this.element.empty(); this._refreshScroller(); }
        },
        _initDataSource: function (source) {
            var proxy = this;
			if (proxy.model.actionBegin)
            proxy._trigger("actionBegin", {});
            proxy.listitems = proxy.dataSource();
            proxy._updateLoadingClass(true);
            var queryPromise = source.executeQuery(this._getQuery());
            queryPromise.done(function (e) {
                proxy._totalCount = e.count;
                proxy.listitems = e.result;
                proxy._updateLoadingClass()._showFullList()._trigger("actionSuccess", e);
                proxy._finalize();
                proxy._virtualPages = [0];
            }).fail(function (e) {
                proxy.dataSource(null);
                proxy._updateLoadingClass(true)._trigger("actionFailure", e);
            }).always(function (e) {
                if (proxy.model.checkAll)
                    proxy.checkAll();
                if (proxy.model.uncheckAll)
                    proxy.uncheckAll();
                proxy._trigger("actionComplete", e);
            });
        },
        _getQuery: function () {
            var queryManager;
            if (ej.isNullOrUndefined(this.model.query)) {
                var column = [],
                    mapper = this.model.fields;
                queryManager = ej.Query();
                for (var col in mapper)
                    if (col !== "tableName") column.push(mapper[col]);
                if (column.length > 0) queryManager.select(column);
                if (!this.dataSource().dataSource.url.match(mapper.tableName + "$")) !ej.isNullOrUndefined(mapper.tableName) && queryManager.from(mapper.tableName);
            } else queryManager = this.model.query.clone();
            if(this.model.allowVirtualScrolling) {
                queryManager.requiresCount();
                queryManager.take(this.model.itemRequestCount);
            }
            return queryManager;
        },
        _getLiHeight: function () {
            this._liItemHeight = $(this.element.find('li')[0]).outerHeight();
        },
        _addDragableClass: function () {
            if (this.model.allowDrag || this.model.allowDrop) {
                this.element.css("cursor", "pointer");
                if (this.model.allowDrop) {
                    this.listContainer.addClass("e-droppable");
                    this.listBoxScroller.addClass("e-droppable");
                }
                var proxy = this;
                this.element.children("li").each(function (index) {
                    if (proxy.model.allowDrag) ($(this).addClass("e-draggable"));
                    if (proxy.model.allowDrop) ($(this).addClass("e-droppable"));
                });
            }
            return this;
        },
        _enableDragDrop: function () {
            if (this.model.allowDrag || this.model.allowDrop) this._drag();
        },
        _updateLoadingClass: function (value) {
            this.listContainer[(value ? "addClass" : "removeClass")]("e-load"); return this;
        },
        _addAttr: function (htmlAttr) {
            var proxy = this;
            $.map(htmlAttr, function (value, key) {
                if (key == "class") proxy.listContainer.addClass(value);
                else if (key == "required") proxy.element.attr(key, value);
                else if (key == "disabled" && value == "disabled") proxy._enabled(false);
                else proxy.listContainer.attr(key, value);
            });
        },
        _renderContainer: function () {
            this.listContainer = ej.buildTag("div.e-ddl-popup e-box e-popup e-widget " + this.model.cssClass, "", {
                "visibility": "hidden"
            }, {
                "tabIndex": 0,
                "id": this._id + "_container"
            });
            this.listBoxScroller = ej.buildTag("div.e-listbox-container");
            this.ultag = ej.buildTag("ul.e-ul", "", {}, {
                "role": "listbox"
            });
            this.element = this.element.addClass("e-ul");
            this.listContainer.append(this.listBoxScroller).insertAfter(this.element);
            this.listBoxScroller.append(this.element);
            this.element.attr('data-ej-unselectable', 'on').css('user-select', 'none');
            this._hiddenInput = ej.buildTag("input#" + this._id + "_hidden", "", {}, {
                type: "hidden"
            }).insertBefore(this.element);
            this._hiddenInput.attr('name', this._id);
            return this;
        },
        _setMapFields: function () {
           var mapper = this.model.fields;
            this.mapFld = {
                _id: null,
                _imageUrl: null,
                _imageAttributes: null,
                _tooltipText: null,
                _spriteCSS: null,
                _text: null,
                _value: null,
                _htmlAttributes: null,
                _selectBy: null,
                _checkBy: null
            };
            this.mapFld._id = (mapper && mapper.id) ? mapper["id"] : "id";
            this.mapFld._imageUrl = (mapper && mapper.imageUrl) ? mapper["imageUrl"] : "imageUrl";
            this.mapFld._tooltipText = (mapper && mapper.tooltipText) ? mapper["tooltipText"] : "tooltipText";
            this.mapFld._imageAttributes = (mapper && mapper.imageAttributes) ? mapper["imageAttributes"] : "imageAttributes";
            this.mapFld._spriteCSS = (mapper && mapper.spriteCssClass) ? mapper["spriteCssClass"] : "spriteCssClass";
            this.mapFld._text = (mapper && mapper.text) ? mapper["text"] : this.listitems[0].text ? "text" : this._getObjectKey(this.listitems[0])[0];
            this.mapFld._value = (mapper && mapper.value) ? mapper["value"] : "value";
            this.mapFld._htmlAttributes = (mapper && mapper.htmlAttributes) ? mapper["htmlAttributes"] : "htmlAttributes";
            this.mapFld._checkBy = (mapper && mapper.checkBy) ? mapper["checkBy"] : "checkBy";
            this.mapFld._selectBy = (mapper && mapper.selectBy) ? mapper["selectBy"] : "selectBy";
            this.mapCateg = (mapper && mapper.groupBy) ? mapper["groupBy"] : ""
        },
        _getObjectKey: function (obj) {
            if (!Object.keys) {
                var keys = [];
                for (var i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        keys.push(i);
                    }
                }
                return keys;
            }
            else return Object.keys(obj)
        },
        _itemStyle:function(){
            var height = ej.isNullOrUndefined(this.model.itemHeight) ? this.model.itemHeight : this.model.itemHeight.toString().replace("px", "");
            var itemHeight = ej.isNullOrUndefined(this.model.itemHeight) ? "" : "min-height:" + height + "px;height:" + height + "px";
            return { style: itemHeight }
        },
        sort: function () {
            var sortedlist = document.createElement("ul"), i, sortitems;
            $(sortedlist).append(this.itemsContainer.children());
            if (this.model.fields.groupBy != null || $(sortedlist).find(">.e-ghead").length > 0) {
                for (i = 0; i < $(sortedlist).find(">.e-ghead").length; i++) {
                    sortitems = $(sortedlist).find(">.e-ghead").eq(0).first().nextUntil(".e-ghead").get();
                    this._setSortList(sortedlist, sortitems);
                }
                var headerlist = document.createElement("ul"), headeritems, j;
                headeritems = $(sortedlist).clone().find('>.e-ghead').get();
                for (var k = 0; k < headeritems.length; k++)
                    headerlist.append(headeritems[k]);
                var headerdata = this._customSort(headerlist, headeritems);
                var groupSort = document.createElement("ul"), groupitems;
                var temp = $(sortedlist).find('li.e-ghead').get();
                if (this.model.sortOrder.toLowerCase() == "descending")
                    headerdata.reverse();
                for (var j = 0; j < headerdata.length; j++) {
                    groupSort.append(headerdata[j]);
                    for (var l = 0; l < temp.length; l++) {
                        if (headerdata[j].textContent == temp[l].textContent) {
                            groupitems = $(sortedlist).find(">.e-ghead").eq(l).first().nextUntil(".e-ghead").get();
                            for (var m = 0; m < groupitems.length; m++) {
                                groupSort.append(groupitems[m]);
                            }
                        }
                    }
                }
                this.itemsContainer = $(groupSort);
            }
            else {
                sortitems = $(sortedlist).children('li').get();
                this._setSortList(sortedlist, sortitems);
                this.itemsContainer = $(sortedlist)
            }
        },
        _customSort: function (headerlist, headeritems) {
            headeritems.sort(function (objA, objB) {
                var sortA = $(objA).text().toUpperCase();
                var sortB = $(objB).text().toUpperCase();
                return (sortA < sortB) ? -1 : (sortA > sortB) ? 1 : 0;
            });
            return headeritems;
        },
        _setSortList: function (sortedlist, sortitems) {
            this._customSort(sortedlist, sortitems);
            if (this.model.sortOrder.toLowerCase() == "descending") sortitems.reverse();
            if (this.model.fields.groupBy != null || $(sortedlist).find(">.e-ghead").length > 0) {
                $(sortedlist).append($("<li>").text($(sortedlist).find(">.e-ghead").eq(0).text()).addClass("e-ghead"));
                $(sortedlist).find(">.e-ghead").eq(0).remove();
            }
            $.each(sortitems, function (index, item) {
                $(sortedlist).append(item);
            });
        },
        _renderlistContainer: function () {
            this.hold = this.touchhold = false;
            this.item = "";
            this.startime = 0;
            this.listitemheight = 24;
            var list = this.listitems,
                i, ulempty, ulno, litag, _id, _txt, mapper = this.model.fields,
                predecessor;
            this.lastScrollTop = -1;
            this.dummyUl = $();
            if (this.model.enableRTL) this.listContainer.addClass("e-rtl");
            this._wordWrapItems();
            if (this.dataSource() == null || this.dataSource().length < 1) {
                predecessor = this.element.parents().last();
                if (this.model.targetID) this.docbdy = predecessor.find("#" + this.model.targetID);
                else this.docbdy = predecessor.find("#" + this._id);
                this.itemsContainer = this.docbdy;
                if(this.model.sortOrder != "none") this.sort();
                this.itemsContainer.children("ol,ul").remove();
                this.items = this.itemsContainer.children('li');
                this.items.children("img").addClass("e-align");
                this.items.children("div").addClass("e-align");
                var iHeight = parseInt(this.model.itemHeight) + "px";
                if (this.model.itemHeight) $('li').css({ "min-height": iHeight, "height": iHeight });
                this.element.append(this.itemsContainer.children());
            }
            else if (this.dataSource() != null && typeof list[0] != "object") {
                if (this._loadInitialRemoteData && this.mergeValue && this.model.virtualScrollMode == "continuous" && this.model.totalItemsCount)
                    this._loadlist(this.mergeValue);
                else if (this._loadInitialRemoteData && this.mergeValue && this.model.virtualScrollMode == "normal" && this.model.totalItemsCount) {
                    this.realUllength = 0;
                    this.mergeUl = [];
                    for (i = 0; i < this.mergeValue.length; i++)
                         this.mergeUl.push(ej.buildTag('li', this.mergeValue[i][this.model.fields.text], null, this._itemStyle())[0]);
                    this.element.append(this.mergeUl);
                    for (i = 0; i < this.model.totalItemsCount - this.mergeValue.length; i++)
                        this.dummyUl.push(ej.buildTag('li', null, null, this._itemStyle())[0]);
                    this.element.append(this.dummyUl);
                    this._refreshScroller();
                }
                else if (this._loadInitialRemoteData && this.mergeValue && !this.model.totalItemsCount)
                    this._initDataSource(this.dataSource());
            }
            else {
                this._setMapFields();
                var groupedList, _query;
                _query = this._savedQueries;
                this.listContainer.height(this.model.height);
                this.listitemheight = 24;
                if (this.model.allowVirtualScrolling) {
                    if (this.model.virtualScrollMode == "normal") {
                        this.realUllength = 0;
                        if (this.dataSource().length < 0) {
                            var query = this._savedQueries.take(parseInt(this.listContainer.height() / this.listitemheight));
                            var proxy = this;
                            if (ej.DataManager && this.dataSource() instanceof ej.DataManager) {
                                proxy.listitems = proxy.dataSource();
                                var queryPromise = this.dataSource().executeQuery(query);
                                queryPromise.done(function (e) {
								    proxy._trigger("actionBeforeSuccess", e);
                                    proxy.listitems = e.result;
                                    proxy._trigger("actionSuccess", e);
                                }).fail(function (e) { proxy._trigger("actionFailure", e); })
                                  .always(function (e) { proxy._trigger("actionComplete", e); });
                            }
                        }
                        if (this.mergeValue != groupedList && !ej.isNullOrUndefined(this.mergeValue)) {
                            this.mergeUl = [];
                            for (var i = 0; i < this.mergeValue.length; i++) {
                                var $liEle = ej.buildTag('li', this.model.template ? "" : this.mergeValue[i][this.model.fields.text], null,  this._itemStyle())[0]
                                if (this.model.template) $liEle.append(this._getTemplatedString(list[i]));
                                this.mergeUl.push($liEle[0]);
                            }
                            this.element.append(this.mergeUl);
                        }
                        if (!this.model.totalItemsCount)
                            var originalliLength = this.listitems.length;
                        else
                            var originalliLength = (this.mergeValue) ? this.model.totalItemsCount - this.mergeValue.length : this.model.totalItemsCount;
                        for (var i = 0; i < originalliLength; i++) {
                            var $listEle = ej.buildTag('li', null, null,  this._itemStyle());
                            this.dummyUl.push($listEle[0]);
                        }
                        this.dummyUl.attr("data-ej-page", 0);
                        this.element.append(this.dummyUl);
                    }
                    this._loadInitialData(_query, list);
                } else {
                    if (this.mapCateg && this.mapCateg != "") {
						if (this.model.sortOrder.toLowerCase() != "none") {
                            var sortQuery = ej.Query().sortBy(this.mapFld._text, this.model.sortOrder, true);
                            groupedList = ej.DataManager(list).executeLocal(sortQuery);
                        }
                        _query = ej.Query().group(this.mapCateg);
                        if(this.model.sortOrder.toLowerCase() == "none")
                       _query.queries.splice(0, 1);
                        groupedList = ej.DataManager(list).executeLocal(_query);                      
                        this.dataSource([]);
                        if(this.datamerged && this.model.fields.groupBy){
                                this.mergeUl = [];
                                for (var i = 0; i <this.mergeValue.length; i++) {
                                    this.mergeUl.push(this.mergeValue[i]);
                                   for(var j=0;j<groupedList[0].items.length;j++){
                                       if(this.mergeValue[i].category==groupedList[0].items[j].key)
                                           groupedList[0].items[j].items.push(this.mergeUl[i]);
                                        }     
                                    }
                           for(i = 0; i < groupedList[0].items.length; i++) {
                            this.dummyUl.push(ej.buildTag('li.e-ghead', groupedList[0].items[i].key)[0]);
                            this._loadlist(groupedList[0].items[i].items);
                            this.dataSource(this.dataSource().concat(groupedList[0].items[i].items));
                        }
                    }
                    else{
                            for (i = 0; i < groupedList.length; i++) {
                            this.dummyUl.push(ej.buildTag('li.e-ghead', groupedList[i].key)[0]);
                            this._loadlist(groupedList[i].items);
                            this.dataSource(this.dataSource().concat(this._newList));
                        }
                    } }
                    else {
                        groupedList = ej.DataManager(list).executeLocal(_query);
                        if (groupedList.length > 0) {
                            if (this.mergeValue != groupedList && !ej.isNullOrUndefined(this.mergeValue)) {
                                this.mergeUl = [];
                                for (i = 0; i < this.mergeValue.length; i++) {
                                    this.mergeUl.push(ej.buildTag('li', this.mergeValue[i][this.model.fields.text], null,  this._itemStyle())[0]);
                                    groupedList.push(this.mergeValue[i]);
                                }
                            }
                            if (this.model.template != null && this._loadContent) {
                                if (this.model.sortOrder.toLowerCase() != "none") {
                                    var sortQuery = ej.Query().sortBy(this.mapFld._text, this.model.sortOrder, true);
                                    list = ej.DataManager(list).executeLocal(sortQuery);
                                }
                                for (i = 0; i < list.length; i++) {
                                    var _dhtmlAttributes = this._getField(list[i], this.mapFld._htmlAttributes);
                                    var _did = this._getField(list[i], this.mapFld._id);
                                    litag = ej.buildTag('li');
                                    if ((_dhtmlAttributes) && (_dhtmlAttributes != "")) litag.attr(_dhtmlAttributes);
                                    if (_did) litag.attr('id', _did);
                                    if (this.model.template) litag.append(this._getTemplatedString(list[i]));
                                    this.dummyUl.push(litag[0]);
                                }
                                if (!this.model.allowVirtualScrolling) this.element.children().remove();
								var k = (this.model.virtualScrollMode == "continuous" && this.mergeValue) ? this.realUllength + this.mergeValue.length : this.realUllength;
                                if (this.element.children()[k] == null && (!this.model.allowVirtualScrolling || this.model.virtualScrollMode == ej.VirtualScrollMode.Continuous) && this._loadContent)								
                                this.element.append(this.dummyUl);
                            }
                            else {
                                this.realUllength = 0;
                                this._loadlist(groupedList);
                            }
                        }
                    }
                }
            }
            var proxy = this;
            if (groupedList) this.listitems = groupedList;
            this._setDimensions();
            this.listContainer.css({ "position": "relative", "height": "" });
            this.listBoxScroller.css({ "height": "", "width": "" });
            if(this.model.allowVirtualScrolling == true && this.model.virtualScrollMode == "normal") {
                this._getLiHeight();
                var totalHeight = this._totalCount * this._liItemHeight;
                this.element.height(totalHeight);
            }
            else if(this.model.allowVirtualScrolling == true && this.model.virtualScrollMode == "continuous") {
                this.element.css("height", "auto");
            }
            this.listContainer.ejScroller({
                height: this.listContainer.height(),
                width: 0,
                scrollerSize: 20,
                scroll: function (e) {
                    proxy._onScroll(e);
                },
            });
            this.scrollerObj = this.listContainer.ejScroller("instance");
            this._setDimensions();
            if(ej.isNullOrUndefined(this.display)){ 
			this.listContainer.css({ 'display': 'none', 'visibility': 'visible' }); }
			else
			this.display = null;	
            this._checkboxHideShow(this.model.showCheckbox)._checkitems()._showResult();
            //if (this.model.totalItemsCount)
            //    this._setTotalItemsCount();
        },
		  _wordWrapItems:function(){
			   this.model.enableWordWrap?this.listContainer.addClass("e-wrap").removeClass("e-nowrap"):this.listContainer.addClass("e-nowrap").removeClass("e-wrap");
			},
	
        _loadInitialData: function (query, list) {
            var _query = query.clone();
            this.realUllength = 0;
            if ((ej.DataManager && this.dataSource() instanceof ej.DataManager))
                _query = _query.range(0, parseInt(this.listContainer.height() / this.listitemheight));
            else
                _query = _query.range(0, this.listitems.length);
            var groupedList = list;
            if (this.mergeValue != groupedList && this.mergeValue != undefined && this.model.virtualScrollMode == "continuous") {
                this.mergeUl = [];
                for (var i = 0; i < this.mergeValue.length; i++)
                    this.mergeUl.push(ej.buildTag('li', this.mergeValue[i][this.model.fields.text], null,  this._itemStyle())[0]);
                this.element.append(this.mergeUl);
            }
            if (!this.mergeValue || (this.mergeValue && this._loadInitialRemoteData))
                this._loadlist(groupedList);
        },
        _loadlist: function (sublist) {
            this._dummyVirtualUl = []; this._newList = [];
            if (this.element != null) {
                var selectionArray = [];
                if (this.model.sortOrder.toLowerCase() != "none") {
                    var sortQuery = ej.Query().sortBy(this.mapFld._text, this.model.sortOrder, true);
                    sublist = ej.DataManager(sublist).executeLocal(sortQuery);
                }
                for (var j = 0; j < sublist.length; j++) {
                    var _did = this._getField(sublist[j], this.mapFld._id);
                    var _dimageUrl = this._getField(sublist[j], this.mapFld._imageUrl);
                    var _dimageAttributes = this._getField(sublist[j], this.mapFld._imageAttributes);
                    var _dspriteCss = this._getField(sublist[j], this.mapFld._spriteCSS);
                    var _dtext = this._getField(sublist[j], this.mapFld._text);
                    var _dvalue = this._getField(sublist[j], this.mapFld._value);
                    var _dhtmlAttributes = this._getField(sublist[j], this.mapFld._htmlAttributes);
                    var _dselectBy = this._getField(sublist[j], this.mapFld._selectBy);
                    var _dcheckBy = this._getField(sublist[j], this.mapFld._checkBy);
                    var _dtooltipText = this._getField(sublist[j], this.mapFld._tooltipText);
                    var k = (this.model.virtualScrollMode == "continuous" && this.mergeValue) ? this.realUllength + this.mergeValue.length : this.realUllength;
                    if (!ej.isNullOrUndefined(_dvalue) && (_dvalue != "" || _dvalue == 0)) litag = ej.buildTag('li', "", "", $.extend( this._itemStyle(), {value: _dvalue}));
                    else var litag = ej.buildTag('li', null, null,  this._itemStyle()); if (_did) litag.attr('id', _did);

                    if ((_dimageUrl) && (_dimageUrl != "")) {
                        var imgtag = ej.buildTag('img.e-align', '', {}, {
                            'src': _dimageUrl,
                            'alt': _dtext
                        });
                        if ((_dimageAttributes) && (_dimageAttributes != "")) imgtag.attr(_dimageAttributes);
                        litag.append(imgtag);
                    }
                    if ((_dspriteCss) && (_dspriteCss != "")) {
                        var divtag = ej.buildTag('div.e-align ' + _dspriteCss + ' sprite-image');
                        litag.append(divtag);
                    }
                    if (!ej.isNullOrUndefined(_dtext)){
                    if(this.model.template) litag.append(this._getTemplatedString(sublist[j]))
                    else (_dtext == false) ? litag.append(document.createTextNode(_dtext)):litag.append(_dtext);
                    }
                    if ((_dhtmlAttributes) && (_dhtmlAttributes != "")) litag.attr(_dhtmlAttributes);
                    if ((_dtooltipText) && (_dtooltipText != "")) litag.attr('data-content', _dtooltipText).addClass("e-tooltip");
                    if (_dcheckBy || this.model.checkAll) litag.addClass("checkItem");
                    if (_dselectBy || this.model.selectAll) litag.addClass("selectItem");
                    if (this.model.allowVirtualScrolling && this.model.virtualScrollMode == "normal") {
                        $(litag[0]).attr("data-ej-page", 0);
                        ($(this.dummyUl[k])).replaceWith(litag[0]);
                        this._dummyVirtualUl.push(litag[0]);
                    }
                    else
                        this.dummyUl.push(litag[0]);
                    this.realUllength += 1;
                }
                if (!this.model.allowVirtualScrolling) this.element.children().remove();
                if (this.element.children()[k] == null && (!this.model.allowVirtualScrolling || this.model.virtualScrollMode == ej.VirtualScrollMode.Continuous) && this._loadContent)
                    this.element.append(this.dummyUl);
                var listItems = this.element.find("li:not('.e-ghead')"); this.listItemsElement = this.element.find("li:not('.e-ghead')");
                if (this.model.showCheckbox && this.model.checkedIndices) {
                    for (var i = 0; i < listItems.length; i++)
                        if (this.model.checkedIndices.indexOf(i) != -1)
                            $(listItems[i]).addClass("checkItem");
                }
                else if (!this.model.showCheckbox) {
					if(this.value()!="" && !this.mapCateg && !this.mapCateg != "") this.selectItemByText(this.value());
                    for (var i = 0; i < listItems.length; i++)
                        if (this.model.selectedIndices.indexOf(i) != -1 || this.model.selectedIndex == i)
                            $(listItems[i]).addClass("selectItem");
                }
                this.element.find('.selectItem').each(function (i, e) {
                    selectionArray.push($(e).parent().find("li").index($(e)));
                });
                var proxy = this;
                if (!proxy.model.showCheckbox && !this.mapCateg && !this.mapCateg != "")
                    proxy._selectListItems();
                this.element.find('.checkItem').each(function (i, e) {
                    proxy.model.checkedIndices.push(proxy._elementIndex(e));
                });
				if(!this.mapCateg && !this.mapCateg != ""){
                if (selectionArray.length)
                    this.model.allowMultiSelection ? this.model.selectedIndices = selectionArray : this.model.selectedIndex = selectionArray[0];
                if (this.model.checkedIndices)
                    this.model.checkedIndices = $.grep(proxy.model.checkedIndices, function (el, index) { return index == $.inArray(el, proxy.model.checkedIndices); });
                else if (this.model.selectedIndices)
                    this.model.selectedIndices = $.grep(proxy.model.selectedIndices, function (el, index) { return index == $.inArray(el, proxy.model.selectedIndices); });
				}
                this._loadContent = true;
            }
			this._newList = sublist;
			if(this.model.sortOrder.toLowerCase() != "none" && this.dataSource() && !this.mapCateg )
				this.dataSource(this._newList);
            return this;
            
        },
        _applySelection: function () {
            if (!(this.model.fields.checkBy || this.model.fields.selectBy)) return false;
            if (this.model.showCheckbox) {
                this.uncheckAll();
                this.checkItemsByIndices(this.model.checkedIndices);
            }
            else {
                if (this.model.allowMultiSelection)
                    this.selectItemsByIndices(this.model.selectedIndices);
                else {
                    this.unselectAll();
                    this.selectItemByIndex(this.model.selectedIndex);
                }
            }
        },
        _getField: function (obj, fieldName) {
            return ej.pvt.getObject(fieldName, obj);
        },
        _getTemplatedString: function (list) {
            var str = this.model.template,
                start = str.indexOf("${"),
                end = str.indexOf("}");
            while (start != -1 && end != -1) {
                var content = str.substring(start, end + 1);
                var field = content.replace("${", "").replace("}", "");
                str = str.replace(content, this._getField(list, field));
                start = str.indexOf("${"), end = str.indexOf("}");
            }
            return str;
        },
        _checkboxHideShow: function (value) {
            this.model.showCheckbox = value;
            (value) ? this._createCheckbox() : this._removeCheckbox();
            return this;
        },
        _createCheckbox: function () {
            var i, _extchk, chklist, me = this;
            this._listitems = this.listContainer.find("ol,ul").length > 0 ? this.listContainer.find("ol,ul").children("li:not('.e-ghead')") : this.element.children("li:not('.e-ghead')");
            chklist = this._listitems.find('input[type=checkbox]');
            for (i = 0; i < this._listitems.length; i++) {
                if ($(this._listitems[i]).text() != "") {
                    var $checkbox = ej.buildTag("input.listcheckbox e-align#popuplist" + i + "_" + this._id, "", {}, {
                        type: "checkbox",
                        name: "list" + i
                    });
                    if (!$(this._listitems[i]).find('input[type=checkbox]').length)
                        $(this._listitems[i]).prepend($checkbox);
                }
            }
            this.listContainer.find(".listcheckbox").ejCheckBox({
                cssClass: this.model.cssClass,
                change: $.proxy(this._onClickCheckList, this)
            });
            for (var i = 0; i < this._listitems.length; i++) {
                var checkbox = $(this._listitems[i]).find(".listcheckbox");
                if ($(this._listitems[i]).hasClass('e-disable')) checkbox.ejCheckBox('disable');
                else if ( $(this._listitems[i]).hasClass('checkItem') && !checkbox.ejCheckBox('isChecked')) {                    
                    checkbox.ejCheckBox({
                        "checked": true
                    });
                    this._activeItem = i;
                    this.checkedStatus = true;
                    var checkData = this._getItemObject($(this._listitems[i]), null);
                    checkData["isInteraction"] = true;
                    $(this._listitems[i]).removeClass('checkItem');
                }
            }
            for (var i = 0; i < this.model.selectedIndices.length; i++) {
                this.checkItemsByIndices(this.model.selectedIndices);
            }
        },
        _removeCheckbox: function () {
            var i, checkbox;
            this.listitem = this.listContainer.find("ol,ul").children("li");
            checkbox = this.listitem.find('.listcheckbox');
            if (checkbox.length > 0) {
                this.listitem.find('.listcheckbox').ejCheckBox('destroy');
                this.listitem.find('input[type=checkbox]').remove();
                if (this.model.allowMultiSelection) {
                    for (i = 0; i < this.model.checkedIndices.length; i++) {
                        this.selectItemsByIndices(this.model.checkedIndices);
                    }
                } else this.selectItemByIndex(this.model.checkedIndices[0]);
                this._checkedItems = this.model.checkedIndices = [];
            }
        },
        _selectCheckedItem: function (chkitems) {
            if (chkitems.length > 0)
                for (var i = 0; i < chkitems.length; i++)
                    this._selectedItems.push(chkitems[i]);
        },
        _refreshScroller: function () {
            if (this.model.virtualScrollMode == "continuous") {
                this.listContainer.css({ "display": "block" });
                if (this.scrollerObj) {
                    this.scrollerObj.model.height = this.listContainer.height();
                    this.scrollerObj.refresh();
                }
            } else {
                this.listContainer.find(".e-vhandle div").removeAttr("style");
                var listboxcontent = this.listBoxScroller.height();
                this.listContainer.css({ "display": "block" });
                if (this.scrollerObj) {
                    this.scrollerObj.model.height = this.listContainer.css("height");
                    this.scrollerObj.refresh();
                }
                this.listBoxScroller.css("height", "100%");
            }
            if (!this.model.enabled) {
                if (this.scrollerObj) this.scrollerObj.disable();
            }
            this.listContainer.css("height", this.model.height);
        },
        _setDimensions: function () {
            this.listContainer.css({ "width": this.model.width, "height": this.model.height });
            this._refreshScroller();
            return this;
        },
        _setItemsCount: function () {
            if(this.model.height=="auto"){
            if (this.model.itemsCount && this.model.itemsCount != 0 && this.model.height == "auto")
                this.model.height = this.model.itemsCount * 30;
            else
                this.model.height = (this.model.height == "auto") ? "220" : this.model.height;
              }
               else if (this.model.height != "auto" && this.model.itemsCount) {
                if (this.model.itemHeight)
                this.model.height = (this.model.height == "auto") ? "220" : this.model.itemsCount * this.model.itemHeight.replace(/[^-\d\.]/g, '');
                else
                    this.model.height = (this.model.height == "auto") ? "220" : this.model.itemsCount * 30;
            }
            else if (this.model.height != "auto" && this.model.itemsCount !=0) {
                this.model.height;
            }
            return this;
        },
        _setTotalItemsCount: function () {
            if (this.model.virtualScrollMode != "continuous") {
                this.element.height(this.element.find("li").outerHeight() * this.model.totalItemsCount);
                this.scrollerObj.refresh();
            }
        },

        _refreshContainer: function () {
            this.listContainer.css({ "position": "relative" });
            this._setDimensions()._roundedCorner()._refreshScroller();
        },
        _drag: function () {
            var proxy = this,
                pre = false,
                _clonedElement = null,
                dragContainment = null;
            this._listitem = this.element.parent();
            this._lilist = this._addItemIndex ? $($(this._listitem).find("li")[this._addItemIndex]) : $(this._listitem).find("li");
            this._lilist.not(".e-js").ejDraggable({
                dragArea: dragContainment,
                clone: true,
                dragStart: function (args) {
                  if( proxy.model.allowDrag || proxy.model.allowDragAndDrop ) {
                    if (!$(args.element.closest('.e-ddl-popup.e-js')).hasClass('e-disable') && !args.element.hasClass('e-disable')) {
                        var draggedobj = $("#" + this.element.parent()[0].id).data("ejListBox");
                        draggedobj._refreshItems();
                        var dragEle = proxy.getSelectedItems();
                        if (dragEle.length > 1 ? proxy._onDragStarts(dragEle, args.target) : proxy._onDragStarts([proxy._getItemObject(args.element, args)], args.target)) {
                            args.cancel = true;
                            _clonedElement && _clonedElement.remove();
                            return false;
                        }
                    } else {
                        _clonedElement && _clonedElement.remove();
                        return false;
                    }
                  }
                  else return false;
                },
                drag: function (args) {
                    var target = args.target;
                    var dragEle = proxy.getSelectedItems();
                    if (dragEle.length > 1 ? proxy._onDrag(dragEle, target) : proxy._onDrag([proxy._getItemObject(args.element, args)], target)) return false;
                    if ($(target).hasClass('e-droppable') || $(target).parent().hasClass('e-droppable'))
                        $(target).addClass("allowDrop");
                },
                dragStop: function (args) {
                    if (!args.element.dropped)
                        _clonedElement && _clonedElement.remove();
					if(!$(args.target).closest(".e-js.e-widget").hasClass("e-disable")){					
                    var target = args.target, targetObj = proxy;
                    var position = pre ? "Before" : "After";
                    var dragEle = proxy.getSelectedItems();
                    if (dragEle.length > 1 ? proxy._onDragStop(dragEle, target) : proxy._onDragStop([proxy._getItemObject(args.element, args)], target)) return false;
                    $(args.element).removeClass("e-active");
                    if (target.nodeName == 'UL') target = $(target)[0];
                    if ($(target).closest('li').length) target = $(args.target).closest('li')[0];
                    else if (target.nodeName != 'LI') target = $(target).closest('.e-ddl-popup.e-droppable')[0];
                    if (target && target.nodeName == 'LI' && $(target).hasClass('e-droppable') && $(target).closest('.e-ddl-popup.e-droppable').length) proxy._dropItem(target, args.element, pre, args.event);
                    else if ($(target).hasClass('e-droppable') && $(target).closest('.e-ddl-popup.e-droppable').length) proxy._dropItemContainer(target, args.element, args.event);
                    $(".allowDrop").removeClass("allowDrop");
                    if (args.target != proxy.element[0] && (args.element.parent().length && $(args.element.parent()[0]).data().ejWidgets[0] == "ejListBox")) {
                        proxy = $("#" + args.element.parent()[0].id).data($(args.element.parent()[0]).data().ejWidgets[0]);
                        if (dragEle.length > 1 ? proxy._onDropped(dragEle, target, args) : proxy._onDropped(proxy._getItemObject(args.element), args.target, args)) return false;
					}}
                    if( !proxy.model.allowDrag && !proxy.model.allowDragAndDrop ) proxy.element.children().removeClass("e-draggable");
                },
                helper: function (event, ui) {
                    if (!ej.isNullOrUndefined(event.element) && !$(event.element.closest('.e-ddl-popup.e-js')).hasClass('e-disable') && $(event.element).hasClass('e-draggable')) {
                        proxy = $(event.element).closest('.e-listbox.e-js').data('ejListBox');
                        proxy._tempTarget = $(event.element).text();
                        if ((proxy.model.allowDrag || proxy.model.allowDragAndDrop) && proxy) {
                            _clonedElement = $(event.sender.target).clone().addClass("dragClone e-dragClonelist");
                            _clonedElement.addClass(proxy.model.cssClass + (proxy.model.enableRTL ? ' e-rtl' : ''));
							 var maxZ = ej.util.getZindexPartial(proxy.element);
                            _clonedElement.css({ "width": proxy.element.width(), "height":$(event.element).height(), "padding": "5px 5px 5px 0.857em", "list-style": "none", "text-align": (proxy.model.enableRTL ? "right" : "left"), "opacity": "1", "z-index": maxZ});
                            return _clonedElement.appendTo($("body"));
                        }
                    }
                }
            });
        },
        _dropItem: function (target, element, pre, event) {
            element.addClass("e-droppable");
            var targetid = $(target).closest('.e-ddl-popup.e-droppable')[0].id.replace('_container', '');
            var dataIndex = [], dataObj = [];
            var droppedobj = $("#" + targetid).data("ejListBox");
            var preventDrop = (droppedobj.model.showCheckbox ? !this.model.showCheckbox : this.model.showCheckbox);
            if (preventDrop) return;
            var data = this._getDropObject(target, element, event);
            dataIndex = data.dataIndex;
            dataObj = data.dataObj;
			var dataItems  = droppedobj.element.find("li");
			var indexpos = dataItems.index(target);
			if( indexpos == 0) pre = true;
            pre ? $(this.li).insertBefore(target) : $(this.li).insertAfter(target);
            this._refreshItems();
            var ulElements =$(this.li.parent()[0]).find("li:not('.e-ghead')");
            if (dataObj && this.dataSource())
                this._dropDataSource(droppedobj, dataIndex, dataObj, ulElements.index(this.li));
            droppedobj._refreshItems();
        },
        _dropItemContainer: function (target, element, event) {
            element.addClass("e-droppable");
            var targetid = $(target)[0].id.replace('_container', '');
            var droppedobj = $("#" + targetid).data("ejListBox");
            var preventDrop = (droppedobj.model.showCheckbox ? !this.model.showCheckbox : this.model.showCheckbox);
            if (preventDrop) return;
            var dataIndex = [], dataObj = [];
            var data = this._getDropObject(target, element, event);
            dataIndex = data.dataIndex;
            dataObj = data.dataObj;
            this.li.insertAfter($($(target).find('li')).last());
			if($(target).find('ul').length > 0) $(target).find('ul').append(this.li);
			else $(target).find('ej-listbox').append(this.li);
            this._refreshItems();
            if (dataObj && this.dataSource())
                this._dropDataSource(droppedobj, dataIndex, dataObj, droppedobj.dataSource() ? droppedobj.dataSource().length : 0);
            if (!droppedobj.model.allowDrag)
                $(this.li).ejDraggable("instance")._destroy();
            droppedobj._refreshItems();
        },
        _dropDataSource: function (droppedobj, dataIndex, dataObj, droppedIndex) {
            var preventDropData = ej.DataManager && this.dataSource() instanceof ej.DataManager;
            if (preventDropData) return;
            if (dataIndex instanceof Array) {
                var proxy = this;
                $.each(dataObj, function (index) {
                   var indx = proxy.dataSource().indexOf(dataObj[index]);
                    proxy.dataSource().splice(indx, 1);
                });
            }
            else
                this.dataSource().splice(dataIndex, 1);
            if (droppedobj.dataSource() instanceof Array) {
                droppedobj.dataSource().splice.apply(droppedobj.dataSource(), [droppedIndex, 0].concat(dataObj));
            }
            else {
                droppedobj.dataSource(dataObj);
            }
        },
        _getDropObject: function (target, element, event) {
            var dataIndex = [], dataObj = [];
            if (this.model.allowMultiSelection) {
                this.li = $(element).parent().find(".e-select").removeClass("e-select e-hover");
                if(this.li.index(element[0]) == -1) this.li = element;
                if (!this.li.length)
                 this.li = element.removeClass("e-select e-hover");
            }
            else
                this.li = element.removeClass("e-select e-hover");

            if (this.li.length) {
               var proxy = this;
               var sortFlg=this.model.sortOrder.toLowerCase();
                $.each(this.li, function (ele) {
                    var ulElements=$(this.parentElement).find("li:not('.e-ghead')");
                    dataIndex.push(ulElements.index(this));
                            if( sortFlg!="none"){
                    var sortQuery = ej.Query().sortBy(proxy.mapFld._text,sortFlg, true);
                    var dataAfterSort = ej.DataManager(proxy.dataSource()).executeLocal(sortQuery);
                dataObj.push((proxy.dataSource()) ? dataAfterSort[ulElements.index(this)] : null);
            }
            else
                    dataObj.push((proxy.dataSource()) ? proxy.dataSource()[ulElements.index(this)] : null);
                });
            }
            else {
                dataIndex = this.li.index();
                dataObj = (this.dataSource()) ? this.dataSource()[dataIndex] : null;
            }
            return { "dataIndex": dataIndex, "dataObj": dataObj };
        },
        _showResult: function () {
            var proxy = this;
            this._refreshContainer();
            this.element.attr({
                "aria-expanded": true
            });
            var _ListItemsContainer = this.element.children("li:not('.e-ghead')");
            this._listSize = _ListItemsContainer.length;
			this._ListEventUnbind(_ListItemsContainer);
            _ListItemsContainer.on("touchstart mouseenter", $.proxy(this._OnMouseEnter, this));
            _ListItemsContainer.on("touchend mouseleave", $.proxy(this._OnMouseLeave, this));
            _ListItemsContainer.on("click", $.proxy(this._OnMouseClick, this));
            _ListItemsContainer.on("contextmenu", $.proxy(this._OnMouseContext, this));            
            if (proxy.model.showCheckbox) proxy.element.find(".listcheckbox").ejCheckBox({ enabled: proxy.model.enabled });
            return this;
        },
        _OnWindowResize: function (e) {
            this._refreshContainer();
            this.listContainer.css("display", "block");
        },
        refresh: function (value) {
		    if (!ej.isNullOrUndefined(this.model.query)) this._savedQueries = this.model.query; 
			this.display = true;
            if (this.model.dataSource) {
                if (this.model.template)
                    this.element.empty();
                this._checkModelDataBinding(this.dataSource());
            }
            else {
                this.listContainer.css({ "height": this.model.height, "width": this.model.width });
                this._refreshScroller();
            }
        },
        _removeListHover: function () {
            this._selectedItems = [];
            this.model.selectedIndices = [];
            this.model.selectedIndex = null;
            this.element.children("li").removeClass("e-hover e-select selectItem");
            return this;
        },
        _addListHover: function () {
            this._activeItem = this._selectedItem;
            var activeItem = this._getItem(this._selectedItem);
            activeItem.addClass("e-select e-hover");
            this.scrollerObj.setModel({ "scrollTop": this._calcScrollTop() });
            activeItem.focus();
            this._OnListSelect(this.prevselectedItem, this._selectedItem);
        },
        _calcScrollTop: function (value) {
            var ulH = this.element.outerHeight(),
                li = this.element.find("li"),
                liH = 0,
                index, top, i;
            index = value ? value : this.element.find("li.e-select").index();
            for (i = 0; i < index; i++)
                liH += li.eq(i).outerHeight();
            top = liH - ((this.listContainer.outerHeight() - li.eq(index).outerHeight()) / 2);
            return top;
        },
        _refreshItems: function () {
            this.listBoxScroller.append(this.element);
            this.listContainer.append(this.listBoxScroller);
            this._refreshContainer();
            this._showResult();
            this._setSelectionValues();
            this._setDisableValues();
        },
        _selectedIndices: function () {
            var selectItem;
            this.element.children("li:not('.e-ghead')").each(function (index) {
                if ($(this).hasClass("e-select")) {
                    selectItem = index;
                    return false
                }
            });
            this._selectedItem = selectItem;
            return selectItem;
        },
        _addSelectedItem: function (e) {
            if ((!Array.isArray(this.model.disableItemsByIndex) && this.model.disableItemsByIndex != null) || (Array.isArray(this.model.disableItemsByIndex) && this.model.disableItemsByIndex.length > 0)) {
                if (e.keyCode == 40 || e.keyCode == 39) this._disableItemSelectDown();
                else this._disableItemSelectUp();
                this._selectedItem = this._activeItem
            }
            var activeItem = this._getItem(this._selectedItem);
            this._selectedItems.push(activeItem)
        },
        _getItem: function (val) {
            return $(this.element.children("li:not('.e-ghead')")[val])
        },
        _getItemObject: function (item, evt) {
            var index = this._elementIndex(item);
            return {
                item: item,
                index: index,
                text: item.text(),
                value: item.attr("value") ? item.attr("value") : item.text(),
                isEnabled: !item.hasClass("e-disable"),
                isSelected: item.hasClass("e-select"),
                isChecked: item.find('.e-chk-image').hasClass('e-checkmark'),
                data: this.dataSource() ? this.getListData()[index] : null,
                event: evt ? evt : null
            };
        },
        _roundedCorner: function () {
            this.listContainer[(this.model.showRoundedCorner ? "addClass" : "removeClass")]("e-corner-all");
            return this;
        },
        _enabled: function (boolean) {
            boolean ? this.enable() : this.disable();
            return this;
        },
        _showFullList: function () {
            if (this.dataSource() != null) {
                if (!(ej.DataManager && this.dataSource() instanceof ej.DataManager))
                    this.listitems = this.dataSource();
                if (this._savedQueries.queries.length && !(ej.DataManager && this.dataSource() instanceof ej.DataManager))
                    this.listitems = ej.DataManager(this.dataSource()).executeLocal(this._savedQueries);
            }
            this._renderlistContainer();
            if (!(this.dataSource() instanceof ej.DataManager)) this._trigger("actionComplete");
            this._addDragableClass()._enableDragDrop();
            this._disabledItems = [];
            this.disableItemsByIndices(this.model.disableItemsByIndex);
            if (this.model.selectedIndex == 0) this.selectItemByIndex(this.model.selectedIndex);
            else this.model.selectedIndex && this.selectItemByIndex(this.model.selectedIndex);
            this.selectItemsByIndices(this.model.selectedIndices);
            this.checkItemsByIndices(this.model.checkedIndices);
            this._tooltipList();
            return this;
        },
        _tooltipList: function(){
             if (this.listContainer.find('li').hasClass('e-tooltip')){
                $(this.listContainer).ejTooltip({
                    target: ".e-tooltip",
                    isBalloon: false,
                    position: {
                        target: { horizontal: "center", vertical: "bottom" },
                        stem: { horizontal: "left", vertical: "top" }
                    }
                });
            }
       },
        _cascadeAction: function () {
            if (this.model.cascadeTo) {
                this._currentValue = this._getField(this.listitems[this._activeItem], this.mapFld._value);
                this.selectDropObj = $('#' + this.model.cascadeTo).ejListBox('instance');
                 $.extend(true, this.selectDropObj, { _isCasCadeTarget: true });
                if (ej.isNullOrUndefined(this._dSource))
                    this._dSource = this.selectDropObj.dataSource();
                this._performJsonDataInit();
			     var args = { cascadeModel: this.selectDropObj.model, cascadeValue: this._currentValue, setCascadeModel:{}, requiresDefaultFilter: true };
                this._trigger("cascade", args);	
                this.selectDropObj._setCascadeModel = args.setCascadeModel;				
            }
        },
        _performJsonDataInit: function () {
            this._changedSource = ej.DataManager(this._dSource).executeLocal(ej.Query().where(this.mapFld._value, "==", this._currentValue));
            this.selectDropObj.setModel({
                dataSource: this._changedSource,
                enable: true,
                value: "",
                selectedIndex: -1                
            })
        },
        _OnMouseContext: function (e) {
            e.preventDefault();
            return false
        },
        _OnMouseEnter: function (e) {
            this.startime = 0;
            this.item = "";
            if (e.type == "touchstart") {
                this.item = $(e.target).text();
                this.startime = new Date().getTime()
            }
            if (this.model.enabled) {
                var targetEle;
                this.element.children("li").removeClass("e-hover");
                if ($(e.target).is("li")) $(e.target).addClass("e-hover");
                if ($(e.target).hasClass("e-disable")) $(e.target).removeClass('e-hover');
                else if (e.target.tagName != "li") {
                    targetEle = $(e.target).parents("li");
                    $(targetEle).addClass("e-hover")
                }
                var activeItem, selectItem = 0;
                this.element.children("li:not('.e-ghead')").each(function (index) {
                    if ($(this).hasClass("e-hover")) {
                        activeItem = index;
                        return false
                    }
                });
                this._hoverItem = activeItem
            }
        },
        _OnMouseLeave: function (e) {
            this.element.children("li").removeClass("e-hover");
            this.endtime = new Date().getTime();
            if ((((this.endtime - this.startime) / 200) > 2))
                if ((this.item == $(e.target).text())) this.hold = (((this.endtime - this.startime) / 200) > 2) ? !this.hold : false;
        },
        _OnMouseClick: function (e) {
            if($(e.currentTarget).hasClass("e-disable")) return false;
            if (e.which == 3)
                this.hold = true;
            this.endtime = new Date().getTime();
            if ((((this.endtime - this.startime) / 200) > 2))
                if ((!this.model.template && this.item == $(e.target).text()) && (!this.hold))
                    this.hold = (((this.endtime - this.startime) / 200) > 2);
            if (e.shiftKey && this._shiftkey) {
                this._shiftkey = false;
                this.prevselectedItem = this._activeItem;
            }
            if (!ej.isNullOrUndefined(this._hoverItem)) this._activeItem = this._hoverItem;
            if (this.model.enabled && this._activeItem != undefined) {
                if (!e.shiftKey || isNaN(this.prevselectedItem)) {
                    this._shiftkey = true;
                    this.prevselectedItem = this._lastEleSelect ? this._lastEleSelect : this._activeItem;                    
                     if(this._lastEleSelect == 0 )  this.prevselectedItem = this._lastEleSelect;                
                }
                if (!this.model.showCheckbox) {
                    var activeitem = $(this.element.children("li:not('.e-ghead')")[this._hoverItem]);
                    if (!this.model.allowMultiSelection || (!(e.ctrlKey || this.touchhold || this.hold) && !e.shiftKey))
                        this._removeListHover();
                    this.element.children("li").removeClass('e-hover');
                    if (!activeitem.hasClass('e-select') ||(e.shiftKey && this.model.allowMultiSelection)) {
                        activeitem.addClass('e-select');
                        this._selectedItems.push(activeitem);
                        this.model.selectedIndices.push(this._activeItem);
                        if (e.shiftKey && (this.model.allowMultiSelection)) {
                            if (!e.ctrlKey) this._removeListHover();
                            var initial, last;
                            if (this.prevselectedItem < this._activeItem)
                                initial = this.prevselectedItem, last = this._activeItem;
                            else
                                initial = this._activeItem, last = this.prevselectedItem;
                            this._activeItemLoop(initial,last);
                        }
                    } else {
                        activeitem.removeClass('e-select');
                        this._selectedItems.splice(this.model.selectedIndices.indexOf(this._activeItem), 1);
                        this.model.selectedIndices.splice(this.model.selectedIndices.indexOf(this._activeItem), 1);
                    }
                    this._selectedItem = this._selectedIndices();
                    this.model.selectedIndex = this._activeItem;
                    this._cascadeAction();
                    var selecteditem = $(this.element.children("li:not('.e-ghead')")[this._selectedItem]);
                    if ($(selecteditem).text() != "") {
                        this.element.val($(selecteditem).text());
                        this.element.attr({
                            "value": this.element.val()
                        });
                    }
                    this.model.selectedText = activeitem.text();
                    this._selectedData = this._getItemObject($(selecteditem), e);
                    this._selectedData["isInteraction"] = true;
                    if (this._prevSelectedData && (this._selectedData.text != this._prevSelectedData.text))
                        this._trigger("unselect", this._prevSelectedData)
                    this._trigger("select", this._selectedData);
                    this._prevSelectedData = this._selectedData;
                    this._lastEleSelect = this._activeItem;
                    if (this._selectedItems && this._selectedItems.length != 1)
                        this._ctrlClick = true;
                } else {
                    if (($(e.currentTarget).is("li")) && ($(e.target).is("li"))) {
                        if ($(e.currentTarget.firstChild).find('.listcheckbox').ejCheckBox('isChecked')) {
                            $(e.currentTarget.firstChild).find('.listcheckbox').ejCheckBox('option', 'checked', false);
                            var index = this.model.checkedIndices.indexOf($(e.currentTarget).index());
                            this._checkedItems.splice(index, 1);
                            this.model.checkedIndices.splice(index, 1);
                            this.checkedStatus = false;
                        } else {
                            $(e.currentTarget.firstChild).find('.listcheckbox').ejCheckBox('option', 'checked', true);
                            this._checkedItems.push(this._activeItem);
                            this.model.checkedIndices.push(this._elementIndex(e.currentTarget));
                            this.checkedStatus = true;
                        }
                    }
                    else if (($(e.currentTarget).is("li")) && ($(e.target).is("span"))) {
                        if ($(e.currentTarget.firstChild).find('.listcheckbox').ejCheckBox('isChecked')) {
                            this._checkedItems.push(this._activeItem);
                            this.model.checkedIndices.push($(e.currentTarget).index());
                            this.checkedStatus = true;
                        }
                        else {
                            var index = this.model.checkedIndices.indexOf($(e.currentTarget).index());
                            this._checkedItems.splice(index, 1);
                            this.model.checkedIndices.splice(index, 1);
                            this.checkedStatus = false;
                        }
                    }
                    else
                        return false;
                    this.selectedTextValue = $(e.currentTarget).text();
                    if (!this.element.hasClass("e-disable") && $(e.target).is("li")) {
                        var args = {
                            status: this.model.enabled,
                            isChecked: this.checkedStatus,
                            selectedTextValue: this.selectedTextValue
                        };
                        var checkData = this._getItemObject($(e.target), e);
                        checkData["isInteraction"] = true;
                        this._trigger("checkChange", checkData);
                    }
                    this._lastEleSelect = $(e.currentTarget).index();
                }
                if (e.ctrlKey || e.shiftKey) e.shiftKey ? (this._shiftSelectItem = this._activeItem, this._ctrlSelectItem = null)  : (this._ctrlSelectItem = this._activeItem, this._shiftSelectItem = null);
                else {
                    this._shiftSelectItem = null;
                    this._ctrlSelectItem = null;
                }
                this._setSelectionValues()._OnListSelect(this.prevselectedItem, this._activeItem);
            }
            if (e.target.nodeName != "INPUT")
                this.listContainer.focus();
			this._pageUpStep = this._pageDownStep = null;
        },
		_activeItemLoop: function (initial , last) {
		    if (this.model.showCheckbox) {
		        var items = this.listContainer.find('li:not(.e-disable)');
		        items.find(".listcheckbox").ejCheckBox('option', 'checked', false);
				this._checkedItems = [];
                this.model.checkedIndices = [];
			}
			for (var i = initial; i <= last; i++) {
			    if (this.model.showCheckbox && !this.listContainer.find('li').eq(i).hasClass('e-disable')) {
					this.element.find('.listcheckbox').eq(i).ejCheckBox('option', 'checked', true);
                    this._checkedItems.push(i);
                    this.model.checkedIndices.push(i);
                    this.checkedStatus = true;
                }
				else {
			       var activeitem = $(this.element.children("li:not('.e-ghead')")[i]);
                    if (!activeitem.hasClass('e-disable')) {
                        if (!activeitem.hasClass('e-select')) activeitem.addClass('e-select');
                        this._selectedItems.push(activeitem);
                        this.model.selectedIndices.push(i);
                    }
                }
            }
		},
        _setSelectionValues: function () {
            var selectionArray = [];
            var oldSelectedIndices = this.model.selectedIndices;
            var oldCheckedIndices = this.model.checkedIndices;
            this.model.selectedIndices = [];
            this.model.checkedIndices = [];
            var proxy = this;
            if (!this.model.showCheckbox) {
                if (!ej.isNullOrUndefined(this._activeItem) && this._activeItem >= 0) this.model.selectedIndex = this._activeItem;
                var liItem = this.element.children("li:not('.e-ghead')");
                this.element.children("li:not('.e-ghead').e-select").each(function (index, ele) {
                    selectionArray.push($(ele).attr("value") ? $(ele).attr("value") : !ej.isNullOrUndefined(proxy.model.fields.text) && proxy.dataSource() ? proxy.getListData()[proxy._elementIndex(ele)][proxy.model.fields.text] : $(ele).text());
                    proxy.model.selectedIndices.push(liItem.index(ele));
                });
            }
            else {
                this.element.find("li:not('.e-ghead') .listcheckbox:checked").closest('li').each(function (index, ele) {
                    selectionArray.push($(ele).attr("value") ? $(ele).attr("value") : !ej.isNullOrUndefined(proxy.model.fields.text) && proxy.dataSource() ? proxy.getListData()[proxy._elementIndex(ele)][proxy.model.fields.text] : $(ele).text());
                    proxy.model.checkedIndices.push(proxy._elementIndex(ele));
                });
            }
            if (ej.DataManager && ej.DataManager && this.dataSource() instanceof ej.DataManager && this.model.allowVirtualScrolling) {
                if (this.model.showCheckbox) {
                    for (var i = 0; i < oldCheckedIndices.length; i++) {
                        if (this.model.checkedIndices.indexOf(oldCheckedIndices[i]) == -1)
                            this.model.checkedIndices.push(oldCheckedIndices[i]);
                    }
                }
                else {
                    for (var i = 0; i < oldSelectedIndices.length; i++) {
                        if (this.model.selectedIndices.indexOf(oldSelectedIndices[i]) == -1)
                            this.model.selectedIndices.push(oldSelectedIndices[i]);
                    }
                }
            }
            this.model.selectedItemIndex = this.model.selectedIndex;
            this.model.selectedItems = this.model.selectedItemlist = this.model.selectedIndices;
            this.model.checkedItems = this.model.checkedItemlist = this.model.checkItemsByIndex = this.model.checkedIndices;
			this.model.text = "";
			if(this.model.showCheckbox){
               var checked = this.getCheckedItems();
				for(i = 0;i < checked.length;i++){			
				         this.model.text +=  checked[i].text + ","
			        }
			}else{
                var selected = this.getSelectedItems();
				for(i = 0;i < selected.length;i++){			
				         this.model.text +=  selected[i].text + ","
			        }	
			}
            this.value(selectionArray.toString());
            this._hiddenInput.val(this.value());
            return this;
        },
        _setDisableValues: function () {
            this._disabledItems = [];
            this.model.disableItemsByIndex = [];
            var lenth = this.element.children().length, indx;
            for (var indx = 0; indx < lenth; indx++)
                if ($(this.element.children()[indx]).hasClass('e-disable'))
                    this.model.disableItemsByIndex.push(indx);
            this.disableItemsByIndices(this.model.disableItemsByIndex);
        },
        _onClickCheckList: function (e) {
			if(!e.isChecked) $("#"+ e.model.id).closest('li').removeClass("checkItem");
            if (e.isInteraction) {
                this.checkedStatus = e.isChecked ? true : false;
                if (!this._initValue) {
                    this.checkedStatus ? this.model.checkedIndices.push($(e.event.target).closest('li:not(".e-ghead")').index()) : this.model.checkedIndices.splice($.inArray($(e.event.target).closest('li:not(".e-ghead")').index(), this.model.checkedIndices), 1);
                    var checkData = this._getItemObject($(e.event.target).closest('li'), e);
                    checkData["isInteraction"] = true;
                    this._trigger('checkChange', checkData);
                }
            }
        },
		_elementIndex: function (args) {
		    return $(args).parent().children("li:not('.e-ghead')").index(args);
		},
        _disableItemSelectCommon: function () {
            this.listitems = this.element.find('li');
            this._activeItem = this.listitems.index(this.element.find(".e-select"));
        },

        _disableItemSelectUp: function () {
            this._disableItemSelectCommon();
            var disableList = (typeof (this.model.disableItemsByIndex) != "object") ? this.model.disableItemsByIndex.split(",").sort().reverse() : this.model.disableItemsByIndex;
            if (this._activeItem == 0) this._activeItem = this.listitems.length - 1;
            else this._activeItem--;
            for (var lists = 0;
                ($.inArray(this._activeItem.toString(), disableList.toString())) > -1; lists++) {
                this._activeItem--;
                if (this._activeItem < 0) this._activeItem = this.listitems.length - 1
            }
            $(this.element.children("li")[this._activeItem]).addClass('e-select')
        },
        _disableItemSelectDown: function () {
            this._disableItemSelectCommon();
            var disableList = (typeof (this.model.disableItemsByIndex) != "object") ? this.model.disableItemsByIndex.split(",").sort() : this.model.disableItemsByIndex;
            ((this.listitems.length - 1) == this._activeItem) ? this._activeItem = 0 : this._activeItem++;
            for (var lists = 0;
                ($.inArray(this._activeItem.toString(), disableList.toString())) > -1; lists++) {
                this._activeItem++;
                if ((this.listitems.length) == this._activeItem) this._activeItem = 0
            }
            $(this.element.children("li")[this._activeItem]).addClass('e-select')
        },
        _checkitems: function () {
            if (this.model.showCheckbox) {
                var listitems = this.element.find("li:not('.e-ghead')");
                for (var i = 0; i < this.model.checkedIndices.length; i++) {
                    var item = this.model.checkedIndices[i];
                    $(listitems[item]).find('.listcheckbox').ejCheckBox('option', 'checked', true);
                    this._checkedItems.push(listitems[item])
                }
            } else {
                if (this.model.allowMultiSelection) {
                    for (var i = 0; i < this.model.selectedIndices.length; i++) {
                        var item = this.model.selectedIndices[i];
                        if (!($(this.listitem[item]).hasClass("e-select"))) {
                            $(this.listitem[item]).addClass("e-select");
                            this._selectedItems.push($(this.listitem[item]));
                        }
                    }
                } else {
                    if (!($(this.listitem[this.model.selectedIndex]).hasClass("e-select")))
                        $(this.listitem[this.model.selectedIndex]).addClass("e-select");
                    this._selectedItems.push($(this.listitem[this.model.selectedIndex]))
                }
            }
            this._setSelectionValues();
            return this;
        },

        _onlistselection: function (previtem, selecteditem, e) {
            if (previtem != selecteditem) {
                var selectData = this._getItemObject($(this.element.find("li:not('.e-ghead')")[selecteditem]), e);
                selectData["isInteraction"] = true;
				if(!ej.isNullOrUndefined(selectData.event))
                this._trigger('change', selectData);
            }
        },

        _OnListSelect: function (previtem, selecteditem, e) {
            if (!ej.isNullOrUndefined(previtem) && previtem != selecteditem && !this.model.showCheckbox) {
                var selectData = this._getItemObject($(this.element.find("li:not('.e-ghead')")[selecteditem]), e);
                selectData["isInteraction"] = true;
                this._trigger('change', selectData);
            }
        },
        _OnKeyDown: function (e) {
            if (this.model.enabled) {
                if (this._selectedItems && this._selectedItems.length == 1 && !this.model.showCheckbox)
                    this._lastEleSelect = $(this.element.children("li.e-select")).index();
                this._itemId = null;
                var _ListItemsContainer = this.element.children("li:not('.e-ghead')"), proxy = this, liH, popupH, activeitem;
                popupH = this.listContainer.height();
                liH = _ListItemsContainer.outerHeight();
                activeitem = Math.round(popupH / liH) != 0 ? Math.floor(popupH / liH) : 7;
                this._listSize = this.element.children("li").length;
                var start, end;
                if (!e.shiftKey) this._up = this._down;
				if(e.keyCode != 33 && e.keyCode != 34) this._pageUpStep = this._pageDownStep = null;
                switch (e.keyCode) {
                    case 37:
                    case 38:
                        var liItems = this.listItemsElement;
                        var selectedIndex = this._shiftSelectItem ? this._shiftSelectItem : this._ctrlSelectItem ? this._ctrlSelectItem : (this.model.showCheckbox) ? (this._lastEleSelect || 0) : liItems.index(this.element.find("li.e-select"));
                        if (e.shiftKey && this.model.allowMultiSelection && !this.model.showCheckbox) {
                            if (this._lastEleSelect == 0) return false;
                            this._lastEleSelect = (this._ctrlClick) ? this._lastEleSelect - 1 : this._lastEleSelect;
                            selectedIndex = this._lastEleSelect;
                            this._selectedItem = (selectedIndex || selectedIndex == 0) ? (selectedIndex == 0 ? this._listSize - 1 : (this._down ? selectedIndex : selectedIndex - 1)) : 0;
                            for (var i = this._selectedItem; $(_ListItemsContainer[i]).hasClass("e-disable") ; i--)
                                this._selectedItem -= 1;
                            if($(_ListItemsContainer[this._selectedItem]).hasClass("e-select") && this.element.find("li.e-select").length == 1) this._selectedItem -= 1;
                            var activeItem = $(_ListItemsContainer[this._selectedItem]);
                            if (activeItem.hasClass("e-select")) {
                                if (this._selectedItem == 0) return;
                                activeItem.removeClass("e-select");
                                this._selectedItems.pop();
                            }
                            else {
                                activeItem.addClass("e-select");
                                this._selectedItems.push(activeItem);
                            }
                            this.scrollerObj.setModel({ "scrollTop": this._calcScrollTop(this._selectedItem) });
                            this._up = true;
                            this._down = false;
                            this._ctrlClick = false;
                        }
                        else {
                            this._selectedItem = (selectedIndex || selectedIndex == 0) ? (selectedIndex == 0 ? this._listSize - 1 : selectedIndex - 1) : 0;
                            for (var i = this._selectedItem; $(_ListItemsContainer[i]).hasClass("e-disable") ; i--)
                                this._selectedItem -= 1;
                            if (this._selectedItem == -1) this._selectedItem = this._listSize - 1;
                            this._addSelectedItem(e);
                            $(_ListItemsContainer).removeClass("e-hover e-select");
                            var addClass = (this.model.showCheckbox) ? "e-hover" : "e-select";
                            $(_ListItemsContainer[this._selectedItem]).addClass(addClass);
                            this.scrollerObj.setModel({ "scrollTop": this._calcScrollTop(this._selectedItem) });
                        }
						this._activeItem = this.prevselectedItem = this._selectedItem;
                        this._OnListSelect(this._selectedItem + 1, this._selectedItem, e);
                        this._lastEleSelect = this._selectedItem;
                        this._keyCascade(_ListItemsContainer[this._selectedItem]);
                        this._setSelectionValues();
                        this._shiftSelectItem = this._ctrlSelectItem = null;
                        e.preventDefault();
                        return false;
                        break;
                    case 39:
                    case 40:
                        var liItems = this.listItemsElement;
                        var selectedIndex = this._shiftSelectItem ? this._shiftSelectItem : this._ctrlSelectItem ? this._ctrlSelectItem : (this.model.showCheckbox) ? (this._lastEleSelect || 0) : liItems.index(this.element.find("li.e-select"));
                        if (e.shiftKey && this.model.allowMultiSelection && !this.model.showCheckbox) {
                            if (this._lastEleSelect == this._listSize - 1) return false;
                            this._lastEleSelect = (this._ctrlClick) ? this._lastEleSelect + 1 : this._lastEleSelect;
                            selectedIndex = this._lastEleSelect;
                            this._selectedItem = (selectedIndex || selectedIndex == 0) ? (selectedIndex == this._listSize - 1 ? 0 : ((this._up || this._ctrlClick) ? selectedIndex : selectedIndex + 1)) : 0;
                            for (var i = this._selectedItem; $(_ListItemsContainer[i]).hasClass("e-disable") ; i++)
                                this._selectedItem += 1;
							if($(_ListItemsContainer[this._selectedItem]).hasClass("e-select") && this.element.find("li.e-select").length == 1) this._selectedItem += 1;		
                            var activeItem = $(_ListItemsContainer[this._selectedItem]);
                            if (activeItem.hasClass("e-select")) {
                                activeItem.removeClass("e-select");
                                this._selectedItems.pop();
                            }
                            else {
                                activeItem.addClass("e-select");
                                this._selectedItems.push(activeItem);
                            }
                            this.scrollerObj.setModel({ "scrollTop": this._calcScrollTop(this._selectedItem) });
                            this._up = false;
                            this._down = true;
                            this._ctrlClick = false;
                        }
                        else {
                            this._selectedItem = (selectedIndex || selectedIndex == 0) ? (selectedIndex == this._listSize - 1 ? 0 : selectedIndex + 1) : 0;
                            for (var i = this._selectedItem; $(_ListItemsContainer[i]).hasClass("e-disable") ; i++)
                                this._selectedItem += 1;
                            if (this._selectedItem == this._listSize) this._selectedItem = 0;
                            this._addSelectedItem(e);
                            $(_ListItemsContainer).removeClass("e-hover e-select");
                            var addClass = (this.model.showCheckbox) ? "e-hover" : "e-select";
                            $(_ListItemsContainer[this._selectedItem]).addClass(addClass);
                            this.scrollerObj.setModel({ "scrollTop": this._calcScrollTop(this._selectedItem) });
							this.element.find("li").removeClass("selectItem");
							this.model.selectedIndices.length = 0;
							this.model.selectedIndices.push(this._selectedItem);
                        }
						this._activeItem = this.prevselectedItem = this._selectedItem;
                        this._OnListSelect(this._selectedItem - 1, this._selectedItem);
                        this._lastEleSelect = this._selectedItem;
                        this._keyCascade(_ListItemsContainer[this._selectedItem]);
                        this._setSelectionValues();
                        this._shiftSelectItem = this._ctrlSelectItem = null;
                        return false;
                        break;
                    case 8:
                    case 9:
                    case 13:
                        if (this.model.showCheckbox) {
                            if (this.model.checkedIndices.indexOf(this._selectedItem) < 0)
                                this.checkItemByIndex(this._selectedItem);
                            else
                                this.uncheckItemByIndex(this._selectedItem);
                        }
                        break;
                    case 18:
                    case 33: /* page up */
                        var step = e.keyCode == 33 ? activeitem : 1;
						if (e.shiftKey && this.model.allowMultiSelection) { 
							if(this._pageUpStep == null) this._pageUpStep = this.prevselectedItem;
							if(this._pageDownStep == null) this._pageDownStep = this.prevselectedItem;
							if(this._pageDownStep <= this.prevselectedItem) {
								start = this._pageUpStep - step > 0  ? this._pageUpStep - step : 0;
								end = this._pageDownStep;
							}
							else {
								start = this.prevselectedItem;
								end = this._pageDownStep - step > this.prevselectedItem  ? this._pageDownStep - step : this.prevselectedItem;
							}
							this._shiftHomeAndEndKeyProcess( start,end, end > this.prevselectedItem ? end:start);
							this._pageUpStep = start;
							this._pageDownStep =end;
						}
                        else this._moveUp(this._activeItem, step);
					    this.scrollerObj.setModel({ "scrollTop": this._calcScrollTop() });
                        this._preventDefaultAction(e);
                        break;
                    case 34: /* page down */
                        var step = e.keyCode == 34 ? activeitem : 1;
                        if (e.shiftKey && this.model.allowMultiSelection){
                            if(this._pageUpStep == null) this._pageUpStep = this.prevselectedItem;
                            if(this._pageDownStep == null) this._pageDownStep = this.prevselectedItem;
                            if( this._pageUpStep == 0 && this.prevselectedItem != 0) { 
								if( this._pageUpStep + step >= this.prevselectedItem) start = end = this.prevselectedItem;
								else {
									start = this._pageUpStep + step ;
									end = this._pageDownStep + step < this.element.children("li").length ?  this._pageDownStep + step : this.element.children("li").length-1;
                               }
                            }
                            else if(this._pageUpStep != this.prevselectedItem && this._pageUpStep + step >= this.prevselectedItem) start = end = this.prevselectedItem;
                            else {
                                start = this._pageUpStep;
                                end = this._pageDownStep + step < this.element.children("li").length ?  this._pageDownStep + step : this.element.children("li").length-1;
                            }
                            if(start < this.prevselectedItem && end > this.prevselectedItem ) end = this.prevselectedItem;
                            this._shiftHomeAndEndKeyProcess(start,end, start < this.prevselectedItem ? start:end);
                            this._pageUpStep = start;
                            this._pageDownStep =end;
                        } 
                        else this._moveDown(this._activeItem, step);
						this.scrollerObj.setModel({ "scrollTop": this._calcScrollTop() });
                        this._preventDefaultAction(e);
                        break;
                    case 35:
                        if (e.shiftKey && this.model.allowMultiSelection) this._shiftHomeAndEndKeyProcess(this._activeItem,(this._listSize - 1) , (this._listSize - 1));
                        else this._homeAndEndKeyProcess(e, _ListItemsContainer, (this._listSize - 1));
                        for (var i = this._listSize - 1; i > 0; i--) {
                            if (!$(this.element.find('li')[i]).hasClass('e-disable')) {
                                this.model.selectedIndex = i;
                                this._shiftSelectItem = i;
                               if (this.model.allowVirtualScrolling == true) proxy._onScroll(e);
                                return false;
                            }
                        }
                    break;
                case 36:
                    if (e.shiftKey && this.model.allowMultiSelection) this._shiftHomeAndEndKeyProcess(0, this._activeItem, 0);
                    else this._homeAndEndKeyProcess(e, _ListItemsContainer, 0);
                    for (var i = 0; i < this._listSize; i++) {
                        if (!$(this.element.find('li')[i]).hasClass('e-disable')) {
                            this.model.selectedIndex = i;
                            return false;
                        }
                    }
                    break;
                }
            }
        },
        _moveUp: function (current, step) {
            if (current == null || current <= 0)  this._checkDisableStep(0, step, false);
            else if (current > this._listSize - 1) this._checkDisableStep(this._listSize - 1, step, false);
            else if (current > 0 && current <= this._listSize - 1) this._checkDisableStep(current, step, false);
        },
        _moveDown: function (current, step) {
            if (current == null || current < 0) this._checkDisableStep(-1, step, true);
            else if (current == 0)  this._checkDisableStep(0, step, true);
            else if (current >= this._listSize - 1) this._checkDisableStep(this._listSize - 1, step, true);
            else if (current < this._listSize - 1)  this._checkDisableStep(current, step, true);
        },
        _checkDisableStep: function (current, step, isdown, shift) {
            var command = isdown ? "_disableItemSelectDown" : "_disableItemSelectUp";
            var index = isdown ? current + step : current - step;
            var select = this[command](index);
            if (select == null) {
                for (var i = step; i >= 0; i--) {
                    index = isdown ? current + i : current - i;
                    select = this[command](index);
                    if (select != null) break;
                }
            }
            if (select != null)
                this.selectItemByIndex(select);
        },
        _disableItemSelectDown: function (current) {
            if (current == null || current < 0) current = 0;
            if (current < this._listSize) {
                if ($.inArray(current, this._disabledItems) < 0) 
                    return current;
                else
                    return this._disableItemSelectDown(current + 1);
            }
            else return this._listSize - 1;
        },

        _disableItemSelectUp: function (current) {
            if (current == null || current < 0) current = 0;
            if (current < this._listSize) {
                if ($.inArray(current, this._disabledItems) < 0) 
                    return current;
                else {
                    if (current > 0) 
                        return this._disableItemSelectUp(current - 1);
                }
            }
        },

        _preventDefaultAction: function (e, stopBubble) {
            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
            if (stopBubble) 
                e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true);
        },
        _homeAndEndKeyProcess: function (e, _ListItemsContainer, index) {
            if ($(':focus').length && $(':focus')[0].nodeName != "INPUT") {
                this._OnListSelect(this._selectedItem, index);
                this.selectItemByIndex(index);
                this._selectedItem = index;
                this.scrollerObj.setModel({ "scrollTop": this._calcScrollTop(index) });
                if (this.model.showCheckbox) {
                    this._removeListHover();
                    $(_ListItemsContainer[index]).addClass("e-hover");
                    this._lastEleSelect = this._selectedItem = index;
                }
                this._keyCascade(_ListItemsContainer[index],e);
                e.preventDefault();
                return false;
            }
        },
        _shiftHomeAndEndKeyProcess: function(initial , last , index) {
			this._removeListHover();
			this._activeItemLoop(initial ,last);
			this.scrollerObj.setModel({ "scrollTop": this._calcScrollTop(index) });
            return false;
		},
        _keyCascade: function (obj, evt) {
            var selectData = this._getItemObject($(obj), evt);
            this.model.selectedText = selectData.text;
            selectData["isInteraction"] = true;
            this._trigger("select", selectData);
            if (this.model.cascadeTo) {
                this._activeItem = this._selectedItem;
                this._cascadeAction();
            }
        },

        mergeData: function (data,skipInitial) {
            this.datamerged=true;
            this.mergeUl = $();
            this._setMapFields();
            var proxy = this;
            this._skipInitialRemoteData = skipInitial ? skipInitial : false;
            if (ej.DataManager && data instanceof ej.DataManager) {
                var queryPromise = data.executeQuery(this._getQuery());
                queryPromise.done(function (e) {
                    proxy.mergeValue = e.result;
                    proxy._renderlistContainer();
                });
            }
            else {
                this.mergeValue = data;
                if(!ej.isNullOrUndefined(this.model.fields.groupBy) && this.datamerged && this.groupData)
                 this.listitems= this.listitems[0].items ? this.listitems[0].items:this.dataSource();
                else{
                this.groupData = true;
                this.listitems = this.listitems ? this.listitems : this.dataSource();
                }
                this._renderlistContainer();
            }
            this._loadInitialRemoteData = false;
        },

        _onScroll: function (e) {
            if (!e.scrollTop) return;
            var scrollerPosition = e.scrollTop, proxy = this;
            if (this.model.actionBegin)
                this._trigger("actionBegin", {});
            this.realUllength = this.element.find('li').length;
            if (this.model.allowVirtualScrolling && this.model.virtualScrollMode == "normal") {
                if(e.scrollTop!= e.scrollData.scrollOneStepBy + e.scrollData.scrollable){
                window.setTimeout(function () {
                    if (proxy._virtualCount == 0) {
                        proxy._loadVirtualList();
                    }
                }, 300);
            }
            }
            else if (this.model.allowVirtualScrolling && this.model.virtualScrollMode == "continuous") {
                if (scrollerPosition >= Math.round($(this.listContainer).find("ul").height() - $(this.listContainer).height()) && this.listitems.length < this._totalCount) {
                    this._updateLoadingClass(true);
                    if (ej.DataManager && this.model.dataSource instanceof ej.DataManager) {
                        this._queryPromise(this.realUllength, proxy, this.realUllength + this.model.itemRequestCount, e);
                    }
                }
            }
        },
        _queryPromise: function (start, proxy, end, e) {
            this._trigger('itemRequest', { event: e, isInteraction: true });
            this._setMapFields();
            var mQuery = this._savedQueries.clone();
            var queryPromise = this.dataSource().executeQuery(mQuery.range(start, end));
            this._updateLoadingClass(true);
            queryPromise.done(function (d) {
			    proxy._trigger("actionBeforeSuccess", d);
                proxy.realUllength = (e.source != "wheel") ? proxy.mergeValue ? proxy.mergeValue.length + start : start : start;
                proxy._loadlist(d.result)._checkboxHideShow(proxy.model.showCheckbox)._showResult()._updateLoadingClass();
                proxy._applySelection();
                if (proxy.model.virtualScrollMode == "continuous") {
                    proxy.scrollerObj.refresh();
                }
                proxy._trigger("actionSuccess", d);
            }).fail(function (e) {
                proxy._trigger("actionFailure", e);
            }).always(function (e) {
                proxy._trigger("actionComplete", e);
            });
        },
        _loadVirtualList: function () {
            this._virtualCount++;
            this._getLiHeight();
            var top = this.scrollerObj.scrollTop(), proxy = this, prevIndex = 0, prevPageLoad, nextIndex = null;
            this._currentPageindex = Math.round(top / (this._liItemHeight * this.model.itemRequestCount));
            if (($.inArray(this._currentPageindex, this._virtualPages.sort(function (a, b) { return a - b; }))) != -1) {
                if (this._currentPageindex == 0) {
                    if (($.inArray(this._currentPageindex + 1, this._virtualPages)) != -1) {
                        this._virtualCount--;
                        return false;
                    } else {
                        this._currentPageindex = this._currentPageindex + 1;
                    }
                }
                else if (($.inArray(this._currentPageindex - 1, this._virtualPages)) != -1) {
                    if (($.inArray(this._currentPageindex + 1, this._virtualPages)) != -1) {
                        this._virtualCount--;
                        return false;
                    } else {
                        this._currentPageindex = this._currentPageindex + 1;
                    }
                }
                else {
                    this._currentPageindex = this._currentPageindex - 1;
                }
            }
            prevPageLoad = !($.inArray(this._currentPageindex - 1, this._virtualPages) != -1);
            this._updateLoadingClass(true);
            for (var i = this._virtualPages.length - 1; i >= 0; i--) {
                if (this._virtualPages[i] < this._currentPageindex) {
                    prevIndex = this._virtualPages[i];
                    if (!(i + 1 == this._virtualPages.length))
                        nextIndex = this._virtualPages[i + 1];
                    break;
                }
            }
            var firstArg = prevPageLoad ? (this._currentPageindex - 1) * this.model.itemRequestCount : this._currentPageindex * this.model.itemRequestCount;
            var skipQuery = ej.Query().range(firstArg, this._currentPageindex * this.model.itemRequestCount + this.model.itemRequestCount), queryPromise, list;
            if (ej.DataManager) {
                var skipParam = prevPageLoad ? (this._currentPageindex - 1) * this.model.itemRequestCount : this._currentPageindex * this.model.itemRequestCount;
                if(this.dataSource().dataSource.offline == true)
                    skipQuery = ej.Query().skip(skipParam).take(this.model.itemRequestCount);
                else 
                    skipQuery = this._getQuery().skip(skipParam);
                if (prevPageLoad) {
                    for (i = 0; i < skipQuery.queries.length; i++) {
                        if (skipQuery.queries[i].fn == "onTake") {
                            skipQuery.queries.splice(i, 1);
                            break;
                        }
                    }
                    skipQuery.take(2 * this.model.itemRequestCount);
                }
                if (!proxy._trigger("actionBegin")) {
                    queryPromise = proxy._dataUrl.executeQuery(skipQuery);
                    queryPromise.done(function (e) {
                        proxy._appendVirtualList(e.result, prevIndex, proxy._currentPageindex, nextIndex, prevPageLoad);
                        proxy._trigger("actionSuccess", { e: e });
                    }).fail(function (e) {
                        proxy._virtualCount--;
                        proxy._trigger("actionFailure", { e: e });
                    }).always(function (e) {
                        proxy._updateLoadingClass(false);
                        proxy._trigger("actionComplete", { e: e });
                    });
                }
            } 
            else {
                list = ej.DataManager(proxy.model.dataSource).executeLocal(skipQuery);
                this._appendVirtualList(list, prevIndex, this._currentPageindex, nextIndex, prevPageLoad);
                this._updateLoadingClass(false);
            }
        },

        _appendVirtualList: function (list, prevIndex, currentIndex, nextIndex, prevPageLoad) {
            this._virtualCount--;
            this._getLiHeight();
            if (($.inArray(currentIndex, this._virtualPages.sort(function (a, b) { return a - b; }))) != -1) return false;
            if (prevPageLoad && ($.inArray(currentIndex - 1, this._virtualPages.sort()) != -1)) {
                list.splice(0, this.model.itemRequestCount);
                prevPageLoad = false;
            }
            var items = this.model.itemRequestCount, tempUl = $("<ul>"), firstVirtualHeight, secondVirtualHeight;
            firstVirtualHeight = prevPageLoad ? ((currentIndex - 1) * items * this._liItemHeight) - (prevIndex * items + items) * this._liItemHeight : (currentIndex * items * this._liItemHeight) - (prevIndex * items + items) * this._liItemHeight;
            if (firstVirtualHeight != 0) tempUl.append($("<span>").addClass("e-virtual").css({ display: "block", height: firstVirtualHeight }));
            this._loadlist(list);
            $(this._dummyVirtualUl).attr("data-ej-page", currentIndex);
            if (prevPageLoad) {
                $(this._dummyVirtualUl).slice(0, items).attr("data-ej-page", currentIndex - 1);
            }
            tempUl.append(this._dummyVirtualUl);
            var ulItems = this.element;
            secondVirtualHeight = (currentIndex * items + items) * this._liItemHeight;
            if (nextIndex != null) secondVirtualHeight = (nextIndex * items * this._liItemHeight) - secondVirtualHeight;
            else secondVirtualHeight = ulItems.height() - secondVirtualHeight;
            if (secondVirtualHeight != 0) tempUl.append($("<span>").addClass("e-virtual").css({ display: "block", height: secondVirtualHeight }));
            var selector = ulItems.find("li[data-ej-page=" + prevIndex + "]").last();
            selector.next().remove();
            tempUl.children().insertAfter(selector);
            if(this.model.showCheckbox) this._checkboxHideShow(true);
            this._virtualPages.push(currentIndex);
            if (prevPageLoad) this._virtualPages.push(currentIndex - 1);
            this._virtualUl = ulItems.clone(true);
            this._showResult();
            this._addDragableClass()._enableDragDrop();
        },

        _selectListItems: function () {
            var listItems = this.element.find("li:not('.e-ghead')");;
            for (var i = 0; i < listItems.length; i++) {
                if ($(listItems[i]).hasClass('selectItem') && !$(listItems[i]).hasClass('e-select'))
                    $(listItems[i]).addClass("e-select").removeClass('selectItem');
            }
        },
        _setText: function (text) {
            for (var i = 0; i < this.listitems.length; i++)
                if ($(this.element.children("li")[i]).text() == text) this.unselectAll().selectItemByIndex(i);
        },
        _getLiCount: function () {
            return parseInt(this.listContainer.height() / this.listItemsElement.height());
        },
        _onDragStarts: function (data, target) {
            return this._trigger("itemDragStart", { items: data, target: target });
        },
        _onDrag: function (data, target) {
            return this._trigger("itemDrag", { items: data, target: target });
        },
        _onDragStop: function (data, target) {
            return this._trigger("itemDragStop", { items: data, target: target });
        },
        _onDropped: function (data, target, args) {
            if(data.length > 1)
				data = { items: data, droppedElementData: data, dropTarget:[args.target], event:args.event};
            else
            {
              if (ej.isOnWebForms && args.target.tagName == "LI" && args.target.classList.contains("e-droppable"))
                  args.target = this.element.parent()[0];
             data = { items: [data], droppedItemText: data.text, droppedItemValue: data.value, droppedItemIsChecked: data.isChecked, droppedElementData: data, dropTarget: [args.target], event: args.event };
            }
            return this._trigger("itemDrop",data);
        },
        _OnKeyPress: function (e) {
            if (this.model.enableIncrementalSearch && this.model.enabled) {
                this._incrementalSearch(this._isMozilla ? e.charCode : e.keyCode)
            }
        },
        _incrementalSearch: function (from) {
            var _proxy = this;
            var typedCharacter = String.fromCharCode(from);
            if (this._incqueryString != typedCharacter) this._incqueryString += typedCharacter;
            else this._incqueryString = typedCharacter;
            if ((this._incqueryString.length > 0) && (this._typeInterval == null)) {
                this._typeInterval = setTimeout(function () {
                    _proxy._incqueryString = "";
                    _proxy._typeInterval = null
                }, _proxy._typingThreshold)
            }
            var list = this.listContainer.find("li:not('.e-ghead')"),
                i, strlen;
            var caseSence = this.model.caseSensitiveSearch,
                str, queryStr = this._incqueryString;
            var querylength = this._incqueryString.length,
                searchflag = false;
            if (!caseSence) queryStr = queryStr.toLowerCase();
            var initialSelection = this._activeItem;
            --initialSelection;
            var startIndex = this._activeItem != list.length - 1 ? (this._activeItem + 1) : 0;
            if (this._incqueryString.length > 1) startIndex = this._activeItem;
            for (var i = startIndex;
                (i < list.length && initialSelection != i) ; i++) {
                str = $.trim($(list[i]).text());
                str = caseSence ? str : str.toLowerCase();
                if (str.substr(0, querylength) === queryStr) {
                    this._removeListHover();
                    this.element.children("li").removeClass('e-active');
                    this._selectedItem = i;
                    this._addListHover();
                    searchflag = true;
                } else if ((i == list.length - 1) && (searchflag == false)) {
                    if (startIndex != 0) {
                        i = -1;
                        ++initialSelection;
                    } else searchflag = true;
                }
                if (searchflag) break;
            }
        },
        _wireEvents: function () {
            this._on(this.listContainer, "focus", this._OnFocusIn);
            this._on(this.listContainer, "blur", this._OnFocusOut);
            $(window).on("resize", $.proxy(this._OnWindowResize, this));
        },
        _OnFocusIn: function () {
            if (!this._focused) {
                this._trigger("focusIn");
                this._on(this.listContainer, "keydown", this._OnKeyDown);
                this._on(this.listContainer, "keypress", this._OnKeyPress);
                this._focused = true;
            }
        },
        _OnFocusOut: function () {
            if (this._focused) {
                this._trigger("focusOut");
                this._off(this.listContainer, "keydown", this._OnKeyDown);
                this._off(this.listContainer, "keypress", this._OnKeyPress);
                this._focused = false;
            }
        }
    });
    ej.VirtualScrollMode = {
        /** Supports to Virtual Scrolling mode with normal only */
        Normal: "normal",
        /** Supports to Virtual Scrolling mode with continuous only */
        Continuous: "continuous"
    };
    ej.SortOrder = {

        Ascending: "ascending",

        Descending: "descending",

	    None:"none"
    };
})(jQuery, Syncfusion);
;
/**
* @fileOverview Plugin to style the Menu control.
* @copyright Copyright Syncfusion Inc. 2001 - 2015. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
* @version 12.1 
* @author <a href="mailto:licensing@syncfusion.com">Syncfusion Inc</a>
*/
(function ($, ej, undefined) { 
    ej.widget("ejMenu", "ej.Menu", {

        element: null,

        model: null,
        validTags: ["ul"],
        _setFirst: false,
        _rootCss: "e-menu",
        angular: {
            terminal: false
        },


        defaults: {

            height: "",

            width: "",

            animationType: "default",

            orientation: ej.Orientation.Horizontal,

            menuType: "normalmenu",
			
			isResponsive: true,

            contextMenuTarget: null,

            contextMenuPopupTarget: "body",

            htmlAttributes: {},

            cssClass: "",

            openOnClick: false,

            subMenuDirection: "none",

            enableCenterAlign: false,

            showRootLevelArrows: true,

            showSubLevelArrows: true,

            enableAnimation: true,
            
            container: null,

            enableSeparator: true,

            enabled: true,

            overflowHeight: "auto",

            overflowWidth: "auto",

            fields: {

                child: null,

                dataSource: null,

                query: null,

                tableName: null,

                id: "id",

                parentId: "parentId",

                text: "text",

                spriteCssClass: "spriteCssClass",

                url: "url",

                imageAttribute: "imageAttribute",

                htmlAttribute: "htmlAttribute",

                linkAttribute: "linkAttribute",

                imageUrl: "imageUrl",
            },

            enableRTL: false,

            titleText: "Menu",

            locale: "en-US",

            excludeTarget: null,

            beforeOpen: null,

            open: null,

            close: null,

            mouseover: null,

            mouseout: null,

            click: null,

            keydown: null,

            overflowOpen: null,

            overflowClose:null,

            create: null,

            destroy: null
        },

        dataTypes: {
            animationType: "enum",
            cssClass: "string",
            titleText: "string",
            locale: "string",
            openOnClick: "boolean",
            enabled: "boolean",
            enableCenterAlign: "boolean",
            showArrow: "boolean",
            showRootLevelArrows: "boolean",
            showSubLevelArrows: "boolean",
            enableSeparator: "boolean",
			isResponsive: "boolean",
            enableRTL: "boolean",
            enableAnimation: "boolean",
            fields: {
                dataSource: "data",
                query: "data",
                child: "data"
            },
            excludeTarget: "string",
            htmlAttributes: "data"
        },


        _setModel: function (jsondata) {
            for (var key in jsondata) {
                switch (key) {
                    case "menuType":
                        jsondata[key] = this.model.menuType;
                        break;
                    case "fields":
                        this._wireEvents("_off");
                        this.element.empty().insertBefore(this.wrapper);
                        this.wrapper.remove();
                        $.extend(this.model.fields, jsondata[key]);
                        this._intializeData();
                        if (!this.model.enabled)
                            this._wireEvents("_off");
                        break;
                    case "orientation": this._setOrientation(jsondata[key]); break;
                    case "showRootLevelArrows": this._addArrow(jsondata[key], this.model.showSubLevelArrows); break;
                    case "showSubLevelArrows": this._addArrow(this.model.showRootLevelArrows, jsondata[key]); break;
                    case "enableSeparator": this._setSeparator(jsondata[key]); break;
                    case "height": this._setHeight(jsondata[key]); break;
                    case "width": this._setWidth(jsondata[key]); break;
                    case "cssClass": this._setSkin(jsondata[key]); break;
                    case "isResponsive":
                        if (this.model.isResponsive)
                            this._responsiveLayout();
                        else {
                            $(this.resWrap).remove();
                            $(this.wrapper).removeClass("e-menu-responsive");
                            $(this.element).removeClass("e-menu-responsive");
                            this.resWrap = null;
                        }
                        break;
                    case "htmlAttributes": this._addAttr(jsondata[key]); break;
                    case "enableRTL": this._setRTL(jsondata[key]); break;
                    case "enableCenterAlign": this._centerAlign(jsondata[key]); break;
                    case "excludeTarget": this.model.excludeTarget = jsondata[key];
                        break;
                    case "enabled": this.model.enabled = jsondata[key]; this._controlStatus(jsondata[key]); break;
                    case "animationType":
                        this._setAnimation(jsondata[key]);
                        break;
                    case "enableAnimation": this.model.enableAnimation = jsondata[key]; break;
                    case "openOnClick":
                            this._hoverOpen = !jsondata[key];
                            this._hoverClose = !jsondata[key]; 
                        break;
                    case "subMenuDirection": this._setSubMenuDirection(this.model.subMenuDirection); break;
                    case "titleText":
						this._titleText(jsondata[key]);
                        break;
                    case "locale":
                        this.model.locale = jsondata[key];
                        this._updateLocalConstant();
                        this._setLocale();
                        break;
                    case "overflowHeight":                       
                            this._setOverflowDimensions("height",jsondata[key]); break;
                    case "overflowWidth":                      
                        this._setOverflowDimensions("width",jsondata[key]); break;
                    case "contextMenuPopupTarget":
                        this.model.contextMenuPopupTarget = jsondata[key];
                        this._contextMenu_Template();
                        break;

                }
            }
        },
        _updateLocalConstant: function () {
            this._localizedLabels = ej.getLocalizedConstants("ej.Menu", this.model.locale);
        },
        		
        _setLocale: function () {
            this._titleText(this._localizedLabels.titleText);
        },
        _titleText: function(val){
            if ((this.model.menuType != ej.MenuType.ContextMenu) && (this.model.orientation != "vertical"))
                $(this.label).text(val);
        },

        _destroy: function () {
            this.model.menuType == ej.MenuType.ContextMenu ? this._referenceElement.append(this._cloneElement) : this._cloneElement.insertBefore(this.wrapper);
            this._cloneElement.removeClass('e-menu e-js');
            this.wrapper.remove();
        },


        _init: function () {
            this._cloneElement = this.element.clone();
            this.element.css("visibility", "hidden");
            this._setValues();
            this._intializeData();
            this.element.css("visibility", "visible");
        },

        _setValues: function () {
            this._mouseOver = true;
            this._hoverOpen = true;
            this._hoverClose = true;
            this._isMenuOpen = false;
            this._hideSpeed = 100;
            this._showSpeed = 100;
            this._isSubMenuOpen = false;
            this._isContextMenuOpen = false;
            this._disabledMenuItems = new Array();
            this._hiddenMenuItems = new Array();
            this._delayMenuHover = 0;
            this._delaySubMenuHover = 0;
            this._delaySubMenuShow = 0;
            this._preventContextOpen = true;
            this._setAnimation(this.model.animationType);
            this._isFocused = true;
            this._menuOverflowItems = new Array();
            this._menuHeaderItems = new Array();
            this._menuCloneItems = new Array();
            this._itemWidth = 0; 
        },
        _intializeData: function () {
            if (!ej.isNullOrUndefined(this.model.fields) && this.model.fields["dataSource"] != null) {
                this._generateTemplate(this.model.fields["dataSource"]);
                this._renderMenu();
            }
            else {
                this._renderMenu();
                this._wireEvents("_on");
                this._calculateOverflowItems();
            }
        },
        _renderMenu: function () {
            this._renderControl();
            this._addArrow(this.model.showRootLevelArrows, this.model.showSubLevelArrows);
			this._renderArrow();
			this._intializeMenu();
            //item Width for width property		
			    this._itemWidth = this.element.width();
			    if (this.model.isResponsive) {
			        this._ensureResponsiveClasses($(window).width() < 767);
			    }
			    if (this.model.orientation == "horizontal") {
			        this._on(this.element.parent().find("span.e-check-wrap.e-icon"), "click", this._mobileResponsiveMenu);
			        if(this.model.fields["dataSource"] != null) this._calculateOverflowItems();
			    }
        },      

        _renderControl: function () {
            var label, checkBox, checkObj, list, spanlist, i;
            if (this.model.menuType == "normalmenu") {
                this.wrapper = ej.buildTag("div");
                this.wrapper.addClass(this.model.cssClass + " e-menu-wrap");
            } else
                this.wrapper = ej.buildTag("div.e-menu-wrap");
            if (this.model.isResponsive) this._responsiveLayout();
            if (this.model.menuType != ej.MenuType.ContextMenu) {
                this.wrapper.insertBefore(this.element);
                this.wrapper.append(this.element);
                }            
            this.element.addClass("e-menu e-widget e-box").attr({ "role": "menu", "tabindex": 0 });
            this._addAttr(this.model.htmlAttributes);
            if (this.model.enableRTL) this._setRTL(this.model.enableRTL);
            this._setSubMenuDirection(this.model.subMenuDirection);
            if (this.model.menuType == "normalmenu") {
                this.model.orientation == "horizontal" ? this.element.addClass("e-horizontal") : this.element.addClass("e-vertical");
            }
            //For ContextMenu Mode
            else this._contextMenu_Template();
            this._addClass();
            if (this.model.enableCenterAlign) this._centerAlign(this.model.enableCenterAlign);
            if (this.model.enableSeparator) this._setSeparator(true);
            (!this.model.enabled) && this.disable();
        },
        _renderPopupWrapper: function (e) {
            if(this._ensureOverflowPopup()){                          
                this.popupWrapper = ej.buildTag("div.e-menu-popwrap");                         
                this.popupWrapper.insertAfter(this.element);              
                var height = typeof value === "number" ? this.model.overflowHeight + "px" :this.model.overflowHeight;
                var width = typeof value === "number" ? this.model.overflowWidth + "px" : this.model.overflowWidth;
                this.popupWrapper.css({ "height": height,"width":width});
                this.popupWrapper.hide();
                this._addOverflowItems();                
            }
        
        },
		refresh: function() {
            this._onResize();
        },
        _calculateOverflowItems: function (e) {        
            if (this._ensureOverflowPopup()) {
                this.element.find("li.e-list").removeClass("e-menu-show");
                $(this.lastelement).removeClass("e-last");
                this._menuHeaderItems = [];  
                var menuHeaderWidth = this.element.outerWidth();               
                if (this.element.find("li.e-ham-wrap").length > 0) //for window resizing event neglect the hamburger icon list from the listCollection
                {                   
                    if ((this._itemWidth<=this.element.width())||(this._itemWidth>=this.element.width()) && (!(this._isOverflowPopupOpen()))) {
						if(!ej.isNullOrUndefined(this.popupWrapper))
							this.popupWrapper.hide();                        
                    }
                }
				this._renderHamburgerIcon();	
				this.element.find("li.e-ham-wrap").css({display: 'list-item'});
                var hamburgerWidth = this.element.find("li.e-ham-wrap").outerWidth(), itemsOuterWidth = 0, hideState=true;
				this.element.find("li.e-ham-wrap").hide();
                this._menuHeaderItems = this.element.find(">li.e-list:not(.e-hidden-item)"); //calculate only visible items
                this._menuOverflowItems = [];
                for ( var i = 0; i < this._menuHeaderItems.length; i++) {
                   var menuItem = $(this._menuHeaderItems[i]);                                        
                        itemsOuterWidth = itemsOuterWidth + menuItem.outerWidth();
                        if (itemsOuterWidth < menuHeaderWidth) {                      
                            menuItem.removeClass('e-menu-hide');
							this.element.find(">li.e-list.e-haschild>ul").find("li.e-haschild").find("span.e-icon.e-arrowhead-down").removeClass("e-arrowhead-down").addClass("e-arrowhead-right");
                            if (this.model.enableSeparator) this._setSeparator(true);                  
                        }
                        else {
							if(hideState)
							{
								hideState=false;
								this.element.find("li.e-ham-wrap").css({display: 'list-item'}); 
								itemsOuterWidth = itemsOuterWidth - menuItem.outerWidth() + hamburgerWidth;
								if(i>1){
									(itemsOuterWidth = itemsOuterWidth - $(this._menuHeaderItems[i-1]).outerWidth());
									i=i-2;
								}								
								continue;
							}
                            this._menuOverflowItems.push($(menuItem).clone(true));                            
                            menuItem.addClass('e-menu-hide');                            
                        }
                }            
                if (this._menuOverflowItems.length>0) {
                    this._renderHamburgerIcon();
                    $('.e-menu-popwrap').length ?  this._addOverflowItems():  this._renderPopupWrapper();                     
                    this.lastelement = this.element.find('>li.e-list:visible').last().addClass('e-last');
                    this.element.find(">li.e-list.e-haschild>ul").find("li.e-haschild").find("span.e-icon.e-arrowhead-down").removeClass("e-arrowhead-down").addClass("e-arrowhead-right");            
                }
                else if (this._menuOverflowItems.length == 0 && $("li.e-ham-wrap").length > 0) {
                    this.element.find("li.e-ham-wrap").remove();
                }

            }           
            if (this.model.orientation == "vertical" || this.model.menuType == ej.MenuType.ContextMenu && ($(window).width() >= 768) && (this.model.isResponsive)) {
                this.element.find("span.e-icon.e-arrowhead-down").removeClass('e-arrowhead-down').addClass('e-arrowhead-right');
            }
            

        },
        _renderHamburgerIcon: function () {
            if((this._ensureOverflowPopup())&& (this.element.find("li.e-ham-wrap").length==0)){            
                var liTag = ej.buildTag("li.e-ham-wrap");
                var divTag = ej.buildTag("div");
                this.hamburgerspan = ej.buildTag('span.e-hamburger');                                                     
                divTag.append(this.hamburgerspan);
                liTag.append(divTag);    
                this.element.append(liTag);
                //to set border
                if (this.model.height != 0) this._setHeight(this.model.height);
                else {                       
                    $("li.e-ham-wrap").css({"height":this.element.find("li.e-list").first().height()});
                }
                //button click event
                this._on(this.element.find("li.e-ham-wrap"), "click", this._overflowOpen);                
            }
        },
        _addOverflowItems: function () {
            if ((this._ensureOverflowPopup()) && ($('.e-menu-popwrap').length>0)) {
				if(!ej.isNullOrUndefined(this.popupWrapper)){
					this.popupWrapper.empty();
					this._menuCloneItems.length = 0;                
					for (var i = 0; i < this._menuOverflowItems.length; i++) {
						this._menuCloneItems.push($(this._menuOverflowItems[i]).clone(true));                    
					}
					this.ulTag = ej.buildTag("ul");
					this.ulTag.addClass("e-menu e-js e-responsive e-widget e-box e-vertical");
					this.popupWrapper.append(this.ulTag);
					for (var i = 0; i < this._menuCloneItems.length; i++) {
						if ($(this._menuCloneItems[i]).hasClass('e-haschild')) {
							$(this._menuCloneItems[i]).find('span.e-icon').removeClass('e-arrowhead-down e-arrowhead-right').addClass('e-arrowhead-down');
							$(this._menuCloneItems[i]).children('span.e-menu-arrow.e-menu-left').remove();                       
						}
						this.ulTag.append(this._menuCloneItems[i]);
					}
					$(this.ulTag).children("li").removeClass("e-menu-hide");
					//to set width of ULTag          
					var popupWidth = Math.round(this.popupWrapper.width());
					if (popupWidth>0) {
						var popupWrapperWidth = this.popupWrapper.innerWidth();
						this.popupWrapper.find("ul.e-menu").css({ "width":popupWrapperWidth+ "px" });                
					}
					//to set the separator                  
					if (this.model.enableSeparator) this._setSeparator(true);                    
				}
            }         
        },
        _overflowOpen: function (e) {           
            if(this._isOverflowPopupOpen ()){   
                //set popup wrapper left position 
                 var location = ej.util.getOffset(this.element);
					var left = location.left + (this.model.enableRTL? 0 :(this.element.outerWidth() - this.popupWrapper.outerWidth()));
					var top = location.top + this.element.outerHeight();
					
					if(this.wrapper.parent().length && (this.wrapper.parent().css("position") == "absolute" || this.wrapper.parent().css("position") == "relative"))
					{
						location = ej.util.getOffset(this.wrapper.parent());
						left = left-location.left;
						top = top-location.top;
					}						
					this.popupWrapper.css({ "left": left,"top":top});                          
                this.popupWrapper.show();                                
                this._trigger("overflowOpen",  {e:e});
            }
            else {
                this._overflowClose(e);
            }
        },           
        _overflowClose: function (e) {
            if(this._ensureOverflowPopup() && !ej.isNullOrUndefined(this.popupWrapper)){            
                this.popupWrapper.find("li.e-list").removeClass(".e-mhover.e-active.e-mfocused");
                this._hideAnimation(this.popupWrapper.find('li.e-list:has("> ul")').find('> ul:visible'), this._hideAnim);
                this.popupWrapper.hide();                               
                this._trigger("overflowClose", { e: e });
            }
        },
        _isOverflowPopupOpen: function () {
		       if($(this.popupWrapper).length>0)
            return this.popupWrapper.css("display")=="none";           
        },
        _removePopup:function(e){
            if(($(window).width()<767)&& (this.model.isResponsive)){
			        this._ensureResponsiveClasses($(window).width());
                if ((this.element.find("li.e-ham-wrap").length > 0) && (this.popupWrapper.length>0)){
                    this.element.find("li.e-ham-wrap").remove();
                    $('.e-menu-popwrap').remove();                   
                    this.element.find("li.e-list").addClass("e-menu-show");             
                }
            }          
        },      
        _mobileResponsiveMenu:function(e){            
            if ((this.model.menuType != ej.MenuType.ContextMenu) && (this.model.orientation != "vertical") && ((this.element.css("display")=="none"))) {
                    this.element.removeClass("e-res-hide").addClass("e-res-show");                 
                }
            else if((this.model.menuType != ej.MenuType.ContextMenu) && (this.model.orientation != "vertical") && (!(this.element.css("display")=="none")))
                {
                    this.element.removeClass("e-res-show").addClass("e-res-hide");                    
                }          
        },
        _ensureOverflowPopup:function(e){
            return (this.model.menuType != ej.MenuType.ContextMenu) && (this.model.orientation != "vertical") && ($(window).width() >= 768) && (this.model.isResponsive);                
        },
        _onResize:function(e){
			this.element.find("li.e-ham-wrap").hide(); 
            $(window).width()>=768 ? this._calculateOverflowItems() : this._removePopup();
        },
        _ensureResponsiveClasses:function(viewport){
            if (viewport && this.element.find("span.e-icon").hasClass("e-arrowhead-right") ) this.element.find("span.e-icon.e-arrowhead-right").removeClass('e-arrowhead-right').addClass('e-arrowhead-down');            
        },

        _responsiveLayout: function () {
            if ((this.model.menuType != ej.MenuType.ContextMenu) && (this.model.orientation != "vertical")) {
                this.wrapper.addClass("e-menu-responsive");
                this.element.addClass("e-menu-responsive")
                this.resWrap = ej.buildTag('span.e-menu-res-wrap e-menu-responsive');
                this.inResWrap = ej.buildTag('span.e-in-wrap e-box e-menu-res-in-wrap');
                this.label = ej.buildTag('span.e-res-title').html(this.model.locale == "en-US" ? this.model.titleText : (ej.Menu.Locale[this.model.locale] && ej.Menu.Locale[this.model.locale].titleText)?ej.Menu.Locale[this.model.locale].titleText:this.model.titleText);
                this.check = ej.buildTag('span.e-check-wrap e-icon');
                this.wrapper.append(this.resWrap)
                this.resWrap.append(this.inResWrap);
                this.inResWrap.append(this.label).append(this.check);
            }
        },
        _addAttr: function (htmlAttr) {
            var proxy = this;
            $.map(htmlAttr, function (value, key) {
                if (key == "class") proxy.wrapper.addClass(value);
                else if (key == "disabled" && value == "disabled") proxy.disable();
                else proxy.element.attr(key, value)
            });
        },

        _oncheck: function (e) {
            var obj = this.element.parents('.e-menu-wrap').children('.e-menu');
            e.isChecked ? obj.removeClass('e-res-hide').addClass('e-res-show') : obj.removeClass('e-res-show').addClass('e-res-hide');
        },
        _addClass : function (){
            //Adding arrows to items with sub items
            this.element.find('li:has("> ul")').find('> a,> span').addClass('aschild');
            this.element.find('>li').addClass('e-list').attr({ "role": "menuitem" });
			this.element.find('li').find(">a, >span").addClass('e-menulink');
            var list = (this.element.find('.e-list a.aschild').length == 0 ) ? this.element.find('.e-list') : this.element.find('.e-list a.aschild');
            var spanlist = this.element.find('.e-list span.aschild');
            var listElement, spanElement,label;
            for ( var i = 0; i < list.length; i++) {
                listElement = $(list[i]);
                listElement.siblings().attr({ "aria-hidden": true });
                listElement.parent().attr({ "aria-haspopup": true, "role": "menuitem", "aria-label": listElement.text()}).addClass("e-haschild");
				listElement.siblings('ul').children('li').addClass('e-list').attr("role", "menuitem");
				if(!ej.isNullOrUndefined(listElement.siblings('ul').children('li').children('a')[i]))
					for(j=0; j<listElement.siblings('ul').children('li').children('a').length; j++)
					{
				      label = listElement.siblings('ul').children('li').children('a')[j].text;
					    listElement.siblings('ul').children('li')[j].setAttribute("aria-label", label);
					}
			    else
				{
				  label = listElement.text();
				  listElement.attr({"aria-label":label});
				}
               
            }
            for ( var i = 0; i < spanlist.length; i++) {
                spanElement = $(spanlist[i]);
                spanElement.siblings().attr({ "aria-hidden": true });
                spanElement.parent().attr({ "aria-haspopup": true, "role": "menu" }).addClass("e-haschild");
                spanElement.siblings('ul').children('li').addClass('e-list').attr("role", "menuitem");
            }
        },
		_renderArrow : function(){
			 if ((this.model.menuType != ej.MenuType.ContextMenu) && (this.model.orientation != "vertical")) {
				if( $($(this.element).find("span.e-menu-arrow")).length == 0){
					var arrow = ej.buildTag("span.e-menu-arrow e-menu-left");
					$(arrow).append("<span class='e-arrowMenuOuter'></span>").append("<span class='e-arrowMenuInner'></span>");
					this.element.find('>li.e-list.e-haschild').append(arrow);
				}
			 }
		},
        _generateTemplate: function (data) {
            var proxy = this, queryPromise;
            if (data instanceof ej.DataManager) {
                queryPromise = data.executeQuery(this._columnToSelect(this.model.fields));
                queryPromise.done(function (e) {
                    proxy._odataFlag = true;
                    proxy._generateItemTemplate(e.result);
                    if (proxy.model.height != 0) proxy._setHeight(proxy.model.height);
                    proxy._wireEvents("_on");
                });
            } else {
                proxy._odataFlag = false;
                this._generateItemTemplate(proxy.model.fields['dataSource']);
                this._wireEvents("_on");
            }
        },

        _generateItemTemplate: function (items) {
            for (var i = 0; i < items.length; i++) {
                if ((items[i][this.model.fields.parentId] == null) || (items[i][this.model.fields.parentId] == 0)) {
                    var subItem = this._menuTemplate(items[i], items, this.model.fields);
                    this.element.append(subItem);
                }
            }
        },

        _menuTemplate: function (item, tableData, mapper) {
            var liTag, aTag, imgTag, spanTag;
            liTag = $(document.createElement('li'));
            liTag.attr("class", 'e-list');
            if (item[mapper.htmlAttribute]) this._setAttributes(item[mapper.htmlAttribute], liTag);
			aTag = $(document.createElement('a'));
			aTag.attr("class", 'e-menulink');
			if (item[mapper.imageUrl] && item[mapper.imageUrl] != "") {
				imgTag = $(document.createElement('img'));
				imgTag.attr('src', item[mapper.imageUrl]);
				if (item[mapper.imageAttribute]) this._setAttributes(item[mapper.imageAttribute], imgTag);
				aTag.append(imgTag);
			}
			else if (item[mapper.spriteCssClass] && item[mapper.spriteCssClass] != "") {
				spanTag = $(document.createElement('span'));
				spanTag.addClass(item[mapper.spriteCssClass]);
				aTag.append(spanTag);
			}
			aTag.append(item[mapper.text]);
			if (item[mapper.linkAttribute]) this._setAttributes(item[mapper.linkAttribute], aTag);
			if (item[mapper.url])
				aTag.attr('href', item[mapper.url]);
			liTag.append(aTag);
            if (item[mapper.id]) {
                liTag.prop("id", item[mapper.id]);
            }
            if (!ej.isNullOrUndefined(mapper["child"])) {
                this._odataFlag = true;
                if (mapper["child"]["dataSource"] instanceof ej.DataManager) {
                    var proxy = this, queryManager = ej.Query();
					$(liTag).attr({ "aria-haspopup": true, "role": "menu" }).addClass("e-haschild");
                    queryManager = this._columnToSelect(mapper["child"]);
                    queryManager.where(mapper["child"]["parentId"], ej.FilterOperators.equal, item[mapper.id]);
                    var queryPromise = mapper["child"]["dataSource"].executeQuery(queryManager);
                    queryPromise.done(function (e) {
                        var childItems = e.result;
                        if (childItems && childItems.length > 0) {
                            var ul = $(document.createElement('ul'));
                            for (var i = 0; i < childItems.length; i++) {
                                var liItem = proxy._menuTemplate(childItems[i], mapper["child"]["dataSource"], mapper["child"]);
                                ul.append(liItem);
                            }
                            liTag.append(ul);
                            $(liTag).children('a').addClass('aschild');
                            if ($(liTag).parent().hasClass('e-menu') && (proxy.model.showRootLevelArrows))
                                $(liTag).children('a.aschild').append($('<span>').addClass("e-icon e-arrowhead-down")).addClass("e-arrow-space");
                            else if (proxy.model.showSubLevelArrows)
                                $(liTag).children('a.aschild').append($('<span>').addClass("e-icon e-arrowhead-right")).addClass("e-arrow-space");
                            if (proxy.model.height != 0) proxy._setHeight(proxy.model.height);
                        }
                    });
                    queryPromise.then(function (e) {
                        proxy._renderArrow();
                    });
                }
                else {
					var childItems;
					if(!ej.isNullOrUndefined(item.child)){
						if(ej.isPlainObject(item.child))
							childItems = ej.DataManager(mapper["child"]["dataSource"]).executeLocal(ej.Query().where(mapper["child"]["parentId"], ej.FilterOperators.equal, item[mapper.id]));
						else if(item.child instanceof Array)
							childItems =  item.child;
					}	
                    if (childItems && childItems.length > 0) {
                        var ul = $(document.createElement('ul'));
                        for (var i = 0; i < childItems.length; i++) {
                            var liItem = this._menuTemplate(childItems[i], mapper["child"]["dataSource"], mapper["child"]);
                            ul.append(liItem);
                        }
                        liTag.append(ul);
                    }
                }
            }
            else if (!this._odataFlag) {
                var childItems = ej.DataManager(mapper["dataSource"]).executeLocal(ej.Query().where(mapper["parentId"], ej.FilterOperators.equal, item[mapper.id]));
                if (childItems && childItems.length > 0) {
                    var ul = ej.buildTag('ul');
                    for (var i = 0; i < childItems.length; i++) {
                        var liItem = this._menuTemplate(childItems[i], mapper["dataSource"], mapper);
                        ul.append(liItem);
                    }
                    liTag.append(ul);
                }
            }
            return liTag;
        },

        _setAttributes: function (data, element) {
            for (var key in data) {
                if (key == "class")
                    element.addClass(data[key]);
                else
                    element.attr(key, data[key]);
            }
        },

        _addArrow: function (topArrows, bottomArrows) {
            if (topArrows) {
				var arrowIcon = (this.model.orientation == "horizontal") ? "e-arrowhead-down" : "e-arrowhead-right";
				this.element.find('>li.e-list:has("> ul")').children('a').append($('<span>').addClass("e-icon "+arrowIcon)).addClass("e-arrow-space");
			}
            else {
                this.element.find('>li.e-list:has("> ul")').children('a').removeClass("e-arrow-space").children('span.e-icon').remove();
            }

            if (bottomArrows)
                this.element.find('>li.e-list > ul li.e-list:has(>ul)').children('a').append($('<span>').addClass("e-icon e-arrowhead-right")).addClass("e-arrow-space");
            else {
                this.element.find('>li.e-list > ul li.e-list:has(>ul)').children('a').removeClass("e-arrow-space").children('span.e-icon').remove();
            }

        },

        _intializeMenu: function () {
            if (this.model.height != 0) this._setHeight(this.model.height);
            if (this.model.width != 0) this._setWidth(this.model.width);
            if (this.model.menuType == "contextmenu")
                this.model.openOnClick = false;
            if (this.model.openOnClick) {
                this._hoverOpen = false;
                this._hoverClose = false;
            }
        },

        _setOrientation: function (val) {
            if (val == "horizontal") {
                this.element.removeClass("e-vertical e-horizontal").addClass("e-horizontal");
            } else {
                this.element.removeClass("e-horizontal e-vertical").addClass("e-vertical");
            }
            if (val == "vertical") {
                this._removePopup();
            }
        },

        _setHeight: function (value) {
            if (this.model.orientation == "horizontal" && value !=="auto") {
                value = typeof value === "number" ? value + "px" : value;
                this.element.find('> li').find('>a:first').css("line-height", value);
                if (this.model.showRootLevelArrows)
                    this.element.find('> li').find('>a:first').find('> span:first').css({ "line-height": value, "top": "0px" })
                if ((this.model.menuType != ej.MenuType.ContextMenu) && (this.model.orientation != "vertical")){
                    if ($("li.e-ham-wrap").length > 0) {                        
                        this.element.find("li.e-ham-wrap").children("div").css({ "line-height": value });
                        this.element.find("li.e-ham-wrap").css({ "height": value });
                        if(this.popupWrapper)
                        this.popupWrapper.find("a.e-menulink").css({ "line-height":value });                        
                    }
                }
            }
            else
                this.element.height(value);
        },

        _setWidth: function (value) {
            this.element.css("width", value);
            if (this.model.orientation === "horizontal" && value !== "auto") {
                if (this.model.isResponsive)
                    this.resWrap.css("width", value);
            }
            if (this.model.orientation == "horizontal" &&  ((this.model.menuType != ej.MenuType.ContextMenu) && (this.model.orientation != "vertical")) ) {
                this._calculateOverflowItems();
            }
            
        },        
        _setOverflowDimensions:function(property,value){
            if ((this.model.menuType != ej.MenuType.ContextMenu) && (this.model.orientation != "vertical"))
                value = typeof value == "number" ? value + "px" : value;
                if (property == "height") this.popupWrapper.css({ height: value });
                else if (property == "width") this.popupWrapper.css({ width: value });                           
                this._addOverflowItems();
        },

        _setRTL: function (isRTL) {
            if (isRTL) {
                this.element.removeClass("e-rtl").addClass("e-rtl");
            } else {
                this.element.removeClass("e-rtl");
            }
            if (isRTL && this.model.orientation === "horizontal")
                this.wrapper.removeClass("e-menu-rtl").addClass("e-menu-rtl");
            else
                this.wrapper.removeClass("e-menu-rtl");
			this.model.subMenuDirection = isRTL ? "left" : "right";
        },

        _setSubMenuDirection: function (direction) {
            if (direction != "left" && direction != "right")
                this.model.subMenuDirection = this.model.enableRTL ? "left" : "right";
        },

        _setAnimation: function (value) {
            value === "none" ? (this._showAnim = "none", this._hideAnim = "none") : (this._showAnim = "slideDown", this._hideAnim = "slideUp");
        },

        _controlStatus: function (value) {
            value != true ? this.disable() : this.enable();
        },

        _centerAlign: function (enableCenterAlign) {
            if (this.model.orientation == "horizontal" && enableCenterAlign)
                this.element.css('text-align', 'center');
            else
                this.element.css('text-align', 'inherit');
        },
        _columnToSelect: function (mapper) {
            var column = [], queryManager = ej.Query();
            if (ej.isNullOrUndefined(mapper.query)) {
                for (var col in mapper) {
                    if (col !== "tableName" && col !== "child" && col !== "dataSource" && mapper[col])
                        column.push(mapper[col]);
                }
                if (column.length > 0)
                    queryManager.select(column);
                if (!this.model.fields["dataSource"].dataSource.url.match(mapper.tableName + "$"))
                    !ej.isNullOrUndefined(mapper.tableName) && queryManager.from(mapper.tableName);
            }
            else
                queryManager = mapper.query;
            return queryManager;
        },


        _max_zindex: function () {
            var parents, bodyEle, maxZ, index;
            if (this.model.menuType == "contextmenu") {
                parents = $(this._targetElement).parents();
                parents.push(this._targetElement);
            }
            else
                parents = $(this.element).parents();
            bodyEle = $('body').children(), index = bodyEle.index(this.popup);
            bodyEle.splice(index, 1);
            $(bodyEle).each(function (i, ele) { parents.push(ele); });
            maxZ = Math.max.apply(maxZ, $.map(parents, function (e, n) {
                if ($(e).css('position') != 'static') return parseInt($(e).css('z-index')) || 1;
            }));
            if (!maxZ || maxZ < 10000) maxZ = 10000;
            else maxZ += 1;
            return maxZ;

        },

        _recursiveFunction: function (items, menuText) {
            var context = this;
            var isFound = false;
            $.each(items, function (key, value) {
                if (value.Text == menuText) {
                    context.selectedItem = value;
                    isFound = true;
                    return false;
                }
                else if (value.ChildItems != null) {
                    context._recursiveFunction(value.ChildItems, menuText);
                }
                if (isFound)
                    return false;
            });
        },

        _contextMenu_Template: function () {
            if(this.element[0].id !="")
            var oldWrapper = $(".e-menu-wrap #" + this.element[0].id).get(0);
            if (oldWrapper)
                $(oldWrapper.parentElement).remove();
            this.model.orientation = "vertical";
            this.element.addClass(this.model.cssClass + " e-context");
			 this.element.css("display", "none");
            this._referenceElement = this.element.parent();
            $(this.model.contextMenuPopupTarget).append(this.element);
            this.wrapper.insertBefore(this.element);
            this.wrapper.append(this.element);
        },

        _closeMenu: function () {
            this._hideAnimation(this.element.find('li.e-list:has("> ul")').find('> ul:visible'), this._hideAnim);
        },

        _onMenuIntent: function (element, obj, canOpen) {
            obj._delayMenuHover = window.setTimeout(function () {
                if (obj._mouseOver == true && canOpen) {
                    var showanim = obj._showAnim;
                    var hideanim = obj._hideAnim;
                    var showSpeed = obj._showSpeed;
                    var hideSpeed = obj._hideSpeed;
                    obj._show(element, showanim, hideanim);
                }
            }, this._showSpeed);
        },

        _onHide: function (element, obj, canHide) {
            obj._delaySubMenuHover = window.setTimeout(function () {
                if (obj._mouseOver == false && canHide) {
                    var id = obj._id;
                    var hideanim = obj._hideAnim;
                    var hideSpeed = obj._hideSpeed;
                    obj._closeAll();
                }

            }, obj._hideSpeed);
        },

        _subMenuPos: function (element, direction) {
            var pos = $(element).offset();
            var subMenuLeft, subMenuRight ;
            var posLeft = (direction == "right") ? pos.left + $(element).width() : pos.left;
            var subMenu = $('ul:first', element);
            var menuWidth = $(element).outerWidth();
            if (pos == null || pos == undefined)
                return false;
            var submenuWidth = subMenu.outerWidth() + 1; // +1 for the space between menu and submenu
            var left = this.model.container ? $(this.model.container).width() + $(document).scrollLeft() : document.documentElement.clientWidth + $(document).scrollLeft();
            if (this.model.menuType == "normalmenu") {
                if ($(element.parentNode).is(this.element)) {
                    if (this.model.orientation == "horizontal"){
                        subMenu.css("top", $(element).outerHeight() + "px");
                        if (!this.model.enableRTL) {
                            subMenuLeft = (left < (posLeft + submenuWidth)) ? ((posLeft + submenuWidth) - left) : 1;
                            subMenu.css("left", (subMenuLeft *(-1)) + "px");
                        }
                        else {
                            subMenuRight = (((posLeft + menuWidth) - submenuWidth) < 0) ? ((posLeft + menuWidth) - submenuWidth) : 1;
                            subMenu.css({ "left": "auto", "right": subMenuRight + "px" });
                        }
                    }
                    else if ((direction == "left" && posLeft > submenuWidth) || (direction == "right" && left <= pos.left + menuWidth + submenuWidth &&  posLeft > submenuWidth))
                        subMenu.css("left", -(submenuWidth + 4) + "px");
                    else {
                        subMenu.css("left", ($(element).outerWidth() + 4) + "px");
                    }
                } else if ((direction == "left" && posLeft > submenuWidth) || (direction == "right" && left <= pos.left + menuWidth + submenuWidth &&  posLeft > submenuWidth)) {
                    subMenu.css("left", -(submenuWidth + 4) + "px");
                }
                else {
                    subMenu.css("left", ($(element).outerWidth() + 4) + "px");
                    var submenuHeight = subMenu.outerHeight();
                    var winHeight = $(window).height();
                    var submenuTop = (winHeight - (pos.top - $(window).scrollTop()));
                    if (winHeight < submenuHeight) {
					     var menuPos = pos.top - $(window).scrollTop();
						subMenu.css("top", -(menuPos) + 4 + "px");
					}
                    else if (submenuTop < submenuHeight) {
                        var menuPos = submenuTop - submenuHeight;
						subMenu.css("top", menuPos - 2 + "px");
					}
					else subMenu.css("top", "");
				}
            }
            else {
                left -= (posLeft + (2 * submenuWidth) + 4);
                if (left < 0) {
                    var menuLeftPos = (submenuWidth == null) ? "-206.5px" : "-" + (submenuWidth + 5) + "px";
                    subMenu.css("left", menuLeftPos);
                }
                else {
                    if (subMenu.parent('li.e-list').parent('ul').width() && direction == "right") {
                        subMenu.css("left", (subMenu.parent('li.e-list').parent('ul').width() + 4) + "px");
                    }
                    else if (pos.left > submenuWidth)
                        subMenu.css("left", -(submenuWidth + 4) + "px");
                }
                var submenuHeight = subMenu.outerHeight();
                if ((pos.top + submenuHeight > $(window).height())) {
                    var top = -(submenuHeight) + $(element).outerHeight();
                    if (submenuHeight > (pos.top + ($(element).outerHeight() / 2))) {
                        subMenu.css("top", -(submenuHeight / 2) + "px");
                    }
                    else
                        subMenu.css("top", top + "px");
                }
                else
                    subMenu.css("top","0px");
            }
        },


        _setSkin: function (skin) {
            this.wrapper.removeClass(this.model.cssClass).addClass(skin + " e-menu-wrap");
        },

        _setSeparator: function (separator) {
            if (separator){
                this.element.addClass("e-separator");
                if ($('.e-menu-popwrap').length>0 && !ej.isNullOrUndefined(this.ulTag))
                    this.ulTag.addClass("e-separator");     
            }
            else this.element.removeClass("e-separator");
        },

        _contextMenuEvents: function (action) {
            this[action]($(this.model.contextMenuTarget), "mouseup taphold", this._ContextMenuHandler);
            this[action](this.element, "contextmenu", this._onDefaultPreventer);
            this[action]($(this.model.contextMenuTarget), "contextmenu", this._onDefaultPreventer);
            this[action]($(document), "mousedown", this._onContextClose);
        },

        _show: function (element, showanim, hideanim) {
            var siblingElement;
            var sibling = $('> ul', element);
			var zIndex = this._max_zindex();
            sibling.attr({ "aria-hidden": false });
            this._hideAnimation($(element).siblings().find(' > ul:visible'), hideanim);
            if (!($.inArray(this._disabledMenuItems, element) > -1)) {
                if (sibling.css('display') != "none") {
                    siblingElement = this.model.openOnClick ? $(sibling) : sibling.children().find('> ul');
                    this._hideAnimation(siblingElement, hideanim);
                }
                else $('> ul', element).children().find('> ul').hide();
                this._subMenuPos(element, this.model.subMenuDirection);
                sibling.css({ "z-index": zIndex + 1 });
				$(element).children('span.e-menu-arrow').css({"z-index": zIndex + 2 });
                if ($('> ul', element).css('display') != 'block' && !$(element).hasClass("e-disable-item")) {
                    this._showAnimation(sibling, showanim);
                    sibling.closest('li').addClass('e-active e-mfocused');
                }
                if ($(element).siblings("li.e-active").length > 0)
                    $(element).siblings("li.e-active").removeClass("e-active e-mfocused");
            }
        },

        _closeAll: function () {
            this._hideAnimation(this.element.find('li.e-list:has("> ul")').find('> ul:visible'), this._hideAnim);
            this._hideAnimation(this.element.find('> ul:visible'), this._hideAnim);
        },

        _showAnimation: function (element, anim) {
            var proxy = this;
            switch (anim) {
                case "slideDown":
				    if (this.model.menuType == "contextmenu") {
						element.slideDown(this.model.enableAnimation ? 200 : 0, function(){ 
						    proxy._on(ej.getScrollableParents($(proxy.model.contextMenuTarget)), "scroll", proxy.hideContextMenu);
						});
					} 
					else {
						element.slideDown(this.model.enableAnimation ? 200 : 0); break;
					}
                case "none":
                    element.css("display", "block"); break;
            }
        },

        _hideAnimation: function (element, anim) {
            var proxy = this;
            switch (anim) {
                case "slideUp":
                    $(element).attr({ "aria-hidden": true });
					if (this.model.menuType == "contextmenu") {
                        element.slideUp(this.model.enableAnimation ? 100 : 0, function(){ 
                            proxy._off(ej.getScrollableParents($(proxy.model.contextMenuTarget)), "scroll", proxy.hideContextMenu);
                        });
					}
					else {
				         element.slideUp(this.model.enableAnimation ? 100 : 0); break;
					}
                case "none":
                    element.css("display", "none"); break;
            }
            element.closest('li').removeClass('e-active e-mfocused');
        },

        _removeValue: function (text, disableList) {
            var $browInfo = ej.browserInfo(), elementText;
            $browInfo.version === "8.0" && $browInfo.name === "msie" ? elementText = text[0].outerText : elementText = text[0].textContent;
            var count = $(disableList).length, i = 0;
            var childEle = $(disableList).children('a').length == 0 ? $(disableList).children('span') : $(disableList).children('a');
            while (i <= count) {
                if ($(childEle[i]).text() === elementText)
                    return i;
                i++;
            }
        },

        _createSubLevelItem: function (target, element) {
            var ulTag;
            ulTag = $(document.createElement('ul'));
            ulTag.append(element);
            target.append(ulTag);
            target.attr({ 'role': 'menu', 'aria-haspopup': 'true' });
            target.addClass("e-haschild");
            this.element.find('li:has("> ul")').find('> a,>span').addClass('aschild e-arrow-space');
            this._insertArrows(ulTag);
        },

        _insertArrows: function (ulTag) {
            if (this.model.showRootLevelArrows)
                ulTag.find('>a,>span').append($('<span>').addClass("e-icon e-arrowhead-down")).addClass("e-arrow-space");
            else
                ulTag.find('>a,>span').removeClass("e-arrow-space").find('>span.e-icon').remove();

            if (this.model.showSubLevelArrows)
                ulTag.parent('li.e-list:has(>ul)').children('a,span').append($('<span>').addClass("e-icon e-arrowhead-right")).addClass("e-arrow-space");
            else
                ulTag.parent('li.e-list:has(>ul)').children('a,span').removeClass("e-arrow-space").find('>span.e-icon').remove();
        },

        _createMenuItem: function (item) {
            var liTag, aTag, imgTag, spanTag;
            liTag = $(document.createElement('li'));
            liTag.attr({ "class": 'e-list', "role": "menuitem" });
            if (item["htmlAttribute"]) this._setAttributes(item["htmlAttribute"], liTag);
            if (item["text"] && item["text"] != "") {
                aTag = $(document.createElement('a'));
				aTag.attr({ "class": 'e-menulink'});
                if (item["imageUrl"] && item["imageUrl"] != "") {
                    imgTag = $(document.createElement('img'));
                    imgTag.attr('src', item["imageUrl"]);
                    if (item["imageAttribute"]) this._setAttributes(item["imageAttribute"], imgTag);
                    aTag.append(imgTag);
                }
                else if (item["spriteCssClass"] && item["spriteCssClass"] != "") {
                    spanTag = $(document.createElement('span'));
                    spanTag.addClass(item["spriteCssClass"]);
                    aTag.append(spanTag);
                }
                aTag.append(item["text"]);
                if (item["linkAttribute"]) this._setAttributes(item["linkAttribute"], aTag);
                if (item["url"])
                    aTag.attr('href', item["url"]);
                liTag.append(aTag);
            }
            if (item["id"]) {
                liTag.prop("id", item["id"]);
            }
            if (!this.model.enabled)
                liTag.addClass("e-disable-item");
            return liTag;
        },

        _insertNode: function (itemCollection, targetNode, operation) {
            var item = 0, targetList = 0, target = 0, targetCollection = [];
            if ($(targetNode).is(this.element))
                targetCollection.push(this.element);
            else
                typeof (targetNode) === "string" ? targetCollection.push(this.element.find(targetNode)) : typeof (targetNode) === "undefined" ? targetCollection.push(this.element) : targetCollection.push(targetNode);
            for (targetList = 0; targetList < targetCollection.length; targetList++) {
                for (target = 0; target < targetCollection[targetList].length; target++)
                    for (item = 0; item < itemCollection.length && !ej.isNullOrUndefined(itemCollection[item]) ; item++)
                        this._addItem(itemCollection[item], targetCollection[targetList][target], operation);
            }
        },

        _addItem: function (item, target, operation) {
            var element, targetElement;
            this._wireEvents("_off");
            element = this._createMenuItem(item);
            target = target === "default" ? $("#" + item["parentId"]) : $(target);
            switch (operation) {
                case "insert":
                    $(target).is(this.element) ? targetElement = target : targetElement = target.children('ul');
                    targetElement.length != 0 ? targetElement.append(element) : this._createSubLevelItem(target, element);
                    break;
                case "insertBefore":
                    if (!$(target).is(this.element))
                        element.insertBefore(target);
                    else
                        target.prepend(element);
                    break;
                case "insertAfter":
                    if (!$(target).is(this.element))
                        element.insertAfter(target);
                    else
                        target.append(element);
                    break;
            }
            this._wireEvents("_on");
        },

        _removeItem: function (item) {
            if (item.siblings('li').length == 0) {
                item.closest("ul").siblings('a.aschild').removeClass("aschild e-arrow-space").children('span.e-icon').remove();
                !item.closest("ul").hasClass("e-menu") ? item.closest("ul").remove() : item.remove();
            }
            else
                item.remove();
        },

        _hiddenElement: function (ele) {
            if (ele.length > 0 && ($.inArray(ele[0], this._hiddenMenuItems) == -1)) {
                ele.addClass("e-hidden-item");
                this._hiddenMenuItems.push(ele[0]);
            }
        },

        _showElement: function (ele) {
            if (ele.length > 0 && ($.inArray(ele[0], this._hiddenMenuItems) > -1)) {
                ele.removeClass("e-hidden-item");
                this._hiddenMenuItems.splice(this._hiddenMenuItems.indexOf(ele[0]), 1);
            }
        },

        _getNodeByID: function (node) {
           if(ej.isNullOrUndefined(this.popupWrapper))	
              (typeof node != "object" && node != "") && (node = this.element.find(".e-list" + node));
			else
			  (typeof node != "object" && node != "") && (node = this.popupWrapper.children().find(".e-list" + node));
            return $(node);
        },

        _processItems: function (node, bool) {
            var ele = this._getNodeByID(node);
            for (var i = 0; i < ele.length; i++) bool ? this._showElement($(ele[i])) : this._hiddenElement($(ele[i]));
        },

        insert: function (item, target) {
            this._insertNode(item, target, "insert");
        },

        insertBefore: function (item, target) {
            this._insertNode(item, target, "insertBefore");
        },

        insertAfter: function (item, target) {
            this._insertNode(item, target, "insertAfter");
        },

        remove: function (targetCollection) {
            var target = 0, innerTarget = 0;
            for (target = 0; target < targetCollection.length; target++) {
                targetCollection[target] = typeof (targetCollection[target]) === "string" ? (this.element.find(targetCollection[target])) : targetCollection[target];
                for (innerTarget = 0; innerTarget < targetCollection[target].length; innerTarget++)
                    (targetCollection[target][innerTarget].tagName === "LI" || targetCollection[target][innerTarget].tagName === "UL") ? this._removeItem($(targetCollection[target][innerTarget])) : targetCollection[target][innerTarget].remove();
            }
        },

        showContextMenu: function (locationX, locationY, targetElement, e, update) {
            this._closeMenu();
            this._eventArgs = e;
            if (!ej.isNullOrUndefined(e) && this._checkForExclusion(e.target)) return;
            if (this._trigger("beforeOpen", { target: targetElement, events: e })) return false;
            if (this._preventContextOpen) {
                if (!ej.isNullOrUndefined(targetElement))
                    this._targetElement = targetElement;
                else if (!ej.isNullOrUndefined(target))
                    this._targetElement = target;
                else
                    this._targetElement = this.element;
                if (update) {
                    var position = this._calculateContextMenuPosition(e);
                    locationX = position.X;
                    locationY = position.Y;
                }
                this.element.css({ "left": locationX, "top": locationY });
                this.element.css({ "z-index": this._max_zindex() + 1 });
                this._showAnimation(this.element, this._showAnim);
                this._isContextMenuOpen = true;
                this.element.focus();

                this._trigger("open", { target: targetElement });
            }
            return false;
        },

        _checkForExclusion: function (e) {
            if (!ej.isNullOrUndefined(this.model.excludeTarget)) {
                var excludeTargets = this.model.excludeTarget.split(",");
                for (var target = 0; target < excludeTargets.length; target++) {
                    if ($(e).closest(this.model.excludeTarget).is($.trim(excludeTargets[target])))
                        return true;
                }
            }
        },


        hideContextMenu: function (e) {
            this._closeMenu();
            this.element.find(".e-mhover").removeClass("e-mhover");
            this.element.find(".e-mfocused").removeClass("e-mfocused");
            this._hideAnimation(this.element, this._hideAnim);
            this._isContextMenuOpen = false;

            this._trigger("close", $.extend({ events: e }, e));
        },


        disableItem: function (itemToDisable) {
            var isMenuItem = $(this.element.find('li.e-list >a ,li.e-list >span')).filter(function () { return $.trim($(this).text()) === itemToDisable; });
            if (isMenuItem.length > 0 && !($.inArray(isMenuItem.parent()[0], this._disabledMenuItems) > -1)) {
                isMenuItem.parent().addClass("e-disable-item").attr({ "aria-disabled": true });
                isMenuItem.parent().find('>a.aschild span.e-icon').addClass("e-disable");
                this._disabledMenuItems.push(isMenuItem.parent()[0]);
            }
        },


        disableItemByID: function (itemId) {
            if (itemId && itemId != "") {
                var itemToDisable = this.element.find("#" + itemId) ? this.element.find("#" + itemId)[0] : undefined;
                if (itemToDisable && !($.inArray(itemToDisable, this._disabledMenuItems) > -1)) {
                    $(itemToDisable).addClass("e-disable-item").attr({ "aria-disabled": true });
                    $(itemToDisable).find('>a.aschild span.e-icon').addClass("e-disable");
                    this._disabledMenuItems.push(itemToDisable);
                }
            }
        },

        getHiddenItems:function(){
            return this._hiddenMenuItems;
        },

        hideItems: function (node) {
            if (typeof node == "object" && node.length !== undefined) {
                for (var i = 0; i < node.length; i++) this._processItems(node[i], false);                
            }
            else this._processItems(node, false);
        },

        showItems:function(node){
            if (typeof node == "object" && node.length !== undefined) {
                for (var i = 0; i < node.length; i++) this._processItems(node[i], true);
            }
            else this._processItems(node, true);
        },

        enableItem: function (itemToEnable) {
            var isMenuItem = $(this.element.find('li.e-list >a ,li.e-list >span')).filter(function () { return $.trim($(this).text()) === itemToEnable; });
            if (isMenuItem.length > 0 && ($.inArray(isMenuItem.parent()[0], this._disabledMenuItems) > -1)) {
                isMenuItem.parent().removeClass("e-disable-item").attr({ "aria-disabled": false });
                isMenuItem.parent().find('>a.aschild span.e-icon').removeClass("e-disable");
                var index = this._removeValue(isMenuItem, this._disabledMenuItems);
                this._disabledMenuItems.splice(index, 1);
            }
        },


        enableItemByID: function (itemId) {
            if (itemId && itemId != "") {
                var itemToEnable = this.element.find("#" + itemId)[0];
                if (itemToEnable && ($.inArray(itemToEnable, this._disabledMenuItems) > -1)) {
                    $(itemToEnable).removeClass("e-disable-item").attr({ "aria-disabled": false });
                    $(itemToEnable).find('>a.aschild span.e-icon').removeClass("e-disable");
                    for (var i = this._disabledMenuItems.length - 1; i >= 0; i--) {
                        if (this._disabledMenuItems[i].id == itemId) {
                            this._disabledMenuItems.splice(i, 1);
                        }
                    }
                }
            }
        },


        disable: function () {
            this.model.enabled = false;
            var menuItemCollection = this.element.find('>li[class~=e-list]');
            var proxy = this;
            $.each(menuItemCollection, function (key, value) {
                if (!($.inArray(value, proxy._disabledMenuItems) > -1))
                {
                    $(value).addClass("e-disable-item").attr({ "aria-disabled": true });
                    $(value).find('>a.aschild span.e-icon').addClass("e-disable");
                    proxy._disabledMenuItems.push(value);
                }
                
            });
        },


        enable: function () {
            var proxy = this;
            this.model.enabled = true;
            var menuItemCollection = this.element.find('li.e-disable-item');
            $.each(menuItemCollection, function (key, value) {
                $(value).removeClass("e-disable-item").attr({ "aria-disabled": false });
                $(value).find('>a.aschild span.e-icon').removeClass("e-disable");
                proxy._disabledMenuItems.pop(value);
            });
        },

        show: function (locationX, locationY, targetElement, e) {
            if (!this.model.enabled) return false;
            if (this.model.menuType == "contextmenu")
                this.showContextMenu(locationX, locationY, targetElement, e, false);
            else
                this.element.css("display", "block");
        },

        hide: function (e) {
            if (!this.model.enabled) return false;
            if (this.model.menuType == "contextmenu")
                this.hideContextMenu(e);
            else {
                this._closeMenu();
                this.element.css("display", "none");
            }
        },

        _wireEvents: function (action) {
            this[action](this.element.find("li.e-list"), "mouseout", this._mouseOutHandler);
            this[action](this.element.find("li.e-list"), "mouseover", this._mouseOverHandler);
            this[action](this.element.children(), "click", this._onClickHandler); 
            this[action](this.element, "keydown", this._onKeyDownHandler);
            this[action](this.element, "focus", this._OnFocusHandler);
            this[action](this.element, "blur", this._OnFocusOutHandler);
            if (this.model.menuType == "contextmenu" && $(this.model.contextMenuTarget)[0] != null) {
                this._contextMenuEvents(action);
            }
            if (this.model.menuType != "contextmenu") {
                this[action]($(document), "click", this._onDocumentClick);
                this[action](this.element, "mousedown", this._onMouseDownHandler);
            }
            this[action]($(window),"resize", $.proxy(this._onResize, this));            
        },

        _mouseOverHandler: function (event) {
            var element, itemId = "";
            this.element.find(".e-mhover").removeClass("e-mhover");
            event.currentTarget = $(event.target).closest("li")[0];
            if (!$(event.currentTarget).hasClass('e-disable-item'))
                $(event.currentTarget).addClass("e-mhover");
            else this._isFocused = false;
            if (event.stopPropagation)
                event.stopPropagation();
            if (typeof (this._delaySubMenuHover) !== 'undefined') {
                clearTimeout(this._delaySubMenuHover);
            }
            if (typeof (this._delaySubMenuHover) !== 'undefined') {
                clearTimeout(this._delayMenuHover);
            }
            this._mouseOver = true;
            this._isMenuOpen = true;
            if ($(event.currentTarget.parentNode.parentNode).is(this.element)) {
                this._isSubMenuOpen = false;
            }
            else {
                this._isSubMenuOpen = true;
            }
            if (event.currentTarget.nodeName == "LI")
                element = event.currentTarget;
            else if (event.currentTarget.parentNode) {
                if (event.currentTarget.parentNode.nodeName == "LI")
                    element = event.currentTarget.parentNode;
                else
                    return false;
            }
            else {
                event.preventDefault();
                return false;
            }
            if (!$(event.currentTarget).hasClass('e-disable-item'))
                this._onMenuIntent(element, this, this._hoverOpen);
            if (!($.inArray(element, this._disabledMenuItems) > -1)) {
                var menuText = $(element).children('a,span').text();
                itemId = !ej.isNullOrUndefined(element) ? $(element)[0].id : "";
                var eventArgs = { "text": menuText, "element": element, "event": event, "ID": itemId };

                this._trigger("mouseover", $.extend({ events: eventArgs }, eventArgs));
            }
        },

        _onMouseDownHandler: function (e) {
            if ($(e.target).hasClass('e-menu')) this._isFocused = false;
        },


        _mouseOutHandler: function (event) {
            var element, itemId = "";
            $(event.currentTarget).removeClass("e-mhover");
            if (event.stopPropagation)
                event.stopPropagation();
            if (typeof (this._delaySubMenuHover) !== 'undefined') {
                clearTimeout(this._delaySubMenuHover);
            }
            if (typeof (this._delaySubMenuHover) !== 'undefined') {
                clearTimeout(this._delayMenuHover);
            }
            this._mouseOver = false;
            this._isMenuOpen = false;

            if (event.currentTarget.nodeName == "LI")
                element = event.currentTarget;
            else if (event.currentTarget.parentNode) {
                if (event.currentTarget.parentNode.nodeName == "LI")
                    element = event.currentTarget.parentNode;
                else
                    return false;
            }
            else {
                event.preventDefault();
                return false;
            }
            this._onHide(element, this, this._hoverClose);
            if (!($.inArray(element, this._disabledMenuItems) > -1)) {
                var menuText = $(element).children('a,span').text();
                itemId = !ej.isNullOrUndefined(element) ? $(element)[0].id : "";
                var eventArgs = { "text": menuText, "element": element, "event": event, "ID": itemId };

                this._trigger("mouseout", $.extend({ events: eventArgs }, eventArgs));
            }
        },

        _onClickHandler: function (event) {
            var element, itemId = "" , parentId, parentText;
            this._isFocused = true;
            var openOnClickStart = false;
            if (!$(event.target).closest("li.e-list").hasClass('e-disable-item') && $(event.target).closest("li.e-list").length > 0) {
                element = $(event.target).closest("li.e-list")[0];
                if ($(element).is(this.element.find(">li.e-list")))
                    this._activeElement = element;
            }
            else {
                if ($(event.target).is(this.element))
                    this._activeElement = this.element.find(">li:first");
                return;
            }
            if ($(event.target).is("a") && $(element).find(">a,>span").hasClass('aschild') && this.model.openOnClick) {
                this._isFocused = false;
            }
            if (!this._hoverOpen && $(element).find(">a,>span").hasClass('aschild')) {
                this._show(element, this._showAnim, this._hideAnim);
                this._hoverOpen = false;
                openOnClickStart = true;
            }
            if (!($.inArray(element, this._disabledMenuItems) > -1)) {
                //Check if Context Menu, then hide the context menu firing the events
                if (this.model.menuType == "contextmenu") {
                    if (this._isContextMenuOpen && !$(element).hasClass("e-haschild")) {
                        this._hideAnimation(this.element, this._hideAnim);
                        this._isContextMenuOpen = false;

                        this._trigger("close", $.extend({ events: event }, event));
                    }
                }
                if (!openOnClickStart) {
                    if (!$(element).find(">a,>span").hasClass("aschild")) {
                        this._closeMenu();
                        if (this.model.openOnClick)
                            this._hoverOpen = false;
                    }
                }
                var menuText = $(element).children('a,span').text();
                var parent = $(element).closest("ul").parent("li");
                if (parent.length != 0) {
                    parentId = ej.isNullOrUndefined(parent.attr("id")) ? null : parent.attr("id");
                    parentText = parent.children('a,span').text();
                }
                else {
                    parentId = null;
                    parentText = null;
                }
                itemId = !ej.isNullOrUndefined(element) ? $(element)[0].id : "";
                var eventArgs = { "text": menuText, "element": element, "event": event, "selectedItem": this.selectedItem, "ID": itemId, "parentId": parentId, "parentText": parentText };
                this._trigger("click", $.extend({ events: eventArgs }, eventArgs));
                this.selectedItem = null;
                if (this.model.openOnClick && this.model.menuType != "contextmenu")
                    this.element.focus();
            }
        },


        _onKeyDownHandler: function (e) {
            if( e.target && e.target.nodeName && $( e.target ).closest( "input, textarea" ).length > 0) return true;
            if (this.model.menuType == "contextmenu" && !this._isContextMenuOpen) return;
            var element, focusEle, itemId = "", hoverElement = this.element.find(".e-mhover"), focusedElement = this.element.find(".e-mfocused"), currentElement, liVisible;
            if (!$(hoverElement).length > 0 && $(this._activeElement).length > 0)
                hoverElement = focusedElement = $(this._activeElement);

            if (e.keyCode == 9) {
                this._isFocused = false;
                this._OnFocusOutHandler();
            }
            else if (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40)
                e.preventDefault();

            if (e.keyCode == 40) {
                if (this.model.orientation == "horizontal") {
                    if (this.element.find(">li.e-mhover").children("ul").length > 0 || $(this._activeElement).length > 0) {
                        if ($(hoverElement).children("ul").css('display') === "none")
                            this._show(hoverElement[hoverElement.length - 1], this._showAnim, this._hideAnim);
                        hoverElement.removeClass("e-mhover e-mfocused").children("ul:first").find("li:first").addClass("e-mhover");
                        this._activeElement == null ? hoverElement.addClass("e-mfocused") : $(this._activeElement).addClass("e-mfocused");
                    } else {
                        liVisible = hoverElement.parent().children('li.e-list:visible:not(.e-hidden-item, .e-disable-item)');
                        $(hoverElement[hoverElement.length-1]).removeClass("e-mfocused e-mhover");
                        focusEle = $(liVisible[liVisible.index(hoverElement) + 1]).length > 0 ? $(liVisible[liVisible.index(hoverElement[hoverElement.length - 1]) + 1]) : liVisible.first();
                        focusEle.addClass("e-mhover");
                    }
                }
                else if (this.model.orientation != "horizontal") {
                    if (hoverElement.length == 0) liVisible = this.element.children('li.e-list:visible:not(.e-hidden-item, .e-disable-item)');
                    else liVisible = hoverElement.parent().children('li.e-list:visible:not(.e-hidden-item, .e-disable-item)');
                    hoverElement.removeClass("e-mfocused e-mfocused");
                    if (hoverElement.length > 0) {
                        hoverElement.removeClass("e-mhover");
                        focusEle = $(liVisible[liVisible.index(hoverElement[hoverElement.length - 1]) + 1]).length > 0 ? $(liVisible[liVisible.index(hoverElement[hoverElement.length - 1]) + 1]) : liVisible.first();
                    } else focusEle = liVisible.first();
                    focusEle.addClass("e-mhover");
                }
            }
            if (e.keyCode == 39) {
                if (this.model.orientation == "horizontal" && (this.element.find(">li.e-list").hasClass("e-mhover") || $(this._activeElement).length > 0)) {
                    hoverElement.removeClass("e-mfocused e-mhover");
                    liVisible = this.element.children('li.e-list:visible:not(.e-hidden-item, .e-disable-item)');
                    focusEle = $(liVisible[liVisible.index(hoverElement[hoverElement.length - 1]) + 1]).length > 0 ? $(liVisible[liVisible.index(hoverElement[hoverElement.length - 1]) + 1]) : liVisible.first();
                    focusEle.addClass("e-mhover");
                }
                else if ($(hoverElement).children("ul").length > 0) {
                    hoverElement.removeClass("e-mfocused e-mhover");
                    var firstChild = hoverElement.children("ul:first").find("li:first");
                    this._show(hoverElement[hoverElement.length - 1], this._showAnim, this._hideAnim);
                    liVisible = hoverElement.addClass('e-mfocused').children("ul:first").children('li.e-list:visible:not(.e-hidden-item, .e-disable-item)');
                    focusEle = $(liVisible[liVisible.index(firstChild)]).length > 0 ? $(liVisible[liVisible.index(firstChild)]) : liVisible.first();
                    focusEle.addClass("e-mhover");
                }
                else if (hoverElement.children("ul").length <= 0) {
                    if (this.model.orientation == "horizontal" && hoverElement.parent().closest('.e-list').parent().hasClass('e-menu')) {
                        this._hideAnimation(hoverElement.parent(), this._hideAnim);
                        hoverElement.removeClass("e-mfocused e-mhover");
                        $(focusedElement[focusedElement.length - 1]).removeClass("e-mfocused");
                        liVisible = hoverElement.parent().closest('.e-list').parent().children('li.e-list:visible:not(.e-hidden-item, .e-disable-item)');
                        focusEle = $(liVisible[liVisible.index(focusedElement[focusedElement.length - 1]) + 1]).length > 0 ? $(liVisible[liVisible.index(focusedElement[focusedElement.length - 1]) + 1]) : $(liVisible[liVisible.index(focusedElement.first())]);
                        focusEle.addClass("e-mhover");
                    }
                }
            }

            if (e.keyCode == 38) {
                if (this.model.orientation == "horizontal") {
                    liVisible = hoverElement.parent().children('li.e-list:visible:not(.e-hidden-item, .e-disable-item)');
                    hoverElement.removeClass("e-mfocused e-mhover");
                    focusEle = $(liVisible[liVisible.index(hoverElement[hoverElement.length - 1]) - 1]).length > 0 ? $(liVisible[liVisible.index(hoverElement[hoverElement.length - 1]) - 1]) : liVisible.last();
                }
                else if (this.model.orientation != "horizontal") {
                    if (hoverElement.length == 0) liVisible = this.element.children('li.e-list:visible:not(.e-hidden-item, .e-disable-item)');
                    else liVisible = hoverElement.parent().children('li.e-list:visible:not(.e-hidden-item, .e-disable-item)');
                    if (hoverElement.length > 0) {
                        hoverElement.removeClass("e-mfocused e-mhover");
                        focusEle = $(liVisible[liVisible.index(hoverElement[hoverElement.length - 1]) - 1]).length > 0 ? $(liVisible[liVisible.index(hoverElement[hoverElement.length - 1]) - 1]) : liVisible.last();
                    } else focusEle = liVisible.last();
                }
                focusEle.addClass("e-mhover");
            }

            if (e.keyCode == 37) {
                if (this.model.orientation == "horizontal") {
                    if (this.element.find(">li.e-list").hasClass("e-mhover") || $(this._activeElement).length > 0) {
                        hoverElement.removeClass("e-mfocused e-mhover");
                        liVisible = this.element.find('li.e-list:visible:not(.e-hidden-item, .e-disable-item)');
                        focusEle = $(liVisible[liVisible.index(hoverElement[hoverElement.length - 1]) - 1]).length > 0 ? $(liVisible[liVisible.index(hoverElement[hoverElement.length - 1]) - 1]) : liVisible.last();
                        focusEle.addClass("e-mhover");
                    }
                    else {
                        this._hideAnimation(hoverElement.parent(), this._hideAnim);
                        hoverElement.removeClass("e-mfocused e-mhover");
                        $(focusedElement[focusedElement.length - 1]).removeClass("e-mfocused e-active");
                        liVisible = hoverElement.parent().closest('.e-list').parent().children('li.e-list:visible:not(.e-hidden-item, .e-disable-item)');
                        if (hoverElement.parent().closest('.e-list').parent('.e-menu').length > 0)
                            focusEle = $(liVisible[liVisible.index(focusedElement[focusedElement.length - 1]) - 1]).length > 0 ? $(liVisible[liVisible.index(focusedElement[focusedElement.length - 1]) - 1]) : liVisible.last();
                        else
                            focusEle = $(liVisible[liVisible.index(focusedElement[focusedElement.length - 1])]).length > 0 ? $(liVisible[liVisible.index(focusedElement[focusedElement.length - 1])]) : liVisible.last();
                        focusEle.addClass("e-mhover");
                    }
                }
                else if (hoverElement.parent(".e-menu").length == 0 || (this.model.menuType == "contextmenu" && hoverElement.parent("ul.e-context").length == 0)) {
                        this._hideAnimation(hoverElement.parent(), this._hideAnim);
                        hoverElement.removeClass("e-mfocused e-mhover");
                        $(focusedElement[focusedElement.length - 1]).removeClass("e-mfocused");
                        liVisible = hoverElement.parent().closest('.e-list').parent().children('li.e-list:visible:not(.e-hidden-item, .e-disable-item)');
                        focusEle = $(liVisible[liVisible.index(focusedElement[focusedElement.length - 1])]).length > 0 ? $(liVisible[liVisible.index(focusedElement[focusedElement.length - 1])]) : $(liVisible[liVisible.index(focusedElement.last())]);
                        focusEle.addClass("e-mhover");
                }
            }
            if (e.keyCode == 13) {
                var menuText = $(hoverElement).children('a,span').text();
                itemId = !ej.isNullOrUndefined($(hoverElement)[0]) ? $(hoverElement)[0].id : "";
                var eventArgs = { "menuId": this.element[0].id, "text": menuText, "selectedItem": focusedElement, "ID": itemId };
                if (this.model.menuType == "contextmenu") {
                    if (this._isContextMenuOpen && hoverElement.length > 0 && !focusedElement.hasClass("e-disable-item")) {
                        if (this.model.click)
                            this._trigger("click", $.extend({ events: eventArgs }, eventArgs));
                        this.selectedItem = null;
                        this.hideContextMenu(e);
                    }
                } else {
                    if (hoverElement.length > 0 && !hoverElement.hasClass("e-disable-item")) {
                        if ($(hoverElement).find(">a,>span").hasClass('aschild') && $(hoverElement).children("ul").css('display') === "none") {
                            this._show(hoverElement[0], this._showAnim, this._hideAnim);
                            hoverElement.removeClass("e-mhover").children("ul:first").find("li:first").addClass("e-mhover");
                        }
                        else {
                            this.element.find(".e-mhover >a,.e-mhover >span ").focus();
                            this.element.find("li.e-list").removeClass("e-mhover e-mfocused");
                            this._closeAll();
                        }
                        if (ej.isNullOrUndefined($(hoverElement).find(">a").attr("href")))
                            this._trigger("click", $.extend({ events: eventArgs }, eventArgs));
                    }
                }
            }
            if (e.keyCode == 27) {
                if (this.model.menuType == "contextmenu")
                    this.hideContextMenu(e);
                else
					this.element.find("li.e-list").removeClass("e-mhover");
                    this.element.find('li.e-list:has("> ul")').find('> ul:visible').parents("li.e-list").addClass("e-mhover");
                    this._closeAll();
            }
            if ($(e.target).is(this.element) && e.target.parentNode) {
                if (hoverElement.length)
                    element = hoverElement;
            }
            else
                return false;
            if (!($.inArray(element, this._disabledMenuItems) > -1)) {
                var menuText = $(element).children('a,span').text();

                itemId = !ej.isNullOrUndefined(element) ? $(element)[0].id : "";
                if (this.element.find('li.e-mfocused.e-mhover').length || e.keyCode == 13)
                    currentElement = (e.keyCode == 13) ? hoverElement : this.element.find('li.e-mfocused.e-mhover');
                var eventArgs = { "text": menuText, "element": element, "targetElement": currentElement , "event": e, "ID": itemId };

                this._trigger("keydown", $.extend({ events: eventArgs }, eventArgs));
            }
            this._activeElement = null; focusedElement = this.element.find(".e-mfocused");
        },

        _OnFocusHandler: function (event) {
            if (this.model.menuType != "contextmenu" && !this.element.find(">li:first").hasClass("e-disable-item") && this._isFocused && this.element.find(".e-mhover").length == 0 && $('li.e-ham-wrap').length ==0) {
                this.element.find(">li:first").addClass("e-mhover");
            }
            else this._isFocused = true;
            if (this.model.menuType != "contextmenu")
                this._activeElement = this.element.find(">li:first");
        },

        _OnFocusOutHandler: function () {
            if (!this._isFocused) {
                this.element.find("li.e-list").removeClass("e-mhover e-mfocused");
                this._closeAll();
            }
            this._isFocused = false;
        },

        _onDocumentClick: function (event) {
            if (this.model.openOnClick)
                this._hoverOpen = false;
            if (!$(event.target).parents(".e-menu").is(this.element)) {
                this.element.find("li.e-list").removeClass("e-mhover e-mfocused");
                this._closeAll();
                this._isFocused = true;
            }
            if ((!$(event.target).parents("ul.e-menu").is(this.popupWrapper)) && (!$(event.target).hasClass('e-ham-wrap')) && (!($(event.target).parent().hasClass('e-ham-wrap'))) && (!$(event.target).hasClass('e-hamburger')) && (!$(event.target).parent("li").hasClass("e-haschild")) && (!$(event.target).is('span.e-icon.e-arrowhead-down')) && !(this._isOverflowPopupOpen()) && this.model.menuType != "contextmenu" && $("li.e-ham-wrap").length > 0) {
                this._overflowClose();
            }           
        },


        _ContextMenuHandler: function (e) {
            var isRightClick = false;
            if (e.type == "taphold" && e.button != 0)
                isRightClick = true;
            else if (e.button)
                isRightClick = (e.button == 2);
            else if (e.which)
                isRightClick = (e.which == 3); //for Opera
            var targetElement = e.target;
            if (isRightClick) {
                var evt = e;
                if (e.type == "taphold") {
                    if (e.options.type == "touchstart") evt = e.options.touches[0];
                    else evt = e.options;
                }
                var showSpeed = this._showSpeed;
                this.showContextMenu(null, null, targetElement, evt, true);
            }
            else {
                if (this._isContextMenuOpen) {
                    var hideanim = this._hideAnim;
                    var hideSpeed = this._hideSpeed;
                    this.hideContextMenu(e, hideanim, hideSpeed);
                }
            }
        },

        _calculateContextMenuPosition: function (e) {
            var locationX, locationY;
            this.element.css({"top": "", "left": ""}); 
            locationX = (e.clientX + this.element.width() < $(window).width()) ? e.pageX : e.pageX - this.element.width();
            locationY = (e.clientY + this.element.height() < $(window).height()) ? e.pageY : (e.clientY > this.element.height()) ? e.pageY - this.element.height() : $(window).height() - this.element.outerHeight();
            var bodyPos = $("body").css("position") != "static" ? $("body").offset() : { left: 0, top: 0 };
            locationX -= bodyPos.left, locationY -= bodyPos.top;
            return {
                X: locationX,
                Y: locationY
            };
        },


        _onDefaultPreventer: function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        },


        _onContextClose: function (e) {
            var proxy = this;
            if (this._isContextMenuOpen) {
                var isRightClick = false;
                if ($(e.target).is(this.element) || $(e.target).parents(".e-context").is(this.element))
                    isRightClick = true;
                if (!isRightClick) {
                    var hideanim = this._hideAnim;
                    var hideSpeed = this._hideSpeed;
                    this.hideContextMenu(e, hideanim, hideSpeed);
                    var parentElements = $(e.target).parents();
                    $.each(parentElements, function (index, value) {
                        if (value.id == proxy._ContextTargetId) {
                            return;
                        }
                    });

                }
            }
        }

    });

    ej.Menu.Locale = ej.Menu.Locale || {} ;
       
    ej.Menu.Locale['default'] = ej.Menu.Locale["en-US"] = {  	
        titleText: "Menu"
    };
    ej.MenuType = {
        /**  support for list of items appears as normal menu in horizontal or vertical direction. */
        NormalMenu: "normalmenu",
        /**  support for list of items appears as menu when right clicked on target area, thereby preventing browser’s default right click.. */
        ContextMenu: "contextmenu"
    };

    ej.Direction = {
        /**  support for Render sub menu popup in left direction. */
        Left: "left",
        /**  support for Render sub menu popup in Right direction. */
        Right: "right",
        /** Default opening direction of menu sub items */
        None: "none",
    };

    ej.AnimationType = {
        /**  support for disable the AnimationType while hover or click an menu items. */
        None: "none",
        /**  support for enable the AnimationType while hover or click an menu items. */
        Default: "default"
    };

})(jQuery, Syncfusion);;
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function ($) {
    var SpellCheck = (function (_super) {
        __extends(SpellCheck, _super);
        function SpellCheck() {
            _super.apply(this, arguments);
            this.rootCSS = "e-spellcheck";
            this.validTags = ["div", "span", "textarea"];
            this.PluginName = "ejSpellCheck";
            this._id = "null";
            this.defaults = {
                locale: "en-US",
                misspellWordCss: "e-errorword",
                ignoreSettings: {
                    ignoreAlphaNumericWords: true,
                    ignoreHtmlTags: true,
                    ignoreEmailAddress: true,
                    ignoreMixedCaseWords: true,
                    ignoreUpperCase: true,
                    ignoreUrl: true,
                    ignoreFileNames: true
                },
                dictionarySettings: { dictionaryUrl: "", customDictionaryUrl: "" },
                maxSuggestionCount: 6,
                ajaxDataType: "jsonp",
                ajaxRequestType: "GET",
                ignoreWords: [],
                contextMenuSettings: {
                    enable: true,
                    menuItems: [{ id: "IgnoreAll", text: "Ignore All" },
                        { id: "AddToDictionary", text: "Add to Dictionary" }]
                },
                isResponsive: true,
                enableValidateOnType: false,
                controlsToValidate: null,
                enableAsync: true,
                actionSuccess: null,
                actionBegin: null,
                actionFailure: null,
                start: null,
                complete: null,
                contextOpen: null,
                contextClick: null,
                dialogBeforeOpen: null,
                dialogOpen: null,
                dialogClose: null,
                validating: null,
                targetUpdating: null
            };
            this.dataTypes = {
                locale: "string",
                misspellWordCss: "string",
                ignoreSettings: {
                    ignoreAlphaNumericWords: "boolean",
                    ignoreHtmlTags: "boolean",
                    ignoreEmailAddress: "boolean",
                    ignoreMixedCaseWords: "boolean",
                    ignoreUpperCase: "boolean",
                    ignoreUrl: "boolean",
                    ignoreFileNames: "boolean"
                },
                dictionarySettings: {
                    dictionaryUrl: "string",
                    customDictionaryUrl: "string",
                    customDictionaryPath: "string"
                },
                maxSuggestionCount: "number",
                ajaxDataType: "string",
                ajaxRequestType: "string",
                ignoreWords: "array",
                contextMenuSettings: {
                    enable: "boolean",
                    menuItems: "array"
                }
            };
            this._tags = [
                { tag: "ignoreSettings", attr: [] },
                { tag: "dictionarySettings", attr: [] },
                { tag: "contextMenuSettings.menuItems", attr: ["id", "text"] },
            ];
            this._localizedLabels = null;
            this._statusFlag = true;
            this._words = [];
            this._inputWords = [];
            this._controlIds = [];
            this._control = [];
            this._targetStatus = true;
            this._statusMultiTarget = false;
            this._changeAllWords = [];
            this._subElements = [];
            this._iframeStatus = false;
            this._elementStatus = true;
            this._suggestedWordCollection = [];
            this._ignoreStatus = true;
            this._suggestedWords = [];
            this.webMethod = false;
            this.model = this.defaults;
        }
        SpellCheck.prototype._init = function () {
            if (!ej.isNullOrUndefined(this.element)) {
                this._renderSpellCheck();
            }
        };
        SpellCheck.prototype._renderSpellCheck = function () {
            this._initLocalize();
            this._renderControls();
        };
        SpellCheck.prototype._initLocalize = function () {
            this._localizedLabels = this._getLocalizedLabels();
        };
        SpellCheck.prototype._renderControls = function () {
            if (ej.isNullOrUndefined(this.model.controlsToValidate)) {
                this._addAttributes(this, this.element);
            }
            else {
                $(this.element).attr("style", "display:none");
                this._controlIds = this.model.controlsToValidate.split(",");
                var elementPresent = false;
                for (var i = 0; i < this._controlIds.length; i++) {
                    var element = $(this._controlIds[i]);
                    if (element.length > 0) {
                        elementPresent = true;
                        if (element.length > 1) {
                            for (var j = 0; j < element.length; j++) {
                                var subElement = $(element[j]);
                                this._addAttributes(this, subElement);
                            }
                        }
                        else {
                            this._addAttributes(this, element);
                        }
                    }
                }
                this._elementStatus = this._statusFlag = elementPresent;
            }
            if (this.model.isResponsive) {
                this._on($(window), "resize", $.proxy(this._resizeSpellCheck, this));
            }
        };
        SpellCheck.prototype._addAttributes = function (proxy, element) {
            $(element).addClass("e-spellcheck");
            element[0].spellcheck = false;
            proxy._addEventListeners(proxy, element);
        };
        SpellCheck.prototype._addEventListeners = function (proxy, element) {
            if (proxy._isIframe(element)) {
                $(element)[0].contentWindow.document.addEventListener("input", function () {
                    proxy._changeStatus(proxy);
                }, false);
                if (proxy.model.contextMenuSettings.enable) {
                    $(element)[0].contentWindow.document.addEventListener("mousedown", function () {
                        proxy._elementRightClick(proxy);
                    }, false);
                    ($(document)[0]).addEventListener("mousedown", function () {
                        proxy._elementRightClick(proxy);
                    }, false);
                    $(element)[0].contentWindow.document.addEventListener("keydown", function (e) {
                        proxy._spellValidateOnType(e);
                    }, false);
                }
            }
            else {
                element[0].addEventListener("input", function () {
                    proxy._changeStatus(proxy);
                }, false);
                if (proxy.model.contextMenuSettings.enable) {
                    proxy._on($(document), "mousedown", $.proxy(proxy._elementRightClick, proxy));
                    proxy._on($(element[0]), "keydown", "", this._spellValidateOnType);
                }
            }
        };
        SpellCheck.prototype._changeStatus = function (proxy) {
            proxy._statusFlag = true;
            if (!ej.isNullOrUndefined(proxy.model.controlsToValidate)) {
                proxy._controlIds = proxy.model.controlsToValidate.split(",");
                proxy._targetStatus = true;
            }
        };
        SpellCheck.prototype._isIframe = function (element) {
            return $(element)[0].tagName === "IFRAME";
        };
        SpellCheck.prototype._resizeSpellCheck = function () {
            var spellWindowParent = !ej.isNullOrUndefined(this._spellCheckWindow) && this._spellCheckWindow.parents().find(".e-spellcheck.e-dialog-wrap");
            var dialogObj = (!ej.isNullOrUndefined(this._spellCheckWindow) &&
                spellWindowParent.length > 0) && this._spellCheckWindow.data("ejDialog");
            if (this.model.isResponsive) {
                if (!ej.isNullOrUndefined(this._spellCheckWindow) && spellWindowParent.length > 0 && this._spellCheckWindow.ejDialog("isOpen")) {
                    dialogObj._dialogPosition();
                    var listObj = this._spellCheckWindow.find(".e-suggesteditems").data("ejListBox");
                    listObj.refresh(true);
                    var scrollObj = this._spellCheckWindow.find(".e-sentence .e-sentencescroller").data("ejScroller");
                    setTimeout(function () {
                        spellWindowParent.find(".e-dialog-scroller").width(spellWindowParent.width() - 2);
                        spellWindowParent.find(".e-suggestionlist .e-content").width(spellWindowParent.find(".e-suggestionlist .e-content").width() - 2);
                        scrollObj.refresh();
                    }, 4);
                }
            }
            else {
                dialogObj._dialogPosition();
            }
            if (!ej.isNullOrUndefined(this._alertWindow) && this._alertWindow.data("ejDialog")) {
                var alertDialogObj = !ej.isNullOrUndefined(this._alertWindow) && this._alertWindow.data("ejDialog");
                alertDialogObj._dialogPosition();
            }
        };
        SpellCheck.prototype.showInDialog = function () {
            if (this._statusFlag) {
                this._renderDialogWindow();
            }
            else {
                this._alertWindowRender("show");
            }
        };
        SpellCheck.prototype.validate = function () {
            if (this._statusFlag) {
                var diffWords = [], event;
                if (this.model.contextMenuSettings.enable &&
                    !ej.isNullOrUndefined(this.model.dictionarySettings.dictionaryUrl)) {
                    var inputText = "";
                    if ((this._controlIds.length > 0 && !this._currentActiveElement && this.model.enableValidateOnType) ||
                        (this._controlIds.length > 0 && (!this.model.enableValidateOnType || !this._statusMultiTarget))) {
                        for (var i = 0; i < this._controlIds.length; i++) {
                            var element = $(this._controlIds[i]);
                            if (element.length > 0) {
                                for (var j = 0; j < element.length; j++) {
                                    var subElement = $(element[j]);
                                    var elementText = "";
                                    elementText = this._elementTextProcess(this, subElement);
                                    inputText = inputText === "" ? inputText.concat(elementText) : inputText.concat(" " + elementText);
                                }
                            }
                        }
                    }
                    else if (this.model.enableValidateOnType && this._currentActiveElement) {
                        inputText = this._elementTextProcess(this, $(this._currentActiveElement));
                    }
                    else {
                        if (this._isIframe(this.element)) {
                            $(this.element).contents().find("body").addClass("e-spellcheck");
                        }
                        inputText = this._elementTextProcess(this, this.element);
                    }
                    diffWords = this._filteringDiffWords(this, inputText);
                    this._splitWords(inputText, this);
                    event = { targetSentence: inputText, requestType: "validate", additionalParams: null, webMethod: false };
                    if (this._trigger("actionBegin", event)) {
                        return false;
                    }
                    if (diffWords.length > 0) {
                        this._ajaxRequest(this, diffWords.join(" "), "validateOnType", event);
                    }
                    else if (diffWords.length === 0 && !this._ignoreStatus) {
                        this._splitInputWords(inputText, this);
                        diffWords = ej.dataUtil.distinct(this._inputWords);
                        this._ajaxRequest(this, diffWords.join(" "), "validateOnType", event);
                    }
                    else {
                        if (!ej.isNullOrUndefined(this._errorWordDetails)) {
                            var errorWordData = this._filterErrorData(this, this._errorWordDetails);
                            this._validateOnTypeOperations(this, errorWordData, inputText, "validateOnType");
                        }
                        else {
                            if (!this.model.enableValidateOnType) {
                                this._alertWindowRender("show");
                            }
                        }
                    }
                }
            }
            else {
                this._alertWindowRender("show");
            }
        };
        SpellCheck.prototype._filteringDiffWords = function (proxy, inputText) {
            var splitWords = proxy._inputWords, diffWords = [];
            proxy._splitInputWords(inputText, proxy);
            var updatedWords = proxy._inputWords;
            var index;
            for (var i = 0; i < updatedWords.length; i++) {
                index = splitWords.indexOf(updatedWords[i]);
                if (index === -1) {
                    diffWords.push(updatedWords[i]);
                }
            }
            if (updatedWords.length !== splitWords.length && diffWords.length !== 0) {
                if (updatedWords.length === diffWords.length)
                    diffWords = updatedWords;
            }
            return diffWords;
        };
        SpellCheck.prototype._elementTextProcess = function (proxy, element) {
            if (this.model.contextMenuSettings.enable && this.model.enableValidateOnType) {
                if (this._controlIds.length > 0) {
                    if (element[0].nodeType == 9 && element[0].nodeName == "#document") {
                        element = $(this._controlIds[0]);
                    }
                }
                else {
                    element = $(this.element[0]);
                }
            }
            var inputText = "";
            if (proxy._isIframe(element)) {
                inputText = $(element).contents().find("body").text();
            }
            else {
                inputText = ej.isNullOrUndefined($(element)[0].value)
                    ? ($(element)[0].innerText || $(element)[0].textContent).trim()
                    : $(element)[0].value.trim();
            }
            return inputText;
        };
        SpellCheck.prototype._splitWords = function (inputText, proxy) {
            var splitWords = inputText.split(/[^0-9a-zA-Z\'_]/);
            splitWords = splitWords.filter(function (str) { return /\S/.test(str); });
            proxy._words = splitWords;
        };
        SpellCheck.prototype._splitInputWords = function (inputText, proxy) {
            var splitWords = inputText.split(" ");
            proxy._inputWords = splitWords;
        };
        SpellCheck.prototype.spellCheck = function (targetSentence, misspelledWordCss) {
            var event = { targetSentence: targetSentence, misspelledWordCss: misspelledWordCss, requestType: "spellCheck", webMethod: false };
            if (this._trigger("actionBegin", event)) {
                return false;
            }
            this._misspelledWordCss = misspelledWordCss;
            this._ajaxRequest(this, targetSentence, "spellCheck", event);
        };
        SpellCheck.prototype.ignoreAll = function (word, targetContent) {
            if (!ej.isNullOrUndefined(word) && word !== "" && (!ej.isNullOrUndefined(targetContent) && targetContent !== "")) {
                var event = { ignoreWord: word, targetContent: targetContent, requestType: "ignoreAll" };
                if (this._trigger("validating", event)) {
                    return false;
                }
                this.model.ignoreWords.push(word);
                var ignoreResult = this._updateErrorContent(word, targetContent, null, "ignoreAll", null);
                return ignoreResult;
            }
            else {
                return false;
            }
        };
        SpellCheck.prototype.ignore = function (word, targetContent, index) {
            if (!ej.isNullOrUndefined(word) && word !== "" && (!ej.isNullOrUndefined(targetContent) && targetContent !== "")) {
                var event = { ignoreWord: word, targetContent: targetContent, requestType: "ignore" };
                if (this._trigger("validating", event)) {
                    return false;
                }
                var ignoreResult = this._updateErrorContent(word, targetContent, null, "ignore", index);
                return ignoreResult;
            }
            else {
                return false;
            }
        };
        SpellCheck.prototype.change = function (word, targetContent, changeWord, index) {
            if (!ej.isNullOrUndefined(word) && word !== "" && (!ej.isNullOrUndefined(targetContent) && targetContent !== "") && (!ej.isNullOrUndefined(changeWord) && changeWord !== "")) {
                var event = { changableWord: word, targetContent: targetContent, changeWord: changeWord, requestType: "changeWord" };
                if (this._trigger("validating", event)) {
                    return false;
                }
                var changeResult = this._updateErrorContent(word, targetContent, changeWord, "changeWord", index);
                return changeResult;
            }
            else {
                return false;
            }
        };
        SpellCheck.prototype.changeAll = function (word, targetContent, changeWord) {
            if (!ej.isNullOrUndefined(word) && word !== "" && (!ej.isNullOrUndefined(targetContent) && targetContent !== "") && (!ej.isNullOrUndefined(changeWord) && changeWord !== "")) {
                var event = { changableWord: word, targetContent: targetContent, changeWord: changeWord, requestType: "changeAll" };
                if (this._trigger("validating", event)) {
                    return false;
                }
                var obj = {};
                obj["ErrorWord"] = word;
                obj["ReplaceWord"] = changeWord;
                this._changeAllWords.push(obj);
                var changeResult = this._updateErrorContent(word, targetContent, changeWord, "changeAll", null);
                return changeResult;
            }
            else {
                return false;
            }
        };
        SpellCheck.prototype.addToDictionary = function (customWord) {
            if (!ej.isNullOrUndefined(customWord) && customWord !== "") {
                var event = { customWord: customWord, requestType: "addToDictionary", additionalParams: null };
                if (this._trigger("validating", event)) {
                    return false;
                }
                this._customWord = customWord;
                this._ajaxRequest(this, null, "addToDictionary", event);
            }
            else {
                return false;
            }
        };
        SpellCheck.prototype._updateErrorContent = function (word, targetContent, changeWord, requestType, index) {
            var updatedResult;
            if (targetContent.indexOf(word) !== -1) {
                var replaceString = "<span class=\"errorspan " + this.model.misspellWordCss + "\">" + word + "</span>";
                var replaceWord = requestType === "ignoreAll" || requestType === "addToDictionary" || requestType === "ignore" ? word : changeWord;
                if (requestType === "ignoreAll" || requestType === "addToDictionary" || requestType === "changeAll") {
                    targetContent = targetContent.replace(new RegExp(replaceString, "g"), replaceWord);
                }
                else if (requestType === "ignore" || requestType === "changeWord") {
                    if (ej.isNullOrUndefined(index)) {
                        targetContent = targetContent.replace(replaceString, replaceWord);
                    }
                    else {
                        var indexArray = new Array();
                        var startIndex = targetContent.indexOf(replaceString);
                        while (startIndex !== -1) {
                            indexArray.push(startIndex);
                            startIndex = targetContent.indexOf(replaceString, ++startIndex);
                        }
                        var replaceWordIndex = indexArray[index];
                        targetContent = targetContent.substr(0, replaceWordIndex) + replaceWord + targetContent.substr(replaceWordIndex + replaceString.length);
                    }
                }
                updatedResult = { resultHTML: targetContent };
            }
            else {
                updatedResult = false;
            }
            return updatedResult;
        };
        SpellCheck.prototype._renderDialogWindow = function () {
            this._dialogWindowRendering();
            this._showDialog();
        };
        SpellCheck.prototype._dialogWindowRendering = function () {
            var proxy = this;
            this._spellCheckWindow = ej.buildTag("div.e-spellcheckdialog#" + this._id + "ErrorCorrectionWindow");
            var _contentArea = ej.buildTag("div.e-dialogdiv");
            var _contentLabel = ej.buildTag("div.e-row e-labelrow")
                .append(ej.buildTag("div.e-labelcell")
                .append(ej.buildTag("label.e-dictionarylabel", this._localizedLabels.NotInDictionary)));
            var _misspelledContentAreaRow = ej.buildTag("div.e-row e-sentencerow");
            var _misspelledContentCell = ej.buildTag("div.e-cell e-sentencecell")
                .append(ej.buildTag("div.e-sentence", "", {}, {
                id: this._id + "_Sentences",
                name: "sentences",
                contenteditable: "false"
            }));
            _misspelledContentAreaRow.append(_misspelledContentCell);
            var _spellCheckButtons = ej.buildTag("div.e-buttoncell");
            var _ignoreOnceButton = ej.buildTag("button.e-btnignoreonce", this._localizedLabels.IgnoreOnceButtonText, {}, { id: this._id + "_IgnoreOnce" }).attr("type", "button");
            var _ignoreAllButton = ej.buildTag("button.e-btnignoreall", this._localizedLabels.IgnoreAllButtonText, {}, { id: this._id + "_IgnoreAll" }).attr("type", "button");
            var _addToDictionaryButton = ej.buildTag("button.e-btnaddtodictionary", this._localizedLabels.AddToDictionary, {}, { id: this._id + "_AddToDictionary" }).attr("type", "button");
            _misspelledContentAreaRow.append(_spellCheckButtons.append(_ignoreOnceButton).append(_ignoreAllButton).append(_addToDictionaryButton));
            var _suggestionsLabel = ej.buildTag("div.e-row e-labelrow").append(ej.buildTag("div.e-labelcell")
                .append(ej.buildTag("label.e-lablesuggestions", this._localizedLabels.SuggestionLabel)));
            var _suggestionsAreaRow = ej.buildTag("div.e-row e-suggestionsrow");
            var _suggestionContentCell = ej.buildTag("div.e-cell e-suggestioncell").append(ej.buildTag("ul.e-suggesteditems", "", {}, { id: this._id + "_Suggestions" }));
            _suggestionsAreaRow.append(_suggestionContentCell);
            var _spellCheckKeys = ej.buildTag("div.e-buttoncell");
            var _changeButton = ej.buildTag("button.e-btnchange", this._localizedLabels.ChangeButtonText, {}, { id: this._id + "_Change" }).attr("type", "button");
            var _changeAllButton = ej.buildTag("button.e-btnchangeall", this._localizedLabels.ChangeAllButtonText, {}, { id: this._id + "_ChangeAll" }).attr("type", "button");
            var _closeButton = ej.buildTag("button.e-btnclose", this._localizedLabels.CloseButtonText, {}, { id: this._id + "_Close" }).attr("type", "button");
            _suggestionsAreaRow.append(_spellCheckKeys.append(_changeButton).append(_changeAllButton).append(_closeButton));
            _contentArea.append(_contentLabel).append(_misspelledContentAreaRow).append(_suggestionsLabel).append(_suggestionsAreaRow);
            this._spellCheckWindow.append(_contentArea);
            this._spellCheckWindow.ejDialog({
                width: 462,
                minHeight: 305,
                enableModal: true,
                enableResize: false,
                showOnInit: false,
                allowKeyboardNavigation: false,
                target: $("body"),
                title: this._localizedLabels.SpellCheckButtonText,
                close: function () {
                    proxy._close();
                },
                cssClass: "e-spellcheck",
                isResponsive: this.model.isResponsive
            });
            var buttonClasses = [".e-btnignoreonce", ".e-btnignoreall", ".e-btnaddtodictionary", ".e-btnchange", ".e-btnchangeall", ".e-btnclose"];
            for (var i = 0; i < buttonClasses.length; i++) {
                this._spellCheckWindow.find(buttonClasses[i])
                    .ejButton({
                    width: this.model.isResponsive ? "100%" : 140,
                    click: function (e) {
                        e.model.text === proxy._localizedLabels.CloseButtonText ? proxy._close() : proxy._changeErrorWord(e);
                    },
                    cssClass: "e-spellbuttons"
                });
            }
            this._spellCheckWindow.find(".e-sentence").append(ej.buildTag("div.e-sentencescroller").append(ej.buildTag("div").append(ej.buildTag("div.e-sentencecontent", "", {}, { id: this._id + "_SentenceContent" }))));
            this._spellCheckWindow.find(".e-sentence .e-sentencescroller")
                .ejScroller({
                height: "100%",
                scrollerSize: 20
            });
            this._spellCheckWindow.find(".e-suggesteditems").ejListBox({
                width: "100%",
                height: "100%",
                dataSource: null,
                selectedIndex: 0,
                cssClass: "e-suggestionlist"
            });
        };
        SpellCheck.prototype._alertWindowRender = function (requestType) {
            this._renderAlertWindow(requestType);
            if (!this._elementStatus) {
                this._alertWindow.find(".e-alerttext").html(this._localizedLabels.NotValidElement);
            }
            var event = { spellCheckDialog: this._renderAlertWindow, requestType: "alertBeforeOpen" };
            if (this._trigger("dialogBeforeOpen", event)) {
                if (!ej.isNullOrUndefined(this._spellCheckWindow) && this._spellCheckWindow.parents().find(".e-spellcheck.e-dialog-wrap").length > 0)
                    this._close();
                return false;
            }
            else
                this._alertWindow.ejDialog("open");
        };
        SpellCheck.prototype._renderAlertWindow = function (requestType) {
            var proxy = this;
            this._alertWindow = ej.buildTag("div.e-alertdialog#" + this._id + "alertWindow");
            !this._elementStatus && this._alertWindow.addClass("e-missingalert");
            var _alertOkButton = ej.buildTag("div.e-alertbtn", "", { "text-align": "center" })
                .append(ej.buildTag("button.e-alertbutton e-alertspellok", this._localizedLabels.Ok, {}, { id: this._id + "alertok" }).attr("type", "button"));
            var _alertTextDiv = ej.buildTag("div.e-alerttextdiv");
            var _alertNotification = ej.buildTag("div.e-alertnotifydiv").append(ej.buildTag("div.e-alertnotification e-icon e-notification"));
            var _alertText = ej.buildTag("div.e-alerttext", this._localizedLabels.CompletionPopupMessage, { "text-align": "left", "padding": "5px" });
            _alertTextDiv.append(_alertNotification).append(_alertText);
            this._alertWindow.append(_alertTextDiv).append(_alertOkButton);
            this.element.append(this._alertWindow);
            this._alertWindow.find(".e-alertbutton")
                .ejButton({
                showRoundedCorner: true,
                width: this._elementStatus ? "70px" : "100px",
                click: function () {
                    proxy._alertClose();
                },
                cssClass: "e-flat"
            });
            this._alertWindow.ejDialog({
                width: this._elementStatus ? 240 : 420,
                minHeight: 140,
                showOnInit: false,
                enableModal: true,
                title: this._localizedLabels.CompletionPopupTitle,
                enableResize: false,
                allowKeyboardNavigation: false,
                target: requestType === "validating" ? ".e-spellcheckdialog" : $("body"),
                cssClass: !this._elementStatus ? "e-spellalert e-elementmissing" : "e-spellalert",
                close: function () {
                    proxy._alertClose();
                },
                isResponsive: this.model.isResponsive
            });
        };
        SpellCheck.prototype._renderContextMenu = function () {
            var proxy = this;
            var _menuTarget;
            this._contextMenu = ej.buildTag("ul#" + proxy._id + "contextMenu");
            if (!ej.isNullOrUndefined(proxy.model.controlsToValidate)) {
                var isIframe = false;
                for (var i = 0; i < proxy._controlIds.length; i++) {
                    var flag = proxy._isIframe($(proxy._controlIds[i]));
                    flag && (isIframe = true);
                }
                _menuTarget = isIframe ? $(proxy._controlIds[0]).contents()[0] : "." + proxy.model.misspellWordCss;
            }
            else {
                _menuTarget = proxy._isIframe(this.element)
                    ? proxy.element.contents()[0]
                    : "." + proxy.model.misspellWordCss;
            }
            this._contextMenu.ejMenu({
                fields: { id: "id", text: "text", parentId: "parentId" },
                menuType: ej.MenuType.ContextMenu,
                openOnClick: false,
                width: "auto",
                cssClass: "e-spellmenu",
                click: function (e) {
                    proxy._onMenuSelect(e);
                }
            });
        };
        SpellCheck.prototype._contextMenuPosition = function (e, proxy) {
            var posX, posY;
            if (!ej.isNullOrUndefined(proxy._activeElement) && proxy._isIframe($(proxy.element))) {
                var targetElement = !ej.isNullOrUndefined(proxy.model.controlsToValidate)
                    ? $(proxy._control[0]["controlId"])
                    : $(proxy.element);
                posX = ((e.clientX == undefined) ? 0 : e.clientX) + (targetElement).offset().left,
                    posY = ((e.clientY == undefined) ? 0 : e.clientY) + (targetElement).offset().top;
                var menuHeight = $(proxy._contextMenu).attr("style", "visibility: visible;display:block;").height(), menuWidth = $(proxy._contextMenu).width();
                posY = ((posY + menuHeight) < ($(document).scrollTop() + $(window).height()))
                    ? posY
                    : ((posY - menuHeight) < 0 ? posY : (posY - menuHeight));
                posX = ((posX + menuWidth) < ($(document).scrollLeft() + $(window).width())) ? posX : (posX - menuWidth);
            }
            else {
                posX = (e.clientX + proxy._contextMenu.width() < $(window).width()) ? e.pageX : e.pageX - proxy._contextMenu.width();
                posY = (e.clientY + proxy._contextMenu.height() < $(window).height()) ? e.pageY : (e.clientY > proxy._contextMenu.height()) ? e.pageY - proxy._contextMenu.height() : $(window).height() - proxy._contextMenu.outerHeight();
                var bodyPos = $("body").css("position") !== "static" ? $("body").offset() : { left: 0, top: 0 };
                posX -= bodyPos.left, posY -= bodyPos.top;
            }
            return {
                X: posX,
                Y: posY
            };
        };
        SpellCheck.prototype._showDialog = function () {
            var event = { spellCheckDialog: this._spellCheckWindow, requestType: "dialogBeforeOpen" };
            if (this._trigger("dialogBeforeOpen", event)) {
                return false;
            }
            this._spellCheckWindow.ejDialog("open");
            var inputText = "";
            this._subElements = [];
            var element;
            if (this._controlIds.length > 0) {
                for (var i = 0; i < this._controlIds.length; i++) {
                    var element_1 = $(this._controlIds[i]);
                    if (element_1.length > 0) {
                        for (var j = 0; j < element_1.length; j++) {
                            var subElement = $(element_1[j]);
                            this._activeElement = this._isIframe(subElement) ? $(subElement).contents().find("body")[0] : $(subElement)[0];
                            this._removeSpan(this);
                            this._subElements.push(subElement[0]);
                        }
                    }
                }
                inputText = this._inputTextProcess(this, $(this._subElements[0]), inputText);
                this._proElements = this._subElements.length > 0 && $(this._subElements[0]);
                this._currentTargetElement = element = $(this._subElements[0]);
                this._subElements = this._subElements.slice(1);
            }
            else {
                element = this.element;
                this._activeElement = this._isIframe(element) ? this._getIframeElement(element) : $(element)[0];
                this._removeSpan(this);
                inputText = this._inputTextProcess(this, element, inputText);
            }
            var targetHtml = "";
            !ej.isNullOrUndefined(this.model.controlsToValidate) ? this.element = element : this.element = this.element;
            if (this.element.length > 0) {
                if (this._isIframe(this.element)) {
                    targetHtml = $(this.element).contents().find("body").html();
                }
                else {
                    targetHtml = $(element)[0].tagName === "TEXTAREA" ||
                        $(element)[0].tagName === "INPUT"
                        ? $(element)[0].value
                        : $(element)[0].innerHTML;
                }
            }
            var diffWords = this._filteringDiffWords(this, inputText);
            this._splitWords(inputText, this);
            if (!ej.isNullOrUndefined(this.model.controlsToValidate)) {
                var updateTargetEvent = { previousElement: null, currentElement: element, targetHtml: targetHtml };
                if (this._trigger("targetUpdating", updateTargetEvent)) {
                    this._close();
                    return false;
                }
            }
            this._spellCheckWindow.find(".e-sentence .e-sentencecontent")[0].innerHTML = targetHtml;
            var dialogEvent = { targetText: inputText, requestType: "dialogOpen" };
            if (this._trigger("dialogOpen", dialogEvent)) {
                return false;
            }
            var beginEvent = { targetSentence: inputText, requestType: "spellCheck", additionalParams: null, webMethod: false };
            if (this._trigger("actionBegin", beginEvent)) {
                return false;
            }
            if (diffWords.length > 0) {
                this._ajaxRequest(this, diffWords.join(" "), "spellCheckDialog", beginEvent);
            }
            else if (diffWords.length === 0 && !this._ignoreStatus) {
                this._splitInputWords(inputText, this);
                diffWords = ej.dataUtil.distinct(this._inputWords);
                this._ajaxRequest(this, diffWords.join(" "), "spellCheckDialog", beginEvent);
            }
            else {
                if (!ej.isNullOrUndefined(this._errorWordDetails)) {
                    var errorWordData = this._filterErrorData(this, this._errorWordDetails);
                    this._dialogModeOperations(this, errorWordData, inputText, "spellCheckDialog");
                }
                else {
                    this._alertWindowRender("show");
                }
            }
        };
        SpellCheck.prototype._getIframeElement = function (element) {
            return $(element).contents().find("body")[0];
        };
        SpellCheck.prototype._inputTextProcess = function (proxy, element, inputText) {
            if (proxy._isIframe(element)) {
                var iframeText = $(element).contents().find("body").text();
                inputText = inputText === "" ? iframeText : (inputText + iframeText);
            }
            else {
                var elementText = ej.isNullOrUndefined($(element)[0].value)
                    ? ($(element)[0].innerText || $(element)[0].textContent).trim()
                    : $(element)[0].value.trim();
                inputText = inputText === "" ? elementText : (inputText + " " + elementText);
            }
            return inputText;
        };
        SpellCheck.prototype._ajaxRequest = function (proxy, text, requestType, events) {
            var value = requestType === "addToDictionary" ? JSON.stringify({ customWord: proxy._customWord, additionalParams: events.additionalParams }) : this._getModelValues(this, text, events);
            this.webMethod = this.webMethod ? this.webMethod : events.webMethod;
            $.ajax({
                type: this.model.ajaxRequestType,
                async: this.model.enableAsync,
                url: requestType === "addToDictionary" ? this.model.dictionarySettings.customDictionaryUrl : this.model.dictionarySettings.dictionaryUrl,
                data: (this.model.ajaxDataType === 'json' && this.model.ajaxRequestType === 'POST') ? this.webMethod ? JSON.stringify({ data: value }) : JSON.stringify(value) : { data: value },
                contentType: "application/json; charset=utf-8",
                dataType: this.model.ajaxDataType,
                crossDomain: true,
                success: function (args) {
                    var data, result;
                    args = (args && args.d && typeof args.d == "object") ? args.d : args;
                    result = (typeof args == "string") && (requestType !== "addToDictionary") ? JSON.parse(args) : args;
                    if (requestType === "addToDictionary") {
                        if (!ej.isNullOrUndefined(proxy._errorWordDetails) && !ej.isNullOrUndefined(proxy._currentElement)) {
                            data = proxy._errorWordDetails;
                            if (!ej.isNullOrUndefined(result)) {
                                proxy._filterData(result.toString(), proxy);
                                proxy._errorWordDetails = proxy._errorWordsData;
                            }
                        }
                        else
                            data = [];
                    }
                    else {
                        data = proxy._updateErrorDetails(proxy, result);
                    }
                    var word, elementText = text, event;
                    if (data.length > 0) {
                        var errorWordData;
                        if (requestType === "spellCheckDialog" ||
                            requestType === "validateOnType" ||
                            requestType === "validateOnRender") {
                            errorWordData = proxy._filterErrorData(proxy, data);
                            if (errorWordData.length > 0) {
                                if (requestType === "spellCheckDialog") {
                                    proxy._dialogModeOperations(proxy, errorWordData, elementText, requestType);
                                }
                                else if (requestType === "validateOnType" || requestType === "validateOnRender") {
                                    proxy._validateOnTypeOperations(proxy, errorWordData, elementText, requestType);
                                }
                            }
                            else {
                                if (requestType === "spellCheckDialog") {
                                    proxy._spellCheckWindow.ejDialog("isOpen") && proxy._spellCheckWindow.ejDialog("close");
                                }
                                proxy._alertWindowRender("validating");
                            }
                        }
                        else if (requestType === "spellCheck") {
                            if (data.length > 0) {
                                var filterData = proxy._getFilterData(data, proxy);
                                errorWordData = ej.dataUtil.distinct(filterData);
                                for (var i = 0; i < errorWordData.length; i++) {
                                    var query = new ej.Query()
                                        .where("ErrorWord", ej.FilterOperators.equal, errorWordData[i]);
                                    var filterValue = new ej.DataManager(data).executeLocal(query);
                                    if (errorWordData.length > 0) {
                                        word = "<span class=\"errorspan " +
                                            ((!ej.isNullOrUndefined(proxy._misspelledWordCss) &&
                                                proxy._misspelledWordCss !== "")
                                                ? proxy._misspelledWordCss
                                                : proxy.model.misspellWordCss) +
                                            "\">" +
                                            errorWordData[i] +
                                            "</span>";
                                        var replaceExpression = new RegExp(errorWordData[i], "gi");
                                        elementText = elementText.replace(replaceExpression, word);
                                    }
                                }
                                event = { resultHTML: elementText, errorWordDetails: data, requestType: "spellCheck" };
                                proxy._misspelledWordCss = null;
                            }
                            else {
                                event = { resultHTML: elementText, errorWordDetails: data, requestType: "spellCheck" };
                            }
                            proxy._trigger("actionSuccess", event);
                        }
                        else if (requestType === "addToDictionary") {
                            var errorHtml;
                            if (!ej.isNullOrUndefined(proxy._currentElement)) {
                                if ($(proxy._currentElement)[0].tagName === "IFRAME") {
                                    errorHtml = $(proxy._currentElement).contents().find("body").html();
                                }
                                else {
                                    errorHtml = $(proxy._currentElement).html().trim();
                                }
                            }
                            var updatedResult = proxy
                                ._updateErrorContent(proxy._customWord, errorHtml, null, "addToDictionary", null);
                            if (!ej.isNullOrUndefined(errorHtml)) {
                                if (!ej.isNullOrUndefined(proxy._spellCheckWindow) &&
                                    proxy._spellCheckWindow.find(".e-btnaddtodictionary").hasClass("e-select")) {
                                    var listBoxElement = proxy._spellCheckWindow.find(".e-suggesteditems");
                                    var contentElement = proxy._spellCheckWindow.find(".e-sentence .e-sentencecontent");
                                    if (proxy._errorWordsData.length > 0) {
                                        contentElement[0].innerHTML = updatedResult["resultHTML"];
                                        proxy._replaceErrorText(contentElement, proxy._customWord.toString());
                                        proxy._listBoxDataUpdate(proxy);
                                    }
                                    else {
                                        listBoxElement.ejListBox({ dataSource: null });
                                        proxy._statusFlag = false;
                                        proxy._alertWindowRender("validating");
                                    }
                                }
                                else if (!ej.isNullOrUndefined(proxy._contextMenu)) {
                                    proxy._isIframe(proxy.element) ? $(proxy.element).contents().find("body").html(updatedResult["resultHTML"]) : $(proxy._currentElement)[0].innerHTML = updatedResult["resultHTML"];
                                    if (proxy._controlIds.length > 0) {
                                        for (var i_1 = 0; i_1 < proxy._controlIds.length; i_1++) {
                                            var element = $(proxy._controlIds[i_1]);
                                            for (var j = 0; j < element.length; j++) {
                                                if ($(proxy._currentElement)[0] !== $(element[j])[0]) {
                                                    var activeElement = $(element[j]);
                                                    proxy._replaceErrorText(activeElement, proxy._customWord.toString());
                                                }
                                            }
                                        }
                                    }
                                    proxy._renderMenu(proxy);
                                }
                                event = {
                                    resultHTML: updatedResult["resultHTML"],
                                    errorWordDetails: result,
                                    requestType: "addToDictionary"
                                };
                                proxy._trigger("actionSuccess", event);
                            }
                        }
                    }
                    else {
                        if (proxy._subElements.length > 0) {
                            proxy._updateTargetText(proxy);
                        }
                        else {
                            if (requestType === "spellCheckDialog") {
                                proxy._spellCheckWindow.ejDialog("isOpen") && proxy._spellCheckWindow.ejDialog("close");
                            }
                            if (requestType === "spellCheck") {
                                event = { resultHTML: text, errorWordDetails: data, requestType: "spellCheck" };
                                proxy._trigger("actionSuccess", event);
                            }
                            if (requestType === "validateOnType") {
                                proxy._removeSpan(proxy);
                            }
                            if (requestType !== "spellCheck" && requestType !== "addToDictionary")
                                proxy._alertWindowRender("load");
                        }
                    }
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    var errorEvent = { errorMessage: errorThrown, requestType: requestType };
                    proxy._trigger("actionFailure", errorEvent);
                }
            });
        };
        SpellCheck.prototype.getSuggestionWords = function (errorWord) {
            this._selectedValue = errorWord;
            this._suggestionsRequest(this, null, errorWord, "getSuggestions");
        };
        SpellCheck.prototype._suggestionsRequest = function (proxy, element, errorWord, requestType) {
            var value;
            if (requestType === "validateByMenu" || requestType === "suggestionsUpdate" || requestType === "getSuggestions")
                value = JSON.stringify({ requestType: "getSuggestions", errorWord: errorWord });
            else
                value = proxy._getModelValues(proxy, errorWord, null);
            $.ajax({
                type: this.model.ajaxRequestType,
                async: proxy.model.enableAsync,
                url: proxy.model.dictionarySettings.dictionaryUrl,
                data: (this.model.ajaxDataType === 'json' && this.model.ajaxRequestType === 'POST') ? this.webMethod ? JSON.stringify({ data: value }) : JSON.stringify(value) : { data: value },
                contentType: "application/json; charset=utf-8",
                dataType: proxy.model.ajaxDataType,
                crossDomain: true,
                success: function (args) {
                    var obj = {}, result;
                    args = (args && args.d && typeof args.d == "object") ? args.d : args;
                    result = (typeof args == "string") ? JSON.parse(args) : args;
                    obj["ErrorWord"] = errorWord;
                    obj["SuggestedWords"] = result[errorWord];
                    proxy._suggestedWordCollection.push(obj);
                    if (requestType === "getSuggestions") {
                        proxy._suggestedWords = result[proxy._selectedValue];
                    }
                    else {
                        if (requestType === "validateByMenu") {
                            var errorWordsData = result[errorWord];
                            proxy._contextMenuDisplay(proxy, errorWordsData);
                        }
                        else if (requestType === "validateByDialog") {
                            var data = proxy._updateErrorDetails(proxy, result);
                            if (data.length > 0) {
                                var errorWordData = proxy._filterErrorData(proxy, data);
                                proxy._splitWords(element[0].innerText, proxy);
                                proxy._processNode(proxy, element[0], errorWordData, "spellCheckDialog");
                                proxy._activeElement = element[0];
                                proxy._changeAllErrors(proxy);
                                proxy._listBoxDataUpdate(proxy);
                            }
                            else {
                                if (proxy._subElements.length > 0) {
                                    proxy._updateTargetText(proxy);
                                }
                                else {
                                    proxy._completionCheck(proxy);
                                }
                            }
                        }
                        else if (requestType === "suggestionsUpdate") {
                            var filterData = result[element[0].innerText];
                            proxy._dialogSuggestionsUpdate(proxy, filterData);
                        }
                    }
                }
            });
        };
        SpellCheck.prototype._filterErrorData = function (proxy, data) {
            var filteredData = proxy._getFilterData(data, proxy);
            return ej.dataUtil.distinct(filteredData);
        };
        SpellCheck.prototype._updateErrorDetails = function (proxy, result) {
            var data = [];
            if (ej.isNullOrUndefined(proxy._errorWordDetails)) {
                data = proxy._errorWordDetails = result;
            }
            else {
                if (result.length > 0) {
                    if (proxy._ignoreStatus) {
                        for (var k = 0; k < result.length; k++) {
                            proxy._errorWordDetails.push(result[k]);
                            data = proxy._errorWordDetails;
                        }
                    }
                    else {
                        data = proxy._errorWordDetails = result;
                        proxy._ignoreStatus = true;
                    }
                }
                else {
                    data = proxy._errorWordDetails;
                }
            }
            return data;
        };
        SpellCheck.prototype._contextMenuDisplay = function (proxy, errorWordsData) {
            ej.isNullOrUndefined(proxy._contextMenu) && proxy._renderContextMenu();
            var menuObj = proxy._contextMenu.data("ejMenu");
            var options = proxy.model.contextMenuSettings.menuItems;
            if (errorWordsData.length > 0 && this.model.maxSuggestionCount > 0) {
                var suggestedWords = [];
                var count = proxy.model.maxSuggestionCount < errorWordsData.length
                    ? proxy.model.maxSuggestionCount
                    : errorWordsData.length;
                suggestedWords = proxy._convertData(errorWordsData.slice(0, count), "menuData");
                var sugCount = suggestedWords.length;
                var separatorElement = suggestedWords[count - 1]["id"];
                for (var i = 0; i < options.length; i++) {
                    suggestedWords.push(options[i]);
                }
                menuObj.option("fields.dataSource", suggestedWords);
                var menuItems = menuObj.element.find(".e-list");
                for (var j = 0; j < sugCount; j++) {
                    $(menuItems[j]).addClass("e-errorsuggestions");
                }
                for (var k = 0; k < menuItems.length; k++) {
                    if (menuItems[k].attributes["id"].value === separatorElement) {
                        $(menuItems[k]).addClass("e-separator");
                    }
                }
            }
            else {
                menuObj.option("fields.dataSource", options);
            }
            var position = proxy._contextMenuPosition(proxy._menuEvents, proxy);
            $(menuObj.element).css({ "left": position.X, "top": position.Y });
            $(menuObj.element).css("display", "block");
        };
        SpellCheck.prototype._dialogSuggestionsUpdate = function (proxy, filterData) {
            var listBoxElement = proxy._spellCheckWindow.find(".e-suggesteditems");
            var listObj = $("#" + proxy._id + "_Suggestions").data("ejListBox");
            var suggestions;
            if (filterData.length > 0) {
                if (proxy._spellCheckWindow.find(".e-btnchange").hasClass("e-disable") &&
                    proxy._spellCheckWindow.find(".e-btnchangeall").hasClass("e-disable")) {
                    proxy._spellCheckWindow.find(".e-btnchange").removeClass("e-disable");
                    proxy._spellCheckWindow.find(".e-btnchangeall").removeClass("e-disable");
                }
                var count = proxy.model.maxSuggestionCount < filterData.length
                    ? proxy.model.maxSuggestionCount
                    : filterData.length;
                suggestions = filterData.slice(0, count);
            }
            else {
                proxy._spellCheckWindow.find(".e-btnchange").addClass("e-disable");
                proxy._spellCheckWindow.find(".e-btnchangeall").addClass("e-disable");
                suggestions = [proxy._localizedLabels.NoSuggestionMessage];
            }
            listBoxElement.ejListBox({ selectedIndex: null });
            listBoxElement.ejListBox({
                dataSource: proxy._convertData(suggestions, "dictionaryData"),
                selectedIndex: 0
            });
            if (!ej.isNullOrUndefined(listObj))
                listObj.refresh();
            var scrollObj = proxy._spellCheckWindow.find(".e-sentence .e-sentencescroller").data("ejScroller");
            if (!ej.isNullOrUndefined(scrollObj) && scrollObj.isVScroll())
                $(proxy._spellCheckWindow.find("." + proxy.model.misspellWordCss)).get(0).scrollIntoView(false);
        };
        SpellCheck.prototype._replaceErrorText = function (currentElement, result) {
            var spanElement = $(currentElement).find(".errorspan");
            for (var i = 0; i < spanElement.length; i++) {
                var spanText = spanElement[i].innerText || spanElement[i].textContent;
                if (spanText === result) {
                    $(spanElement[i]).replaceWith(spanText);
                }
            }
        };
        SpellCheck.prototype._dialogModeOperations = function (proxy, errorWordData, elementText, requestType) {
            var event = { errorWords: proxy._errorWordDetails, targetText: elementText, requestType: requestType };
            var contentElement = proxy._spellCheckWindow.find(".e-sentence .e-sentencecontent");
            if (errorWordData.length > 0) {
                proxy._removeSpan(proxy);
                proxy._processNode(proxy, contentElement[0], errorWordData, requestType);
                if (this._trigger("start", event)) {
                    return false;
                }
                var scrollObj = proxy._spellCheckWindow.find(".e-sentence .e-sentencescroller").data("ejScroller");
                scrollObj.refresh();
                proxy._listBoxDataUpdate(proxy);
            }
            else {
                var listBoxElement = proxy._spellCheckWindow.find(".e-suggesteditems");
                requestType === "spellCheckDialog" && (contentElement[0].innerHTML = elementText);
                listBoxElement.ejListBox({ dataSource: null });
                proxy._statusFlag = false;
                this._alertWindowRender("load");
            }
        };
        SpellCheck.prototype._validateOnTypeOperations = function (proxy, errorWordData, elementText, requestType) {
            if (errorWordData.length > 0) {
                if ((this._controlIds.length > 0 && !this._currentActiveElement && this.model.enableValidateOnType) ||
                    (this._controlIds.length > 0 && (!this.model.enableValidateOnType || !this._statusMultiTarget))) {
                    for (var i = 0; i < proxy._controlIds.length; i++) {
                        var element = $(this._controlIds[i]);
                        for (var j = 0; j < element.length; j++) {
                            var subElement = (proxy._isIframe($(element[j]))
                                ? proxy._getIframeElement($(element[j]))
                                : $(element[j])[0]);
                            proxy._activeElement = subElement;
                            proxy._removeSpan(proxy);
                            proxy._processNode(proxy, subElement, errorWordData, requestType);
                            var obj = {};
                            obj["controlId"] = proxy._controlIds[i];
                            obj["errorHtml"] = subElement.innerHTML;
                            proxy._control.push(obj);
                        }
                    }
                }
                else if (this.model.enableValidateOnType && this._currentActiveElement) {
                    proxy._removeSpan(proxy);
                    proxy._processNode(proxy, this._currentActiveElement, errorWordData, requestType);
                    this._statusMultiTarget = false;
                    if (proxy._isIframe(proxy.element)) {
                        var elem = proxy._getIframeElement(proxy.element);
                        proxy._activeElement = elem;
                    }
                }
                else {
                    if (proxy._isIframe(proxy.element)) {
                        var elem = proxy._getIframeElement(proxy.element);
                        proxy._activeElement = elem;
                        proxy._removeSpan(proxy);
                        proxy._processNode(proxy, elem, errorWordData, requestType);
                    }
                    else {
                        proxy._removeSpan(proxy);
                        proxy._processNode(proxy, $(proxy.element)[0], errorWordData, requestType);
                    }
                }
                proxy._statusFlag = true;
                var event_1;
                if (this._controlIds.length > 0)
                    event_1 = { errorWords: proxy._errorWordDetails, targetControls: this._control, requestType: requestType };
                else
                    event_1 = { errorWords: proxy._errorWordDetails, targetText: $(proxy.element)[0].innerText, requestType: requestType };
                if (this._trigger("start", event_1)) {
                    return false;
                }
                if (proxy._isIframe(this.element)) {
                    proxy._bindBeforeOpen(proxy, $(this.element).contents().find("body"));
                }
                else {
                    if (proxy._controlIds.length > 0) {
                        for (var i = 0; i < proxy._controlIds.length; i++) {
                            proxy._bindBeforeOpen(proxy, $(proxy._controlIds[i]));
                        }
                    }
                    else
                        proxy._bindBeforeOpen(proxy, $(this.element));
                }
            }
            else {
                proxy._removeSpan(proxy);
                proxy._statusFlag = false;
                proxy._alertWindowRender("show");
            }
            if (this.model.enableValidateOnType) {
                proxy.setCursorPosition(proxy._currentCursorTarget);
            }
        };
        SpellCheck.prototype._bindBeforeOpen = function (proxy, element) {
            proxy._on($(element).find("." + this.model.misspellWordCss), "contextmenu", $.proxy(proxy._contextOpen, proxy));
        };
        SpellCheck.prototype._contextOpen = function (e) {
            var _targ = $(e.target);
            if (_targ.hasClass("errorspan")) {
                e.preventDefault();
                var proxy = this;
                var selectedWord = proxy._selectedValue = _targ[0].innerText;
                proxy._selectedTarget = _targ[0];
                proxy._menuEvents = e;
                var event = { selectedErrorWord: selectedWord, requestType: "contextOpen" };
                if (proxy._trigger("contextOpen", event)) {
                    return false;
                }
                var filterValue = proxy._filterSuggestions(proxy, selectedWord);
                if (filterValue.length > 0) {
                    proxy._contextMenuDisplay(proxy, filterValue[0]["SuggestedWords"]);
                }
                else {
                    proxy._suggestionsRequest(proxy, null, selectedWord, "validateByMenu");
                }
            }
            else {
                this._elementRightClick(e);
            }
        };
        SpellCheck.prototype._processNode = function (proxy, element, errorWordData, requestType) {
            var elementTextNodes = proxy._filterTextNodes(proxy, element);
            for (var i = 0; i < elementTextNodes.length; i++) {
                var presentNode = elementTextNodes[i];
                var elementNodes = [elementTextNodes[i]];
                var nodeData = elementTextNodes[i].data;
                var isUrl = false, isEmail = false, flag = false;
                if (proxy.model.ignoreSettings.ignoreUrl) {
                    var urlRegEx = /^((http|ftp|https)?:\/\/)?(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
                    isUrl = urlRegEx.test(presentNode.wholeText);
                    isUrl && (flag = isUrl);
                }
                if (proxy.model.ignoreSettings.ignoreEmailAddress) {
                    var mailAddressValidation = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
                    isEmail = mailAddressValidation.test(presentNode.wholeText);
                    isEmail && (flag = isEmail);
                }
                if (!flag) {
                    for (var j = 0; j < proxy._words.length; j++) {
                        for (var k = 0; k < errorWordData.length; k++) {
                            if (proxy._words[j] === errorWordData[k] &&
                                !ej.isNullOrUndefined(nodeData.match(new RegExp("\\b" + errorWordData[k] + "\\b", "gi"))) &&
                                nodeData.indexOf(errorWordData[k]) !== -1) {
                                var wordIndex = nodeData.indexOf(errorWordData[k]);
                                var wordLength = errorWordData[k].length;
                                var newNode = presentNode.splitText(wordIndex);
                                var span = document.createElement("span");
                                if (requestType === "validateOnType")
                                    span.className = "errorspan " + this.model.misspellWordCss;
                                else
                                    span.className = "errorspan";
                                var errorTextNode = document.createTextNode(errorWordData[k]);
                                span.appendChild(errorTextNode);
                                presentNode.parentNode.insertBefore(span, newNode);
                                newNode.data = newNode.data.substr(wordLength);
                                presentNode = newNode;
                                elementNodes.push(errorTextNode);
                                elementNodes.push(newNode);
                                nodeData = newNode.data;
                            }
                        }
                    }
                }
            }
        };
        SpellCheck.prototype._findRepeatWords = function (wordIndex, nodeData, errorWordData, k) {
            var matchedErrorWord, countWordIndex, countCharactor, countCharCode, isregExp;
            var charRegEx = /([{^}:[\\.,;><?|@!~`#$%&*()_=+'"])/g;
            for (countWordIndex = wordIndex; countWordIndex <= nodeData.length; countWordIndex++) {
                isregExp = false;
                countCharactor = nodeData.charAt(countWordIndex);
                countCharCode = countCharactor.charCodeAt(countCharactor);
                isregExp = charRegEx.test(countCharactor);
                if (countCharactor == ' ' || countCharCode == 160 || countCharactor == "" || isregExp) {
                    matchedErrorWord = nodeData.slice(wordIndex, countWordIndex);
                    if (matchedErrorWord === errorWordData[k]) {
                        break;
                    }
                    else {
                        wordIndex = countWordIndex + 1;
                    }
                }
            }
            return wordIndex;
        };
        SpellCheck.prototype._spellValidateOnType = function (e) {
            if (this.model.enableValidateOnType && this.model.contextMenuSettings.enable) {
                var event_2 = { events: e, requestType: "validate" };
                this._trigger("validating", event_2);
                this._statusMultiTarget = false;
                this._currentActiveElement = event_2.events.currentTarget;
                if (event_2.events.cancelable === true) {
                    var keyCode = e.keyCode;
                    if (keyCode >= 16 && keyCode <= 31) {
                        return;
                    }
                    if (keyCode >= 37 && keyCode <= 40) {
                        return;
                    }
                    if (keyCode === 32 || keyCode === 13) {
                        this._statusMultiTarget = true;
                        this._triggerSpelling();
                    }
                }
            }
        };
        SpellCheck.prototype._triggerSpelling = function () {
            var proxy = this;
            setTimeout(function () {
                proxy.getCursorPosition();
                proxy.validate();
            }, 2);
        };
        SpellCheck.prototype.getCursorPosition = function () {
            if (this.model.enableValidateOnType && this.model.contextMenuSettings.enable) {
                var proxy = this;
                var temp_node = String.fromCharCode(7);
                var getSelection;
                var range;
                if (this._controlIds.length > 0) {
                    for (var i = 0; i < this._controlIds.length; i++) {
                        var element = $(this._controlIds[i]);
                        if (this._isIframe(element)) {
                            getSelection = element[0].contentWindow.getSelection();
                            range = element[0].contentDocument.createRange();
                        }
                        else {
                            getSelection = document.getSelection();
                            range = document.createRange();
                        }
                    }
                }
                else {
                    if (this._isIframe(this.element)) {
                        getSelection = this.element[0].contentWindow.getSelection();
                        range = this.element[0].contentDocument.createRange();
                    }
                    else {
                        getSelection = document.getSelection();
                        range = document.createRange();
                    }
                }
                var getRange = getSelection.getRangeAt(0);
                getRange.deleteContents();
                if (this._isIframe(this.element) && ej.browserInfo().name === "msie") {
                    var el = this.element[0].contentDocument.createElement("div");
                    el.innerHTML = temp_node;
                    var frag = $(this.element[0]).contents()[0].createDocumentFragment(), node, lastNode;
                    while (node = el.firstChild) {
                        lastNode = frag.appendChild(node);
                    }
                    getRange.insertNode(frag);
                }
                else {
                    getRange.insertNode(document.createTextNode(temp_node));
                }
                if ($(getRange.startContainer.parentElement).hasClass("errorspan")) {
                    if (this.model.controlsToValidate) {
                        proxy._normalizeTextNodes(this._currentActiveElement);
                    }
                    else {
                        proxy._normalizeTextNodes($(proxy.element)[0]);
                    }
                }
                proxy._currentCursorTarget = proxy._getActiveTarget(proxy, temp_node);
                range.collapse(true);
                range.setStart(proxy._currentCursorTarget.node, proxy._currentCursorTarget.offset);
                range.setEnd(proxy._currentCursorTarget.node, proxy._currentCursorTarget.offset);
                getSelection.removeAllRanges();
                getSelection.addRange(range);
                return proxy._currentCursorTarget;
            }
        };
        SpellCheck.prototype._getActiveTarget = function (proxy, temp_node) {
            var elementTextNodes;
            if (this.model.enableValidateOnType) {
                elementTextNodes = proxy._filterTextNodes(proxy, this._currentActiveElement);
            }
            else {
                elementTextNodes = proxy._filterTextNodes(proxy, $(proxy.element)[0]);
            }
            var currentCursorPosition = null;
            var currentCursorNode = null;
            for (var i = 0; i < elementTextNodes.length; i++) {
                if (elementTextNodes[i].data.indexOf(temp_node) > -1) {
                    currentCursorNode = elementTextNodes[i];
                    currentCursorPosition = elementTextNodes[i].data.indexOf(temp_node);
                    elementTextNodes[i].data = elementTextNodes[i].data.replace(temp_node, "");
                    return {
                        node: currentCursorNode,
                        offset: currentCursorPosition
                    };
                }
            }
        };
        SpellCheck.prototype.setCursorPosition = function (cursorTarget) {
            var selection;
            var range;
            if (this._controlIds.length > 0) {
                for (var i = 0; i < this._controlIds.length; i++) {
                    var element = $(this._controlIds[i]);
                    if (this._isIframe(element)) {
                        selection = element[0].contentDocument.getSelection();
                        range = element[0].contentDocument.createRange();
                    }
                    else {
                        selection = document.getSelection();
                        range = document.createRange();
                    }
                }
            }
            else {
                if (this._isIframe(this.element)) {
                    selection = this.element[0].contentDocument.getSelection();
                    range = this.element[0].contentDocument.createRange();
                }
                else {
                    selection = document.getSelection();
                    range = document.createRange();
                }
            }
            var elementTextNodes;
            if (selection.getRangeAt && selection.rangeCount) {
                var temp_node = String.fromCharCode(7);
                if (cursorTarget) {
                    if (this.model.controlsToValidate) {
                        elementTextNodes = this._filterTextNodes(this, this._currentActiveElement);
                    }
                    else {
                        elementTextNodes = this._filterTextNodes(this, $(this.element)[0]);
                    }
                    var currentCursorNode = cursorTarget.node;
                    var currentCursorPosition = cursorTarget.offset;
                    for (var i = 0; i < elementTextNodes.length; i++) {
                        if (elementTextNodes[i] === currentCursorNode) {
                            var nodeIndex = i;
                        }
                    }
                    var currentWord = '';
                    if (nodeIndex === undefined) {
                        var wordEmptySpace = '';
                        var wordRightSpace = '';
                        var charCodeEmptySpace = '';
                        var currentWord = '';
                        var wordWithoutSpace = '';
                        var isWordRightSpace = false;
                        var isWord = false;
                        for (var cx = 0; cx < currentCursorNode.length; cx++) {
                            var cc = currentCursorNode.data.charAt(cx);
                            if (cc.charCodeAt(0) != 160) {
                                if (cc.charCodeAt(0) != 32) {
                                    if (wordEmptySpace === '') {
                                        currentWord = currentWord + cc;
                                    }
                                    else {
                                        if (cc != temp_node) {
                                            wordRightSpace = wordRightSpace + cc;
                                        }
                                    }
                                }
                                else {
                                    wordEmptySpace = currentWord + cc;
                                    wordRightSpace = cc;
                                }
                            }
                            else {
                                wordEmptySpace = currentWord + cc;
                                charCodeEmptySpace = ' ' + charCodeEmptySpace + cc;
                            }
                        }
                        currentWord = currentWord + wordRightSpace;
                        wordWithoutSpace = wordEmptySpace.trim();
                        for (var i = 0; i < elementTextNodes.length; i++) {
                            if (elementTextNodes[i].data === currentWord) {
                                nodeIndex = i;
                            }
                            if (elementTextNodes[i].data === wordEmptySpace) {
                                nodeIndex = i;
                            }
                            if (elementTextNodes[i].data === wordRightSpace && wordRightSpace != '') {
                                nodeIndex = i;
                                isWordRightSpace = true;
                            }
                            if (elementTextNodes[i].data === currentWord && currentWord != '') {
                                nodeIndex = i;
                                isWord = true;
                                break;
                            }
                            if (elementTextNodes[i].data === wordWithoutSpace) {
                                nodeIndex = i;
                            }
                            if (elementTextNodes[i].data === currentWord && elementTextNodes[i + 1] !== undefined && elementTextNodes[i + 1].data.charCodeAt(0) === 160) {
                                nodeIndex = i;
                                break;
                            }
                            if (elementTextNodes[i].data === currentWord && elementTextNodes[i + 1] !== undefined && elementTextNodes[i + 1].data.charCodeAt(1) === 160 && charCodeEmptySpace.length >= 1) {
                                nodeIndex = i;
                                break;
                            }
                            if ((elementTextNodes[i].data === wordEmptySpace || elementTextNodes[i].data === currentWord) && elementTextNodes[i + 1] == undefined) {
                                var errorTextNode = document.createTextNode("");
                                elementTextNodes.push(errorTextNode);
                                this._currentActiveElement.appendChild(errorTextNode);
                                nodeIndex = i + 1;
                                currentCursorPosition = elementTextNodes[nodeIndex].data.length;
                                currentCursorNode = elementTextNodes[nodeIndex];
                                break;
                            }
                        }
                    }
                    for (var i = nodeIndex; i < elementTextNodes.length - 1; i++) {
                        if (currentCursorPosition <= elementTextNodes[i].data.length) {
                            currentCursorNode = elementTextNodes[i];
                            break;
                        }
                        if (isWordRightSpace === false || wordRightSpace === undefined || wordRightSpace === '') {
                            currentCursorPosition -= elementTextNodes[i].data.length;
                            currentCursorNode = elementTextNodes[i + 1];
                        }
                        else {
                            currentCursorPosition = 1;
                            currentCursorNode = elementTextNodes[i];
                            break;
                        }
                    }
                    var textNode = currentCursorNode;
                    range.collapse(true);
                    range.setStart(textNode, currentCursorPosition);
                    range.setEnd(textNode, currentCursorPosition);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        };
        SpellCheck.prototype._normalizeTextNodes = function (element) {
            element.normalize();
            return;
        };
        SpellCheck.prototype._filterTextNodes = function (proxy, elem) {
            var filteredTextNodes = [];
            getTextNodes(elem);
            function getTextNodes(element) {
                for (var i = 0; i < element.childNodes.length; i++) {
                    var child = element.childNodes[i];
                    if (child.nodeType === 3) {
                        filteredTextNodes.push(child);
                    }
                    else if (child.childNodes) {
                        getTextNodes(child);
                    }
                }
            }
            return filteredTextNodes;
        };
        SpellCheck.prototype._removeSpan = function (proxy) {
            if (!proxy.model.enableValidateOnType || !proxy._statusMultiTarget) {
                var element = !ej.isNullOrUndefined(proxy.model.controlsToValidate) || proxy._isIframe(proxy.element) ? proxy._activeElement : proxy.element[0];
            }
            else {
                if (proxy._currentActiveElement) {
                    var element = proxy._currentActiveElement;
                }
            }
            var spanElement = $(element).find("span.errorspan");
            for (var i = 0; i < spanElement.length; i++) {
                var spanText = spanElement[i].innerText || spanElement[i].textContent;
                $(spanElement[i]).replaceWith(spanText);
            }
        };
        SpellCheck.prototype._getFilterData = function (result, proxy) {
            var errorWordData = [];
            proxy._errorWordsData = proxy._errorWordDetails = result;
            for (var k = 0; k < proxy.model.ignoreWords.length; k++) {
                proxy._filterData(proxy.model.ignoreWords[k], proxy);
            }
            for (var j = 0; j < proxy._errorWordsData.length; j++) {
                errorWordData.push(proxy._errorWordsData[j].ErrorWord);
            }
            return errorWordData;
        };
        SpellCheck.prototype._filterData = function (filterWord, proxy) {
            var query = new ej.Query().where("ErrorWord", ej.FilterOperators.notEqual, filterWord);
            proxy._errorWordsData = new ej.DataManager(proxy._errorWordsData).executeLocal(query);
        };
        SpellCheck.prototype._formHtml = function (errorWordData, elementText) {
            var word, replaceExpression;
            for (var j = 0; j < errorWordData.length; j++) {
                word = "<span class=\"errorspan\">" + errorWordData[j] + "</span>";
                replaceExpression = new RegExp("\\b" + errorWordData[j] + "\\b", "gi");
                elementText = elementText.replace(replaceExpression, word);
            }
            return elementText;
        };
        SpellCheck.prototype._listBoxDataUpdate = function (proxy) {
            var errorWordElement = proxy._spellCheckWindow.find(".e-sentence .e-sentencecontent").find(".errorspan");
            $(errorWordElement[0]).addClass(this.model.misspellWordCss);
            if (errorWordElement.length > 0) {
                var filterValue = proxy._filterSuggestions(proxy, errorWordElement[0].innerText);
                if (filterValue.length > 0) {
                    proxy._dialogSuggestionsUpdate(proxy, filterValue[0]["SuggestedWords"]);
                }
                else {
                    proxy._suggestionsRequest(proxy, errorWordElement, errorWordElement[0].innerText, "suggestionsUpdate");
                }
            }
            else {
                if (!ej.isNullOrUndefined(this.model.controlsToValidate) && proxy._targetStatus) {
                    proxy._updateTargetText(proxy);
                }
                else {
                    var targetSentence = proxy._spellCheckWindow.find(".e-sentence .e-sentencecontent")[0].innerHTML;
                    proxy._validationComplete(proxy, targetSentence);
                }
            }
        };
        SpellCheck.prototype._filterSuggestions = function (proxy, errorWord) {
            var filterValue = [];
            if (proxy._suggestedWordCollection.length > 0) {
                var query = new ej.Query().where("ErrorWord", ej.FilterOperators.equal, errorWord);
                var data = new ej.DataManager(proxy._suggestedWordCollection).executeLocal(query);
                filterValue = data;
            }
            return filterValue;
        };
        SpellCheck.prototype._validationComplete = function (proxy, targetSentence) {
            proxy._updateTargetString(proxy);
            var element = !ej.isNullOrUndefined(proxy._activeElement) ? proxy._activeElement : proxy.element;
            var updateEvent = { targetElement: element, targetText: targetSentence, requestType: "changeErrorWord" };
            if (this._trigger("complete", updateEvent)) {
                return false;
            }
            proxy._statusFlag = false;
            proxy._alertWindowRender("validating");
        };
        SpellCheck.prototype._onMenuSelect = function (args) {
            var id = args.events.ID.split("_");
            var isIframe = false;
            if (!ej.isNullOrUndefined(this.model.controlsToValidate)) {
                for (var i = 0; i < this._controlIds.length; i++) {
                    var flag_1 = this._isIframe($(this._controlIds[i]));
                    flag_1 && (isIframe = true);
                    isIframe && (this.element = $(this._controlIds[0]));
                }
            }
            else {
                isIframe = this._isIframe(this.element);
            }
            var currentElement = isIframe ? this.element : this._selectedTarget.parentElement;
            this._activeElement = (currentElement);
            var htmlContent = "";
            htmlContent = this._isIframe($(currentElement)) ? $(currentElement).contents().find("body").html() : $(currentElement).html().trim();
            var event = { selectedOption: id[0], requestType: "menuSelect", targetContent: htmlContent, selectedValue: this._selectedValue };
            if (this._trigger("contextClick", event)) {
                return false;
            }
            switch (id[0]) {
                case "AddToDictionary":
                    var addWord = (this._selectedTarget.innerText || this._selectedTarget.textContent).trim();
                    this._currentElement = $(currentElement);
                    this.addToDictionary(addWord);
                    break;
                case "IgnoreAll":
                    var errorWord = (this._selectedTarget.innerText || this._selectedTarget.textContent).trim();
                    var result = this.ignoreAll(errorWord, htmlContent);
                    htmlContent = result["resultHTML"];
                    $(currentElement).html(result["resultHTML"]);
                    if (this._controlIds.length > 0) {
                        for (var i = 0; i < this._controlIds.length; i++) {
                            var element = $(this._controlIds[i]);
                            for (var j = 0; j < element.length; j++) {
                                if ($(currentElement)[0] !== $(element[j])[0]) {
                                    var activeElement = $(element[j]);
                                    this._replaceErrorText(activeElement, errorWord);
                                }
                            }
                        }
                    }
                    this._renderMenu(this);
                    break;
                default:
                    var selectedValue = id[0];
                    var flag = $(args.element).hasClass("e-errorsuggestions");
                    if (flag) {
                        this._selectedTarget.innerHTML = selectedValue;
                        var replaceItem = document.createTextNode(this._selectedTarget.innerText || this._selectedTarget.textContent);
                        this._selectedTarget.parentNode.insertBefore(replaceItem, this._selectedTarget);
                        $(this._selectedTarget).remove();
                        htmlContent = $(currentElement).html();
                    }
                    this._renderMenu(this);
                    break;
            }
        };
        SpellCheck.prototype._renderMenu = function (proxy) {
            var length;
            var element = !ej.isNullOrUndefined(proxy._activeElement) ? proxy._activeElement : proxy.element;
            if (proxy._controlIds.length > 0) {
                for (var i = 0; i < proxy._controlIds.length; i++) {
                    length = proxy._getErrorLength(proxy, $(proxy._controlIds[i]));
                    if (length > 0)
                        break;
                }
            }
            else {
                length = proxy._getErrorLength(proxy, $(proxy.element));
            }
            if (length === 0) {
                var updateEvent = { targetElement: element, requestType: "validate" };
                if (proxy._trigger("complete", updateEvent)) {
                    return false;
                }
            }
            length > 0 ? proxy._statusFlag = true : proxy._statusFlag = false;
            var menuObj = proxy._contextMenu.data("ejMenu");
            $(menuObj.element).is(":visible") && menuObj.hide();
            if (proxy._isIframe($(element))) {
                proxy._bindBeforeOpen(proxy, $(element).contents().find("body"));
            }
            else {
                proxy._bindBeforeOpen(proxy, $(element));
            }
        };
        SpellCheck.prototype._getErrorLength = function (proxy, element) {
            var targetElement = (proxy._isIframe(element)
                ? $(element).contents().find("body")[0]
                : $(element));
            var length = $(targetElement).find(".errorspan").length;
            return length;
        };
        SpellCheck.prototype._getElement = function () {
            var spanTags = document.getElementsByTagName("span");
            var searchText = this._selectedValue;
            var found = [];
            for (var i = 0; i < spanTags.length; i++) {
                if (spanTags[i].textContent === searchText) {
                    found.push(spanTags[i]);
                }
            }
            return found;
        };
        SpellCheck.prototype._alertClose = function () {
            if (!ej.isNullOrUndefined(this._alertWindow) && this._alertWindow.parents().find(".e-alertdialog").length > 0) {
                this._alertWindow.ejDialog("close");
                this._alertWindow.parents().find(".e-alertdialog").remove();
                this._close();
            }
        };
        SpellCheck.prototype._close = function () {
            if (!ej.isNullOrUndefined(this._spellCheckWindow) && this._spellCheckWindow.parents().find(".e-spellcheck.e-dialog-wrap").length > 0) {
                var contentAreaElement = this._spellCheckWindow.find(".e-sentence .e-sentencecontent");
                var spanElement = $(contentAreaElement[0]).find("span.errorspan");
                for (var i = 0; i < spanElement.length; i++) {
                    var spanText = spanElement[i].innerText || spanElement[i].textContent;
                    $(spanElement[i]).replaceWith(spanText);
                }
                this._updateTargetString(this);
                var updatedString = contentAreaElement.html();
                var event;
                if (!ej.isNullOrUndefined(this.model.controlsToValidate))
                    event = { updatedText: updatedString, targetElement: this._currentTargetElement, requestType: "dialogClose" };
                else
                    event = { updatedText: updatedString, requestType: "dialogClose" };
                if (this._trigger("dialogClose", event)) {
                    return false;
                }
                if (this._spellCheckWindow.ejDialog("isOpen"))
                    this._spellCheckWindow.ejDialog("close");
                this._spellCheckWindow.parents().find(".e-spellcheck.e-dialog-wrap").remove();
                this._changeAllWords = [];
                if (!ej.isNullOrUndefined(this.model.controlsToValidate)) {
                    this._controlIds = this.model.controlsToValidate.split(",");
                    this._subElements = [];
                }
            }
        };
        SpellCheck.prototype._changeErrorWord = function (args) {
            var selectedValue = $("#" + this._id + "_Suggestions").ejListBox("option", "value");
            var divElement = this._spellCheckWindow.find(".e-sentence .e-sentencecontent");
            var targetText = this._spellCheckWindow.find(".e-sentence .e-sentencecontent")[0].innerHTML;
            var errorWord = $(this._spellCheckWindow.find(".e-sentence .e-sentencecontent").find("." + this.model.misspellWordCss)[0]).text().trim();
            var result;
            selectedValue = selectedValue === this._localizedLabels.NoSuggestionMessage ? errorWord : selectedValue;
            if (args.model.text === this._localizedLabels.AddToDictionary) {
                this._currentElement = $(divElement);
                this.addToDictionary(errorWord);
            }
            else {
                if (args.model.text === this._localizedLabels.IgnoreOnceButtonText) {
                    result = this.ignore(errorWord, targetText, null);
                    if (result !== false)
                        this._updateErrorWord(this, result, args, errorWord, null, "ignore");
                }
                else if (args.model.text === this._localizedLabels.IgnoreAllButtonText) {
                    result = this.ignoreAll(errorWord, targetText);
                    if (result !== false)
                        this._updateErrorWord(this, result, args, errorWord, null, "ignoreAll");
                }
                else if (args.model.text === this._localizedLabels.ChangeButtonText) {
                    result = this.change(errorWord, targetText, selectedValue, null);
                    if (result !== false)
                        this._updateErrorWord(this, result, args, errorWord, selectedValue, "change");
                }
                else if (args.model.text === this._localizedLabels.ChangeAllButtonText) {
                    result = this.changeAll(errorWord, targetText, selectedValue);
                    if (result !== false)
                        this._updateErrorWord(this, result, args, errorWord, selectedValue, "changeAll");
                }
            }
        };
        SpellCheck.prototype._convertData = function (result, type) {
            var data = [];
            for (var i = 0; i < result.length; i++) {
                if (type === "dictionaryData") {
                    data.push({ field: result[i] });
                }
                else if (type === "menuData") {
                    data.push({ id: result[i], text: result[i] });
                }
            }
            return data;
        };
        SpellCheck.prototype._updateErrorWord = function (proxy, result, event, errorWord, selectedValue, requestType) {
            var listBoxElement = this._spellCheckWindow.find(".e-suggesteditems");
            proxy._spellCheckWindow.find(".e-sentence .e-sentencecontent")[0].innerHTML = result["resultHTML"];
            var errorWordElement = this._spellCheckWindow.find(".e-sentence .e-sentencecontent").find(".errorspan");
            var listObj;
            if (errorWordElement.length > 0) {
                proxy._targetUpdate(proxy, errorWordElement, errorWord, requestType, selectedValue);
            }
            else {
                if (!ej.isNullOrUndefined(this.model.controlsToValidate) && proxy._targetStatus) {
                    proxy._updateTargetText(proxy);
                }
                else {
                    if (!ej.isNullOrUndefined(this.model.controlsToValidate)) {
                        $(this._proElements)
                            .html(proxy._spellCheckWindow.find(".e-sentence .e-sentencecontent")[0].innerHTML);
                    }
                    var noSuggestion = [this._localizedLabels.NoSuggestionMessage];
                    listBoxElement.ejListBox({ selectedItemIndex: null });
                    listBoxElement.ejListBox({
                        dataSource: this._convertData(noSuggestion, "dictionaryData"),
                        selectedItemIndex: 0
                    });
                    listObj = $("#" + this._id + "_Suggestions").data("ejListBox");
                    listObj.refresh();
                    proxy._validationComplete(proxy, result["resultHTML"]);
                }
            }
        };
        SpellCheck.prototype._targetUpdate = function (proxy, errorWordElement, errorWord, requestType, selectedValue) {
            if (requestType === "changeAll") {
                for (var i = 0; i < errorWordElement.length; i++) {
                    var spanText = errorWordElement[i].innerText || errorWordElement[i].textContent;
                    if (spanText === errorWord) {
                        $(errorWordElement[i]).replaceWith(selectedValue);
                    }
                }
            }
            for (var j = 0; j < this.model.ignoreWords.length; j++) {
                for (var k = 0; k < errorWordElement.length; k++) {
                    var elementText = errorWordElement[k].innerText || errorWordElement[k].textContent;
                    if (elementText === proxy.model.ignoreWords[j]) {
                        $(errorWordElement[k]).replaceWith(elementText);
                    }
                }
            }
            proxy._listBoxDataUpdate(proxy);
        };
        SpellCheck.prototype._updateTargetText = function (proxy) {
            proxy._updateTargetString(proxy);
            var updateElement = !ej.isNullOrUndefined(proxy.model.controlsToValidate) ? $(proxy._proElements) : $("#" + proxy._id);
            proxy._proElements = $(proxy._subElements[0]);
            if (proxy._proElements.length > 0 || proxy._subElements.length > 0) {
                var element = $(proxy._subElements[0]);
                proxy._currentTargetElement = element;
                var targetHtml = $(element)[0].tagName === "TEXTAREA" || $(element)[0].tagName === "INPUT" ? $(element)[0].value : $(element)[0].innerHTML;
                var event = { previousElement: updateElement, currentElement: element, targetHtml: targetHtml, requestType: "updateText" };
                if (proxy._trigger("targetUpdating", event)) {
                    proxy._close();
                    return false;
                }
                proxy._spellCheckWindow.find(".e-sentence .e-sentencecontent")[0].innerHTML = targetHtml;
                proxy._subElements = proxy._subElements.slice(1);
                var contentElement = proxy._spellCheckWindow.find(".e-sentence .e-sentencecontent");
                var diffWords = proxy._filteringDiffWords(proxy, contentElement[0].innerText);
                proxy._suggestionsRequest(proxy, contentElement, diffWords.toString(), "validateByDialog");
            }
            else {
                var errorWordElement = proxy._spellCheckWindow.find(".e-sentence .e-sentencecontent").find(".errorspan");
                if (errorWordElement.length === 0 && proxy._subElements.length > 0) {
                    proxy._updateTargetText(proxy);
                }
                else if (errorWordElement.length > 0) {
                    var scrollObj = proxy._spellCheckWindow.find(".e-sentence .e-sentencescroller").data("ejScroller");
                    scrollObj.refresh();
                    proxy._listBoxDataUpdate(proxy);
                }
                else {
                    proxy._completionCheck(proxy);
                }
            }
        };
        SpellCheck.prototype._updateTargetString = function (proxy) {
            var updateElement = !ej.isNullOrUndefined(proxy.model.controlsToValidate) ? $(proxy._proElements) : $("#" + proxy._id);
            if (updateElement.length > 0) {
                var updatedString = proxy._spellCheckWindow.find(".e-sentence .e-sentencecontent")[0].innerHTML;
                if (proxy._isIframe(updateElement)) {
                    updateElement.contents().find("body").html(updatedString);
                }
                else {
                    !ej.isNullOrUndefined((updateElement)[0].value)
                        ? updateElement.val(updatedString)
                        : updateElement.html(updatedString);
                }
            }
        };
        SpellCheck.prototype._completionCheck = function (proxy) {
            proxy._subElements = proxy._subElements.slice(1);
            proxy._subElements.length === 0 && (proxy._targetStatus = false);
            proxy._validationComplete(proxy, "");
        };
        SpellCheck.prototype._changeAllErrors = function (proxy) {
            var spanElement = $(proxy._activeElement).find(".errorspan");
            for (var i = 0; i < spanElement.length; i++) {
                var spanText = spanElement[i].innerText || spanElement[i].textContent;
                for (var i_2 = 0; i_2 < proxy._changeAllWords.length; i_2++) {
                    if (spanText === proxy._changeAllWords[i_2]["ErrorWord"]) {
                        $(spanElement[i_2]).replaceWith(proxy._changeAllWords[i_2]["ReplaceWord"]);
                    }
                }
            }
        };
        SpellCheck.prototype._setModel = function (options) {
            var _this = this;
            for (var prop in options) {
                if (options.hasOwnProperty(prop)) {
                    switch (prop) {
                        case "locale":
                            this.model.locale = options[prop];
                            this._localizedLabels = ej.getLocalizedConstants("ej.SpellCheck", this.model.locale);
                            break;
                        case "misspellWordCss":
                            this.model.misspellWordCss = options[prop];
                            if (this.model.contextMenuSettings.enable) {
                                if (!ej.isNullOrUndefined(this.model.controlsToValidate)) {
                                    for (var i = 0; i < this._controlIds.length; i++) {
                                        this._changeMisspellWordCss(this._controlIds[i]);
                                    }
                                }
                                else {
                                    this._changeMisspellWordCss(this.element[0]);
                                }
                            }
                            break;
                        case "contextMenuSettings":
                            $.extend(this.model.contextMenuSettings, options[prop]);
                            if (this.model.contextMenuSettings.enable) {
                                this.validate();
                                this._renderControls();
                            }
                            else {
                                !ej.isNullOrUndefined(this._contextMenu) && this._contextMenu.parent().remove();
                                this._removeSpan(this);
                            }
                            break;
                        case "ignoreSettings":
                            $.extend(this.model.ignoreSettings, options[prop]);
                            this._ignoreStatus = false;
                            this._statusFlag = true;
                            if (this.model.contextMenuSettings.enable) {
                                this.validate();
                                this._renderControls();
                            }
                            break;
                        case "dictionarySettings":
                            $.extend(this.model.dictionarySettings, options[prop]);
                            break;
                        case "maxSuggestionCount":
                            this.model.maxSuggestionCount = options[prop];
                            break;
                        case "ignoreWords":
                            this.model.ignoreWords = options[prop];
                            if (this.model.contextMenuSettings.enable) {
                                this.validate();
                            }
                            break;
                        case "controlsToValidate":
                            this.model.controlsToValidate = options[prop];
                            if (ej.isNullOrUndefined(this.model.controlsToValidate)) {
                                $(this.element).attr("style", "display:block");
                                for (var i_3 = 0; i_3 < this._controlIds.length; i_3++) {
                                    var element = $(this._controlIds[i_3]);
                                    element.removeClass("e-spellcheck");
                                    element[0].spellcheck = true;
                                    element[0].addEventListener("input", function () { _this._statusFlag = false; }, false);
                                }
                            }
                            this._renderControls();
                            break;
                        case "isResponsive":
                            this.model.isResponsive = options[prop];
                            this._renderControls();
                            break;
                        case "enableValidateOnType":
                            this.model.enableValidateOnType = options[prop];
                            this._renderControls();
                            break;
                    }
                }
            }
        };
        SpellCheck.prototype._changeMisspellWordCss = function (element) {
            var oldMisspellWordCssClass = $(element).find("span.errorspan").attr("class").toString().split(" ")[1];
            $(element).find("span.errorspan").removeClass(oldMisspellWordCssClass).addClass(this.model.misspellWordCss);
        };
        SpellCheck.prototype._getModelValues = function (proxy, targetText, events) {
            var spellModel = {
                ignoreAlphaNumericWords: proxy.model.ignoreSettings.ignoreAlphaNumericWords,
                ignoreEmailAddress: proxy.model.ignoreSettings.ignoreEmailAddress,
                ignoreHtmlTags: proxy.model.ignoreSettings.ignoreHtmlTags,
                ignoreMixedCaseWords: proxy.model.ignoreSettings.ignoreMixedCaseWords,
                ignoreUpperCase: proxy.model.ignoreSettings.ignoreUpperCase,
                ignoreUrl: proxy.model.ignoreSettings.ignoreUrl,
                ignoreFileNames: proxy.model.ignoreSettings.ignoreFileNames
            };
            var value = JSON.stringify({ requestType: "checkWords", model: spellModel, text: targetText, additionalParams: !ej.isNullOrUndefined(events) ? events.additionalParams : null });
            return value;
        };
        SpellCheck.prototype._getLocalizedLabels = function () {
            return ej.getLocalizedConstants(this["sfType"], this.model.locale);
        };
        SpellCheck.prototype._elementRightClick = function (e) {
            if (!ej.isNullOrUndefined(this._contextMenu)) {
                if (!$(e.target).hasClass("e-menulink")) {
                    var menuObj = this._contextMenu.data("ejMenu");
                    if (!ej.isNullOrUndefined(menuObj))
                        $(menuObj.element).is(":visible") && menuObj.hide();
                }
            }
        };
        return SpellCheck;
    }(ej.WidgetBase));
    ej.widget("ejSpellCheck", "ej.SpellCheck", new SpellCheck());
})(jQuery);
ej.SpellCheck.Locale = ej.SpellCheck.Locale || {};
ej.SpellCheck.Locale["default"] = ej.SpellCheck.Locale["en-US"] = {
    SpellCheckButtonText: "Spelling:",
    NotInDictionary: "Not in Dictionary:",
    SuggestionLabel: "Suggestions:",
    IgnoreOnceButtonText: "Ignore Once",
    IgnoreAllButtonText: "Ignore All",
    AddToDictionary: "Add to Dictionary",
    ChangeButtonText: "Change",
    ChangeAllButtonText: "Change All",
    CloseButtonText: "Close",
    CompletionPopupMessage: "Spell check is complete",
    CompletionPopupTitle: "Spell check",
    Ok: "OK",
    NoSuggestionMessage: "No suggestions available",
    NotValidElement: "Specify the valid control id or class name to spell check"
};
;