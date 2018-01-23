const HomeView = Fwk.util.ComponentUtils.getComponent("home-view", {
    data: function () {
        return {
            groups: [
                {
                    labelKey: "LABEL_CLIENT",
                    items: [
                        { link: "https://vuejs.org/", image: "/images/vuejs.png", description: "Vue.js" },
                        { link: "https://vuetifyjs.com/", image: "/images/vuetify.png", description: "Vuetify" }
                    ]
                },
                {
                    labelKey: "LABEL_MIDDLEWARE",
                    items: [
                        { link: "https://github.com/auth0/node-jsonwebtoken", image: "/images/jwt.png", description: "JSON Web Tokens" },
                        { link: "http://www.passportjs.org/", image: "/images/passportjs.png", description: "Passport" },
                        { link: "http://expressjs.com/", image: "/images/expressjs.png", description: "Express" },
                        { link: "https://nodejs.org", image: "/images/nodejs.png", description: "Node.js" }
                    ]
                },
                {
                    labelKey: "LABEL_DATABASE",
                    items: [
                        { link: "https://pouchdb.com/", image: "/images/pouchdb.png", description: "PouchDB" }
                    ]
                }
            ]
        }
    }
});

const LoginView = Fwk.util.ComponentUtils.getComponent("login-view", {
    data: function () {
        return {
            login: "",
            password: "",
            errorCode: ""
        }
    },
    methods: {
        authenticate: function () {
            if (this.login.length > 0 && this.password.length > 0) {
                this.errorCode = "";
                Fwk.manager.SecurityManager.logIn(this.login, this.password).then((response) => {
                    // Nothing
                }, (response) => {
                    this.errorCode = response.body.code;
                })
            }
        }
    }
});

const ProfileView = Fwk.util.ComponentUtils.getComponent("profile-view", {
    data: function () {
        return {

        }
    },
    created: function () {
        const request = this.$http.get("/services/profile", {
            headers: {
                "Authorization": "Bearer " + Fwk.manager.SecurityManager.getToken()
            }
        })
        Fwk.util.HttpUtils.call(request).then((response) => {
            this.profile = response.body;
        });
    },
    methods: {
        logOut: function () {
            Fwk.manager.SecurityManager.logOut();
        }
    }
});

const MySpaceView = Fwk.util.ComponentUtils.getComponent("myspace-view", {
    data: function () {
        return {
            locale: Fwk.manager.I18nManager.getLocale(),
            selectedDate: new Date().toISOString(),
            events: []
        }
    },
    created: function () {
        this.refresh();
    },
    watch: {
        selectedDate: function (newVal, oldVal) {
            this.refresh();
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
        refresh: function () {
            const request = this.$http.get("/services/events?date=" + this.selectedDate, {
                headers: {
                    "Authorization": "Bearer " + Fwk.manager.SecurityManager.getToken()
                }
            })
            Fwk.util.HttpUtils.call(request).then((response) => {
                this.events = response.body;
            });
        }
    }
});

const MainView = new Vue({
    i18n: Fwk.manager.I18nManager.initialize(),
    router: new VueRouter({
        routes: [
            { path: "/", redirect: "/home" },
            { path: "/home", component: HomeView },
            { path: "/login", component: LoginView },
            {
                path: "/myspace", component: MySpaceView, beforeEnter: (to, from, next) => {
                    next((Fwk.manager.SecurityManager.getToken() == null) ? "/login" : undefined);
                }
            },
            {
                path: "/profile", component: ProfileView, beforeEnter: (to, from, next) => {
                    next((Fwk.manager.SecurityManager.getToken() == null) ? "/login" : undefined);
                }
            }
        ]
    }),
    data: function () {
        return {
            profile: "",
            drawer: null,
            loading: false
        }
    },
    created: function () {
        Fwk.manager.EventManager.on("", (user) => {
            this.profile = user.firstName + " " + user.lastName;
            this.$router.push("/myspace");
        });
        Fwk.manager.EventManager.on("FWK_LOGGED_IN", (user) => {
            this.profile = user.firstName + " " + user.lastName;
            this.$router.push("/myspace");
        });
        Fwk.manager.EventManager.on("FWK_SESSION_TIMED_OUT", () => {
            this.profile = "";
            this.$router.push("/login");
        });
        Fwk.manager.EventManager.on("FWK_LOGGED_OUT", () => {
            this.profile = "";
            this.$router.push("/home");
        });
        Fwk.manager.EventManager.on("FWK_RESOURCE_LOADING_START", () => {
            this.loading = true;
        });
        Fwk.manager.EventManager.on("FWK_RESOURCE_LOADING_STOP", () => {
            this.loading = false;
        });
    },
    methods: {
        showProfileView: function () {
            this.$router.push("/profile");
        },
        showMySpaceView: function () {
            this.$router.push("/myspace");
        },
        showHomeView: function () {
            this.$router.push("/home");
        }
    }
}).$mount("#main-view");