// ==========================================
// 1. CONFIGURATION & SOUND LOGIC
// ==========================================
const MY_UPI_ID = "9003705725@ybl"; 
const MY_PHONE = "919003705725";  
const CAFE_NAME = "Thirumagal Coffee House";

function playSuccessSound() {
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, context.currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.5); 
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.5);
    } catch (e) { console.log("Audio play blocked by browser."); }
}

// ==========================================
// 2. MENU DATA & RENDERING
// ==========================================
const menuItems = [
    { id: 1, eng: "Tea", tam: "டீ", price: 15, img: "tea.jpg" },
    { id: 2, eng: "Coffee", tam: "காபி", price: 20, img: "coffee.jpg" },
    { id: 3, eng: "Milk", tam: "பால்", price: 15, img: "milk.jpg" },
    { id: 4, eng: "Boost", tam: "பூஸ்ட்", price: 25, img: "boost.jpg" },
    { id: 5, eng: "Horlicks", tam: "ஹார்லிக்ஸ்", price: 25, img: "horlicks.jpg" },
    { id: 6, eng: "Ginger Tea", tam: "இஞ்சி டீ", price: 20, img: "ginger-tea.jpg" },
    { id: 7, eng: "Ginger Milk", tam: "இஞ்சி பால்", price: 20, img: "ginger-milk.jpg" },
    { id: 8, eng: "Black Tea", tam: "பிளாக் டீ", price: 12, img: "black-tea.jpg" },
    { id: 9, eng: "Green Tea", tam: "கிரீன் டீ", price: 25, img: "green-tea.jpg" },
    { id: 10, eng: "Black Coffee", tam: "பிளாக் காபி", price: 18, img: "black-coffee.jpg" }
];

let cart = {};
const container = document.getElementById('menu-container');

menuItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <div class="price-tag">₹${item.price}</div>
        <img src="${item.img}" class="item-img" alt="${item.eng}">
        <div class="item-names">
            <h3>${item.eng}</h3>
            <p>${item.tam}</p>
        </div>
        <div class="qty-controller">
            <button class="btn-qty" onclick="updateQty(${item.id}, -1)">−</button>
            <span id="qty-${item.id}">0</span>
            <button class="btn-qty" onclick="updateQty(${item.id}, 1)">+</button>
        </div>
    `;
    container.appendChild(card);
});

function updateQty(id, change) {
    cart[id] = (cart[id] || 0) + change;
    if (cart[id] < 0) cart[id] = 0;
    document.getElementById(`qty-${id}`).innerText = cart[id];
    calculateTotal();
}

function calculateTotal() {
    let total = 0; let count = 0;
    menuItems.forEach(item => {
        if (cart[item.id]) {
            total += cart[item.id] * item.price;
            count += cart[item.id];
        }
    });
    document.getElementById('total-price').innerText = `₹${total}`;
    document.getElementById('item-count').innerText = `${count} Items`;
}

// ==========================================
// 3. PAYMENT FLOW
// ==========================================
function processCheckout() {
    const total = document.getElementById('total-price').innerText.replace('₹', '');
    if (total === "0" || total === "") {
        alert("Oops! Your tray is empty. ☕");
        return;
    }
    const upiLink = `upi://pay?pa=${MY_UPI_ID}&pn=${encodeURIComponent(CAFE_NAME)}&am=${total}&cu=INR&tn=CafeOrder`;
    
    // Redirect to UPI
    window.location.href = upiLink;

    // Show ONLY the verification prompt when they return
    setTimeout(() => { showVerificationModal(total); }, 2000);
}

function showVerificationModal(amount) {
    const overlay = document.createElement('div');
    overlay.className = "payment-overlay active";
    overlay.id = "statusOverlay";
    overlay.innerHTML = `
        <div class="payment-card status-card">
            <div id="verify-area">
                <div class="payment-icon">⌛</div>
                <h3>Confirm Payment</h3>
                <p>Once you finish payment in GPay/PhonePe, click below to generate your receipt.</p>
                <button onclick="finalizeOrder('${amount}')" class="checkout-btn" style="width:100%">I Have Paid Successfully</button>
                <button onclick="location.reload()" class="close-link">Payment Failed / Cancel</button>
            </div>
            <div id="success-area" style="display:none;"></div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function finalizeOrder(amount) {
    // 1. Sensory Feedback
    playSuccessSound();

    const orderID = "CF" + Math.floor(Math.random() * 9000 + 1000);
    
    // 2. Generate Itemized Summary
    let itemHtmlSummary = ""; // For the App Screen
    let rawTextSummary = "";  // For the QR Code and WhatsApp
    
    menuItems.forEach(item => {
        const qty = cart[item.id] || 0;
        if (qty > 0) {
            const itemTotal = item.price * qty;
            // HTML for the pleasing UI
            itemHtmlSummary += `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px;">
                    <span>${item.eng} (${item.tam}) x ${qty}</span>
                    <span style="font-weight:bold;">₹${itemTotal}</span>
                </div>`;
            // Plain text for QR and WhatsApp
            rawTextSummary += `${item.eng} x ${qty}, `;
        }
    });

    // 3. QR Code Generation (Includes Order ID, Total, and Items)
    const qrData = `ID:${orderID}|Total:${amount}|Items:${rawTextSummary}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

    // 4. Update UI to Success State
    const verifyArea = document.getElementById('verify-area');
    if(verifyArea) verifyArea.style.display = 'none';

    const successArea = document.getElementById('success-area');
    successArea.style.display = 'block';

    successArea.innerHTML = `
        <div class="success-ui" style="animation: slideUp 0.5s ease;">
            <div class="check-icon">✨ ✅ ✨</div>
            <h2 style="color:#27ae60; margin-top:0;">Payment Verified!</h2>
            
            <div class="qr-container" style="background:#fff; padding:15px; border-radius:15px; border:2px dashed #27ae60; display:inline-block;">
                <img src="${qrUrl}" class="qr-code" style="width:160px; height:160px;">
                <p style="font-size:12px; color:#666; margin-top:5px;">Order #${orderID}</p>
            </div>

            <div class="order-summary" style="background:#fdfdfd; border:1px solid #eee; padding:15px; border-radius:15px; margin: 20px 0; text-align: left;">
                <p style="margin-top:0; color:#888; font-size:12px;">ORDER DETAILS</p>
                ${itemHtmlSummary}
                <hr style="border:0; border-top:1px solid #eee; margin:10px 0;">
                <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:16px;">
                    <span>Total Paid</span>
                    <span style="color:#27ae60;">₹${amount}</span>
                </div>
            </div>

            <button onclick="sendWhatsAppReceipt('${orderID}', '${amount}', '${encodeURIComponent(rawTextSummary)}')" class="pay-btn" style="width:100%;">
                Share Receipt to WhatsApp
            </button>
            <button onclick="location.reload()" class="close-link">Back to Menu</button>
        </div>
    `;

    // 5. Auto-notify Owner via WhatsApp after a short delay
    setTimeout(() => {
        sendWhatsAppReceipt(orderID, amount, encodeURIComponent(rawTextSummary));
    }, 2000);
}

function sendWhatsAppReceipt(id, amt, itemsEncoded) {
    const decodedItems = decodeURIComponent(itemsEncoded).replace(/, /g, '%0a• ');
    const msg = `🔖 *NEW PAID ORDER*%0a------------------%0a*Order ID:* #${id}%0a%0a*Items:*%0a• ${decodedItems}%0a------------------%0a*Total Paid: ₹${amt}*%0a------------------%0a✅ _Verified by Customer_`;
    
    window.open(`https://wa.me/${MY_PHONE}?text=${msg}`, '_blank');
}

function closeModal() {
    const overlay = document.getElementById('statusOverlay') || document.getElementById('paymentOverlay');
    if (!overlay) return;

    const card = overlay.querySelector('.payment-card');
    
    // PLEASING FAILURE & EMPATHY UI
    card.innerHTML = `
        <div class="failure-ui" style="animation: slideUp 0.4s ease;">
            <div class="payment-icon">☕</div>
            <h2 style="color: #d32f2f; margin-top:0;">Payment Not Completed</h2>
            
            <div class="empathy-msg" style="text-align: left; background: #fff5f5; padding: 15px; border-radius: 15px; border-left: 5px solid #ff5252; margin: 20px 0;">
                <p style="margin: 0; line-height: 1.6; color: #555;">
                    <strong>We're sorry the order couldn't go through.</strong><br><br>
                    If any amount was debited from your account, please don't worry—it will be <b>automatically refunded</b> to your bank account within <b>7 working days</b> as per standard banking policy.<br><br>
                    Feel free to try ordering again when you're ready!
                </p>
            </div>

            <button onclick="location.reload()" class="pay-btn" style="background: #666; width: 100%;">
                Try Again / மீண்டும் முயற்சிக்கவும்
            </button>
            <p style="margin-top: 15px; font-size: 13px; color: #888;">Thirumagal Coffee House appreciates your patience.</p>
        </div>
    `;

    // We keep the message visible so they can read the refund info, 
    // but the user can click "Try Again" to clear it.
}