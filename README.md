# Employee Portal Application

A complete employee management system where you can register employees, manage their skills, and view their profiles.

## What This Application Does

- **Register New Employees**: Create employee profiles with personal information, job details, and skills
- **Employee Login**: Secure login system with email and password
- **Profile Management**: View and manage employee information and skills
- **Skills Tracking**: Visual representation of employee skills with an interactive chart

## Prerequisites (What You Need Before Starting)

Before running this application, you need to install Docker on your computer:

### For Windows:
1. Go to [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Download and install Docker Desktop
3. Restart your computer if prompted
4. Make sure Docker Desktop is running (you'll see a whale icon in your system tray)

### For Mac:
1. Go to [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. Download and install Docker Desktop
3. Open Docker Desktop from your Applications folder

### For Linux:
1. Follow the installation guide at [Docker for Linux](https://docs.docker.com/engine/install/)

## How to Run the Application

### Step 1: Download the Project
1. Download this project to your computer
2. Extract the files if they're in a zip folder
3. Remember where you saved the folder

### Step 2: Open Command Line
**Windows:**
#### Option 1:
- Press `Windows key + R`
- Type `cmd` and press Enter
- Or search for "Command Prompt" in the Start menu
- You can also right click the empty space in the file explorer and see an "Open in terminal" prompt in Windows 11

**Mac:**
- Press `Cmd + Space`
- Type "Terminal" and press Enter

**Linux:**
- Press `Ctrl + Alt + T`
- Or search for "Terminal" in your applications

### Step 3: Navigate to the Project Folder
In the command line, type:
```bash
cd path/to/your/project/folder
```
Replace `path/to/your/project/folder` with the actual path where you saved the project.

**Example for Windows:**
```bash
cd C:\Users\YourName\Downloads\factoresassesment
```

**Example for Mac/Linux:**
```bash
cd /Users/YourName/Downloads/factoresassesment
```

### Step 4: Start the Application
Once you're in the project folder, type this command and press Enter:
```bash
docker-compose up
```

**What happens next:**
- Docker will download and set up everything needed (this might take a few minutes the first time)
- Wait until you see messages saying the services are running

### Step 5: Access the Application
Once everything is running, open your web browser and go to:
```
http://localhost:3000
```

You should see the Employee Portal login page

## Using the Application

### First Time Setup:
1. Click "Create one here" to register a new employee (The database is unique per docker so you'll start with a fresh empty database)
2. Fill out the registration form with your information
3. Add at least 5 skills with their proficiency levels
4. Click "Create Account"
5. You'll be redirected to your profile page

### Logging In:
1. Go to `http://localhost:3000`
2. Enter your email and password
3. Click "Sign In"
4. You'll see your employee profile with skills chart

## Stopping the Application

To stop the application:
1. Go back to your command line window
2. Press `Ctrl + C` (Windows/Linux) or `Cmd + C` (Mac)
3. Wait for everything to stop
4. Type: `docker-compose down`