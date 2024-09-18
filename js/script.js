document.addEventListener('DOMContentLoaded', function() {
    // Copy address functionality
    const copyBtn = document.getElementById('copyAddress');
    const address = document.getElementById('address');

    if (copyBtn && address) {
        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(address.textContent).then(function() {
                copyBtn.textContent = 'Copied!';
                setTimeout(function() {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            }, function(err) {
                console.error('Could not copy text: ', err);
            });
        });
    }

    // Roadmap scrolling functionality
    const roadmap = document.querySelector('.roadmap');
    const leftArrow = document.querySelector('.roadmap-arrow-left');
    const rightArrow = document.querySelector('.roadmap-arrow-right');
    let scrollPosition = 0;

    if (leftArrow && rightArrow && roadmap) {
        leftArrow.addEventListener('click', () => {
            scrollPosition += 270; // Adjust this value based on item width + margin
            if (scrollPosition > 0) scrollPosition = 0;
            roadmap.style.transform = `translateX(${scrollPosition}px)`;
        });

        rightArrow.addEventListener('click', () => {
            const maxScroll = roadmap.scrollWidth - roadmap.clientWidth;
            scrollPosition -= 270; // Adjust this value based on item width + margin
            if (scrollPosition < -maxScroll) scrollPosition = -maxScroll;
            roadmap.style.transform = `translateX(${scrollPosition}px)`;
        });

        // Roadmap touch scrolling for mobile
        let isScrolling = false;
        let startX;
        let scrollLeft;

        roadmap.addEventListener('touchstart', (e) => {
            isScrolling = true;
            startX = e.touches[0].pageX - roadmap.offsetLeft;
            scrollLeft = roadmap.scrollLeft;
        });

        roadmap.addEventListener('touchmove', (e) => {
            if (!isScrolling) return;
            e.preventDefault();
            const x = e.touches[0].pageX - roadmap.offsetLeft;
            const walk = (x - startX) * 2;
            roadmap.scrollLeft = scrollLeft - walk;
        });

        roadmap.addEventListener('touchend', () => {
            isScrolling = false;
        });
    }

    // Initialize other functions
    createSparks();
    updateBurntAmount();
});

function createSpark() {
    const sparksContainer = document.getElementById('sparks-container');
    if (!sparksContainer) return;

    const spark = document.createElement('div');
    spark.classList.add('spark');
    
    const size = Math.floor(Math.random() * 3) + 1;
    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    
    const startPosition = Math.random() * window.innerWidth;
    spark.style.left = `${startPosition}px`;
    
    const hue = Math.random() * 60 + 10;
    spark.style.backgroundColor = `hsla(${hue}, 100%, 50%, 0.8)`;
    spark.style.boxShadow = `0 0 ${size * 2}px hsla(${hue}, 100%, 50%, 0.8)`;
    
    sparksContainer.appendChild(spark);
    
    animateSpark(spark);
}

function animateSpark(spark) {
    const duration = Math.random() * 3000 + 2000;
    const keyframes = [
        { transform: 'translateY(0)', opacity: 0 },
        { opacity: 0.8, offset: 0.1 },
        { opacity: 0.8, offset: 0.9 },
        { transform: `translateY(-${window.innerHeight}px)`, opacity: 0 }
    ];
    
    spark.animate(keyframes, {
        duration: duration,
        easing: 'linear'
    }).onfinish = () => spark.remove();
}

function createSparks() {
    setInterval(createSpark, 50);
}

const TOTAL_SUPPLY = 21000000;
const TOKEN_ADDRESS = 'BaDjVCpABEVCdt4LT7ivuzA4izBwJCqnDjrLa8XBtT38';

async function updateBurntAmount() {
    const burntAmountElement = document.getElementById('burnt-amount');
    if (!burntAmountElement) return;
    
    const rpcEndpoint = 'https://charisse-7oiyvy-fast-mainnet.helius-rpc.com';
    
    const body = JSON.stringify({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenSupply",
        "params": [TOKEN_ADDRESS]
    });

    try {
        const response = await fetch(rpcEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        });
    
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.result && data.result.value) {
            const currentSupply = parseFloat(data.result.value.amount) / Math.pow(10, data.result.value.decimals);
            const burntAmount = TOTAL_SUPPLY - currentSupply;
            
            burntAmountElement.textContent = burntAmount.toLocaleString(undefined, {maximumFractionDigits: 2});
        } else {
            throw new Error('Invalid data structure');
        }
    } catch (error) {
        console.error('Error fetching burnt amount:', error);
        burntAmountElement.textContent = 'Error fetching data';
    }
}