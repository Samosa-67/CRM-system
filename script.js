// CRM System With Analytics Dashboard + Customer Tiers + Monthly Revenue Tracking

const customerIdInput = document.getElementById("customerId");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const purchaseItemInput = document.getElementById("purchaseItem");
const purchaseAmountInput = document.getElementById("purchaseAmount");
const loyaltyPointsInput = document.getElementById("loyaltyPoints");

const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const searchInput = document.getElementById("searchInput");

const customerList = document.getElementById("customerList");

const totalCustomers = document.getElementById("totalCustomers");
const totalPurchases = document.getElementById("totalPurchases");
const totalLoyalty = document.getElementById("totalLoyalty");

const monthlyRevenue = document.getElementById("monthlyRevenue");
const topCustomer = document.getElementById("topCustomer");

const revenueChartCanvas = document.getElementById("revenueChart");
const customerChartCanvas = document.getElementById("customerChart");
const tierChartCanvas = document.getElementById("tierChart");
const monthlyRevenueChartCanvas = document.getElementById("monthlyRevenueChart");

let customers = JSON.parse(localStorage.getItem("crmCustomers")) || [];

let revenueChart;
let customerChart;
let tierChart;
let monthlyRevenueChart;

function saveToStorage() {
  localStorage.setItem("crmCustomers", JSON.stringify(customers));
}

function createId() {
  return Date.now().toString();
}

// CUSTOMER TIER SYSTEM
function getCustomerTier(totalSpent) {

  if (totalSpent >= 4000) {
    return "VIP";
  }

  if (totalSpent >= 2000) {
    return "Gold";
  }

  if (totalSpent >= 1000) {
    return "Silver";
  }

  return "Bronze";
}

function clearForm() {
  customerIdInput.value = "";
  nameInput.value = "";
  emailInput.value = "";
  phoneInput.value = "";
  purchaseItemInput.value = "";
  purchaseAmountInput.value = "";
  loyaltyPointsInput.value = "";

  saveBtn.textContent = "Save Customer";
}

function validateForm() {

  if (!nameInput.value.trim()) {
    alert("Please enter customer name.");
    return false;
  }

  if (!emailInput.value.trim()) {
    alert("Please enter customer email.");
    return false;
  }

  if (!phoneInput.value.trim()) {
    alert("Please enter customer phone number.");
    return false;
  }

  return true;
}

function saveCustomer() {

  if (!validateForm()) return;

  const id = customerIdInput.value;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const phone = phoneInput.value.trim();

  const purchase = {
    item: purchaseItemInput.value.trim() || "No purchase recorded",
    amount: Number(purchaseAmountInput.value) || 0,
    loyaltyPoints: Number(loyaltyPointsInput.value) || 0,
    date: new Date().toISOString()
  };

  // FIND EXISTING CUSTOMER
  let existingCustomer = customers.find(customer =>
      customer.email === email || customer.phone === phone
  );

  // UPDATE CUSTOMER
  if (id) {

    const customerIndex = customers.findIndex(customer => customer.id === id);

    if (customerIndex >= 0) {

      customers[customerIndex].name = name;
      customers[customerIndex].email = email;
      customers[customerIndex].phone = phone;

      if (purchase.amount > 0 || purchase.item !== "No purchase recorded") {
        customers[customerIndex].purchases.push(purchase);
      }
    }
  }

  // ADD PURCHASE TO EXISTING CUSTOMER
  else if (existingCustomer) {

    existingCustomer.name = name;

    if (purchase.amount > 0 || purchase.item !== "No purchase recorded") {
      existingCustomer.purchases.push(purchase);
    }
  }

  // CREATE NEW CUSTOMER
  else {

    const newCustomer = {
      id: createId(),
      name,
      email,
      phone,
      purchases: []
    };

    if (purchase.amount > 0 || purchase.item !== "No purchase recorded") {
      newCustomer.purchases.push(purchase);
    }

    customers.push(newCustomer);
  }

  saveToStorage();
  clearForm();
  renderCustomers();
}

function editCustomer(id) {

  const customer = customers.find(customer => customer.id === id);

  if (!customer) return;

  customerIdInput.value = customer.id;
  nameInput.value = customer.name;
  emailInput.value = customer.email;
  phoneInput.value = customer.phone;

  purchaseItemInput.value = "";
  purchaseAmountInput.value = "";
  loyaltyPointsInput.value = "";

  saveBtn.textContent = "Update Customer";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function deleteCustomer(id) {

  const confirmDelete = confirm(
      "Are you sure you want to delete this customer?"
  );

  if (!confirmDelete) return;

  customers = customers.filter(customer => customer.id !== id);

  saveToStorage();
  renderCustomers();
}

// DASHBOARD + MONTHLY REVENUE TRACKING
function updateDashboard() {

  totalCustomers.textContent = customers.length;

  let purchaseTotal = 0;
  let loyaltyTotal = 0;
  let currentMonthRevenue = 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let highestSpender = {
    name: "None",
    amount: 0
  };

  customers.forEach(customer => {

    let customerTotal = 0;

    customer.purchases.forEach(purchase => {

      purchaseTotal += purchase.amount;
      loyaltyTotal += purchase.loyaltyPoints;

      customerTotal += purchase.amount;

      const purchaseDate = new Date(purchase.date);

      if (
          purchaseDate.getMonth() === currentMonth &&
          purchaseDate.getFullYear() === currentYear
      ) {
        currentMonthRevenue += purchase.amount;
      }
    });

    if (customerTotal > highestSpender.amount) {
      highestSpender.name = customer.name;
      highestSpender.amount = customerTotal;
    }
  });

  totalPurchases.textContent = `€${purchaseTotal}`;
  totalLoyalty.textContent = loyaltyTotal;

  if (monthlyRevenue) {
    monthlyRevenue.textContent = `€${currentMonthRevenue}`;
  }

  if (topCustomer) {
    topCustomer.textContent = highestSpender.name;
  }

  renderCharts();
}

// ANALYTICS CHARTS
function renderCharts() {

  renderRevenueChart();
  renderCustomerChart();
  renderTierChart();
  renderMonthlyRevenueChart();
}

// BAR CHART
function renderRevenueChart() {

  if (!revenueChartCanvas) return;

  const labels = [];
  const data = [];

  customers.forEach(customer => {

    const totalSpent = customer.purchases.reduce((sum, purchase) => {
      return sum + purchase.amount;
    }, 0);

    labels.push(customer.name);
    data.push(totalSpent);
  });

  if (revenueChart) {
    revenueChart.destroy();
  }

  revenueChart = new Chart(revenueChartCanvas, {
    type: "bar",

    data: {
      labels,

      datasets: [{
        label: "Customer Spending (€)",
        data,

        backgroundColor: "rgba(37, 99, 235, 0.7)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 1,
        borderRadius: 6
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// PIE CHART
function renderCustomerChart() {

  if (!customerChartCanvas) return;

  const sortedCustomers = [...customers]
      .map(customer => {

        const totalSpent = customer.purchases.reduce((sum, purchase) => {
          return sum + purchase.amount;
        }, 0);

        return {
          name: customer.name,
          totalSpent
        };
      })

      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

  const labels = sortedCustomers.map(customer => customer.name);
  const data = sortedCustomers.map(customer => customer.totalSpent);

  if (customerChart) {
    customerChart.destroy();
  }

  customerChart = new Chart(customerChartCanvas, {

    type: "pie",

    data: {
      labels,

      datasets: [{
        data,

        backgroundColor: [
          "#2563eb",
          "#16a34a",
          "#f59e0b",
          "#dc2626",
          "#7c3aed"
        ]
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// DOUGHNUT CHART
function renderTierChart() {

  if (!tierChartCanvas) return;

  const tiers = {
    Bronze: 0,
    Silver: 0,
    Gold: 0,
    VIP: 0
  };

  customers.forEach(customer => {

    const totalSpent = customer.purchases.reduce((sum, purchase) => {
      return sum + purchase.amount;
    }, 0);

    const tier = getCustomerTier(totalSpent);

    tiers[tier]++;
  });

  if (tierChart) {
    tierChart.destroy();
  }

  tierChart = new Chart(tierChartCanvas, {

    type: "doughnut",

    data: {
      labels: Object.keys(tiers),

      datasets: [{
        data: Object.values(tiers),

        backgroundColor: [
          "#d6a46b",
          "#94a3b8",
          "#facc15",
          "#7c3aed"
        ]
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// LINE CHART
function renderMonthlyRevenueChart() {

  if (!monthlyRevenueChartCanvas) return;

  const monthlyData = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0
  };

  customers.forEach(customer => {

    customer.purchases.forEach(purchase => {

      const purchaseDate = new Date(purchase.date);

      const month = purchaseDate.toLocaleString("default", {
        month: "short"
      });

      monthlyData[month] += purchase.amount;
    });
  });

  if (monthlyRevenueChart) {
    monthlyRevenueChart.destroy();
  }

  monthlyRevenueChart = new Chart(monthlyRevenueChartCanvas, {

    type: "line",

    data: {
      labels: Object.keys(monthlyData),

      datasets: [{
        label: "Monthly Revenue (€)",
        data: Object.values(monthlyData),

        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.4,
        fill: true
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function createPurchaseHistory(purchases) {

  if (purchases.length === 0) {
    return "<p>No purchases yet.</p>";
  }

  return purchases.map((purchase, index) => {

    return `
      <div class="purchase-history-card">

        <p><strong>Purchase ${index + 1}</strong></p>

        <p>Item: ${purchase.item}</p>

        <p>Amount: €${purchase.amount}</p>

        <p>Loyalty Points: ${purchase.loyaltyPoints}</p>

        <p>Date: ${new Date(purchase.date).toLocaleString()}</p>

      </div>
    `;
  }).join("");
}

function createCustomerCard(customer) {

  const card = document.createElement("div");

  card.classList.add("customer-card");

  const totalSpent = customer.purchases.reduce((sum, purchase) => {
    return sum + purchase.amount;
  }, 0);

  const totalPoints = customer.purchases.reduce((sum, purchase) => {
    return sum + purchase.loyaltyPoints;
  }, 0);

  const customerTier = getCustomerTier(totalSpent);

  card.innerHTML = `
    <h3>${customer.name}</h3>

    <div class="customer-info">

      <p><strong>Email:</strong> ${customer.email}</p>

      <p><strong>Phone:</strong> ${customer.phone}</p>

      <p><strong>Total Purchases:</strong> €${totalSpent}</p>

      <p><strong>Total Orders:</strong> ${customer.purchases.length}</p>

    </div>

    <div class="badge-container">

      <span class="badge">
        Loyalty Points: ${totalPoints}
      </span>

      <span class="tier-badge ${customerTier.toLowerCase()}">
        ${customerTier} Customer
      </span>

    </div>

    <h4 style="margin-top:15px;">Purchase History</h4>

    ${createPurchaseHistory(customer.purchases)}

    <div class="actions">

      <button
        class="edit-btn"
        onclick="editCustomer('${customer.id}')"
      >
        Edit
      </button>

      <button
        class="delete-btn"
        onclick="deleteCustomer('${customer.id}')"
      >
        Delete
      </button>

    </div>
  `;

  return card;
}

function renderCustomers() {

  customerList.innerHTML = "";

  const searchText = searchInput.value.toLowerCase();

  const filteredCustomers = customers.filter(customer => {

    return (
        customer.name.toLowerCase().includes(searchText) ||
        customer.email.toLowerCase().includes(searchText) ||
        customer.phone.toLowerCase().includes(searchText)
    );
  });

  if (filteredCustomers.length === 0) {

    customerList.innerHTML = `
      <div class="empty-message">
        No customer records found.
      </div>
    `;
  }

  else {

    filteredCustomers.forEach(customer => {
      customerList.appendChild(createCustomerCard(customer));
    });
  }

  updateDashboard();
}

saveBtn.addEventListener("click", saveCustomer);
clearBtn.addEventListener("click", clearForm);
searchInput.addEventListener("input", renderCustomers);

renderCustomers();
