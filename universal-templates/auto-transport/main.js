// ════════════════════════════════════════════
// CONFIGURATION — Edit these values for your client
// ════════════════════════════════════════════
const CONFIG = {
  businessEmail: 'dispatch@roadreadyauto.com',
  businessName:  'RoadReady Auto & Towing',
  
  // ─── EmailJS Setup ───────────────────────
  // HOW TO SET UP (takes 5 minutes, free):
  // 1. Go to https://www.emailjs.com and create a free account
  // 2. Click "Add New Service" → connect your Gmail or Outlook
  // 3. Click "Email Templates" → Create New Template
  //    Add these variables: {{from_name}}, {{from_email}},
  //    {{phone}}, {{service}}, {{vehicle}}, {{estimate}}, {{message}}, {{to_email}}
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

// ════════════════════════════════════════════
// Firebase Setup (Optional)
// ════════════════════════════════════════════
/*
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
*/

// Initialize EmailJS
(function() {
    if(CONFIG.emailjs.publicKey !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(CONFIG.emailjs.publicKey);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.desktop-nav');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // 2. Sticky Header shadow
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Quote Calculator Logic
    const calcService = document.getElementById('calc-service');
    const calcVehicle = document.getElementById('calc-vehicle');
    const calcQty = document.getElementById('calc-qty');
    const calcOutput = document.getElementById('calc-output');
    
    function updateCalculator() {
        const basePrice = parseFloat(calcService.value);
        const multiplier = parseFloat(calcVehicle.value);
        const qty = parseInt(calcQty.value) || 1;
        
        const lowEst = basePrice * multiplier * qty;
        const highEst = lowEst * 1.3;
        
        calcOutput.textContent = `$${Math.round(lowEst)} – $${Math.round(highEst)}`;
    }

    if (calcService && calcVehicle && calcQty) {
        calcService.addEventListener('change', updateCalculator);
        calcVehicle.addEventListener('change', updateCalculator);
        calcQty.addEventListener('input', updateCalculator);
        updateCalculator(); // init
    }

    // 4. Request Official Quote -> Scroll & Pre-fill
    const btnRequestQuote = document.getElementById('btn-request-quote');
    const formEstimate = document.getElementById('form-estimate');
    const contactSection = document.getElementById('contact');
    
    if (btnRequestQuote) {
        btnRequestQuote.addEventListener('click', () => {
            if (formEstimate) {
                formEstimate.value = calcOutput.textContent;
            }
            contactSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 5. Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if(CONFIG.emailjs.publicKey === 'YOUR_PUBLIC_KEY') {
                formStatus.textContent = "Error: EmailJS is not configured. Check main.js.";
                formStatus.className = "form-status error";
                return;
            }

            const templateParams = {
                from_name: document.getElementById('name').value,
                from_email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                service: document.getElementById('service').value,
                vehicle: document.getElementById('vehicle').value,
                estimate: document.getElementById('form-estimate').value,
                message: document.getElementById('message').value,
                to_email: CONFIG.businessEmail
            };

            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.contactTemplateId, templateParams)
                .then(function() {
                    formStatus.textContent = 'Message sent successfully! We will be in touch soon.';
                    formStatus.className = 'form-status success';
                    contactForm.reset();
                    submitBtn.textContent = 'Submit Request';
                    submitBtn.disabled = false;
                }, function(error) {
                    formStatus.textContent = 'Failed to send message. Please try again or call us directly.';
                    formStatus.className = 'form-status error';
                    submitBtn.textContent = 'Submit Request';
                    submitBtn.disabled = false;
                    console.error('EmailJS Error:', error);
                });
        });
    }

    // 6. Newsletter Form Submission
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterStatus = document.getElementById('newsletter-status');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if(CONFIG.emailjs.publicKey === 'YOUR_PUBLIC_KEY') {
                newsletterStatus.textContent = "Error: EmailJS not configured.";
                newsletterStatus.className = "form-status error";
                return;
            }

            const email = document.getElementById('newsletter-email').value;
            const btn = newsletterForm.querySelector('button');
            
            btn.textContent = '...';
            btn.disabled = true;

            emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.newsletterTemplateId, {
                from_email: email,
                to_email: CONFIG.businessEmail
            }).then(function() {
                newsletterStatus.textContent = 'Subscribed successfully!';
                newsletterStatus.className = 'form-status success';
                newsletterForm.reset();
                btn.textContent = 'Join';
                btn.disabled = false;
            }, function(error) {
                newsletterStatus.textContent = 'Subscription failed. Try again.';
                newsletterStatus.className = 'form-status error';
                btn.textContent = 'Join';
                btn.disabled = false;
                console.error('EmailJS Error:', error);
            });
        });
    }
});
