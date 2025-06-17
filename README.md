# Project Title (Replace with actual title)

## Project Overview

This project is a web platform for a recording studio. It allows artists to provide feedback on their recordings in a user-friendly manner. The platform enables studio staff to manage artists, projects, and audio files, incorporating version control for the audio files. Artists can access their tracks via secure links, listen to them, compare different versions, and leave comments without needing to log in.

## Prerequisites

Before you begin, ensure you have the following software installed on your system:

*   **Node.js**: Latest LTS version is recommended. You can download it from [https://nodejs.org/](https://nodejs.org/)
*   **Docker**: Download and install Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
*   **Docker Compose**: Docker Compose is included with Docker Desktop for Windows and macOS. For Linux users, you may need to install it separately. Follow the instructions at [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

## Development Setup

Follow these steps to set up the project for development:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
    (Replace `<repository-url>` with the actual URL and `<repository-directory>` with the project's directory name)

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the database:**
    *   Ensure Docker and Docker Compose are installed and running (see Prerequisites).
    *   Start the database and other services:
        ```bash
        docker-compose up -d
        ```
    *   The database will be accessible on port 3307.
    *   Run database migrations:
        ```bash
        npx prisma migrate dev
        ```
    *   (Optional) Seed the database with initial data:
        ```bash
        npm run seed
        ```
        This script typically populates the database with sample data for testing and development purposes.

4.  **Run the project in development mode:**
    ```bash
    npm run dev
    ```

5.  **Access the application:**
    Open your web browser and navigate to `http://localhost:3000`.

## Deployment to VPS (Ubuntu 20.04)

This section guides you through deploying the application to a Virtual Private Server (VPS) running Ubuntu 20.04.

### 1. Set up MariaDB Server

First, you need to install and configure MariaDB on your VPS:

*   **Install MariaDB:**
    Connect to your VPS via SSH and run the following commands:
    ```bash
    sudo apt update
    sudo apt install mariadb-server
    ```

*   **Secure MariaDB Installation:**
    Run the security script and follow the prompts. It's recommended to set a strong root password, remove anonymous users, disallow root login remotely, and remove the test database.
    ```bash
    sudo mysql_secure_installation
    ```

*   **Create Database and User:**
    Log in to MariaDB as root:
    ```bash
    sudo mysql -u root -p
    ```
    Then, execute the following SQL commands to create a database and a dedicated user for your application. **Remember to replace `'user'` and `'password'` with strong, unique credentials.**
    ```sql
    CREATE DATABASE artisthub;
    CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';
    GRANT ALL PRIVILEGES ON artisthub.* TO 'user'@'localhost';
    FLUSH PRIVILEGES;
    EXIT;
    ```

### 2. Configure Application for Production Database

Your application needs to be configured to connect to the MariaDB database you just set up. This is typically done by setting environment variables.

*   **Set Environment Variables:**
    The primary environment variable you'll need to set is `DATABASE_URL`. The format for MariaDB is:
    `mysql://USER:PASSWORD@HOST:PORT/DATABASE`

    For the example above, it would be:
    `mysql://user:password@localhost:3306/artisthub`

    (Ensure you replace `user` and `password` with the credentials you created). How you set this environment variable depends on how you run your application in production (e.g., using a `.env` file with `pm2`, systemd service files, or other deployment tools).

*   **Run Production Migrations:**
    Once your application is configured to connect to the production database, you need to apply the database schema. Use the following command:
    ```bash
    npx prisma migrate deploy
    ```
    This command will apply all pending migrations to your database schema. It's designed for production environments and doesn't generate new migration files.

### 3. Build the Application

Before running the application, you need to build it for production:

*   **Install Dependencies:**
    Ensure you are in the project directory on your VPS and run:
    ```bash
    npm install
    ```
    (This might require installing Node.js and npm on your VPS if not already present. Refer to the Prerequisites section for Node.js installation.)

*   **Build the Application:**
    ```bash
    npm run build
    ```
    This command compiles the Next.js application into an optimized production build.

### 4. Run the Application with PM2

PM2 is a process manager for Node.js applications that helps keep your application alive and manage its lifecycle.

*   **Install PM2:**
    ```bash
    sudo npm install pm2 -g
    ```

*   **Start the Application:**
    Use the following command to start your Next.js application with PM2. The `npm start` script should internally run `next start`.
    ```bash
    pm2 start npm --name "artisthub" -- start
    ```
    -   `"artisthub"` is a custom name you give to your process in PM2.
    -   `start` refers to the `start` script in your `package.json` (e.g., `next start -p 3000`).

*   **(Optional) Manage Application with PM2:**
    Here are some common PM2 commands:
    -   List all running processes: `pm2 list`
    -   Restart the application: `pm2 restart artisthub`
    -   Stop the application: `pm2 stop artisthub`
    -   View application logs: `pm2 logs artisthub`

*   **Set up PM2 to Start on System Boot:**
    To ensure your application restarts automatically after a server reboot, run:
    ```bash
    pm2 startup systemd
    ```
    PM2 will provide you with a command that you need to run with `sudo` privileges to complete the setup.

### 5. (Optional) Set up Nginx as a Reverse Proxy

Using Nginx as a reverse proxy can improve performance, handle SSL termination (HTTPS), and manage incoming traffic.

*   **Install Nginx:**
    ```bash
    sudo apt install nginx
    ```

*   **Configure Nginx:**
    Create a new Nginx server block configuration file for your application. For example, create `/etc/nginx/sites-available/artisthub`:
    ```nginx
    server {
        listen 80;
        server_name your_domain_or_ip; # Replace with your domain or VPS IP address

        location / {
            proxy_pass http://localhost:3000; # Assumes your Next.js app runs on port 3000
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    **Remember to replace `your_domain_or_ip` with your actual domain name or VPS IP address.**

*   **Enable the Site:**
    Create a symbolic link from `sites-available` to `sites-enabled`:
    ```bash
    sudo ln -s /etc/nginx/sites-available/artisthub /etc/nginx/sites-enabled/
    ```
    (Ensure there's no default Nginx site conflicting on port 80. You might need to remove `/etc/nginx/sites-enabled/default` if it exists and is not needed.)

*   **Test Nginx Configuration:**
    ```bash
    sudo nginx -t
    ```

*   **Reload Nginx:**
    If the test is successful, reload Nginx to apply the changes:
    ```bash
    sudo systemctl reload nginx
    ```

*   **(Recommended) Set up HTTPS with Let's Encrypt:**
    Once your site is accessible via HTTP, it's highly recommended to secure it with HTTPS. You can use Certbot with Let's Encrypt to get free SSL certificates. Follow the Certbot instructions for Nginx on Ubuntu 20.04 at [https://certbot.eff.org/](https://certbot.eff.org/).

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

No license specified. Consider adding a LICENSE file to define how others can use, modify, and distribute your project. You can choose from various open-source licenses at [https://choosealicense.com/](https://choosealicense.com/).
