'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');

function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  mobileNav.hidden = true;
  document.body.classList.remove('menu-open');
  if (returnFocus) menuButton.focus();
}

menuButton.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  menuButton.setAttribute('aria-label', willOpen ? 'Закрыть меню' : 'Открыть меню');
  mobileNav.hidden = !willOpen;
  document.body.classList.toggle('menu-open', willOpen);
  if (willOpen) mobileNav.querySelector('a').focus();
});

mobileNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') closeMenu(true);
  if (event.key === 'Tab') {
    const items = [menuButton, ...mobileNav.querySelectorAll('a')];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
});

window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  document.documentElement.classList.add('js');
}

const progress = document.querySelector('.reading-progress');
let scrollPending = false;
function updateProgress() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0})`;
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) {
    scrollPending = true;
    window.requestAnimationFrame(updateProgress);
  }
}, { passive: true });
updateProgress();

const hero = document.querySelector('.hero');
const art = document.querySelector('.hero-art-inner');
let artFrame = 0;
hero.addEventListener('pointermove', (event) => {
  if (reducedMotion.matches || event.pointerType !== 'mouse') return;
  const bounds = hero.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 18;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
  window.cancelAnimationFrame(artFrame);
  artFrame = window.requestAnimationFrame(() => {
    art.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}, { passive: true });
hero.addEventListener('pointerleave', () => {
  window.cancelAnimationFrame(artFrame);
  art.style.transform = '';
});

function openHashService() {
  const id = window.location.hash.slice(1);
  const section = id ? document.getElementById(id) : null;
  if (section && section.tagName === 'DETAILS') section.open = true;
}
window.addEventListener('hashchange', openHashService);
openHashService();
document.querySelector('#year').textContent = new Date().getFullYear();


const brief = document.querySelector('#brief');
const direction = document.querySelector('#direction');
const task = document.querySelector('#task');
const status = document.querySelector('#brief-status');
const manual = document.querySelector('#manual-copy');
brief.hidden = false;

function resetBriefStatus() {
  status.textContent = '';
  manual.hidden = true;
}
brief.addEventListener('input', resetBriefStatus);
document.querySelectorAll('[data-service]').forEach(link => {
  link.href = '#brief';
  link.addEventListener('click', () => {
    direction.value = link.dataset.service;
    resetBriefStatus();
    task.focus({preventScroll:true});
  });
});
document.querySelector('#copy-brief').addEventListener('click', async () => {
  resetBriefStatus();
  if (!task.value.trim()) {
    status.textContent = 'Опишите задачу хотя бы в двух словах.';
    task.focus();
    return;
  }
  const message = ['Здравствуйте, Bi Morree!', 'Направление — ' + direction.value, task.value.trim()].join('\n\n');
  try {
    await navigator.clipboard.writeText(message);
    status.textContent = 'Бриф скопирован. Вставьте его в переписку.';
  } catch {
    manual.hidden = false;
    const result = document.querySelector('#brief-result');
    result.value = message;
    result.focus();
    result.select();
  }
});
