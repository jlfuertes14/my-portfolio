// Contact Form Handler (Web3Forms)
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (!contactForm) {
        console.error('Contact form not found!');
        return;
    }

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        formStatus.style.display = 'none';

        // Get form data
        const formData = new FormData(contactForm);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // Success
                formStatus.style.display = 'block';
                formStatus.style.background = 'rgba(0, 255, 65, 0.1)';
                formStatus.style.border = '1px solid var(--accent)';
                formStatus.style.color = 'var(--accent)';
                formStatus.textContent = '✓ Message sent successfully! I\'ll get back to you soon.';
                contactForm.reset();
            } else {
                // Error from API
                throw new Error(data.message || 'Something went wrong');
            }
        } catch (error) {
            // Network or other error
            console.error('Form submission error:', error);
            formStatus.style.display = 'block';
            formStatus.style.background = 'rgba(255, 0, 0, 0.1)';
            formStatus.style.border = '1px solid #ff4444';
            formStatus.style.color = '#ff4444';
            formStatus.textContent = '✗ Failed to send message. Please try again.';
        } finally {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});
