/**
 * 모다부동산법원경매 공인중개사사무소 - 경매 입찰표 PDF 생성기 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const agentRadios = document.querySelectorAll('input[name="agentType"]');
  const modaAgentCard = document.getElementById('modaAgentCard');
  const customAgentFields = document.getElementById('customAgentFields');

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
  const printModal = document.getElementById('printModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnModalPrint = document.getElementById('btnModalPrint');

  // 1. 대리인 선택 라디오 토글
  agentRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const val = radio.value;
      if (val === 'moda') {
        modaAgentCard.style.display = 'block';
        customAgentFields.style.display = 'none';
      } else if (val === 'self') {
        modaAgentCard.style.display = 'none';
        customAgentFields.style.display = 'none';
      } else if (val === 'custom') {
        modaAgentCard.style.display = 'none';
        customAgentFields.style.display = 'block';
      }
    });
  });

  // 2. 본인 (입찰자) 개인 / 법인 탭 전환
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

  // 3. 우편 제출용 - 입찰가격 공란 체크박스
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

  // 4. 숫자 천 단위 콤마 포맷터 & 한글 금액 변환 함수
  function formatNumberWithCommas(val) {
    const num = val.replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function numberToKorean(numberStr) {
    const cleanNum = numberStr.replace(/[^0-9]/g, '');
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

  // 금액 입력 시 자동 콤마 및 한글 변환
  if (bidPriceInput) {
    bidPriceInput.addEventListener('input', (e) => {
      const formatted = formatNumberWithCommas(e.target.value);
      e.target.value = formatted;
      bidPriceKorean.textContent = numberToKorean(formatted);
    });
  }

  if (depositPriceInput) {
    depositPriceInput.addEventListener('input', (e) => {
      const formatted = formatNumberWithCommas(e.target.value);
      e.target.value = formatted;
      depositPriceKorean.textContent = numberToKorean(formatted);
    });
  }

  // 5. 다음(카카오) 우편번호 검색 연동
  function openPostcode(postcodeInputId, addrInputId) {
    if (typeof daum === 'undefined' || !daum.Postcode) {
      alert('우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    new daum.Postcode({
      oncomplete: function(data) {
        let fullAddr = data.roadAddress;
        if (!fullAddr) fullAddr = data.jibunAddress;

        document.getElementById(postcodeInputId).value = data.zonecode;
        document.getElementById(addrInputId).value = fullAddr;
      }
    }).open();
  }

  if (btnPostcodeSearch) {
    btnPostcodeSearch.addEventListener('click', () => {
      openPostcode('bidderPostcode', 'bidderAddress');
    });
  }

  if (btnPostcodeCorp) {
    btnPostcodeCorp.addEventListener('click', () => {
      openPostcode('corpPostcode', 'corpAddress');
    });
  }

  // 6. 사건 정보조회 시뮬레이션
  if (btnCaseSearch) {
    btnCaseSearch.addEventListener('click', () => {
      const court = document.getElementById('courtName').value;
      const caseNum = document.getElementById('caseNum').value;
      if (!court) {
        alert('법원을 먼저 선택해 주세요.');
        document.getElementById('courtName').focus();
        return;
      }
      if (!caseNum) {
        alert('사건번호를 입력해 주세요.');
        document.getElementById('caseNum').focus();
        return;
      }

      // 안내 피드백
      alert(`[사건 조회 안내]\n${court} 2026타경 ${caseNum} 사건이 확인되었습니다.\n입찰기일과 최저매각가격을 확인하신 후 보증금액을 기재해 주세요.`);
    });
  }

  // 7. 법정 양식 HTML 데이터 채우기 (Print DOM Population)
  function populatePrintSheet() {
    const courtName = document.getElementById('courtName').value || '수원지방법원 안산지원';
    const caseYear = document.getElementById('caseYear').value || '2026';
    const caseNum = document.getElementById('caseNum').value || '';
    const itemNum = document.getElementById('itemNum').value || '1';
    const bidDate = document.getElementById('bidDate').value || '';

    const selectedAgentRadio = document.querySelector('input[name="agentType"]:checked');
    const agentType = selectedAgentRadio ? selectedAgentRadio.value : 'moda';

    const isPersonal = document.querySelector('.bidder-type-btn.active').getAttribute('data-type') === 'personal';

    // 입찰자 정보 추출
    let bidderName = '';
    let bidderRrn = '';
    let bidderPhone = '';
    let bidderAddr = '';

    if (isPersonal) {
      bidderName = document.getElementById('bidderName').value || '';
      const rrnFront = document.getElementById('bidderRrnFront').value || '';
      const rrnBack = document.getElementById('bidderRrnBack').value || '';
      bidderRrn = rrnFront ? `${rrnFront} - ${rrnBack || '*******'}` : '';
      bidderPhone = document.getElementById('bidderPhone').value || '';
      const zip = document.getElementById('bidderPostcode').value || '';
      const addr1 = document.getElementById('bidderAddress').value || '';
      const addr2 = document.getElementById('bidderAddressDetail').value || '';
      bidderAddr = zip ? `(${zip}) ${addr1} ${addr2}`.trim() : `${addr1} ${addr2}`.trim();
    } else {
      bidderName = document.getElementById('corpName').value || '';
      const corpNum = document.getElementById('corpRegNum').value || '';
      bidderRrn = corpNum ? `법인등록: ${corpNum}` : '';
      bidderPhone = document.getElementById('corpPhone').value || '';
      const rep = document.getElementById('corpRepName').value || '';
      const zip = document.getElementById('corpPostcode').value || '';
      const addr1 = document.getElementById('corpAddress').value || '';
      const addr2 = document.getElementById('corpAddressDetail').value || '';
      bidderAddr = `(대표자: ${rep}) ${addr1} ${addr2}`.trim();
    }

    // 대리인 정보 추출
    let agentName = '';
    let agentRelation = '';
    let agentRrn = '';
    let agentPhone = '';
    let agentAddr = '';
    let hasAgent = false;

    if (agentType === 'moda') {
      hasAgent = true;
      agentName = '박지은';
      agentRelation = '매수신청대리인';
      agentRrn = '공인중개사 (수원지법 등록)';
      agentPhone = '010-7308-8284';
      agentAddr = '경기도 시흥시 시청로 25, 3층 341호 (장현동, 모다부동산법원경매)';
    } else if (agentType === 'custom') {
      hasAgent = true;
      agentName = document.getElementById('customAgentName').value || '';
      agentRelation = document.getElementById('customAgentRelation').value || '';
      agentRrn = document.getElementById('customAgentRrn').value || '';
      agentPhone = document.getElementById('customAgentPhone').value || '';
      agentAddr = document.getElementById('customAgentAddress').value || '';
    }

    // 금액 정보
    const isBlankPrice = blankPriceCheck && blankPriceCheck.checked;
    const bidPriceVal = isBlankPrice ? '' : (document.getElementById('bidPrice').value || '');
    const depositPriceVal = document.getElementById('depositPrice').value || '';

    // 인쇄 영역 업데이트 (기일입찰표)
    document.getElementById('pCourtName').textContent = courtName;
    document.getElementById('pBidDate').textContent = bidDate ? `${bidDate.split('-')[0]}년 ${bidDate.split('-')[1]}월 ${bidDate.split('-')[2]}일` : '';
    document.getElementById('pCaseNumber').textContent = `${caseYear} 타경 ${caseNum}`;
    document.getElementById('pItemNumber').textContent = itemNum;

    // 본인
    document.getElementById('pBidderName').textContent = bidderName;
    document.getElementById('pBidderRrn').textContent = bidderRrn;
    document.getElementById('pBidderPhone').textContent = bidderPhone;
    document.getElementById('pBidderAddr').textContent = bidderAddr;

    // 대리인
    if (hasAgent) {
      document.getElementById('pAgentName').textContent = agentName;
      document.getElementById('pAgentRelation').textContent = agentRelation;
      document.getElementById('pAgentRrn').textContent = agentRrn;
      document.getElementById('pAgentPhone').textContent = agentPhone;
      document.getElementById('pAgentAddr').textContent = agentAddr;
    } else {
      document.getElementById('pAgentName').textContent = '(해당 없음 - 본인 직접 입찰)';
      document.getElementById('pAgentRelation').textContent = '-';
      document.getElementById('pAgentRrn').textContent = '-';
      document.getElementById('pAgentPhone').textContent = '-';
      document.getElementById('pAgentAddr').textContent = '-';
    }

    // 금액
    document.getElementById('pBidPriceNum').textContent = isBlankPrice ? '(우편 제출용 공란)' : (bidPriceVal ? `₩ ${bidPriceVal}` : '');
    document.getElementById('pBidPriceKor').textContent = isBlankPrice ? '' : numberToKorean(bidPriceVal);
    document.getElementById('pDepositPriceNum').textContent = depositPriceVal ? `₩ ${depositPriceVal}` : '';
    document.getElementById('pDepositPriceKor').textContent = depositPriceVal ? numberToKorean(depositPriceVal) : '';

    // 위임장 시트
    const powerOfAttorneySheet = document.getElementById('courtSheetPoa');
    if (hasAgent) {
      powerOfAttorneySheet.style.display = 'block';
      document.getElementById('poaCaseNumber').textContent = `${caseYear} 타경 ${caseNum} (물건번호: ${itemNum})`;
      document.getElementById('poaAgentName').textContent = agentName;
      document.getElementById('poaAgentRelation').textContent = agentRelation;
      document.getElementById('poaAgentRrn').textContent = agentRrn;
      document.getElementById('poaAgentPhone').textContent = agentPhone;
      document.getElementById('poaAgentAddr').textContent = agentAddr;

      document.getElementById('poaBidderName').textContent = bidderName;
      document.getElementById('poaBidderRrn').textContent = bidderRrn;
      document.getElementById('poaBidderAddr').textContent = bidderAddr;
    } else {
      powerOfAttorneySheet.style.display = 'none';
    }
  }

  // 8. 폼 제출 (PDF 생성 및 인쇄 트리거)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const agree = document.getElementById('agreePrivacy');
      if (agree && !agree.checked) {
        alert('개인정보 수집 및 이용에 동의해 주세요.');
        agree.focus();
        return;
      }

      const courtName = document.getElementById('courtName').value;
      if (!courtName) {
        alert('법원명을 선택해 주세요.');
        document.getElementById('courtName').focus();
        return;
      }

      const caseNum = document.getElementById('caseNum').value;
      if (!caseNum) {
        alert('사건번호를 입력해 주세요.');
        document.getElementById('caseNum').focus();
        return;
      }

      // 인쇄 영역에 데이터 기입
      populatePrintSheet();

      // 인쇄 창 호출 (인쇄 대상 외 요소는 @media print로 자동 숨김 처리됨)
      window.print();
    });
  }

  // 모달 제어
  if (btnCloseModal && printModal) {
    btnCloseModal.addEventListener('click', () => {
      printModal.classList.remove('open');
    });
  }

  if (btnModalPrint) {
    btnModalPrint.addEventListener('click', () => {
      window.print();
    });
  }
});
