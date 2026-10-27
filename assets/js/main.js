document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu a');
const sectionNavigationLinks = document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-menu a[href^="#"], .header-contact[href^="#"]');
const topButton = document.querySelector('.top-button');

const capabilityButtons = document.querySelectorAll('.capability-card');
const projectFilterButtons = document.querySelectorAll('.project-filter-btn');
const projectGrid = document.querySelector('.project-grid');
const projectsSection = document.querySelector('#projects');
const emptyProjects = document.querySelector('.empty-projects');
const projectPagination = document.querySelector('.project-pagination');
const projectPaginationStatus = document.querySelector('.project-pagination-status');
const projectPageButtons = document.querySelectorAll('.project-page-btn');

const projectModal = document.querySelector('#project-modal');
const projectModalVisual = document.querySelector('#project-modal-visual');
const projectModalCategory = document.querySelector('#project-modal-category');
const projectModalTitle = document.querySelector('#project-modal-title');
const projectModalSummary = document.querySelector('#project-modal-summary');
const projectModalType = document.querySelector('#project-modal-type');
const projectModalTools = document.querySelector('#project-modal-tools');
const projectModalStatus = document.querySelector('#project-modal-status');
const projectModalDescription = document.querySelector('#project-modal-description');
const projectModalSiteLink = document.querySelector('#project-modal-site-link');

let currentFilter = 'all';
let currentProjectPage = 0;
let lastFocusedElement = null;
let projectModalCloseTimer = null;

const PROJECTS_PER_PAGE = 8;

function toggleMenu() {
  if (!menuButton || !mobileMenu) return;

  const isOpen = mobileMenu.classList.toggle('is-open');

  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.textContent = isOpen ? '닫기' : '메뉴';
  document.body.classList.toggle('menu-open', isOpen);
}

function closeMenu() {
  if (!menuButton || !mobileMenu) return;

  mobileMenu.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = '메뉴';
  document.body.classList.remove('menu-open');
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', toggleMenu);
}

mobileLinks.forEach(function (link) {
  link.addEventListener('click', closeMenu);
});

const introScreen = document.querySelector('.intro-screen');
const introVideo = document.querySelector('.intro-video');
const introScroll = document.querySelector('.intro-scroll');
const introTarget = document.querySelector('#top');
const INTRO_READY_TIME = 2.2;
let introIsReady = false;

function completeIntro() {
  if (introIsReady) return;

  introIsReady = true;
  document.body.classList.remove('intro-active');

  if (introScreen) {
    introScreen.classList.add('is-complete');
  }

  updateTopButton();
}

if (introVideo) {
  introVideo.addEventListener('timeupdate', function () {
    if (introVideo.currentTime >= INTRO_READY_TIME) {
      completeIntro();
    }
  });

  introVideo.addEventListener('ended', completeIntro, { once: true });
  introVideo.addEventListener('error', completeIntro, { once: true });

  if (introVideo.ended) {
    completeIntro();
  }

  const playPromise = introVideo.play();

  if (playPromise) {
    playPromise.catch(completeIntro);
  }
}

if (introScroll && introTarget) {
  introScroll.addEventListener('click', function (event) {
    event.preventDefault();
    completeIntro();

    if (fullpageMedia.matches) {
      moveToSection(introTarget);
      return;
    }

    introTarget.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
}

const pageSections = Array.from(document.querySelectorAll('#main > section'));
const fullpageMedia = window.matchMedia('(min-width: 54.0625rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
const FULLPAGE_SCROLL_DURATION = 680;
const NAVIGATION_SCROLL_DURATION = 920;

let fullpageIsMoving = false;
let fullpageFrameId = 0;
let fullpageSettleTimer = 0;

function updateFullpageMode() {
  const isEnabled = fullpageMedia.matches;

  document.documentElement.classList.toggle('fullpage-scroll', isEnabled);
  window.clearTimeout(fullpageSettleTimer);

  if (!isEnabled && fullpageFrameId) {
    window.cancelAnimationFrame(fullpageFrameId);
    fullpageFrameId = 0;
    fullpageIsMoving = false;
  }
}

function getCurrentSectionIndex() {
  if (!pageSections.length) return -1;

  const viewportCenter = window.scrollY + (window.innerHeight / 2);
  let currentIndex = 0;
  let closestDistance = Infinity;

  pageSections.forEach(function (section, index) {
    const sectionCenter = section.offsetTop + (section.offsetHeight / 2);
    const distance = Math.abs(sectionCenter - viewportCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      currentIndex = index;
    }
  });

  return currentIndex;
}

function canScrollProjectGrid(target, direction) {
  if (!(target instanceof Element)) return false;

  const scrollArea = target.closest('.project-grid');

  if (!scrollArea || scrollArea.scrollHeight <= scrollArea.clientHeight + 2) {
    return false;
  }

  const isAtTop = scrollArea.scrollTop <= 2;
  const isAtBottom = scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - 2;

  return direction > 0 ? !isAtBottom : !isAtTop;
}

function isViewingProjectsSection() {
  if (!projectsSection) return false;

  const sectionTop = projectsSection.offsetTop;
  const sectionBottom = sectionTop + projectsSection.offsetHeight;
  const viewportTop = window.scrollY;
  const viewportBottom = viewportTop + window.innerHeight;

  return viewportBottom > sectionTop + 2 && viewportTop < sectionBottom - 2;
}

function canScrollProjectsSection(direction) {
  if (!projectsSection) return false;

  const sectionTop = projectsSection.offsetTop;
  const sectionBottom = sectionTop + projectsSection.offsetHeight;
  const viewportTop = window.scrollY;
  const viewportBottom = viewportTop + window.innerHeight;
  const isOnProjectsSection = viewportTop >= sectionTop - 2 && viewportTop < sectionBottom - 2;

  if (!isOnProjectsSection) return false;

  const isAtTop = viewportTop <= sectionTop + 2;
  const isAtBottom = viewportBottom >= sectionBottom - 2;

  return direction > 0 ? !isAtBottom : !isAtTop;
}

function moveToSection(section, minimumDuration = FULLPAGE_SCROLL_DURATION) {
  const startPosition = window.scrollY;
  const targetPosition = section.getBoundingClientRect().top + window.scrollY;
  const distance = targetPosition - startPosition;
  const startedAt = performance.now();
  const duration = Math.min(1250, Math.max(minimumDuration, Math.abs(distance) / 1.9));

  if (Math.abs(distance) < 2) return;

  if (fullpageFrameId) {
    window.cancelAnimationFrame(fullpageFrameId);
  }

  fullpageIsMoving = true;

  function easeInOutCubic(progress) {
    return progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - (Math.pow(-2 * progress + 2, 3) / 2);
  }

  function animate(now) {
    const progress = Math.min((now - startedAt) / duration, 1);

    window.scrollTo(0, startPosition + (distance * easeInOutCubic(progress)));

    if (progress < 1) {
      fullpageFrameId = window.requestAnimationFrame(animate);
      return;
    }

    window.scrollTo(0, targetPosition);
    fullpageFrameId = 0;
    fullpageIsMoving = false;
  }

  fullpageFrameId = window.requestAnimationFrame(animate);
}

function moveToNavigationTarget(target) {
  if (!target) return;

  if (fullpageMedia.matches) {
    moveToSection(target, NAVIGATION_SCROLL_DURATION);
    return;
  }

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

function handleSectionNavigation(event) {
  const link = event.currentTarget;
  const targetId = link.getAttribute('href');
  const target = targetId ? document.querySelector(targetId) : null;

  if (!target) return;

  event.preventDefault();
  closeMenu();
  moveToNavigationTarget(target);

  if (window.history && window.history.pushState) {
    window.history.pushState(null, '', targetId);
  }
}

function updateTopButton() {
  if (!topButton) return;

  const hero = document.querySelector('#top');
  const showAfter = hero
    ? hero.offsetTop + (window.innerHeight * .45)
    : window.innerHeight;
  const shouldShow = !document.body.classList.contains('intro-active') && window.scrollY > showAfter;

  topButton.classList.toggle('is-visible', shouldShow);
}

sectionNavigationLinks.forEach(function (link) {
  link.addEventListener('click', handleSectionNavigation);
});

if (topButton) {
  topButton.addEventListener('click', function () {
    moveToNavigationTarget(document.querySelector('#top'));
  });
}

function settleToClosestSection() {
  if (
    !fullpageMedia.matches ||
    fullpageIsMoving ||
    document.body.classList.contains('menu-open') ||
    document.body.classList.contains('modal-open') ||
    isViewingProjectsSection()
  ) {
    return;
  }

  const currentIndex = getCurrentSectionIndex();
  const currentSection = pageSections[currentIndex];

  if (!currentSection) return;

  moveToSection(currentSection);
}

function handleFullpageScroll() {
  if (!fullpageMedia.matches || fullpageIsMoving) return;

  window.clearTimeout(fullpageSettleTimer);

  if (isViewingProjectsSection()) return;

  fullpageSettleTimer = window.setTimeout(settleToClosestSection, 140);
}

function handleFullpageWheel(event) {
  if (
    !fullpageMedia.matches ||
    document.body.classList.contains('intro-active') ||
    document.body.classList.contains('menu-open') ||
    document.body.classList.contains('modal-open') ||
    event.ctrlKey
  ) {
    return;
  }

  const direction = Math.sign(event.deltaY);

  if (
    !direction ||
    canScrollProjectGrid(event.target, direction) ||
    canScrollProjectsSection(direction)
  ) {
    return;
  }

  const currentIndex = getCurrentSectionIndex();
  const nextIndex = currentIndex + direction;

  if (nextIndex < 0 || nextIndex >= pageSections.length) {
    return;
  }

  event.preventDefault();

  if (fullpageIsMoving) return;
  moveToSection(pageSections[nextIndex]);
}

if (pageSections.length) {
  updateFullpageMode();
  fullpageMedia.addEventListener('change', updateFullpageMode);
  window.addEventListener('wheel', handleFullpageWheel, { passive: false });
  window.addEventListener('scroll', handleFullpageScroll, { passive: true });
}

window.addEventListener('scroll', updateTopButton, { passive: true });
window.addEventListener('resize', updateTopButton);
updateTopButton();

function getProjects() {
  return Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getProjectCategories(project) {
  return Array.isArray(project.categories)
    ? project.categories.map(function (category) {
      return String(category).toLowerCase();
    })
    : [];
}

function matchesFilter(project, filter) {
  if (filter === 'all') return true;

  const categories = getProjectCategories(project);

  const aliases = {
    graphic: ['graphic', 'design', 'ui', 'ux'],
    motion: ['motion'],
    web: ['web', 'publishing', 'frontend']
  };

  const targets = aliases[filter] || [filter];

  return categories.some(function (category) {
    return targets.includes(category);
  });
}

function getCategoryLabel(project) {
  const categories = getProjectCategories(project);
  const labels = [];

  if (categories.some(function (category) {
    return ['graphic', 'design', 'ui', 'ux'].includes(category);
  })) {
    labels.push('GRAPHIC & UI DESIGN');
  }

  if (categories.includes('motion')) {
    labels.push('MOTION DESIGN');
  }

  if (categories.some(function (category) {
    return ['web', 'publishing', 'frontend'].includes(category);
  })) {
    labels.push('WEB PUBLISHING');
  }

  return labels.length > 0
    ? labels.join(' · ')
    : (project.label || 'SELECTED WORK');
}

function getProjectImage(project) {
  return project.cardImage || project.thumbnail || project.image || '';
}

function getProjectDescription(project) {
  return project.description || project.detail || project.summary || '작업의 목적과 콘텐츠에 맞춰 시각 요소와 화면 구조를 구성한 작업물입니다.';
}

function createProjectSiteLink(project) {
  const isWebProject = getProjectCategories(project).some(function (category) {
    return ['web', 'publishing', 'frontend'].includes(category);
  });
  const url = String(project.siteUrl || '').trim();
  if (!isWebProject || !/^https?:\/\//i.test(url)) return '';
  const label = '홈페이지 보기';
  return `<a class="team-website-button" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function createProjectVisual(project) {
  const number = escapeHtml(project.number || '01');
  const label = escapeHtml(project.label || getCategoryLabel(project));
  const title = escapeHtml(project.title || 'SELECTED WORK');
  const image = getProjectImage(project);
  const caption = `
    <div class="project-visual-caption">
      <span>${title}</span>
      <b>DETAIL <i aria-hidden="true">→</i></b>
    </div>
  `;

  if (image) {
    return `
      <div class="project-visual has-image" aria-hidden="true">
        <img class="project-image" src="${escapeHtml(image)}" alt="" loading="lazy">
        ${project.videoSrc ? `<span class="project-video-badge">▶ VIDEO · ${formatVideoDuration(project.duration)}</span>` : ''}
      </div>
    `;
  }

  return `
    <div class="project-visual" aria-hidden="true">
      <div class="visual-topline">
        <span>${number}</span>
        <span>${label}</span>
      </div>

      <div class="visual-window">
        <div class="visual-rail">
          <i></i><i></i><i></i>
        </div>

        <div class="visual-canvas">
          <span class="visual-kicker"></span>
          <span class="visual-title-line"></span>
          <span class="visual-title-line short"></span>
          <div class="visual-modules">
            <i></i><i></i><i></i>
          </div>
        </div>
      </div>

      ${caption}
      <strong>${number}</strong>
    </div>
  `;
}

function getProjectTheme(project) {
  const themes = {
    'GRAPHIC DESIGN': { accent: '#a7673d', soft: '#f7e9df' },
    'UI DESIGN': { accent: '#287d70', soft: '#e7f3ef' },
    'MOTION DESIGN': { accent: '#7654b3', soft: '#efe9fa' },
    'WEB PUBLISHING': { accent: '#3156b8', soft: '#e9eeff' }
  };
  const label = String(project.label || '').trim().toUpperCase();
  return themes[label] || { accent: '#626977', soft: '#edf0f4' };
}

function createProjectCard(project) {
  const toolList = Array.isArray(project.tools)
    ? project.tools.slice(0, 4).map(function (tool) {
      return `<li>${escapeHtml(tool)}</li>`;
    }).join('')
    : '';

  const theme = getProjectTheme(project);
  const accent = theme.accent;
  const accentSoft = theme.soft;
  const categoryLabel = project.label || getCategoryLabel(project);

  return `
    <article
      class="project-card${project.videoSrc ? ' is-video' : ''}"
      style="--project-accent: ${escapeHtml(accent)}; --project-soft: ${escapeHtml(accentSoft)};"
    >
      <button
        class="project-card-button"
        type="button"
        data-project-slug="${escapeHtml(project.slug || '')}"
        aria-label="${escapeHtml(project.title || '작업물')} 상세 보기"
      >
        ${createProjectVisual(project)}

        <div class="project-copy">
          <div class="project-copy-meta">
            <span class="work-category-label">${escapeHtml(categoryLabel)}</span>
            <span>${escapeHtml(project.status || 'WORK')}</span>
          </div>

          <h3 title="${escapeHtml(project.title || 'Untitled Work')}">${escapeHtml(project.title || 'Untitled Work')}</h3>
          <p>${escapeHtml(project.summary || '')}</p>

          <div class="project-footer">
            <ul aria-label="사용 도구">${toolList}</ul>
            <span class="project-arrow">상세보기 <b aria-hidden="true">→</b></span>
          </div>
        </div>
      </button>
    </article>
  `;
}

function updateFilterButtons(filter) {
  capabilityButtons.forEach(function (button) {
    const isActive = button.dataset.filter === filter;

    button.classList.remove('is-active');
    button.setAttribute('aria-pressed', String(isActive));
  });

  projectFilterButtons.forEach(function (button) {
    const isActive = button.dataset.filter === filter;

    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function renderProjects(filter) {
  if (!projectGrid) return;

  const projects = getProjects();
  const visibleProjects = projects.filter(function (project) {
    return matchesFilter(project, filter);
  });
  const totalPages = Math.max(1, Math.ceil(visibleProjects.length / PROJECTS_PER_PAGE));

  currentProjectPage = Math.min(currentProjectPage, totalPages - 1);

  const startIndex = currentProjectPage * PROJECTS_PER_PAGE;
  const isMobileSlider = window.matchMedia('(max-width: 54rem)').matches;
  const pageProjects = isMobileSlider ? visibleProjects : visibleProjects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

  projectGrid.innerHTML = pageProjects
    .map(createProjectCard)
    .join('');

  if (emptyProjects) {
    emptyProjects.hidden = visibleProjects.length !== 0;
  }

  projectGrid.scrollLeft = 0;
  updateProjectPagination(visibleProjects.length, totalPages, startIndex);
  if (isMobileSlider && projectPagination) projectPagination.hidden = true;
}

function updateProjectPagination(totalProjects, totalPages, startIndex) {
  if (!projectPagination) return;

  const hasMoreThanOnePage = totalProjects > PROJECTS_PER_PAGE;
  const from = totalProjects === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + PROJECTS_PER_PAGE, totalProjects);

  projectPagination.hidden = !hasMoreThanOnePage;

  if (projectPaginationStatus) {
    projectPaginationStatus.textContent =
      'SHOWING ' +
      String(from).padStart(2, '0') +
      '–' +
      String(to).padStart(2, '0') +
      ' OF ' +
      String(totalProjects).padStart(2, '0') +
      ' · ' +
      String(currentProjectPage + 1).padStart(2, '0') +
      ' / ' +
      String(totalPages).padStart(2, '0');
  }

  projectPageButtons.forEach(function (button) {
    const direction = button.dataset.projectPage;
    const isDisabled =
      (direction === 'prev' && currentProjectPage === 0) ||
      (direction === 'next' && currentProjectPage >= totalPages - 1);

    button.disabled = isDisabled;
    button.setAttribute('aria-disabled', String(isDisabled));
  });
}

function setProjectFilter(filter, shouldScroll) {
  currentFilter = filter || 'all';
  currentProjectPage = 0;

  updateFilterButtons(currentFilter);
  renderProjects(currentFilter);

  if (shouldScroll) {
    const projectsSection = document.querySelector('#projects');

    if (projectsSection) {
      projectsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}

capabilityButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    setProjectFilter(button.dataset.filter || 'all', true);
  });
});

projectFilterButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    setProjectFilter(button.dataset.filter || 'all', false);
  });
});

projectPageButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    const projects = getProjects().filter(function (project) {
      return matchesFilter(project, currentFilter);
    });
    const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);

    if (button.dataset.projectPage === 'prev' && currentProjectPage > 0) {
      currentProjectPage -= 1;
    }

    if (button.dataset.projectPage === 'next' && currentProjectPage < totalPages - 1) {
      currentProjectPage += 1;
    }

    renderProjects(currentFilter);
    moveToNavigationTarget(document.querySelector('#projects'));
  });
});

function formatVideoDuration(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  return Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0');
}

function createProjectVideo(project) {
  const poster = getProjectImage(project);
  const hasAudio = project.hasAudio !== false;
  return `
    <div class="project-video-player">
      <video class="project-modal-video" controls playsinline preload="metadata"
        ${poster ? `poster="${escapeHtml(poster)}"` : ''}
        aria-label="${escapeHtml(project.title || '작업물')} 영상">
        <source src="${escapeHtml(project.videoSrc)}" type="video/mp4">
        이 브라우저는 영상 재생을 지원하지 않습니다.
      </video>
      <div class="project-video-toolbar">
        <button class="project-video-toggle" type="button">▶ 재생</button>
        <div class="project-video-volume">
          <button class="project-video-mute" type="button" aria-label="음소거" aria-pressed="false"
            ${hasAudio ? '' : 'disabled'}>${hasAudio ? '음소거' : '무음 영상'}</button>
          <input class="project-video-volume-range" type="range" min="0" max="100" step="1"
            value="${hasAudio ? 60 : 0}" aria-label="영상 음량" ${hasAudio ? '' : 'disabled'}>
          <output class="project-video-volume-value" aria-label="현재 음량">${hasAudio ? '60%' : '0%'}</output>
        </div>
      </div>
      <p class="project-video-message" role="status">재생 버튼을 눌러 영상을 감상하세요.</p>
      <a class="project-video-direct" href="${escapeHtml(project.videoSrc)}" target="_blank" rel="noopener">영상 파일 열기 →</a>
    </div>
  `;
}

function setupProjectVideo(container, project) {
  const video = container.querySelector('video');
  const toggle = container.querySelector('.project-video-toggle');
  const mute = container.querySelector('.project-video-mute');
  const range = container.querySelector('.project-video-volume-range');
  const output = container.querySelector('.project-video-volume-value');
  const message = container.querySelector('.project-video-message');
  let lastVolume = .6;
  video.volume = project.hasAudio === false ? 0 : .6;

  function syncPlayback() {
    toggle.textContent = video.paused ? '▶ 재생' : 'Ⅱ 일시정지';
  }
  function syncVolume() {
    const silent = video.muted || video.volume === 0;
    const value = silent ? 0 : Math.round(video.volume * 100);
    range.value = String(value);
    output.textContent = value + '%';
    mute.setAttribute('aria-pressed', String(silent));
    if (project.hasAudio !== false) {
      mute.textContent = silent ? '소리 켜기' : '음소거';
      mute.setAttribute('aria-label', silent ? '음소거 해제' : '음소거');
    }
  }
  toggle.addEventListener('click', function () {
    if (video.paused) {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          message.textContent = '영상을 재생할 수 없습니다. 아래 영상 파일 열기로 확인해 주세요.';
        });
      }
    } else video.pause();
  });
  range.addEventListener('input', function () {
    video.volume = Number(range.value) / 100;
    video.muted = video.volume === 0;
    if (video.volume > 0) lastVolume = video.volume;
    syncVolume();
  });
  mute.addEventListener('click', function () {
    if (video.muted || video.volume === 0) {
      if (video.volume === 0) video.volume = lastVolume;
      video.muted = false;
    } else {
      lastVolume = video.volume;
      video.muted = true;
    }
    syncVolume();
  });
  video.addEventListener('play', function () {
    syncPlayback();
    message.textContent = '재생 중 · 하단 재생 막대로 원하는 위치로 이동할 수 있습니다.';
  });
  video.addEventListener('pause', function () {
    syncPlayback();
    message.textContent = video.ended ? '재생이 끝났습니다. 다시 재생할 수 있습니다.' : '일시정지';
  });
  video.addEventListener('ended', function () {
    syncPlayback();
    message.textContent = '재생이 끝났습니다. 다시 재생할 수 있습니다.';
  });
  video.addEventListener('volumechange', syncVolume);
  function showVideoError() {
    message.textContent = '영상 파일을 불러오지 못했습니다. 아래 영상 파일 열기로 확인해 주세요.';
  }
  video.addEventListener('error', showVideoError);
  video.querySelector('source').addEventListener('error', showVideoError);
  syncPlayback();
  syncVolume();
}

function stopProjectVideo() {
  if (!projectModalVisual) return;
  projectModalVisual.querySelectorAll('video').forEach(function (video) {
    video.pause();
  });
}

function findProjectBySlug(slug) {
  return getProjects().find(function (project) {
    return String(project.slug || '') === String(slug || '');
  });
}

function setupFigmaGallery(container, slides) {
  container.innerHTML = `<div class="figma-gallery"><div class="figma-gallery-stage" aria-live="polite"></div><p class="figma-gallery-caption"></p><a class="figma-original-link" target="_blank" rel="noopener noreferrer"><span>원본 이미지 보기</span><span aria-hidden="true">→</span></a><div class="figma-gallery-tabs" role="group" aria-label="피그마 작업 이미지 선택">${slides.map((item, index) => `<button type="button" data-figma-index="${index}" aria-pressed="false"><img src="${escapeHtml(item.image)}" alt=""><span>${index + 1}. ${escapeHtml(item.title)}</span></button>`).join('')}</div></div>`;
  const stage = container.querySelector('.figma-gallery-stage');
  const caption = container.querySelector('.figma-gallery-caption');
  const buttons = Array.from(container.querySelectorAll('[data-figma-index]'));
  function select(index) {
    const item = slides[index];
    container.querySelector('.figma-original-link').href = item.sourceImage || item.image;
    stage.innerHTML = `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">`;
    stage.querySelector('img').addEventListener('error', () => {
      stage.textContent = item.title + ' 이미지를 확인해 주세요.';
    }, { once: true });
    caption.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')} · ${item.title}`;
    buttons.forEach((button, n) => button.setAttribute('aria-pressed', String(n === index)));
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + slides.length) % slides.length;
      select(next);
      buttons[next].focus();
    });
  });
  select(0);
}

function openProjectModal(project, triggerElement) {
  if (!projectModal || !project) return;

  lastFocusedElement = triggerElement || document.activeElement;

  const theme = getProjectTheme(project);
  projectModal.style.setProperty('--project-accent', theme.accent);
  projectModal.style.setProperty('--project-soft', theme.soft);

  window.clearTimeout(projectModalCloseTimer);
  stopProjectVideo();

  if (projectModalVisual) {
    projectModalVisual.classList.toggle('has-video', Boolean(project.videoSrc));
    projectModalVisual.classList.toggle('has-figma-gallery', Boolean(project.figmaSlides?.length));
    if (Array.isArray(project.figmaSlides) && project.figmaSlides.length) {
      setupFigmaGallery(projectModalVisual, project.figmaSlides);
    } else if (project.videoSrc) {
      projectModalVisual.innerHTML = createProjectVideo(project);
      setupProjectVideo(projectModalVisual, project);
    } else if (getProjectImage(project)) {
      projectModalVisual.innerHTML = `
        <img class="project-modal-image"
          src="${escapeHtml(getProjectImage(project))}"
          alt="${escapeHtml(project.title || '작업물')}">
      `;
    } else {
      projectModalVisual.innerHTML = createProjectVisual(project);
    }
  }

  if (projectModalCategory) {
    projectModalCategory.textContent = project.label || getCategoryLabel(project);
  }

  if (projectModalTitle) {
    projectModalTitle.textContent = project.title || '작업물';
  }

  if (projectModalSummary) {
    projectModalSummary.textContent = project.summary || '';
  }

  if (projectModalType) {
    projectModalType.textContent = getCategoryLabel(project);
  }

  if (projectModalTools) {
    projectModalTools.textContent = Array.isArray(project.tools)
      ? project.tools.join(' · ')
      : '-';
  }

  if (projectModalStatus) {
    projectModalStatus.textContent = project.status || project.label || 'WORK';
  }

  if (projectModalDescription) {
    projectModalDescription.textContent = getProjectDescription(project);
  }

  if (projectModalSiteLink) {
    const siteLink = createProjectSiteLink(project);

    projectModalSiteLink.innerHTML = siteLink;
    projectModalSiteLink.hidden = !siteLink;
  }

  projectModal.hidden = false;
  document.body.classList.add('modal-open');

  requestAnimationFrame(function () {
    projectModal.classList.add('is-open');
  });

  const closeButton = projectModal.querySelector('.project-modal-close');
  if (closeButton) closeButton.focus();
}

function closeProjectModal() {
  if (!projectModal || projectModal.hidden) return;

  stopProjectVideo();
  projectModal.classList.remove('is-open');
  document.body.classList.remove('modal-open');

  projectModalCloseTimer = window.setTimeout(function () {
    projectModal.hidden = true;
    if (projectModalVisual) projectModalVisual.replaceChildren();

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }, 280);
}

if (projectGrid) {
  projectGrid.addEventListener('click', function (event) {
    const button = event.target.closest('.project-card-button');
    if (!button) return;

    const project = findProjectBySlug(button.dataset.projectSlug);
    openProjectModal(project, button);
  });
}

if (projectModal) {
  projectModal.addEventListener('click', function (event) {
    if (event.target.closest('[data-close-modal]')) {
      closeProjectModal();
    }
  });
}

window.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeProjectModal();
  }
});

const revealSections = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealSections.forEach(function (section) {
    revealObserver.observe(section);
  });
} else {
  revealSections.forEach(function (section) {
    section.classList.add('is-visible');
  });
}

setProjectFilter(currentFilter, false);

const hero = document.querySelector('.hero');
const ball = document.querySelector('.hero-ball');

if (hero && ball) {
  let x = 100;
  let y = 100;

  let speedX = 1.8;
  let speedY = 1.5;

  function randomSpeed(min, max) {
    return Math.random() * (max - min) + min;
  }

  function moveBall() {
    const heroWidth = hero.clientWidth;
    const heroHeight = hero.clientHeight;
    const ballSize = ball.offsetWidth;

    x += speedX;
    y += speedY;

    if (x + ballSize >= heroWidth) {
      x = heroWidth - ballSize;
      speedX = -randomSpeed(1.2, 2.5);
      speedY += randomSpeed(-0.4, 0.4);
    }

    if (x <= 0) {
      x = 0;
      speedX = randomSpeed(1.2, 2.5);
      speedY += randomSpeed(-0.4, 0.4);
    }

    if (y + ballSize >= heroHeight) {
      y = heroHeight - ballSize;
      speedY = -randomSpeed(1.2, 2.5);
      speedX += randomSpeed(-0.4, 0.4);
    }

    if (y <= 0) {
      y = 0;
      speedY = randomSpeed(1.2, 2.5);
      speedX += randomSpeed(-0.4, 0.4);
    }

    speedX = Math.max(-2.8, Math.min(2.8, speedX));
    speedY = Math.max(-2.8, Math.min(2.8, speedY));

    ball.style.transform = `translate3d(${x}px, ${y}px, 0)`;

    requestAnimationFrame(moveBall);
  }

  moveBall();
}

const teamSlider = document.querySelector('.team-slider');

if (teamSlider) {

  const teamTrack =
    teamSlider.querySelector('.team-slider-track');

  const teamSlides =
    teamSlider.querySelectorAll('.team-slide');

  const teamPrev =
    teamSlider.querySelector('.team-prev');

  const teamNext =
    teamSlider.querySelector('.team-next');

  const teamCurrent =
    teamSlider.querySelector('.team-current');

  const teamTotal =
    teamSlider.querySelector('.team-total');


  let teamIndex = 0;

  teamTotal.textContent =
    String(teamSlides.length).padStart(2, '0');

  function updateTeamSlider() {

    teamTrack.style.transform =
      `translateX(-${teamIndex * 100}%)`;

    teamCurrent.textContent =
      String(teamIndex + 1).padStart(2, '0');

    teamPrev.disabled =
      teamIndex === 0;

    teamNext.disabled =
      teamIndex === teamSlides.length - 1;

  }

  teamNext.addEventListener('click', function () {

    if (teamIndex < teamSlides.length - 1) {
      teamIndex++;
      updateTeamSlider();
    }

  });

  teamPrev.addEventListener('click', function () {

    if (teamIndex > 0) {
      teamIndex--;
      updateTeamSlider();
    }

  });

  let touchStartX = 0;
  let touchEndX = 0;


  teamTrack.addEventListener(
    'touchstart',
    function (event) {
      touchStartX =
        event.changedTouches[0].screenX;
    },
    {
      passive: true
    }
  );

  teamTrack.addEventListener(
    'touchend',
    function (event) {
      touchEndX =
        event.changedTouches[0].screenX;
      const swipeDistance =
        touchStartX - touchEndX;

      if (
        swipeDistance > 60 &&
        teamIndex < teamSlides.length - 1
      ) {
        teamIndex++;
        updateTeamSlider();
      }

      if (
        swipeDistance < -60 &&
        teamIndex > 0
      ) {
        teamIndex--;
        updateTeamSlider();
      }

    },
    {
      passive: true
    }
  );

  updateTeamSlider();

}


document.querySelectorAll('.team-project-media img').forEach(function (image) {
  function showImageFallback() {
    image.hidden = true;
    image.parentElement.classList.add('is-empty');
  }

  image.addEventListener('error', showImageFallback);

  image.addEventListener('load', function () {
    image.hidden = false;
    image.parentElement.classList.remove('is-empty');
  });

  if (image.complete && image.naturalWidth === 0) showImageFallback();
});

(() => {
  const modal = document.getElementById('team-case-modal');
  if (!modal) return;

  const dialog = modal.querySelector('.team-case-dialog');
  const content = document.getElementById('team-case-content');
  const close = modal.querySelector('.team-case-close');

  const esc = v => String(v || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

  let trigger, slides = [], index = 0, slideTrigger, zoom = 100;

  const viewer = document.createElement('div');
  viewer.className = 'team-image-viewer';
  viewer.hidden = true;

  viewer.innerHTML = `
    <section class="team-viewer-dialog" role="dialog" aria-modal="true" aria-labelledby="team-viewer-title">
      <header>
        <strong id="team-viewer-title"></strong>
        <button type="button" data-view="close" aria-label="확대 이미지 닫기">×</button>
      </header>
      <div class="team-viewer-scroll">
        <img alt="">
      </div>
      <footer>
        <button type="button" data-view="prev" aria-label="이전 이미지">←</button>
        <button type="button" data-view="minus" aria-label="축소">−</button>
        <span class="team-zoom"></span>
        <button type="button" data-view="plus" aria-label="확대">＋</button>
        <button type="button" data-view="fit">화면 맞춤</button>
        <button type="button" data-view="next" aria-label="다음 이미지">→</button>
      </footer>
    </section>
  `;

  document.body.appendChild(viewer);

  const vi = viewer.querySelector('img');
  const scroll = viewer.querySelector('.team-viewer-scroll');

  function updateZoom() {
    vi.style.width = zoom + '%';
    viewer.querySelector('.team-zoom').textContent = zoom + '%';
  }

  function updateViewer() {
    vi.src = slides[index].image;
    vi.alt = slides[index].title;

    viewer.querySelector('strong').textContent =
      String(index + 1).padStart(2, '0') + ' / ' +
      String(slides.length).padStart(2, '0') + ' · ' +
      slides[index].title;

    zoom = 100;
    updateZoom();

    scroll.scrollTop = 0;
    scroll.scrollLeft = 0;

    viewer.querySelector('[data-view="prev"]').disabled = index === 0;
    viewer.querySelector('[data-view="next"]').disabled = index === slides.length - 1;
  }

  function closeViewer() {
    viewer.hidden = true;
    dialog.removeAttribute('inert');

    const current = content.querySelector('.team-design-open');
    if (current) current.focus({ preventScroll: true });
  }

  function draw() {
    const item = slides[index];
    const frame = content.querySelector('.team-design-frame');

    frame.innerHTML = item.image
      ? `
        <button type="button" class="team-design-open" aria-label="${esc(item.title)} 확대 보기">
          <img src="${esc(item.image)}" alt="${esc(item.title)}">
        </button>
      `
      : `
        <div class="team-design-empty">
          <strong>${esc(item.title)}</strong>
          <span>피그마 이미지를 넣어 주세요</span>
        </div>
      `;

    const img = frame.querySelector('img');

    if (img) {
      img.addEventListener('error', () => {
        frame.innerHTML = '<div class="team-design-empty">이미지 경로를 확인해 주세요</div>';
      }, { once: true });
    }

    content.querySelector('.team-design-title').textContent = item.title;
    content.querySelector('.team-design-caption').textContent = item.caption || '';
    content.querySelector('.team-design-count').textContent =
      String(index + 1).padStart(2, '0') + ' / ' +
      String(slides.length).padStart(2, '0');

    const sourceLink = content.querySelector('.team-design-source');

    if (sourceLink) {
      const source = item.sourceImage || item.image;
      sourceLink.hidden = !source;
      if (source) sourceLink.href = source;
    }

    content.querySelector('[data-slide="prev"]').disabled = index === 0;
    content.querySelector('[data-slide="next"]').disabled = index === slides.length - 1;

    content.querySelectorAll('[data-slide-index]').forEach((b, i) => {
      b.setAttribute('aria-pressed', String(i === index));
    });

    const open = frame.querySelector('button');

    if (open) {
      open.addEventListener('click', () => {
        slideTrigger = open;
        viewer.hidden = false;
        dialog.setAttribute('inert', '');
        updateViewer();
        viewer.querySelector('[data-view="close"]').focus();
      });
    }
  }

  function move(delta) {
    index = Math.max(0, Math.min(slides.length - 1, index + delta));
    draw();
  }

  function hide() {
    if (!viewer.hidden) {
      closeViewer();
      return;
    }

    modal.hidden = true;
    document.body.classList.remove('modal-open');

    if (trigger) trigger.focus({ preventScroll: true });
  }

  document.querySelectorAll('[data-team-project]').forEach((link, i) => {
    const p = window.TEAM_PROJECTS[i];
    if (!p) return;

    link.querySelector('h3').textContent = p.title;
    link.querySelector('.team-project-copy > p').textContent = p.summary;

    const values = link.querySelectorAll('.team-project-meta strong');

    if (values[0]) values[0].textContent = p.role;
    if (values[1]) values[1].textContent = (p.tools || []).join(' · ');

    link.addEventListener('click', e => {
      e.preventDefault();

      trigger = link;
      slides = p.designSlides;
      index = 0;

      const links = (
        p.projectType === 'design'
          ? [
            ['피그마 보기', p.figmaUrl],
            ['프로토타입 보기', p.prototypeUrl],
            ['발표 PDF 보기', p.presentationUrl]
          ]
          : [
            ['홈페이지 보기', p.siteUrl]
          ]
      )
        .filter(([, url]) => /^(https?:\/\/|(?:\.\.?\/)?assets\/)/i.test(url || ''))
        .map(([label, url]) => `
          <a class="team-website-button" href="${esc(url)}" target="_blank" rel="noopener noreferrer">
            ${label}
          </a>
        `)
        .join('');

      content.innerHTML = `
        <p class="team-case-eyebrow">TEAM PROJECT / CASE STUDY</p>
        <h2 id="team-case-title">${esc(p.title)}</h2>
        <p class="team-case-summary">${esc(p.summary)}</p>

        <div class="team-case-meta">
          <div>
            <small>TEAM</small>
            <strong>${esc(p.team || '팀 인원 입력')}</strong>
          </div>
          <div>
            <small>DURATION</small>
            <strong>${esc(p.duration || '기간 입력')}</strong>
          </div>
          <div>
            <small>ROLE</small>
            <strong>${esc(p.role)}</strong>
          </div>
        </div>

        <section>
          <h3>01 프로젝트 소개</h3>
          <p class="team-case-text">${esc(p.description || '프로젝트 소개를 입력해 주세요.')}</p>
          <p class="team-case-tools">${(p.tools || []).map(esc).join(' · ')}</p>
        </section>

        <section class="team-design-section">
          <div class="team-design-heading">
            <h3>02 피그마 디자인 과정</h3>
            <span class="team-design-count" aria-live="polite"></span>
          </div>

          <div class="team-design-stage">
            <button type="button" class="team-design-arrow" data-slide="prev" aria-label="이전 디자인">←</button>
            <div class="team-design-frame"></div>
            <button type="button" class="team-design-arrow" data-slide="next" aria-label="다음 디자인">→</button>
          </div>

          <div class="team-design-info">
            <h4 class="team-design-title"></h4>
            <p class="team-design-caption"></p>
          </div>

          <a class="team-design-source" target="_blank" rel="noopener noreferrer" hidden>
            <span>원본 이미지 보기</span>
            <span aria-hidden="true">→</span>
          </a>

          <div class="team-design-dots ${i === 0 ? 'is-gallery' : ''}" aria-label="디자인 선택">
            ${slides.map((item, n) => `
              <button type="button" data-slide-index="${n}" aria-label="${esc(item.title)}" aria-pressed="false">
                ${i === 0
          ? `<img src="${esc(item.image)}" alt=""><span>${n + 1}. ${esc(item.title)}</span>`
          : String(n + 1).padStart(2, '0')
        }
              </button>
            `).join('')}
          </div>
        </section>

        <section>
          <h3>03 ${p.projectType === 'design' ? '디자인 설명' : '웹 구현 및 협업'}</h3>
          <p class="team-case-text">
            ${esc(p.implementation || (
          p.projectType === 'design'
            ? '디자인 의도와 작업 설명을 입력해 주세요.'
            : '담당 페이지와 구현 과정, 협업 내용을 입력해 주세요.'
        ))}
          </p>
        </section>

        <section class="team-contribution">
          <h3>04 나의 역량 · 담당 역할</h3>
          <dl class="team-contribution-list">
            ${[
          ['담당 역할', p.myRole || '내가 맡은 역할과 담당 페이지를 입력해 주세요.'],
          ['직접 작업한 내용', p.myWork || '직접 디자인하거나 구현한 내용을 입력해 주세요.'],
          ['활용한 역량', p.mySkills || '사용한 도구와 문제 해결에 활용한 역량을 입력해 주세요.'],
          ['배운 점', p.myLearning || '협업 과정에서 배운 점과 개선한 내용을 입력해 주세요.']
        ].map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}
          </dl>
        </section>

        ${links ? `<nav class="team-case-actions">${links}</nav>` : ''}
      `;

      content.querySelectorAll('[data-slide]').forEach(b => {
        b.addEventListener('click', () => {
          move(b.dataset.slide === 'prev' ? -1 : 1);
        });
      });

      content.querySelectorAll('[data-slide-index]').forEach(b => {
        b.addEventListener('click', () => {
          index = Number(b.dataset.slideIndex);
          draw();
        });
      });

      let x;
      const stage = content.querySelector('.team-design-frame');

      stage.addEventListener('touchstart', e => {
        x = e.changedTouches[0].clientX;
      }, { passive: true });

      stage.addEventListener('touchend', e => {
        const delta = e.changedTouches[0].clientX - x;
        if (Math.abs(delta) > 60) move(delta < 0 ? 1 : -1);
      }, { passive: true });

      draw();

      modal.hidden = false;
      document.body.classList.add('modal-open');
      dialog.scrollTop = 0;
      close.focus({ preventScroll: true });
    });
  });

  close.addEventListener('click', hide);

  modal.addEventListener('click', e => {
    if (e.target === modal) hide();
  });

  viewer.addEventListener('click', e => {
    if (e.target === viewer) closeViewer();
  });

  viewer.querySelectorAll('[data-view]').forEach(b => {
    b.addEventListener('click', () => {
      const a = b.dataset.view;

      if (a === 'close') {
        closeViewer();
      } else if (a === 'prev' || a === 'next') {
        move(a === 'prev' ? -1 : 1);
        updateViewer();
      } else {
        zoom = a === 'fit'
          ? 100
          : Math.max(25, Math.min(300, zoom + (a === 'plus' ? 25 : -25)));

        updateZoom();
      }
    });
  });

  vi.addEventListener('error', () => {
    viewer.querySelector('strong').textContent = '이미지 경로를 확인해 주세요';
  });

  document.addEventListener('keydown', e => {
    if (modal.hidden) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      hide();
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      move(e.key === 'ArrowLeft' ? -1 : 1);

      if (!viewer.hidden) updateViewer();
    }

    if (e.key === 'Tab') {
      const target = viewer.hidden ? dialog : viewer;
      const els = Array.from(target.querySelectorAll('button:not(:disabled),a[href]'));
      const first = els[0];
      const last = els[els.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, true);
})();

(() => {
  const phone = String(window.CONTACT_PHONE || '').trim();
  if (!phone) return;

  const card = document.getElementById('contact-phone-card');
  const number = document.getElementById('contact-phone-number');

  if (!card || !number) return;

  number.textContent = phone;

  const link = document.createElement('a');
  link.className = card.className;
  link.id = card.id;
  link.href = 'tel:' + phone.replace(/[^+0-9]/g, '');
  link.setAttribute('aria-label', '전화 걸기');
  link.innerHTML = card.innerHTML;

  card.replaceWith(link);
})();

document.querySelectorAll('.capability-level').forEach(function (level) {
  const value = Math.max(1, Math.min(5, Number(level.dataset.level) || 1));

  level.setAttribute('aria-label', '학습 단계 ' + value + '단계, 총 5단계');
  level.querySelector('em').textContent = value + ' / 5';

  level.querySelectorAll('i').forEach(function (bar, index) {
    bar.classList.toggle('is-filled', index < value);
  });
});

const projectSliderMedia = window.matchMedia('(max-width: 54rem)');
projectSliderMedia.addEventListener('change', function () {
  currentProjectPage = 0;
  renderProjects(currentFilter);
});
