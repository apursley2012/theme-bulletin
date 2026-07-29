const PROJECT_ROOT = new URL('../../', document.currentScript.src);
const THEMES_PER_BOARD = 16;
const BOARD_WIDTH = 1240;
const CATEGORY_BOARD_HEIGHT = 1100;
const THEME_BOARD_HEIGHT = 1780;
const MOBILE_GUTTER = 16;

const themes = Array.isArray(window.STICKY_NOTE_THEMES) ? window.STICKY_NOTE_THEMES : [];
const categories = [...new Set(themes.map((theme) => theme.category))];

const pinboard = document.querySelector('#pinboard');
const viewport = document.querySelector('#pinboard-viewport');
const categoryNavigation = document.querySelector('#category-navigation');
const pagination = document.querySelector('#board-pagination');
const previousButton = document.querySelector('#previous-board');
const nextButton = document.querySelector('#next-board');
const status = document.querySelector('#board-status');

let selectedCategory = '';
let currentBoard = 0;

function categoryThemes() {
  return themes.filter((theme) => theme.category === selectedCategory);
}
function boardCount() {
  return Math.max(1, Math.ceil(categoryThemes().length / THEMES_PER_BOARD));
}
function openCategory(category) {
  selectedCategory = category;
  currentBoard = 0;
  render();
}
function showCategories() {
  selectedCategory = '';
  currentBoard = 0;
  render();
}

function renderCategoryNavigation() {
  categoryNavigation.replaceChildren();
  const all = document.createElement('button');
  all.type = 'button';
  all.textContent = 'All Categories';
  all.setAttribute('aria-pressed', String(selectedCategory === ''));
  all.addEventListener('click', showCategories);
  categoryNavigation.append(all);

  categories.forEach((category) => {
    const count = themes.filter((theme) => theme.category === category).length;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${category} (${count})`;
    button.setAttribute('aria-pressed', String(selectedCategory === category));
    button.addEventListener('click', () => openCategory(category));
    categoryNavigation.append(button);
  });
}

function createCategoryNote(category) {
  const count = themes.filter((theme) => theme.category === category).length;
  const note = document.createElement('article');
  note.className = 'note category-note';
  note.tabIndex = 0;
  note.setAttribute('role', 'button');
  note.setAttribute('aria-label', `Open ${category}`);
  note.innerHTML = `<small>Category</small><h2>${category}</h2><p>${count} themes</p><span class="category-note-action">Open Category →</span>`;
  note.addEventListener('click', () => openCategory(category));
  note.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openCategory(category);
    }
  });
  return note;
}

function createThemePair(theme) {
  const pair = document.createElement('article');
  pair.className = 'theme-pin-pair';

  const polaroid = document.createElement('a');
  polaroid.className = 'theme-polaroid';
  polaroid.href = new URL(`pages/themes/${theme.id}.html`, PROJECT_ROOT).href;
  polaroid.setAttribute('aria-label', `View details for ${theme.name}`);

  const image = document.createElement('img');
  image.className = 'theme-polaroid-image';
  image.src = new URL(`assets/images/theme-previews/${theme.preview_file}`, PROJECT_ROOT).href;
  image.alt = `${theme.name} homepage screenshot`;
  image.loading = 'lazy';

  const fallback = document.createElement('span');
  fallback.className = 'theme-polaroid-fallback';
  fallback.textContent = 'Homepage screenshot unavailable';
  fallback.hidden = true;
  image.addEventListener('error', () => { image.hidden = true; fallback.hidden = false; });

  const caption = document.createElement('span');
  caption.className = 'theme-polaroid-caption';
  caption.textContent = theme.name;
  polaroid.append(image, fallback, caption);

  const note = document.createElement('a');
  note.className = 'note theme-note';
  note.href = new URL(`pages/themes/${theme.id}.html`, PROJECT_ROOT).href;
  note.innerHTML = `<small>${theme.category}</small><h2>${theme.name}</h2><span class="theme-note-action">View Theme Details →</span>`;

  pair.append(polaroid, note);
  return pair;
}

function renderCategoryBoard() {
  pinboard.style.height = `${CATEGORY_BOARD_HEIGHT}px`;
  pinboard.replaceChildren(...categories.map(createCategoryNote));
  pagination.hidden = true;
}
function renderThemeBoard() {
  pinboard.style.height = `${THEME_BOARD_HEIGHT}px`;
  const list = categoryThemes();
  const total = boardCount();
  currentBoard = Math.min(Math.max(currentBoard, 0), total - 1);
  const start = currentBoard * THEMES_PER_BOARD;
  pinboard.replaceChildren(...list.slice(start, start + THEMES_PER_BOARD).map(createThemePair));
  status.textContent = `${selectedCategory} • Board ${currentBoard + 1} of ${total}`;
  previousButton.disabled = currentBoard === 0;
  nextButton.disabled = currentBoard === total - 1;
  pagination.hidden = total <= 1;
}

function fitBoard() {
  const boardHeight = selectedCategory ? THEME_BOARD_HEIGHT : CATEGORY_BOARD_HEIGHT;
  const available = Math.max(0, window.innerWidth - MOBILE_GUTTER * 2);
  const scale = Math.min(1, available / BOARD_WIDTH);
  pinboard.style.transform = `scale(${scale})`;
  viewport.style.height = `${boardHeight * scale}px`;
}
function render() {
  renderCategoryNavigation();
  selectedCategory ? renderThemeBoard() : renderCategoryBoard();
  requestAnimationFrame(fitBoard);
}

previousButton.addEventListener('click', () => {
  if (currentBoard > 0) { currentBoard -= 1; renderThemeBoard(); requestAnimationFrame(fitBoard); }
});
nextButton.addEventListener('click', () => {
  if (currentBoard < boardCount() - 1) { currentBoard += 1; renderThemeBoard(); requestAnimationFrame(fitBoard); }
});


window.addEventListener('resize', fitBoard);
render();
