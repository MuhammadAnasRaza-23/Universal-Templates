// ════════════════════════════════════════════
// CONFIGURATION — Edit these values for your client
// ════════════════════════════════════════════
const CONFIG = {
  businessEmail: 'hello@greenleafhome.com',
  businessName:  'GreenLeaf Home Services',
  
  // ─── EmailJS Setup ───────────────────────
  // HOW TO SET UP (takes 5 minutes, free):
  // 1. Go to https://www.emailjs.com and create a free account
  // 2. Click "Add New Service" → connect your Gmail or Outlook
  // 3. Click "Email Templates" → Create New Template
  //    Add these variables: {{from_name}}, {{from_email}},
  //    {{phone}}, {{service}}, {{estimate}}, {{message}}, {{to_email}}
  //    Set "To Email" field to: {{to_email}}
  // 4. Go to Account → API Keys → copy your Public Key
  // 5. Paste all values below:
  emailjs: {
    publicKey:            'YOUR_PUBLIC_KEY',
    serviceId:            'YOUR_SERVICE_ID',
    contactTemplateId:    'YOUR_TEMPLATE_ID',
    newsletterTemplateId: 'YOUR_NEWSLETTER_TEMPLATE_ID',
  }
};

// =========================================
// FIREBASE CONFIGURATION (OPTIONAL)
// =========================================
/*
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
*/

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCalculator();
  initContactForm();
  initNewsletter();
  initScrollAnimations();
});

// =========================================
// NAVIGATION & HEADER
// =========================================
function initNav() {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky Header
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
  });

  // Close Mobile Menu on Link Click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      nav.classList.remove('active');
    });
  });
}

// =========================================
// QUOTE CALCULATOR
// =========================================
function initCalculator() {
  const calcService = document.getElementById('calc-service');
  const calcSize = document.getElementById('calc-size');
  const calcHours = document.getElementById('calc-hours');
  const calcResult = document.getElementById('calc-result');
  const btnTransfer = document.getElementById('btn-transfer-quote');
  const formEstimate = document.getElementById('form-estimate');

  function calculate() {
    const base = parseFloat(calcService.value) || 0;
    const multiplier = parseFloat(calcSize.value) || 1;
    const hours = parseFloat(calcHours.value) || 1;
    
    // Formula: base * multiplier * hours
    const estimate = base * multiplier * hours;
    const upperBound = estimate * 1.35;
    
    if (estimate > 0) {
      calcResult.textContent = `$${Math.round(estimate)} – $${Math.round(upperBound)}`;
    } else {
      calcResult.textContent = '$0 - $0';
    }
  }

  calcService.addEventListener('change', calculate);
  calcSize.addEventListener('change', calculate);
  calcHours.addEventListener('input', calculate);

  // Initial calculation
  calculate();

  // Transfer to Contact Form
  btnTransfer.addEventListener('click', () => {
    formEstimate.value = calcResult.textContent;
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  });
}

// =========================================
// CONTACT FORM WITH EMAILJS
// =========================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusDiv = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit');

  if (CONFIG.emailjs.publicKey !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(CONFIG.emailjs.publicKey);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (CONFIG.emailjs.publicKey === 'YOUR_PUBLIC_KEY') {
      showStatus(statusDiv, 'EmailJS is not configured. Form submission simulated.', 'success');
      form.reset();
      return;
    }

    const templateParams = {
      from_name: document.getElementById('form-name').value,
      phone: document.getElementById('form-phone').value,
      from_email: document.getElementById('form-email').value,
      service: document.getElementById('form-service').value,
      estimate: document.getElementById('form-estimate').value,
      message: document.getElementById('form-message').value,
      to_email: CONFIG.businessEmail
    };

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.contactTemplateId, templateParams)
      .then(() => {
        showStatus(statusDiv, 'Message sent successfully! We will contact you soon.', 'success');
        form.reset();
      })
      .catch((error) => {
        console.error('EmailJS Error:', error);
        showStatus(statusDiv, 'Failed to send message. Please try calling us instead.', 'error');
      })
      .finally(() => {
        submitBtn.textContent = 'Submit Request';
        submitBtn.disabled = false;
      });
  });
}

// =========================================
// NEWSLETTER WITH EMAILJS
// =========================================
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const statusDiv = document.getElementById('nl-status');
  const submitBtn = document.getElementById('nl-submit');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (CONFIG.emailjs.publicKey === 'YOUR_PUBLIC_KEY') {
      showStatus(statusDiv, 'Subscribed (simulated).', 'success');
      form.reset();
      return;
    }

    const templateParams = {
      subscriber_email: document.getElementById('nl-email').value,
      to_email: CONFIG.businessEmail
    };

    submitBtn.textContent = '...';
    submitBtn.disabled = true;

    emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.newsletterTemplateId, templateParams)
      .then(() => {
        showStatus(statusDiv, 'Thanks for subscribing!', 'success');
        form.reset();
      })
      .catch((error) => {
        console.error('EmailJS Error:', error);
        showStatus(statusDiv, 'Failed to subscribe.', 'error');
      })
      .finally(() => {
        submitBtn.textContent = 'Subscribe';
        submitBtn.disabled = false;
      });
  });
}

// Helper to show form status
function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `form-status ${type}`;
  setTimeout(() => {
    element.style.display = 'none';
    element.className = 'form-status';
  }, 5000);
  element.style.display = 'block';
}

// =========================================
// SCROLL ANIMATIONS
// =========================================
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  });

  elements.forEach(el => observer.observe(el));
}
