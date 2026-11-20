/**
 * Order form and contact form.
 * Posts JSON to the webhook in data-webhook.
 * Google Apps Script cannot answer a browser CORS check, so those URLs
 * are sent once with mode "no-cors" (a second try would duplicate the row).
 * Any other URL is a normal fetch, retried once on failure.
 * A copy is kept in localStorage until a send resolves.
 */
var MIN_MS = 2500;
var started = Date.now();

function digits(value) {
  return String(value || '')
    .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 1632); })
    .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 1776); })
    .replace(/[\s\-().]/g, '');
}

function parsePhone(raw) {
  var cleaned = digits(raw);
  var match = cleaned.match(/^(?:\+?212|00212|0)?([67]\d{8})$/);
  if (!match) return null;
  return { local: '0' + match[1], e164: '+212' + match[1] };
}

function uid(prefix) {
  if (window.crypto && crypto.randomUUID) return prefix + crypto.randomUUID();
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function cookie(name) {
  var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

function captureCampaign() {
  var params = new URLSearchParams(location.search);
  var fbclid = params.get('fbclid');
  if (fbclid && !cookie('_fbc')) {
    document.cookie = '_fbc=fb.1.' + Date.now() + '.' + fbclid + ';path=/;max-age=7776000;SameSite=Lax';
  }
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (key) {
    var value = params.get(key);
    if (!value) return;
    try { sessionStorage.setItem(key, value); } catch (e) {}
  });
}

function stored(key) {
  try { return sessionStorage.getItem(key) || ''; } catch (e) { return ''; }
}

function backup(order) {
  try { localStorage.setItem('kd_order_backup', JSON.stringify(order)); } catch (e) {}
}

function clearBackup() {
  try { localStorage.removeItem('kd_order_backup'); } catch (e) {}
}

function track(event, params, eventID) {
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', event, params || {}, eventID ? { eventID: eventID } : {});
}

function isSheets(url) {
  return /script\.google\.com|script\.googleusercontent\.com/i.test(url);
}

function timeoutSignal(ms) {
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) return AbortSignal.timeout(ms);
  var controller = new AbortController();
  setTimeout(function () { controller.abort(); }, ms);
  return controller.signal;
}

async function postJson(url, payload) {
  var body = JSON.stringify(payload);
  var headers = { 'Content-Type': 'text/plain;charset=utf-8' };
  if (isSheets(url)) {
    try {
      await fetch(url, { method: 'POST', mode: 'no-cors', headers: headers, body: body });
      return true;
    } catch (e) {
      await fetch(url, { method: 'POST', mode: 'no-cors', headers: headers, body: body });
      return true;
    }
  }
  async function once() {
    var res = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body,
      signal: timeoutSignal(12000),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
  }
  try {
    await once();
    return true;
  } catch (e) {
    await once();
    return true;
  }
}

function selectedOffer(form) {
  return form.querySelector('input[name="offer"]:checked');
}

function paint(form) {
  var chosen = selectedOffer(form);
  form.querySelectorAll('.offer').forEach(function (el) {
    var input = el.querySelector('input');
    el.classList.toggle('is-on', !!(input && input.checked));
  });
  if (!chosen) return;
  var label = chosen.getAttribute('data-price-label') || '';
  var total = form.querySelector('[data-total]');
  if (total) total.textContent = label;
  var dockPrice = document.querySelector('[data-dock-price]');
  if (dockPrice) dockPrice.textContent = label;
  var button = form.querySelector('[data-submit]');
  var template = form.getAttribute('data-submit-label') || '';
  if (button && template) {
    button.textContent = template.replace('{price}', chosen.getAttribute('data-price-label') || '');
  }
}

function fieldError(input, message) {
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  return message;
}

function validateOrder(form, t) {
  var name = form.querySelector('[name="name"]');
  var phone = form.querySelector('[name="phone"]');
  var city = form.querySelector('[name="city"]');
  var address = form.querySelector('[name="address"]');
  var errors = [];
  if (!name.value.trim() || name.value.trim().length < 3) errors.push(fieldError(name, t.errName));
  else fieldError(name, '');
  if (!parsePhone(phone.value)) errors.push(fieldError(phone, t.errPhone));
  else fieldError(phone, '');
  if (!city.value) errors.push(fieldError(city, t.errCity));
  else fieldError(city, '');
  if (!address.value.trim() || address.value.trim().length < 6) errors.push(fieldError(address, t.errAddress));
  else fieldError(address, '');
  return errors.filter(Boolean);
}

function showError(form, text) {
  var box = form.querySelector('[data-error]');
  if (!box) return;
  box.textContent = text;
}

function moroccoStamp() {
  try {
    return new Date().toLocaleString('sv-SE', { timeZone: 'Africa/Casablanca', hour12: false });
  } catch (e) {
    return new Date().toISOString();
  }
}

async function submitOrder(form) {
  var button = form.querySelector('[data-submit]');
  var t = {
    errName: form.getAttribute('data-err-name'),
    errPhone: form.getAttribute('data-err-phone'),
    errCity: form.getAttribute('data-err-city'),
    errAddress: form.getAttribute('data-err-address'),
    errFast: form.getAttribute('data-err-fast'),
    errSend: form.getAttribute('data-err-send'),
    errNoWebhook: form.getAttribute('data-err-hook'),
    saved: form.getAttribute('data-saved'),
    sending: form.getAttribute('data-sending'),
  };
  showError(form, '');
  var honeypot = form.querySelector('[name="company_fax"]');
  if (honeypot && honeypot.value) {
    showError(form, t.errSend);
    return;
  }
  if (Date.now() - started < MIN_MS) {
    showError(form, t.errFast);
    return;
  }
  var problems = validateOrder(form, t);
  if (problems.length) {
    showError(form, problems[0]);
    var bad = form.querySelector('[aria-invalid="true"]');
    if (bad && bad.focus) bad.focus();
    return;
  }

  var webhook = form.getAttribute('data-webhook') || '';
  if (!webhook) {
    showError(form, t.errNoWebhook);
    return;
  }

  var phone = parsePhone(form.querySelector('[name="phone"]').value);
  var offer = selectedOffer(form);
  var qty = Number(offer ? offer.getAttribute('data-qty') : 1);
  var price = Number(offer ? offer.getAttribute('data-price') : 0);
  var offerLabel = offer ? offer.getAttribute('data-sheet') : '';
  var productName = form.getAttribute('data-sheet-name') || '';
  var productId = form.getAttribute('data-product-id') || '';
  var city = form.querySelector('[name="city"]').value;
  var address = form.querySelector('[name="address"]').value.trim();
  var fullName = form.querySelector('[name="name"]').value.trim();
  var leadId = uid('');
  var purchaseId = uid('');
  var orderNumber = 'KD-' + Date.now().toString(36).toUpperCase();

  var payload = {
    kind: 'order',
    order_number: orderNumber,
    created_at_morocco: moroccoStamp(),
    call_status: 'جديد - في انتظار الاتصال',
    customer_name: fullName,
    customer_phone_local: phone.local,
    customer_phone_e164: phone.e164,
    whatsapp_quick_link: 'https://wa.me/' + phone.e164.replace('+', ''),
    items_summary: productName + ' — ' + offerLabel + ' × ' + qty + ' — ' + price + ' درهم',
    total_units: qty,
    upsell_accepted: 'لا',
    upsell_product_name: '-',
    total_mad: price,
    currency: 'MAD',
    city: city,
    address: address,
    city_and_address: city + ' — ' + address,
    agent_notes: '',
    utm_source: stored('utm_source') || 'direct',
    utm_medium: stored('utm_medium'),
    utm_campaign: stored('utm_campaign') || '-',
    utm_content: stored('utm_content'),
    event_id: leadId,
    purchase_event_id: purchaseId,
    event_name: 'Lead',
    product_id: productId,
    product_name: productName,
    offer_id: offer ? offer.value : '',
    lang: document.documentElement.lang,
    page_url: location.href,
    fbp: cookie('_fbp'),
    fbc: cookie('_fbc'),
    client_user_agent: navigator.userAgent,
  };

  backup(payload);
  button.disabled = true;
  var previous = button.textContent;
  button.textContent = t.sending;
  try {
    await postJson(webhook, payload);
    clearBackup();
    try {
      sessionStorage.setItem('kd_last_order', JSON.stringify({
        eventId: leadId,
        purchaseEventId: purchaseId,
        value: price,
        currency: 'MAD',
        contentId: productId,
        contentName: productName,
        qty: qty,
        orderNumber: orderNumber,
        phone: phone.e164.replace('+', ''),
        name: fullName,
      }));
    } catch (e) {}
    location.href = form.getAttribute('data-thanks') || '/thank-you/';
  } catch (e) {
    button.disabled = false;
    button.textContent = previous;
    showError(form, t.errSend + ' ' + t.saved);
  }
}

function validateContact(form) {
  var name = form.querySelector('[name="name"]');
  var phone = form.querySelector('[name="phone"]');
  var message = form.querySelector('[name="message"]');
  if (!name.value.trim() || name.value.trim().length < 3) return form.getAttribute('data-err-name');
  if (!parsePhone(phone.value)) return form.getAttribute('data-err-phone');
  if (!message.value.trim() || message.value.trim().length < 4) return form.getAttribute('data-err-message');
  return '';
}

async function submitContact(form) {
  var button = form.querySelector('[data-submit]');
  var honeypot = form.querySelector('[name="company_fax"]');
  if (honeypot && honeypot.value) {
    showError(form, form.getAttribute('data-err-send'));
    return;
  }
  if (Date.now() - started < MIN_MS) {
    showError(form, form.getAttribute('data-err-fast'));
    return;
  }
  var problem = validateContact(form);
  if (problem) {
    showError(form, problem);
    return;
  }
  var webhook = form.getAttribute('data-webhook') || '';
  if (!webhook) {
    showError(form, form.getAttribute('data-err-hook'));
    return;
  }
  var phone = parsePhone(form.querySelector('[name="phone"]').value);
  var payload = {
    kind: 'contact',
    order_number: 'MSG-' + Date.now().toString(36).toUpperCase(),
    created_at_morocco: moroccoStamp(),
    call_status: 'رسالة',
    customer_name: form.querySelector('[name="name"]').value.trim(),
    customer_phone_local: phone.local,
    customer_phone_e164: phone.e164,
    whatsapp_quick_link: 'https://wa.me/' + phone.e164.replace('+', ''),
    items_summary: form.querySelector('[name="message"]').value.trim(),
    total_units: 0,
    upsell_accepted: 'لا',
    upsell_product_name: '-',
    total_mad: 0,
    currency: 'MAD',
    city_and_address: '',
    agent_notes: form.querySelector('[name="message"]').value.trim(),
    utm_source: stored('utm_source') || 'direct',
    utm_campaign: stored('utm_campaign') || '-',
    event_id: uid(''),
    event_name: 'Contact',
    page_url: location.href,
  };
  backup(payload);
  button.disabled = true;
  try {
    await postJson(webhook, payload);
    clearBackup();
    form.reset();
    button.disabled = false;
    showError(form, '');
    var ok = form.querySelector('[data-ok]');
    if (ok) ok.hidden = false;
  } catch (e) {
    button.disabled = false;
    showError(form, form.getAttribute('data-err-send') + ' ' + form.getAttribute('data-saved'));
  }
}

function watchDock(form) {
  var dock = document.querySelector('[data-dock]');
  if (!dock || !form || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (entries) {
    dock.classList.toggle('is-hidden', entries[0].isIntersecting);
  }, { threshold: 0.15 }).observe(form);
}

function bootVideo() {
  document.querySelectorAll('[data-video]').forEach(function (box) {
    var button = box.querySelector('[data-play]');
    if (!button) return;
    button.addEventListener('click', function () {
      var video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.muted = true;
      video.preload = 'none';
      video.src = box.getAttribute('data-video');
      video.addEventListener('error', function () {
        var msg = box.querySelector('[data-video-msg]');
        if (msg) msg.hidden = false;
      });
      button.replaceWith(video);
      var play = video.play();
      if (play && play.catch) play.catch(function () {});
    });
  });
}

captureCampaign();

var orderForm = document.querySelector('[data-order]');
if (orderForm) {
  paint(orderForm);
  orderForm.addEventListener('change', function () { paint(orderForm); });
  var checkoutSent = false;
  orderForm.addEventListener('focusin', function () {
    if (checkoutSent) return;
    checkoutSent = true;
    var offer = selectedOffer(orderForm);
    track('InitiateCheckout', {
      content_ids: [orderForm.getAttribute('data-product-id')],
      content_name: orderForm.getAttribute('data-sheet-name'),
      content_type: 'product',
      value: Number(offer ? offer.getAttribute('data-price') : 0),
      currency: 'MAD',
      num_items: Number(offer ? offer.getAttribute('data-qty') : 1),
    }, uid('ic-'));
  });
  orderForm.addEventListener('submit', function (event) {
    event.preventDefault();
    submitOrder(orderForm);
  });
  watchDock(orderForm);
  var viewId = uid('vc-');
  var first = selectedOffer(orderForm);
  track('ViewContent', {
    content_ids: [orderForm.getAttribute('data-product-id')],
    content_name: orderForm.getAttribute('data-sheet-name'),
    content_type: 'product',
    value: Number(first ? first.getAttribute('data-price') : 0),
    currency: 'MAD',
  }, viewId);
}

var contactForm = document.querySelector('[data-contact]');
if (contactForm) {
  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();
    submitContact(contactForm);
  });
}

bootVideo();
