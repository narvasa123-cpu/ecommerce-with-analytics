# Quick Reference Guide

## Getting Started

```bash
# Install and run
npm install
npm run dev

# Environment setup
cp .env.example .env
# Edit .env with Supabase credentials
```

## Project Structure

```
src/
├── components/    # Reusable components
├── pages/         # Page components by role
├── services/      # Database operations (to implement)
├── lib/           # Utilities and config
├── types/         # TypeScript interfaces
├── App.tsx        # Main routing
└── main.tsx       # Entry point
```

## Authentication

### Roles
- `CUSTOMER` - Shopping, orders
- `STAFF` - Operations
- `RIDER` - Deliveries
- `ADMIN` - System management

### Login
```typescript
import { supabase } from '@/lib/supabase';

const { error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});
```

### Register
```typescript
const { error } = await supabase.auth.signUp({
  email: 'newuser@example.com',
  password: 'password',
});
```

## Database Operations

### Query Data
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true);
```

### Insert Data
```typescript
const { data, error } = await supabase
  .from('products')
  .insert([{ name: 'Product', price: 100 }])
  .select();
```

### Update Data
```typescript
const { data, error } = await supabase
  .from('products')
  .update({ price: 200 })
  .eq('id', productId);
```

### Delete Data
```typescript
const { data, error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId);
```

## Common Patterns

### Fetch Data in Component
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    const { data } = await supabase
      .from('table')
      .select('*');
    setData(data || []);
    setLoading(false);
  };
  fetchData();
}, []);

return loading ? <div>Loading...</div> : <div>{data.map(...)}</div>;
```

### Handle Form Submission
```typescript
const [error, setError] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const { error } = await supabase
      .from('table')
      .insert([{ name: value }]);
    if (error) throw error;
    // Success
  } catch (err) {
    setError(err.message);
  }
};
```

### Format Values
```typescript
import { formatCurrency, formatDate } from '@/lib/auth';

<p>{formatCurrency(1500)}</p>      // ₱1,500.00
<p>{formatDate('2024-01-01')}</p>  // January 1, 2024
```

## Styling

### Tailwind Classes
```typescript
// Colors
<div className="bg-blue-600 text-white">Blue</div>
<div className="bg-green-600">Green</div>
<div className="bg-red-600">Red</div>

// Layout
<div className="flex justify-between items-center">
<div className="grid grid-cols-3 gap-4">

// Spacing
<div className="p-4 m-2">

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
```

## Components

### Page Layout
```typescript
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div>
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### Loading State
```typescript
{isLoading && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>}
```

### Empty State
```typescript
{items.length === 0 && (
  <div className="text-center py-12">
    <p className="text-gray-600">No items found</p>
  </div>
)}
```

### Error State
```typescript
{error && (
  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
    {error}
  </div>
)}
```

## Routing

### Protected Route
```typescript
<Route
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route path="/admin" element={<Dashboard />} />
</Route>
```

### Navigation
```typescript
import { Link, useNavigate } from 'react-router-dom';

<Link to="/products">Products</Link>

const navigate = useNavigate();
navigate('/dashboard');
```

## Types

```typescript
import type { Profile, Order, Product } from '@/types';

const user: Profile = { id: '...', role: 'CUSTOMER', ... };
const order: Order = { id: '...', total: 100, ... };
```

## Environment Variables

```
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
```

## Useful Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run preview      # Preview production build
npm run type-check   # TypeScript checking
```

## Testing Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | Password123! | ADMIN |
| staff@example.com | Password123! | STAFF |
| rider@example.com | Password123! | RIDER |
| customer@example.com | Password123! | CUSTOMER |

## Documentation

- `README.md` - Overview
- `DEVELOPMENT.md` - Detailed guide
- `SUPABASE_SETUP.md` - Database setup
- `COMPLETION_REPORT.md` - Project status

## Common Issues

### Can't login
- Check credentials in .env
- Verify user exists in Supabase Auth
- Check profile exists in database

### RLS blocking access
- Check RLS policies are correct
- Verify user role in profiles table
- Test SQL manually in Supabase

### Database connection fails
- Verify VITE_SUPABASE_URL is correct
- Check internet connection
- Try clearing browser cache

## Links

- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)
- [Tailwind](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

## Quick Checklist

New Developer Onboarding:

- [ ] Clone/download project
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Add Supabase credentials
- [ ] Run Supabase migrations
- [ ] Create test users
- [ ] Run `npm run dev`
- [ ] Test login with all roles
- [ ] Read DEVELOPMENT.md
- [ ] Review service layer patterns
- [ ] Start implementing features

---

For detailed patterns and best practices, see DEVELOPMENT.md
