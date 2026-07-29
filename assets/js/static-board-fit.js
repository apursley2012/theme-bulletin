(() => {
  const board = document.querySelector('.static-board-viewport .pinboard');
  const viewport = document.querySelector('.static-board-viewport');
  if (!board || !viewport) return;

  const BOARD_WIDTH = 1240;
  const MOBILE_GUTTER = 16;

  const fit = () => {
    const available = Math.max(0, window.innerWidth - MOBILE_GUTTER * 2);
    const scale = Math.min(1, available / BOARD_WIDTH);
    board.style.transform = `scale(${scale})`;
    viewport.style.height = `${board.offsetHeight * scale}px`;
  };

  window.addEventListener('resize', fit, { passive: true });
  window.addEventListener('load', fit, { once: true });
  requestAnimationFrame(fit);
})();
