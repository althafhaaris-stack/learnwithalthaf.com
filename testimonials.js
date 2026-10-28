/* =========================================================
   STUDENT TESTIMONIALS - LEARN WITH ALTHAF
   ========================================================= */

const SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1wtrulC2FhlUtc7AWanZd1BMu7Nl4syHrsyQ7Cn45Juw/gviz/tq?tqx=out:json&sheet=Results%20Book';

let allTestimonials = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchTestimonials();
});

/* =========================================================
   FETCH TESTIMONIALS
   ========================================================= */

async function fetchTestimonials() {
  const loadingEl = document.getElementById('testimonialsLoading');

  try {
    const response = await fetch(SPREADSHEET_URL);
    if (!response.ok) {
      throw new Error('Unable to access Google Sheet');
    }

    const rawText = await response.text();

    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');

    if (start === -1 || end === -1) {
      throw new Error('Invalid Google Sheets response');
    }

    const jsonText = rawText.substring(start, end + 1);
    const data = JSON.parse(jsonText);
    const rows = data.table.rows || [];

    allTestimonials = rows.map(row => {
      const cells = row.c || [];
      const rankValue = cells[12]?.v;

      return {
        year: cells[0]?.v || '',
        name: cells[1]?.v || '',
        photo: cells[2]?.v || '',
        school: cells[3]?.v || '',
        accounting: cells[4]?.v || '',
        club3a:
          cells[5]?.v === true ||
          cells[5]?.v === 'TRUE' ||
          cells[5]?.v === 'true',
        zScore: cells[6]?.v || '',
        districtRank: cells[7]?.v || '',
        district: cells[8]?.v || '',
        islandRank: cells[9]?.v || '',
        university: cells[10]?.v || '',
        testimonial: cells[11]?.v || '',
        rank:
          rankValue !== null &&
          rankValue !== undefined &&
          String(rankValue).trim() !== ''
            ? parseInt(rankValue, 10)
            : null
      };
    })
    /* Only include students with a valid Name AND an assigned Testimonial Rank */
    .filter(student => {
      return (
        String(student.name).trim() !== '' &&
        student.rank !== null &&
        !isNaN(student.rank)
      );
    });

    /* Sort by Testimonial Rank (1, 2, 3...) */
    allTestimonials.sort((a, b) => a.rank - b.rank);

    if (loadingEl) {
      loadingEl.style.display = 'none';
    }

    /* Render batch filters and initial testimonial list */
    renderFilterTabs();
    renderTestimonials(allTestimonials);

  } catch (error) {
    console.error('Testimonials loading error:', error);
    if (loadingEl) {
      loadingEl.className = 'results-error';
      loadingEl.innerText = 'Unable to load testimonials at this time.';
    }
  }
}

/* =========================================================
   BATCH / YEAR FILTER TABS
   ========================================================= */

function renderFilterTabs() {
  const filterTabs = document.getElementById('filterTabs');
  if (!filterTabs) return;

  const years = [...new Set(allTestimonials.map(item => item.year).filter(Boolean))].sort((a, b) => b - a);

  filterTabs.innerHTML = `<button class="tab-btn active" data-year="all">All Batches</button>`;

  years.forEach(year => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.setAttribute('data-year', year);
    btn.innerText = `${year} A/L`;
    filterTabs.appendChild(btn);
  });

  filterTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      const selectedYear = e.target.getAttribute('data-year');
      if (selectedYear === 'all') {
        renderTestimonials(allTestimonials);
      } else {
        const filtered = allTestimonials.filter(item => item.year == selectedYear);
        renderTestimonials(filtered);
      }
    }
  });
}

/* =========================================================
   CONVERT GOOGLE DRIVE PHOTO URL
   ========================================================= */

function convertDrivePhotoUrl(url) {
  if (!url) return '';
  const match = String(url).match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match && match[1] ? `https://lh3.googleusercontent.com/d/${match[1]}` : url;
}

/* =========================================================
   RENDER TESTIMONIAL CARDS
   ========================================================= */

function renderTestimonials(items) {
  const container = document.getElementById('testimonialsContainer');
  if (!container) return;

  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = `<div class="results-error">No testimonials available.</div>`;
    return;
  }

  items.forEach(item => {
    const card = createTestimonialCard(item);
    container.appendChild(card);
  });
}

function createTestimonialCard(student) {
  const card = document.createElement('article');
  card.className = 'student-card';

  const main = document.createElement('div');
  main.className = 'student-main';

  const left = document.createElement('div');
  left.className = 'student-left';

  const photoUrl = convertDrivePhotoUrl(student.photo);

  if (photoUrl) {
    const img = document.createElement('img');
    img.className = 'student-photo';
    img.src = photoUrl;
    img.alt = student.name;
    img.onerror = function () {
      const placeholder = document.createElement('div');
      placeholder.className = 'student-photo-placeholder';
      placeholder.textContent = 'PHOTO';
      this.replaceWith(placeholder);
    };
    left.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'student-photo-placeholder';
    placeholder.textContent = 'PHOTO';
    left.appendChild(placeholder);
  }

  const basic = document.createElement('div');
  basic.className = 'student-basic';

  const name = document.createElement('div');
  name.className = 'student-name';
  name.textContent = student.name;
  basic.appendChild(name);

  if (student.school && String(student.school).trim() !== '') {
    const school = document.createElement('div');
    school.className = 'student-school';
    school.textContent = student.school;
    basic.appendChild(school);
  }

  if (student.year && String(student.year).trim() !== '') {
    const year = document.createElement('div');
    year.className = 'student-year';
    year.textContent = `${student.year} A/L`;
    basic.appendChild(year);
  }

  const badges = document.createElement('div');
  badges.className = 'student-badges';

  if (student.club3a) {
    const club = document.createElement('span');
    club.className = 'badge-3a';
    club.textContent = '3A Club';
    badges.appendChild(club);
  }

  if (student.accounting && String(student.accounting).trim() !== '') {
    const accounting = document.createElement('span');
    accounting.className = 'badge-accounting';
    accounting.textContent = `Accounting ${student.accounting}`;
    badges.appendChild(accounting);
  }

  if (badges.children.length > 0) {
    basic.appendChild(badges);
  }

  left.appendChild(basic);

  const right = document.createElement('div');
  right.className = 'student-right';

  addResult(right, 'Z-Score', student.zScore);

  let districtRank = '';
  if (student.districtRank && String(student.districtRank).trim() !== '') {
    districtRank = student.districtRank;
    if (student.district && String(student.district).trim() !== '') {
      districtRank += ` — ${student.district}`;
    }
  }
  addResult(right, 'District Rank', districtRank);

  addResult(right, 'Island Rank', student.islandRank);
  addResult(right, 'University', student.university);

  main.appendChild(left);
  main.appendChild(right);
  card.appendChild(main);

  if (student.testimonial && String(student.testimonial).trim() !== '') {
    const testimonial = document.createElement('div');
    testimonial.className = 'student-testimonial';

    const quote = document.createElement('span');
    quote.className = 'testimonial-quote';
    quote.textContent = '“';

    const text = document.createElement('span');
    text.className = 'testimonial-content';
    text.textContent = student.testimonial;

    testimonial.appendChild(quote);
    testimonial.appendChild(text);
    card.appendChild(testimonial);
  }

  return card;
}

function addResult(container, label, value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return;
  }

  const item = document.createElement('div');
  item.className = 'result-item';

  const labelElement = document.createElement('span');
  labelElement.className = 'result-label';
  labelElement.textContent = label;

  const valueElement = document.createElement('span');
  valueElement.className = 'result-value';
  valueElement.textContent = value;

  item.appendChild(labelElement);
  item.appendChild(valueElement);
  container.appendChild(item);
}