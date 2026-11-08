/**
 * Loads the NagishLi accessibility plugin, and the jQuery it needs, on deployed hosts only.
 * An external file instead of inline scripts so the Content-Security-Policy can stay
 * free of 'unsafe-inline', and nothing else on the page depends on jQuery.
 */
(function () {
  var host = location.hostname;
  var local = host === 'localhost' || host === '127.0.0.1';
  // ?nagishli=1 loads it on localhost too, so preview and e2e runs can exercise the widget
  if (local && !/[?&]nagishli=1(&|$)/.test(location.search)) return;

  // Silence NagishLi's own debug warnings, nothing else
  var originalWarn = console.warn;
  console.warn = function () {
    var message = arguments[0];
    if (
      typeof message === 'string' &&
      (message.indexOf('נגיש לי') !== -1 ||
        message.indexOf('NagishLi') !== -1 ||
        message.indexOf('jQuery not loaded yet for Nagish') !== -1)
    ) {
      return;
    }
    return originalWarn.apply(console, arguments);
  };

  function load(src, attrs, onload) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    for (var key in attrs) script.setAttribute(key, attrs[key]);
    script.onload = onload;
    script.onerror = function () {
      originalWarn.call(console, 'NagishLi accessibility plugin unavailable: failed to load ' + src);
    };
    document.head.appendChild(script);
  }

  // NagishLi's panel is a slide-in dialog but ships without the dialog behaviour:
  // add the role, Escape to close, and a Tab loop while it is open
  function enhance() {
    var FOCUSABLE = '#NagishLiWidget a[href], #NagishLiWidget button, #NagishLiWidget input, #NagishLiWidget select, #NagishLiWidget [tabindex]:not([tabindex="-1"])';
    function widget() {
      return document.getElementById('NagishLiWidget');
    }
    function isOpen(el) {
      return !!el && el.classList.contains('nagishli-widget-show');
    }
    function focusables() {
      return Array.prototype.filter.call(document.querySelectorAll(FOCUSABLE), function (el) {
        return el.offsetWidth > 0 && el.offsetHeight > 0;
      });
    }
    // The panel is built by the plugin; label it as soon as it exists
    function label() {
      var el = widget();
      if (!el || el.getAttribute('role')) return;
      var lang = document.getElementById('NagishLiLangChooser');
      if (lang && !lang.getAttribute('aria-label')) lang.setAttribute('aria-label', 'Language / שפה');
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', 'Accessibility');
    }
    label();
    document.addEventListener('click', label, true);
    document.addEventListener(
      'keydown',
      function (event) {
        var el = widget();
        if (!isOpen(el)) return;
        if (event.key === 'Escape') {
          var close = document.getElementById('NagishLiCloseBtn');
          if (close) close.click();
          var trigger = document.getElementById('NagishLiTrigger');
          if (trigger) {
            if (!trigger.hasAttribute('tabindex')) trigger.setAttribute('tabindex', '0');
            trigger.focus();
          }
        } else if (event.key === 'Tab') {
          var items = focusables();
          if (!items.length) return;
          var first = items[0];
          var last = items[items.length - 1];
          var outside = !el.contains(document.activeElement);
          if (event.shiftKey && (outside || document.activeElement === first)) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && (outside || document.activeElement === last)) {
            event.preventDefault();
            first.focus();
          }
        }
      },
      true,
    );
  }

  // After the page has painted and gone idle, so the widget never competes with first render
  function start() {
    load(
      'https://code.jquery.com/jquery-3.7.1.min.js',
      { integrity: 'sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=', crossorigin: 'anonymous' },
      function () {
        load('/nagishli/nagishli_beta.js?v=3.0b', { charset: 'utf-8' }, enhance);
      },
    );
  }
  function whenIdle() {
    if (window.requestIdleCallback) window.requestIdleCallback(start, { timeout: 3000 });
    else setTimeout(start, 1500);
  }
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle);
})();
