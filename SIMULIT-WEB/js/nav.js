// Handle navigation button active states
document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('.btn');
  
  // Get current page filename
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  buttons.forEach(btn => {
    const href = btn.getAttribute('href');
    
    // Check if button link matches current page
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
});
