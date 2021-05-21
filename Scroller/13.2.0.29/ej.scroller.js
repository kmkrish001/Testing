(function ($, ej, window, undefined) {
    'use strict';

    ej.widget("ejScrollBar", "ej.ScrollBar", {
        defaults: {
            /**		
* Specifies the orientation of the scrollbar. It determines whether the scrollbar should be rendered on horizontally or vertically.
*/
            orientation: "horizontal",
            /**		
* Specifies the view port size of the scrollbar.
*/
            viewportSize: 0,
            /**		
* Specifies the height of Scroll panel and scrollbars.
*/
            height: 18,
            /**		
* Specifies the width of Scroll panel and scrollbars.
*/
            width: 18,
            /**		
* While click on the scrollbar button the scrollbar position added to the given pixel value..
*/
            smallChange: 57,
            /**		
* While click on the scrollbar thumb the scrollbar position added to the given pixel value..
*/
            largeChange: 57,
            /**		
* The scrollbars move to top/left position with specified value based on orientaion.
*/
            value: 0,
            /**		
* Specifies the maximum scrollable value.
*/
            maximum: 0,
            /**		
* Specifies the minimum scrollable value.
*/
            minimum: 0,
            /**		
* Specifies the button height for vertical scrollbar; for horizontal scrollbar specifies the width of the button in the scrollbar.
*/
            buttonSize: 18,
			/**		
* Specifies the mode of scrollbar..
*/
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
                "div." + d.css + "scroll",
                    String.format(divString, "up e-icon e-button", d.buttonSize) +
                    String.format(divString, "handlespace", d.handleSpace,
                        String.format(divString, "handle", d.handle)) +
                    String.format(divString, "down e-icon e-button", d.buttonSize),
                lit
            );

            this.element.append(el);
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
            if (d.handle < 20) d.handle = 20;
            d.onePx = d.scrollable / (d.handleSpace - d.handle);
            d.fromScroller = false;
            d.up = true;
            d.vInterval = undefined;
        },
        _updateLayout: function (d) {
			this.element.height(this.model.height);
			this.element.width(this.model.width);
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

        scroll: function (pixel, source, triggerEvent) {
            var dS = this._scrollData;
            if (!triggerEvent) {
                if (this.model.orientation === ej.ScrollBar.Orientation.Horizontal) {
                    if (this._trigger("scroll", { source: source || "custom", scrollData: this._scrollData, scrollLeft: pixel }))
                        return;
                }
                else {
                    if (this._trigger("scroll", { source: source || "custom", scrollData: this._scrollData, scrollTop: pixel }))
                        return;
                }
            }
            this.value(pixel);
            if (this.content().length > 0) {
                if (this.model.orientation === ej.ScrollBar.Orientation.Horizontal)
                    this.content()[0].style.left = (pixel - this.model.minimum) / this._scrollData.onePx + "px";
                else
                    this.content()[0].style.top = (pixel - this.model.minimum) / this._scrollData.onePx + "px";
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
            e.type === "mouseup" && this[d.handler].removeClass("e-active");
            if (e.type === "mouseup" || e.type === "touchend" || (!e.toElement && !e.relatedTarget && !e.target)) {
                this._off($(document), "mousemove touchmove");
                $(document).off("mouseout mouseup touchend", ej.proxy(this._mouseUp, this));
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
            //if (down.which !== 1) return;
            if (!this._enabled) return;
            var d = down.data.d, value, step = 0;

            d.fromScroller = true;
            this[d.handler].css("transition", "none");

            var prevY, top = parseInt(this[d.handler].css(d.lPosition)) || 0;

            this._on($(document), "mousemove touchmove", (function (move) {
                move.preventDefault();
                var skip = 1;
                var pageXY = move.type == "mousemove" ? move[d.clientXy] : move.originalEvent.changedTouches[0][d.clientXy];
                if (prevY && pageXY !== prevY) {
                    step = (pageXY - prevY);
                    if(this.model.infiniteScrolling){
                        top = top + step;
                        d.step = step;
                        if (d.enableRTL ? top > 0 : top < 0) top = 0;
                        if ((top * (d.enableRTL ? -1 : 1)) + d.handle >= d.handleSpace)
                            top = (d.handleSpace - d.handle) * (d.enableRTL ? -1 : 1);
                        value = Math.ceil(top * d.onePx);
                        this["scroll"](value, "thumb");
                    }
                    else{
                        value = step * d.onePx;
                        this._changeTop(d, value, "thumb");
                    }
                    this._trigger("thumbMove", { originalEvent: move, scrollData: d });
                }

                if (skip === 1)
                    prevY = pageXY;
            }));

            this._trigger("thumbStart", { originalEvent: down, scrollData: d });

            $(document).one("mouseup touchend", { d: d, source: "thumb" }, ej.proxy(this._mouseUp, this));
            $(document).mouseout({ d: d, source: "thumb" }, ej.proxy(this._mouseUp, this));
        },

        _spaceMouseDown: function (e) {
            if (!e.data || !this._enabled) return;

            var d = e.data.d;

            if (e.which !== 1 || e.target === this[d.handler][0]) return;

            var step = e.data.step ? this.model.smallChange : this.model.largeChange, hTop = e.data.top || this[d.handler].offset()[d.lPosition];

            e[d.clientXy] = e[d.clientXy] || 0;

            if (e[d.clientXy] < hTop) step *= -1;

            this._changeTop(d, step, step === 3 ? "track" : "button");

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

                this._changeTop(d, step, step === 3 ? "track" : "button");
                e.data ? hTop = e.data.top || this[d.handler].offset()[d.lPosition] : hTop = this[d.handler].offset()[d.lPosition];
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
* @fileOverview Plugin to style the Html Button elements
* @copyright Copyright Syncfusion Inc. 2001 - 2013. All rights reserved.
*  Use of this code is subject to the terms of our license.
*  A copy of the current license can be obtained at any time by e-mailing
*  licensing@syncfusion.com. Any infringement will be prosecuted under
*  applicable laws. 
* @version 12.1 
* @author <a href="mailto:licensing@syncfusion.com">Syncfusion Inc</a>
*/

(function ($, ej, window, undefined) {
    'use strict';
    /**
* @namespace ej
* @class ejScroller
* @requires jQuery
* @requires ej.core.js
* @requires ej.draggable.js
* @classdesc Custom Design for Html Scroller control.
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
		*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
         *&lt;b&gt;A controller*&lt;/b&gt;  can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
         It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt;     
*&lt;/div&gt; <br> 
* &lt;script&gt;
* // Create Scroller
* $('#scrollcontent').ejScroller(); 	
* &lt;/script&gt;
*/
    ej.widget("ejScroller", "ej.Scroller", {
        defaults: {
            /**		
* Specifies the height of Scroll panel and scrollbars.
* @default 250
* @type {number}
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //To set height API value during initialization  
* 	$("#scrollcontent").ejScroller({height: 200 });	
* &lt;/script&gt;
 * @memberof ejScroller
* @instance
*/
            height: 250,
            autoHide: false,
            /**		
* Specifies the width of Scroll panel and scrollbars.
* @default 0
* @type {number}
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //To set width API value during initialization
* 	$("#scrollcontent").ejScroller({width: 500 });	
* &lt;/script&gt;
* @memberof ejScroller
* @instance
*/
            width: 0,
            /**		
* While press on the arrow key the scrollbar position added to the given pixel value.
* @default 57
* @type {number}
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //To set scrollOneStepBy API value during initialization
* 	$("#scrollcontent").ejScroller({scrollOneStepBy: 40 });	
* &lt;/script&gt;
* @memberof ejScroller
* @instance
*/
            scrollOneStepBy: 57,
            /**		
* Specifies the button height for vertical scrollbar; for horizontal scrollbar specifies the width of the button in the scrollbar.
* @default 18
* @type {number}
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //To set Button Size of Scroller during initialization
* 	$("#scrollcontent").ejScroller({buttonSize: 20 });	
* &lt;/script&gt;
* @memberof ejScroller
* @instance
*/
            buttonSize: 18,
            /**		
* The Scroller content and scrollbars move left with given value. 
* @default 0
* @type {number}
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //To set Scroll left API during initialization
* 	$("#scrollcontent").ejScroller({scrollLeft: 40 });	
* &lt;/script&gt;
* @memberof ejScroller
* @instance
*/
            scrollLeft: 0,
            /**		
* The Scroller content and scrollbars move to top position with specified value. 
* @default 0
* @type {number}
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //To set Scroll top API during initialization
* 	$("#scrollcontent").ejScroller({scrollTop: 40 });	
* &lt;/script&gt;
* @memberof ejScroller
* @instance
*/
            scrollTop: 0,
            /**		
* Indicates the target area to which scroller have to appear. 
* @default null
* @type {string}
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //To set Scroller for the specified target panel during initialization
* 	$("#scrollcontent").ejScroller({targetPane: "contentarea" });	
* &lt;/script&gt;
* @memberof ejScroller
* @instance
*/
            targetPane:null,
            /**		
* Set the Scrollbar height and width for this API; if vertical scrollbar,apply the width else apply the height.
* @default 18
* @type {number}
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //Enable scrollerSize on initialization 
* 	//To set scroller Size API value 
* 	$("#scrollcontent").ejScroller({scrollerSize: 20 });	
* &lt;/script&gt;
* @memberof ejScroller
* @instance
*/
            scrollerSize: 18,
            /**		
* Save current model value to browser cookies for state maintanence. While refresh the page Rating control values are retained.  
* @default false
* @type {boolean}
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //Enable enablePersistence API on initialization
* 	$("#scrollcontent").ejScroller({enablePersistence: true });
* &lt;/script&gt;	
* @memberof ejScroller
* @instance
*/
            enablePersistence: false,
            /**		
* Indicates the Right to Left direction to scroller  
* @default undefined
* @type {boolean}
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //Enable enableRTL API on initialization
* 	$("#scrollcontent").ejScroller({enableRTL: true });	
* &lt;/script&gt;	
* @memberof ejScroller
* @instance
*/
            enableRTL: undefined,
            /**		
* Enables or Disbale the touch Scroll  
* @default true
* @type {boolean}
* @example 

* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //Disable Touch Scroll API on initialization
* 	$("#scrollcontent").ejScroller({enableTouchScroll: false });	
* &lt;/script&gt;	
* @memberof ejScroller
* @instance
*/
            enableTouchScroll: true,
            /**		
* Specifies to enable or disable the scroller  
* @default true
* @type {boolean}
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
     * representation of information from the user's interaction with it.
     * The model consists of application data, business rules, logic, and functions. A view can be any
     * output representation of data, such as a chart or a diagram. Multiple views of the same data 
     * are possible, such as a bar chart for management and a tabular view for accountants. 
     *The controller mediates input, converting it to commands for the model or view.The central 
     *ideas behind MVC are code reusability and n addition to dividing the application into three 
     *kinds of components, the MVC design defines the interactions between them.</p>
     *&lt;ul&gt;
      *&lt;li&gt;
     *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
     *It can also send commands to the model to update the model's state (e.g., editing a document).
     *&lt;/li&gt;
     *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //Enable or disable scroller API on initialization
* 	$("#scrollcontent").ejScroller({enabled: true });	
* &lt;/script&gt;	
* @memberof ejScroller
* @instance
*/
            enabled: true,
/**     
* Fires when Scroller control is created.
* @event
* @name ejScroller#create	
* @param {Object} argument Event parameters from scroller     
* @param {boolean}  argument.cancel if the event should be canceled; otherwise, false.
* @param {object}  argument.model returns the scroller model
* @param {string}  argument.type returns the name of the event.
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //create event for scroller
* $("#scrollcontent").ejScroller({
*    create: function (args) {}
* });   
* &lt;/script&gt;	  
* @memberof ejScroller
* @instance
*/
            create: null,
            /**     
* Fires when Scroller control is destroyed.
* @event
* @name ejScroller#destroy	
* @param {Object} argument Event parameters from scroller     
* @param {boolean}  argument.cancel if the event should be canceled; otherwise, false.
* @param {object}  argument.model returns the scroller model
* @param {string}  argument.type returns the name of the event.
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* //destroy event for scroller
* $("#scrollcontent").ejScroller({
*    destroy: function (args) {}
* });  
* &lt;/script&gt;	    
* @memberof ejScroller
* @instance
*/
            destroy: null
        },
        validTags: ["div"],
        type: "transclude",
        /**
* Specify the data types for default properties 
* @private
*/
        dataTypes: {
            buttonSize: "number",
            scrollOneStepBy: "number"
        },
        observables: ["scrollTop", "scrollLeft"],
        scrollTop: ej.util.valueFunction("scrollTop"),
        scrollLeft: ej.util.valueFunction("scrollLeft"),
        /**
* Specifies the keys used for keyboard navigation. 
* @private
*/
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
        /**
* Specify the content area for which the scrollerbar is specified.
* @private
*/
        content: function () {
            if (!this._content || !this._content.length || !this._content[0].offsetParent)
                this._content = this.element.children("div").first().addClass("e-content");

            return this._content;
        },
        _setFirst: true,
        _updateScroll:false,
        /**
* Create the scroller widget
* @private
*/
        _init: function () {
            this.element.addClass("e-widget");
            this.content();
			if (this.model.enableRTL === undefined) {
                this.model.enableRTL = this.element.css("direction") === "rtl";
            }
            this._ensureScrollers();            
            if (this.model.enableRTL) {
                this.element.addClass("e-rtl");
                this._rtlScrollLeftValue = this.content().scrollLeft();
            }
            this._on(this.content(), "scroll", this._scroll);
            this.model.targetPane != null && this._on(this.content().find(this.model.targetPane), "scroll", this._scroll);
            if (this.scrollLeft())
                this._setScrollLeftValue(this.scrollLeft());
            if (this.scrollTop())
                this.content().scrollTop(this.scrollTop());

            if (this.model.autoHide) {
                this.element.addClass("e-autohide");
                this._on(this.element, "mouseenter mouseleave", this._scrollerHover);
				this.content().siblings().hide();
            }
            if (this.model.enabled) {
                this.enable();
            }
            else {
                this.disable();
            }
        },

        _setScrollLeftValue: function(leftValue) {
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

        /**
* Ensures the scrollbar height and width.
* @private
*/
        _ensureScrollers: function () {
            var jqVersion = $.fn.jquery, height, width;
            if (this.model.height) {
                this.element.height(this.model.height);
            }
            if (this.model.width) {
                this.element.width(this.model.width);
            }

            this._off(this.content(), "mousedown touchstart");
			if(this.content().length>0){
            if (this.isVScroll()) {
                if (!this._vScrollbar) {
                    this._vScrollbar = this._createScrollbar(ej.ScrollBar.Orientation.Vertical, this.isHScroll());
					}
                    if (this.model.enableTouchScroll)
                        this._on(this.content(), "mousedown touchstart", { d: this._vScrollbar._scrollData }, this._mouseDownOnContent);
            } else {
                this._vScrollbar = null;
                this.element.children(".e-vscrollbar").remove();
            }
            if (this.isHScroll()) {
                if (!this._hScrollbar) {
                    this._hScrollbar = this._createScrollbar(ej.ScrollBar.Orientation.Horizontal, this.isVScroll());
					}
                    if (this.model.enableTouchScroll)
                        this._on(this.content(), "mousedown touchstart", { d: this._hScrollbar._scrollData }, this._mouseDownOnContent);
            } else {
                this._hScrollbar = null;
                this.element.children(".e-hscrollbar").remove();
            }

            if (!this._vScrollbar && !this._hScrollbar)
                this.content().css({ width: "auto", height: "auto" });

            if (!(this.element.find(".e-hscroll").length > 0)) {
                if (this._vScrollbar) {
                    this.content().outerHeight(this.content().outerHeight() - 1);
                }
            }

            if (this.isHScroll() || this.isVScroll()) {
                this.content().addClass("e-content");
                jqVersion === "1.7.1" || jqVersion === "1.7.2" ? (height = "height", width = "width") : (height = "outerHeight", width = "outerWidth");
                this.content()[height](this.element.height() - (this.isHScroll() && !this.model.autoHide ? this.model.scrollerSize : 0));
                this.content()[width](this.element.width() - (this.isVScroll() && !this.model.autoHide ? this.model.scrollerSize : 0));
            } else
                this.content().removeClass("e-content");
			}
        },
        /**
* Returns horizontal scrollbar is shown or not.		
* @return Boolean value
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;

* // To check horizontal scrollbar is rendered or not
* var scrollerObj  = $("#scrollcontent").data("ejScroller");
* scrollerObj.isHScroll(); // Returns horizontal scrollbar is shown or not.
* &lt;/script&gt;
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* // To check horizontal scrollbar is rendered or not
* $("#scrollcontent").ejScroller("isHScroll");	
* &lt;/script&gt;
* @memberof ejScroller
* @instance
*/
        isHScroll: function () {
            if (this.model.width > 0) {
                var $paneObject = this.content().find(this.model.targetPane);
                if (this.model.targetPane != null && $paneObject.length)
                    return ($paneObject[0].scrollWidth + $paneObject.siblings().width()) > this.model.width;
                else
                    return this.content()[0].scrollWidth > this.model.width;
            }
            return false;
        },
        /**
* Returns vertical scrollbar is shown or not.		
* @return Boolean value
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* $('#scrollcontent').ejScroller(); 	
* // To check vertical scrollbar is rendered or not
* var scrollerObj  = $("#scrollcontent").data("ejScroller");
* scrollerObj.isVScroll(); // Returns vertical scrollbar is shown or not.
* &lt;/script&gt;
* @example 
* &lt;div id="scrollcontent" style="width:900px;"&gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* $('#scrollcontent').ejScroller(); 	
* // To check vertical scrollbar is rendered or not
* $("#scrollcontent").ejScrollBar("isVScroll");	
* &lt;/script&gt;
* @memberof ejScroller
* @instance
*/
        isVScroll: function () {
            return this.model.height > 0 && this.content()[0].scrollHeight > this.model.height;
        },
        /**
* To configure the properties at runtime using SetModel		
* @private
*/
        _setModel: function (option) {
            for (var prop in option) {
                if (prop === "enableRTL") {
                    if (option[prop])
                        this.element.addClass("e-rtl");
                    else
                        this.element.removeClass("e-rtl");
                } else if (prop === "scrollLeft") {
                    this._setScrollLeftValue(this.scrollLeft());
                } else if (prop === "scrollTop") {
                    this.content().scrollTop(this.scrollTop());
                } else if (prop === "touchScroll") {
                    if (!this.model.enableTouchScroll)
                        this._off(this.content(), "mousedown touchstart");
                    else {
                        if (this._vScrollbar)
                            this._on(this.content(), "mousedown touchstart", { d: this._vScrollbar._scrollData }, this._mouseDownOnContent);
                        if (this._hScrollbar)
                            this._on(this.content(), "mousedown touchstart", { d: this._hScrollbar._scrollData }, this._mouseDownOnContent);
                    }
                }
                else if (prop === "buttonSize") {                   
                        if (this._vScrollbar) this._vScrollbar.model.buttonSize = this.model.buttonSize;
                        if (this._hScrollbar) this._hScrollbar.model.buttonSize = this.model.buttonSize;
                          this.refresh();
                }
                else {
                    this.scrollTop(0);
                    this.scrollLeft(0);
                    this.refresh();
                    break;
                }
            }
        },
        /**
* Creates the scroller in on demand time
* @private
*/
        _createScrollbar: function (orientation, isOtherScroll) {
            var proxy = this;
            var id, viewportSize, width, height, maximum, value;
            var div = document.createElement("div");
            if (orientation === ej.ScrollBar.Orientation.Vertical) {
                width = this.model.scrollerSize;
                height = viewportSize = this.model.height - (isOtherScroll ? this.model.scrollerSize : 0);
                maximum = this.content()[0]["scrollHeight"];
                value = this.scrollTop();
            }
            else {
                width = viewportSize = this.model.width - (isOtherScroll ? this.model.scrollerSize : 0);
                height = this.model.scrollerSize;
                var $pane = this.content().find(this.model.targetPane);
                if (this.model.targetPane != null && $pane.length)
                    maximum = $pane[0]["scrollWidth"] + $pane.parent().width() - $pane.width();
                else
                    maximum = this.content()[0]["scrollWidth"];
                value = this.scrollLeft();
            }
			if(this.element.children(".e-hscrollbar").length > 0)
			    $(this.element.children(".e-hscrollbar")).before(div);
			else
                this.element.append(div);
			$(div).ejScrollBar({
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
            this._off(orientation === ej.ScrollBar.Orientation.Vertical ? this.element : scrollbar[scrollbar._scrollData.scroll], "mousewheel DOMMouseScroll")
               ._on(orientation === ej.ScrollBar.Orientation.Vertical ? this.element : scrollbar[scrollbar._scrollData.scroll], "mousewheel DOMMouseScroll", { d: scrollbar._scrollData }, this._mouseWheel);
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
                    scrollbar.model.maximum = (this.model.targetPane != null ? this.content().find(this.model.targetPane)[0]["scrollHeight"] : this.content()[0]["scrollHeight"]) - scrollbar.model.viewportSize;
                    scrollbar.model.value = this.scrollTop();
                }
                else {
                    scrollbar.model.width = scrollbar.model.viewportSize = this.model.width - (isOtherScroll ? this.model.scrollerSize : 0);
                    scrollbar.model.height = this.model.scrollerSize;
                    scrollbar.model.maximum = (this.model.targetPane != null ? this.content().find(this.model.targetPane)[0]["scrollWidth"] + (this.content().width() - $(this.model.targetPane).outerWidth()) : this.content()[0]["scrollWidth"]) - scrollbar.model.viewportSize;
					if(!this.model.enableRTL)
						scrollbar.model.value = this.scrollLeft();
                }
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
        _thumbStart: function (e) {
            this._trigger("thumbStart", e);
        },
        _thumbMove: function (e) {
            this._trigger("thumbMove", e);
        },
        _thumbEnd: function (e) {
            this._trigger("thumbEnd", e);
        },
        /**
* User refreshes the Scroller control at any time.		
* @return jQuery
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* $('#scrollcontent').ejScroller(); 	
* // To refresh the Scroller control at any time.
* var scrollerObj  = $("#scrollcontent").data("ejScroller");
* scrollerObj.refresh(); // refreshes the Scroller control at any time
* &lt;/script&gt;
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* $('#scrollcontent').ejScroller(); 	
* // Refresh the scroller control
* $("#scrollcontent").ejScroller("refresh");	
* &lt;/script&gt;
* @memberof ejScroller
* @instance
*/
        refresh: function () {
            this.element.find(">.e-content").removeAttr("style");
            this._ensureScrollers();

            if (this.scrollLeft())
                this._setScrollLeftValue(this.scrollLeft());
            if ((this.scrollTop() && this._vScrollbar == null) || (this._vScrollbar !== null && this._vScrollbar._scrollData != null && !this._vScrollbar._scrollData.skipChange))
                this.content().scrollTop(this.scrollTop());

            if (this._vScrollbar) {
                this._vScrollbar._scrollData.dimension = "Height";
                this._updateScrollbar(ej.ScrollBar.Orientation.Vertical, this.isHScroll());
                this.isVScroll() && !this._vScrollbar._calculateLayout(this._vScrollbar._scrollData) && this._vScrollbar._updateLayout(this._vScrollbar._scrollData);
            }
            if (this._hScrollbar) {
                this._hScrollbar._scrollData.dimension = "Width";
                this._updateScrollbar(ej.ScrollBar.Orientation.Horizontal, this.isVScroll());
                this.isHScroll() && !this._hScrollbar._calculateLayout(this._hScrollbar._scrollData) && this._hScrollbar._updateLayout(this._hScrollbar._scrollData);
            }
            if (ej.browserInfo().name == "msie" && ej.browserInfo().version == "8.0")
                this.element.find(".e-hhandle").css("left", "0px");
            else
                this.model.targetPane != null && this._on(this.content().find(this.model.targetPane), "scroll", this._scroll);
        },
        /**
* Section for handling scrollbar based on keypressed
* @private
*/
        _keyPressed: function (action, target) {
		    if (!this.model.enabled) return;
            if (["input", "select", "textarea"].indexOf(target.tagName.toLowerCase()) !== -1)
                return true;

            var d, iChar;

            if (["up", "down", "pageUp", "pageDown"].indexOf(action) !== -1) {
                if(this._vScrollbar)
                    d = this._vScrollbar._scrollData;
                iChar = "o";
            } else if (["left", "right", "pageLeft", "pageRight"].indexOf(action) !== -1) {
                if(this._hScrollbar)
                    d = this._hScrollbar._scrollData;
                iChar = "i";
            } else return true;
            if (!d) return true;

            return !this._changeTop(d, (action.indexOf(iChar) < 0 ? -1 : 1) * (action[0] !== "p" ? 1 : 3) * d.scrollOneStepBy, "key");
        },
        /**
* Scroller moves to given pixel in Y (top) position. We can also specify the animation speed,in which the scroller has to move while re-positioning it.	
* @return jQuery
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* $('#scrollcontent').ejScroller(); 	
* // Moves scroller to given pixel in Y (top) position.
* var scrollerObj  = $("#scrollcontent").data("ejScroller");
* scrollerObj.scrollY(25); // call scrollY method(with animation disabled)
* scrollObj.scrollY(25,false,1000); // call scrollY method(with animation enabled. the third parameter "1000" indicates the animation speed while re-positioning the scroller)
* &lt;/script&gt;
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* $('#scrollcontent').ejScroller(); 	
* //Moves scroller to given pixel in Y (top) position.
* $("#scrollcontent").ejScroller("scrollY", 25, true);	// call scrollY method(with animation disabled. "true" indicates animation is off)
* $("#scrollcontent").ejScroller("scrollY", 25,false,1000);	// call scrollY method(with animation enabled. Here, fourth parameter "1000" indicates the animation speed while re-positioning the scroller)
* &lt;/script&gt;
* @memberof ejScroller
* @instance
*/
        scrollY: function (pixel, noAnimation,animationSpeed, source) {
            if (noAnimation) {
                if (this._trigger("scroll", { source: source || "custom", scrollData: this._vScrollbar ? this._vScrollbar._scrollData : null, scrollTop: pixel }))
                    return;
                this.scrollTop(pixel);
                this.content().scrollTop(pixel);
                if (!this._updateScroll && this._vScrollbar)
                    this._vScrollbar["scroll"](pixel, source, true);
                return;
            }
            if (ej.isNullOrUndefined(animationSpeed) || animationSpeed == "")
                animationSpeed = 100;
            this.content().stop().animate({
                scrollTop: pixel
            }, animationSpeed, 'linear');
        },
        /**
* Scroller moves to given pixel in X (left) position. We can also specify the animation speed,in which the scroller has to move while re-positioning it.	
* @return jQuery
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
		*&lt;/div&gt; <br> 
		* &lt;script&gt;
		* $('#scrollcontent').ejScroller(); 	
		* // Moves scroller to given pixel in X (left) position.
		* var scrollerObj  = $("#scrollcontent").data("ejScroller");
        * scrollerObj.scrollX(25); // call scrollX method(with animation disabled)
* scrollObj.scrollX(25,false,1000); // call scrollX method(with animation enabled. the third parameter "1000" indicates the animation speed while re-positioning the scroller)
		* &lt;/script&gt;
		* @example 
		* &lt;div id="scrollcontent" style="width:900px;" &gt;
		*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
		*&lt;/div&gt; <br> 
		* &lt;script&gt;
		* $('#scrollcontent').ejScroller(); 	
		* //Moves scroller to given pixel in X (left) position.
        * $("#scrollcontent").ejScroller("scrollX", 25, true);	// call scrollX method(with animation disabled. "true" indicates animation is off)
* $("#scrollcontent").ejScroller("scrollX", 25,false,1000);	// call scrollX method(with animation enabled. Here, the fourth parameter "1000" indicates the animation speed while re-positioning the scroller)
		* &lt;/script&gt;
		* @memberof ejScroller
		* @instance
		*/
        scrollX: function (pixel, noAnimation,animationSpeed, source) {
            if (noAnimation) {
                if (this._trigger("scroll", { source: source || "custom", scrollData: this._hScrollbar ? this._hScrollbar._scrollData : null, scrollLeft: pixel }))
                    return;
				var browserName = ej.browserInfo().name;
				if(this.model.enableRTL && browserName != "mozilla"){
					if(pixel < 0)			
						pixel = Math.abs(pixel);								
					var content = this.model.targetPane != null ? this.content().find(this.model.targetPane)[0] : this.content()[0];
					if(browserName == "chrome" || browserName == "webkit")
						pixel = content.scrollWidth - content.clientWidth - pixel;
				}		
                this.scrollLeft(pixel);
                if (this.model.targetPane != null)
                    this.content().find(this.model.targetPane).scrollLeft(pixel);
                else
                    this.content().scrollLeft(pixel);
                if (!this._updateScroll && this._hScrollbar)
                    this._hScrollbar["scroll"](pixel, source, true);
                return;
            }
            if (ej.isNullOrUndefined(animationSpeed) || animationSpeed == "")
                animationSpeed = 100;
            this.content().stop().animate({
                scrollLeft: pixel
            }, animationSpeed, 'linear');
        },
        /**
* User enables the Scroller control at any time.		
* @return jQuery
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* $('#scrollcontent').ejScroller(); 	
* // To enable the Scroller control at any time.
* var scrollerObj  = $("#scrollcontent").data("ejScroller");
* scrollerObj.enable(); // enable the Scroller control at any time
* &lt;/script&gt;
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* $('#scrollcontent').ejScroller(); 	
* // enables the scroller control
* $("#scrollcontent").ejScroller("enable");	
* &lt;/script&gt;
* @memberof ejScroller
* @instance
*/
        enable: function () {
            var scroller = this.element.find(".e-vscrollbar,.e-hscrollbar,.e-vscroll,.e-hscroll,.e-vhandle,.e-hhandle,.e-vscroll .e-icon,.e-hscroll .e-icon");
            if (scroller.hasClass("e-disable")) {
                scroller.removeClass("e-disable").attr({ "aria-disabled": false });
                this.model.enabled = true;
            }
            if(this._vScrollbar)
                this._vScrollbar._enabled = this.model.enabled;
            if(this._hScrollbar)
                this._hScrollbar._enabled = this.model.enabled;
        },
        /**
* User disables the Scroller control at any time.		
* @return jQuery
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* $('#scrollcontent').ejScroller(); 	
* // To disable the Scroller control at any time.
* var scrollerObj  = $("#scrollcontent").data("ejScroller");
* scrollerObj.disable(); // disable the Scroller control at any time
* &lt;/script&gt;
* @example 
* &lt;div id="scrollcontent" style="width:900px;" &gt;
*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;
         *&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
*&lt;/div&gt; <br> 
* &lt;script&gt;
* $('#scrollcontent').ejScroller(); 	
* // disable the scroller control
* $("#scrollcontent").ejScroller("disable");	
* &lt;/script&gt;
* @memberof ejScroller
* @instance
*/
        disable: function () {
            var scroller = this.element.find(".e-vscrollbar,.e-hscrollbar,.e-vscroll,.e-hscroll,.e-vhandle,.e-hhandle,.e-vscroll .e-icon,.e-hscroll .e-icon");
            scroller.addClass("e-disable").attr({ "aria-disabled": true });
            this.model.enabled = false;
            if (this._vScrollbar)
                this._vScrollbar._enabled = this.model.enabled;
            if (this._hScrollbar)
                this._hScrollbar._enabled = this.model.enabled;
        },
        /**
* Updates top value based on scroller movement
* @private
*/
        _changeTop: function (d, step, source) {
            var start = this.model.targetPane != null && d.dimension != "height" ? this.content().find(this.model.targetPane)[d.scrollVal]() : this.content()[d.scrollVal](), t;

            if (d.dimension == "height" && start == 0)
                start = this.scrollTop() != 0 ? this.scrollTop() : 0;
            t = start + step;
            if (!d.enableRTL ? t > d.scrollable : t < d.scrollable) t = d.scrollable;
            if (!d.enableRTL ? t < 0 : t > 0) t = 0;

            if (t !== start) {
                this["scroll" + d.xy](t, true, "",source);
                if (d.xy === "X" && !ej.isNullOrUndefined(this._hScrollbar))
                    this._hScrollbar["scroll"](t, source, true);
                else if(!ej.isNullOrUndefined(this._vScrollbar))
                    this._vScrollbar["scroll"](t, source, true);
            }

            return t !== start;
        },
        /**
* To handle scroll based on movement via mouse wheel
* @private
*/
        _mouseWheel: function (e) {           
            if (!e.data || !this.model.enabled) return;
            var delta = 0, data = e.data.d, ori = e;
            e = e.originalEvent;
            if (e.wheelDelta) {
                delta = -e.wheelDelta / 120;
                if (window.opera) {
                    if (parseFloat(window.opera.version, 10) < 10)
                        delta = -delta;
                }
            } else if (e.detail) delta = e.detail / 3;

            if (!delta) return;

            if (this._changeTop(data, delta * data.scrollOneStepBy, "wheel")) {
                e.preventDefault ? e.preventDefault() : ori.preventDefault();
                ori.stopImmediatePropagation();
                ori.stopPropagation();
            }
            else
                this._trigger("scrollEnd", { originalEvent: e, scrollData: ori });
        },
        _scrollerHover: function (e) {
            if (e.type == "mouseenter" && !this.content().siblings().is(":visible")) 
                this.content().siblings().css("display","block");
            else if(e.type == "mouseleave") 
                this.content().siblings().hide();
        },
        /**
* To handle mouse up movement
* @private
*/
        _mouseUp: function (e) {
            if (!e.data) return;

            var d = e.data.d;

            if (e.type === "mouseup" || e.type === "touchend" || (!e.toElement && !e.relatedTarget)) {
                this._off($(document), "mousemove touchmove");
                $(document).off("mouseout mouseup touchend", ej.proxy(this._mouseUp, this));
                d.fromScroller = false;
                if (e.data.source === "thumb" && !ej.isNullOrUndefined(this.model)) {
                    $.when(this.content()).done(ej.proxy(function () {
                        this._trigger("thumbEnd", { originalEvent: e, scrollData: d });
                    }, this));
                }
            }
            d.up = true;
        },
        /**
* To handle mouse down movement on content
* @private
*/
        _mouseDownOnContent: function (down) {
            if (!this.model.enabled) return;
            var d = down.data.d;
			if(this._trigger("thumbStart", { originalEvent: down, scrollData: d }))
				return;
            
            if( down.which ==3 && down.button == 2 ) return;
            d.fromScroller = true;

            var prevY = null, skip = 1, min = 5, direction;

            this._on($(document), "mousemove touchmove", (function (move) {
                move.preventDefault();
                var pageXY = move.type == "mousemove" ? move[d.clientXy] : move.originalEvent.changedTouches[0][d.clientXy];

                if (prevY && pageXY !== prevY) {
                    var diff = pageXY - prevY, sTop = this.model[d.scrollVal] - (diff * d.onePx / min);
                    
                    if (skip == 1 && Math.abs(diff) > min) {
                        direction = d.position;
                        skip = 0;
                    }
                    if (skip == 0) prevY = pageXY;

                    if (sTop >= 0 && sTop <= d.scrollable && direction === d.position) {
                        this["scroll" + d.xy](sTop, true,"", "thumb");
                        if (d.xy === "X")
                            this._hScrollbar["scroll"](sTop, "thumb", true);
                        else if(!ej.isNullOrUndefined(this._vScrollbar))
                            this._vScrollbar["scroll"](sTop, "thumb", true);
                        this.content().css("cursor", "pointer");
                        this._trigger("thumbMove", { originalEvent: move, scrollData: d });
                    }
                }
                if (prevY == null) prevY = pageXY;
            }));

            $(document).one("mouseup touchend", { d: d, source: "thumb" }, ej.proxy(this._mouseUp, this));
            $(document).mouseout({ d: d, source: "thumb" }, ej.proxy(this._mouseUp, this));
        },

        /**
* To handle scroll movement
* @private
*/
        _scroll: function (e) {
            var dS = [this._vScrollbar ? this._vScrollbar._scrollData : null, this._hScrollbar ? this._hScrollbar._scrollData : null];
			
			for (var i = 0; i < 2; i++) {
				var d = dS[i];
				if (!d || d.skipChange) continue;

				if (this.model.targetPane != null && i == 1)
					d.sTop = this.content().find(this.model.targetPane)[0][d.scrollVal];
				else
					d.sTop = e.target[d.scrollVal];
				this[d.scrollVal](d.sTop);
				if (d.fromScroller) return;
				if (i === 1) {
					var content = this.content()[0];
					if(this._rtlScrollLeftValue && content.scrollWidth - content.clientWidth != this._rtlScrollLeftValue)
						this._rtlScrollLeftValue = content.scrollWidth - content.clientWidth;
					d.sTop = (ej.browserInfo().name != "mozilla" && this.model.enableRTL) ? (this._rtlScrollLeftValue == 0 ? (d.sTop * -1) : (d.sTop - this._rtlScrollLeftValue)) : d.sTop;
					this._hScrollbar["scroll"](d.sTop, "", true);
				} else
					this._vScrollbar["scroll"](d.sTop, "", true);
			}
        },
        /**
* Changes the vertical handler position	
* @private
*/
        _changevHandlerPosition: function (top) {
            var scrollbar = this._vScrollbar;
            if (scrollbar) {
                top = scrollbar._scrollData != null && top >= scrollbar._scrollData.scrollable ? scrollbar._scrollData.scrollable : top;
                if (scrollbar != null && top >= 0 && top <= scrollbar._scrollData.scrollable)
                    scrollbar[scrollbar._scrollData.handler].css(scrollbar._scrollData.lPosition, (top / scrollbar._scrollData.onePx) + "px");
            }
        },
        /**
* Changes the horizontal handler position	
* @private
*/
        _changehHandlerPosition: function (left) {
            var scrollbar = this._hScrollbar;
            if (scrollbar) {
                left = scrollbar._scrollData != null && left >= scrollbar._scrollData.scrollable ? scrollbar._scrollData.scrollable : left;
                if (scrollbar != null && top >= 0 && left <= scrollbar._scrollData.scrollable)
                    scrollbar[scrollbar._scrollData.handler].css(scrollbar._scrollData.lPosition, (left / scrollbar._scrollData.onePx) + "px");
            }
        },
        /**
		* destroy the Scroller control
		* all events bound using this._on will be unbind automatically and bring the control to pre-init state.
		* @alias destroy
		* @return jQuery
		* @example 
		* &lt;div id="scrollcontent" style="width:900px;" &gt;
		*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;&lt;li&gt;
        *&lt;b&gt;A controller&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
		*&lt;/ul&gt; 
		*&lt;/div&gt; <br> 
		* &lt;script&gt;
		* $('#scrollcontent').ejScroller(); 	
		* // Destroy Scroller
		* var scrollerObj  = $("#scrollcontent").data("ejScroller");
		* scrollerObj.destroy(); // destroy the scroller
		* &lt;/script&gt;
		* @example 
		* &lt;div id="scrollcontent" style="width:900px;" &gt;
		*&lt;p&gt;Model–view–controller (MVC) is a software architecture pattern which separates the
        * representation of information from the user's interaction with it.
        * The model consists of application data, business rules, logic, and functions. A view can be any
        * output representation of data, such as a chart or a diagram. Multiple views of the same data 
        * are possible, such as a bar chart for management and a tabular view for accountants. 
        *The controller mediates input, converting it to commands for the model or view.The central 
        *ideas behind MVC are code reusability and n addition to dividing the application into three 
        *kinds of components, the MVC design defines the interactions between them.</p>
        *&lt;ul&gt;*&lt;li&gt;
        *&lt;b&gt;A controller*&lt;/b&gt;can send commands to its associated view to change the view's presentation of the model (e.g., by scrolling through a document). 
        *It can also send commands to the model to update the model's state (e.g., editing a document).
        *&lt;/li&gt;
        *&lt;/ul&gt; 
		*&lt;/div&gt; <br> 
		* &lt;script&gt;
		* $('#scrollcontent').ejScroller(); 	
		* // destroy the scroller
		* $("#scrollcontent").ejScroller("destroy");	
		* &lt;/script&gt;
		* @memberof ejScroller
		* @instance
		*/
        _destroy: function () {
            this.element.css({ "width": "", "height": "" }).find(".e-vscrollbar,.e-hscrollbar").remove();
            this.content().removeClass("e-content").css({ "width": "", "height": "" });
        }
    });
})(jQuery, Syncfusion, window);