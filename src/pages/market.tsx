import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShoppingCart, Star, Filter, Search, User, Phone, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import bpMonitorImage from "@assets/file_00000000eb2861f7a88b234c61fed5f0_1751151148477.png";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  description: string;
  badge: string;
  link: string;
}

export default function Market() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    phone: "",
    address: ""
  });

  const products: Product[] = [
    {
      id: 1,
      name: "Smart Blood Pressure Monitor",
      price: 56000,
      originalPrice: 65000,
      category: "medical",
      image: bpMonitorImage,
      description: "Advanced digital BP monitor with Bluetooth and Wi-fi connectivity",
      badge: "BESTSELLER",
      link: "https://presibo.com/market/product-01.html"
    },
    {
      id: 2,
      name: "Digital Glucometer Kit",
      price: 65000,
      originalPrice: 75000,
      category: "medical",
      image: "https://presibo-wl.vercel.app/photos/glucometer.jpg",
      description: "Accurate blood glucose monitoring system with Bluetooth and Wi-fi connectivity",
      badge: "POPULAR",
      link: "https://presibo.com/market/product-02.html"
    },
    {
      id: 3,
      name: "Smart Heart Rate Monitor",
      price: 42500,
      originalPrice: 50000,
      category: "medical",
      image: "https://presibo-wl.vercel.app/photos/heart-monitor.jpg",
      description: "Continuous heart rate tracking device with Bluetooth and Wi-Fi connectivity",
      badge: "NEW",
      link: "https://presibo.com/market/product-03.html"
    },
    {
      id: 4,
      name: "Digital Thermometer Pro",
      price: 15000,
      originalPrice: 18000,
      category: "medical",
      image: "https://presibo-wl.vercel.app/photos/thermometer.jpg",
      description: "Instant digital thermometer with memory function and fever alert",
      badge: "",
      link: "https://presibo.com/market/product-04.html"
    },
    {
      id: 5,
      name: "Pulse Oximeter",
      price: 25000,
      originalPrice: 30000,
      category: "medical",
      image: "https://presibo-wl.vercel.app/photos/pulse-oximeter.jpg",
      description: "Fingertip pulse oximeter for oxygen saturation and pulse rate monitoring",
      badge: "ESSENTIAL",
      link: "https://presibo.com/market/product-05.html"
    },
    {
      id: 6,
      name: "Smart Scale with BMI",
      price: 35000,
      originalPrice: 40000,
      category: "wellness",
      image: "https://presibo-wl.vercel.app/photos/smart-scale.jpg",
      description: "Bluetooth-enabled smart scale with BMI, body fat, and muscle mass analysis",
      badge: "",
      link: "https://presibo.com/market/product-06.html"
    }
  ];

  const categories = [
    { id: "all", name: "All Products" },
    { id: "medical", name: "Medical Devices" },
    { id: "wellness", name: "Wellness" },
    { id: "fitness", name: "Fitness" }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handlePurchase = (product: Product) => {
    setSelectedProduct(product);
    setShowCheckout(true);
  };

  const handleCheckout = async () => {
    if (!selectedProduct || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting checkout process:', {
      product: selectedProduct.name,
      email: customerInfo.email,
      amount: selectedProduct.price
    });

    try {
      // Create order and get Paystack checkout URL
      const response = await fetch('/api/market/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          amount: selectedProduct.price,
          description: selectedProduct.description,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address
        }),
      });

      console.log('Purchase response status:', response.status);
      const data = await response.json();
      console.log('Purchase response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      if (data.authorization_url) {
        // Close modal before redirecting
        setShowCheckout(false);
        setSelectedProduct(null);
        setCustomerInfo({ email: "", phone: "", address: "" });
        
        // Redirect to Paystack checkout
        window.location.href = data.authorization_url;
      } else {
        throw new Error('No authorization URL received');
      }
      
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Error",
        description: error.message || "Unable to process purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "BESTSELLER": return "bg-yellow-500 text-white";
      case "POPULAR": return "bg-blue-500 text-white";
      case "NEW": return "bg-green-500 text-white";
      case "ESSENTIAL": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/auth')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Presibo HealthCarte</h1>
          <p className="text-gray-600">Premium Healthcare Marketplace</p>
        </div>
      </div>

      {/* Hero Section */}
      <Card className="mb-8 bg-gradient-to-r from-naija-green to-green-600 text-white border-0">
        <CardContent className="p-8">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-black"/>
            <h2 className="text-3xl font-bold mb-4">
              Premium Healthcare Products
            </h2>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto text-black">
              Discover our curated collection of medical devices and wellness products. 
              Quality healthcare tools delivered to your doorstep across Nigeria.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              <Filter className="w-4 h-4 mr-2" />
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://presibo-wl.vercel.app/photos/medical-device.jpg";
                }}
              />
              {product.badge && (
                <Badge className={`absolute top-2 right-2 ${getBadgeColor(product.badge)}`}>
                  {product.badge}
                </Badge>
              )}
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-naija-green">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8) 127 reviews</span>
              </div>
              
              <Button 
                onClick={() => handlePurchase(product)}
                className="w-full bg-naija-green hover:bg-green-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Footer Info */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-sm text-gray-600">On orders over ₦50,000</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-sm text-gray-600">Authentic medical devices only</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600">Expert healthcare assistance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={(open) => {
        setShowCheckout(open);
        if (!open) {
          setSelectedProduct(null);
          setCustomerInfo({ email: "", phone: "", address: "" });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Please provide your details to proceed with the purchase of {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedProduct && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://presibo-wl.vercel.app/photos/medical-device.jpg";
                    }}
                  />
                  <div>
                    <h4 className="font-semibold">{selectedProduct.name}</h4>
                    <p className="text-2xl font-bold text-naija-green">
                      {formatPrice(selectedProduct.price)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+234 xxx xxx xxxx"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Delivery Address *
                </Label>
                <Input
                  id="address"
                  placeholder="Your full delivery address"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCheckout(false);
                  setSelectedProduct(null);
                  setCustomerInfo({ email: "", phone: "", address: "" });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCheckout}
                className="flex-1 bg-naija-green hover:bg-green-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Proceed to Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}