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