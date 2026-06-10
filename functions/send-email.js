export async function onRequestPost(context) {
  const { request } = context;
  const data = await request.json();

  // Example: send transactional emails when orders are created.
  // Replace with your email provider integration.
  console.log('Order email payload:', data);

  return new Response(JSON.stringify({ status: 'queued' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
