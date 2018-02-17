"use strict";
onmessage = function (event) {
    const appender = console;
    appender[event.data.methodName](event.data.className, event.data.message);
};