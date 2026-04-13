const toggleLink = document.getElementById("toggle-link");
const authForm = document.getElementById("auth-form");
const authHeader = document.getElementById("auth-header");
const submitBtn = document.getElementById("submit-btn");


let isLogin = true;
toggleLink.addEventListener("click", (e) => {
    e.preventDefault()
    isLogin = !isLogin

    authForm.action = isLogin ? "/users/login" : "/users/adduser"
    authHeader.textContent = isLogin ? "Login to chat!" : "Register to join!"
    submitBtn.textContent = isLogin ? "Login" : "Register"
    toggleLink.textContent = isLogin ? "No profile? Register here." : "Already have a profile? Login here."
})