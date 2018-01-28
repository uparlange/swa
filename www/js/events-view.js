"use strict";

(function (app) {
    app.Fwk.manager.ComponentManager.register("EventsView", {
        data: function () {
            return {
                locale: this.fwkGetCurrentLocale(),
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
                this.fwkCallService(request).then((response) => {
                    const events = response.body.data.events;
                    if (events.length == 0) {
                        events.push({ title: this.fwkGetLabel({ key: "LABEL_NOTHING_TO_NOTICE" }) })
                    }
                    this.events = events;
                });
            }
        }
    });
}(window.app || (window.app = {})));