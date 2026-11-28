/**
 * 모다부동산법원경매 공인중개사사무소 — 경매 입찰표 PDF 생성기
 * [전산양식 A3360] 기일입찰표 · 위임장 (모든 입력은 브라우저 안에서만 처리)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------------- elements
  const printModeRadios = document.querySelectorAll('input[name="printMode"]');
  const agentRadios = document.querySelectorAll('input[name="agentType"]');
  const printArea = document.getElementById('courtPrintArea');
  const poaSheet = document.getElementById('courtSheetPoa');
  const agentCard = document.getElementById('agentCard');
  const modaAgentCard = document.getElementById('modaAgentCard');
  const customAgentFields = document.getElementById('customAgentFields');
  const btnGenerateLabel = document.getElementById('btnGenerateLabel');

  const bidderTypeBtns = document.querySelectorAll('.bidder-type-btn');
  const personalFields = document.getElementById('personalBidderFields');
  const corporateFields = document.getElementById('corporateBidderFields');

  const blankPriceCheck = document.getElementById('blankPriceCheck');
  const bidPriceInput = document.getElementById('bidPrice');
  const bidPriceKorean = document.getElementById('bidPriceKorean');
  const depositPriceInput = document.getElementById('depositPrice');
  const depositPriceKorean = document.getElementById('depositPriceKorean');

  const btnPostcodeSearch = document.getElementById('btnPostcodeSearch');
  const btnPostcodeCorp = document.getElementById('btnPostcodeCorp');
  const btnCaseSearch = document.getElementById('btnCaseSearch');

  const form = document.getElementById('bidGeneratorForm');

  const $ = (id) => document.getElementById(id);
  const setText = (id, value) => {
    const el = $(id);
    if (el) el.textContent = value == null ? '' : String(value);
  };

  // ------------------------------------------------------- 출력 방식 선택
  function currentPrintMode() {
    const checked = document.querySelector('input[name="printMode"]:checked');
    return checked ? checked.value : 'withPoa';
  }

  function applyPrintMode() {
    const mode = currentPrintMode();
    const bidOnly = mode === 'bidOnly';

    // 인쇄 영역: 1쪽만 / 2쪽
    if (printArea) printArea.classList.toggle('bid-only', bidOnly);
    if (poaSheet) poaSheet.style.display = bidOnly ? 'none' : '';

    // 대리인 선택 카드는 대리 입찰일 때만
    if (agentCard) agentCard.style.display = bidOnly ? 'none' : '';

    // 버튼 문구
    if (btnGenerateLabel) {
      btnGenerateLabel.textContent = bidOnly
        ? 'PDF 생성 및 인쇄하기 (기일입찰표만 · 1쪽)'
        : 'PDF 생성 및 인쇄하기 (기일입찰표 + 위임장 · 2쪽)';
    }

    // 선택 카드 강조
    document.querySelectorAll('.print-mode-label').forEach(label => {
      const input = label.querySelector('input[name="printMode"]');
      label.classList.toggle('is-active', !!input && input.checked);
    });

    // 대리인란 비우기/채우기는 인쇄 직전 populate 에서 처리
    if (bidOnly) clearAgentFields();
  }

  printModeRadios.forEach(radio => {
    radio.addEventListener('change', applyPrintMode);
  });

  // ------------------------------------------------------- 대리인 선택
  function currentAgentType() {
    const checked = document.querySelector('input[name="agentType"]:checked');
    return checked ? checked.value : 'moda';
  }

  agentRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const val = currentAgentType();
      if (modaAgentCard) modaAgentCard.style.display = val === 'moda' ? 'block' : 'none';
      if (customAgentFields) customAgentFields.style.display = val === 'custom' ? 'block' : 'none';
    });
  });

  // ------------------------------------------------------- 개인 / 법인 탭
  bidderTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      bidderTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.getAttribute('data-type');
      if (type === 'personal') {
        personalFields.style.display = 'block';
        corporateFields.style.display = 'none';
      } else {
        personalFields.style.display = 'none';
        corporateFields.style.display = 'block';
      }
    });
  });

  // ------------------------------------------------------- 우편 제출용(공란) 체크
  if (blankPriceCheck && bidPriceInput) {
    blankPriceCheck.addEventListener('change', () => {
      if (blankPriceCheck.checked) {
        bidPriceInput.value = '';
        bidPriceInput.disabled = true;
        bidPriceInput.placeholder = '우편 제출용 (입찰 당일 대리인이 직접 기재)';
        bidPriceKorean.textContent = '※ 우편 제출용으로 선택되어 입찰가격란은 공란으로 인쇄됩니다.';
        bidPriceKorean.style.color = '#B7791F';
      } else {
        bidPriceInput.disabled = false;
        bidPriceInput.placeholder = '예: 124,100,000';
        bidPriceKorean.textContent = '';
        bidPriceKorean.style.color = '';
      }
    });
  }

  // ------------------------------------------------------- 숫자 포맷 · 한글 금액
  function formatNumberWithCommas(val) {
    const num = String(val).replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function numberToKorean(numberStr) {
    const cleanNum = String(numberStr).replace(/[^0-9]/g, '');
    if (!cleanNum || cleanNum === '0') return '';

    const num = parseInt(cleanNum, 10);
    if (isNaN(num)) return '';

    const units = ['', '만', '억', '조'];
    let result = '';
    let tempNum = num;
    let unitIndex = 0;

    while (tempNum > 0) {
      const part = tempNum % 10000;
      if (part > 0) {
        result = `${part.toLocaleString('ko-KR')}${units[unitIndex]} ` + result;
      }
      tempNum = Math.floor(tempNum / 10000);
      unitIndex++;
    }

    return `금 ${result.trim()} 원정 (₩${num.toLocaleString('ko-KR')})`;
  }

  if (bidPriceInput) {
    bidPriceInput.addEventListener('input', (e) => {
      const formatted = formatNumberWithCommas(e.target.value);
      e.target.value = formatted;
      bidPriceKorean.textContent = formatted ? numberToKorean(formatted) : '';
    });
  }

  if (depositPriceInput) {
    depositPriceInput.addEventListener('input', (e) => {
      const formatted = formatNumberWithCommas(e.target.value);
      e.target.value = formatted;
      depositPriceKorean.textContent = numberToKorean(formatted);
    });
  }

  // ------------------------------------------------------- 다음(카카오) 우편번호
  function openPostcode(postcodeInputId, addrInputId) {
    if (typeof daum === 'undefined' || !daum.Postcode) {
      alert('우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    new daum.Postcode({
      oncomplete: function (data) {
        let fullAddr = data.roadAddress;
        if (!fullAddr) fullAddr = data.jibunAddress;
        document.getElementById(postcodeInputId).value = data.zonecode;
        document.getElementById(addrInputId).value = fullAddr;
      }
    }).open();
  }

  if (btnPostcodeSearch) {
    btnPostcodeSearch.addEventListener('click', () => openPostcode('bidderPostcode', 'bidderAddress'));
  }
  if (btnPostcodeCorp) {
    btnPostcodeCorp.addEventListener('click', () => openPostcode('corpPostcode', 'corpAddress'));
  }

  // ------------------------------------------------------- 사건 정보 확인
  if (btnCaseSearch) {
    btnCaseSearch.addEventListener('click', () => {
      const court = $('courtName').value;
      const caseNum = $('caseNum').value;
      if (!court) {
        alert('법원을 먼저 선택해 주세요.');
        $('courtName').focus();
        return;
      }
      if (!caseNum) {
        alert('사건번호를 입력해 주세요.');
        $('caseNum').focus();
        return;
      }
      const caseYear = $('caseYear') ? $('caseYear').value : '';
      alert(`[입력 내용 확인]\n${court} ${caseYear}타경 ${caseNum}\n\n이 화면은 입력하신 내용만 보여 드립니다. 실제 입찰기일·최저매각가격·보증금액은 대법원 법원경매정보(courtauction.go.kr)에서 확인해 주세요.`);
    });
  }

  // ------------------------------------------------------- 인쇄 영역 채우기
  function clearAgentFields() {
    ['pAgentName', 'pAgentRelation', 'pAgentRrn', 'pAgentPhone', 'pAgentAddr'].forEach(id => setText(id, ''));
    ['pPoaAgentName', 'pPoaAgentJob', 'pPoaAgentRrn', 'pPoaAgentPhone', 'pPoaAgentAddr'].forEach(id => setText(id, ''));
  }

  /**
   * 금액을 12자리 칸(천억~일)에 오른쪽 정렬로 한 자리씩 넣는다.
   * 예) 190,000,000 → 억=1, 천만=9, 백만~일=0
   */
  function fillDigits(containerId, amount) {
    const container = $(containerId);
    if (!container) return 0;
    const cells = container.querySelectorAll('td.dg');
    const digits = String(amount || '').replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');
    const arr = new Array(cells.length).fill('');
    if (digits) {
      const sliced = digits.slice(-cells.length);
      for (let i = 0; i < sliced.length; i++) {
        arr[cells.length - sliced.length + i] = sliced[i];
      }
    }
    cells.forEach((cell, i) => { cell.textContent = arr[i]; });
    return digits.length;
  }

  function formatKoreanDate(value) {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    return `${parts[0]}년 ${parts[1]}월 ${parts[2]}일`;
  }

  function joinAddress(zipId, addrId, detailId) {
    const zip = $(zipId) ? $(zipId).value.trim() : '';
    const addr = $(addrId) ? $(addrId).value.trim() : '';
    const detail = $(detailId) ? $(detailId).value.trim() : '';
    if (!addr) return '';
    return `${zip ? '(' + zip + ') ' : ''}${addr}${detail ? ' ' + detail : ''}`;
  }

  function populate() {
    const courtName = $('courtName').value || '';
    const caseYear = $('caseYear').value || '';
    const caseNum = ($('caseNum').value || '').trim();
    const itemNum = ($('itemNum').value || '').trim();
    const bidDate = formatKoreanDate($('bidDate').value || '');
    const bidOnly = currentPrintMode() === 'bidOnly';
    const agentType = currentAgentType();
    const isPersonal = document.querySelector('.bidder-type-btn.active').getAttribute('data-type') === 'personal';

    // ---- 입찰자(본인) 정보
    let bidderName = '';
    let bidderRegNo = '';   // 주민(사업자)등록번호
    let bidderCorpNo = '';  // 법인등록번호
    let bidderPhone = '';
    let bidderAddr = '';
    let bidderJob = '';

    if (isPersonal) {
      bidderName = ($('bidderName').value || '').trim();
      const front = ($('bidderRrnFront').value || '').replace(/[^0-9]/g, '');
      const back = ($('bidderRrnBack').value || '').replace(/[^0-9]/g, '');
      bidderRegNo = front ? (back ? `${front}-${back}` : front) : '';
      bidderPhone = ($('bidderPhone').value || '').trim();
      bidderAddr = joinAddress('bidderPostcode', 'bidderAddress', 'bidderAddressDetail');
      bidderJob = ($('bidderJob').value || '').trim();
    } else {
      bidderName = ($('corpName').value || '').trim();
      bidderRegNo = ($('corpBizNum').value || '').trim();
      bidderCorpNo = ($('corpRegNum').value || '').trim();
      bidderPhone = ($('corpPhone').value || '').trim();
      bidderAddr = joinAddress('corpPostcode', 'corpAddress', 'corpAddressDetail');
      bidderJob = ($('corpRepJob').value || '').trim();
    }

    // ---- 대리인 정보
    let agentName = '';
    let agentRelation = '';
    let agentRrn = '';
    let agentPhone = '';
    let agentAddr = '';
    let agentJob = '';

    if (!bidOnly) {
      if (agentType === 'moda') {
        agentName = '박지은';
        agentRelation = '매수신청대리인';
        agentJob = '공인중개사';
        agentRrn = ($('modaAgentRrn').value || '').trim();
        agentPhone = '010-7308-8284';
        agentAddr = '경기도 시흥시 시청로 25, 3층 341호 (장현동, 모다부동산법원경매)';
      } else {
        agentName = ($('customAgentName').value || '').trim();
        agentRelation = ($('customAgentRelation').value || '').trim();
        agentJob = ($('customAgentJob').value || '').trim();
        agentRrn = ($('customAgentRrn').value || '').trim();
        agentPhone = ($('customAgentPhone').value || '').trim();
        agentAddr = ($('customAgentAddress').value || '').trim();
      }
    }

    // ---- 금액
    const isBlankPrice = !!(blankPriceCheck && blankPriceCheck.checked);
    const bidPriceVal = isBlankPrice ? '' : ($('bidPrice').value || '');
    const depositVal = $('depositPrice').value || '';

    // ---- 1쪽 기일입찰표
    const NB = '\u00a0';
    setText('pCourtLine', courtName ? `${courtName}${NB.repeat(4)}집행관${NB.repeat(2)}귀하` : `지방법원${NB.repeat(4)}집행관${NB.repeat(2)}귀하`);
    setText('pBidDateLine', bidDate
      ? `입찰기일 : ${NB.repeat(2)}${bidDate}`
      : `입찰기일 :${NB.repeat(6)}년${NB.repeat(5)}월${NB.repeat(5)}일`);
    setText('pCaseNumber', `${caseYear} 타경 ${caseNum} 호`.replace(/\s+/g, ' '));
    setText('pItemNumber', itemNum || '1');

    setText('pBidderName', bidderName);
    setText('pBidderRegNo', bidderRegNo);
    setText('pBidderCorpNo', bidderCorpNo);
    setText('pBidderPhone', bidderPhone);
    setText('pBidderAddr', bidderAddr);

    setText('pAgentName', agentName);
    setText('pAgentRelation', agentRelation);
    setText('pAgentRrn', agentRrn);
    setText('pAgentPhone', agentPhone);
    setText('pAgentAddr', agentAddr);

    const guar = document.querySelector('input[name="guarMethod"]:checked');
    const guarValue = guar ? guar.value : 'cash';
    setText('pGuarCash', guarValue === 'cash' ? '☑' : '□');
    setText('pGuarBond', guarValue === 'bond' ? '☑' : '□');

    const depositLen = fillDigits('pDepositDigits', depositVal);
    const bidLen = fillDigits('pBidDigits', bidPriceVal);

    // ---- 2쪽 위임장
    if (!bidOnly) {
      setText('pPoaAgentName', agentName);
      setText('pPoaAgentJob', agentJob);
      setText('pPoaAgentRrn', agentRrn);
      setText('pPoaAgentPhone', agentPhone);
      setText('pPoaAgentAddr', agentAddr);

      const NB2 = '\u00a0';
      setText('pPoaCaseLine', courtName
        ? `${courtName}${NB2.repeat(4)}${caseYear} 타경${NB2.repeat(3)}${caseNum}${NB2.repeat(2)}호 부동산`
        : `지방법원${NB2.repeat(6)}${caseYear} 타경${NB2.repeat(3)}${caseNum}${NB2.repeat(2)}호 부동산`);

      setText('pPoaB1Name', bidderName);
      setText('pPoaB1Job', bidderJob);
      setText('pPoaB1Rrn', bidderRegNo || bidderCorpNo);
      setText('pPoaB1Phone', bidderPhone);
      setText('pPoaB1Addr', bidderAddr);

      setText('pPoaTo', courtName ? `${courtName} 귀중` : '지방법원 귀중');
    }

    return Math.max(depositLen, bidLen);
  }

  // ------------------------------------------------------- 제출 → 인쇄
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const agree = $('agreePrivacy');
      if (agree && !agree.checked) {
        alert('개인정보 수집 및 이용에 동의해 주세요.');
        agree.focus();
        return;
      }

      if (!$('courtName').value) {
        alert('법원명을 선택해 주세요.');
        $('courtName').focus();
        return;
      }

      if (!($('caseNum').value || '').trim()) {
        alert('사건번호를 입력해 주세요.');
        $('caseNum').focus();
        return;
      }

      const isPersonal = document.querySelector('.bidder-type-btn.active').getAttribute('data-type') === 'personal';
      const bidderName = isPersonal ? $('bidderName').value.trim() : $('corpName').value.trim();
      if (!bidderName) {
        alert(isPersonal ? '입찰자(본인) 성명을 입력해 주세요.' : '법인명을 입력해 주세요.');
        (isPersonal ? $('bidderName') : $('corpName')).focus();
        return;
      }

      const maxLen = populate();
      if (maxLen > 12) {
        alert('금액이 12자리(9,999억 원)를 넘습니다. 금액을 다시 확인해 주세요.');
        return;
      }

      window.print();
    });
  }

  // ------------------------------------------------------- 초기 상태
  applyPrintMode();
  const initialAgent = currentAgentType();
  if (modaAgentCard) modaAgentCard.style.display = initialAgent === 'moda' ? 'block' : 'none';
  if (customAgentFields) customAgentFields.style.display = initialAgent === 'custom' ? 'block' : 'none';
});
