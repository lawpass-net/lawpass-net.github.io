// 방문 통계 — config.js의 analytics 값이 있는 도구만 불러온다(값이 비면 그 도구는 건너뛴다).
// 실제 사이트(lawpass.net)에서만 켜진다. 로컬 점검은 주소 뒤 ?stats=1, GA4 디버그 뷰 점검은 ?gadebug=1.
(function () {
  'use strict';
  const A = (window.SITE_CONFIG && window.SITE_CONFIG.analytics) || {};
  const qs = new URLSearchParams(location.search);
  const debug = qs.has('gadebug');
  const on = /(^|\.)lawpass\.net$/.test(location.hostname) || qs.has('stats') || debug;
  const ga4 = on && A.ga4Id ? A.ga4Id : '';

  // 화면 코드에서 부르는 이벤트 함수. GA4가 없으면 아무 일도 하지 않는다.
  window.track = function (name, params) {
    if (!ga4 || typeof window.gtag !== 'function') return;
    try { window.gtag('event', name, Object.assign(debug ? { debug_mode: true } : {}, params || {})); } catch (e) { /* 통계 오류는 무시 */ }
  };
  window.ANALYTICS_ON = on && !!(A.cloudflareToken || A.ga4Id || A.naverId);
  if (!on) return;

  function load(src, attrs, onload) {
    const s = document.createElement('script');
    s.async = true; s.src = src;
    Object.keys(attrs || {}).forEach(k => s.setAttribute(k, attrs[k]));
    if (onload) s.onload = onload;
    document.head.appendChild(s);
  }

  // Cloudflare Web Analytics(쿠키 없음, 기준 수치)
  if (A.cloudflareToken) {
    load('https://static.cloudflareinsights.com/beacon.min.js', { 'data-cf-beacon': JSON.stringify({ token: A.cloudflareToken }) });
  }

  // Google Analytics 4(행동 분석)
  if (ga4) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ga4, debug ? { debug_mode: true } : {});
    load('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga4));
  }

  // 네이버 애널리틱스(네이버 검색 유입)
  if (A.naverId) {
    load('https://wcs.naver.net/wcslog.js', null, function () {
      window.wcs_add = window.wcs_add || {};
      window.wcs_add.wa = A.naverId;
      if (window.wcs) window.wcs_do();
    });
  }
})();
