// ============================================================
// ⚙️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
// ============================================================
const TRACKER_URL = 'https://script.google.com/macros/s/AKfycbxg34rAeJ26dSi_wGe_rALeY_mUvCHdlHSCrIrCsN9l1s6BvbCo4w8At3kzm5j3Msix/exec';
// ============================================================

(function() {
  if (!TRACKER_URL) return;

  // Only count once per session (new tab = new visit, navigating within = same visit)
  const sessionKey = 'confluence_tracked';
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, '1');

  const ua = navigator.userAgent;

  function getBrowser() {
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
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

  // Get IP, then log the visit
  fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(data => {
      const params = new URLSearchParams({
        ip: data.ip || 'unknown',
        page: window.location.pathname.replace(/.*\//, '').replace('.html', '') || 'index',
        browser: getBrowser(),
        os: getOS(),
        referrer: document.referrer || 'direct',
        screen: window.screen.width + 'x' + window.screen.height,
        language: navigator.language || 'unknown'
      });

      // Use image beacon approach (more reliable than fetch for cross-origin Apps Script)
      return fetch(TRACKER_URL + '?' + params.toString(), { mode: 'no-cors' });
    })
    .catch(() => {});
})();
