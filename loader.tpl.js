if (window && window.navigator && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // create service worker
    return navigator.serviceWorker.register('{{ swFile }}')
      .then((registration) => {
        window.activeWorker = registration.active;
        console.log(`registration is done. Scope: ${registration.scope}`);
      })
      .catch((err) => console.error(err));
  });
}
