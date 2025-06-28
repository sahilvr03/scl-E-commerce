// pages/api/auth/session.js (Pages Router)
// OR
// app/api/auth/session/route.js (App Router)

import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]'; // Adjust path based on your auth file location

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    res.send({
      content:
        'This is protected content. You can access this content because you are signed in.',
      session: session,
    });
  } else {
    res.send({
      error: 'You must be signed in to view the protected content on this page.',
    });
  }
}