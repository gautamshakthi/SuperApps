// ==========================================
// 1. CONFIGURATION & SOUND LOGIC
// ==========================================
const MY_UPI_ID = "9003705725@ybl"; 
const MY_PHONE = "919003705725";  
const CAFE_NAME = "Thirumagal Coffee House";

// Audio function for the "Ding!" effect
function playSuccessSound() {
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
}

// ==========================================
// 2. MENU DATA & RENDERING
// ==========================================
const menuItems = [
    { id: 1, eng: "Tea", tam: "டீ", price: 15, img: "tea.jpg" },
    { id: 2, eng: "Coffee", tam: "காபி", price: 20, img: "coffee.jpg" },
    { id: 3, eng: "Milk", tam: "பால்", price: 15, img: "milk.jpg" },
    { id: 4, id: 4, eng: "Boost", tam: "பூஸ்ட்", price: 25, img: "boost.jpg" },
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

// ==========================================
// 3. CART LOGIC
// ==========================================
function updateQty(id, change) {
    cart[id] = (cart[id] || 0) + change;
    if (cart[id] < 0) cart[id] = 0;
    document.getElementById(`qty-${id}`).innerText = cart[id];
    calculateTotal();
}

function calculateTotal() {
    let total = 0;
    let count = 0;
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
// 4. CHECKOUT & REDIRECT LOGIC
// ==========================================
function processCheckout() {
    const total = document.getElementById('total-price').innerText.replace('₹', '');
    if (total === "0" || total === "") {
        alert("Oops! Your tray is empty. ☕");
        return;
    }

    // 1. Generate UPI Link
    const upiLink = `upi://pay?pa=${MY_UPI_ID}&pn=${encodeURIComponent(CAFE_NAME)}&am=${total}&cu=INR&tn=CafeOrder`;

    // 2. Direct Redirect to UPI Apps
    window.location.href = upiLink;

    // 3. Automatically show Success/Status Screen when user returns to browser
    setTimeout(() => {
        showStatusScreen(total);
    }, 2000);
}

// ==========================================
// 5. SUCCESS SCREEN & NOTIFICATION
// ==========================================
function showStatusScreen(amount) {
    // Play the "Ding!" sound
    playSuccessSound();

    const orderID = "CF" + Math.floor(Math.random() * 9000 + 1000);
    const overlay = document.createElement('div');
    overlay.className = "payment-overlay active";
    overlay.id = "statusOverlay";

    // Generate Order Details for WhatsApp
    let orderDetails = `*Order ID: ${orderID}*%0a`;
    menuItems.forEach(item => {
        if (cart[item.id] > 0) {
            orderDetails += `• ${item.eng} (${item.tam}) x ${cart[item.id]}%0a`;
        }
    });
    orderDetails += `%0a*Total Paid: ₹${amount}*`;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Order:${orderID}|Total:${amount}`;

    overlay.innerHTML = `
        <div class="payment-card status-card">
            <div class="success-ui">
                <div class="check-icon">✨ ✅ ✨</div>
                <h2 class="status-title" style="color:#27ae60">Order Successful!</h2>
                <p class="status-text">Your delicious order is being prepared with care.</p>
                
                <div class="qr-container" style="border: 2px dashed #27ae60; padding: 10px; border-radius: 15px; display: inline-block; background: #fff;">
                    <img src="${qrUrl}" class="qr-code">
                    <p style="font-size: 12px; margin-top: 5px; color: #666;">Scan at counter</p>
                </div>

                <div class="order-summary" style="background:#f9f9f9; padding:15px; border-radius:15px; margin: 20px 0; text-align: left;">
                    <p>Order ID: <strong>#${orderID}</strong></p>
                    <p>Amount: <strong>₹${amount}</strong></p>
                </div>

                <button onclick="location.reload()" class="checkout-btn" style="width:100%">Place New Order</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // AUTOMATIC WHATSAPP SEND (To Owner)
    const waUrl = `https://wa.me/${MY_PHONE}?text=🔖 *NEW PAID ORDER*%0a------------------%0a${orderDetails}%0a------------------%0aStatus: ✅ Payment Initiated`;
    
    setTimeout(() => {
        window.open(waUrl, '_blank');
    }, 1500);
}