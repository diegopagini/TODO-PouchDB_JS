/** @format */
//Imports
importScripts('js/sw-utils.js');

const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

//Cache estatico.
const APP_SHELL = [
	// '/', solo en desarrollo, luego comentar
	'/',
	'index.html',
	'style/base.css',
	'js/app.js',
	'js/base.js',
	'js/sw-utils.js',
	'style/bg.png',
];

//Cache inmutable (librerias y fuentes)
const APP_SHELL_INMUTABLE = [
	'//cdn.jsdelivr.net/npm/pouchdb@7.2.1/dist/pouchdb.min.js',
];

//Instalacion
self.addEventListener('install', (event) => {
	const cacheStatic = caches
		.open(STATIC_CACHE)
		.then((cache) => cache.addAll(APP_SHELL));

	const cacheInmutable = caches
		.open(INMUTABLE_CACHE)
		.then((cache) => cache.addAll(APP_SHELL_INMUTABLE));

	event.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

//Actualizar cahces. (borrar anteriores)
self.addEventListener('activate', (event) => {
	const response = caches.keys().then((keys) => {
		keys.forEach((key) => {
			if (key !== STATIC_CACHE && key.includes('static')) {
				return caches.delete(key);
			}
			if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
				return caches.delete(key);
			}
		});
	});

	event.waitUntil(response);
});

//Cache con network fallback
self.addEventListener('fetch', (event) => {
	const response = caches.match(event.request).then((resp) => {
		if (resp) {
			return resp;
		} else {
			return fetch(event.request).then((newResp) => {
				return actualizarCacheDinamico(DYNAMIC_CACHE, event.request, newResp);
			});
		}
	});

	event.respondWith(response);
});
