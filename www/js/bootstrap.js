"use strict";

(function (app) {
    const routes = [
        { path: "/", redirect: "/home" },
        { path: "/home", component: app.Fwk.util.ComponentUtils.getComponent("HomeView") },
        { path: "/login", component: app.Fwk.util.ComponentUtils.getComponent("LoginView"), login: true },
        {
            path: "/myspace", component: app.Fwk.util.ComponentUtils.getComponent("MySpaceView"), secure: true, children: [
                { path: "events", component: app.Fwk.util.ComponentUtils.getComponent("EventsView"), secure: true },
                { path: "profile", component: app.Fwk.util.ComponentUtils.getComponent("ProfileView"), secure: true }
            ]
        }
    ]
    app.Fwk.util.ComponentUtils.bootstrap({
        id: "MainView",
        routes: routes,
        locale: "en"
    });
}(window.app || (window.app = {})));