// An explicit update link can be opened by a client running an older cached
// app with no update UI. Reload only that requesting client after activation.
// Workout data stays in IndexedDB; no user data or caches are cleared here.
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const windows = await self.clients.matchAll({ type: "window" });
    windows.forEach(client => {
      const url = new URL(client.url);
      if (!url.searchParams.has("update")) return;
      url.searchParams.set("v", url.searchParams.get("update"));
      url.searchParams.delete("update");
      // Do not hold activation open while navigation waits for this worker to
      // activate and handle its fetch request.
      client.navigate(url.href).catch(() => { /* A closing tab needs no reload. */ });
    });
  })());
});
