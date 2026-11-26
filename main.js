/**
 * 모다부동산법원경매 공인중개사사무소 — site scripts
 * Header drawer, apply-form validation & summary (no server), Daum postcode.
 */
document.addEventListener('DOMContentLoaded', function () {
  /* ---------- Mobile drawer ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.getElementById('mobileDrawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        drawer.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Highlight the current navigation item ---------- */
  var path = window.location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
  if (path.length > 1 && path.slice(-1) === '/') path = path.slice(0, -1);
  document.querySelectorAll('.main-nav a, .mobile-drawer a[data-nav]').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    var clean = href.replace(/\/index\.html$/, '').replace(/\.html$/, '');
    if (clean.length > 1 && clean.slice(-1) === '/') clean = clean.slice(0, -1);
    if (clean === path) a.classList.add('active');
  });

  /* ---------- Apply form ---------- */
  var form = document.getElementById('applyForm');
  if (!form) return;

  var errorBox = document.getElementById('formError');
  var resultBox = document.getElementById('applyResult');
  var resultTitle = document.getElementById('applyResultTitle');
  var resultDesc = document.getElementById('applyResultDesc');
  var summaryBox = document.getElementById('summaryText');
  var mailLink = document.getElementById('mailtoLink');
  var copyBtn = document.getElementById('copySummaryBtn');
  var copyMsg = document.getElementById('copyMessage');
  var submitBtn = form.querySelector('button[type="submit"]');

  /* 신청서를 사무소 메일로 바로 발송하는 폼 전송 서비스 (FormSubmit)
   * - 사무소 메일함에서 최초 1회 활성화 링크를 누르면 이후 자동 발송됩니다.
   * - 발송이 실패하면 이메일 보내기·카톡·전화 안내로 넘어가 신청이 사라지지 않습니다. */
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/hi.modahome@gmail.com';
  var OFFICE_MAIL = 'hi.modahome@gmail.com';
  var resultState = '';

  function val(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }

  function setResult(state, title, desc) {
    resultState = state;
    if (!resultBox) return;
    resultBox.classList.remove('is-sending', 'is-success', 'is-fallback');
    resultBox.classList.add('is-' + state);
    if (resultTitle) resultTitle.textContent = title;
    if (resultDesc) resultDesc.textContent = desc;
    if (mailLink) {
      if (state === 'fallback') { mailLink.removeAttribute('hidden'); }
      else { mailLink.setAttribute('hidden', ''); }
    }
  }

  function setBusy(busy) {
    if (!submitBtn) return;
    if (busy) {
      if (!submitBtn.dataset.label) submitBtn.dataset.label = submitBtn.textContent.trim();
      submitBtn.textContent = '보내는 중…';
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    } else {
      if (submitBtn.dataset.label) submitBtn.textContent = submitBtn.dataset.label;
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
    }
  }

  function buildPayload(subject, text, bidderType) {
    var caseNo = val('caseYear') + '타경' + val('caseNumber') +
      (val('itemNumber') ? ' (물건번호 ' + val('itemNumber') + ')' : '');
    return {
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
      _replyto: val('clientEmail'),
      _honey: val('websiteHp'),
      '법원': val('court'),
      '사건번호': caseNo,
      '매각기일': val('bidDate'),
      '물건 소재지': val('propertyAddress'),
      '의뢰인 이름': val('clientName'),
      '의뢰인 연락처': val('clientPhone'),
      '의뢰인 이메일': val('clientEmail'),
      '입찰자 구분': bidderType,
      '입찰자 이름': val('bidderName'),
      '입찰자 연락처': val('bidderPhone'),
      '입찰자 주소': (val('bidderZonecode') ? '(' + val('bidderZonecode') + ') ' : '') + val('bidderAddress'),
      '입찰 금액': val('bidAmount') + '원',
      '보증 금액': val('depositAmount') + '원',
      '보증금 반환 은행': val('bankName'),
      '보증금 반환 계좌': val('accountNumber'),
      '예금주': val('accountHolder'),
      '신청서 전문': text
    };
  }

  function onSendSuccess() {
    setBusy(false);
    setResult(
      'success',
      '신청이 접수되었습니다',
      '적어 주신 내용이 사무소 메일로 전달되었습니다. 확인한 뒤 담당자가 연락드립니다. 매각기일이 임박했다면 아래 전화로 바로 연락 주세요.'
    );
    if (resultTitle) resultTitle.focus({ preventScroll: true });
    if (resultBox) resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function onSendFailure() {
    setBusy(false);
    setResult(
      'fallback',
      '자동 전송이 되지 않았습니다',
      '아래 ‘이메일로 보내기’를 눌러 보내 주시거나, 전화·카톡으로 알려 주세요. 작성하신 내용은 그대로 남아 있습니다.'
    );
    if (resultTitle) resultTitle.focus({ preventScroll: true });
    if (resultBox) resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function sendApplication(subject, text, bidderType) {
    var payload = buildPayload(subject, text, bidderType);
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 20000) : null;

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    }).then(function (res) {
      return res.json().then(function (data) { return { ok: res.ok, data: data || {} }; })
        .catch(function () { return { ok: false, data: {} }; });
    }).then(function (r) {
      if (timer) clearTimeout(timer);
      if (r.ok && String(r.data.success) === 'true') onSendSuccess();
      else onSendFailure();
    }).catch(function () {
      if (timer) clearTimeout(timer);
      onSendFailure();
    });
  }

  function showError(message) {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.classList.add('is-visible');
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearError() {
    if (errorBox) errorBox.classList.remove('is-visible');
  }

  /* Daum postcode — 입찰자 주소 */
  var postcodeBtn = document.getElementById('btnPostcode');
  if (postcodeBtn) {
    postcodeBtn.addEventListener('click', function () {
      if (!window.daum || !window.daum.Postcode) {
        alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
        return;
      }
      new window.daum.Postcode({
        oncomplete: function (data) {
          var addr = data.roadAddress || data.jibunAddress || data.address;
          var extra = '';
          if (data.bname && /[동|로|가]$/g.test(data.bname)) extra += data.bname;
          if (data.buildingName) extra += (extra ? ', ' : '') + data.buildingName;
          if (extra) addr += ' (' + extra + ')';
          var addrInput = document.getElementById('bidderAddress');
          var zoneInput = document.getElementById('bidderZonecode');
          if (addrInput) addrInput.value = addr;
          if (zoneInput) zoneInput.value = data.zonecode || '';
          addrInput.focus();
        }
      }).open();
    });
  }

  /* 의뢰인 = 입찰자 복사 */
  var sameCheck = document.getElementById('sameAsClient');
  if (sameCheck) {
    sameCheck.addEventListener('change', function () {
      if (!sameCheck.checked) return;
      var pairs = [
        ['clientName', 'bidderName'],
        ['clientPhone', 'bidderPhone'],
        ['clientEmail', 'bidderEmail']
      ];
      pairs.forEach(function (p) {
        var from = document.getElementById(p[0]);
        var to = document.getElementById(p[1]);
        if (from && to) to.value = from.value;
      });
    });
  }

  /* 입력값 정리 (전화·금액) */
  function digitsOnly(v) { return v.replace(/[^0-9]/g, ''); }
  function formatMoney(v) {
    var d = digitsOnly(v);
    return d ? Number(d).toLocaleString('ko-KR') : '';
  }
  ['bidAmount', 'depositAmount'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', function () {
      if (el.value) el.value = formatMoney(el.value);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    var required = [
      ['court', '법원을 선택해 주세요.'],
      ['caseYear', '사건번호 연도를 선택해 주세요.'],
      ['caseNumber', '사건번호를 입력해 주세요.'],
      ['bidDate', '매각기일을 입력해 주세요.'],
      ['propertyAddress', '물건 소재지를 입력해 주세요.'],
      ['clientName', '의뢰인 이름을 입력해 주세요.'],
      ['clientPhone', '의뢰인 연락처를 입력해 주세요.'],
      ['clientEmail', '이메일을 입력해 주세요.'],
      ['bidderName', '입찰자 이름을 입력해 주세요.'],
      ['bidderAddress', '입찰자 주소를 입력해 주세요.'],
      ['bidAmount', '입찰 금액을 입력해 주세요.'],
      ['depositAmount', '보증 금액을 입력해 주세요.'],
      ['bankName', '보증금을 돌려받을 은행을 입력해 주세요.'],
      ['accountNumber', '계좌번호를 입력해 주세요.'],
      ['accountHolder', '예금주를 입력해 주세요.']
    ];

    for (var i = 0; i < required.length; i++) {
      var el = document.getElementById(required[i][0]);
      if (!el || !String(el.value).trim()) {
        if (el) el.focus();
        showError(required[i][1]);
        return;
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('clientEmail'))) {
      document.getElementById('clientEmail').focus();
      showError('이메일 주소 형식을 다시 확인해 주세요.');
      return;
    }
    if (digitsOnly(val('clientPhone')).length < 9) {
      document.getElementById('clientPhone').focus();
      showError('연락처를 정확히 입력해 주세요.');
      return;
    }
    if (!document.getElementById('agreeDisclaimer').checked) {
      showError('면책 조항을 확인하고 동의해 주세요.');
      return;
    }
    if (!document.getElementById('agreePrivacy').checked) {
      showError('개인정보 수집 및 이용에 동의해 주세요.');
      return;
    }

    var bidderType = form.querySelector('input[name="bidderType"]:checked');
    bidderType = bidderType ? bidderType.value : '개인 명의';

    var lines = [
      '[모다부동산법원경매 대리입찰 신청]',
      '',
      '■ 사건 정보',
      '· 법원: ' + val('court'),
      '· 사건번호: ' + val('caseYear') + '타경' + val('caseNumber') + (val('itemNumber') ? ' (물건번호 ' + val('itemNumber') + ')' : ''),
      '· 매각기일: ' + val('bidDate'),
      '· 물건 소재지: ' + val('propertyAddress'),
      '',
      '■ 의뢰인 / 입찰자 정보',
      '· 의뢰인: ' + val('clientName') + ' / ' + val('clientPhone') + ' / ' + val('clientEmail'),
      '· 입찰자 구분: ' + bidderType,
      '· 입찰자: ' + val('bidderName'),
      '· 입찰자 주소: ' + (val('bidderZonecode') ? '(' + val('bidderZonecode') + ') ' : '') + val('bidderAddress'),
      '· 입찰 금액: ' + val('bidAmount') + '원',
      '· 보증 금액: ' + val('depositAmount') + '원',
      '',
      '■ 보증금 반환 계좌',
      '· 은행: ' + val('bankName'),
      '· 계좌번호: ' + val('accountNumber'),
      '· 예금주: ' + val('accountHolder'),
      '',
      '※ 위 내용은 홈페이지 신청서 작성 내용이며, 담당자 확인 후 연락드립니다.'
    ];
    var text = lines.join('\n');

    var subject = '[대리입찰 신청] ' + val('court') + ' ' + val('caseYear') + '타경' + val('caseNumber') + ' - ' + val('clientName');

    if (summaryBox) summaryBox.textContent = text;
    if (mailLink) mailLink.href = 'mailto:' + OFFICE_MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
    if (copyMsg) copyMsg.textContent = '';

    if (resultBox) {
      resultBox.hidden = false;
      setResult('sending', '신청서를 보내는 중입니다', '잠시만 기다려 주세요. 내용이 사무소 메일로 바로 전달됩니다.');
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setBusy(true);
    sendApplication(subject, text, bidderType);
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = summaryBox ? summaryBox.textContent : '';
      if (!text) return;
      var done = function () {
        if (copyMsg) copyMsg.textContent = '신청 내용을 복사했습니다. 카카오톡 1:1 상담에 붙여넣어 보내 주세요.';
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (err) { /* noop */ }
    document.body.removeChild(ta);
  }

  /* Reset result panel when the form changes again (발송 중에는 건드리지 않습니다) */
  form.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'websiteHp') return;
    if (resultBox && !resultBox.hidden && resultState !== 'sending') resultBox.hidden = true;
  });
});
