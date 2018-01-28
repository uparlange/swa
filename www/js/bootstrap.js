"use strict";

(function (app) {
    const routes = [
        {
            path: "/",
            redirect: "/home"
        },
        {
            path: "/home",
            component: app.Fwk.manager.ComponentManager.define({ id: "HomeView" }),
            default: true
        },
        {
            path: "/login",
            component: app.Fwk.manager.ComponentManager.define({ id: "LoginView", templateUrl: "html/sign-in-up-view.html" }),
            login: true
        },
        {
            path: "/register",
            component: app.Fwk.manager.ComponentManager.define({ id: "RegisterView", templateUrl: "html/sign-in-up-view.html" })
        },
        {
            path: "/myspace",
            component: app.Fwk.manager.ComponentManager.define({ id: "MySpaceView" }),
            default: true,
            secure: true,
            children: [
                {
                    path: "events",
                    component: app.Fwk.manager.ComponentManager.define({ id: "EventsView" }),
                    secure: true
                },
                {
                    path: "profile",
                    component: app.Fwk.manager.ComponentManager.define({ id: "ProfileView" }),
                    secure: true
                }
            ]
        }
    ];
    app.Fwk.manager.ComponentManager.bootstrap({
        id: "MainView",
        routes: routes,
        locale: "en"
    });
}(window.app || (window.app = {})));