import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3000'

async function testAuthFlow() {
  console.log('🧪 Testing authentication flow...\n')

  try {
    // Test 1: Login with admin credentials
    console.log('1. Testing admin login...')
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@kitedakhla.com',
        password: 'admin123'
      })
    })

    const loginData = await loginResponse.json()
    console.log('Login response:', loginData.success ? '✅ Success' : '❌ Failed')
    
    if (!loginData.success) {
      console.log('Error:', loginData.error)
      return
    }

    // Extract cookies from response
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('Cookies received:', cookies ? '✅ Yes' : '❌ No')

    // Test 2: Check user info
    console.log('\n2. Testing user info endpoint...')
    const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Cookie': cookies }
    })

    const meData = await meResponse.json()
    console.log('User info response:', meResponse.ok ? '✅ Success' : '❌ Failed')
    if (meResponse.ok) {
      console.log('User role:', meData.user?.role)
    }

    // Test 3: Access admin dashboard API
    console.log('\n3. Testing admin dashboard API...')
    const dashboardResponse = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { 'Cookie': cookies }
    })

    const dashboardData = await dashboardResponse.json()
    console.log('Dashboard API response:', dashboardResponse.ok ? '✅ Success' : '❌ Failed')
    if (dashboardResponse.ok) {
      console.log('Stats loaded:', Object.keys(dashboardData.stats || {}).length, 'items')
    }

    // Test 4: Access admin courses API
    console.log('\n4. Testing admin courses API...')
    const coursesResponse = await fetch(`${BASE_URL}/api/admin/courses`, {
      headers: { 'Cookie': cookies }
    })

    const coursesData = await coursesResponse.json()
    console.log('Courses API response:', coursesResponse.ok ? '✅ Success' : '❌ Failed')
    if (coursesResponse.ok) {
      console.log('Courses loaded:', coursesData.courses?.length || 0, 'courses')
    }

    // Test 5: Test logout
    console.log('\n5. Testing logout...')
    const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Cookie': cookies }
    })

    const logoutData = await logoutResponse.json()
    console.log('Logout response:', logoutResponse.ok ? '✅ Success' : '❌ Failed')

    // Test 6: Try to access admin API after logout
    console.log('\n6. Testing admin access after logout...')
    const unauthorizedResponse = await fetch(`${BASE_URL}/api/admin/dashboard`)
    console.log('Unauthorized access response:', unauthorizedResponse.status === 401 ? '✅ Correctly blocked' : '❌ Should be blocked')

    console.log('\n🎉 Authentication flow test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAuthFlow()
