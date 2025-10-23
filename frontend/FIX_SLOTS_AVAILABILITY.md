# 🔧 Quick Fix: Make Slots Available

## Problem
All 20 slots showing as **"0 Available"** (all occupied)

## Solution: Reset Slots via H2 Console

### Option 1: H2 Console (Easiest)

1. **Open H2 Console:**
   ```
   http://localhost:8080/h2-console
   ```

2. **Login:**
   - **JDBC URL:** `jdbc:h2:mem:parkingdb`
   - **Username:** `sa`
   - **Password:** *(leave blank)*
   - Click **Connect**

3. **Run SQL:**
   ```sql
   UPDATE PARKING_SLOTS SET SLOT_STATUS = 'AVAILABLE';
   ```

4. **Refresh Dashboard:**
   - Go back to: http://localhost:5173/dashboard
   - Click **Refresh** button
   - Should now show **"20 Available"** ✅

---

## Option 2: Restart Backend

The backend creates slots as AVAILABLE on startup. If they're all occupied, just restart:

```bash
# Stop current server (Ctrl + C in backend terminal)
# Then restart:
cd parking-management-system
.\START_SERVER.bat
```

This recreates the database with fresh data.

---

## Option 3: Create More Slots

If you want MORE slots to test with:

```sql
-- In H2 Console, run:
INSERT INTO PARKING_SLOTS 
(slot_number, vehicle_type, price_per_hour, slot_status, location_description, floor_number, is_active, created_at, updated_at, version) 
VALUES 
('A021', 'FOUR_WHEELER', 50.0, 'AVAILABLE', 'Ground Floor - Zone A', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
('A022', 'FOUR_WHEELER', 50.0, 'AVAILABLE', 'Ground Floor - Zone A', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
('A023', 'TWO_WHEELER', 20.0, 'AVAILABLE', 'Ground Floor - Zone B', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
('A024', 'TWO_WHEELER', 20.0, 'AVAILABLE', 'Ground Floor - Zone B', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
('A025', 'HEAVY_VEHICLE', 100.0, 'AVAILABLE', 'Ground Floor - Zone C', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);
```

This adds 5 more slots!

---

## Verify It Worked

After running SQL:
1. ✅ Refresh dashboard
2. ✅ Check "Available Now" stat → Should be > 0
3. ✅ Slot cards should have **green pulsing dots**
4. ✅ "Book Now" button should be enabled (purple gradient)

---

## Quick Test After Fix

1. **Login:** `user` / `user123`
2. **Go to Dashboard**
3. **Find Available Slot** (green dot)
4. **Click "Book Now"**
5. **Test the full booking flow!**

---

## Why Were They All Occupied?

Possible reasons:
- Previous testing left bookings active
- Backend restarted with old database state
- Test data initialization issue

**Solution:** Just reset them and continue testing! ✅
