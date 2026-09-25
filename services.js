const serviceGrid = document.getElementById('serviceGrid');
const serviceSearch = document.getElementById('serviceSearch');
const serviceCategories = document.getElementById('serviceCategories');
const serviceCount = document.getElementById('serviceCount');
const categoryCount = document.getElementById('categoryCount');
let services = [];
let activeCategory = 'Все';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function getInitials(name) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function statusLabel(status) {
  if (status === 'unavailable') return 'Не оплачивается';
  if (status === 'available') return 'Оплачивается';
  return 'Есть в каталоге';
}

function serviceStatus(service) {
  const statuses = Object.values(service.sources);
  if (statuses.includes('available')) return 'available';
  if (statuses.includes('unavailable')) return 'unavailable';
  return 'listed';
}

function providerAction(provider, status) {
  if (status === 'unavailable' || status === 'unknown') return '';
  const rank = provider === 'yello' ? 1 : 2;
  const label = provider === 'yello' ? 'Открыть Yello Card' : 'Открыть Плати в пути';
  return `<a class="provider-action" href="detail.html?rank=${rank}">${label} →</a>`;
}

function getVisibleServices() {
  const term = serviceSearch.value.trim().toLowerCase();
  return services.filter((service) => {
    const categoryMatch = activeCategory === 'Все' || service.category === activeCategory;
    const searchMatch = !term || `${service.name} ${service.category} ${service.note}`.toLowerCase().includes(term);
    return categoryMatch && searchMatch;
  });
}

function renderCategories() {
  const categories = ['Все', ...new Set(services.map((service) => service.category))];
  serviceCategories.innerHTML = categories.map((category) => `<button class="service-category ${activeCategory === category ? 'active' : ''}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
  serviceCategories.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    render();
  }));
}

function renderServices() {
  const visible = getVisibleServices();
  if (!visible.length) {
    serviceGrid.innerHTML = '<div class="service-empty"><h3>Сервис не найден</h3><p>Измените запрос или выберите другую категорию.</p></div>';
    return;
  }
  serviceGrid.innerHTML = visible.map((service) => {
    const overall = serviceStatus(service);
    const platiStatus = service.sources.plativputi || 'unknown';
    const yelloStatus = service.sources.yello || 'unknown';
    return `<article class="service-card"><div class="service-card-top"><span class="service-logo service-logo-large"><span>${escapeHtml(getInitials(service.name))}</span></span><span class="service-category-label">${escapeHtml(service.category)}</span></div><h3>${escapeHtml(service.name)}</h3><p>${escapeHtml(service.note)}</p><div class="compatibility"><div><span>Плати в пути</span><strong class="compat-${platiStatus}">${escapeHtml(statusLabel(platiStatus))}</strong>${providerAction('plativputi', platiStatus)}</div><div><span>Yello Card</span><strong class="compat-${yelloStatus}">${escapeHtml(statusLabel(yelloStatus))}</strong>${providerAction('yello', yelloStatus)}</div></div><div class="service-card-footer"><span class="service-overall compat-${overall}">${escapeHtml(statusLabel(overall))}</span><a class="service-details-link" href="${escapeHtml(service.website)}" target="_blank" rel="noreferrer">Сайт сервиса ↗</a></div></article>`;
  }).join('');
}

function render() {
  renderCategories();
  renderServices();
}

async function init() {
  try {
    const response = await fetch('data/foreign-services.json');
    if (!response.ok) throw new Error('Services unavailable');
    services = await response.json();
    serviceCount.textContent = services.length;
    categoryCount.textContent = new Set(services.map((service) => service.category)).size;
    render();
  } catch (error) {
    serviceGrid.innerHTML = '<div class="service-empty"><h3>Не удалось загрузить каталог</h3><p>Откройте страницу через локальный сервер.</p></div>';
  }
}

serviceSearch.addEventListener('input', renderServices);
document.getElementById('resetServiceFilters').addEventListener('click', () => {
  activeCategory = 'Все';
  serviceSearch.value = '';
  render();
});
init();
