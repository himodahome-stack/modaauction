/**
 * 모다부동산법원경매 공인중개사사무소 웹사이트 인터랙션 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');
  const navLinks = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section[id]');
  const copyBtn = document.getElementById('copyAddressBtn');

  // 1. 헤더 스크롤 효과
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. 모바일 햄버거 메뉴 토글
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        if (isOpen) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });

    // 모바일 메뉴 항목 클릭 시 드로어 닫기
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });
  }

  // 3. 스크롤 위치에 따른 활성 네비게이션 표시 (Active Nav)
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // 4. 주소 복사 기능
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const addressText = '경기도 시흥시 시청로 25, 3층 341호';
      navigator.clipboard.writeText(addressText).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> 복사 완료!';
        copyBtn.style.backgroundColor = '#C5A880';
        copyBtn.style.color = '#FFFFFF';
        copyBtn.style.borderColor = '#C5A880';

        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.backgroundColor = '';
          copyBtn.style.color = '';
          copyBtn.style.borderColor = '';
        }, 2000);
      }).catch(err => {
        console.error('클립보드 복사 실패:', err);
      });
    });
  }

  // 5. 대리입찰 FAQ 아코디언 토글
  const faqItems = document.querySelectorAll('.faq-accordion-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        // 현재 항목 토글
        if (isOpen) {
          item.classList.remove('active');
          questionBtn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // 6. 대리입찰 FAQ 카테고리 필터 탭
  const tabBtns = document.querySelectorAll('.faq-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-target');

      // 탭 활성화 클래스 변경
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // FAQ 리스트 필터링
      faqItems.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (category === 'all' || itemCat === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // 7. 대리입찰 온라인 신청 폼 인터랙션
  const btnApplyPersonal = document.getElementById('btnApplyPersonal');
  const btnApplyCorp = document.getElementById('btnApplyCorp');
  const applyBidderNameInput = document.getElementById('applyBidderName');

  if (btnApplyPersonal && btnApplyCorp) {
    btnApplyPersonal.addEventListener('click', () => {
      btnApplyPersonal.classList.add('active');
      btnApplyCorp.classList.remove('active');
      if (applyBidderNameInput) applyBidderNameInput.placeholder = '입찰자 개인 성명';
    });

    btnApplyCorp.addEventListener('click', () => {
      btnApplyCorp.classList.add('active');
      btnApplyPersonal.classList.remove('active');
      if (applyBidderNameInput) applyBidderNameInput.placeholder = '입찰 법인 상호 (대표자명 병기)';
    });
  }

  // 주소 검색 (다음 우편번호 API)
  const btnApplyPostcode = document.getElementById('btnApplyPostcode');
  if (btnApplyPostcode) {
    btnApplyPostcode.addEventListener('click', () => {
      if (typeof daum === 'undefined' || !daum.Postcode) {
        alert('우편번호 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
        return;
      }
      new daum.Postcode({
        oncomplete: function(data) {
          let addr = data.roadAddress || data.jibunAddress;
          const postcodeInput = document.getElementById('applyBidderPostcode');
          const addrInput = document.getElementById('applyBidderAddr1');
          if (postcodeInput) postcodeInput.value = data.zonecode;
          if (addrInput) addrInput.value = addr;
        }
      }).open();
    });
  }

  // 사건번호 정보조회 시뮬레이션
  const btnApplyCaseSearch = document.getElementById('btnApplyCaseSearch');
  if (btnApplyCaseSearch) {
    btnApplyCaseSearch.addEventListener('click', () => {
      const court = document.getElementById('applyCourtName').value;
      const caseNum = document.getElementById('applyCaseNum').value;
      if (!court) {
        alert('법원을 먼저 선택해 주세요.');
        document.getElementById('applyCourtName').focus();
        return;
      }
      if (!caseNum) {
        alert('사건번호를 입력해 주세요.');
        document.getElementById('applyCaseNum').focus();
        return;
      }
      alert(`[사건 조회 완료]\n${court} 2026타경 ${caseNum} 사건 정보가 확인되었습니다.\n매각기일 및 물건 소재지를 확인해 주세요.`);
    });
  }

  // 금액 콤마 자동 포맷
  const applyBidPrice = document.getElementById('applyBidPrice');
  const applyDepositPrice = document.getElementById('applyDepositPrice');

  const formatWithCommas = (val) => {
    const num = val.replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (applyBidPrice) {
    applyBidPrice.addEventListener('input', (e) => {
      e.target.value = formatWithCommas(e.target.value);
    });
  }
  if (applyDepositPrice) {
    applyDepositPrice.addEventListener('input', (e) => {
      e.target.value = formatWithCommas(e.target.value);
    });
  }

  // 신청 폼 제출
  const onlineApplyForm = document.getElementById('onlineApplyForm');
  if (onlineApplyForm) {
    onlineApplyForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const agreeExemption = document.getElementById('agreeExemption');
      const agreePersonalData = document.getElementById('agreePersonalData');

      if (!agreeExemption.checked || !agreePersonalData.checked) {
        alert('필수 동의 항목(면책 조항 및 개인정보 수집·이용)에 모두 체크해 주세요.');
        return;
      }

      const clientName = document.getElementById('clientName').value.trim();
      const clientPhone = document.getElementById('clientPhone').value.trim();
      const courtName = document.getElementById('applyCourtName').value;
      const caseNum = document.getElementById('applyCaseNum').value.trim();
      const location = document.getElementById('applyLocation').value.trim();

      if (!clientName || !clientPhone || !courtName || !caseNum || !location) {
        alert('사건 정보 및 신청자 정보를 모두 정확히 입력해 주세요.');
        return;
      }

      // 접수 완료 안내 팝업
      alert(
        `[대리입찰 신청 접수 완료]\n\n` +
        `모다부동산법원경매 공인중개사사무소에 대리입찰 신청이 정상 접수되었습니다!\n\n` +
        `• 의뢰인: ${clientName} (${clientPhone})\n` +
        `• 신청 사건: ${courtName} 2026타경 ${caseNum}\n` +
        `• 소재지: ${location}\n\n` +
        `접수 확인 후 담당자(대표 공인중개사 박지은)가 사건을 검토하여 계약서 서명 링크를 카카오 알림톡 및 문자로 신속히 안내해 드리겠습니다. 감사합니다.`
      );

      onlineApplyForm.reset();
    });
  }
});
