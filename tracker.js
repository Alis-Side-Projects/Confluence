// ============================================================
// Confluence Visitor Tracker — Google Sheets Backend
// ============================================================
const TRACKER_URL = 'https://script.google.com/macros/s/AKfycbxg34rAeJ26dSi_wGe_rALeY_mUvCHdlHSCrIrCsN9l1s6BvbCo4w8At3kzm5j3Msix/exec';

(function() {
  if (!TRACKER_URL) return;

  // Only count once per session
  var sessionKey = 'confluence_tracked';
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, '1');

  var ua = navigator.userAgent;

  function getBrowser() {
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Edg/') > -1) return 'Edge';
    if (ua.indexOf('OPR') > -1 || ua.indexOf('Opera') > -1) return 'Opera';
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

  // Get IP then send tracking data
  fetch('https://api.ipify.org?format=json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var params = [
        'ip=' + encodeURIComponent(data.ip || 'unknown'),
        'page=' + encodeURIComponent(location.pathname.split('/').pop().replace('.html','') || 'index'),
        'browser=' + encodeURIComponent(getBrowser()),
        'os=' + encodeURIComponent(getOS()),
        'referrer=' + encodeURIComponent(document.referrer || 'direct'),
        'screen=' + encodeURIComponent(screen.width + 'x' + screen.height),
        'language=' + encodeURIComponent(navigator.language || 'unknown')
      ].join('&');

      // Use image beacon — most reliable cross-origin method
      var img = new Image();
      img.src = TRACKER_URL + '?' + params;
    })
    .catch(function() {});
})();
