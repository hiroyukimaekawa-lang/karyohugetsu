/* Intersection Observer Reveal Animation */
function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // observer.unobserve(entry.target); // Optional: if you want animation to only happen once
      }
    });
  }, {
    threshold: 0.15, // Trigger when 15% of element is visible
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* Sticky Header on Scroll */
function handleStickyHeader() {
  const header = document.getElementById('header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* Smooth Scroll with Offset */
function handleSmoothScroll() {
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        const nav = document.querySelector('nav');
        const hamburger = document.getElementById('hamburger');
        nav.classList.remove('active');
        hamburger.classList.remove('active');
      }
    });
  });
}

/* Mobile Menu Logic */
function mobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.querySelector('nav');
  
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
  });
}

/* Initialize everything */
document.addEventListener('DOMContentLoaded', () => {
  revealOnScroll();
  handleStickyHeader();
  handleSmoothScroll();
  mobileMenu();
  gallerySlideshow();
});

/* Gallery Slideshow */
function gallerySlideshow() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('slidePrev');
  const nextBtn = document.getElementById('slideNext');
  const currentEl = document.querySelector('.slide-current');
  const progressBar = document.getElementById('slideProgress');

  if (!slides.length) return;

  let current = 0;
  let isAnimating = false;
  const total = slides.length;
  const autoPlayDelay = 5000; // 5 seconds
  let autoPlayTimer = null;
  let progressStart = null;
  let progressRAF = null;

  function padNum(n) {
    return String(n).padStart(2, '0');
  }

  function goToSlide(index, direction) {
    if (isAnimating || index === current) return;
    isAnimating = true;

    const prevSlide = slides[current];
    const nextSlide = slides[index];

    // Add exiting class to current
    prevSlide.classList.remove('active');
    prevSlide.classList.add('exiting');

    // Activate new slide
    nextSlide.classList.add('active');

    // Update dots
    dots[current].classList.remove('active');
    dots[index].classList.add('active');

    // Update counter
    currentEl.textContent = padNum(index + 1);

    // Cleanup after transition
    setTimeout(() => {
      prevSlide.classList.remove('exiting');
      isAnimating = false;
    }, 1200);

    current = index;

    // Reset auto-play progress
    resetProgress();
  }

  function nextSlide() {
    const next = (current + 1) % total;
    goToSlide(next, 'next');
  }

  function prevSlide() {
    const prev = (current - 1 + total) % total;
    goToSlide(prev, 'prev');
  }

  // Progress bar animation
  function animateProgress(timestamp) {
    if (!progressStart) progressStart = timestamp;
    const elapsed = timestamp - progressStart;
    const progress = Math.min(elapsed / autoPlayDelay, 1);
    progressBar.style.width = (progress * 100) + '%';

    if (progress < 1) {
      progressRAF = requestAnimationFrame(animateProgress);
    } else {
      nextSlide();
    }
  }

  function startProgress() {
    progressStart = null;
    progressBar.style.width = '0%';
    progressRAF = requestAnimationFrame(animateProgress);
  }

  function resetProgress() {
    if (progressRAF) cancelAnimationFrame(progressRAF);
    progressBar.style.width = '0%';
    startProgress();
  }

  function pauseProgress() {
    if (progressRAF) cancelAnimationFrame(progressRAF);
  }

  function resumeProgress() {
    // Adjust startTime so progress continues from where it paused
    progressRAF = requestAnimationFrame(animateProgress);
  }

  // Event Listeners
  nextBtn.addEventListener('click', () => {
    nextSlide();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index);
      goToSlide(index);
    });
  });

  // Pause on hover
  const slideshow = document.getElementById('gallerySlideshow');
  slideshow.addEventListener('mouseenter', pauseProgress);
  slideshow.addEventListener('mouseleave', () => {
    progressStart = performance.now() - (parseFloat(progressBar.style.width) / 100 * autoPlayDelay);
    resumeProgress();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Only respond if slideshow is in viewport
    const rect = slideshow.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  slideshow.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    pauseProgress();
  }, { passive: true });

  slideshow.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    } else {
      // Resume if no swipe
      progressStart = performance.now() - (parseFloat(progressBar.style.width) / 100 * autoPlayDelay);
      resumeProgress();
    }
  }, { passive: true });

  // Start auto-play
  startProgress();
}
