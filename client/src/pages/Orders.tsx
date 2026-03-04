import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, AlertCircle, Package } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Orders() {
  const [status, setStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: orders, isLoading, refetch } = trpc.orders.list.useQuery({
    status: status || undefined,
    limit: 50,
  });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success("Order created successfully");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        toast.error("Duplicate order detected! Similar order found recently.");
      } else {
        toast.error(error.message || "Failed to create order");
      }
    },
  });

  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const customerId = formData.get("customerId") as string;
    const totalAmount = parseFloat(formData.get("totalAmount") as string);

    // Check for duplicate before creating
    setCheckingDuplicate(true);
    try {
      const utils = trpc.useUtils();
      const duplicateCheck = await utils.orders.checkDuplicate.fetch({
        customerId,
        totalAmount,
        timeWindowMinutes: 60,
      });

      if (duplicateCheck.isDuplicate) {
        toast.warning(
          `Duplicate order detected! Order #${duplicateCheck.order?.orderId} found at ${new Date(duplicateCheck.order?.createdAt || "").toLocaleString()}`
        );
        return;
      }
    } finally {
      setCheckingDuplicate(false);
    }

    createOrderMutation.mutate({
      orderId: formData.get("orderId") as string,
      customerId,
      customerName: formData.get("customerName") as string,
      customerEmail: formData.get("customerEmail") as string,
      customerPhone: formData.get("customerPhone") as string,
      totalAmount: totalAmount.toString(),
      netAmount: totalAmount.toString(),
      status: "pending",
      state: formData.get("state") as string,
      city: formData.get("city") as string,
      pincode: formData.get("pincode") as string,
      shippingAddress: formData.get("shippingAddress") as string,
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      returned: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredOrders = orders?.filter((order) =>
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                Add a new order to your system. Duplicate orders will be detected automatically.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Order ID</label>
                  <Input name="orderId" placeholder="ORD-001" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Customer ID</label>
                  <Input name="customerId" placeholder="CUST-001" required />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Customer Name</label>
                <Input name="customerName" placeholder="John Doe" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input name="customerEmail" type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input name="customerPhone" placeholder="+91 9876543210" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Shipping Address</label>
                <Input name="shippingAddress" placeholder="123 Main St" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input name="state" placeholder="Maharashtra" />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input name="city" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="text-sm font-medium">Pincode</label>
                  <Input name="pincode" placeholder="400001" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Total Amount</label>
                <Input name="totalAmount" type="number" placeholder="1000" step="0.01" required />
              </div>

              <Button type="submit" className="w-full" disabled={createOrderMutation.isPending}>
                {createOrderMutation.isPending ? "Creating..." : "Create Order"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading orders...</div>
        </div>
      ) : filteredOrders && filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold truncate">Order #{order.orderId}</h3>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      {order.isDuplicate && (
                        <Badge variant="destructive" className="flex gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Duplicate
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.state && `${order.state}, `}
                      {order.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">₹{parseFloat(order.netAmount).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 text-center pb-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

