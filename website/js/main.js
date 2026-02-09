// The Wall Snack & Resto - Main JavaScript
// Core functionality and interactions

class RestaurantApp {
  constructor() {
    this.cartCount = 0;
    this.currentQuantity = {};
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeComponents();
    this.updateCartBadge();
    this.setActiveNavigation();
    this.loadInstagramGallery();
  }

  loadInstagramGallery() {
    const galleryContainer = document.getElementById('instagram-gallery');
    if (!galleryContainer) return;

    // Use the data from instagram-data.js if available, otherwise use fallback
    const images = (typeof instagramImagesData !== 'undefined') ? instagramImagesData : [
      'american-burger.jpg.png',
      'bacon-cheese-burger.jpg.png',
      'bbq-burger.jpg.png',
      'beef-burger.jpg.png',
      'cheese-burger.jpg.png',
      'chicken-burger.jpg.png'
    ];

    this.renderInstagramGallery(images);
  }

  renderInstagramGallery(images) {
    const galleryContainer = document.getElementById('instagram-gallery');
    galleryContainer.innerHTML = '';

    images.forEach(imgUrl => {
      // Extract filename for alt text
      const filename = imgUrl.split('/').pop().split('.')[0].replace(/-/g, ' ');
      const altText = filename.charAt(0).toUpperCase() + filename.slice(1);
      
      const item = document.createElement('div');
      item.className = 'instagram-item animate-on-scroll';
      item.innerHTML = `
        <img src="images/instagram/${imgUrl}" alt="${altText}" loading="lazy" onload="this.classList.add('loaded')">
        <div class="instagram-overlay"><span>📸</span></div>
      `;
      galleryContainer.appendChild(item);
    });

    // Re-initialize intersection observer for new items
    if (this.observer) {
      galleryContainer.querySelectorAll('.animate-on-scroll').forEach(el => {
        this.observer.observe(el);
      });
    }
  }

  setupEventListeners() {
    // Quantity selector buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('quantity-selector__btn')) {
        this.handleQuantityChange(e.target);
      }
      
      // Mobile menu toggle
      if (e.target.classList.contains('mobile-menu-toggle')) {
        this.toggleMobileMenu();
      }
      
      // Cart floating button
      if (e.target.closest('.cart-float')) {
        this.handleCartClick();
      }
    });

    // Form submission
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(e.target);
      });
    }

    // Language switcher functionality
    const langOptions = document.querySelectorAll('.lang-btn');
    langOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchLanguage(option.dataset.lang);
      });
    });

    // Search functionality
    const searchInput = document.querySelector('.menu-search__input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Category tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchCategory(tab);
      });
    });

    // Window events
    window.addEventListener('scroll', () => {
      this.handleScroll();
    });

    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  initializeComponents() {
    // Initialize quantity selectors
    const quantitySelectors = document.querySelectorAll('.quantity-selector');
    quantitySelectors.forEach(selector => {
      const itemId = selector.closest('.menu-card')?.dataset.itemId || 
                     Math.random().toString(36).substr(2, 9);
      this.currentQuantity[itemId] = 0;
      selector.dataset.itemId = itemId;
    });

    // Initialize scroll progress
    this.initScrollProgress();

    // Initialize intersection observers for animations
    this.initIntersectionObserver();
  }

  handleQuantityChange(button) {
    const selector = button.closest('.quantity-selector');
    const itemId = selector.dataset.itemId;
    const valueElement = selector.querySelector('.quantity-selector__value');
    const currentValue = parseInt(valueElement.textContent) || 0;
    
    if (button.classList.contains('quantity-plus')) {
      const newValue = currentValue + 1;
      this.currentQuantity[itemId] = newValue;
      valueElement.textContent = newValue;
      this.updateCartCount(1);
      
      // Disable minus button if value becomes 1
      const minusBtn = selector.querySelector('.quantity-minus');
      minusBtn.disabled = false;
    } else if (button.classList.contains('quantity-minus') && currentValue > 0) {
      const newValue = currentValue - 1;
      this.currentQuantity[itemId] = newValue;
      valueElement.textContent = newValue;
      this.updateCartCount(-1);
      
      // Disable minus button if value becomes 0
      if (newValue === 0) {
        button.disabled = true;
      }
    }
    
    this.updateCartBadge();
    this.addQuantityAnimation(button);
  }

  updateCartCount(change) {
    this.cartCount = Math.max(0, this.cartCount + change);
  }

  updateCartBadge() {
    const badge = document.querySelector('.cart-float__badge');
    if (badge) {
      badge.textContent = this.cartCount;
      
      // Add pulse animation when count changes
      if (this.cartCount > 0) {
        badge.classList.add('cart-float__badge--pulse');
      } else {
        badge.classList.remove('cart-float__badge--pulse');
      }
    }
  }

  addQuantityAnimation(button) {
    button.style.transform = 'scale(0.9)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
  }

  toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    
    mobileMenu.classList.toggle('active');
    toggleButton.classList.toggle('active');
    
    // Change button icon
    const icon = toggleButton.querySelector('i') || toggleButton;
    if (mobileMenu.classList.contains('active')) {
      icon.textContent = '✕';
    } else {
      icon.textContent = '☰';
    }
  }

  handleCartClick() {
    // Show cart notification
    this.showToast(`Panier mis à jour (${this.cartCount} articles)`);
    
    // Add cart animation
    const cartFloat = document.querySelector('.cart-float');
    cartFloat.style.transform = 'scale(0.95)';
    setTimeout(() => {
      cartFloat.style.transform = '';
    }, 150);
    
    // If cart has items, show ordering options
    if (this.cartCount > 0) {
      this.showOrderOptions();
    }
  }

  showOrderOptions() {
    // Create modal for ordering options
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.innerHTML = `
      <div class="order-modal__content">
        <h3>Passer Commande</h3>
        <p>Vous avez ${this.cartCount} article(s) dans votre panier</p>
        <div class="order-options">
          <button class="order-btn order-btn--call" onclick="window.location.href='tel:0555219684'">
            <span>📞</span>
            Commander par Téléphone
          </button>
          <button class="order-btn order-btn--whatsapp" onclick="window.open('https://wa.me/213555219684?text=Bonjour,%20je%20souhaite%20passer%20une%20commande.', '_blank')">
            <span>💬</span>
            Commander par WhatsApp
          </button>
        </div>
        <button class="order-modal__close">Fermer</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal events
    modal.querySelector('.order-modal__close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  switchCategory(tab) {
    // Remove active class from all tabs
    document.querySelectorAll('.category-tab').forEach(t => {
      t.classList.remove('category-tab--active');
    });
    
    // Add active class to clicked tab
    tab.classList.add('category-tab--active');
    
    // Filter menu items by category
    const category = tab.dataset.category;
    this.filterByCategory(category);
    
    // Add visual feedback
    tab.style.transform = 'scale(0.95)';
    setTimeout(() => {
      tab.style.transform = '';
    }, 150);
  }

  switchLanguage(lang) {
    console.log('Switching language to:', lang);
    
    // Update active class in switcher
    document.querySelectorAll('.lang-btn').forEach(opt => {
      if (opt.dataset.lang === lang) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });

    // In a real app, you would load translations and update all text
    // For this SPA, we'll simulate it by updating some key elements
    // and showing a notification
    const messages = {
      'fr': 'Langue changée en Français',
      'ar': 'تم تغيير اللغة إلى العربية',
      'en': 'Language changed to English'
    };
    
    this.showToast(messages[lang] || 'Language updated');

    // Handle RTL for Arabic
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('lang-ar');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('lang-ar');
    }

    // You could also trigger a custom event for other components to listen to
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  filterByCategory(category) {
    const menuCards = document.querySelectorAll('.menu-card');
    
    menuCards.forEach(card => {
      const cardCategory = card.dataset.category;
      
      if (category === 'all' || cardCategory === category) {
        card.style.display = 'block';
        card.classList.add('fade-in');
      } else {
        card.style.display = 'none';
      }
    });
  }

  handleSearch(query) {
    const menuCards = document.querySelectorAll('.menu-card');
    const searchTerm = query.toLowerCase().trim();
    
    menuCards.forEach(card => {
      const title = card.querySelector('.menu-card__title').textContent.toLowerCase();
      const description = card.querySelector('.menu-card__description')?.textContent.toLowerCase() || '';
      
      if (searchTerm === '' || title.includes(searchTerm) || description.includes(searchTerm)) {
        card.style.display = 'block';
        card.classList.add('fade-in');
      } else {
        card.style.display = 'none';
      }
    });
  }

  handleFormSubmit(form) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('.form-submit');
    const originalText = submitButton.textContent;
    
    // Show loading state
    submitButton.innerHTML = '<span class="loading-spinner"></span> Envoi...';
    submitButton.disabled = true;
    
    // Simulate form submission (would connect to actual backend)
    setTimeout(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      
      // Show success message
      this.showToast('Message envoyé avec succès!');
      
      // Reset form
      form.reset();
    }, 2000);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // Hide toast after delay
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  handleScroll() {
    // Update scroll progress bar
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
      progressBar.style.width = scrollPercent + '%';
    }
    
    // Add scroll-up button when scrolled down
    if (scrollTop > 300) {
      this.showScrollTopButton();
    } else {
      this.hideScrollTopButton();
    }
  }

  showScrollTopButton() {
    let scrollTopBtn = document.querySelector('.scroll-top-btn');
    if (!scrollTopBtn) {
      scrollTopBtn = document.createElement('button');
      scrollTopBtn.className = 'scroll-top-btn';
      scrollTopBtn.innerHTML = '↑';
      scrollTopBtn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      document.body.appendChild(scrollTopBtn);
    }
    scrollTopBtn.classList.add('visible');
  }

  hideScrollTopButton() {
    const scrollTopBtn = document.querySelector('.scroll-top-btn');
    if (scrollTopBtn) {
      scrollTopBtn.classList.remove('visible');
    }
  }

  handleResize() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 1023) {
      const mobileMenu = document.querySelector('.mobile-menu');
      const toggleButton = document.querySelector('.mobile-menu-toggle');
      if (mobileMenu) mobileMenu.classList.remove('active');
      if (toggleButton) {
        toggleButton.classList.remove('active');
        const icon = toggleButton.querySelector('i') || toggleButton;
        icon.textContent = '☰';
      }
    }
  }

  setActiveNavigation() {
    const currentPage = this.getCurrentPage();
    const navLinks = document.querySelectorAll('.header__nav-link');
    
    navLinks.forEach(link => {
      link.classList.remove('header__nav-link--active');
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('header__nav-link--active');
      }
    });
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page === '' ? 'index.html' : page;
  }

  initScrollProgress() {
    // Create scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
  }

  initIntersectionObserver() {
    // Create intersection observer for scroll animations
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe elements with animate-on-scroll class
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
      this.observer.observe(el);
    });
  }

  // Utility methods
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.restaurantApp = new RestaurantApp();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RestaurantApp;
}