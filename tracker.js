// ============================================================
// Confluence Visitor Tracker V3 — Single-param fix
// ============================================================
var TRACKER_URL = 'https://script.google.com/macros/s/AKfycbxg34rAeJ26dSi_wGe_rALeY_mUvCHdlHSCrIrCsN9l1s6BvbCo4w8At3kzm5j3Msix/exec';

(function() {
  if (!TRACKER_URL) return;

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

  // Send data as single JSON-encoded param (Google Apps Script chokes on multiple & params)
  function send(obj) {
    var img = new Image();
    img.src = TRACKER_URL + '?d=' + encodeURIComponent(JSON.stringify(obj));
  }

  function sendBeaconData(obj) {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TRACKER_URL + '?d=' + encodeURIComponent(JSON.stringify(obj)));
    } else {
      send(obj);
    }
  }

  // 1. Initial visit (once per session)
  if (!sessionStorage.getItem('cfl_visited')) {
    sessionStorage.setItem('cfl_visited', '1');
    fetch('https://api.ipify.org?format=json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        send({
          a: 'visit', sid: sid, ip: data.ip || 'unknown',
          pg: pageName, br: getBrowser(), os: getOS(),
          ref: document.referrer || 'direct',
          sc: screen.width + 'x' + screen.height,
          ln: navigator.language || 'unknown'
        });
      })
      .catch(function() {});
  }

  // 2. Pageview (every page)
  send({ a: 'pageview', sid: sid, pg: pageName });

  // 3. Click tracking
  document.addEventListener('click', function(e) {
    var link = e.target.closest('.entry-link');
    if (!link) return;
    var entry = link.closest('.entry');
    var name = entry ? (entry.dataset.name || 'unknown') : 'unknown';
    send({ a: 'click', sid: sid, pg: pageName, dt: name });
  });

  // 4. Leave tracking (time on page)
  function onLeave() {
    var dur = Math.round((Date.now() - pageStart) / 1000);
    if (dur < 1) return;
    sendBeaconData({ a: 'leave', sid: sid, pg: pageName, dur: dur });
  }
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') onLeave();
  });
  window.addEventListener('pagehide', onLeave);
})();
