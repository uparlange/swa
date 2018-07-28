/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [["/","27cd381b77bebb57836fb2d1b1136be3"],["/app-cache","c5c2f7fef62f604f53dfe9173e61fe0c"],["/css/application.css","e425bd4cba5fc2f77c5786e5e9dbe5c1"],["/data/i18n/en.json","ef8c9eb33e872f12bcc88b349c101087"],["/data/i18n/fr.json","f7c2f897a8bceb20fe03512d31c8c212"],["/html/events-view.html","a4b36f3f4dd662dac41274b1b9123184"],["/html/home-view.html","f0c1ea417c13cffe37854ddc28609021"],["/html/main-view.html","aa1cdd671d1763347415f066b43abf97"],["/html/my-space-view.html","98c1a29d6018e9aeee995b0502680bca"],["/html/profile-view.html","6b7b178609fc812ae93ef9a9596a50f8"],["/html/sign-in-up-view.html","d63ea783f4a71809cc41d1065aab6323"],["/html/test-component.html","89aa6eff586914820761bebb90b8cd8f"],["/html/test-i18n-view.html","54bc56bd166b6b88344e343dbd434689"],["/html/test-view.html","d1bb7b9e424dab3db1930fece3cc44a3"],["/html/test-vue-view.html","90543d7cf79a9bf56c5e7af0a53d8a5e"],["/html/test-ws-view.html","751bbf365f2828f10cde5c2f5017167a"],["/images/favicon/android-chrome-192x192.png","6c5a55b9dd442b919493f72199f7a40d"],["/images/favicon/android-chrome-512x512.png","e073363e9c7303928d0a24efd1595ae3"],["/images/favicon/apple-touch-icon.png","e1e6c33b0baaf113e544447dccf2e013"],["/images/favicon/browserconfig.xml","5971ae92ee5ee3f8a4fd4e06b81098e2"],["/images/favicon/favicon-16x16.png","2b33cd2b96139882891d6635232e8c06"],["/images/favicon/favicon-32x32.png","600b869ac6bbf3530c202062a2a1055e"],["/images/favicon/favicon.ico","c48908d165352b4fa5f371da7b657301"],["/images/favicon/mstile-150x150.png","7b196e4dc45c36e078ec7055697f01b6"],["/images/favicon/safari-pinned-tab.svg","2b8b3a0ece3186f03c154990f52133e1"],["/images/favicon/site.webmanifest","f487a6f02e277c6cf804097c386f278e"],["/images/splash/launch-1125x2436.png","489cbd3ae23dd8b303f4f4d1bfc1f266"],["/images/splash/launch-1242x2148.png","48913c05b9b696248975ef3b611ae254"],["/images/splash/launch-1536x2048.png","01f40106054079dae6a78c4550d4a318"],["/images/splash/launch-1668x2224.png","8142d23d3322228e4c4f4b43b177f277"],["/images/splash/launch-2048x2732.png","e54767d7f87234678f8b28a7ebe91285"],["/images/splash/launch-640x1136.png","1cdde1343e35e4965d3083371e8b93da"],["/images/splash/launch-750x1294.png","35bc4c37e4e5e73f48bf0068dd709812"],["/images/stack/expressjs.png","2fb502b7c9aee3b5d2643523bf5dadc1"],["/images/stack/jwt.png","9b122b51ded2524e97d6ba21411c0edf"],["/images/stack/nodejs.png","6c7afd806c4742fa6e3c5559fe480efe"],["/images/stack/passportjs.png","f5456db84ebe338776e7975d8d2d4353"],["/images/stack/pouchdb.png","c6b7a10370c0164b7acca18109ccd446"],["/images/stack/vuejs.png","bf38f8c435f27a9026eda7e89a7325e3"],["/images/stack/vuetify.png","3051f817c4e07d91891cd3aaf2f54174"],["/js/application.js","62e6fbb14ec811e4030ed9582e8810cf"],["/js/bootstrap.js","1801351223514b2bc059c3d243dbf9f1"],["/js/events-view.js","75415f3652727ee3742319740ae5a825"],["/js/fwk-logger-worker.js","4eba79710e4629eff040d5499868397c"],["/js/fwk.js","d00ea9ea1c87cb2e3cfe3767ff0a2771"],["/js/home-view.js","7a48e59fbd81a0580aa11c0003f807f5"],["/js/main-view.js","70cfb2d9b7e9532037bbf57f68b8875b"],["/js/my-space-view.js","7a99ffbe74e1f526896fbbcb97a39e9c"],["/js/profile-view.js","ef5ff584f4c353c61ef423480f90b3c7"],["/js/sign-in-up-view.js","e6538e264f1d835635632a232a9861fa"],["/js/test-component.js","8b60097c6d7ea1bac1c67dabaf1001f3"],["/js/test-i18n-view.js","deceb987308538594ea7abbe00cbbe51"],["/js/test-view.js","a7e80cda065ceefb5c3043115a1fe83c"],["/js/test-vue-view.js","108c564a1905363885ee7dff551374f8"],["/js/test-ws-view.js","089a168c3b147107120f2af403205352"],["/vendors/MaterialIcons-Regular.eot","60344265b77448dbf4c84282b2dfdb43"],["/vendors/MaterialIcons-Regular.ttf","1f5a40f74b2f99906eb203837f257eac"],["/vendors/MaterialIcons-Regular.woff","506d840d292e37eb27336ff9cc4a9352"],["/vendors/MaterialIcons-Regular.woff2","2284f262ff98f4ca32c8caeb042e3246"],["/vendors/socket.io.js","8606773bb85114c04c5bec27bf55ef64"],["/vendors/vue-i18n.min.js","42230a8c2786cbaab14c1360e58b63a4"],["/vendors/vue-resource.min.js","9e692bf18237e76f1eafa7a53af08b9d"],["/vendors/vue-router.min.js","af076185430f3f508c9c64f304155733"],["/vendors/vue.min.js","ae4418a123a795ef1725ccdefdbdc165"],["/vendors/vuetify.min.css","a1994517079a6ec69639ea397db26faf"],["/vendors/vuetify.min.js","cab4269afaa3808e5bd0d169e687a18a"]];
var cacheName = 'sw-precache-v3--' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function(originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function(originalResponse) {
    // If this is not a redirected response, then we don't have to do anything.
    if (!originalResponse.redirected) {
      return Promise.resolve(originalResponse);
    }

    // Firefox 50 and below doesn't support the Response.body stream, so we may
    // need to read the entire body to memory as a Blob.
    var bodyPromise = 'body' in originalResponse ?
      Promise.resolve(originalResponse.body) :
      originalResponse.blob();

    return bodyPromise.then(function(body) {
      // new Response() is happy when passed either a stream or a Blob.
      return new Response(body, {
        headers: originalResponse.headers,
        status: originalResponse.status,
        statusText: originalResponse.statusText
      });
    });
  };

var createCacheKey = function(originalUrl, paramName, paramValue,
                           dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
      url.search += (url.search ? '&' : '') +
        encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
  };

var isPathWhitelisted = function(whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var stripIgnoredUrlParameters = function(originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(function(cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              var request = new Request(cacheKey, {credentials: 'same-origin'});
              return fetch(request).then(function(response) {
                // Bail out of installation unless we get back a 200 OK for
                // every request.
                if (!response.ok) {
                  throw new Error('Request for ' + cacheKey + ' returned a ' +
                    'response with status ' + response.status);
                }

                return cleanResponse(response).then(function(responseToCache) {
                  return cache.put(cacheKey, responseToCache);
                });
              });
            }
          })
        );
      });
    }).then(function() {
      
      // Force the SW to transition from installing -> active state
      return self.skipWaiting();
      
    })
  );
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.keys().then(function(existingRequests) {
        return Promise.all(
          existingRequests.map(function(existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function() {
      
      return self.clients.claim();
      
    })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond;

    // First, remove all the ignored parameters and hash fragment, and see if we
    // have that URL in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = 'index.html';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = '';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted([], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches.open(cacheName).then(function(cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function(e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});







