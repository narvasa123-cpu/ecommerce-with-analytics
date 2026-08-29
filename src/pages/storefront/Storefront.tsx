import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, ShoppingBag, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/auth';
import type { Product } from '@/types';

export default function Storefront() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .ilike('name', `%${searchQuery}%`);

      const { data, error } = await query;
      if (error) console.error('Error fetching products:', error);
      setProducts(data || []);
      setIsLoading(false);
    };

    void fetchProducts();
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="E-Commerce home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ShoppingBag size={21} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">E-Commerce</span>
              <span className="hidden text-xs text-slate-500 sm:block">Good products, simply delivered</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Account navigation">
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-blue-600 sm:px-4"
            >
              <UserRound size={17} aria-hidden="true" />
              <span>Log in</span>
            </Link>
            <Link
              to="/register"
              className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-blue-600"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Shop the collection</p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Products worth bringing home.</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Browse our latest electronics, accessories, and everyday essentials. Sign in when you’re ready to add something to your cart.
              </p>
            </div>

            <div className="relative mt-8 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} aria-hidden="true" />
              <label htmlFor="product-search" className="sr-only">Search products</label>
              <input
                id="product-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products..."
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-12 pr-4 text-base outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="products-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 id="products-heading" className="text-2xl font-bold tracking-tight">Featured products</h2>
              <p className="mt-1 text-sm text-slate-500">{products.length} product{products.length === 1 ? '' : 's'} available</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading products">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-96 animate-pulse rounded-2xl bg-slate-200" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <p className="font-semibold text-slate-800">No products found</p>
              <p className="mt-1 text-sm text-slate-500">Try a different search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : <div className="flex h-full items-center justify-center text-sm text-slate-400">No image available</div>}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">In stock: {product.stock_quantity}</p>
                    <h3 className="mt-2 min-h-14 text-lg font-bold text-slate-900">{product.name}</h3>
                    <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">{product.description}</p>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="text-xl font-bold text-slate-950">{formatCurrency(product.price)}</span>
                      <button type="button" onClick={() => navigate('/login')} className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-blue-600">
                        Buy now <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
