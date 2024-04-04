let currentSlide = 0;
var slides = document.querySelectorAll('.slide');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');


function updateButtonStates() {
  prevButton.disabled = currentSlide === 0;
  nextButton.disabled = false; // The next button is always active
  if (currentSlide === slides.length - 1) {
    nextButton.textContent = 'Close'; // Change text to 'Close'
    nextButton.onclick = function() {
      // Redirect to the test URL
      window.close();
    };
  } else {
    nextButton.textContent = 'Next'; // Change text back to 'Next'
    nextButton.onclick = function() {
      changeSlide(1);
    };
  }
}

function changeSlide(direction) {
  // If it's not the last slide, navigate to the next or previous slide
  if (currentSlide < slides.length - 1 || (currentSlide === slides.length - 1 && direction === -1)) {
    slides[currentSlide].classList.remove('active');
    currentSlide += direction;
    currentSlide = (currentSlide + slides.length) % slides.length; // Ensure we stay within the bounds
    slides[currentSlide].classList.add('active');
    updateButtonStates();
    if(!window.location.href.includes('genContent')) {
      initModal();
    }
    document.getElementsByClassName('course-content-container')[0].scrollTo(0,0);
  }
}

// Initial call to set the correct state for the "Previous" button
updateButtonStates();