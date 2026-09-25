document.getElementById('year-span').textContent = new Date().getFullYear();

        // Mobile Nav Toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');
        const GOOGLE_SHEETS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyqncGp0pMrK2BVupUgXIAz5wUGrQIbxjPjofr1acwX7D9VLklT_sPDmxci6t0fMOBD/exec";
        const SECRET_TOKEN = 'MY_CUSTOM_THERAPY_FORM_TOKEN_2026';
        let selectedRating = 5;

        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-xmark');
            } else {
                mobileMenu.classList.add('hidden');
                menuIcon.classList.remove('fa-xmark');
                menuIcon.classList.add('fa-bars');
            }
        });

        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuIcon.classList.remove('fa-xmark');
                menuIcon.classList.add('fa-bars');
            });
        });

        window.preselectTherapist = function(name) {
            const select = document.getElementById('therapist-selection');
            if(select) {
                select.value = name;
            }
        };

        /**
     * =========================================================================================
     * DEVELOPER & GOOGLE SHEETS SETUP INSTRUCTIONS
     * =========================================================================================
     * 
     * STEP 1: CREATE GOOGLE SHEET
     * 1. Go to https://sheets.google.com and create a new blank spreadsheet.
     * 2. Name the first sheet tab "Sheet1".
     * 3. Set Row 1 header labels as:
     *    A1: Timestamp | B1: Full Name | C1: Email | D1: Country | E1: City | F1: Problem | G1: Rating | H1: Testimonial
     *
     * STEP 2: PASTE APPS SCRIPT CODE
     * 1. In Google Sheets menu, click "Extensions" > "Apps Script".
     * 2. Replace all existing code in Code.gs with the following snippet:
     * -----------------------------------------------------------------------------------------
     * 
     * function doPost(e) {
     *   try {
     *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
     *     var data = JSON.parse(e.postData.contents);
     *     
     *     sheet.appendRow([
     *       new Date(),
     *       data.fullName,
     *       data.email,
     *       data.country,
     *       data.city,
     *       data.problem,
     *       data.rating,
     *       data.testimonial
     *     ]);
     *     
     *     return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
     *       .setMimeType(ContentService.MimeType.JSON);
     *   } catch (error) {
     *     return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
     *       .setMimeType(ContentService.MimeType.JSON);
     *   }
     * }
     * 
     * -----------------------------------------------------------------------------------------
     * STEP 3: DEPLOY WEB APP
     * 1. In Google Apps Script editor, click "Deploy" > "New deployment".
     * 2. Click the gear icon next to "Select type" and choose "Web app".
     * 3. Description: Speech Therapy Form Receiver
     * 4. Execute as: "Me"
     * 5. Who has access: "Anyone" (CRITICAL step to allow public submissions)
     * 6. Click "Deploy", authorize permissions when prompted, and copy the Web App URL.
     * 
     * STEP 4: UPDATE VARIABLE BELOW
     * Replace "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE" with your copied URL.
     * =========================================================================================
     *
     * STEP 5: ENABLE THE TESTIMONIAL CAROUSEL (reads feedback back OUT of the sheet)
     * Add this doGet function to the SAME Code.gs file, alongside doPost:
     * -----------------------------------------------------------------------------------------
     *
     * function doGet(e) {
     *   try {
     *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
     *     var rows = sheet.getDataRange().getValues();
     *     rows.shift(); // drop header row
     *
     *     var testimonials = rows
     *       .filter(function(r) { return Number(r[6]) >= 4; }) // only show 4-5 star feedback publicly
     *       .slice(-12)   // most recent 12 entries
     *       .reverse()    // newest first
     *       .map(function(r) {
     *         return {
     *           timestamp: r[0],
     *           name: r[1],
     *           problem: r[5],
     *           rating: r[6],
     *           testimonial: r[7]
     *         };
     *       });
     *
     *     return ContentService.createTextOutput(JSON.stringify({ result: "success", testimonials: testimonials }))
     *       .setMimeType(ContentService.MimeType.JSON);
     *   } catch (error) {
     *     return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
     *       .setMimeType(ContentService.MimeType.JSON);
     *   }
     * }
     *
     * -----------------------------------------------------------------------------------------
     * After adding it: Deploy > Manage deployments > Edit (pencil icon) > New version > Deploy.
     * The existing Web App URL stays the same — both doGet and doPost live on the same URL.
     * =========================================================================================
     * https://docs.google.com/spreadsheets/d/1XXuLKMulLqQWW8tIHD8u1ioUp0oSvzQZGHc13u0neIw/edit?gid=0#gid=0
     */

    // Replace this string with your Google Apps Script Web App URL

    // Interactive Star Rating
    function setRating(rating) {
      selectedRating = rating;
      document.getElementById('ratingValue').value = rating;
      
      const stars = document.querySelectorAll('#starContainer i');
      const labels = ['', '1 / 5 - Poor', '2 / 5 - Fair', '3 / 5 - Good', '4 / 5 - Very Good', '5 / 5 - Excellent!'];
      
      stars.forEach((star, index) => {
        if (index < rating) {
          star.classList.add('active');
        } else {
          star.classList.remove('active');
        }
      });

      const labelEl = document.getElementById('ratingLabel');
      labelEl.innerText = labels[rating];
      labelEl.className = 'text-sm font-semibold text-amber-600';
      hideError();
    }

    // Display / Hide Error Alert
    function showError(msg) {
      const alertBox = document.getElementById('errorAlert');
      const msgBox = document.getElementById('errorMessage');
      msgBox.innerHTML = msg;
      alertBox.classList.remove('hidden');
      alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideError() {
      document.getElementById('errorAlert').classList.add('hidden');
    }

    // Submit Handler
    async function handleFormSubmit(event) {
      event.preventDefault();
      hideError();

      // Validate Rating
      if (!selectedRating) {
        showError('Please select a star rating for your overall experience.');
        return;
      }

      // Check if developer script URL is configured
      if (!GOOGLE_SHEETS_SCRIPT_URL || GOOGLE_SHEETS_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
        showError('<strong>Setup required:</strong> The Google Apps Script URL has not been set yet by the website administrator. Please configure <code>GOOGLE_SHEETS_SCRIPT_URL</code> in the source code.');
        return;
      }

      const submitBtn = document.getElementById('submitBtn');
      const originalBtnText = submitBtn.innerHTML;

      // Enable Loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-sm"></i> Submitting...`;

      // Form Data Payload
      const formData = {
        secretKey: SECRET_TOKEN,
        name: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        country: document.getElementById('country').value.trim(),
        city: document.getElementById('city').value.trim(),
        problem: document.getElementById('problem').value,
        rating: selectedRating,
        testimonial: document.getElementById('testimonial').value.trim()
      };

      try {
        await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
          method: 'POST',
          headers: {
        'Content-Type': 'text/plain;charset=utf-8' // Keeps browser from aborting the 302 redirect
      },
          body: JSON.stringify(formData)
        });

        // Show Thank You Card
        document.getElementById('feedbackForm').classList.add('hidden');
        document.getElementById('thankYouCard').classList.remove('hidden');
      } catch (error) {
        console.error('Submission Error:', error);
        showError('We encountered a network issue submitting your feedback. Please try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }

    // Reset Form to Submit Another
    function resetToNewForm() {
      document.getElementById('feedbackForm').reset();
      selectedRating = 0;
      document.getElementById('ratingValue').value = '';
      
      const stars = document.querySelectorAll('#starContainer i');
      stars.forEach(star => star.classList.remove('active'));

      const labelEl = document.getElementById('ratingLabel');
      labelEl.innerText = 'Tap stars to rate';
      labelEl.className = 'text-sm font-medium text-slate-500';

      document.getElementById('thankYouCard').classList.add('hidden');
      document.getElementById('feedbackForm').classList.remove('hidden');
      hideError();
    }

    setRating(5);

    // ================= Testimonial Carousel =================
    let testimonials = [];
    let currentSlide = 0;

    function escapeHtml(str) {
      return String(str || '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]));
    }

    async function fetchTestimonials() {
      const loadingEl = document.getElementById('testimonialLoading');
      const emptyEl = document.getElementById('testimonialEmpty');
      const carouselEl = document.getElementById('testimonialCarousel');

      if (!GOOGLE_SHEETS_SCRIPT_URL || GOOGLE_SHEETS_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
        loadingEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
        emptyEl.classList.add('flex');
        return;
      }

      try {
        const response = await fetch(`${GOOGLE_SHEETS_SCRIPT_URL}?action=testimonials`);
        const data = await response.json();

        if (!data || data.result !== 'success' || !Array.isArray(data.testimonials) || data.testimonials.length === 0) {
          throw new Error('No testimonials returned');
        }

        testimonials = data.testimonials;
        renderTestimonialDots();
        renderTestimonialSlide(0);

        loadingEl.classList.add('hidden');
        carouselEl.classList.remove('hidden');
      } catch (error) {
        console.error('Testimonial fetch error:', error);
        loadingEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
        emptyEl.classList.add('flex');
      }
    }

    function renderTestimonialDots() {
      const dotsEl = document.getElementById('testimonialDots');
      dotsEl.innerHTML = testimonials.map((_, i) =>
        `<button type="button" class="testimonial-dot h-2 rounded-full transition-all ${i === 0 ? 'bg-navy-800 w-6' : 'bg-offwhite-400 w-2'}" data-index="${i}" aria-label="Go to testimonial ${i + 1}"></button>`
      ).join('');

      dotsEl.querySelectorAll('.testimonial-dot').forEach(dot => {
        dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index, 10)));
      });
    }

        function renderTestimonialSlide(index) {
      const track = document.getElementById('testimonialTrack');
      const item = testimonials[index];
      const rating = Number(item.rating) || 0;

      const starsHtml = Array.from({ length: 5 }, (_, i) =>
        `<i class="fa-solid fa-star${i < rating ? '' : ' text-offwhite-400'}"></i>`
      ).join(' ');

      const safeName = escapeHtml(item.name) || 'Anonymous';
      const safeLocation = [escapeHtml(item.city), escapeHtml(item.country)].filter(Boolean).join(', ');
      const safeService = escapeHtml(item.problem);
      const safeComment = escapeHtml(item.testimonial);
      const dateStr = item.timestamp
        ? new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : '';

      track.innerHTML = `
        <div class="w-full flex-shrink-0 px-0.5">
          <div class="bg-offwhite-100 border border-offwhite-300 rounded-2xl p-6 h-full flex flex-col">
            <div class="flex items-start justify-between mb-2 gap-3">
              <div>
                <h4 class="font-bold text-navy-900 text-base">${safeName}</h4>
                ${safeLocation ? `<p class="text-xs text-slate-400 font-medium mt-0.5">${safeLocation}</p>` : ''}
              </div>
              <div class="text-amber-500 text-sm whitespace-nowrap">${starsHtml}</div>
            </div>
            ${safeService ? `<span class="inline-block text-xs bg-navy-100 text-navy-900 px-2 py-0.5 rounded-md font-bold mb-3 w-fit">${safeService}</span>` : ''}
            <p class="text-slate-700 text-sm leading-relaxed flex-1">"${safeComment}"</p>
            ${dateStr ? `<p class="text-xs text-slate-400 mt-4 text-right font-medium">${dateStr}</p>` : ''}
          </div>
        </div>
      `;
    }

    function goToSlide(index) {
      if (testimonials.length === 0) return;
      currentSlide = (index + testimonials.length) % testimonials.length;
      renderTestimonialSlide(currentSlide);

      document.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
        dot.className = `testimonial-dot h-2 rounded-full transition-all ${i === currentSlide ? 'bg-navy-800 w-6' : 'bg-offwhite-400 w-2'}`;
      });
    }

    document.getElementById('testimonialPrev')?.addEventListener('click', () => goToSlide(currentSlide - 1));
    document.getElementById('testimonialNext')?.addEventListener('click', () => goToSlide(currentSlide + 1));

    fetchTestimonials();