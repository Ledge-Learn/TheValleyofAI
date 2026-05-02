// ===== FILTER BAR =====

function scrollToGallery() {
  const gallery = document.getElementById('gallery');
  if (gallery) {
    const offset = gallery.getBoundingClientRect().top + window.scrollY - 130;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
}

// Tag filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.dataset.filter;
    renderGallery(currentFilter, currentCompanyFilter);
    scrollToGallery();
  });
});

// Company dropdown
document.getElementById('company-filter').addEventListener('change', function () {
  currentCompanyFilter = this.value;
  renderGallery(currentFilter, currentCompanyFilter);
  scrollToGallery();
});
