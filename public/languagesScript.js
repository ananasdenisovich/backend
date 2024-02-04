document.addEventListener('DOMContentLoaded', function () {
  // Initial language
  let currentLanguage = 'english';

  // Fetch books for the default language (English)
  fetchBooks(currentLanguage);

  // Add event listeners for language tabs
  document.getElementById('englishTab').addEventListener('click', function () {
    currentLanguage = 'english';
    fetchBooks(currentLanguage);
  });

  document.getElementById('frenchTab').addEventListener('click', function () {
    currentLanguage = 'french';
    fetchBooks(currentLanguage);
  });

  document.getElementById('russianTab').addEventListener('click', function () {
    currentLanguage = 'russian';
    fetchBooks(currentLanguage);
  });
});

function fetchBooks(language) {
  // Fetch books based on the selected language
  fetch(`/books/${language}`)
      .then(response => response.json())
      .then(books => {
        // Update the content of the respective tab
        updateTabContent(language, books);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
      });
}

function updateTabContent(language, books) {
  // Hide all tab contents
  document.querySelectorAll('.tab-pane').forEach(tab => {
    tab.style.display = 'none';
  });

  // Get the tab content container
  const tabContent = document.getElementById(language);

  // Clear existing content
  tabContent.innerHTML = '';

  // Check if there are books to display
  if (books.length > 0) {
    // Create a list of books
    const bookList = document.createElement('ul');

    books.forEach(book => {
      // Create a list item for each book
      const listItem = document.createElement('li');
      listItem.textContent = book.title; // You can customize the content as needed

      // Append the list item to the book list
      bookList.appendChild(listItem);
    });

    // Append the book list to the tab content
    tabContent.appendChild(bookList);
  } else {
    // If no books are available, display a message
    tabContent.textContent = `No ${language.charAt(0).toUpperCase() + language.slice(1)} books available.`;
  }

  // Show the current tab content
  tabContent.style.display = 'block';
}
