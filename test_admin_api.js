const testRoles = [
    { email: 'admin@admissionx.com', password: 'admin', expectedRole: 'super admin' },
    { email: 'ceo@admissionx.com', password: 'admin123', expectedRole: 'ceo' },
    { email: 'councellor@admissionx.com', password: 'admin123', expectedRole: 'councellor' },
    { email: 'invalid@example.com', password: 'wrong', expectedStatus: 401 }
];

async function runTests() {
    for (const test of testRoles) {
        console.log(`Testing login for: ${test.email}...`);
        try {
            const response = await fetch('http://localhost:3000/api/login/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: test.email, password: test.password })
            });
            
            const data = await response.json();
            
            if (test.expectedStatus) {
                if (response.status === test.expectedStatus) {
                    console.log(`✅ Correctly rejected with status ${response.status}`);
                } else {
                    console.log(`❌ Expected status ${test.expectedStatus} but got ${response.status}`);
                }
            } else {
                if (response.ok && data.success && data.user.role === test.expectedRole) {
                    console.log(`✅ Success! Logged in as ${data.user.role}`);
                } else {
                    console.log(`❌ Failed! Status: ${response.status}, Data:`, JSON.stringify(data));
                }
            }
        } catch (error) {
            console.error(`❌ Error testing ${test.email}:`, error.message);
        }
        console.log('---');
    }
}

runTests();
