# E-Commerce Analytics and Management System

A production-ready e-commerce platform with role-based access control, real-time order management, inventory tracking, and comprehensive analytics.

## Technology Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Authorization:** PostgreSQL Row Level Security (RLS)
- **Routing:** React Router v6
- **Charts:** Recharts
- **Icons:** Lucide React

## Project Structure

```
ecom/
├── src/
│   ├── components/          # Reusable components
│   │   ├── layouts/         # Layout components for each role
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   ├── TopBar.tsx       # User menu and notifications
│   │   └── ProtectedRoute.tsx
│   ├── pages/               # Page components
│   │   ├── auth/            # Login, Register
│   │   ├── customer/        # Customer portal pages
│   │   ├── staff/           # Staff portal pages
│   │   ├── rider/           # Rider portal pages
│   │   └── admin/           # Admin portal pages
│   ├── services/            # API/Database service layer (TBD)
│   ├── hooks/               # Custom React hooks (TBD)
│   ├── lib/                 # Utilities and configurations
│   │   ├── supabase.ts      # Supabase client
│   │   └── auth.ts          # Auth utilities
│   ├── types/               # TypeScript interfaces
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── supabase/
│   └── migrations/          # SQL migrations
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_seed_data.sql
├── public/                  # Static assets
├── .env.example             # Environment variables template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies

```

## Setup Instructions

### 1. Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account (free tier available at https://supabase.com)
- Git (optional, for version control)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. In your project settings, get:
   - Project URL
   - Anon Key (public key)
3. Run the migrations:
   - Go to SQL Editor in Supabase
   - Copy content from `supabase/migrations/001_initial_schema.sql`
   - Run the query
   - Repeat for `002_rls_policies.sql`
   - Repeat for `003_seed_data.sql`

### 5. Create Test Users

In Supabase Auth, create these test accounts:

**Admin Account:**
- Email: admin@example.com
- Password: Password123!

**Staff Account:**
- Email: staff@example.com
- Password: Password123!

**Rider Account:**
- Email: rider@example.com
- Password: Password123!

**Customer Account:**
- Email: customer@example.com
- Password: Password123!

Then, insert corresponding profiles in the `profiles` table:

```sql
INSERT INTO profiles (id, full_name, email, role) 
SELECT id, 'Alex Santos', email, 'ADMIN' FROM auth.users WHERE email = 'admin@example.com';
INSERT INTO profiles (id, full_name, email, role) 
SELECT id, 'Maria Cruz', email, 'STAFF' FROM auth.users WHERE email = 'staff@example.com';
INSERT INTO profiles (id, full_name, email, role) 
SELECT id, 'Juan Dela Cruz', email, 'RIDER' FROM auth.users WHERE email = 'rider@example.com';
INSERT INTO profiles (id, full_name, email, role) 
SELECT id, 'Daniel Reyes', email, 'CUSTOMER' FROM auth.users WHERE email = 'customer@example.com';
```

### 6. Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

## User Roles and Permissions

### CUSTOMER
- Browse products and categories
- Search and filter products
- Add products to cart
- Checkout and place orders
- View order history and status
- Track deliveries
- Review products
- Manage profile and addresses

### STAFF
- View and manage products
- Manage categories
- Manage inventory and stock levels
- Process orders
- Assign riders to deliveries
- View customer information
- Monitor low stock alerts
- Operational dashboard

### RIDER
- View assigned deliveries
- Accept or decline deliveries
- Update delivery status
- Track delivery performance
- View delivery history
- Manage availability status

### ADMIN
- Full system access
- View comprehensive analytics and reports
- Manage all users and roles
- System configuration
- Audit logs
- Generate reports (PDF/CSV export)

## Key Features

### 1. Authentication & Authorization
- Supabase Auth for secure authentication
- Role-based access control
- PostgreSQL Row Level Security (RLS)
- Protected routes

### 2. Product Management
- Catalog with categories
- Inventory tracking
- Product search and filtering
- Stock alerts and monitoring

### 3. Order Management
- Shopping cart
- Checkout process
- Order status tracking
- Order history
- Order confirmation and notifications

### 4. Delivery Management
- Rider assignment
- Real-time delivery tracking
- Delivery status updates
- Performance analytics

### 5. Analytics & Reporting
- Sales analytics
- Customer analytics
- Product performance
- Cart abandonment tracking
- Rider performance metrics
- Custom reports (PDF/CSV)

### 6. Notifications
- Real-time order updates
- Delivery notifications
- Low-stock alerts
- System notifications

## API Endpoints (Supabase Functions)

These are implemented as PostgreSQL queries through Supabase client:

- `GET /products` - List products
- `GET /products/:id` - Get product details
- `GET /orders` - List user orders
- `POST /orders` - Create new order
- `GET /cart` - Get user cart
- `POST /cart/items` - Add to cart
- `DELETE /cart/items/:id` - Remove from cart

## Database Schema

### Main Tables
- `profiles` - User information and roles
- `categories` - Product categories
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Items in orders
- `carts` - Shopping carts
- `cart_items` - Items in carts
- `deliveries` - Delivery tracking
- `inventory_transactions` - Stock movements
- `notifications` - User notifications
- `audit_logs` - System audit trail

See `supabase/migrations/001_initial_schema.sql` for complete schema.

## Security Considerations

1. **Authentication:** Supabase Auth handles password security
2. **Authorization:** PostgreSQL RLS enforces row-level access control
3. **API Security:** All database operations go through RLS policies
4. **Environment Variables:** Sensitive keys stored in `.env` (never committed)
5. **HTTPS:** Always use HTTPS in production
6. **Role Verification:** Roles verified server-side via RLS

## Testing Scenarios

### Customer Flow
1. Register → Login → Browse products → Add to cart → Checkout → Track order → Review

### Staff Flow
1. Login → Process pending orders → Update inventory → Assign rider → View analytics

### Rider Flow
1. Login → View assigned deliveries → Accept delivery → Update status → Complete

### Admin Flow
1. Login → View analytics → Generate reports → Manage users → View audit logs

## Performance Optimization

- Pagination for large datasets
- Indexed database queries
- Lazy loading of components
- Optimized images
- Efficient Supabase queries
- Client-side caching (when appropriate)

## Troubleshooting

### Authentication Issues
- Ensure Supabase credentials are correct in `.env`
- Check that user accounts exist in Supabase Auth
- Verify that profiles exist for each user

### Database Connection Issues
- Verify VITE_SUPABASE_URL is correct
- Check network connectivity
- Ensure RLS policies are properly configured

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `npm run build -- --force`

## Development Commands

```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint (if configured)
npm run type-check  # Run TypeScript type checking
```

## Contributing

1. Create a new branch for features: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Create a pull request

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the Supabase documentation: https://supabase.com/docs
3. Check the React Router documentation: https://reactrouter.com
4. Review TypeScript documentation: https://www.typescriptlang.org/docs

## Next Steps

The project is in initial setup phase. Key areas for development:

1. **Core Services** - Implement service layer for all database operations
2. **Shopping Cart** - Complete cart functionality with CRUD operations
3. **Checkout** - Implement complete checkout flow
4. **Order Management** - Complete order processing system
5. **Analytics** - Build comprehensive analytics dashboards
6. **Notifications** - Implement real-time notifications
7. **Testing** - Write unit and integration tests
8. **Documentation** - Expand API documentation

See the TODO list in the project for detailed implementation roadmap.
