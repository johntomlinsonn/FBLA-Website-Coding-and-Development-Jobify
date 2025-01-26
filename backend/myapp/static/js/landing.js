let currentSlide = 0;
const slides = document.querySelectorAll('.oval > div');
console.log(slides);
console.log("hello");

// Hide all slides except the first one
slides.forEach((slide, i) => {
  if (i !== 0) {
    slide.style.display = 'none';
  } else {
    slide.classList.add('active');
    slide.style.display = 'block';
  }
});

function showSlide(index) {
  slides.forEach((slide, i) => {
    if (i === currentSlide) {
      slide.classList.remove('active');
      slide.classList.add('slide-out');
      setTimeout(() => {
        slide.style.display = 'none';
        slide.classList.remove('slide-out');
      }, 1000); // Match the duration of the slide-out animation
    }
    if (i === index) {
      slide.style.display = 'block';
      slide.classList.add('slide-in');
      setTimeout(() => {
        slide.classList.remove('slide-in');
        slide.classList.add('active');
      }, 1000); // Match the duration of the slide-in animation
    }
  });
  currentSlide = index;
}

function nextSlide() {
  const nextSlideIndex = (currentSlide + 1) % slides.length;
  showSlide(nextSlideIndex);
}

// Cycle through slides every 3 seconds
showSlide(currentSlide);
setInterval(nextSlide, 3000);