"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "EventsView" }, {
        data: function () {
            return {
                locale: app.fwkGetCurrentLocale(),
                selectedDate: sessionStorage.getItem("EventsView_selectedDate") || new Date().toISOString(),
                events: [],
                modal: false
            }
        },
        created: function () {
            this._refresh();
        },
        watch: {
            selectedDate: function () {
                this.modal = false;
                this._refresh();
            }
        },
        methods: {
            getIcon: function (type) {
                let icon = null;
                switch (type) {
                    case "BIRTHDAY": icon = "card_giftcard"; break;
                    default: icon = "note"; break;
                }
                return icon;
            },
            _refresh: function () {
                sessionStorage.setItem("EventsView_selectedDate", this.selectedDate);
                const request = Vue.http.get("/services/events?date=" + this.selectedDate);
                app.fwkCallService(request).then((response) => {
                    const events = response.body.data.events;
                    if (events.length == 0) {
                        events.push({ title: app.fwkGetLabel({ key: "LABEL_NOTHING_TO_NOTICE" }) })
                    }
                    this.events = events;
                });
            }
        }
    });
}(window.app || (window.app = {})));