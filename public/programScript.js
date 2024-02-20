document.addEventListener('DOMContentLoaded', function () {
    fetchUserPrograms();
    fetchAllPrograms();
});

function fetchUserPrograms() {
    const userId = 'replace_with_actual_user_id';

    fetch(`/user-programs/${userId}`)
        .then(response => response.json())
        .then(data => {
            displayUserPrograms(data.userPrograms);
        })
        .catch(error => {
            console.error('Error fetching user programs:', error);
        });
}

function displayUserPrograms(userPrograms) {
    const userProgramsContainer = document.getElementById('userPrograms');
    userProgramsContainer.innerHTML = '';

    userPrograms.forEach(program => {
        const programTab = createProgramTab(program);
        const removeButton = createRemoveButton(program._id);

        userProgramsContainer.appendChild(programTab);
        userProgramsContainer.appendChild(removeButton);

        // Add event listener to remove button
        removeButton.addEventListener('click', () => removeProgram(program._id));
    });
}

function createProgramTab(program) {
    const programTab = document.createElement('div');
    programTab.classList.add('program-tab');
    programTab.textContent = program.name;

    // Add event listener to display books when tab is clicked
    programTab.addEventListener('click', () => displayProgramBooks(program));

    return programTab;
}

function createRemoveButton(programId) {
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => removeProgram(programId));
    return removeButton;
}
function displayProgramBooks(program) {
    const language = program.language;

    // Fetch and display books for the selected program
    fetch(`/books?language=${language}&books_id=${program.books_id.join(',')}`)
        .then(response => response.json())
        .then(books => {
            // Display books as needed
            updateTabContent(language, books);
        })
        .catch(error => {
            console.error('Error fetching books:', error);
        });
}

function removeProgram(programId) {
    // Make a fetch request to remove the program
    // Use the program ID to identify and remove the program
    const userId = 'replace_with_actual_user_id';

    fetch(`/remove-program/${userId}/${programId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            // Handle success, possibly fetch and display user programs again
            fetchUserPrograms();
        })
        .catch(error => {
            console.error('Error removing program:', error);
        });
}

function fetchAllPrograms() {
    // Make a fetch request to get all available programs
    fetch('/programs')
        .then(response => response.json())
        .then(data => {
            displayAllPrograms(data);
        })
        .catch(error => {
            console.error('Error fetching all programs:', error);
        });
}

function displayAllPrograms(allPrograms) {
    const allProgramsContainer = document.getElementById('allPrograms');
    allProgramsContainer.innerHTML = '';

    allPrograms.forEach(program => {
        const addButton = createAddButton(program);

        allProgramsContainer.appendChild(addButton);

        // Add event listener to add button
        addButton.addEventListener('click', () => addProgram(program._id));
    });
}

function createAddButton(program) {
    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.addEventListener('click', () => addProgram(program._id));
    return addButton;
}

function addProgram(programId) {
    // Make a fetch request to add the program
    // Use the program ID to identify and add the program
    const userId = 'replace_with_actual_user_id';

    fetch(`/add-program/${userId}/${programId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            // Handle success, possibly fetch and display user programs again
            fetchUserPrograms();
        })
        .catch(error => {
            console.error('Error adding program:', error);
        });
}
function updateTabContent(language, books) {
    document.querySelectorAll('.tab-pane').forEach(tab => {
        tab.style.display = 'none';
    });

    const tabContent = document.getElementById(language);

    // The next line is likely causing the error if tabContent is null
    tabContent.innerHTML = '';


    if (books.length > 0) {
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card-container');

        books.forEach(book => {
            const card = document.createElement('div');
            card.classList.add('card');

            const image = document.createElement('img');
            image.classList.add('card-img');
            image.src = book.url;
            image.alt = book.title;

            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            const title = document.createElement('h5');
            title.classList.add('card-title');
            title.textContent = book.title;

            const author = document.createElement('p');
            author.classList.add('card-text');
            author.textContent = `Author: ${book.author}`;

            const level = document.createElement('p');
            level.classList.add('card-text');
            level.textContent = `Level: ${book.level}`;

            const publisher = document.createElement('p');
            publisher.classList.add('card-text');
            publisher.textContent = `Publisher: ${book.publisher}`;

            const link = document.createElement('a');
            console.log(book.link);
            link.href = book.link;
            link.target = '_blank';
            link.textContent = 'View PDF';

            cardBody.appendChild(title);
            cardBody.appendChild(author);
            cardBody.appendChild(level);
            cardBody.appendChild(publisher);
            cardBody.appendChild(link);

            card.appendChild(image);
            card.appendChild(cardBody);

            cardContainer.appendChild(card);
        });

        tabContent.appendChild(cardContainer);
    } else {
        tabContent.textContent = `No ${language.charAt(0).toUpperCase() + language.slice(1)} books available.`;
    }

    tabContent.style.display = 'block';
}