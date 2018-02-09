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
        },
        {
            path: "/sign/:type",
            component: app.fwkUseRouteComponent({ id: "SignInUpView" }),
        },
        {
            path: "/myspace",
            component: app.fwkUseRouteComponent({ id: "MySpaceView" }),
            meta: {
                secure: true
            },
            children: [
                {
                    path: "/",
                    redirect: "events"
                },
                {
                    path: "events",
                    component: app.fwkUseRouteComponent({ id: "EventsView" }),
                    meta: {
                        secure: true
                    }
                },
                {
                    path: "profile",
                    component: app.fwkUseRouteComponent({ id: "ProfileView" }),
                    meta: {
                        secure: true
                    }
                }
            ]
        },
        {
            path: "/test",
            component: app.fwkUseRouteComponent({ id: "TestView" }),
            children: [
                {
                    path: "/",
                    redirect: "vue"
                },
                {
                    path: "vue",
                    component: app.fwkUseRouteComponent({ id: "TestVueView" })
                },
                {
                    path: "i18n",
                    component: app.fwkUseRouteComponent({ id: "TestI18nView" })
                },
                {
                    path: "ws",
                    component: app.fwkUseRouteComponent({ id: "TestWsView" })
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