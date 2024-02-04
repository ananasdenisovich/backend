document.addEventListener('DOMContentLoaded', function () {

  let currentLanguage = 'english';

  fetchBooks(currentLanguage);

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

  fetch(`/books/${language}`)
      .then(response => response.json())
      .then(books => {

        updateTabContent(language, books);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
      });
}

function updateTabContent(language, books) {
  document.querySelectorAll('.tab-pane').forEach(tab => {
    tab.style.display = 'none';
  });

  const tabContent = document.getElementById(language);

  tabContent.innerHTML = '';

  if (books.length > 0) {
    const bookList = document.createElement('ul');

    books.forEach(book => {
      const listItem = document.createElement('li');
      listItem.textContent = book.title;
      bookList.appendChild(listItem);
    });

    tabContent.appendChild(bookList);
  } else {
    tabContent.textContent = `No ${language.charAt(0).toUpperCase() + language.slice(1)} books available.`;
  }

  tabContent.style.display = 'block';
}
