import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

export default function CustomerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const addToCart = async (product: Product) => {
    setMessage('');
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    let { data: cart } = await supabase.from('carts').select('id').eq('user_id', auth.user.id).eq('status', 'ACTIVE').maybeSingle();
    if (!cart) {
      const result = await supabase.from('carts').insert({ user_id: auth.user.id, status: 'ACTIVE' }).select('id').single();
      if (result.error) { setMessage(result.error.message); return; }
      cart = result.data;
    }
    const { data: existing } = await supabase.from('cart_items').select('id,quantity').eq('cart_id', cart.id).eq('product_id', product.id).maybeSingle();
    const nextQuantity = (existing?.quantity ?? 0) + 1;
    if (nextQuantity > product.stock_quantity) { setMessage(`Only ${product.stock_quantity} ${product.name} available.`); return; }
    const result = existing
      ? await supabase.from('cart_items').update({ quantity: nextQuantity, price_at_time: product.price }).eq('id', existing.id)
      : await supabase.from('cart_items').insert({ cart_id: cart.id, product_id: product.id, quantity: 1, price_at_time: product.price });
    if (result.error) setMessage(result.error.message); else { setMessage(`${product.name} added to cart.`); setTimeout(() => setMessage(''), 2500); }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        const { data } = await query;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{message}</div>}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-1">Browse our products</p>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">No products found</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">No image</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </p>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      product.stock_quantity > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <button disabled={product.stock_quantity === 0} onClick={() => void addToCart(product)} className="mt-4 min-h-11 w-full rounded-xl bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                  {product.stock_quantity === 0 ? 'Out of stock' : 'Add to cart'}
                </button>
                <button onClick={() => navigate(`/customer/products/${product.id}`)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">View details</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
