let currentBillType = 'pickup-drop';
let currentInvoiceData = null;

document.addEventListener('DOMContentLoaded', function() {
    selectBillType('pickup-drop');
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
});

function selectBillType(type) {
    currentBillType = type;
    
    document.querySelectorAll('.bill-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to the button with the matching bill type
    document.querySelectorAll('.bill-type-btn').forEach(btn => {
        const btnText = btn.textContent.toLowerCase();
        if ((type === 'pickup-drop' && btnText.includes('pickup')) ||
            (type === 'duration' && btnText.includes('time')) ||
            (type === 'distance' && btnText.includes('distance'))) {
            btn.classList.add('active');
        }
    });
    
    updateBillDetailsForm(type);
}

function updateBillDetailsForm(type) {
    const billDetails = document.getElementById('billDetails');
    
    switch(type) {
        case 'pickup-drop':
            billDetails.innerHTML = `
                <div class="help-text">Enter pickup location, drop location, and total amount</div>
                <div class="bill-details-grid">
                    <input type="text" id="pickupLocation" placeholder="From: Airport, Hotel, etc." required>
                    <input type="text" id="dropLocation" placeholder="To: Airport, Hotel, etc." required>
                    <input type="number" id="pickupDropAmount" placeholder="Total Amount (Rs.)" required>
                </div>
            `;
            break;
            
        case 'duration':
            billDetails.innerHTML = `
                <div class="help-text">Auto-calculate hours from start/end times (Optional)</div>
                <div class="bill-details-grid">
                    <input type="datetime-local" id="startDateTime" placeholder="Starting Date & Time" onchange="calculateHours()">
                    <input type="datetime-local" id="endDateTime" placeholder="Ending Date & Time" onchange="calculateHours()">
                </div>
                <div class="help-text">Enter total hours and rate per hour</div>
                <div class="bill-details-grid">
                    <input type="number" id="hours" placeholder="Total Hours (e.g., 8)" required onchange="calculateDistance()">
                    <input type="number" id="hourlyRate" placeholder="Rate per Hour (Rs.)" required>
                    <input type="number" id="distance" placeholder="Auto-calculated distance (10km per hour)">
                </div>
            `;
            break;
            
        case 'distance':
            billDetails.innerHTML = `
                <div class="help-text">Car Odometer Readings (Optional)</div>
                <div class="bill-details-grid">
                    <input type="number" id="startKm" placeholder="Starting KM Reading" step="0.1" onchange="calculateDistanceFromOdometer()">
                    <input type="number" id="endKm" placeholder="Ending KM Reading" step="0.1" onchange="calculateDistanceFromOdometer()">
                </div>
                <div class="help-text">Starting and Ending Addresses (Optional)</div>
                <div class="bill-details-grid">
                    <input type="text" id="startAddress" placeholder="Starting Address">
                    <input type="text" id="endAddress" placeholder="Ending Address">
                </div>
                <div class="help-text">Enter total distance and rate per km</div>
                <div class="bill-details-grid">
                    <input type="number" id="distance" placeholder="Total Distance (km)" required>
                    <input type="number" id="perKmRate" placeholder="Rate per KM (Rs.)" required>
                </div>
            `;
            break;
    }
}

function addExtra() {
    const container = document.getElementById('extrasContainer');
    const extraId = 'extra_' + Date.now();
    
    const extraDiv = document.createElement('div');
    extraDiv.className = 'extra-item';
    extraDiv.id = extraId;
    
    extraDiv.innerHTML = `
        <button type="button" class="remove-extra" onclick="removeExtra('${extraId}')">×</button>
        <h4>Extra Charge</h4>
        <div class="form-row">
            <input type="text" placeholder="Reason (e.g., Parking, Toll)" required>
            <input type="text" placeholder="Description (Optional)">
        </div>
        <input type="number" placeholder="Amount (Rs.)" required>
    `;
    
    container.appendChild(extraDiv);
}

function removeExtra(extraId) {
    document.getElementById(extraId).remove();
}

function calculateHours() {
    const startDateTime = document.getElementById('startDateTime').value;
    const endDateTime = document.getElementById('endDateTime').value;
    
    if (startDateTime && endDateTime) {
        const startTime = new Date(startDateTime);
        const endTime = new Date(endDateTime);
        
        if (endTime > startTime) {
            const diffInMs = endTime - startTime;
            const diffInHours = diffInMs / (1000 * 60 * 60); // Convert milliseconds to hours
            
            document.getElementById('hours').value = diffInHours.toFixed(2);
            calculateDistance(); // Also calculate distance when hours are calculated
        } else {
            if (endTime <= startTime) {
                alert('End time must be after start time');
            }
        }
    }
}

function calculateDistance() {
    const hours = parseFloat(document.getElementById('hours').value);
    
    if (hours && hours > 0) {
        const distance = hours * 10; // 10 km per hour
        document.getElementById('distance').value = distance.toFixed(1);
    }
}

function calculateDistanceFromOdometer() {
    const startKm = parseFloat(document.getElementById('startKm').value);
    const endKm = parseFloat(document.getElementById('endKm').value);
    
    if (startKm && endKm && endKm > startKm) {
        const distance = endKm - startKm;
        document.getElementById('distance').value = distance.toFixed(1);
    } else if (startKm && endKm && endKm <= startKm) {
        alert('Ending KM reading must be greater than starting KM reading');
    }
}

function validateForm() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    const invoiceDate = document.getElementById('invoiceDate').value;
    
    if (!customerName || !customerPhone || !customerAddress || !invoiceDate) {
        alert('Please fill in all customer details including date.');
        return false;
    }
    
    if (currentBillType === 'pickup-drop') {
        const pickup = document.getElementById('pickupLocation').value.trim();
        const drop = document.getElementById('dropLocation').value.trim();
        const amount = document.getElementById('pickupDropAmount').value;
        
        if (!pickup || !drop || !amount) {
            alert('Please fill in all pickup-drop details.');
            return false;
        }
    } else if (currentBillType === 'duration') {
        const hours = document.getElementById('hours').value;
        const hourlyRate = document.getElementById('hourlyRate').value;
        
        if (!hours || !hourlyRate) {
            alert('Please fill in hours and hourly rate.');
            return false;
        }
    } else if (currentBillType === 'distance') {
        const distance = document.getElementById('distance').value;
        const perKmRate = document.getElementById('perKmRate').value;
        
        if (!distance || !perKmRate) {
            alert('Please fill in distance and per km rate.');
            return false;
        }
    }
    
    return true;
}

function collectFormData() {
    const customerData = {
        name: document.getElementById('customerName').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
        address: document.getElementById('customerAddress').value.trim()
    };
    
    const invoiceDate = document.getElementById('invoiceDate').value;
    const formattedDate = new Date(invoiceDate).toLocaleDateString('en-GB');
    
    let billData = {};
    
    if (currentBillType === 'pickup-drop') {
        billData = {
            pickup: document.getElementById('pickupLocation').value.trim(),
            drop: document.getElementById('dropLocation').value.trim(),
            amount: parseFloat(document.getElementById('pickupDropAmount').value)
        };
    } else if (currentBillType === 'duration') {
        const hours = parseFloat(document.getElementById('hours').value);
        const hourlyRate = parseFloat(document.getElementById('hourlyRate').value);
        const distance = document.getElementById('distance').value;
        const startDateTime = document.getElementById('startDateTime').value;
        const endDateTime = document.getElementById('endDateTime').value;
        
        billData = {
            hours: hours,
            hourlyRate: hourlyRate,
            distance: distance ? parseFloat(distance) : null,
            startDateTime: startDateTime,
            endDateTime: endDateTime
        };
    } else if (currentBillType === 'distance') {
        const startKm = document.getElementById('startKm').value;
        const endKm = document.getElementById('endKm').value;
        const calculatedDistance = (startKm && endKm) ? (parseFloat(endKm) - parseFloat(startKm)) : null;
        
        billData = {
            distance: parseFloat(document.getElementById('distance').value),
            perKmRate: parseFloat(document.getElementById('perKmRate').value),
            startKm: startKm ? parseFloat(startKm) : null,
            endKm: endKm ? parseFloat(endKm) : null,
            calculatedDistance: calculatedDistance,
            startAddress: document.getElementById('startAddress').value.trim(),
            endAddress: document.getElementById('endAddress').value.trim()
        };
    }
    
    const extras = [];
    document.querySelectorAll('.extra-item').forEach(item => {
        const inputs = item.querySelectorAll('input');
        const reason = inputs[0].value.trim();
        const description = inputs[1].value.trim();
        const amount = parseFloat(inputs[2].value);
        
        if (reason && amount) {
            extras.push({
                reason: reason,
                description: description,
                amount: amount
            });
        }
    });
    
    return {
        customer: customerData,
        billType: currentBillType,
        billData: billData,
        extras: extras,
        date: formattedDate
    };
}

function previewInvoice() {
    if (!validateForm()) {
        return;
    }
    
    currentInvoiceData = collectFormData();
    const previewHTML = generateInvoiceHTML(currentInvoiceData);
    
    document.getElementById('invoicePreview').innerHTML = previewHTML;
    document.getElementById('invoiceForm').style.display = 'none';
    document.getElementById('previewSection').style.display = 'block';
    
    document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
}

function editInvoice() {
    document.getElementById('invoiceForm').style.display = 'block';
    document.getElementById('previewSection').style.display = 'none';
    
    // Hide PDF actions when editing
    document.getElementById('pdfActions').style.display = 'none';
    
    document.getElementById('invoiceForm').scrollIntoView({ behavior: 'smooth' });
}

function generateInvoiceHTML(data) {
    const { customer, billType, billData, extras, date } = data;
    
    let totalAmount = 0;
    let billingRows = '';
    
    if (billType === 'pickup-drop') {
        totalAmount = parseFloat(billData.amount) || 0;
        billingRows = `
            <tr class="pickup-row">
                <td>Pick-up</td>
                <td>${billData.pickup}</td>
                <td rowspan="2">Rs. ${totalAmount.toLocaleString()}/-</td>
            </tr>
            <tr class="drop-row">
                <td>Drop</td>
                <td>${billData.drop}</td>
            </tr>
        `;
    } else if (billType === 'duration') {
        totalAmount = billData.hours * billData.hourlyRate;
        let timeDetails = `${billData.hours} Hours`;
        if (billData.distance) timeDetails += ` (${billData.distance} km)`;
        if (billData.startDateTime && billData.endDateTime) {
            const startTime = new Date(billData.startDateTime).toLocaleString('en-GB');
            const endTime = new Date(billData.endDateTime).toLocaleString('en-GB');
            timeDetails += `<br>From: ${startTime}<br>To: ${endTime}`;
        }
        
        billingRows = `
            <tr>
                <td>Time</td>
                <td>${timeDetails}</td>
                <td>${billData.hours} Hours</td>
            </tr>
            <tr>
                <td>Per Hour Rate</td>
                <td>Rs. ${billData.hourlyRate.toLocaleString()}/-</td>
                <td>Rs ${billData.hourlyRate.toLocaleString()}/-</td>
            </tr>
        `;
    } else if (billType === 'distance') {
        totalAmount = billData.distance * billData.perKmRate;
        let distanceDetails = `${billData.distance} km`;
        
        // Show addresses if provided
        if (billData.startAddress && billData.endAddress) {
            distanceDetails += `<br>From: ${billData.startAddress}<br>To: ${billData.endAddress}`;
        }
        
        // Show odometer readings if provided
        if (billData.startKm && billData.endKm) {
            distanceDetails += `<br>Start: ${billData.startKm.toLocaleString()} km<br>End: ${billData.endKm.toLocaleString()} km`;
        }
        
        billingRows = `
            <tr>
                <td>Distance</td>
                <td>${distanceDetails}</td>
                <td>${billData.distance} km</td>
            </tr>
            <tr>
                <td>Per Km Rate</td>
                <td>Rs. ${billData.perKmRate.toLocaleString()}/-</td>
                <td>Rs ${billData.perKmRate.toLocaleString()}/-</td>
            </tr>
        `;
    }
    
    extras.forEach(extra => {
        billingRows += `
            <tr>
                <td>Extra (${extra.reason})</td>
                <td>${extra.description || '-'}</td>
                <td>Rs. ${extra.amount.toLocaleString()}/-</td>
            </tr>
        `;
        totalAmount += extra.amount;
    });
    
    if (billType === 'duration' && extras.length === 0) {
        billingRows += `
            <tr>
                <td>Extra</td>
                <td>-</td>
                <td>-</td>
            </tr>
        `;
    }
    
    const headerLabel = billType === 'pickup-drop' ? 'Address' : 'Value';
    
    return `
        <div class="invoice-header">
            <h1>JHA TRAVELS</h1>
            <p class="tagline">"We Know Journey, Makes Memories"</p>
        </div>
        
        <div class="company-info-box">
            <h3>Company Information</h3>
        </div>
        
        <div class="company-details">
            <p>Address: Hatiara Bypass Road, Jheel Bagan, Sardarpara, Kolkata - 700157</p>
            <p>Phone: 9051066842 | 9830466842</p>
        </div>
        
        <div class="customer-header">
            <h3>Customer Details</h3>
            <h3>Date : ${date}</h3>
        </div>
        
        <div class="customer-info">
            <p>Name: ${customer.name}</p>
            <p>Phone: ${customer.phone}</p>
            <p>Address: ${customer.address}</p>
        </div>
        
        <div class="billing-section">
            <h3>Billing Details</h3>
            <table class="billing-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>${headerLabel}</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${billingRows}
                    <tr class="total-row">
                        <td>Total Amount</td>
                        <td>-</td>
                        <td>Rs. ${totalAmount.toLocaleString()}/-</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="signature-section">
            <p>Signature: ..................................................</p>
        </div>
        
        <div class="invoice-footer">
            <h3>Thank you for choosing JHA TRAVELS!</h3>
        </div>
        
        <div class="footer-text">
            <p>We look forward to serving you again.</p>
        </div>
    `;
}

function generatePDF() {
    const previewActions = document.querySelector('.preview-actions');
    const pdfActions = document.getElementById('pdfActions');
    
    // Add print-friendly styles
    const printStyle = document.createElement('style');
    printStyle.id = 'print-style';
    printStyle.innerHTML = `
        @media print {
            @page { 
                size: A4; 
                margin: 0;
                @top-left { content: "" !important; display: none !important; }
                @top-center { content: "" !important; display: none !important; }
                @top-right { content: "" !important; display: none !important; }
                @bottom-left { content: "" !important; display: none !important; }
                @bottom-center { content: "" !important; display: none !important; }
                @bottom-right { content: "" !important; display: none !important; }
            }
            * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; page-break-inside: avoid !important; page-break-after: avoid !important; page-break-before: avoid !important; }
            html { margin: 0 !important; padding: 0 !important; }
            body { background: white !important; margin: 0 !important; padding: 0 !important; font-size: 14px !important; }
            .preview-actions, .pdf-actions { display: none !important; }
            .invoice-preview { page-break-inside: avoid !important; page-break-after: avoid !important; width: calc(100% - 20mm) !important; height: auto !important; max-height: 277mm !important; overflow: hidden !important; margin: 10mm !important; transform: none !important; }
        }
    `;
    document.head.appendChild(printStyle);
    
    previewActions.style.display = 'none';
    
    const customerName = currentInvoiceData.customer.name.replace(/\s+/g, '_');
    const date = currentInvoiceData.date.replace(/\//g, '_');
    
    const originalTitle = document.title;
    document.title = `JHA_TRAVELS_${customerName}_${date}`;
    
    // Show PDF actions after print dialog
    setTimeout(() => {
        pdfActions.style.display = 'block';
        document.title = originalTitle;
        // Remove print style
        const printStyleEl = document.getElementById('print-style');
        if (printStyleEl) printStyleEl.remove();
    }, 2000);
    
    window.print();
}

function downloadPDF() {
    const customerName = currentInvoiceData.customer.name.replace(/\s+/g, '_');
    const date = currentInvoiceData.date.replace(/\//g, '_');
    
    // Add print-friendly styles
    const printStyle = document.createElement('style');
    printStyle.id = 'download-print-style';
    printStyle.innerHTML = `
        @media print {
            @page { 
                size: A4; 
                margin: 0;
                @top-left { content: "" !important; display: none !important; }
                @top-center { content: "" !important; display: none !important; }
                @top-right { content: "" !important; display: none !important; }
                @bottom-left { content: "" !important; display: none !important; }
                @bottom-center { content: "" !important; display: none !important; }
                @bottom-right { content: "" !important; display: none !important; }
            }
            * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; page-break-inside: avoid !important; page-break-after: avoid !important; page-break-before: avoid !important; }
            html { margin: 0 !important; padding: 0 !important; }
            body { background: white !important; margin: 0 !important; padding: 0 !important; font-size: 14px !important; }
            .preview-actions, .pdf-actions { display: none !important; }
            .invoice-preview { page-break-inside: avoid !important; page-break-after: avoid !important; width: calc(100% - 20mm) !important; height: auto !important; max-height: 277mm !important; overflow: hidden !important; margin: 10mm !important; transform: none !important; }
        }
    `;
    document.head.appendChild(printStyle);
    
    const originalTitle = document.title;
    document.title = `JHA_TRAVELS_${customerName}_${date}`;
    
    // Hide actions for clean PDF
    const pdfActions = document.getElementById('pdfActions');
    pdfActions.style.display = 'none';
    
    window.print();
    
    // Restore after print
    setTimeout(() => {
        pdfActions.style.display = 'block';
        document.title = originalTitle;
        // Remove print style
        const printStyleEl = document.getElementById('download-print-style');
        if (printStyleEl) printStyleEl.remove();
    }, 2000);
}

function sendWhatsApp() {
    // First generate and download the PDF
    downloadPDF();
    
    // Small delay to ensure PDF generation starts
    setTimeout(() => {
        const phoneNumber = currentInvoiceData.customer.phone.replace(/\D/g, ''); // Remove non-digits
        const customerName = currentInvoiceData.customer.name;
        const date = currentInvoiceData.date;
        const totalAmount = calculateTotalAmount();
        
        let serviceType = '';
        if (currentInvoiceData.billType === 'pickup-drop') {
            serviceType = `Pickup-Drop Service from ${currentInvoiceData.billData.pickup} to ${currentInvoiceData.billData.drop}`;
        } else if (currentInvoiceData.billType === 'duration') {
            serviceType = `${currentInvoiceData.billData.hours} Hours Service`;
        } else if (currentInvoiceData.billType === 'distance') {
            serviceType = `${currentInvoiceData.billData.distance} KM Service`;
        }
        
        const message = `Hi ${customerName}!

🚗 *JHA TRAVELS* - Invoice

📅 Date: ${date}
🚙 Service: ${serviceType}
💰 Total Amount: Rs. ${totalAmount.toLocaleString()}/-

Thank you for choosing JHA Travels!
"We Know Journey, Makes Memories"

📞 Contact: 9051066842 | 9830466842
📍 Address: Hatiara Bypass Road, Jheel Bagan, Sardarpara, Kolkata - 700157

📄 *Invoice PDF has been downloaded - please attach it to this chat*`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/91${phoneNumber}?text=${encodedMessage}`;
        
        window.open(whatsappURL, '_blank');
        
        // Show helpful message to user
        alert('📱 WhatsApp opened with message!\n📄 PDF downloaded - please attach it to the chat manually.');
    }, 1000);
}

function calculateTotalAmount() {
    let total = 0;
    
    if (currentInvoiceData.billType === 'pickup-drop') {
        total = currentInvoiceData.billData.amount;
    } else if (currentInvoiceData.billType === 'duration') {
        total = currentInvoiceData.billData.hours * currentInvoiceData.billData.hourlyRate;
    } else if (currentInvoiceData.billType === 'distance') {
        total = currentInvoiceData.billData.distance * currentInvoiceData.billData.perKmRate;
    }
    
    if (currentInvoiceData.extras) {
        total += currentInvoiceData.extras.reduce((sum, extra) => sum + extra.amount, 0);
    }
    
    return total;
}

function clearForm() {
    if (confirm('Are you sure you want to clear the form? All data will be lost.')) {
        document.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        
        document.getElementById('extrasContainer').innerHTML = '';
        
        selectBillType('pickup-drop');
        
        document.getElementById('invoiceForm').style.display = 'block';
        document.getElementById('previewSection').style.display = 'none';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}