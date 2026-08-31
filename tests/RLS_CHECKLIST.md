# RLS verification checklist

Run these checks with test accounts for each role after applying migrations 005-009.

| Surface | CUSTOMER | STAFF | RIDER | ADMIN |
| --- | --- | --- | --- | --- |
| Active products/categories read | yes | yes | public products only | yes |
| Own cart/cart items | own only | no | no | read all |
| Own orders/order items/history | own only | read/update via RPC | no | all |
| Delivery records | own order only | read/manage | assigned rider only | all |
| Inventory transactions | no | read/adjust via RPC | no | all |
| Notifications | own only | own only | own only | all |
| Analytics RPCs | no | yes | no | yes |

Expected negative tests:

1. A customer cannot select another customer's order, cart, notification, or address.
2. A rider cannot read or update another rider's delivery.
3. A customer cannot call analytics or inventory functions.
4. Direct order status updates fail; `transition_order_status` is required.
5. Checkout with insufficient stock rolls back order, stock, cart, and notification changes.
