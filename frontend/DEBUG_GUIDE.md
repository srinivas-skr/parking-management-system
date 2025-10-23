# 🔍 Debug Guide for 403 Forbidden Errors

## Current Setup Status
✅ API configuration is correct (`api.js`)
✅ JWT token interceptor is configured
✅ Login function stores token in localStorage
✅ Backend URL is set to Render deployment

## 🐛 Debugging Steps

### Step 1: Check if Token is Being Stored

1. Open your browser's **Developer Tools** (Press `F12`)
2. Go to the **Console** tab
3. Type this command and press Enter:
   ```javascript
   localStorage.getItem('token')
   ```
4. **Expected result:** Should show your JWT token (long string starting with "eyJ...")
5. **If null:** Token is not being stored after login

### Step 2: Check if Token is Being Sent

1. In Developer Tools, go to the **Network** tab
2. Click on **Clear** button (🚫) to clear existing requests
3. Try to access **My Vehicles** or **My Bookings** page
4. Look for the failed `/api/vehicles` or `/api/bookings` request
5. Click on the request
6. Go to **Headers** section
7. Scroll down to **Request Headers**
8. Look for: `Authorization: Bearer eyJ...`
9. **If missing:** The interceptor is not working

### Step 3: Check Backend CORS Configuration

The backend might be rejecting the Authorization header. Check if:
- Backend allows `Authorization` header in CORS config
- Backend accepts `Bearer` token format

### Step 4: Test Token Manually

Run this in the browser console after logging in:

```javascript
// 1. Check if token exists
const token = localStorage.getItem('token');
console.log('Token:', token ? '✅ EXISTS' : '❌ MISSING');

// 2. Test API call with token
fetch('https://parking-management-system-hs2i.onrender.com/api/vehicles', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(res => res.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

## 🔧 Common Fixes

### Fix 1: Force Token in Axios Config

If the interceptor isn't working, try this in `api.js`:

```javascript
// Add default Authorization header
api.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
```

### Fix 2: Update Token After Login

In `Login.jsx`, after successful login, add:

```javascript
// Store token
login(token, user)

// Force update axios headers
api.defaults.headers.common['Authorization'] = `Bearer ${token}`

toast.success("Login successful!")
navigate("/dashboard")
```

### Fix 3: Check Token Format in Backend Response

The backend might be returning the token in a different format. Check the login response in Network tab.

Expected format:
```json
{
  "token": "eyJ...",
  "id": 1,
  "username": "srinivas",
  "email": "srinivas@example.com",
  "fullName": "Srinivas Kumar",
  "role": "USER"
}
```

## 📊 What to Report Back

After running the debugging steps, tell me:

1. ✅ or ❌ Does `localStorage.getItem('token')` show a token?
2. ✅ or ❌ Does the Network tab show `Authorization` header in requests?
3. ✅ or ❌ Does the manual fetch test work?
4. 📋 Copy and paste the **Network request headers** here
5. 📋 Copy and paste the **Console output** from the tests

## 🎯 Quick Fix to Try NOW

Open browser console and run:

```javascript
// After logging in successfully, run this:
const token = localStorage.getItem('token');
if (token) {
  // Manually set the header for all future requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('✅ Token header set!');
  // Now try navigating to My Vehicles or My Bookings
} else {
  console.log('❌ No token found in localStorage');
}
```

If this works, we need to add this to the code permanently.

---

**Run these tests and let me know what you find!** 🔍
