'use strict';

self.addEventListener('activate', (e) => {
  console.log('activate test sw 2');
  e.waitUntil(setTimeout(() => {
    console.log('test sw 2 ready');
  }, 500));
});

self.addEventListener('install', (e) => {
  console.log('install test sw 2');
  e.waitUntil(setTimeout(() => {
    console.log('test sw 2 is installed');
  }, 500));
});
