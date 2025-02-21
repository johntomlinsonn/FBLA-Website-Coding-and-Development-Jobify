document.addEventListener('DOMContentLoaded', function() {
    const addReferenceButton = document.getElementById('add-reference');
    const additionalReferences = document.getElementById('additional-references');

    addReferenceButton.addEventListener('click', function() {
        const referenceGroup = document.createElement('div');
        referenceGroup.classList.add('form-group');

        const referenceNameLabel = document.createElement('label');
        referenceNameLabel.textContent = 'Reference Name:';
        referenceGroup.appendChild(referenceNameLabel);

        const referenceNameInput = document.createElement('input');
        referenceNameInput.type = 'text';
        referenceNameInput.name = 'reference_name';
        referenceNameInput.classList.add('form-control');
        referenceGroup.appendChild(referenceNameInput);

        const referenceRelationLabel = document.createElement('label');
        referenceRelationLabel.textContent = 'Reference Relation:';
        referenceGroup.appendChild(referenceRelationLabel);

        const referenceRelationInput = document.createElement('input');
        referenceRelationInput.type = 'text';
        referenceRelationInput.name = 'reference_relation';
        referenceRelationInput.classList.add('form-control');
        referenceGroup.appendChild(referenceRelationInput);

        const referenceContactLabel = document.createElement('label');
        referenceContactLabel.textContent = 'Reference Contact:';
        referenceGroup.appendChild(referenceContactLabel);

        const referenceContactInput = document.createElement('input');
        referenceContactInput.type = 'text';
        referenceContactInput.name = 'reference_contact';
        referenceContactInput.classList.add('form-control');
        referenceGroup.appendChild(referenceContactInput);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = 'Remove';
        removeButton.classList.add('btn', 'btn-danger', 'remove-reference');
        removeButton.addEventListener('click', function() {
            referenceGroup.remove();
        });
        referenceGroup.appendChild(removeButton);

        additionalReferences.appendChild(referenceGroup);
    });

    const addEducationButton = document.getElementById('add-education');
    const additionalEducation = document.getElementById('additional-education');

    addEducationButton.addEventListener('click', function() {
        const educationGroup = document.createElement('div');
        educationGroup.classList.add('form-group');

        const schoolNameLabel = document.createElement('label');
        schoolNameLabel.textContent = 'School Name:';
        educationGroup.appendChild(schoolNameLabel);

        const schoolNameInput = document.createElement('input');
        schoolNameInput.type = 'text';
        schoolNameInput.name = 'school_name';
        schoolNameInput.classList.add('form-control');
        educationGroup.appendChild(schoolNameInput);

        const graduationDateLabel = document.createElement('label');
        graduationDateLabel.textContent = 'Graduation Date:';
        educationGroup.appendChild(graduationDateLabel);

        const graduationDateInput = document.createElement('input');
        graduationDateInput.type = 'date';
        graduationDateInput.name = 'graduation_date';
        graduationDateInput.classList.add('form-control');
        educationGroup.appendChild(graduationDateInput);

        const gpaLabel = document.createElement('label');
        gpaLabel.textContent = 'GPA:';
        educationGroup.appendChild(gpaLabel);

        const gpaInput = document.createElement('input');
        gpaInput.type = 'number';
        gpaInput.name = 'gpa';
        gpaInput.classList.add('form-control');
        educationGroup.appendChild(gpaInput);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = 'Remove';
        removeButton.classList.add('btn', 'btn-danger', 'remove-education');
        removeButton.addEventListener('click', function() {
            educationGroup.remove();
        });
        educationGroup.appendChild(removeButton);

        additionalEducation.appendChild(educationGroup);
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function sendText() {
        let resumeUrl = document.getElementById("resume-url").value;
        let description = document.querySelector(".job-description").innerText;
        let csrfToken = getCookie('csrftoken');

        const formData = new FormData();
        formData.append("resume_url", resumeUrl);
        formData.append("description", description);
        formData.append("csrfmiddlewaretoken", csrfToken);

        console.log("Sending data:", {
            resume_url: resumeUrl,
            description: description,
            csrfmiddlewaretoken: csrfToken
        });


        fetch(`/grade_applicant_live/?resume_url=${encodeURIComponent(resumeUrl)}&description=${encodeURIComponent(description)}`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.grade !== undefined) {
                updateProgress(data.grade);
            } 
        })
        .catch(error => {
            console.error("Error:", error);
            
        });
    }

    // Run sendText function when the page is loaded
    sendText();

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
});

