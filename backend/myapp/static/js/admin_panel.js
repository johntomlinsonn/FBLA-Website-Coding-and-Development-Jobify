document.querySelectorAll('.job-description-button').forEach(button => {
  const description = button.nextElementSibling;
  // Start with the description hidden
  description.style.display = 'none';

  button.addEventListener('click', () => {
    if (description.style.display === 'none' || description.style.display === '') {
      description.style.display = 'block';
    } else {
      description.style.display = 'none';
    }
  });
});