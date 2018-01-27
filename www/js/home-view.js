"use strict";

(function (app) {
    app.HomeView = {
        data: function () {
            return {
                groups: [
                    {
                        labelKey: "LABEL_CLIENT",
                        items: [
                            { link: "https://vuejs.org/", image: "/images/stack/vuejs.png", description: "Vue.js" },
                            { link: "https://vuetifyjs.com/", image: "/images/stack/vuetify.png", description: "Vuetify" }
                        ]
                    },
                    {
                        labelKey: "LABEL_MIDDLEWARE",
                        items: [
                            { link: "https://github.com/auth0/node-jsonwebtoken", image: "/images/stack/jwt.png", description: "JSON Web Tokens" },
                            { link: "http://www.passportjs.org/", image: "/images/stack/passportjs.png", description: "Passport" },
                            { link: "http://expressjs.com/", image: "/images/stack/expressjs.png", description: "Express" },
                            { link: "https://nodejs.org", image: "/images/stack/nodejs.png", description: "Node.js" }
                        ]
                    },
                    {
                        labelKey: "LABEL_DATABASE",
                        items: [
                            { link: "https://pouchdb.com/", image: "/images/stack/pouchdb.png", description: "PouchDB" }
                        ]
                    }
                ]
            }
        }
    };
}(window.app || (window.app = {})));