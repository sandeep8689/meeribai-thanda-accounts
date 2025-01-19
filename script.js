// Global variables to track serial number and total amount
let serialNo = 1;
let totalAmount = 0;
let customerCount = 0; // To keep track of total members

// Function to display current time
function updateTime() {
    const timeElement = document.getElementById("current-time");
    const currentTime = new Date();
    timeElement.textContent = currentTime.toLocaleString();
}

// Function to update serial number and total amount
function updateSummary() {
    const totalMembersElement = document.getElementById("total-members");
    const totalAmountElement = document.getElementById("total-amount");

    totalMembersElement.textContent = `Total Members: ${customerCount}`;
    totalAmountElement.textContent = `Total Amount: $${totalAmount.toFixed(2)}`;
}

// Toggle visibility of interest fields
document.getElementById("interest-calculator-checkbox").addEventListener('change', function() {
    const interestFields = document.getElementById("interest-fields");
    interestFields.style.display = this.checked ? "block" : "none";
});

// Function to calculate interest based on the date range
function calculateInterest(principal, rate, startDate, endDate) {
    const timeDiff = new Date(endDate) - new Date(startDate); // Time difference in milliseconds
    const timeInYears = timeDiff / (1000 * 3600 * 24 * 365); // Convert to years

    if (timeInYears > 0) {
        return (principal * rate * timeInYears) / 100; // Simple interest formula
    } else {
        alert("The end date must be later than the start date.");
        return 0;
    }
}

// Function to add customer to the list
function addCustomer(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const fatherName = document.getElementById('father-name').value;
    const phone = document.getElementById('phone').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const otherDetails = document.getElementById('other-options').value; // Other details input

    let interestAmount = 0;

    // If interest calculation is enabled
    if (document.getElementById('interest-calculator-checkbox').checked) {
        const principal = parseFloat(document.getElementById('principal').value);
        const rate = parseFloat(document.getElementById('rate').value);
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (principal && rate && startDate && endDate) {
            interestAmount = calculateInterest(principal, rate, startDate, endDate);
        }
    }

    if (name && fatherName && phone && amount && date) {
        const customerList = document.getElementById('customer-list');

        // Create a new list item
        const customerItem = document.createElement('li');
        customerItem.classList.add('customer-item');

        // Store customer details in a data attribute for easy access later
        customerItem.setAttribute('data-serial-no', serialNo);
        customerItem.setAttribute('data-name', name);
        customerItem.setAttribute('data-father-name', fatherName);
        customerItem.setAttribute('data-phone', phone);
        customerItem.setAttribute('data-amount', amount);
        customerItem.setAttribute('data-interest', interestAmount);
        customerItem.setAttribute('data-date', date);
        customerItem.setAttribute('data-other-details', otherDetails); // Storing other details

        customerItem.innerHTML = `
            <strong>${serialNo}. ${name}</strong><br>
            Father's Name: ${fatherName}<br>
            Phone: ${phone}<br>
            Amount: $${amount.toFixed(2)}<br>
            Interest: $${interestAmount.toFixed(2)}<br>
            Date: ${date}<br>
            Other Details: ${otherDetails ? otherDetails : 'N/A'}<br>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        `;

        // Attach event listeners to the Edit and Delete buttons
        const editButton = customerItem.querySelector('.edit-btn');
        const deleteButton = customerItem.querySelector('.delete-btn');

        // Edit functionality
        editButton.addEventListener('click', function() {
            document.getElementById('name').value = name;
            document.getElementById('father-name').value = fatherName;
            document.getElementById('phone').value = phone;
            document.getElementById('amount').value = amount;
            document.getElementById('date').value = date;
            document.getElementById('other-options').value = otherDetails;

            // Remove the customer item from the list
            customerItem.remove();

            // Update the total amount after edit
            totalAmount -= amount + interestAmount;
            customerCount--;
            updateSummary();
        });

        // Delete functionality
        deleteButton.addEventListener('click', function() {
            customerItem.remove();
            totalAmount -= amount + interestAmount;
            customerCount--;
            updateSummary();
        });

        // Append the new customer item to the list
        customerList.appendChild(customerItem);

        // Update total amount and serial number
        totalAmount += amount + interestAmount;
        customerCount++;
        serialNo++;

        // Update the summary
        updateSummary();

        // Clear form inputs after submission
        document.getElementById('customer-form').reset();
        document.getElementById('interest-fields').style.display = "none"; // Hide interest fields again
    } else {
        alert("Please fill out all required fields.");
    }
}

// Function to generate PDF
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add a custom title for the PDF (changed to "MEERIBAI THANDA ACCOUNTS")
    doc.setFontSize(18);
    doc.text("MEERIBAI THANDA ACCOUNTS", 20, 20);

    // Add total members and total amount at the top
    doc.setFontSize(12);
    doc.text(`Total Members: ${customerCount}`, 20, 40);
    doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 100, 40);

    // Get all customer details
    const customerList = document.getElementById('customer-list');
    const customers = customerList.getElementsByTagName('li');

    let yPosition = 50;

    Array.from(customers).forEach(customer => {
        // Extract customer details from the data attributes
        const serial = customer.getAttribute('data-serial-no');
        const name = customer.getAttribute('data-name');
        const fatherName = customer.getAttribute('data-father-name');
        const phone = customer.getAttribute('data-phone');
        const amount = customer.getAttribute('data-amount');
        const interest = customer.getAttribute('data-interest');
        const date = customer.getAttribute('data-date');
        const otherDetails = customer.getAttribute('data-other-details');

        // Add the customer data to the PDF
        doc.setFontSize(12);
        doc.text(`Serial No: ${serial}`, 20, yPosition);
        doc.text(`Name: ${name}`, 60, yPosition);
        doc.text(`Father's Name: ${fatherName}`, 60, yPosition + 10);
        doc.text(`Phone: ${phone}`, 60, yPosition + 20);
        doc.text(`Amount: $${amount}`, 60, yPosition + 30);
        doc.text(`Interest: $${interest}`, 60, yPosition + 40);
        doc.text(`Date: ${date}`, 60, yPosition + 50);
        doc.text(`Other Details: ${otherDetails ? otherDetails : 'N/A'}`, 60, yPosition + 60);

        // Increase yPosition for next customer
        yPosition += 70;
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20; // Reset position on new page
        }
    });

    doc.save("meeribai_thanda_accounts.pdf");
}

// Add event listener for form submission
document.getElementById("customer-form").addEventListener('submit', addCustomer);

// Add event listener for PDF generation
document.getElementById("generate-pdf-btn").addEventListener('click', generatePDF);

// Update time every second
setInterval(updateTime, 1000);
