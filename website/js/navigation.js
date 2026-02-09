// The Wall Snack & Resto - Navigation JavaScript
// Handles mobile menu and navigation interactions

class NavigationManager {
  constructor() {
    this.isMenuOpen = false;
    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.setupSmoothScrolling();
    this.setupActiveLinkDetection();
  }

  setupMobileMenu() {
    // Create mobile menu HTML
    this.createMobileMenu();
    
    // Add event listeners
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu__link');
    
    if (menuToggle) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMobileMenu();
      });
    }
    
    // Close menu when clicking links
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && 
          !mobileMenu.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  createMobileMenu() {
    const navList = document.querySelector('.header__nav-list');
    if (!navList) return;
    
    const mobileMenu = document.createElement('nav');
    mobileMenu.className = 'mobile-menu';
    
    const mobileList = document.createElement('ul');
    mobileList.className = 'mobile-menu__list';
    
    // Clone navigation items
    const navItems = navList.querySelectorAll('.header__nav-item');
    navItems.forEach(item => {
      const mobileItem = document.createElement('li');
      const originalLink = item.querySelector('.header__nav-link');
      
      if (originalLink) {
        const mobileLink = originalLink.cloneNode(true);
        mobileLink.className = 'mobile-menu__link';
        
        // Check if it's the active link
        if (originalLink.classList.contains('header__nav-link--active')) {
          mobileLink.classList.add('mobile-menu__link--active');
        }
        
        mobileItem.appendChild(mobileLink);
        mobileList.appendChild(mobileItem);
      }
    });
    
    // Add CTA button to mobile menu
    const ctaButton = document.querySelector('.header__cta-button');
    if (ctaButton) {
      const mobileCtaItem = document.createElement('li');
      const mobileCtaButton = ctaButton.cloneNode(true);
      mobileCtaButton.className = 'mobile-menu__link mobile-menu__cta';
      mobileCtaItem.appendChild(mobileCtaButton);
      mobileList.appendChild(mobileCtaItem);
    }
    
    mobileMenu.appendChild(mobileList);
    document.querySelector('.header').appendChild(mobileMenu);
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (this.isMenuOpen) {
      this.openMobileMenu();
    } else {
      this.closeMobileMenu();
    }
  }

  openMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    mobileMenu.classList.add('active');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Add menu open class to header
    document.querySelector('.header').classList.add('menu-open');
    
    // Animate menu items
    const menuItems = document.querySelectorAll('.mobile-menu__link');
    menuItems.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.1}s`;
      item.classList.add('slide-in-left');
    });
  }

  closeMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    mobileMenu.classList.remove('active');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Remove menu open class from header
    document.querySelector('.header').classList.remove('menu-open');
    
    this.isMenuOpen = false;
  }

  setupSmoothScrolling() {
    // Handle anchor link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        this.smoothScrollTo(link.getAttribute('href'));
      }
    });
  }

  smoothScrollTo(target) {
    const targetElement = document.querySelector(target);
    if (targetElement) {
      const headerHeight = document.querySelector('.header').offsetHeight;
      const targetPosition = targetElement.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Close mobile menu if open
      if (this.isMenuOpen) {
        this.closeMobileMenu();
      }
    }
  }

  setupActiveLinkDetection() {
    // Update active link based on scroll position
    let ticking = false;
    
    const updateActiveLink = () => {
      const scrollPosition = window.scrollY + 100;
      const sections = document.querySelectorAll('section[id], .page-title-section');
      const navLinks = document.querySelectorAll('.header__nav-link, .mobile-menu__link');
      
      let currentSection = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = section.getAttribute('id') || 
                          section.querySelector('h1, h2')?.textContent.toLowerCase().trim() ||
                          '';
        }
      });
      
      // Update navigation links
      navLinks.forEach(link => {
        link.classList.remove('header__nav-link--active', 'mobile-menu__link--active');
        
        const href = link.getAttribute('href');
        if (href) {
          const linkTarget = href.replace('.html', '').toLowerCase();
          
          if (currentSection && 
              (linkTarget.includes(currentSection) || 
               currentSection.includes(linkTarget))) {
            if (link.classList.contains('header__nav-link')) {
              link.classList.add('header__nav-link--active');
            } else {
              link.classList.add('mobile-menu__link--active');
            }
          }
        }
      });
      
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateActiveLink);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestTick);
  }

  // Accessibility improvements
  setupAccessibility() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    if (menuToggle) {
      menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-controls', 'mobile-menu');
    }
    
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
      mobileMenu.setAttribute('id', 'mobile-menu');
      mobileMenu.setAttribute('role', 'navigation');
    }
  }

  // Keyboard navigation support
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Tab navigation in mobile menu
      if (this.isMenuOpen && e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          '.mobile-menu a, .mobile-menu button'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    });
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.navigationManager = new NavigationManager();
});