# Development Guide

This guide explains how to implement features in the E-Commerce Management System.

## Project Architecture

The project follows a layered architecture:

```
View Layer (React Components)
    ↓
Service Layer (Database Operations)
    ↓
Supabase Client (RLS Enforcement)
    ↓
PostgreSQL + RLS Policies
```

## Creating a New Feature

### Step 1: Create TypeScript Types

If your feature needs new types, add them to `src/types/index.ts`:

```typescript
export interface MyEntity {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
```

### Step 2: Create Service Functions

Add functions to `src/services/` (create a new file if needed):

```typescript
// src/services/myFeatureService.ts
import { supabase } from '@/lib/supabase';

export const myFeatureService = {
  async getAll() {
    const { data, error } = await supabase
      .from('my_table')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async create(item: any) {
    const { data, error } = await supabase
      .from('my_table')
      .insert([item])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};
```

### Step 3: Create React Components

Create components that use the services:

```typescript
// src/pages/MyFeature.tsx
import { useEffect, useState } from 'react';
import { myFeatureService } from '@/services/myFeatureService';

export default function MyFeature() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await myFeatureService.getAll();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

## Working with Authentication

### Get Current User

```typescript
import { getCurrentUser } from '@/lib/auth';

const user = await getCurrentUser();
if (user?.role === 'ADMIN') {
  // Admin logic
}
```

### Check Permissions

```typescript
import { isUserAdmin, isUserStaff } from '@/lib/auth';

const isAdmin = await isUserAdmin();
const isStaff = await isUserStaff();
```

## Database Operations Best Practices

### 1. Always Handle Errors

```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');
  
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Operation failed:', error);
  throw error;
}
```

### 2. Validate Data Before Sending

```typescript
// Always validate input
if (!productId || productId.length === 0) {
  throw new Error('Product ID is required');
}

if (price < 0) {
  throw new Error('Price cannot be negative');
}

// Send to database
const { data, error } = await supabase
  .from('products')
  .update({ price })
  .eq('id', productId);
```

### 3. Use Specific Queries

```typescript
// ✗ Bad - fetches all columns
const { data } = await supabase
  .from('orders')
  .select('*');

// ✓ Good - only fetch needed columns
const { data } = await supabase
  .from('orders')
  .select('id, order_number, total, status');
```

### 4. Use Pagination

```typescript
const limit = 20;
const offset = (page - 1) * limit;

const { data } = await supabase
  .from('products')
  .select('*')
  .range(offset, offset + limit - 1);
```

## Styling Guidelines

### Using Tailwind CSS

```typescript
<div className="p-4 bg-white rounded-lg shadow">
  <h2 className="text-lg font-semibold text-gray-900">Title</h2>
  <p className="text-gray-600 mt-2">Content</p>
</div>
```

### Color System

- Primary: `bg-blue-600`, `text-blue-600`
- Secondary: `bg-purple-600`, `text-purple-600`
- Success: `bg-green-600`, `text-green-600`
- Danger: `bg-red-600`, `text-red-600`
- Warning: `bg-yellow-600`, `text-yellow-600`
- Info: `bg-blue-600`, `text-blue-600`

## Form Validation

### Using Zod (Already installed)

```typescript
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
});

// Validate
const validated = ProductSchema.parse(formData);
```

## Error Handling

### Display User-Friendly Messages

```typescript
const [error, setError] = useState<string | null>(null);

try {
  await someOperation();
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  setError(message);
}

return (
  <>
    {error && (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
        {error}
      </div>
    )}
  </>
);
```

## Loading and Empty States

### Loading State

```typescript
{isLoading && (
  <div className="flex items-center justify-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)}
```

### Empty State

```typescript
{items.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-gray-600">No items found</p>
    <button className="mt-4 text-blue-600 hover:underline">
      Create one now
    </button>
  </div>
) : (
  // Render items
)}
```

## Working with Real-Time Data

### Subscribe to Changes

```typescript
useEffect(() => {
  const subscription = supabase
    .from('orders')
    .on('*', (payload) => {
      console.log('Change received!', payload);
      // Update local state
      setOrders(prevOrders => [...prevOrders, payload.new]);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Common Patterns

### Loading and Fetching Data

```typescript
const [data, setData] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await myService.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, [dependencies]);
```

### CRUD Operations

```typescript
// Create
const handleCreate = async (newItem) => {
  try {
    const result = await myService.create(newItem);
    setItems([...items, result]);
  } catch (err) {
    setError(err);
  }
};

// Update
const handleUpdate = async (id, updates) => {
  try {
    await myService.update(id, updates);
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  } catch (err) {
    setError(err);
  }
};

// Delete
const handleDelete = async (id) => {
  try {
    await myService.delete(id);
    setItems(items.filter(item => item.id !== id));
  } catch (err) {
    setError(err);
  }
};
```

## Testing

### Test Checklist for New Features

- [ ] Feature works for authorized users
- [ ] Feature is blocked for unauthorized users (RLS)
- [ ] Error messages are user-friendly
- [ ] Loading states display correctly
- [ ] Empty states display correctly
- [ ] Data persists in database
- [ ] Forms validate input correctly
- [ ] Mobile responsive design works
- [ ] No console errors

### Manual Testing Commands

```bash
# Start dev server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build
```

## Debugging Tips

### Check Network Requests
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by XHR/Fetch
4. Look for Supabase API requests

### Check Console Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages and stack traces

### Enable Supabase Logs
```typescript
import { supabase } from '@/lib/supabase';

// Enable detailed logging
supabase.on('*', (payload) => {
  console.log('Supabase event:', payload);
});
```

## Performance Tips

1. **Use Pagination** - Don't fetch all rows at once
2. **Lazy Load** - Load data only when needed
3. **Memoize** - Use useMemo for expensive calculations
4. **Debounce Search** - Wait before querying on search input
5. **Optimize Images** - Use appropriately sized images
6. **Minimize Re-renders** - Use useCallback for event handlers

## Code Style

- Use TypeScript types for all function parameters
- Use descriptive variable names
- Add comments for complex logic
- Keep components small and focused
- Use utility functions from `@/lib/auth`
- Follow Tailwind CSS conventions

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
