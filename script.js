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

let customers = JSON.parse(localStorage.getItem("crmCustomers")) || [];

function saveToStorage() {
  localStorage.setItem("crmCustomers", JSON.stringify(customers));
}

function createId() {
  return Date.now().toString();
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
  if (!validateForm()) {
    return;
  }

  const id = customerIdInput.value || createId();

  const customerData = {
    id: id,
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    purchaseItem: purchaseItemInput.value.trim() || "No purchase recorded",
    purchaseAmount: Number(purchaseAmountInput.value) || 0,
    loyaltyPoints: Number(loyaltyPointsInput.value) || 0
  };

  const existingIndex = customers.findIndex(customer => customer.id === id);

  if (existingIndex >= 0) {
    customers[existingIndex] = customerData;
  } else {
    customers.push(customerData);
  }

  saveToStorage();
  clearForm();
  renderCustomers();
}

function editCustomer(id) {
  const customer = customers.find(customer => customer.id === id);

  if (!customer) {
    return;
  }

  customerIdInput.value = customer.id;
  nameInput.value = customer.name;
  emailInput.value = customer.email;
  phoneInput.value = customer.phone;
  purchaseItemInput.value = customer.purchaseItem;
  purchaseAmountInput.value = customer.purchaseAmount;
  loyaltyPointsInput.value = customer.loyaltyPoints;

  saveBtn.textContent = "Update Customer";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteCustomer(id) {
  const confirmDelete = confirm("Are you sure you want to delete this customer?");

  if (!confirmDelete) {
    return;
  }

  customers = customers.filter(customer => customer.id !== id);
  saveToStorage();
  renderCustomers();
}

function updateDashboard(filteredCustomers) {
  totalCustomers.textContent = customers.length;

  const purchaseTotal = customers.reduce((sum, customer) => {
    return sum + customer.purchaseAmount;
  }, 0);

  const loyaltyTotal = customers.reduce((sum, customer) => {
    return sum + customer.loyaltyPoints;
  }, 0);

  totalPurchases.textContent = `€${purchaseTotal}`;
  totalLoyalty.textContent = loyaltyTotal;
}

function createCustomerCard(customer) {
  const card = document.createElement("div");
  card.classList.add("customer-card");

  card.innerHTML = `
    <h3>${customer.name}</h3>

    <div class="customer-info">
      <p><strong>Email:</strong> ${customer.email}</p>
      <p><strong>Phone:</strong> ${customer.phone}</p>
      <p><strong>Purchase:</strong> ${customer.purchaseItem}</p>
      <p><strong>Amount:</strong> €${customer.purchaseAmount}</p>
    </div>

    <span class="badge">Loyalty Points: ${customer.loyaltyPoints}</span>

    <div class="actions">
      <button class="edit-btn" onclick="editCustomer('${customer.id}')">Edit</button>
      <button class="delete-btn" onclick="deleteCustomer('${customer.id}')">Delete</button>
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
  } else {
    filteredCustomers.forEach(customer => {
      customerList.appendChild(createCustomerCard(customer));
    });
  }

  updateDashboard(filteredCustomers);
}

saveBtn.addEventListener("click", saveCustomer);
clearBtn.addEventListener("click", clearForm);
searchInput.addEventListener("input", renderCustomers);

renderCustomers();