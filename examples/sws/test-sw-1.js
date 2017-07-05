'use strict';

self.addEventListener('activate', (e) => {
  console.log('activate test sw 1');
  e.waitUntil(setTimeout(() => {
    console.log('test sw 1 ready');
  }, 500));
});

self.addEventListener('install', (e) => {
  console.log('install test sw 1');
  e.waitUntil(setTimeout(() => {
    console.log('test sw 1 is installed');
  }, 500));
});
