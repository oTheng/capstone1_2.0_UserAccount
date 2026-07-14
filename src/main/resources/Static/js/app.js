// =======================================
// API
// =======================================

const API_URL = "http://localhost:8080/api/transactions";

// =======================================
// ELEMENTS
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

// Used for Edit
let editingId = null;

// Stores all transactions
let transactions = [];

// =======================================
// LOAD TRANSACTIONS
// =======================================

async function loadTransactions() {

    try {

        const response = await fetch(API_URL);

        transactions = await response.json();

        renderTable(transactions);

        updateDashboard(transactions);

    } catch (error) {

        alert("Unable to connect to the Accounting API.");

        console.error(error);

    }

}



document.getElementById("transactionsMenu").onclick=()=>{

    showPage(dashboardPage);

};

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

document.getElementById("dashboardMenu").onclick=()=>{

    showPage(dashboardPage);

};

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

            <td>${transaction.description}</td>

            <td>${transaction.vendor}</td>

            <td>$${Number(transaction.amount).toFixed(2)}</td>

            <td>${transaction.transactionType}</td>

            <td>

                <button
                    class="editBtn"
                    onclick="editTransaction(${transaction.id})">

                    Edit

                </button>

                <button
                    class="deleteBtn"
                    onclick="deleteTransaction(${transaction.id})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

function buildReports(){

    let deposits=0;
    let payments=0;

    transactions.forEach(t=>{

        if(t.amount>=0)
            deposits+=Number(t.amount);
        else
            payments+=Number(t.amount);

    });

    document.getElementById("reportContent").innerHTML=`

        <div class="card">

            <h2>Total Deposits</h2>

            <h1>$${deposits.toFixed(2)}</h1>

        </div>

        <div class="card">

            <h2>Total Payments</h2>

            <h1>$${Math.abs(payments).toFixed(2)}</h1>

        </div>

        <div class="card">

            <h2>Balance</h2>

            <h1>$${(deposits+payments).toFixed(2)}</h1>

        </div>

    `;

}

document.getElementById("reportsMenu").onclick=()=>{

    buildReports();

    showPage(reportsPage);

};

function loadVendors(){

    let vendors=[...new Set(transactions.map(t=>t.vendor))];

    let html="<ul>";

    vendors.forEach(v=>{

        html+=`<li>${v}</li>`;

    });

    html+="</ul>";

    document.getElementById("vendorContent").innerHTML=html;

}

document.getElementById("vendorsMenu").onclick=()=>{

    loadVendors();

    showPage(vendorsPage);

};

document.getElementById("settingsMenu").onclick=()=>{

    showPage(settingsPage);

};

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

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(transaction)

    });

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

refreshBtn.addEventListener("click", loadTransactions);

// =======================================
// DELETE TRANSACTION
// =======================================

async function deleteTransaction(id) {

    if (!confirm("Delete this transaction?")) {

        return;

    }

    const response = await fetch(API_URL + "/" + id, {

        method: "DELETE"

    });

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

const dashboardPage = document.getElementById("dashboardPage");
const reportsPage = document.getElementById("reportsPage");
const vendorsPage = document.getElementById("vendorsPage");
const settingsPage = document.getElementById("settingsPage");

function showPage(page){

    dashboardPage.style.display="none";
    reportsPage.style.display="none";
    vendorsPage.style.display="none";
    settingsPage.style.display="none";

    page.style.display="block";

}

// =======================================
// START APPLICATION
// =======================================

loadTransactions();