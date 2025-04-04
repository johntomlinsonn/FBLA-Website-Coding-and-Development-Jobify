let currentStep = 1;

function showStep(step) {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach((stepElement, index) => {
        if (index + 1 === step) {
            stepElement.classList.add('active');
        } else {
            stepElement.classList.remove('active');
        }
    });
}

function nextStep() {
    currentStep++;
    if (currentStep > 4) currentStep = 4;
    showStep(currentStep);
}

function prevStep() {
    currentStep--;
    if (currentStep < 1) currentStep = 1;
    showStep(currentStep);
}

function addCustomQuestion() {
    const container = document.getElementById('custom-questions-container');
    const newQuestion = document.createElement('div');
    newQuestion.classList.add('custom-question');
    newQuestion.innerHTML = `
        <input type="text" name="custom-questions[]" placeholder="Enter custom question" required>
    `;
    container.appendChild(newQuestion);
}

function removeCustomQuestion(button) {
    const question = button.parentElement;
    question.remove();
}

function removeLastCustomQuestion() {
    const container = document.getElementById('custom-questions-container');
    const questions = container.getElementsByClassName('custom-question');
    if (questions.length > 0) {
        questions[questions.length - 1].remove();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    showStep(currentStep);

    const addQuestionButton = document.getElementById('add-question');
    const customQuestionsContainer = document.getElementById('custom-questions-container');

    addQuestionButton.addEventListener('click', function() {
        const questionGroup = document.createElement('div');
        questionGroup.classList.add('form-group');

        const questionInput = document.createElement('input');
        questionInput.type = 'text';
        questionInput.name = 'custom_questions';
        questionInput.classList.add('form-control');
        questionInput.placeholder = 'Enter a custom question';
        questionGroup.appendChild(questionInput);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = 'Remove';
        removeButton.classList.add('btn', 'btn-danger', 'remove-question');
        removeButton.addEventListener('click', function() {
            questionGroup.remove();
        });
        questionGroup.appendChild(removeButton);

        customQuestionsContainer.appendChild(questionGroup);
    });
});

function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        // Clear any existing timeout
        if (timeout) {
            clearTimeout(timeout);
        }
        
        // Set new timeout
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}

function sendText() {
    //getting infomration from the description and location
    let description = document.getElementById("id_description").value;
    let location = document.getElementById("id_location").value;

    if (!description || !location) {
        //if there is no description or location dont make the request
        return;
    }

    //fetching the grade from the backend
    fetch(`/grade_job_live/?description=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`)
        //interpreting the json from the backend
        .then(response => response.json())
        .then(data => {
            if (data && data.grade !== undefined) {
                
                updateProgress(data.grade);
            }
        })
        //cathing any errors and showing them to the console
        .catch(error => {
            console.error("Error:", error);
        
        });
}

// Create debounced version with 2 second delay
const debouncedSendText = debounce(sendText, 2000);

// Add event listeners to both inputs
document.getElementById("id_description").addEventListener("input", debouncedSendText);
document.getElementById("id_location").addEventListener("input", debouncedSendText);

function updateProgress(percent) {
    const circle = document.getElementById('progress-bar');
    const text = document.getElementById('percentage');

    const circumference = 314; // 2 * Math.PI * 50 (radius)
    const offset = circumference - (percent / 100) * circumference;

    // Dynamically calculate color from red (0%) to green (100%)
    const hue = Math.round(120 * (percent / 100)); // 0 = Red, 120 = Green
    const color = `hsl(${hue}, 100%, 50%)`; // HSL color transition

    // Apply styles
    circle.style.setProperty("stroke-dashoffset", -offset);
    circle.style.setProperty("stroke", color);
    text.textContent = percent + '%';
}