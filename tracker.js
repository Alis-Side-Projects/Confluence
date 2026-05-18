// ============================================================
// Confluence Visitor Tracker V2 — Full Session Tracking
// ============================================================
var TRACKER_URL = 'https://script.google.com/macros/s/AKfycbxg34rAeJ26dSi_wGe_rALeY_mUvCHdlHSCrIrCsN9l1s6BvbCo4w8At3kzm5j3Msix/exec';

(function() {
  if (!TRACKER_URL) return;

  // --- Session ID (persists across pages within same tab session) ---
  var sid = sessionStorage.getItem('cfl_sid');
  if (!sid) {
    sid = 'S' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    sessionStorage.setItem('cfl_sid', sid);
  }

  var pageName = location.pathname.split('/').pop().replace('.html', '') || 'index';
  var pageStart = Date.now();
  var ua = navigator.userAgent;

  function getBrowser() {
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Edg/') > -1) return 'Edge';
    if (ua.indexOf('OPR') > -1) return 'Opera';
    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg/') === -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
    return 'Unknown';
  }

  function getOS() {
    if (ua.indexOf('Windows') > -1) return 'Windows';
    if (ua.indexOf('Mac OS X') > -1) return 'macOS';
    if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    return 'Unknown';
  }

  function beacon(params) {
    var img = new Image();
    img.src = TRACKER_URL + '?' + params;
  }

  // --- 1. Initial visit (only once per session) ---
  if (!sessionStorage.getItem('cfl_visited')) {
    sessionStorage.setItem('cfl_visited', '1');

    fetch('https://api.ipify.org?format=json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        beacon([
          'action=visit',
          'sid=' + sid,
          'ip=' + encodeURIComponent(data.ip || 'unknown'),
          'page=' + encodeURIComponent(pageName),
          'browser=' + encodeURIComponent(getBrowser()),
          'os=' + encodeURIComponent(getOS()),
          'referrer=' + encodeURIComponent(document.referrer || 'direct'),
          'screen=' + encodeURIComponent(screen.width + 'x' + screen.height),
          'language=' + encodeURIComponent(navigator.language || 'unknown')
        ].join('&'));
      })
      .catch(function() {});
  }

  // --- 2. Page view event (every page, including navigations) ---
  beacon([
    'action=pageview',
    'sid=' + sid,
    'page=' + encodeURIComponent(pageName)
  ].join('&'));

  // --- 3. Click tracking on "Visit" links ---
  document.addEventListener('click', function(e) {
    var link = e.target.closest('.entry-link');
    if (!link) return;

    var entry = link.closest('.entry');
    var entryName = entry ? (entry.dataset.name || entry.querySelector('.entry-name')?.textContent || 'unknown') : 'unknown';

    beacon([
      'action=click',
      'sid=' + sid,
      'page=' + encodeURIComponent(pageName),
      'detail=' + encodeURIComponent(entryName)
    ].join('&'));
  });

  // --- 4. Time on page (fires when leaving/closing) ---
  function sendLeaveEvent() {
    var duration = Math.round((Date.now() - pageStart) / 1000);
    if (duration < 1) return;

    // Use sendBeacon for reliability on page close
    if (navigator.sendBeacon) {
      var params = [
        'action=leave',
        'sid=' + sid,
        'page=' + encodeURIComponent(pageName),
        'duration=' + duration
      ].join('&');
      navigator.sendBeacon(TRACKER_URL + '?' + params);
    } else {
      beacon([
        'action=leave',
        'sid=' + sid,
        'page=' + encodeURIComponent(pageName),
        'duration=' + duration
      ].join('&'));
    }
  }

  // Fire on page hide (covers tab close, navigation, mobile background)
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') sendLeaveEvent();
  });
  window.addEventListener('pagehide', sendLeaveEvent);
})();
