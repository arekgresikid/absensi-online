export const onRequest: PagesFunction<{ DB: D1Database }> = async ({ request, env }) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (!env.DB) {
    return new Response("Database binding 'DB' is missing. Please check your Cloudflare Pages settings.", { status: 500 });
  }

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
        const { id, user_email, user_name, date, check_in, check_out, location, photo } = await request.json() as any;
        
        // Cek apakah sudah ada absen hari ini
        const existing = await env.DB.prepare('SELECT * FROM attendance WHERE user_email = ? AND date = ?')
          .bind(user_email, date)
          .first();

        if (!existing) {
          await env.DB.prepare('INSERT INTO attendance (id, user_email, user_name, date, check_in, location, photo) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .bind(id, user_email, user_name, date, check_in, location, photo || null)
            .run();
        } else if (check_out) {
          await env.DB.prepare('UPDATE attendance SET check_out = ? WHERE user_email = ? AND date = ?')
            .bind(check_out, user_email, date)
            .run();
        }
        return Response.json({ success: true });
      }
    }

    // --- MANAJEMEN IZIN/CUTI ---
    if (path === '/api/leaves') {
      if (method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM leave_requests ORDER BY created_at DESC').all();
        return Response.json(results);
      }

      if (method === 'POST') {
        const { id, user_email, user_name, type, start_date, end_date, reason } = await request.json() as any;
        await env.DB.prepare('INSERT INTO leave_requests (id, user_email, user_name, type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(id, user_email, user_name, type, start_date, end_date, reason)
          .run();
        return Response.json({ success: true });
      }

      if (method === 'PATCH') {
        const { id, status } = await request.json() as any;
        await env.DB.prepare('UPDATE leave_requests SET status = ? WHERE id = ?')
          .bind(status, id)
          .run();
        return Response.json({ success: true });
      }
    }

    // --- MANAJEMEN LOKASI KANTOR ---
    if (path === '/api/locations') {
      if (method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM locations ORDER BY name ASC').all();
        return Response.json(results);
      }

      if (method === 'POST') {
        const { id, name, latitude, longitude } = await request.json() as any;
        await env.DB.prepare('INSERT INTO locations (id, name, latitude, longitude) VALUES (?, ?, ?, ?)')
          .bind(id, name, latitude, longitude)
          .run();
        return Response.json({ success: true });
      }

      if (method === 'DELETE') {
        const { id } = await request.json() as any;
        await env.DB.prepare('DELETE FROM locations WHERE id = ?')
          .bind(id)
          .run();
        return Response.json({ success: true });
      }
    }

    return new Response('Not Found', { status: 404 });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
