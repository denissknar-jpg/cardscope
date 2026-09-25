const fallbackCards = [];
const comparisonBody = document.getElementById('comparisonBody');
const tableSearch = document.getElementById('tableSearch');
const tableSort = document.getElementById('tableSort');
let cards = [...fallbackCards];
const columnFilters = {};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function getInitials(name) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function getLogo(card) {
  const domain = new URL(card.website).hostname;
  const logoUrl = `https://logo.clearbit.com/${domain}`;
  const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  return `<span class="service-logo" aria-label="Логотип ${escapeHtml(card.name)}"><span>${escapeHtml(getInitials(card.name))}</span><img src="${logoUrl}" alt="" loading="lazy" onerror="this.onerror=function(){this.remove()};this.src='${fallbackUrl}'"></span>`;
}

function getVisibleCards() {
  const term = tableSearch.value.trim().toLowerCase();
  const visible = cards.filter((card) => {
    const textMatches = ['name', 'issue', 'service', 'topup'].every((column) => {
      const value = String(columnFilters[column] || '').trim().toLowerCase();
      return !value || String(card[column]).toLowerCase().includes(value);
    });
    const walletMatches = !columnFilters.wallets || card.wallets === columnFilters.wallets;
    const ratingMatches = !columnFilters.rating || Number(card.rating) >= Number(columnFilters.rating);
    const searchMatches = !term || `${card.name} ${card.features} ${card.website}`.toLowerCase().includes(term);
    return textMatches && walletMatches && ratingMatches && searchMatches;
  });

  return visible.sort((left, right) => {
    if (tableSort.value === 'rating') return Number(right.rating) - Number(left.rating) || right.reviews - left.reviews;
    if (tableSort.value === 'reviews') return right.reviews - left.reviews;
    if (tableSort.value === 'issue') return left.issue.localeCompare(right.issue, 'ru');
    return left.rank - right.rank;
  });
}

function renderComparison() {
  const visible = getVisibleCards();
  comparisonBody.innerHTML = visible.length ? visible.map((card) => `
    <tr><td><a class="table-service table-service-link" href="${escapeHtml(card.website)}" target="_blank" rel="noreferrer">${getLogo(card)}<span><strong>${escapeHtml(card.name)}</strong><small>${card.reviews} отзывов</small></span></a></td><td>${escapeHtml(card.issue)}</td><td>${escapeHtml(card.service)}</td><td>${escapeHtml(card.topup)}</td><td>${escapeHtml(card.wallets)}</td><td><strong>${escapeHtml(card.rating)}</strong></td><td><div class="table-actions"><a class="table-link" href="detail.html?rank=${card.rank}">Подробнее</a></div></td></tr>
  `).join('') : '<tr><td class="table-empty" colspan="7">По заданным фильтрам ничего не найдено.</td></tr>';
}

function render() {
  renderComparison();
}

async function loadCards() {
  try {
    const response = await fetch('data/card-comparison.json');
    if (!response.ok) throw new Error('Catalog unavailable');
    const data = await response.json();
    if (Array.isArray(data)) cards = data;
  } catch (error) {
    comparisonBody.innerHTML = '<tr><td class="table-empty" colspan="7">Не удалось загрузить каталог.</td></tr>';
  }
}

document.querySelectorAll('[data-column-filter]').forEach((control) => {
  control.addEventListener('input', () => {
    columnFilters[control.dataset.columnFilter] = control.value;
    render();
  });
  control.addEventListener('change', () => {
    columnFilters[control.dataset.columnFilter] = control.value;
    render();
  });
});

tableSearch.addEventListener('input', render);
tableSort.addEventListener('change', render);

document.getElementById('resetFilters').addEventListener('click', () => {
  Object.keys(columnFilters).forEach((key) => delete columnFilters[key]);
  document.querySelectorAll('[data-column-filter]').forEach((control) => { control.value = ''; });
  tableSearch.value = '';
  tableSort.value = 'rank';
  render();
});

(async function init() {
  await loadCards();
  render();
})();
