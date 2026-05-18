// ============================================================
// ⚙️ PASTE YOUR SUPABASE CREDENTIALS HERE
// ============================================================
const SUPABASE_URL = '';   // e.g. 'https://xyzabc.supabase.co'
const SUPABASE_KEY = '';   // your anon/public key
// ============================================================

(function() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;

  // Only count once per session (new tab/window = new visit, navigating within = same visit)
  const sessionKey = 'confluence_tracked';
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, '1');

  // Parse user agent
  const ua = navigator.userAgent;

  function getBrowser() {
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Brave')) return 'Brave';
    if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
    if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('MSIE') || ua.includes('Trident/')) return 'IE';
    return 'Unknown';
  }

  function getOS() {
    if (ua.includes('Windows NT 10')) return 'Windows 10/11';
    if (ua.includes('Windows NT')) return 'Windows';
    if (ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('CrOS')) return 'ChromeOS';
    return 'Unknown';
  }

  // Get IP via free API, then log the visit
  fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(data => {
      const payload = {
        ip: data.ip || null,
        page: window.location.pathname,
        browser: getBrowser(),
        os: getOS(),
        user_agent: ua.substring(0, 500),
        referrer: document.referrer || null,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        language: navigator.language || null
      };

      return fetch(`${SUPABASE_URL}/rest/v1/visitors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });
    })
    .catch(() => {
      // Silently fail - don't break the site if tracking fails
    });
})();
