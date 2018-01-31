"use strict";

(function (app) {
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
                    path: "/",
                    redirect: "events"
                },
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
        },
        {
            path: "/test",
            component: app.fwkUseRouteComponent({ id: "TestView" }),
            children: [
                {
                    path: "/",
                    redirect: "page1"
                },
                {
                    path: "page1",
                    component: app.fwkUseRouteComponent({ id: "TestPage1View", templateUrl: "html/test-page-view.html" }),
                },
                {
                    path: "page2",
                    component: app.fwkUseRouteComponent({ id: "TestPage2View", templateUrl: "html/test-page-view.html" }),
                }
            ]
        }
    ];
    const navigatorLang = navigator.language.split("-")[0];
    const locale = /(fr|en)/gi.test(navigatorLang) ? navigatorLang : "en";
    app.fwkBootstrapComponent({
        id: "MainView",
        routes: routes,
        locale: locale
    });
}(window.app || (window.app = {})));