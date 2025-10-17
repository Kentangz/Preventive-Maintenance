# Preventive Maintenance System

## Instalasi & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd "Preventive Maintenance/Web"
```

### 2. Backend Setup (Laravel)

#### Install Dependencies

```bash
composer install
```

#### Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

#### Database Configuration

Edit `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=preventive_maintenance
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

#### Database Migration & Seeding

```bash
php artisan migrate
php artisan db:seed
```

#### Storage Link

```bash
php artisan storage:link
```

#### Start Laravel Server

```bash
php artisan serve
```

Running in `http://localhost:8000`

### 3. Frontend Setup 

#### Navigate to Frontend Directory

```bash
cd frontend
```

#### Install Dependencies

```bash
npm install
```

#### Environment Configuration

Create `.env` file di folder `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_STORAGE_BASE_URL=http://localhost:8000
```

#### Start Frontend Development Server

```bash
npm run dev
```

Running in `http://localhost:5173`

## Demo Account

### Admin Account

-   **Email**: `admin@maintenance.com`
-   **Password**: `admin123`

## License

This project is proprietary software.
