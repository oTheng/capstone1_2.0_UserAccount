// =======================================
// API
// =======================================

const USER_API = "http://localhost:8080/api/users";
const API_URL = "http://localhost:8080/api/transactions";

let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let editingId = null;
let transactions = [];

// =======================================
// AUTH TOKEN HELPERS
// =======================================

// Save the user + token returned by login/register
function saveSession(data) {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("loggedInUser", JSON.stringify(data));
    loggedInUser = data;
}

// Attach the token to a request's headers
function authHeaders(extra = {}) {
    const token = localStorage.getItem("authToken");
    if (token) {
        extra["Authorization"] = "Bearer " + token;
    }
    return extra;
}

// Escape user-entered text before putting it into HTML
function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

// Token missing/expired — clear everything and show the login screen.
// Also wipes the rendered data so the next user on this browser
// never sees the previous user's ledger.
function forceLogout(message) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("loggedInUser");
    loggedInUser = null;
    transactions = [];
    renderTable([]);
    updateDashboard([]);
    searchBox.value = "";
    showAuthScreen();
    if (message) {
        authMessage.textContent = message;
    }
}

// =======================================
// LOGIN / PROFILE ELEMENTS
// =======================================

const authContainer = document.getElementById("authContainer");
const appContainer = document.getElementById("appContainer");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");

const profileName = document.getElementById("profileName");
const profileBtn = document.getElementById("profileBtn");
const logoutBtn = document.getElementById("logoutBtn");

const profileModal = document.getElementById("profileModal");
const closeProfileBtn = document.querySelector(".close-profile");
const profileForm = document.getElementById("profileForm");

// =======================================
// TRANSACTION ELEMENTS
// =======================================

const tableBody = document.getElementById("transactionTable");
const balanceCard = document.getElementById("balance");
const depositCard = document.getElementById("deposits");
const paymentCard = document.getElementById("payments");
const transactionCount = document.getElementById("transactionCount");

const refreshBtn = document.getElementById("refreshBtn");
const searchBox = document.getElementById("searchBox");
const depositBtn = document.getElementById("depositBtn");
const paymentBtn = document.getElementById("paymentBtn");

const modal = document.getElementById("transactionModal");
const closeBtn = document.querySelector(".close");
const form = document.getElementById("transactionForm");
const modalTitle = document.getElementById("modalTitle");
const typeSelect = document.getElementById("transactionType");

function showAuthScreen() {
    authContainer.style.display = "block";
    appContainer.style.display = "none";
}

function showAppScreen() {
    authContainer.style.display = "none";
    appContainer.style.display = "flex";
}

// =======================================
// REGISTER
// =======================================

registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const newUser = {
        fullName: document.getElementById("registerFullName").value,
        email: document.getElementById("registerEmail").value,
        password: document.getElementById("registerPassword").value,
        phoneNumber: document.getElementById("registerPhoneNumber").value,
        profileBio: document.getElementById("registerProfileBio").value
    };

    try {

        const response = await fetch(USER_API + "/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newUser)
        });

        if (response.ok) {

            const data = await response.json();

            saveSession(data);

            authMessage.textContent = "";

            registerForm.reset();

            showAppScreen();

            loadProfile();

            loadTransactions();

        } else {

            const errorText = await response.text();

            authMessage.textContent = "Register failed. Email may already exist.";

            console.error(errorText);

        }

    } catch (error) {

        authMessage.textContent = "Unable to connect to server.";

        console.error(error);

    }

});

// =======================================
// LOGIN
// =======================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const loginData = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value
    };

    try {

        const response = await fetch(USER_API + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {

            const data = await response.json();

            saveSession(data);

            authMessage.textContent = "";

            loginForm.reset();

            showAppScreen();

            loadProfile();

            loadTransactions();

        } else {

            authMessage.textContent = "Invalid email or password.";

        }

    } catch (error) {

        authMessage.textContent = "Unable to connect to server.";

        console.error(error);

    }

});
// =======================================
// PROFILE
// =======================================

async function loadProfile() {

    if (!loggedInUser || !loggedInUser.id) {
        return;
    }

    try {

        const response = await fetch(USER_API + "/" + loggedInUser.id + "/profile", {
            headers: authHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            forceLogout("Your session expired. Please log in again.");
            return;
        }

        if (response.ok) {

            const user = await response.json();

            profileName.textContent = user.fullName;

            document.getElementById("profileFullName").value = user.fullName;
            document.getElementById("profileEmail").value = user.email;
            document.getElementById("profilePhoneNumber").value = user.phoneNumber || "";
            document.getElementById("profileBio").value = user.profileBio || "";

        } else {

            console.log("Could not load profile.");

        }

    } catch (error) {

        console.error(error);

    }

}

if (profileBtn) {
    profileBtn.addEventListener("click", () => {
        loadProfile();
        profileModal.style.display = "block";
    });
}

closeProfileBtn.addEventListener("click", () => {

    profileModal.style.display = "none";

});

profileForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!loggedInUser || !loggedInUser.id) {
        alert("You must be logged in.");
        return;
    }

    const updatedProfile = {
        fullName: document.getElementById("profileFullName").value,
        phoneNumber: document.getElementById("profilePhoneNumber").value,
        profileBio: document.getElementById("profileBio").value
    };

    try {

        const response = await fetch(USER_API + "/" + loggedInUser.id + "/profile", {
            method: "PUT",
            headers: authHeaders({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(updatedProfile)
        });

        if (response.status === 401 || response.status === 403) {
            forceLogout("Your session expired. Please log in again.");
            return;
        }

        if (response.ok) {

            const updatedUser = await response.json();

            localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

            loggedInUser = updatedUser;

            profileName.textContent = updatedUser.fullName;

            profileModal.style.display = "none";

            alert("Profile updated.");

        } else {

            alert("Unable to update profile.");

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

    }

});
// =======================================
// LOGOUT
// =======================================

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        forceLogout();
    });
}
// =======================================
// LOAD TRANSACTIONS
// =======================================

async function loadTransactions() {

    try {

        const response = await fetch(API_URL, {
            headers: authHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            forceLogout("Your session expired. Please log in again.");
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error:", errorText);
            alert("Transaction API error: " + response.status);
            return;
        }

        transactions = await response.json();

    } catch (error) {

        console.error("Fetch failed:", error);

        alert("Could not reach the Accounting API. Check Console for details.");

        return;

    }

    try {

        renderTable(transactions);
        updateDashboard(transactions);

    } catch (error) {

        console.error("Display error:", error);
        alert("Transactions loaded, but there is an error displaying them. Check the console.");

    }

}

// =======================================
// UPDATE DASHBOARD
// =======================================

function updateDashboard(data) {

    let deposits = 0;

    let payments = 0;

    let balance = 0;

    data.forEach(transaction => {

        const amount = Number(transaction.amount);

        balance += amount;

        if (amount >= 0)

            deposits += amount;

        else

            payments += amount;

    });

    depositCard.textContent = "$" + deposits.toFixed(2);

    paymentCard.textContent = "$" + Math.abs(payments).toFixed(2);

    balanceCard.textContent = "$" + balance.toFixed(2);

    transactionCount.textContent = data.length;

}

// =======================================
// RENDER TABLE
// =======================================

function renderTable(data) {

    tableBody.innerHTML = "";

    data.forEach(transaction => {

        tableBody.innerHTML += `

        <tr>

            <td>${transaction.id}</td>

            <td>${transaction.transactionDate}</td>

            <td>${transaction.transactionTime}</td>

            <td>${escapeHtml(transaction.description)}</td>

            <td>${escapeHtml(transaction.vendor)}</td>

            <td>$${Number(transaction.amount).toFixed(2)}</td>

            <td>${escapeHtml(transaction.transactionType)}</td>

            <td>

        <button
            type="button"
            class="editBtn"
            onclick="editTransaction(${transaction.id})">
        
            Edit
        
        </button>
        
        <button
            type="button"
            class="deleteBtn"
            onclick="deleteTransaction(${transaction.id})">
        
            Delete
        
        </button>
        

            </td>

        </tr>

        `;

    });

}


// =======================================
// EDIT TRANSACTION
// =======================================

function editTransaction(id) {

    const transaction = transactions.find(t => t.id === id);

    if (!transaction) return;

    editingId = id;

    modalTitle.textContent = "Edit Transaction";

    document.getElementById("description").value = transaction.description;

    document.getElementById("vendor").value = transaction.vendor;

    document.getElementById("amount").value = Math.abs(transaction.amount);

    document.getElementById("transactionType").value = transaction.transactionType;

    modal.style.display = "block";

}


// Open Payment Modal
paymentBtn.addEventListener("click", () => {

    editingId = null;

    form.reset();

    modalTitle.textContent = "Add Payment";

    typeSelect.value = "PAYMENT";

    modal.style.display = "block";

});

// Open Deposit Modal
depositBtn.addEventListener("click", () => {

    editingId = null;

    form.reset();

    modalTitle.textContent = "Add Deposit";

    typeSelect.value = "DEPOSIT";

    modal.style.display = "block";

});

closeBtn.addEventListener("click", () => {

    modal.style.display = "none";

});

window.addEventListener("click", (event) => {

    if (event.target === modal) {

        modal.style.display = "none";

    }

});

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const now = new Date();

    let amount = parseFloat(document.getElementById("amount").value);

    const type = typeSelect.value;

    // Payments are stored as negative amounts
    if (type === "PAYMENT") {

        amount = -Math.abs(amount);

    }

    const transaction = {

        transactionDate: now.toISOString().split("T")[0],

        transactionTime: now.toTimeString().split(" ")[0],

        description: document.getElementById("description").value,

        vendor: document.getElementById("vendor").value,

        amount: amount,

        transactionType: type

    };

    let url = API_URL;

    let method = "POST";

    if (editingId !== null) {

        url = API_URL + "/" + editingId;

        method = "PUT";

    }

    const response = await fetch(url, {

        method: method,

        headers: authHeaders({
            "Content-Type": "application/json"
        }),

        body: JSON.stringify(transaction)

    });

    if (response.status === 401) {
        forceLogout("Your session expired. Please log in again.");
        return;
    }

    if (response.ok) {

        editingId = null;

        modal.style.display = "none";

        form.reset();

        loadTransactions();

    } else {

        alert("Unable to save transaction.");

    }

});

// =======================================
// REFRESH
// =======================================

if (refreshBtn) {
    refreshBtn.addEventListener("click", loadTransactions);
}
// =======================================
// DELETE TRANSACTION
// =======================================

async function deleteTransaction(id) {

    if (!confirm("Delete this transaction?")) {

        return;

    }

    const response = await fetch(API_URL + "/" + id, {

        method: "DELETE",

        headers: authHeaders()

    });

    if (response.status === 401) {
        forceLogout("Your session expired. Please log in again.");
        return;
    }

    if (response.ok) {

        loadTransactions();

    } else {

        alert("Delete failed.");

    }

}

// =======================================
// SEARCH
// =======================================

searchBox.addEventListener("keyup", () => {

    const text = searchBox.value.toLowerCase();

    const filtered = transactions.filter(transaction =>

        transaction.vendor.toLowerCase().includes(text)

        ||

        transaction.description.toLowerCase().includes(text)

    );

    renderTable(filtered);

    updateDashboard(filtered);

});

// =======================================
// START APPLICATION
// =======================================

function startApp() {

    if (loggedInUser && loggedInUser.id && localStorage.getItem("authToken")) {

        showAppScreen();

        loadProfile();

        loadTransactions();

    } else {

        showAuthScreen();

    }

}

startApp();