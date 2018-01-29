"use strict";

(function (app) {
    // define common components

    // define common directives

    // bootstrap main component
    const routes = [
        {
            path: "/",
            redirect: "/home"
        },
        {
            path: "/home",
            component: app.fwkUseRouteComponent({ id: "HomeView" }),
            default: true
        },
        {
            path: "/test1",
            component: app.fwkUseRouteComponent({ id: "Test1View", templateUrl: "html/test-view.html" }),
            default: true
        },
        {
            path: "/test2",
            component: app.fwkUseRouteComponent({ id: "Test2View", templateUrl: "html/test-view.html" }),
            default: true
        },
        {
            path: "/login",
            component: app.fwkUseRouteComponent({ id: "LoginView", templateUrl: "html/sign-in-up-view.html" }),
            login: true
        },
        {
            path: "/register",
            component: app.fwkUseRouteComponent({ id: "RegisterView", templateUrl: "html/sign-in-up-view.html" })
        },
        {
            path: "/myspace",
            component: app.fwkUseRouteComponent({ id: "MySpaceView" }),
            default: true,
            secure: true,
            children: [
                {
                    path: "events",
                    component: app.fwkUseRouteComponent({ id: "EventsView" }),
                    secure: true
                },
                {
                    path: "profile",
                    component: app.fwkUseRouteComponent({ id: "ProfileView" }),
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