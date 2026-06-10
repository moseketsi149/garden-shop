export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/admin')) {
    return Response.redirect(`${url.origin}/shopAdmin-main${url.pathname}`, 302);
  }

  return new Response('OK');
}
