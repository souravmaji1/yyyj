  import React from 'react';
  import { KioskProduct } from '../../store/slices/productSlice';
  import { useRouter } from 'next/navigation';
  import { Button } from '../ui/button';
  import { useNotificationUtils } from '@/src/core/utils/notificationUtils';
  import { useDispatch, useSelector } from 'react-redux';
  import { addToKioskCart } from '../../store/slices/kioskCartSlice';
  import { useCartNotification } from '@/src/hooks/useCartNotification';
  import { RootState } from '../../store';
  import { Icons } from '@/src/core/icons';

  interface KioskProductCardProps {
    product: KioskProduct;
  }

  const KioskProductCard: React.FC<KioskProductCardProps> = ({ product }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { showSuccess, showError, showInfo } = useNotificationUtils();
    const { showCartNotification } = useCartNotification();
    
    // Get current cart items to check if this product is already in cart
    const currentCartItems = useSelector((state: RootState) => state.kioskCart.items);

    // Calculate total stock from all machine slots
    const totalStock = product.machineSlots?.reduce((sum, slot) => sum + (slot.stock || 0), 0) || 0;
    let stockStatus = null;
    if (totalStock === 0) {
      stockStatus = <span className="bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold ml-2">Out of Stock</span>;
    } else if (totalStock < 10) {
      stockStatus = <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-semibold ml-2">Low Stock</span>;
    }

    // Check if product.image is a video
    const isImageVideo = product.image?.match(/\.(mp4|webm|ogg|mov|avi)$/i);

    const handleAddToCart = async () => {
      try {
        // Check if this product is already in cart
        const isProductInCart = currentCartItems.some(item => item.productId === product.id);
        const hasOtherProducts = currentCartItems.length > 0 && !isProductInCart;
        
        // Create kiosk cart item
        const kioskCartItem = {
          productId: product.id,
          name: product.name,
          price: product.price,
          tokenPrice: product.tokenPrice || product.price, // Use tokenPrice if available, fallback to price
          image: product.image,
          description: product.description,
          quantity: 1,
          totalStock: totalStock,
          tags: product.tags,
        };

        console.log('Adding to kiosk cart:', kioskCartItem); // Debug log
        dispatch(addToKioskCart(kioskCartItem));

        // Show cart notification
        showCartNotification({
          title: product.name,
          image: product.image,
          price: Number(product.price),
          tokenPrice: product.tokenPrice ? Number(product.tokenPrice) : Number(product.price),
          quantity: 1
        });

        // Show appropriate message based on cart state
        if (hasOtherProducts) {
          showSuccess('Cart Updated', `${product.name} has replaced the previous item in your kiosk cart`);
        } else if (isProductInCart) {
          showSuccess('Quantity Updated', `${product.name} quantity has been increased in your kiosk cart`);
        } else {
          showSuccess('Added to Kiosk Cart', `${product.name} has been added to your kiosk cart ${totalStock} items left in stock,now you are redirected to kiosk checkout page `);
        
        }

    
        // Redirect to kiosk cart after adding item
        setTimeout(() => {
          router.push('/kiosk-cart');
        }, 1000);
      } catch (error) {
        console.error('Error adding kiosk product to cart:', error);
        showError('Add to Cart Failed', 'Failed to add item to kiosk cart. Please try again.');
      }
    };

    return (
      <div className="bg-[var(--color-surface)] rounded-lg overflow-hidden border border-gray-700 flex flex-col">
        <div className="relative w-full h-48 overflow-hidden">
          {isImageVideo ? (
            <video
              src={product.image || ''}
              className="w-full h-full object-cover"
              controls
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
              style={{ backgroundColor: '#000' }}
              onError={(e) => {
                console.error('Video failed to load:', product.image);
                e.currentTarget.style.display = 'none';
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', product.image);
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          {isImageVideo && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center">
              <Icons.play className="w-3 h-3 mr-1" />
              Video
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-white font-bold text-lg mb-2 flex items-center">
            {product.name}
            {stockStatus}
          </h3>
          <div className="text-gray-400 mb-2" dangerouslySetInnerHTML={{ __html: product.description }} />
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-400 font-semibold">
              {product.tokenPrice ? product.tokenPrice : product.price} XUT
            </span>
            <span className="text-gray-400 text-sm">Qty: {totalStock}</span>
          </div>
          {product.tokenPrice && (
            <div className="text-gray-400 text-xs mb-2">
              ${product.price} USD
            </div>
          )}
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.map((tag) => (
              <span key={tag} className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs">{tag}</span>
            ))}
          </div>
          <div className="mt-auto">
            <Button
              className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white"
              onClick={handleAddToCart}
              disabled={totalStock === 0}
            >
              {totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  export default KioskProductCard; 