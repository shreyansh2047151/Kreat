/*****************************************************
  GLOBAL DATA & STATE
******************************************************/
let createdForms = [];   // Array of created forms
let allResponses = [];   // Array of user responses (for records tab, etc.)
const synth = window.speechSynthesis; // For speech in test tab

/*****************************************************
  SIDEBAR NAVIGATION
******************************************************/
const homeLink     = document.getElementById("home-link");
const createLink   = document.getElementById("create-link");
const recordsLink  = document.getElementById("records-link");
const testLink     = document.getElementById("test-link");
const deleteLink   = document.getElementById("delete-link");

const homeContent    = document.getElementById("home-content");
const createContent  = document.getElementById("create-content");
const recordsContent = document.getElementById("records-content");
const testContent    = document.getElementById("test-content");
const deleteContent  = document.getElementById("delete-content");

const navLinks = document.querySelectorAll(".nav-links li");

function showHome() {
  homeContent.classList.remove("hidden");
  createContent.classList.add("hidden");
  recordsContent.classList.add("hidden");
  testContent.classList.add("hidden");
  deleteContent.classList.add("hidden");
}

function showCreate() {
  homeContent.classList.add("hidden");
  createContent.classList.remove("hidden");
  recordsContent.classList.add("hidden");
  testContent.classList.add("hidden");
  deleteContent.classList.add("hidden");
}

function showRecords() {
  homeContent.classList.add("hidden");
  createContent.classList.add("hidden");
  recordsContent.classList.remove("hidden");
  testContent.classList.add("hidden");
  deleteContent.classList.add("hidden");
  renderRecordsDropdown();
}

function showTest() {
  homeContent.classList.add("hidden");
  createContent.classList.add("hidden");
  recordsContent.classList.add("hidden");
  testContent.classList.remove("hidden");
  deleteContent.classList.add("hidden");
  renderTestFormsDropdown();
}

function showDelete() {
  homeContent.classList.add("hidden");
  createContent.classList.add("hidden");
  recordsContent.classList.add("hidden");
  testContent.classList.add("hidden");
  deleteContent.classList.remove("hidden");
  renderDeleteDropdown();
}

function setActiveLink(clickedLink) {
  navLinks.forEach(li => li.classList.remove("active"));
  clickedLink.parentElement.classList.add("active");
}

homeLink.addEventListener("click", (e) => {
  e.preventDefault();
  showHome();
  setActiveLink(homeLink);
});
createLink.addEventListener("click", (e) => {
  e.preventDefault();
  showCreate();
  setActiveLink(createLink);
});
recordsLink.addEventListener("click", (e) => {
  e.preventDefault();
  showRecords();
  setActiveLink(recordsLink);
});
testLink.addEventListener("click", (e) => {
  e.preventDefault();
  showTest();
  setActiveLink(testLink);
});
deleteLink.addEventListener("click", (e) => {
  e.preventDefault();
  showDelete();
  setActiveLink(deleteLink);
});

/*****************************************************
  PROFILE DROPDOWN
******************************************************/
const profileImg = document.querySelector(".profile-img");
const profileDropdown = document.getElementById("profile-dropdown");

profileImg.addEventListener("click", () => {
  profileDropdown.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (!profileImg.contains(e.target) && !profileDropdown.contains(e.target)) {
    profileDropdown.classList.add("hidden");
  }
});

/*****************************************************
  NOTIFICATION FUNCTIONALITY
******************************************************/
function sendNotification(message) {
  const container = document.getElementById("notification-container");
  if (!container) return;
  const notif = document.createElement("div");
  notif.classList.add("notification-item");
  notif.innerText = message;
  container.appendChild(notif);
  setTimeout(() => {
    notif.remove();
  }, 3000);
}

/*****************************************************
  HOME: FEEDBACK FORMS
******************************************************/
const feedbackFormsBtn      = document.getElementById("feedback-forms-btn");
const formsList             = document.getElementById("forms-list");
const formsSelect           = document.getElementById("forms-select");
const selectedFormQuestions = document.getElementById("selected-form-questions");

feedbackFormsBtn.addEventListener("click", () => {
  formsList.classList.toggle("hidden");
  if (formsList.classList.contains("hidden")) {
    selectedFormQuestions.classList.add("hidden");
  }
});

function renderFormsDropdown() {
  formsSelect.innerHTML = `<option value="">Select a form</option>`;
  createdForms.forEach((form, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = form.formName;
    formsSelect.appendChild(option);
  });
  selectedFormQuestions.classList.add("hidden");
  selectedFormQuestions.innerHTML = "";
}

formsSelect.addEventListener("change", () => {
  const selectedIndex = formsSelect.value;
  if (selectedIndex === "") {
    selectedFormQuestions.classList.add("hidden");
    selectedFormQuestions.innerHTML = "";
    return;
  }
  const form = createdForms[selectedIndex];
  selectedFormQuestions.innerHTML = "";
  const table = document.createElement("table");
  table.classList.add("records-table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Question</th>
        <th>Type</th>
        <th>Required</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");
  form.questions.forEach((q) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${q.question}</td>
      <td>${q.type}</td>
      <td>${q.required ? 'Yes' : 'No'}</td>
    `;
    tbody.appendChild(row);
  });
  selectedFormQuestions.appendChild(table);
  selectedFormQuestions.classList.remove("hidden");
});

/*****************************************************
  CREATE TAB
******************************************************/
const addQuestionBtn     = document.querySelector(".add-question-btn");
const questionsContainer = document.getElementById("questions-container");
const submitFormBtn      = document.querySelector(".submit-form-btn");

addQuestionBtn.addEventListener("click", () => {
  const questionRow = document.createElement("div");
  questionRow.classList.add("question-row");
  questionRow.innerHTML = `
    <input type="text" placeholder="Enter your question" class="question-input" />
    <select class="question-type">
      <option value="text">Text</option>
      <option value="number">Number</option>
      <option value="rating">Rating</option>
    </select>
    <label class="required-label">
      <input type="checkbox" class="required-checkbox" />
      Required
    </label>
    <button type="button" class="remove-question-btn">
      <i class="fa fa-trash"></i>
    </button>
  `;
  const removeBtn = questionRow.querySelector(".remove-question-btn");
  removeBtn.addEventListener("click", () => {
    questionsContainer.removeChild(questionRow);
  });
  questionsContainer.appendChild(questionRow);
});

submitFormBtn.addEventListener("click", () => {
  const formName = document.getElementById("form-name").value.trim();
  const questionRows = document.querySelectorAll(".question-row");
  if (!formName) {
    alert("Please enter a form name.");
    return;
  }
  if (questionRows.length === 0) {
    alert("Please add at least one question.");
    return;
  }
  let newForm = { formName, questions: [] };
  let anyBlankQuestion = false;
  questionRows.forEach((row) => {
    const questionInput = row.querySelector(".question-input").value.trim();
    const questionType  = row.querySelector(".question-type").value;
    const required      = row.querySelector(".required-checkbox").checked;
    if (!questionInput) {
      anyBlankQuestion = true;
    }
    newForm.questions.push({
      question: questionInput,
      type: questionType,
      required
    });
  });
  if (anyBlankQuestion) {
    alert("One or more questions are blank. Please fill them in.");
    return;
  }
  newForm.questions.sort((a, b) => a.question.localeCompare(b.question));
  createdForms.push(newForm);
  alert("Form submitted! Check Home tab to see it.");
  sendNotification("Form created: " + formName);
  console.log("Form Created:", newForm);
  document.getElementById("form-name").value = "";
  questionsContainer.innerHTML = "";
  renderFormsDropdown();
  showHome();
  setActiveLink(homeLink);
});

/*****************************************************
  RECORDS TAB (Pivot Table)
******************************************************/
const recordsFormsSelect    = document.getElementById("records-forms-select");
const recordsTableContainer = document.getElementById("records-table-container");

const downloadDropdownBtn   = document.getElementById("download-dropdown-btn");
const downloadDropdownContent = document.getElementById("download-dropdown-content");

const downloadExcelBtn = document.getElementById("download-excel");
const downloadCsvBtn   = document.getElementById("download-csv");
const downloadPdfBtn   = document.getElementById("download-pdf");

downloadDropdownBtn.addEventListener("click", () => {
  downloadDropdownContent.classList.toggle("hidden");
});

function renderRecordsDropdown() {
  recordsFormsSelect.innerHTML = `<option value="">Select a form</option>`;
  createdForms.forEach((form, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = form.formName;
    recordsFormsSelect.appendChild(option);
  });
  recordsTableContainer.innerHTML = "";
}

recordsFormsSelect.addEventListener("change", () => {
  const selectedIndex = recordsFormsSelect.value;
  recordsTableContainer.innerHTML = "";
  if (selectedIndex === "") return;
  const form = createdForms[selectedIndex];
  const formName = form.formName;
  const relevantResponses = allResponses.filter(r => r.formName === formName);
  if (relevantResponses.length === 0) {
    recordsTableContainer.innerHTML = "<p>No responses yet.</p>";
    return;
  }
  let tableHTML = `<table class="records-table"><thead><tr>`;
  tableHTML += `<th>Response #</th>`;
  form.questions.forEach(q => {
    tableHTML += `<th>${q.question}</th>`;
  });
  tableHTML += `</tr></thead><tbody>`;
  relevantResponses.forEach((resp, respIndex) => {
    tableHTML += `<tr>`;
    tableHTML += `<td>${respIndex + 1}</td>`;
    form.questions.forEach(q => {
      let foundAnswer = resp.answers.find(a => a.question === q.question);
      let ans = foundAnswer ? foundAnswer.response : "";
      tableHTML += `<td>${ans}</td>`;
    });
    tableHTML += `</tr>`;
  });
  tableHTML += `</tbody></table>`;
  recordsTableContainer.innerHTML = tableHTML;
});

downloadExcelBtn.addEventListener("click", (e) => {
  e.preventDefault();
  downloadDropdownContent.classList.add("hidden");
  downloadExcel();
});
downloadCsvBtn.addEventListener("click", (e) => {
  e.preventDefault();
  downloadDropdownContent.classList.add("hidden");
  downloadCSV();
});
downloadPdfBtn.addEventListener("click", (e) => {
  e.preventDefault();
  downloadDropdownContent.classList.add("hidden");
  downloadPDF();
});

function downloadCSV() {
  const table = document.querySelector(".records-table");
  if (!table) return;
  let csv = [];
  const rows = table.querySelectorAll("tr");
  rows.forEach(row => {
    let rowData = [];
    row.querySelectorAll("th, td").forEach(cell => {
      rowData.push(cell.innerText);
    });
    csv.push(rowData.join(","));
  });
  const csvString = csv.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "responses.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function downloadExcel() {
  const table = document.querySelector(".records-table");
  if (!table) return;
  let csv = [];
  const rows = table.querySelectorAll("tr");
  rows.forEach(row => {
    let rowData = [];
    row.querySelectorAll("th, td").forEach(cell => {
      rowData.push(cell.innerText);
    });
    csv.push(rowData.join("\t"));
  });
  const csvString = csv.join("\n");
  const blob = new Blob([csvString], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "responses.xls";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function downloadPDF() {
  const table = document.querySelector(".records-table");
  if (!table) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.autoTable({ html: ".records-table" });
  doc.save("responses.pdf");
}

/*****************************************************
  TEST TAB
******************************************************/
const testFormsSelect = document.getElementById("test-forms-select");
const chatContainer   = document.getElementById("chat-container");

function renderTestFormsDropdown() {
  testFormsSelect.innerHTML = `<option value="">Select a form</option>`;
  createdForms.forEach((form, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = form.formName;
    testFormsSelect.appendChild(option);
  });
  chatContainer.classList.add("hidden");
  chatContainer.innerHTML = "";
}

testFormsSelect.addEventListener("change", () => {
  const selectedIndex = testFormsSelect.value;
  chatContainer.classList.remove("hidden");
  chatContainer.innerHTML = "";
  if (selectedIndex === "") return;
  const form = createdForms[selectedIndex];
  askQuestions(form.questions, 0, [], form.formName);
});

function addChatBubble(type, text) {
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble");
  bubble.classList.add(type === "system" ? "system-message" : "user-message");
  bubble.textContent = text;
  chatContainer.appendChild(bubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function startRecognition(callback) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Your browser does not support speech recognition. Please try Chrome.");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    callback(transcript);
  };
  recognition.onerror = (e) => {
    console.error("Speech recognition error", e);
    callback("Error capturing response");
  };
  recognition.start();
}

function askQuestions(questions, index, responses, formName) {
  if (index >= questions.length) {
    const thankYouMessage = "Thank you for your responses.";
    addChatBubble("system", thankYouMessage);
    const utterance = new SpeechSynthesisUtterance(thankYouMessage);
    utterance.onend = () => {
      saveTestResponse(formName, responses);
      sendNotification("Response received for form: " + formName);
    };
    synth.speak(utterance);
    return;
  }
  const questionText = questions[index].question;
  addChatBubble("system", questionText);
  const utterance = new SpeechSynthesisUtterance(questionText);
  utterance.onend = () => {
    startRecognition((transcript) => {
      // If the question is required and no response is provided, show an error message.
      if (questions[index].required && transcript.trim() === "") {
        addChatBubble("system", "This response is required. Please provide your answer.");
        askQuestions(questions, index, responses, formName);
        return;
      }
      // If the question type is "number", validate that the response is numeric.
      if (questions[index].type === "number") {
        const num = parseFloat(transcript);
        if (isNaN(num)) {
          addChatBubble("system", "Please provide a numeric response.");
          askQuestions(questions, index, responses, formName);
          return;
        } else {
          transcript = num.toString();
        }
      }
      addChatBubble("user", transcript);
      responses.push({ question: questionText, response: transcript });
      askQuestions(questions, index + 1, responses, formName);
    });
  };
  synth.speak(utterance);
}

function saveTestResponse(formName, responses) {
  const newRecord = { formName, answers: responses };
  allResponses.push(newRecord);
  console.log("Test Response Saved:", newRecord);
}

/*****************************************************
  INIT
******************************************************/
showHome();
renderFormsDropdown();
renderTestFormsDropdown();

/*****************************************************
  NEW: SHARE FEEDBACK POPUP LOGIC
******************************************************/
const shareFeedbackBtn      = document.getElementById("share-feedback-btn");
const feedbackOverlay       = document.getElementById("feedback-overlay");
const feedbackPopup         = document.getElementById("feedback-popup");

const feedbackSentOverlay   = document.getElementById("feedback-sent-overlay");
const feedbackSentPopup     = document.getElementById("feedback-sent-popup");
const feedbackSentOkBtn     = document.getElementById("feedback-sent-ok-btn");

const popupName    = document.getElementById("popup-name");
const popupEmail   = document.getElementById("popup-email");
const popupPhone   = document.getElementById("popup-phone");
const popupMessage = document.getElementById("popup-message");

const popupCancelBtn = document.getElementById("popup-cancel-btn");
const popupSendBtn   = document.getElementById("popup-send-btn");

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function clearFeedbackPopupFields() {
  popupName.value    = "";
  popupEmail.value   = "";
  popupPhone.value   = "";
  popupMessage.value = `Hi {name}

Thank you for choosing our product please click on the link below to share your feedback.

Regards,
`;
}

shareFeedbackBtn.addEventListener("click", () => {
  feedbackOverlay.classList.remove("hidden");
  feedbackPopup.classList.remove("hidden");
});

popupCancelBtn.addEventListener("click", () => {
  feedbackOverlay.classList.add("hidden");
  feedbackPopup.classList.add("hidden");
  clearFeedbackPopupFields();
});

popupSendBtn.addEventListener("click", () => {
  const emailVal = popupEmail.value.trim();
  const phoneVal = popupPhone.value.trim();
  
  // Either email or phone number is required
  if (!emailVal && !phoneVal) {
    alert("Please enter either your email or your phone number.");
    return;
  }
  
  // If email is provided, validate it
  if (emailVal && !isValidEmail(emailVal)) {
    alert("Please provide a valid email address.");
    return;
  }
  
  let nameVal = popupName.value.trim();
  if (!nameVal) {
    nameVal = "Customer";
  }
  let finalMessage = popupMessage.value.replace("{name}", nameVal);
  console.log("Feedback data:", {
    name: nameVal,
    email: emailVal,
    phone: phoneVal,
    message: finalMessage
  });
  feedbackOverlay.classList.add("hidden");
  feedbackPopup.classList.add("hidden");
  feedbackSentOverlay.classList.remove("hidden");
  feedbackSentPopup.classList.remove("hidden");
  clearFeedbackPopupFields();
});

feedbackSentOkBtn.addEventListener("click", () => {
  feedbackSentOverlay.classList.add("hidden");
  feedbackSentPopup.classList.add("hidden");
});

/*****************************************************
  NEW: DELETE TAB LOGIC
******************************************************/
const deleteFormsSelect    = document.getElementById("delete-forms-select");
const deleteTableContainer = document.getElementById("delete-table-container");
const deleteFormBtn        = document.getElementById("delete-form-btn");

function renderDeleteDropdown() {
  deleteFormsSelect.innerHTML = `<option value="">Select a form</option>`;
  createdForms.forEach((form, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = form.formName;
    deleteFormsSelect.appendChild(option);
  });
  deleteTableContainer.innerHTML = "";
}

deleteFormsSelect.addEventListener("change", () => {
  const selectedIndex = deleteFormsSelect.value;
  deleteTableContainer.innerHTML = "";
  if (selectedIndex === "") return;
  const form = createdForms[selectedIndex];
  const formName = form.formName;
  const relevantResponses = allResponses.filter(r => r.formName === formName);
  let tableHTML = `<table class="records-table"><thead><tr>`;
  tableHTML += `<th>Response #</th>`;
  form.questions.forEach(q => {
    tableHTML += `<th>${q.question}</th>`;
  });
  tableHTML += `</tr></thead><tbody>`;
  if (relevantResponses.length === 0) {
    tableHTML += `<tr><td colspan="${form.questions.length + 1}">No responses yet.</td></tr>`;
  } else {
    relevantResponses.forEach((resp, respIndex) => {
      tableHTML += `<tr>`;
      tableHTML += `<td>${respIndex + 1}</td>`;
      form.questions.forEach(q => {
        let foundAnswer = resp.answers.find(a => a.question === q.question);
        let ans = foundAnswer ? foundAnswer.response : "";
        tableHTML += `<td>${ans}</td>`;
      });
      tableHTML += `</tr>`;
    });
  }
  tableHTML += `</tbody></table>`;
  deleteTableContainer.innerHTML = tableHTML;
});

deleteFormBtn.addEventListener("click", () => {
  const selectedIndex = deleteFormsSelect.value;
  if (selectedIndex === "") {
    alert("Please select a form to delete.");
    return;
  }
  const formToDelete = createdForms[selectedIndex];
  const confirmMsg = `Are you sure you want to delete the form "${formToDelete.formName}" and all its responses?`;
  if (!confirm(confirmMsg)) return;
  createdForms.splice(selectedIndex, 1);
  allResponses = allResponses.filter(r => r.formName !== formToDelete.formName);
  alert(`Form "${formToDelete.formName}" has been deleted successfully.`);
  sendNotification("Form deleted: " + formToDelete.formName);
  renderDeleteDropdown();
  renderFormsDropdown(); // Update the "Your Feedback Forms" dropdown
});

/*****************************************************
  intl-tel-input Initialization for Feedback Popup
******************************************************/
document.addEventListener("DOMContentLoaded", function() {
  var popupPhoneInput = document.querySelector("#popup-phone");
  var itiPopup = window.intlTelInput(popupPhoneInput, {
    initialCountry: "us",
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
  });
  window.itiPopup = itiPopup;
});

/*****************************************************
  NEW: Additional INIT Code
******************************************************/
// (Any additional initialization if needed)
