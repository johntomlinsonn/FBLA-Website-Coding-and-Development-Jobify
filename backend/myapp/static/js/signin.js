document.addEventListener('DOMContentLoaded', function() {
    //getting all of the elemetn ids
    const showSignUpButton = document.getElementById('show-sign-up');
    const showSignInButton = document.getElementById('show-sign-in');

    // getting container for sign in and sign up
    const signInFormContainer = document.getElementById('sign-in-form-container');
    const signUpFormContainer = document.getElementById('sign-up-form-container');

    //getting the buttons for the sign in and sign up page
    const signUpButton = document.getElementById('sign-up');
    const signInButton = document.getElementById('sign-in');

    // Check local storage for signInCheck value, this ensures that we are showing sign in or the sign up page
    let signInCheck = localStorage.getItem('signInCheck');

    // if the sign up button exists  we are going to show it  and not sow the sign up form
    if (showSignUpButton) {
        // on click of the isgn up button the website will not show the sign in form
        showSignUpButton.addEventListener('click', function(e) {
            e.preventDefault();
            //not showing the sign in form 
            if (signInFormContainer) signInFormContainer.style.display = 'none';
            if (signUpFormContainer) signUpFormContainer.style.display = 'block';

            localStorage.setItem('signInCheck', 'false');
        });
    }

    // if the sign in button exists we will display it and not show the sign up form
    if (showSignInButton) {
        //on click of the signin button the website will not render the sign up form
        showSignInButton.addEventListener('click', function(e) {
            e.preventDefault();
            //not showing the sign in form
            if (signInFormContainer) signInFormContainer.style.display = 'block';
            if (signUpFormContainer) signUpFormContainer.style.display = 'none';
            localStorage.setItem('signInCheck', 'true');
        });
    }

    //if the signup button exists we will add the function to set the sign  in check to false
    if (signUpButton) {
        signUpButton.addEventListener('click', function() {
            localStorage.setItem('signInCheck', 'false');
            window.location.href = "signin.html";
        });
    }

    // if the sign in button exists and is clicked the sigin check variable will be set to true
    if (signInButton) {
        signInButton.addEventListener('click', function() {
            localStorage.setItem('signInCheck', 'true');
            window.location.href = "signin.html";
        });
    }

    //checking local variable that is set by whether the user selects sign in or sign up
    if (signInCheck === 'true') {
        //showing the signin form if the sign in form is selected and not showing the sign up
        if (signInFormContainer) signInFormContainer.style.display = 'block';
        if (signUpFormContainer) signUpFormContainer.style.display = 'none';
    } else if (signInCheck === 'false') {
        // showing the sign up form if the the sing up form is selected and not showing the sign in 
        if (signInFormContainer) signInFormContainer.style.display = 'none';
        if (signUpFormContainer) signUpFormContainer.style.display = 'block';
    }
});
