// ===== FILTER BAR =====

function scrollToGallery() {
  const gallery = document.getElementById('gallery');
  if (gallery) {
    const offset = gallery.getBoundingClientRect().top + window.scrollY - 130;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
}

// Mobile filter toggle
const filterToggle = document.getElementById('filter-mobile-toggle');
const filterPanel = document.getElementById('filter-buttons-panel');
if (filterToggle && filterPanel) {
  filterToggle.addEventListener('click', function () {
    const open = filterPanel.classList.toggle('mobile-open');
    this.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// Tag filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    this.classList.add('active');
    this.setAttribute('aria-pressed', 'true');
    currentFilter = this.dataset.filter;
    renderGallery(currentFilter, currentCompanyFilter);
    scrollToGallery();
    // Close panel on mobile after selecting
    if (filterPanel && filterPanel.classList.contains('mobile-open')) {
      filterPanel.classList.remove('mobile-open');
      if (filterToggle) filterToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// Company dropdown
document.getElementById('company-filter').addEventListener('change', function () {
  currentCompanyFilter = this.value;
  renderGallery(currentFilter, currentCompanyFilter);
  scrollToGallery();
});
