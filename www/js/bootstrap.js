"use strict";

(function (app) {
    const routes = [
        {
            path: "/",
            redirect: "/home"
        },
        {
            path: "/home",
            component: app.fwkDefineRouteComponent({ id: "HomeView" }),
            default: true
        },
        {
            path: "/login",
            component: app.fwkDefineRouteComponent({ id: "LoginView", templateUrl: "html/sign-in-up-view.html" }),
            login: true
        },
        {
            path: "/register",
            component: app.fwkDefineRouteComponent({ id: "RegisterView", templateUrl: "html/sign-in-up-view.html" })
        },
        {
            path: "/myspace",
            component: app.fwkDefineRouteComponent({ id: "MySpaceView" }),
            default: true,
            secure: true,
            children: [
                {
                    path: "events",
                    component: app.fwkDefineRouteComponent({ id: "EventsView" }),
                    secure: true
                },
                {
                    path: "profile",
                    component: app.fwkDefineRouteComponent({ id: "ProfileView" }),
                    secure: true
                }
            ]
        }
    ];
    app.fwkBootstrapComponent({
        id: "MainView",
        routes: routes,
        locale: "en"
    });
}(window.app || (window.app = {})));