const PROTECTED_PATHS = [
  // Admin-only GET (list all events)
  { method: 'GET', path: '/api/events', exact: true },
  // All mutations
  { method: 'POST',   path: '/api/events',        exact: false },
  { method: 'PUT',    path: '/api/events',        exact: false },
  { method: 'DELETE', path: '/api/events',        exact: false },
  { method: 'POST',   path: '/api/participants',  exact: false },
  { method: 'PUT',    path: '/api/participants',  exact: false },
];

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;
  const method = getMethod(event);

  const isProtected = PROTECTED_PATHS.some(({ method: m, path: p, exact }) =>
    method === m && (exact ? path === p : path.startsWith(p)),
  );

  if (isProtected) {
    await requireUserSession(event);
  }
});
