import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Zap,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const quickStats = [
    {
      title: "Today's Orders",
      value: "12",
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-600",
      href: "/orders",
    },
    {
      title: "Low Stock Items",
      value: "3",
      icon: AlertCircle,
      color: "bg-yellow-100 text-yellow-600",
      href: "/inventory",
    },
    {
      title: "Open Tickets",
      value: "2",
      icon: MessageSquare,
      color: "bg-purple-100 text-purple-600",
      href: "/tickets",
    },
    {
      title: "This Month Revenue",
      value: "₹125K",
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
      href: "/reports",
    },
  ];

  const recentOrders = [
    {
      id: 1,
      orderId: "ORD-2024-001",
      customer: "Rajesh Kumar",
      amount: "₹2,500",
      status: "shipped",
    },
    {
      id: 2,
      orderId: "ORD-2024-002",
      customer: "Priya Singh",
      amount: "₹1,800",
      status: "confirmed",
    },
    {
      id: 3,
      orderId: "ORD-2024-003",
      customer: "Amit Patel",
      amount: "₹3,200",
      status: "pending",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-sm opacity-90">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.href} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-start gap-3">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="w-full">
                      <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Link href="/orders">
              <Button variant="outline" className="w-full justify-start gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">New Order</span>
              </Button>
            </Link>
            <Link href="/inventory">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Add SKU</span>
              </Button>
            </Link>
            <Link href="/tickets">
              <Button variant="outline" className="w-full justify-start gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">New Ticket</span>
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" className="w-full justify-start gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">View Reports</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from your store</CardDescription>
            </div>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{order.orderId}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">{order.amount}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
          <CardDescription>Everything you need to manage your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <ShoppingCart className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium">Order Management</h4>
                <p className="text-sm text-muted-foreground">
                  Create, track, and manage all your orders with duplicate detection
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Package className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium">Inventory Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor stock levels and get alerts for low inventory items
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium">Analytics & Reports</h4>
                <p className="text-sm text-muted-foreground">
                  View profit/loss and state-wise performance reports
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium">Support Tickets</h4>
                <p className="text-sm text-muted-foreground">
                  Manage customer queries and support requests efficiently
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Support Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium">Offline Support</h4>
              <p className="text-sm text-muted-foreground">
                SellerDesk works offline! Your data will sync automatically when you're back online.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
