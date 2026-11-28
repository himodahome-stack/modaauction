/**
 * 이달의 시흥 추천 경매 물건 — 종별 필터
 * 카드는 HTML에 그대로 있고, 이 스크립트는 보이기/숨기기만 합니다.
 */
document.addEventListener('DOMContentLoaded', function () {
  var grid = document.getElementById('listingsGrid');
  if (!grid) return;

  var buttons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.listing-card'));
  var countEl = document.getElementById('filterCount');
  var emptyEl = document.getElementById('listingsEmpty');

  function labelFor(key) {
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      if (b.getAttribute('data-filter') === key) {
        return b.getAttribute('data-label') || (b.textContent || '').trim().split(' ')[0];
      }
    }
    return '전체';
  }

  function apply(key) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = key === 'all' || card.getAttribute('data-cat') === key;
      if (match) {
        card.removeAttribute('hidden');
        shown++;
      } else {
        card.setAttribute('hidden', '');
      }
    });
    buttons.forEach(function (b) {
      var on = b.getAttribute('data-filter') === key;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (countEl) countEl.textContent = labelFor(key) + ' ' + shown + '건';
    if (emptyEl) emptyEl.hidden = shown !== 0;
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      apply(b.getAttribute('data-filter'));
    });
  });
});
