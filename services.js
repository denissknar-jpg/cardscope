const container = document.getElementById('servicesContainer');
const serviceSlug = new URLSearchParams(window.location.search).get('service');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function getLogo(card) {
  const domain = new URL(card.website).hostname;
  const logoUrl = `https://logo.clearbit.com/${domain}`;
  const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  return `<span class="service-logo" aria-label="Логотип ${escapeHtml(card.name)}"><span>${escapeHtml(card.name.charAt(0))}</span><img src="${logoUrl}" alt="" loading="lazy" onerror="this.onerror=function(){this.remove()};this.src='${fallbackUrl}'"></span>`;
}

function getServiceLogo(service) {
  const domain = new URL(service.website).hostname;
  const logoUrl = `https://logo.clearbit.com/${domain}`;
  return `<span class="service-logo service-logo-large" aria-label="Логотип ${escapeHtml(service.name)}"><span>${escapeHtml(service.name.charAt(0))}</span><img src="${logoUrl}" alt="" loading="lazy" onerror="this.remove()"></span>`;
}

function renderLoading() {
  container.innerHTML = '<section class="service-hero"><div class="container"><span class="eyebrow">CardScope</span><h1>Загрузка каталога...</h1></div></section>';
}

function renderError(message) {
  container.innerHTML = `<section class="service-hero"><div class="container"><span class="eyebrow">Ошибка</span><h1>Не удалось загрузить подбор</h1><p>${escapeHtml(message)}</p><a class="secondary" href="services.html">Открыть каталог сервисов</a></div></section>`;
}

function renderServiceCatalog(services) {
  document.title = 'Подбор виртуальной карты по сервису — CardScope';
  const categories = ['Все', ...new Set(services.map((service) => service.category))];
  container.innerHTML = `<section class="service-hero"><div class="container"><span class="eyebrow">Каталог совместимости</span><h1>Какая карта подойдёт для нужного сервиса?</h1><p>Найдите зарубежный сервис, подписку, магазин или инструмент и посмотрите, какие карты отмечены в каталоге совместимости.</p><div class="service-hero-stats"><span><strong>${services.length}</strong> сервисов</span><span><strong>${categories.length - 1}</strong> категорий</span><span><strong>2</strong> источника</span></div></div></section><section class="section service-catalog"><div class="container"><div class="service-heading"><div><span class="eyebrow">Выбор сервиса</span><h2>Выберите зарубежный сервис</h2><p class="section-note">Статусы предварительные: перед оплатой проверьте тариф карты и условия сервиса.</p></div><div class="service-search"><input id="serviceSearch" type="search" placeholder="Например, ChatGPT, Netflix или Steam" aria-label="Поиск сервиса"></div></div><div class="service-controls"><div class="service-categories">${categories.map((category) => `<button class="service-category ${category === 'Все' ? 'active' : ''}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('')}</div><button id="resetServiceFilters" class="reset-filters light-reset" type="button">Сбросить</button></div><div id="serviceGrid" class="service-grid"></div></div></section>`;

  const grid = document.getElementById('serviceGrid');
  const search = document.getElementById('serviceSearch');
  let activeCategory = 'Все';

  function render() {
    const term = search.value.trim().toLowerCase();
    const visible = services.filter((service) => {
      const categoryMatch = activeCategory === 'Все' || service.category === activeCategory;
      const searchMatch = !term || `${service.name} ${service.category} ${service.note}`.toLowerCase().includes(term);
      return categoryMatch && searchMatch;
    });
    grid.innerHTML = visible.length ? visible.map((service) => `<article class="service-card"><div class="service-card-top">${getServiceLogo(service)}<span class="service-category-label">${escapeHtml(service.category)}</span></div><h3>${escapeHtml(service.name)}</h3><p>${escapeHtml(service.note)}</p><div class="service-card-footer"><span class="service-overall compat-listed">Подобрать карту</span><a class="service-details-link" href="services.html?service=${encodeURIComponent(service.slug)}">Открыть →</a></div></article>`).join('') : '<div class="service-empty"><h3>Сервис не найден</h3><p>Измените поисковый запрос или категорию.</p></div>';
  }

  container.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    container.querySelectorAll('[data-category]').forEach((item) => item.classList.toggle('active', item === button));
    render();
  }));
  search.addEventListener('input', render);
  document.getElementById('resetServiceFilters').addEventListener('click', () => {
    activeCategory = 'Все';
    search.value = '';
    container.querySelectorAll('[data-category]').forEach((item) => item.classList.toggle('active', item.dataset.category === 'Все'));
    render();
  });
  render();
}

function renderCardMatches(service, cards) {
  const matches = cards.filter((card) => Array.isArray(card.supportedServices) && card.supportedServices.includes(service.slug));
  document.title = `Виртуальные карты для оплаты ${service.name} — CardScope`;
  container.innerHTML = `<section class="service-hero"><div class="container"><a class="back-link" href="services.html">← Все сервисы</a><div class="service-detail-heading">${getServiceLogo(service)}<div><span class="eyebrow">Подбор по сервису</span><h1>Виртуальные карты для оплаты ${escapeHtml(service.name)}</h1><p>${escapeHtml(service.note)}</p></div></div><div class="service-hero-stats"><span><strong>${matches.length}</strong> подходящих карт</span><span><strong>${escapeHtml(service.category)}</strong> категория</span><span><strong>2</strong> источника</span></div></div></section><section class="section service-catalog"><div class="container"><div class="section-heading"><span class="eyebrow">Результат подбора</span><h2>Карты для ${escapeHtml(service.name)}</h2><p class="section-note">В список попали только карты, у которых slug сервиса указан в поле supportedServices.</p></div><div class="service-card-results">${matches.length ? matches.map((card) => `<article class="service-card match-card"><div class="service-card-top">${getLogo(card)}<span class="rating"><b>${escapeHtml(card.rating)}</b> / 5</span></div><h3>${escapeHtml(card.name)}</h3><p>${escapeHtml(card.features)}</p><div class="offer-metrics"><div class="metric"><span>Выпуск</span><strong>${escapeHtml(card.issue)}</strong></div><div class="metric"><span>Обслуживание</span><strong>${escapeHtml(card.service)}</strong></div><div class="metric"><span>Apple Pay / Google Pay</span><strong>${escapeHtml(card.wallets)}</strong></div></div><div class="service-card-footer"><a class="service-details-link" href="detail.html?rank=${card.rank}">Подробнее о карте →</a><a class="official-button" href="${escapeHtml(card.website)}" target="_blank" rel="noreferrer">Официальный сайт ↗</a></div></article>`).join('') : '<div class="service-empty"><h3>Подходящие карты пока не указаны</h3><p>Вернитесь к каталогу и выберите другой сервис.</p></div>'}</div></div></section>`;
}

async function initServicesPage() {
  renderLoading();
  try {
    const cacheBust = `?v=${Date.now()}`;
    const [cardsRes, servicesRes] = await Promise.all([fetch(`data/card-comparison.json${cacheBust}`), fetch(`data/foreign-services.json${cacheBust}`)]);
    if (!cardsRes.ok || !servicesRes.ok) throw new Error('Ошибка загрузки данных');
    const [cards, services] = await Promise.all([cardsRes.json(), servicesRes.json()]);
    if (serviceSlug) {
      const targetService = services.find((service) => service.slug === serviceSlug);
      if (!targetService) return renderError(`Сервис с идентификатором «${serviceSlug}» не найден.`);
      return renderCardMatches(targetService, cards);
    }
    renderServiceCatalog(services);
  } catch (error) {
    renderError('Откройте страницу через локальный сервер, чтобы загрузить JSON-данные.');
  }
}

initServicesPage();
