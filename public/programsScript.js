document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem('userId');
  try {
    const userProgramsResponse = await fetch(`http://localhost:3000/user-programs/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const { userPrograms } = await userProgramsResponse.json();

    // Display user's programs with remove button
    const userProgramsList = document.getElementById('userProgramsList');
    userPrograms.forEach(userProgram => {
      const programDiv = createProgramDiv(userProgram.name);

      // Add click event to handle program removal
      const removeButton = createRemoveButton(userProgram._id);
      programDiv.appendChild(removeButton);

      userProgramsList.appendChild(programDiv);
    });

    // Fetch all programs from the backend
    const allProgramsResponse = await fetch('http://localhost:3000/programs', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const allPrograms = await allProgramsResponse.json();

    // Display all programs
    const allProgramsList = document.getElementById('allProgramsList');
    allPrograms.forEach(program => {
      const programDiv = createProgramDiv(program.name);

      // Add click event to handle program addition
      const addButton = createAddButton(program._id);
      programDiv.appendChild(addButton);

      allProgramsList.appendChild(programDiv);
    });

    function addProgram(programId) {
      fetch(`http://localhost:3000/add-program/${userId}/${programId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert('Program added successfully');
              // Refresh the user's programs list after addition
              location.reload();
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

  function createProgramDiv(programName) {
    const programDiv = document.createElement('div');
    const textNode = document.createElement('div');
    textNode.textContent = programName;
    programDiv.appendChild(textNode);
    return programDiv;
  }

  function createRemoveButton(programId) {
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => removeProgram(programId));
    return removeButton;
  }

  function createAddButton(programId) {
    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.addEventListener('click', () => addProgram(programId));
    return addButton;
  }

  async function removeProgram(programId) {
    try {
      // Send request to remove program from user's programs array
      const removeProgramResponse = await fetch(`http://localhost:3000/remove-program/${userId}/${programId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await removeProgramResponse.json();

      if (data.success) {
        // Update the displayed user programs
        const programToRemove = document.getElementById(programId);
        programToRemove.remove();
        alert('Program removed successfully');
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error removing program:', error);
    }
  }


});
