const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Method not allowed.'
    });
  }

  const {
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_BRANCH,
    PUBLISH_PASSWORD
  } = process.env;

  const FILE_PATH =
    process.env.GITHUB_FILE_PATH || 'index.html';

  if (
    !GITHUB_TOKEN ||
    !GITHUB_OWNER ||
    !GITHUB_REPO ||
    !GITHUB_BRANCH ||
    !PUBLISH_PASSWORD
  ) {
    return res.status(500).json({
      error: 'חסרים משתני סביבה ב-Vercel. צריך להגדיר GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH ו-PUBLISH_PASSWORD.'
    });
  }

  const body =
    typeof req.body === 'string'
      ? (() => {
          try {
            return JSON.parse(req.body);
          } catch {
            return {};
          }
        })()
      : req.body || {};

  const html = body.html;
  const password = body.publishPassword;

  if (
    typeof password !== 'string' ||
    !safeEqual(password, PUBLISH_PASSWORD)
  ) {
    return res.status(401).json({
      error: 'סיסמת הפרסום שגויה.'
    });
  }

  if (
    typeof html !== 'string' ||
    !html.trim().toLowerCase().startsWith('<!doctype html>')
  ) {
    return res.status(400).json({
      error: 'תוכן האתר אינו קובץ HTML תקין.'
    });
  }

  if (Buffer.byteLength(html, 'utf8') > 4_000_000) {
    return res.status(413).json({
      error: 'הקובץ גדול מדי. יש להקטין את גודלו לפחות מ-4MB.'
    });
  }

  const api =
    `https://api.github.com/repos/` +
    `${encodeURIComponent(GITHUB_OWNER)}/` +
    `${encodeURIComponent(GITHUB_REPO)}/contents/` +
    FILE_PATH.split('/').map(encodeURIComponent).join('/');

  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'Vercel-Barber-Publisher'
  };

  try {
    // בדיקת הקובץ הקיים ב-GitHub
    const current = await fetch(
      `${api}?ref=${encodeURIComponent(GITHUB_BRANCH)}`,
      { headers }
    );

    let sha;

    if (current.ok) {
      const data = await current.json();
      sha = data.sha;
    } else if (current.status !== 404) {
      const details = await current.text();

      return res.status(502).json({
        error:
          `GitHub לא הצליח לקרוא את הקובץ (${current.status}). ` +
          details.slice(0, 300)
      });
    }

    // עדכון הקובץ במאגר
    const update = await fetch(api, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'Update barber website from admin panel',
        content: Buffer.from(html, 'utf8').toString('base64'),
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {})
      })
    });

    const resultText = await update.text();

    if (!update.ok) {
      return res.status(502).json({
        error:
          `GitHub דחה את העדכון (${update.status}). ` +
          resultText.slice(0, 350)
      });
    }

    return res.status(200).json({
      ok: true,
      message:
        'הקוד עודכן ב-GitHub. אם הפרויקט מחובר ל-Vercel ' +
        'והוגדרה פריסה אוטומטית, הפריסה אמורה להתחיל עכשיו. ' +
        'בדקו את Deployments ב-Vercel.'
    });

  } catch (error) {
    return res.status(500).json({
      error:
        `שגיאת תקשורת: ` +
        String(error.message || error).slice(0, 250)
    });
  }
};

function safeEqual(a, b) {
  const aa = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');

  return (
    aa.length === bb.length &&
    crypto.timingSafeEqual(aa, bb)
  );
  }
