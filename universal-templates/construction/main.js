// ════════════════════════════════════════════
// CONFIGURATION — Edit these values for your client
// ════════════════════════════════════════════
const CONFIG = {
  // Business contact
  businessEmail: 'info@apexbuild.com',
  businessName:  'Apex Build Co',
  
  // ─── EmailJS Setup ───────────────────────
  // HOW TO SET UP (takes 5 minutes, free):
  // 1. Go to https://www.emailjs.com and create a free account
  // 2. Click "Add New Service" → connect your Gmail or Outlook
  // 3. Click "Email Templates" → Create New Template
  //    Add these variables in the template: {{from_name}}, {{from_email}},
  //    {{phone}}, {{service}}, {{estimate}}, {{message}}, {{to_email}}
  //    Set "To Email" to: {{to_email}}
  // 4. Go to Account → API Keys → copy your Public Key
  // 5. Paste all three values below:
  emailjs: {
    publicKey:          'YOUR_PUBLIC_KEY',   // Account → API Keys
    serviceId:          'YOUR_SERVICE_ID',   // Email Services → your service
    contactTemplateId:  'YOUR_TEMPLATE_ID',  // Email Templates → your template
    newsletterTemplateId: 'YOUR_NEWSLETTER_TEMPLATE_ID', // can reuse same template
  }
};

// ==========================================================================
// FIREBASE SETUP (Optional)
// ==========================================================================
/*
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
*/

// ==========================================================================
// APP INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS
  if (typeof emailjs !== 'undefined' && CONFIG.emailjs.publicKey !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(CONFIG.emailjs.publicKey);
  }

  initNav();
  initCalculator();
  initContactForm();
  initNewsletter();
  initScrollAnimations();
});

// ==========================================================================
// 1. NAVIGATION & STICKY HEADER
// ==========================================================================
function initNav() {
  const header = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const siteNav = document.getElementById('site-nav');
  const navLinks = document.querySelectorAll('.nav-links a');

  // Sticky header shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileToggle && siteNav) {
    mobileToggle.addEventListener('click', () => {
      siteNav.classList.toggle('active');
    });
  }

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (siteNav.classList.contains('active')) {
        siteNav.classList.remove('active');
      }
    });
  });
}

// ==========================================================================
// 2. QUOTE CALCULATOR
// ==========================================================================
function initCalculator() {
  const serviceInput = document.getElementById('calc-service');
  const materialInput = document.getElementById('calc-material');
  const qtyInput = document.getElementById('calc-qty');
  const rangeDisplay = document.getElementById('calc-range');
  const reqQuoteBtn = document.getElementById('btn-request-quote');
  const formEstimateInput = document.getElementById('form-estimate');
  const contactSection = document.getElementById('contact');

  if (!serviceInput || !materialInput || !qtyInput || !rangeDisplay) return;

  function calculateEstimate() {
    const base = parseFloat(serviceInput.value) || 0;
    const materialMultiplier = parseFloat(materialInput.value) || 1;
    const qty = parseFloat(qtyInput.value) || 1;

    const low = Math.round(base * qty * materialMultiplier);
    const high = Math.round(low * 1.4);

    // Format as currency
    const formatCurrency = (num) => {
      return '$' + num.toLocaleString();
    };

    rangeDisplay.textContent = `${formatCurrency(low)} – ${formatCurrency(high)}`;
  }

  // Listeners
  serviceInput.addEventListener('change', calculateEstimate);
  materialInput.addEventListener('change', calculateEstimate);
  qtyInput.addEventListener('input', calculateEstimate);

  // Initial calculation
  calculateEstimate();

  // Scroll and Pre-fill logic
  if (reqQuoteBtn && formEstimateInput && contactSection) {
    reqQuoteBtn.addEventListener('click', () => {
      const currentRange = rangeDisplay.textContent;
      formEstimateInput.value = currentRange;
      
      // Select the service dropdown in the form if it matches
      const formServiceSelect = document.getElementById('form-service');
      const selectedServiceText = serviceInput.options[serviceInput.selectedIndex].text.replace(' (Base)', '');
      if (formServiceSelect) {
        for (let i = 0; i < formServiceSelect.options.length; i++) {
          if (formServiceSelect.options[i].value.includes(selectedServiceText) || 
              selectedServiceText.includes(formServiceSelect.options[i].value)) {
            formServiceSelect.selectedIndex = i;
            break;
          }
        }
      }

      contactSection.scrollIntoView({ behavior: 'smooth' });
      // Optional highlight flash on input
      setTimeout(() => {
        formEstimateInput.style.backgroundColor = 'var(--soft)';
        setTimeout(() => {
          formEstimateInput.style.backgroundColor = 'transparent';
        }, 1000);
      }, 500);
    });
  }
}

// ==========================================================================
// 3. CONTACT FORM
// ==========================================================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusDiv = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit-btn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const btnLoader = submitBtn ? submitBtn.querySelector('.btn-loader') : null;

  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Setup Loading State
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-block';
    submitBtn.disabled = true;
    statusDiv.style.display = 'none';
    statusDiv.className = 'form-status';

    const templateParams = {
      from_name: document.getElementById('form-name').value,
      phone: document.getElementById('form-phone').value,
      from_email: document.getElementById('form-email').value,
      service: document.getElementById('form-service').value,
      estimate: document.getElementById('form-estimate').value,
      message: document.getElementById('form-message').value,
      to_email: CONFIG.businessEmail
    };

    // Check if EmailJS is configured
    if (CONFIG.emailjs.publicKey === 'YOUR_PUBLIC_KEY' || typeof emailjs === 'undefined') {
      // Simulate success for demo purposes when no API key provided
      setTimeout(() => {
        showStatus('Form submission simulated successfully! (EmailJS not configured)', 'success');
        form.reset();
        resetBtn();
      }, 1500);
      return;
    }

    emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.contactTemplateId, templateParams)
      .then(function(response) {
        showStatus('Thank you! Your request has been sent successfully.', 'success');
        form.reset();
      }, function(error) {
        showStatus('Oops! Something went wrong. Please try again or call us.', 'error');
        console.error('EmailJS Error:', error);
      })
      .finally(() => {
        resetBtn();
      });
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `form-status ${type}`;
    statusDiv.style.display = 'block';
  }

  function resetBtn() {
    if (btnText) btnText.style.display = 'inline-block';
    if (btnLoader) btnLoader.style.display = 'none';
    submitBtn.disabled = false;
  }
}

// ==========================================================================
// 4. NEWSLETTER FORM
// ==========================================================================
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const statusDiv = document.getElementById('nl-status');
  const emailInput = document.getElementById('nl-email');
  const submitBtn = document.getElementById('nl-btn');

  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = '...';
    
    const templateParams = {
      from_email: emailInput.value,
      message: 'New newsletter subscription request.',
      to_email: CONFIG.businessEmail
    };

    if (CONFIG.emailjs.publicKey === 'YOUR_PUBLIC_KEY' || typeof emailjs === 'undefined') {
      setTimeout(() => {
        showStatus('Subscribed successfully! (Simulated)', 'success');
        form.reset();
        resetBtn();
      }, 1000);
      return;
    }

    emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.newsletterTemplateId, templateParams)
      .then(function() {
        showStatus('Thank you for subscribing!', 'success');
        form.reset();
      }, function(error) {
        showStatus('Error subscribing. Try again.', 'error');
      })
      .finally(() => {
        resetBtn();
      });
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `form-status ${type}`;
    statusDiv.style.display = 'block';
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 4000);
  }

  function resetBtn() {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Subscribe';
  }
}

// ==========================================================================
// 5. SCROLL ANIMATIONS
// ==========================================================================
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  
  if (!('IntersectionObserver' in window)) {
    // Fallback for old browsers
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  });

  elements.forEach(el => observer.observe(el));
}
