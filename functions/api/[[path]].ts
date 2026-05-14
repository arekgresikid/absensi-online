export const onRequest: PagesFunction<{ DB: D1Database }> = async ({ request, env }) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  try {
    // --- MANAJEMEN USER ---
    if (path === '/api/users') {
      if (method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM users ORDER BY joined_at DESC').all();
        return Response.json(results);
      }
      
      if (method === 'POST') {
        const { email, name, picture, role } = await request.json() as any;
        await env.DB.prepare('INSERT INTO users (email, name, picture, role) VALUES (?, ?, ?, ?)')
          .bind(email, name, picture || null, role || 'karyawan')
          .run();
        return Response.json({ success: true });
      }

      if (method === 'PATCH') {
        const { email, role } = await request.json() as any;
        await env.DB.prepare('UPDATE users SET role = ? WHERE email = ?')
          .bind(role, email)
          .run();
        return Response.json({ success: true });
      }
    }

    // --- MANAJEMEN ABSENSI ---
    if (path === '/api/attendance') {
      if (method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM attendance ORDER BY date DESC, check_in DESC').all();
        return Response.json(results);
      }

      if (method === 'POST') {
        const { id, user_email, user_name, date, check_in, check_out, location } = await request.json() as any;
        
        // Cek apakah sudah ada absen hari ini
        const existing = await env.DB.prepare('SELECT * FROM attendance WHERE user_email = ? AND date = ?')
          .bind(user_email, date)
          .first();

        if (!existing) {
          await env.DB.prepare('INSERT INTO attendance (id, user_email, user_name, date, check_in, location) VALUES (?, ?, ?, ?, ?, ?)')
            .bind(id, user_email, user_name, date, check_in, location)
            .run();
        } else if (check_out) {
          await env.DB.prepare('UPDATE attendance SET check_out = ? WHERE user_email = ? AND date = ?')
            .bind(check_out, user_email, date)
            .run();
        }
        return Response.json({ success: true });
      }
    }

    return new Response('Not Found', { status: 404 });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
