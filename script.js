let currentBillType = 'pickup-drop';
let currentInvoiceData = null;

document.addEventListener('DOMContentLoaded', function() {
    selectBillType('pickup-drop');
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    
    // Check if pdfMake is loaded
    setTimeout(() => {
        if (typeof pdfMake === 'undefined') {
            console.error('PDFMake failed to load');
        } else {
            console.log('PDFMake loaded successfully');
        }
    }, 2000);
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
            <p>Thank you for choosing JHA TRAVELS! We look forward to serving you again.</p>
        </div>
    `;
}

// Universal PDF generation using PDFMake - works perfectly on all browsers
function generatePDF() {
    console.log('generatePDF called');
    
    if (!currentInvoiceData) {
        alert('No invoice data available');
        return;
    }
    
    // Check if pdfMake is loaded
    if (typeof pdfMake === 'undefined') {
        alert('PDF library is not loaded. Please refresh the page and try again.');
        console.error('pdfMake is not defined');
        return;
    }
    
    try {
        const docDefinition = createPDFDocDefinition(currentInvoiceData);
        console.log('docDefinition created:', docDefinition);
        
        // Show PDF actions
        const pdfActions = document.getElementById('pdfActions');
        pdfActions.style.display = 'block';
        
        // Create and show PDF preview
        pdfMake.createPdf(docDefinition).getBlob((blob) => {
            console.log('PDF blob created:', blob);
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF: ' + error.message);
    }
}

// Universal PDF download using PDFMake - works perfectly on all browsers
function downloadPDF() {
    console.log('downloadPDF called');
    console.log('Device detection - iOS:', isIOS(), 'Safari:', isSafari(), 'Mobile:', isMobile());
    
    if (!currentInvoiceData) {
        alert('No invoice data available');
        return;
    }
    
    // Check if pdfMake is loaded
    if (typeof pdfMake === 'undefined') {
        alert('PDF library is not loaded. Please refresh the page and try again.');
        console.error('pdfMake is not defined');
        return;
    }
    
    try {
        const docDefinition = createPDFDocDefinition(currentInvoiceData);
        const customerName = currentInvoiceData.customer.name.replace(/\s+/g, '_');
        const date = currentInvoiceData.date.replace(/\//g, '_');
        const filename = `JHA_TRAVELS_${customerName}_${date}.pdf`;
        
        console.log('Downloading PDF:', filename);
        
        // iOS Safari and mobile handling
        if (isIOS()) {
            console.log('Using iOS download method');
            
            pdfMake.createPdf(docDefinition).getBlob((blob) => {
                console.log('PDF blob created for iOS:', blob);
                
                // Create download URL
                const url = URL.createObjectURL(blob);
                
                // For iOS 13+ with Share API support
                if (navigator.share) {
                    console.log('Using iOS Share API');
                    try {
                        const file = new File([blob], filename, { type: 'application/pdf' });
                        navigator.share({
                            files: [file],
                            title: 'JHA Travels Invoice'
                        }).then(() => {
                            console.log('iOS Share successful');
                            URL.revokeObjectURL(url);
                        }).catch((error) => {
                            console.log('iOS Share failed, opening PDF:', error);
                            // Open PDF in new tab with instructions
                            const newWindow = window.open(url, '_blank');
                            if (newWindow) {
                                // Show instructions after a brief delay
                                setTimeout(() => {
                                    alert('To save this PDF on iPhone:\n\n1. Tap the Share button (square with arrow)\n2. Select "Save to Files"\n3. Choose your preferred location\n\nOr tap and hold the PDF and select "Save to Files"');
                                }, 1500);
                            }
                        });
                    } catch (shareError) {
                        console.log('Share API error:', shareError);
                        openPDFWithInstructions(url);
                    }
                } else {
                    console.log('No Share API, opening PDF with instructions');
                    openPDFWithInstructions(url);
                }
            });
        } else {
            // Standard download for non-iOS devices
            console.log('Using standard download method');
            pdfMake.createPdf(docDefinition).download(filename);
        }
    } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Error downloading PDF: ' + error.message);
    }
}

// Helper function to open PDF with instructions for iOS
function openPDFWithInstructions(url) {
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
        // Show clear instructions for iOS users
        setTimeout(() => {
            alert('To save this PDF on iPhone/iPad:\n\n📱 Method 1 (Recommended):\n1. Tap the Share button (⬆️)\n2. Select "Save to Files"\n3. Choose location and tap "Save"\n\n📱 Method 2:\n1. Tap and hold the PDF\n2. Select "Save to Files" from menu\n3. Choose location and tap "Save"\n\n💡 The PDF will be saved to your Files app');
        }, 1500);
    } else {
        // Popup blocked - provide alternative
        alert('Popup blocked! Please:\n\n1. Allow popups for this site\n2. Try again\n\nOr use Chrome browser for direct downloads');
    }
    
    // Clean up URL after delay
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 30000); // Keep URL alive longer for iOS
}

// Device detection functions
function isMobile() {
    return /iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isSafari() {
    return /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
}

// Create universal PDFMake document definition that works great on all devices
function createPDFDocDefinition(data) {
    console.log('Creating universal PDF document definition for:', data);
    
    const { customer, billType, billData, extras, date } = data;
    
    let totalAmount = 0;
    let tableBody = [];
    
    // Universal sizes that work well on both mobile and desktop
    const headerFontSize = 22;      // Good for both mobile and desktop
    const taglineFontSize = 11;     // Readable on all devices  
    const sectionFontSize = 13;     // Clear on all screens
    const textFontSize = 10;        // Standard readable size
    const tableFontSize = 9;        // Fits well in tables on all devices
    
    // Table header with mobile optimization
    tableBody.push([
        { 
            text: 'Description', 
            bold: true, 
            fillColor: '#1e3a8a', 
            color: 'white', 
            alignment: 'center',
            fontSize: tableFontSize
        },
        { 
            text: billType === 'pickup-drop' ? 'Address' : 'Value', 
            bold: true, 
            fillColor: '#1e3a8a', 
            color: 'white', 
            alignment: 'center',
            fontSize: tableFontSize
        },
        { 
            text: 'Total', 
            bold: true, 
            fillColor: '#1e3a8a', 
            color: 'white', 
            alignment: 'center',
            fontSize: tableFontSize
        }
    ]);
    
    // Build table rows based on bill type
    if (billType === 'pickup-drop') {
        totalAmount = parseFloat(billData.amount) || 0;
        tableBody.push([
            { text: 'Pick-up', fontSize: tableFontSize },
            { text: billData.pickup, fontSize: tableFontSize },
            { text: `Rs. ${totalAmount.toLocaleString()}/-`, rowSpan: 2, alignment: 'center', fontSize: tableFontSize }
        ]);
        tableBody.push([
            { text: 'Drop', fontSize: tableFontSize },
            { text: billData.drop, fontSize: tableFontSize },
            ''
        ]);
    } else if (billType === 'duration') {
        totalAmount = billData.hours * billData.hourlyRate;
        let timeDetails = `${billData.hours} Hours`;
        if (billData.distance) timeDetails += ` (${billData.distance} km)`;
        
        tableBody.push([
            { text: 'Time', fontSize: tableFontSize },
            { text: timeDetails, fontSize: tableFontSize },
            { text: `${billData.hours} Hours`, fontSize: tableFontSize }
        ]);
        tableBody.push([
            { text: 'Per Hour Rate', fontSize: tableFontSize },
            { text: `Rs. ${billData.hourlyRate.toLocaleString()}/-`, fontSize: tableFontSize },
            { text: `Rs ${billData.hourlyRate.toLocaleString()}/-`, fontSize: tableFontSize }
        ]);
    } else if (billType === 'distance') {
        totalAmount = billData.distance * billData.perKmRate;
        let distanceDetails = `${billData.distance} km`;
        
        tableBody.push([
            { text: 'Distance', fontSize: tableFontSize },
            { text: distanceDetails, fontSize: tableFontSize },
            { text: `${billData.distance} km`, fontSize: tableFontSize }
        ]);
        tableBody.push([
            { text: 'Per Km Rate', fontSize: tableFontSize },
            { text: `Rs. ${billData.perKmRate.toLocaleString()}/-`, fontSize: tableFontSize },
            { text: `Rs ${billData.perKmRate.toLocaleString()}/-`, fontSize: tableFontSize }
        ]);
    }
    
    // Add extras
    if (extras && extras.length > 0) {
        extras.forEach(extra => {
            tableBody.push([
                { text: `Extra (${extra.reason})`, fontSize: tableFontSize },
                { text: extra.description || '-', fontSize: tableFontSize },
                { text: `Rs. ${extra.amount.toLocaleString()}/-`, fontSize: tableFontSize }
            ]);
            totalAmount += extra.amount;
        });
    }
    
    // Add total row
    tableBody.push([
        { text: 'Total Amount', bold: true, fillColor: '#fbbf24', alignment: 'center', fontSize: tableFontSize },
        { text: '-', bold: true, fillColor: '#fbbf24', alignment: 'center', fontSize: tableFontSize },
        { text: `Rs. ${totalAmount.toLocaleString()}/-`, bold: true, fillColor: '#fbbf24', alignment: 'center', fontSize: tableFontSize }
    ]);
    
    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [30, 30, 30, 30],  // Universal margin for all devices
        content: [
            // Header with background table for mobile compatibility
            {
                table: {
                    widths: ['*'],
                    body: [
                        [{
                            text: 'JHA TRAVELS',
                            fontSize: headerFontSize,
                            bold: true,
                            alignment: 'center',
                            color: 'white',
                            fillColor: '#1e3a8a',
                            border: [false, false, false, false],
                            margin: [0, 10, 0, 5]
                        }],
                        [{
                            text: '"We Know Journey, Makes Memories"',
                            fontSize: taglineFontSize,
                            italics: true,
                            alignment: 'center',
                            color: 'white',
                            fillColor: '#1e3a8a',
                            border: [false, false, false, false],
                            margin: [0, 0, 0, 10]
                        }]
                    ]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 15]
            },
            
            // Company Information
            {
                table: {
                    widths: ['*'],
                    body: [
                        [{
                            text: 'Company Information',
                            fontSize: sectionFontSize,
                            bold: true,
                            alignment: 'center',
                            fillColor: '#f8f9fa',
                            margin: [0, 8, 0, 8]
                        }]
                    ]
                },
                margin: [0, 0, 0, 5]
            },
            {
                text: [
                    { text: 'Address: Hatiara Bypass Road, Jheel Bagan, Sardarpara, Kolkata - 700157\n', fontSize: textFontSize },
                    { text: 'Phone: 9051066842 | 9830466842', fontSize: textFontSize }
                ],
                alignment: 'center',
                margin: [0, 0, 0, 15]
            },
            
            // Customer Details and Date
            {
                columns: [
                    { text: 'Customer Details', fontSize: sectionFontSize, bold: true },
                    { text: `Date: ${date}`, fontSize: sectionFontSize, bold: true, alignment: 'right' }
                ],
                margin: [0, 0, 0, 10]
            },
            
            // Customer Info
            {
                text: [
                    { text: `Name: ${customer.name}\n`, fontSize: textFontSize },
                    { text: `Phone: ${customer.phone}\n`, fontSize: textFontSize },
                    { text: `Address: ${customer.address}`, fontSize: textFontSize }
                ],
                margin: [0, 0, 0, 15]
            },
            
            // Billing Details Header
            {
                text: 'Billing Details',
                fontSize: sectionFontSize,
                bold: true,
                margin: [0, 0, 0, 10]
            },
            
            // Billing Table
            {
                table: {
                    headerRows: 1,
                    widths: ['28%', '47%', '25%'],  // Universal column widths for all devices
                    body: tableBody
                },
                layout: {
                    hLineWidth: function (i, node) { return 1; },
                    vLineWidth: function (i, node) { return 1; },
                    hLineColor: function (i, node) { return '#000'; },
                    vLineColor: function (i, node) { return '#000'; }
                },
                margin: [0, 0, 0, 15]
            },
            
            // Signature
            {
                text: 'Signature: ..................................................',
                alignment: 'right',
                fontSize: textFontSize,
                margin: [0, 15, 0, 15]
            },
            
            // Footer
            {
                text: 'Thank you for choosing JHA TRAVELS! We look forward to serving you again.',
                fontSize: textFontSize,
                bold: true,
                alignment: 'center'
            }
        ]
    };
    
    console.log('Universal PDF document definition created successfully');
    return docDefinition;
}

function sendWhatsApp() {
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
📍 Address: Hatiara Bypass Road, Jheel Bagan, Sardarpara, Kolkata - 700157`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/91${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
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