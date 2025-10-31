// Simple diagnostic endpoint to check fontconfig availability and font dirs

export const handler = async function handler() {
  try {
    const { exec } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const execP = promisify(exec);

    const env = Object.entries(process.env)
      .filter(([k]) => /FONTCONFIG|NETLIFY|AWS_|VERCEL|NODE_/i.test(k))
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

    /** @type {Record<string, string | undefined>} */
    const results = {};
    try { results.fcList = (await execP('fc-list :lang=ar | head -n 50')).stdout; } catch (e) { results.fcListError = String(e); }
    try { results.fcVersion = (await execP('fc-cache -V')).stdout; } catch (e) { results.fcVersionError = String(e); }
    try { results.etcFonts = (await execP('ls -la /etc/fonts')).stdout; } catch (e) { results.etcFontsError = String(e); }
    try { results.taskFonts = (await execP('ls -la /var/task/.fonts || true')).stdout; } catch (e) { results.taskFontsError = String(e); }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ env, results }, null, 2),
    };
  } catch (error) {
    return { statusCode: 500, body: String(error) };
  }
}


