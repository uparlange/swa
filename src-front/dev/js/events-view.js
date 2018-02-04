"use strict";

(function (app) {
    app.fwkDefineComponent({ id: "EventsView" }, {
        data: function () {
            return {
                locale: app.fwkGetCurrentLocale(),
                selectedDate: sessionStorage.getItem("EventsView_selectedDate") || new Date().toISOString().split("T")[0],
                events: [],
                selectDateDialogVisible: false,
                addUpdateEventDialogVisible: false,
                valid: true,
                currentEvent: {},
                iconRules: [
                    app.fwkGetFormUtils().requiredRule()
                ],
                titleRules: [
                    app.fwkGetFormUtils().requiredRule()
                ]
            }
        },
        created: function () {
            this._refresh();
        },
        watch: {
            selectedDate: function () {
                this.selectDateDialogVisible = false;
                this._refresh();
            }
        },
        methods: {
            add: function () {
                this.currentEvent = {
                    icon: "note",
                    title: "",
                    description: "",
                    date: this._getCurrentDateTimeISOString()
                };
                this.addUpdateEventDialogVisible = true;
            },
            edit: function (event) {
                this.currentEvent = event;
                this.addUpdateEventDialogVisible = true;
            },
            save: function () {
                if (this.$refs.form.validate()) {
                    const request = this.$http.put("/services/events", this.currentEvent);
                    app.fwkCallService(request).then(() => {
                        this.addUpdateEventDialogVisible = false;
                        this._refresh();
                    }, () => {
                        // TODO manage
                    });
                }
            },
            remove: function (event) {
                const request = this.$http.delete("/services/events?id=" + event._id);
                app.fwkCallService(request).then(() => {
                    this._refresh();
                }, () => {
                    // TODO manage
                });
            },
            _getCurrentDateTimeISOString: function () {
                const now = new Date();
                const selectedDate = new Date(this.selectedDate);
                selectedDate.setHours(now.getHours());
                selectedDate.setMinutes(now.getMinutes());
                selectedDate.setSeconds(now.getSeconds());
                return selectedDate.toISOString();
            },
            _refresh: function () {
                sessionStorage.setItem("EventsView_selectedDate", this.selectedDate);
                const request = this.$http.get("/services/events?date=" + this.selectedDate);
                app.fwkCallService(request).then((response) => {
                    this.events = response.body.data.events;
                }, () => {
                    // TODO manage
                });
            }
        }
    });
}(window.app || (window.app = {})));