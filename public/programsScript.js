document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://localhost:3000/programs');
    const programs = await response.json();

    const programsList = document.getElementById('programsList');
    if (programsList) {
      programs.forEach(program => {
        const programDiv = document.createElement('div');
        const textNode = document.createElement('div');
        textNode.textContent = program.name;
        programDiv.appendChild(textNode);

        programDiv.addEventListener('click', () => selectProgram(program._id));
        const addButton = document.createElement('button');
        addButton.textContent = 'Add';
        addButton.addEventListener('click', () => addProgram(program._id));
        programDiv.appendChild(addButton);

        programsList.appendChild(programDiv);
      });
    } else {
      console.error('Element with ID "programsList" not found.');
    }

    function selectProgram(programId) {
      const userId = localStorage.getItem('userId');

      fetch(`http://localhost:3000/add-program/${userId}/${programId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert('Program added successfully');
            } else {
              alert(data.error);
            }
          })
          .catch(error => {
            console.error('Error adding program:', error);
          });
    }

    function addProgram(programId) {
      fetch(`http://localhost:3000/add-program/${programId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert('Program added successfully');
            } else {
              alert(data.error);
            }
          })
          .catch(error => {
            console.error('Error adding program:', error);
          });
    }
  } catch (error) {
    console.error('Error fetching programs:', error);
  }
});
