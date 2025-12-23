// ZKPassport is loaded as a global from the module import in index.html
// QRCode is loaded via script tag in HTML

let zkPassportVerified = false;
let nationality = null;
let baseAddress = null;
let baseSignature = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit for ZKPassport SDK to load
    let retries = 0;
    while (typeof window.ZKPassport === 'undefined' && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }
    
    if (typeof window.ZKPassport === 'undefined') {
        const statusEl = document.getElementById('zkpassport-status');
        statusEl.className = 'status-message error';
        statusEl.textContent = 'Failed to load ZKPassport SDK. Please refresh the page.';
        return;
    }
    
    await initializeZKPassport();
    await loadCensusData();
    
    // Refresh button handler
    document.getElementById('refresh-btn').addEventListener('click', loadCensusData);
});

// Initialize ZKPassport verification
async function initializeZKPassport() {
    try {
        const statusEl = document.getElementById('zkpassport-status');
        statusEl.className = 'status-message info';
        statusEl.textContent = 'Initializing ZKPassport verification...';
        
        // Initialize ZKPassport (domain will be auto-detected in browser)
        // Wait for ZKPassport to be available
        if (typeof window.ZKPassport === 'undefined') {
            throw new Error('ZKPassport SDK not loaded. Please refresh the page.');
        }
        const zkPassport = new window.ZKPassport();
        
        // Create request
        const queryBuilder = await zkPassport.request({
            name: "Base ZK Census",
            logo: window.location.origin + "/logo.png", // You can add a logo later
            purpose: "Verify you are 18+ years old and share your nationality for the Base ZK Census",
            scope: "base-zk-census",
        });
        
        // Build query: age >= 18 and disclose nationality
        const {
            url,
            onRequestReceived,
            onGeneratingProof,
            onProofGenerated,
            onResult,
            onReject,
            onError,
        } = queryBuilder
            .gte("age", 18)
            .disclose("nationality")
            .done();
        
        // Generate QR code
        const qrCanvas = document.getElementById('zkpassport-qr');
        await QRCode.toCanvas(qrCanvas, url, {
            width: 300,
            margin: 2,
        });
        
        statusEl.className = 'status-message info';
        statusEl.textContent = 'Scan the QR code with your ZKPassport app';
        
        // Handle request received
        onRequestReceived(() => {
            statusEl.className = 'status-message info';
            statusEl.textContent = 'Request received! Please accept in the ZKPassport app.';
            document.getElementById('zkpassport-progress').style.display = 'block';
        });
        
        // Handle proof generation
        onGeneratingProof(() => {
            statusEl.className = 'status-message info';
            statusEl.textContent = 'Generating proof... This may take a few seconds.';
        });
        
        // Handle proof generated (optional, for debugging)
        onProofGenerated(({ proof, vkeyHash, version, name }) => {
            console.log('Proof generated:', { proof, vkeyHash, version, name });
        });
        
        // Handle final result
        onResult(async ({ uniqueIdentifier, verified, result }) => {
            document.getElementById('zkpassport-progress').style.display = 'none';
            
            if (verified) {
                const ageVerified = result.age.gte.result;
                nationality = result.nationality.disclose.result;
                
                if (ageVerified && nationality) {
                    zkPassportVerified = true;
                    statusEl.className = 'status-message success';
                    statusEl.textContent = `✅ Verified! Age: 18+, Nationality: ${nationality}`;
                    
                    // Hide ZKPassport section and show Base section
                    setTimeout(() => {
                        document.getElementById('zkpassport-section').style.display = 'none';
                        initializeBaseVerification();
                    }, 1500);
                } else {
                    statusEl.className = 'status-message error';
                    statusEl.textContent = 'Verification failed: Age or nationality not verified.';
                }
            } else {
                statusEl.className = 'status-message error';
                statusEl.textContent = 'Verification failed: Proofs could not be verified.';
            }
        });
        
        // Handle rejection
        onReject(() => {
            document.getElementById('zkpassport-progress').style.display = 'none';
            statusEl.className = 'status-message error';
            statusEl.textContent = 'Request was rejected. Please try again.';
        });
        
        // Handle errors
        onError((error) => {
            document.getElementById('zkpassport-progress').style.display = 'none';
            statusEl.className = 'status-message error';
            statusEl.textContent = `Error: ${error.message || 'Unknown error occurred'}`;
            console.error('ZKPassport error:', error);
        });
        
    } catch (error) {
        console.error('Error initializing ZKPassport:', error);
        const statusEl = document.getElementById('zkpassport-status');
        statusEl.className = 'status-message error';
        statusEl.textContent = `Error: ${error.message || 'Failed to initialize ZKPassport'}`;
    }
}

// Initialize Base wallet verification
async function initializeBaseVerification() {
    try {
        const baseSection = document.getElementById('base-section');
        baseSection.style.display = 'block';
        
        const statusEl = document.getElementById('base-status');
        statusEl.className = 'status-message info';
        statusEl.textContent = 'Preparing Base wallet verification...';
        
        // Create a message to sign (EIP-712 typed data)
        const message = {
            domain: {
                name: "Base ZK Census",
                version: "1",
                chainId: 8453, // Base mainnet
            },
            message: {
                purpose: "Verify Base address ownership for Base ZK Census",
                timestamp: Date.now().toString(),
                nationality: nationality,
            },
            primaryType: "CensusVerification",
            types: {
                EIP712Domain: [
                    { name: "name", type: "string" },
                    { name: "version", type: "string" },
                    { name: "chainId", type: "uint256" },
                ],
                CensusVerification: [
                    { name: "purpose", type: "string" },
                    { name: "timestamp", type: "string" },
                    { name: "nationality", type: "string" },
                ],
            },
        };
        
        // Generate QR code with the message data
        // The QR code contains the message that needs to be signed
        const qrData = JSON.stringify({
            type: 'base-sign',
            message: message,
            callback: window.location.origin,
        });
        
        const qrCanvas = document.getElementById('base-qr');
        await QRCode.toCanvas(qrCanvas, qrData, {
            width: 300,
            margin: 2,
        });
        
        statusEl.className = 'status-message info';
        statusEl.textContent = 'Scan the QR code with your Base wallet app, or use the button below to sign with a web wallet';
        
        // Create signing interface for web wallets
        createBaseSigningInterface(message);
        
    } catch (error) {
        console.error('Error initializing Base verification:', error);
        const statusEl = document.getElementById('base-status');
        statusEl.className = 'status-message error';
        statusEl.textContent = `Error: ${error.message || 'Failed to initialize Base verification'}`;
    }
}

// Create a signing interface for Base (fallback for web wallets)
function createBaseSigningInterface(message) {
    const statusEl = document.getElementById('base-status');
    const container = statusEl.parentElement;
    
    // Always show the button (users can connect wallet if available)
    const button = document.createElement('button');
    button.textContent = 'Sign with Web3 Wallet (MetaMask, Coinbase Wallet, etc.)';
    button.className = 'refresh-btn';
    button.style.marginTop = '15px';
    button.style.width = '100%';
    
    button.addEventListener('click', async () => {
        try {
            if (typeof window.ethereum === 'undefined') {
                statusEl.className = 'status-message error';
                statusEl.textContent = 'No Web3 wallet detected. Please install MetaMask or Coinbase Wallet, or scan the QR code with your mobile Base wallet app.';
                return;
            }
            
            button.disabled = true;
            statusEl.className = 'status-message info';
            statusEl.textContent = 'Connecting to wallet...';
            document.getElementById('base-progress').style.display = 'block';
            
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });
            
            const address = accounts[0];
            statusEl.textContent = 'Please sign the message in your wallet...';
            
            // Switch to Base network if needed
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x2105' }], // Base mainnet
                });
            } catch (switchError) {
                // Chain might not be added, try to add it
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x2105',
                            chainName: 'Base',
                            nativeCurrency: {
                                name: 'ETH',
                                symbol: 'ETH',
                                decimals: 18,
                            },
                            rpcUrls: ['https://mainnet.base.org'],
                            blockExplorerUrls: ['https://basescan.org'],
                        }],
                    });
                }
            }
            
            // Sign typed data
            const signature = await window.ethereum.request({
                method: 'eth_signTypedData_v4',
                params: [address, JSON.stringify(message)],
            });
            
            baseAddress = address;
            baseSignature = signature;
            
            document.getElementById('base-progress').style.display = 'none';
            
            // Submit to backend
            await submitCensusData();
            
        } catch (error) {
            console.error('Signing error:', error);
            document.getElementById('base-progress').style.display = 'none';
            statusEl.className = 'status-message error';
            statusEl.textContent = `Error: ${error.message || 'Failed to sign message'}`;
            button.disabled = false;
        }
    });
    
    container.appendChild(button);
}

// Submit census data to backend
async function submitCensusData() {
    try {
        const statusEl = document.getElementById('base-status');
        statusEl.className = 'status-message info';
        statusEl.textContent = 'Submitting census data...';
        
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                address: baseAddress,
                nationality: nationality,
            }),
        });
        
        if (response.ok) {
            statusEl.className = 'status-message success';
            statusEl.textContent = '✅ Census data submitted successfully!';
            
            // Hide Base section and show success
            setTimeout(() => {
                document.getElementById('base-section').style.display = 'none';
                document.getElementById('success-section').style.display = 'block';
                loadCensusData();
            }, 1500);
        } else {
            throw new Error('Failed to submit census data');
        }
    } catch (error) {
        console.error('Error submitting census data:', error);
        const statusEl = document.getElementById('base-status');
        statusEl.className = 'status-message error';
        statusEl.textContent = `Error: ${error.message || 'Failed to submit data'}`;
    }
}

// Load and display census data
async function loadCensusData() {
    try {
        const response = await fetch('/api/census');
        const data = await response.json();
        
        const statsEl = document.getElementById('census-stats');
        
        if (data.countries && data.countries.length > 0) {
            let html = '';
            
            data.countries.forEach(({ country, count }) => {
                html += `
                    <div class="country-item">
                        <span class="country-name">${escapeHtml(country)}</span>
                        <span class="country-count">${count}</span>
                    </div>
                `;
            });
            
            html += `<div class="total-count">Total Participants: ${data.total}</div>`;
            
            statsEl.innerHTML = html;
        } else {
            statsEl.innerHTML = `
                <div class="empty-state">
                    <p>No census data yet. Be the first to join!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading census data:', error);
        const statsEl = document.getElementById('census-stats');
        statsEl.innerHTML = `
            <div class="empty-state">
                <p>Error loading census data. Please try again.</p>
            </div>
        `;
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

