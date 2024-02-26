document.addEventListener('DOMContentLoaded', function () {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const testContainer = document.getElementById('test-container');
    const testForm = document.getElementById('test-form');

    async function startTest(language) {
        const { questions, correctAnswers } = await fetchTestQuestions(language);
        displayTestQuestions(questions);

        return correctAnswers;
    }

    function calculateScore(userAnswers, correctAnswers) {
        let score = 0;

        for (let i = 0; i < userAnswers.length; i++) {
            if (userAnswers[i] === correctAnswers[i]) {
                score++;
            }
        }

        return score;
    }
    async function fetchTestQuestions(language) {
        const response = await fetch(`http://localhost:3000/getTestQuestions/${language}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const { questions, correctAnswers } = await response.json();
        return { questions, correctAnswers };
    }
    function gatherUserAnswers() {
        const userAnswers = {};

        const questionElements = document.querySelectorAll('input[type="radio"]:checked');

        questionElements.forEach((element) => {
            const questionName = element.name;
            const answerValue = element.value;

            userAnswers[questionName] = answerValue;
        });

        return userAnswers;
    }
    function displayTestQuestions(questions) {
        testForm.innerHTML = '';

        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('mb-3');

            const questionLabel = document.createElement('label');
            questionLabel.classList.add('form-label');
            questionLabel.textContent = `${index + 1}. ${question.text}`;

            questionDiv.appendChild(questionLabel);

            question.options.forEach((option, optionIndex) => {
                const optionLabel = document.createElement('label');
                optionLabel.classList.add('form-check', 'form-check-inline');

                const optionInput = document.createElement('input');
                optionInput.classList.add('form-check-input');
                optionInput.type = 'radio';
                optionInput.name = `question${index}`;
                optionInput.value = optionIndex;

                const optionText = document.createElement('span');
                optionText.classList.add('form-check-label');
                optionText.textContent = option;

                optionLabel.appendChild(optionInput);
                optionLabel.appendChild(optionText);

                questionDiv.appendChild(optionLabel);
            });

            testForm.appendChild(questionDiv);
        });

        testContainer.style.display = 'block';
    }

    document.getElementById('englishButton').addEventListener('click', () => {
        startTest('english');
    });

    window.submitTest = async function () {
        const userAnswers = gatherUserAnswers();
        const correctAnswers = await startTest('english');
        const score = calculateScore(userAnswers, correctAnswers);


        const token = localStorage.getItem('token');
        const language = 'english';
        const requestBody = { language, score };

        try {
            const response = await fetch(`http://localhost:3000/saveTestScores/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (data.success) {
                console.log('Test scores saved successfully!');
            } else {
                console.error('Failed to save test scores:', data.error);
            }
        } catch (error) {
            console.error('Error saving test scores:', error);
        }
    };
});