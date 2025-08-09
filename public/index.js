const form = document.getElementById("form");
const weightInput = document.getElementById("weight");
const distanceInput = document.getElementById("distance");
const timeInput = document.getElementById("time");
const foodInput = document.getElementById("food");
const submitBtn = document.getElementById("submitBtn");
const messageDiv = document.getElementById("message");
const getInfoBtn = document.getElementById("getInfoBtn");
const statsDiv = document.getElementById("stats");
const dataTableDiv = document.getElementById("dataTable");

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = "block";
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 5000);
}

async function submitNumber(weight, distance, time, food) {
  try {
    showMessage("Sending...", "loading");
    submitBtn.disabled = true;
    const response = await fetch("/api/numbers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        weight: parseFloat(weight),
        distance: parseFloat(distance),
        time: parseFloat(time),
        food: food ? 1 : 0,
      }),
    });
    const result = await response.json();
    if (response.ok) {
      showMessage(`Number saved.`, "success");
      form.reset();
      getInfo();
    } else {
      showMessage(`Error: ${result.error}`, "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("Error trying to submit the number.", "error");
  } finally {
    submitBtn.disabled = false;
  }
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const weight = weightInput.value.trim();
  const distance = distanceInput.value.trim();
  const time = timeInput.value.trim();
  const food = foodInput.value.trim();
  submitNumber(weight, distance, time, food);
});

// Validation
// numberInput.addEventListener('input', function() {
//     const value = this.value;
//     if (value !== '' && isNaN(parseFloat(value))) {
//         this.setCustomValidity('Insert a valid number');
//     } else {
//         this.setCustomValidity('');
//     }
// });

function displayData(data) {
  const numbers = data.numbers || [];
  const count = data.count || 0;
  if (count > 0) {
    statsDiv.innerHTML = ``;
    numbers.forEach((el) => {
      const newItem = document.createElement("div");
      newItem.className = "item";
      newItem.textContent = el;
      statsDiv.innerHTML += `
        <div class="item">
        <p>ID:<span>${el.id}</span></p> 
        <p>Weight:<span>${el.weight}</span></p> 
        <p>Distance:<span>${el.distance}</span></p> 
        <p>Time:<span>${el.time}</span></p> 
        <p>Food:<span>${el.food}</span></p> 
        <p>Date:<span>${el.created_at}</span></p> 
        <button onclick={deleteNumber(${el.id})}>Delete</button>
        </div>
      `;
    });
  } else {
    statsDiv.innerHTML = `
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">Total</div>
            </div>
        `;
  }
  // TODO: Mostrar tabla con contenido general
  // if (count > 0) {
  //   const tableHTML = `
  //           <table class="table">
  //               <thead>
  //                   <tr>
  //                       <th>ID</th>
  //                       <th>Número</th>
  //                       <th>Fecha de creación</th>
  //                       <th>Acciones</th>
  //                   </tr>
  //               </thead>
  //               <tbody>
  //                   ${numbers
  //                     .map(
  //                       (item) => `
  //                       <tr>
  //                           <td>${item.id}</td>
  //                           <td>${item.number}</td>
  //                           <td>${formatDate(item.created_at)}</td>
  //                           <td>
  //                               <button class="delete-btn" onclick="deleteNumber(${item.id})">
  //                                   Eliminar
  //                               </button>
  //                           </td>
  //                       </tr>
  //                   `,
  //                     )
  //                     .join("")}
  //               </tbody>
  //           </table>
  //       `;
  //   dataTableDiv.innerHTML = tableHTML;
  // } else {
  //   dataTableDiv.innerHTML =
  //     '<div class="no-data">No hay números guardados</div>';
  // }
}

async function getInfo() {
  try {
    getInfoBtn.disabled = true;
    getInfoBtn.textContent = "Loading...";
    const response = await fetch("/api/numbers");
    const result = await response.json();
    if (response.ok) {
      displayData(result);
    } else {
      showMessage(`Error: ${result.error}`, "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("Error getting the info.", "error");
  } finally {
    getInfoBtn.disabled = false;
    getInfoBtn.textContent = "Get Info";
  }
}

getInfoBtn.addEventListener("click", getInfo);

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

async function deleteNumber(id) {
  if (!confirm("Are you sure yo want to delete this number?")) {
    return;
  }
  try {
    const response = await fetch(`/api/numbers/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (response.ok) {
      showMessage("Successfully deleted", "success");
      getInfo();
    } else {
      showMessage(`Error: ${result.error}`, "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("Error while deleting the number", "error");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  getInfo();
});
