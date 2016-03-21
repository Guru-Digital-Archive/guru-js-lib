/* global dateFormat: true */
/* global responsiveHelper: true */
/* global debugHelper: true */
/* exported dateFormat */
/* exported responsiveHelper */
/* exported debugHelper */
var dateFormat;
(function (dateFormat) {
    "use strict";
    function convert(format, sourceRules, destRules) {
        if (sourceRules === destRules) {
            return format;
        }
        var result = "";
        var index = 0;
        var destTokens = getTokens(destRules);
        var sourceMap = getTokenMap(getTokens(sourceRules));
        while (index < format.length) {
            var part = locateNextToken(sourceRules, format, index);
            if (part.literal.length > 0) {
                result += destRules.MakeLiteral(part.literal);
            }
            if (part.token.length > 0) {
                result += destTokens[sourceMap[part.token]];
            }
            index = part.nextBegin;
        }

        return result;
    }
    dateFormat.convert = convert;
    function locateNextToken(rules, format, begin) {
        var literal = "";
        var index = begin;
        var sequence = getTokenSequence(getTokenMap(getTokens(rules)));
        var filter = function (x) {
            return format.indexOf(x, index) === index;
        };
        while (index < format.length) {
            var escaped = rules.ReadEscapedPart(format, index);
            if (escaped.length > 0) {
                literal += escaped.value;
                index += escaped.length;
                continue;
            }

            var token = sequence.first(filter);
            if (!token) {
                literal += format.charAt(index);
                index++;
                continue;
            }

            return {
                token: token,
                literal: literal,
                nextBegin: index + token.length
            };
        }

        return {
            token: "",
            literal: literal,
            nextBegin: index
        };
    }

    function getTokens(rules) {
        return [
            rules.DayOfMonthShort,
            rules.DayOfMonthLong,
            rules.DayOfWeekShort,
            rules.DayOfWeekLong,
            rules.DayOfYearShort,
            rules.DayOfYearLong,
            rules.MonthOfYearShort,
            rules.MonthOfYearLong,
            rules.MonthNameShort,
            rules.MonthNameLong,
            rules.YearShort,
            rules.YearLong,
            rules.AmPm,
            rules.Hour24Short,
            rules.Hour24Long,
            rules.Hour12Short,
            rules.Hour12Long,
            rules.MinuteShort,
            rules.MinuteLong,
            rules.SecondShort,
            rules.SecondLong,
            rules.FractionalSecond1,
            rules.FractionalSecond2,
            rules.FractionalSecond3,
            rules.TimeZone,
            rules.UnixTimestamp
        ].map(function (x) {
            return x || "";
        });
    }

    function getTokenMap(tokens) {
        var map = {};
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token) {
                map[token] = i;
            }
        }
        return map;
    }

    function getTokenSequence(map) {
        var tokens = Object.keys(map);
        tokens.sort(function (a, b) {
            return b.length - a.length;
        });
        return tokens;
    }

    function indexOfAny(s, chars) {
        for (var i = 0; i < s.length; i++) {
            var c = s.charAt(i);
            for (var j = 0; j < chars.length; j++) {
                if (c === chars.charAt(j)) {
                    return i;
                }
            }
        }
        return -1;
    }

    dateFormat.standard = {
        DayOfMonthShort: "d",
        DayOfMonthLong: "dd",
        DayOfWeekShort: "ddd",
        DayOfWeekLong: "dddd",
        DayOfYearShort: "D",
        DayOfYearLong: "DD",
        MonthOfYearShort: "M",
        MonthOfYearLong: "MM",
        MonthNameShort: "MMM",
        MonthNameLong: "MMMM",
        YearShort: "yy",
        YearLong: "yyyy",
        AmPm: "tt",
        Hour24Short: "H",
        Hour24Long: "HH",
        Hour12Short: "h",
        Hour12Long: "hh",
        MinuteShort: "m",
        MinuteLong: "mm",
        SecondShort: "s",
        SecondLong: "ss",
        FractionalSecond1: "f",
        FractionalSecond2: "ff",
        FractionalSecond3: "fff",
        TimeZone: "Z",
        UnixTimestamp: "X",
        MakeLiteral: function (literal) {
            var reserved = "dDMytHhmsfZX";
            if (indexOfAny(literal, reserved) < 0) {
                return literal;
            }
            var result = "";
            for (var i = 0; i < literal.length; i++) {
                var c = literal.charAt(i);
                if (reserved.contains(c)) {
                    result += "\\";
                }
                result += c;
            }
            return result;
        },
        ReadEscapedPart: function (format, startIndex) {
            var result = "";
            var index = startIndex;
            while (index < format.length) {
                var c = format.charAt(index);
                if (c === "\\") {
                    result += index === format.length - 1 ? "\\" : format[++index];
                    index++;
                    continue;
                }
                break;
            }

            return {
                value: result,
                length: index - startIndex
            };
        }
    };
    dateFormat.dotNet = {
        DayOfMonthShort: "d",
        DayOfMonthLong: "dd",
        DayOfWeekShort: "ddd",
        DayOfWeekLong: "dddd",
        DayOfYearShort: null,
        DayOfYearLong: null,
        MonthOfYearShort: "M",
        MonthOfYearLong: "MM",
        MonthNameShort: "MMM",
        MonthNameLong: "MMMM",
        YearShort: "yy",
        YearLong: "yyyy",
        AmPm: "tt",
        Hour24Short: "H",
        Hour24Long: "HH",
        Hour12Short: "h",
        Hour12Long: "hh",
        MinuteShort: "m",
        MinuteLong: "mm",
        SecondShort: "s",
        SecondLong: "ss",
        FractionalSecond1: "f",
        FractionalSecond2: "ff",
        FractionalSecond3: "fff",
        TimeZone: "zzz",
        UnixTimestamp: null,
        MakeLiteral: function (literal) {
            var reserved = "dfFghHKmMstyz'\"";
            if (indexOfAny(literal, reserved) < 0) {
                return literal;
            }

            var result = "";
            for (var i = 0; i < literal.length; i++) {
                var c = literal.charAt(i);
                if (reserved.contains(c)) {
                    result += "\\";
                }
                result += c;
            }
            return result;
        },
        ReadEscapedPart: function (format, startIndex) {
            var result = "";
            var index = startIndex;
            while (index < format.length) {
                var c = format.charAt(index);
                if (c === "\\") {
                    result += index === format.length - 1 ? "\\" : format[++index];
                    index++;
                    continue;
                }

                if (c === "\"") {
                    while (++index < format.length) {
                        var cc = format.charAt(index);
                        if (cc === "\"") {
                            break;
                        }
                        if (cc === "\\") {
                            result += index === format.length - 1 ? "\\" : format[++index];
                        } else {
                            result += cc;
                        }
                    }
                    index++;
                    continue;
                }

                if (c === "\"") {
                    while (++index < format.length) {
                        var cc1 = format.charAt(index);
                        if (cc1 === "\"") {
                            break;
                        }
                        if (cc1 === "\\") {
                            result += index === format.length - 1 ? "\\" : format[++index];
                        } else {
                            result += cc1;
                        }
                    }
                    index++;
                    continue;
                }

                break;
            }

            return {
                value: result,
                length: index - startIndex
            };
        }
    };
    dateFormat.momentJs = {
        DayOfMonthShort: "D",
        DayOfMonthLong: "DD",
        DayOfWeekShort: "ddd",
        DayOfWeekLong: "dddd",
        DayOfYearShort: "DDD",
        DayOfYearLong: "DDDD",
        MonthOfYearShort: "M",
        MonthOfYearLong: "MM",
        MonthNameShort: "MMM",
        MonthNameLong: "MMMM",
        YearShort: "YY",
        YearLong: "YYYY",
        AmPm: "A",
        Hour24Short: "H",
        Hour24Long: "HH",
        Hour12Short: "h",
        Hour12Long: "hh",
        MinuteShort: "m",
        MinuteLong: "mm",
        SecondShort: "s",
        SecondLong: "ss",
        FractionalSecond1: "S",
        FractionalSecond2: "SS",
        FractionalSecond3: "SSS",
        TimeZone: "Z",
        UnixTimestamp: "X",
        MakeLiteral: function (literal) {
            var reserved = "MoDdeEwWYgGAaHhmsSzZX";
            literal = literal.replaceAll("[", "(").replaceAll("]", ")");
            if (indexOfAny(literal, reserved) < 0) {
                return literal;
            }
            return "[" + literal + "]";
        },
        ReadEscapedPart: function (format, startIndex) {
            if (format.charAt(startIndex) !== "[") {
                return {value: "", length: 0};
            }
            var result = "";
            var index = startIndex;
            while (index < format.length) {
                var c = format.charAt(index);
                if (c === "]") {
                    break;
                }

                result += c;
            }

            return {
                value: result,
                length: index - startIndex
            };
        }
    };
    dateFormat.datepicker = {
        DayOfMonthShort: "d",
        DayOfMonthLong: "dd",
        DayOfWeekShort: "D",
        DayOfWeekLong: "DD",
        DayOfYearShort: "o",
        DayOfYearLong: "oo",
        MonthOfYearShort: "m",
        MonthOfYearLong: "mm",
        MonthNameShort: "M",
        MonthNameLong: "MM",
        YearShort: "y",
        YearLong: "yy",
        AmPm: null,
        Hour24Short: null,
        Hour24Long: null,
        Hour12Short: null,
        Hour12Long: null,
        MinuteShort: null,
        MinuteLong: null,
        SecondShort: null,
        SecondLong: null,
        FractionalSecond1: null,
        FractionalSecond2: null,
        FractionalSecond3: null,
        TimeZone: null,
        UnixTimestamp: "@",
        MakeLiteral: function (literal) {
            var reserved = "dDomMy@'";
            if (indexOfAny(literal, reserved) < 0) {
                return literal;
            }
            return "\"" + literal.replaceAll("\"", "\"\"") + "\"";
        },
        ReadEscapedPart: function (format, startIndex) {
            if (format.charAt(startIndex) !== "'") {
                return {value: "", length: 0};
            }
            var result = "";
            var index = startIndex;
            while (++index < format.length) {
                var c = format.charAt(index);
                if (c === "'") {
                    index++;
                    if (index === format.length) {
                        break;
                    }
                    if (format[index] === "'") {
                        result += c;
                    } else {
                        break;
                    }
                } else {
                    result += c;
                }
            }

            return {
                value: result,
                length: index - startIndex
            };
        }
    };
    dateFormat.timepicker = {
        DayOfMonthShort: null,
        DayOfMonthLong: null,
        DayOfWeekShort: null,
        DayOfWeekLong: null,
        DayOfYearShort: null,
        DayOfYearLong: null,
        MonthOfYearShort: null,
        MonthOfYearLong: null,
        MonthNameShort: null,
        MonthNameLong: null,
        YearShort: null,
        YearLong: null,
        AmPm: "TT",
        Hour24Short: "H",
        Hour24Long: "HH",
        Hour12Short: "h",
        Hour12Long: "hh",
        MinuteShort: "m",
        MinuteLong: "mm",
        SecondShort: "s",
        SecondLong: "ss",
        FractionalSecond1: null,
        FractionalSecond2: null,
        FractionalSecond3: "l",
        TimeZone: "Z",
        UnixTimestamp: null,
        MakeLiteral: function (literal) {
            var reserved = "HhmslctTzZ'";
            if (indexOfAny(literal, reserved) < 0) {
                return literal;
            }
            return "\"" + literal.replaceAll("\"", "\"") + "\"";
        },
        ReadEscapedPart: function (format, startIndex) {
            if (format.charAt(startIndex) !== "'") {
                return {value: "", length: 0};
            }
            var result = "";
            var index = startIndex;
            while (++index < format.length) {
                var c = format.charAt(index);
                if (c === "'") {
                    index++;
                    if (index === format.length) {
                        break;
                    }
                    if (format.charAt(index) === "'") {
                        result += c;
                    } else {
                        break;
                    }
                } else {
                    result += c;
                }
            }

            return {
                value: result,
                length: index - startIndex
            };
        }
    };
    dateFormat.php = {
        DayOfMonthShort: "j",
        DayOfMonthLong: "d",
        DayOfWeekShort: "D",
        DayOfWeekLong: "l",
        DayOfYearShort: "z",
        DayOfYearLong: null,
        MonthOfYearShort: "n",
        MonthOfYearLong: "m",
        MonthNameShort: "M",
        MonthNameLong: "F",
        YearShort: "y",
        YearLong: "Y",
        AmPm: "A",
        Hour24Short: "G",
        Hour24Long: "H",
        Hour12Short: "g",
        Hour12Long: "h",
        MinuteShort: "i",
        MinuteLong: "i",
        SecondShort: "s",
        SecondLong: "s",
        FractionalSecond1: null,
        FractionalSecond2: null,
        FractionalSecond3: null,
        TimeZone: "T",
        UnixTimestamp: "U",
        MakeLiteral: function (literal) {
            var reserved = "jdDlznmMFyYAGHghisTU";
            literal = literal.replaceAll("[", "(").replaceAll("]", ")");
            if (indexOfAny(literal, reserved) < 0) {
                return literal;
            }
            return "[" + literal + "]";
        },
        ReadEscapedPart: function (format, startIndex) {
            if (format.charAt(startIndex) !== "[") {
                return {value: "", length: 0};
            }
            var result = "";
            var index = startIndex;
            while (index < format.length) {
                var c = format.charAt(index);
                if (c === "]") {
                    break;
                }

                result += c;
            }

            return {
                value: result,
                length: index - startIndex
            };
        }
    };
})(dateFormat || (dateFormat = {}));
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (pattern, replacement) {
        "use strict";
        return this.split(pattern).join(replacement);
    };
}
if (!String.prototype.contains) {
    String.prototype.contains = function (needle) {
        "use strict";
        return this.indexOf(needle) >= 0;
    };
}
if (!Array.prototype.first) {
    Array.prototype.first = function (callback) {
        "use strict";
        if (!callback) {
            return this.length ? this[0] : null;
        }
        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            if (callback(item)) {
                return item;
            }
        }

        return null;
    };
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback, thisArg) {
        "use strict";

        var T, k;
        if (this === null) {
            throw new TypeError("this is null or not defined");
        }

// 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(this);
        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;
        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== "function") {
            throw new TypeError(callback + " is not a function");
        }

// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }

// 6. Let k be 0
        k = 0;
        // 7. Repeat, while k < len
        while (k < len) {

            var kValue;
            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

// i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                kValue = O[k];
                // ii. Call the Call internal method of callback with T as the this value and
                // argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
            }
// d. Increase k by 1.
            k++;
        }
// 8. return undefined
    };
}

(function ($) {
    "use strict";
    if (!Array.prototype.map) {
        Array.prototype.map = function (callback) {
            return $.map(this, callback);
        };
    }
    if (!Array.prototype.filter) {
        Array.prototype.filter = function (callback) {
            return $.grep(this, callback);
        };
    }
    if (!Array.prototype.inArray) {
        Array.prototype.inArray = function (needle) {
            return $.inArray(needle, this) !== -1;
        };
    }
})(jQuery);
if (!Array.prototype.select) {
    Array.prototype.select = function (expr) {
        "use strict";
        return this.map(expr);
    };
}
if (!Array.prototype.where) {
    Array.prototype.where = function (filter) {
        "use strict";

        var collection = this, result = [];
        switch (typeof filter) {

            case "function":
                result = collection.filter(filter);
                break;
            case "object":
                var compareFunc = function (item) {
                    return item[property] === filter[property];
                };
                for (var property in filter) {
                    if (!filter.hasOwnProperty(property)) {
                        continue; // ignore inherited properties
                    }
                    collection = collection.filter(compareFunc);
                }
                result = collection.slice(0); // copy the array (in case of empty object filter)
                break;
            default:
                throw new TypeError("func must be either a function or an object of properties and values to filter by");
        }
        return result;
    };
}

if (!Array.prototype.firstOrDefault) {
    Array.prototype.firstOrDefault = function (callback, valueIfNone) {
        "use strict";
        valueIfNone = typeof valueIfNone === "undefined" ? null : valueIfNone;
        return this.where(callback)[0] || valueIfNone;
    };
}

if (typeof iframeform === "undefined") {
    var iframeform = function (url) {
        "use strict";
        var object = this;
        object.time = new Date().getTime();
        object.form = $("<form action='" + url + "' target='iframe" + object.time + "' method='post' style='display:none;' id='form" + object.time + "'></form>");
        object.frame = $("<iframe class='formframe' data-time='" + object.time + "' name='iframe" + object.time + "'></iframe>");
        object.addParameter = function (parameter, value) {
            $("<input type='hidden' />")
                    .attr("name", parameter)
                    .attr("value", value)
                    .appendTo(object.form);
        };
        window.addEventListener("message", function (e) {
            var action = e.data.action ? e.data.action : false,
                    noscroll = e.data.noscroll ? e.data.noscroll : false;
            object.frame.data("noscroll", noscroll);
            if (action === "setHeight" && e.data.height && object.frame.length) {
                object.frame.data("height", e.data.height);
                object.frame.trigger("iframeblock:loaded");
            } else if (action === "setLoading" && object.frame.length) {
                object.frame.data("loaded", false);
                object.frame.data("height", false);
                object.frame.trigger("iframeblock:unloaded");
            } else if (action === "setLoaded" && object.frame.length) {
                object.frame.data("loaded", true);
                object.frame.trigger("iframeblock:loaded");
            }
        });
        object.send = function () {
            $(".row.form-wrap").append(object.frame);
            $(".row.form-wrap").append(object.form);
            object.frame.on("iframeblock:loaded", function () {
                var height = object.frame.data("height"), loaded = object.frame.data("loaded");
                if (height && loaded) {
                    if (!object.frame.data("noscroll")) {
                        window.scrollTo(0, 0);
                    }
                    object.frame.height(height);
                    object.frame.parent().removeClass("iframe-loading");
                }
            });
            object.frame.on("iframeblock:unloaded", function () {
                object.frame.css({height: "auto"});
                object.frame.parent().addClass("iframe-loading");
            });
            object.form.submit();
            object.frame.load(function () {
                //If the frame hasnt loaded in 300ms, manually set the height
                setTimeout(function () {
                    if (!object.frame.data("loaded")) {
                        object.frame.data("height", 860);
                        object.frame.data("loaded", true);
                        object.frame.trigger("iframeblock:loaded");
                    }
                }, 300);
            });
        };
    };
}
if (typeof responsiveHelper === "undefined") {
    /**
     * Utilty class to assist with responsive design
     *
     * @type responsiveHelper
     */
    var responsiveHelper = (
        /**
         *
         * @param {jQuery} $ Current jQuery Instance
         * @param {window} window
         * @returns {responsiveHelper}
         */
        function ($, window) {
            "use strict";
            var
                    /**
                     * Ensures we only bind resize envents once
                     * @type Boolean
                     */
                    isSetup = false,
                    /**
                     * Timer ID for resize envent
                     * @type {Number}
                     */
                    resizeTimer = null,
                    /**
                     * Delay in milliseconds to fire events after the screen has resized<br/>
                     * To high and there will be a noticible delay.<br/>
                     * To low and resizing browser may become slow
                     * @type Number
                     */
                    resizeTimeout = 90;

            /**
             * Returns the current height and width of the viewport
             * @namespace responsiveHelper
             * @returns {responsiveHelper.viewport.result} The current height and width of the viewport
             */
            function viewport() {
                var element = window, property = "inner";
                if (!("innerWidth" in element)) {
                    property = "client";
                    element = document.documentElement || document.body;
                }

                /**
                 * The current height and width of the viewport
                 * @name result
                 * @namespace responsiveHelper.viewport
                 */
                var result = {
                    /**
                     * The current width of the viewport in pixels
                     * @type {Number}
                     */
                    width: parseInt(element[ property + "Width" ]),
                    /**
                     * The current height of the viewport in pixels
                     * @type {Number}
                     */
                    height: parseInt(element[ property + "Height" ])
                };
                return result;
            }

            /**
             * Get the current responsiveHelper.sizes.&#42; represnting the current screen size<br/><br/>
             * <strong>Requires</strong> responsiveHelper.init() to be called first to enable live updating.
             * @returns {responsiveHelper.sizes.xs|responsiveHelper.sizes.md|responsiveHelper.sizes.lg|responsiveHelper.sizes.sm}
             */
            function currentSize() {
                if (API.width <= API.sizes.xs) {
                    return API.sizes.xs;
                } else if (API.width <= API.sizes.sm) {
                    return API.sizes.sm;
                } else if (API.width <= API.sizes.md) {
                    return API.sizes.md;
                } else {
                    return API.sizes.lg;
                }
            }
            /**
             * Is the screen currently Large<br/><br/>
             * <strong>Requires</strong> responsiveHelper.init() to be called to enable live updating.
             * @returns {Boolean} True if responsiveHelper.width is larger than responsiveHelper.sizes.md
             */
            function isLG() {
                return API.width >= API.sizes.lg;
            }

            /**
             * Is the screen currently Medium<br/><br/>
             * <strong>Requires</strong> responsiveHelper.init() to be called to enable live updating.
             * @returns {Boolean} True if responsiveHelper.width is less or equal to responsiveHelper.sizes.md and larger than responsiveHelper.sizes.sm
             */
            function isMD() {
                return API.width >= API.sizes.md && API.width <= (API.sizes.lg - 1);
            }
            /**
             * Is the screen currently Small<br/><br/>
             * <strong>Requires</strong> responsiveHelper.init() to be called to enable live updating.
             * @returns {Boolean} True if responsiveHelper.width is less or equal to responsiveHelper.sizes.sm and larger than responsiveHelper.sizes.xs
             */
            function isSM() {
                return API.width >= API.sizes.sm && API.width <= (API.sizes.md - 1);
            }
            /**
             * Is the screen currently Extra Small<br/><br/>
             * <strong>Requires</strong> responsiveHelper.init() to be called to enable live updating.
             * @returns {Boolean} True if responsiveHelper.width is less or equal to responsiveHelper.sizes.xs
             */
            function isXS() {
                return API.width >= API.sizes.xs && API.width <= (API.sizes.sm - 1);
            }
            /**
             * Is the screen currently below Extra Small<br/><br/>
             * <strong>Requires</strong> responsiveHelper.init() to be called to enable live updating.
             * @returns {Boolean} True if responsiveHelper.width is less or equal to responsiveHelper.sizes.xs
             */
            function isXXS() {
                return API.width <= API.sizes.xs - 1;
            }
            /**
             * Enables live updating on screen resize
             * @returns {undefined}
             */
            function init() {
                if (!isSetup) {
                    $(window).resize(
                            function () {
                                if (resizeTimer) {
                                    clearTimeout(resizeTimer);
                                }
                                resizeTimer = setTimeout(API.reflow, resizeTimeout);
                            }
                    );
                    isSetup = true;
                }
            }
            /**
             * Recalculates the current screen width and hieght then fires the follow events:
             * <ul>
             * <li>responsive.width if the width has changed</li>
             * <li>responsive.height if the height has changed</li>
             * <li>responsive.change if the width or height has changed</li>
             * </ul>
             * <strong>Requires</strong> responsiveHelper.init() to be called to enable live updating and automatic event firing on screen resize.
             * @returns {undefined}
             */
            function reflow() {
                var size = API.viewport(), widthChanged = (size.width !== API.width), heightChanged = (size.height !== API.height);
                if (widthChanged) {
                    API.width = size.width;
                    $(API).trigger("responsive.width", API);
                }
                if (heightChanged) {
                    API.height = size.height;
                    $(API).trigger("responsive.height", API);
                }
                if (widthChanged || heightChanged) {
                    $(API).trigger("responsive.change", API);
                }
            }
            /**
             * Adds a debugging div to body.<br/>
             * <strong>Requires</strong> responsiveHelper.init() to be called to enable live updating.
             * @returns {jQuery}
             */
            function showDebugBox() {
                var debugBox = $(".responsive-helper-debug"), updateDebugBox = function (e, responsiveHelper) {
                    var text = "Unknown (currentSize=" + responsiveHelper.currentSize() + ", width=" + responsiveHelper.width + ")";
                    if (responsiveHelper.isLG()) {
                        text = "isLG";
                    } else if (responsiveHelper.isMD()) {
                        text = "isMD";
                    } else if (responsiveHelper.isSM()) {
                        text = "isSM";
                    } else if (responsiveHelper.isXS()) {
                        text = "isXS";
                    } else if (responsiveHelper.isXXS()) {
                        text = "isXXS";
                    }
                    debugBox.html(text);
                };
                if (!debugBox.length) {
                    debugBox = $("<div class='responsive-helper-debug'></div>");
                    debugBox.css({
                        position: "fixed",
                        "z-index": 99999,
                        top: 0,
                        left: 0,
                        background: "#fff",
                        display: "inline-block",
                        padding: "5px",
                        "-webkit-box-shadow": "-1px -1px 14px 3px rgba(50, 50, 50, 0.75)",
                        "box-shadow": "-1px -1px 14px 3px rgba(50, 50, 50, 0.75)"
                    });
                }
                $(API).on("responsive.width", updateDebugBox);
                $(function () {
                    debugBox.appendTo("body");
                    updateDebugBox({}, API);
                });
                return debugBox;
            }
            /**
             * Represents different screen size break points in pixels
             * @name sizes
             * @namespace responsiveHelper
             */
            var sizes = {
                /**
                 * Width in pixels at which the screen is considered Extra Small<br/>
                 * (Default 480)
                 * @type {Number}
                 */
                xs: 480,
                /**
                 * Width in pixels at which the screen is considered Small<br/>
                 * (Default 768)
                 * @type {Number}
                 */
                sm: 768,
                /**
                 * Width in pixels at which the screen is considered Medium<br/>
                 * (Default 992)
                 * @type {Number}
                 */
                md: 992,
                /**
                 * Width in pixels at which the screen is considered Large<br/>
                 * (Default 1200)
                 * @type {Number}
                 */
                lg: 1200
            };
            /**
             * @name responsiveHelper
             * @namespace responsiveHelper
             */
            var API = {
                /**
                 * Represents different screen size break points in pixels
                 * @type responsiveHelper.sizes
                 */
                sizes: sizes,
                /**
                 * Current screen width in pixels<br/>
                 * <strong>Requires</strong> responsiveHelper.init() to be called to enable live updating.
                 * @type {Number}
                 */
                width: 0,
                /**
                 * Current screen height in pixels<br/>
                 * <strong>Requires</strong> responsiveHelper.init() to be called to enable live updating.
                 * @type {Number}
                 */
                height: 0,
                currentSize: currentSize,
                viewport: viewport,
                init: init,
                showDebugBox: showDebugBox,
                reflow: reflow,
                isLG: isLG,
                isXS: isXS,
                isSM: isSM,
                isMD: isMD,
                isXXS: isXXS
            };

            API.reflow();
            return API;
        }(jQuery, window)
    );
}


if (typeof debugHelper === "undefined") {
    /**
     * Utilty class to assist debugging and testing
     *
     * @type debugHelper
     */
    var debugHelper = (
        /**
         *
         * @returns {debugHelper}
         */
        function () {
            "use strict";
            var mode = {
                /**
                 * Is the site in Dev mode<br/>
                 * (Default false)
                 * @type {boolean}
                 */
                dev: false,
                /**
                 * Is the site in Test mode<br/>
                 * (Default false)
                 * @type {boolean}
                 */
                test: false,
                /**
                 * Is the site in Live mode<br/>
                 * (Default false)
                 * @type {boolean}
                 */
                live: true
            };
            /**
             * @name debugHelper
             * @namespace debugHelper
             */
            var API = {
                /**
                 * List of modes, with the value of the current mode is true
                 * @type debugHelper.mode
                 */
                mode: mode,
                isDev: function () {
                    return API.mode.dev;
                },
                isTest: function () {
                    return API.mode.test;
                },
                isLive: function () {
                    return API.mode.live;
                },
                setMode: function (mode) {
                    API.mode.dev = /.*dev.*/i.test(mode);
                    API.mode.test = /.*test.*/i.test(mode);
                    API.mode.live = /.*live.*/i.test(mode);
                    if (!API.mode.live) {
                        if (console && console.log) {
                            this.log = console.log.bind(window.console);
                            ["error", "warn", "debug"].forEach(function (prop) {
                                if (typeof console[prop] === "function") {
                                    API[prop] = console[prop].bind(window.console);
                                } else {
                                    API[prop] = console.log.bind(window.console);
                                }
                            });
                        }

                    }
                },
                log: function () {},
                error: function () {},
                warn: function () {},
                debug: function () {}

            };
            API.setMode($("body").data("site-mode") ? $("body").data("site-mode") : "live");
            return API;
        }(jQuery, window)
    );
}
