# 📦 MAVEN INSTALLATION GUIDE (Windows)

## Quick Install (Choose One Method)

### Method 1: Using Chocolatey (RECOMMENDED - Easiest)

#### Step 1: Install Chocolatey (if not already installed)

Open PowerShell **as Administrator** and run:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

#### Step 2: Install Maven

```powershell
choco install maven -y
```

#### Step 3: Verify Installation

Close and reopen PowerShell, then:

```powershell
mvn -version
```

You should see:
```
Apache Maven 3.9.x
Maven home: C:\ProgramData\chocolatey\lib\maven\apache-maven-3.9.x
Java version: 21.0.4
```

---

### Method 2: Manual Installation

#### Step 1: Download Maven

1. Visit: https://maven.apache.org/download.cgi
2. Download: `apache-maven-3.9.9-bin.zip` (Binary ZIP)

#### Step 2: Extract Files

1. Extract ZIP to: `C:\Program Files\Apache\maven`
2. Final path should be: `C:\Program Files\Apache\maven\apache-maven-3.9.9`

#### Step 3: Set Environment Variables

1. Press `Win + X` → Choose "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"

4. **Add MAVEN_HOME**:
   - Click "New" under System Variables
   - Variable name: `MAVEN_HOME`
   - Variable value: `C:\Program Files\Apache\maven\apache-maven-3.9.9`
   - Click OK

5. **Add to PATH**:
   - Find "Path" in System Variables
   - Click "Edit"
   - Click "New"
   - Add: `%MAVEN_HOME%\bin`
   - Click OK on all windows

#### Step 4: Verify Installation

Close all PowerShell windows, open a new one, and run:

```powershell
mvn -version
```

---

## 🐳 DOCKER INSTALLATION GUIDE (Windows)

### Step 1: Download Docker Desktop

1. Visit: https://www.docker.com/products/docker-desktop/
2. Click "Download for Windows"
3. Run the installer

### Step 2: Install

1. Follow the installation wizard
2. Enable WSL 2 when prompted (recommended)
3. Restart your computer when asked

### Step 3: Start Docker Desktop

1. Search for "Docker Desktop" in Start Menu
2. Launch it
3. Wait for it to start (check system tray)

### Step 4: Verify Installation

Open PowerShell and run:

```powershell
docker --version
docker-compose --version
```

You should see:
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

---

## ✅ POST-INSTALLATION CHECKLIST

Run these commands to verify everything:

```powershell
# Check Java
java -version
# Should show: java version "21.0.4"

# Check Maven
mvn -version
# Should show: Apache Maven 3.9.x

# Check Docker
docker --version
# Should show: Docker version 24.x.x

# Check Docker Compose
docker-compose --version
# Should show: docker-compose version v2.x.x
```

---

## 🚀 NEXT STEPS AFTER INSTALLATION

Once all tools are installed:

```powershell
# Navigate to project
cd c:\Users\vikas\Documents\Java_fresher\parking-management-system

# Start MySQL with Docker
docker-compose up -d mysql

# Check if MySQL is running
docker-compose ps

# Wait 30 seconds, then build project
mvn clean install

# Run the application
mvn spring-boot:run
```

---

## 🐛 TROUBLESHOOTING

### Maven: Command Not Found

**Problem**: `mvn` command not recognized after installation

**Solution**:
1. Close ALL PowerShell windows
2. Open a NEW PowerShell window
3. Try `mvn -version` again
4. If still not working, restart your computer

### Docker: WSL 2 Error

**Problem**: "WSL 2 installation is incomplete"

**Solution**:
1. Open PowerShell as Administrator
2. Run: `wsl --install`
3. Restart computer
4. Launch Docker Desktop again

### Docker: Not Starting

**Problem**: Docker Desktop stuck on "Starting..."

**Solution**:
1. Close Docker Desktop
2. Open PowerShell as Administrator
3. Run: `wsl --shutdown`
4. Start Docker Desktop again

### Port 3306 Already in Use

**Problem**: MySQL port conflict

**Solution**:
```powershell
# Stop any existing MySQL service
services.msc
# Find "MySQL" service and stop it

# Or change port in docker-compose.yml:
# ports:
#   - "3307:3306"  # Use 3307 instead
```

---

## 📞 Need Help?

If you encounter any issues:

1. Check if you ran PowerShell **as Administrator**
2. Ensure you restarted PowerShell after installation
3. Verify PATH is set correctly
4. Try restarting your computer

**Tell me what error you're getting and I'll help!** 🚀
