import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, AlertTriangle, Package } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: inventory, isLoading, refetch } = trpc.inventory.list.useQuery({
    limit: 100,
  });

  const { data: lowStockItems } = trpc.inventory.lowStock.useQuery();

  const createInventoryMutation = trpc.inventory.create.useMutation({
    onSuccess: () => {
      toast.success("Inventory item created successfully");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create inventory item");
    },
  });

  const handleCreateInventory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createInventoryMutation.mutate({
      skuId: formData.get("skuId") as string,
      productName: formData.get("productName") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      quantity: parseInt(formData.get("quantity") as string) || 0,
      minimumStock: parseInt(formData.get("minimumStock") as string) || 10,
      maximumStock: parseInt(formData.get("maximumStock") as string) || undefined,
      costPrice: formData.get("costPrice") as string,
      sellingPrice: formData.get("sellingPrice") as string,
      unit: formData.get("unit") as string,
      barcode: formData.get("barcode") as string,
    });
  };

  const getStockStatus = (quantity: number, minimumStock: number) => {
    if (quantity <= 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    }
    if (quantity <= minimumStock) {
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    }
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const filteredInventory = inventory?.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.skuId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add SKU
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New SKU</DialogTitle>
              <DialogDescription>
                Add a new product SKU to your inventory system.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateInventory} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">SKU ID</label>
                  <Input name="skuId" placeholder="SKU-001" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Barcode</label>
                  <Input name="barcode" placeholder="123456789" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Product Name</label>
                <Input name="productName" placeholder="Product Name" required />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input name="description" placeholder="Product description" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input name="category" placeholder="Electronics" />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <Input name="unit" placeholder="piece" defaultValue="piece" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Current Qty</label>
                  <Input name="quantity" type="number" placeholder="0" defaultValue="0" />
                </div>
                <div>
                  <label className="text-sm font-medium">Min Stock</label>
                  <Input name="minimumStock" type="number" placeholder="10" defaultValue="10" />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Stock</label>
                  <Input name="maximumStock" type="number" placeholder="100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cost Price</label>
                  <Input name="costPrice" type="number" placeholder="100" step="0.01" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Selling Price</label>
                  <Input name="sellingPrice" type="number" placeholder="150" step="0.01" required />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createInventoryMutation.isPending}>
                {createInventoryMutation.isPending ? "Adding..." : "Add SKU"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems && lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Low Stock Alert</h3>
                <p className="text-sm text-yellow-800">
                  {lowStockItems.length} item(s) are running low on stock. Please reorder soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading inventory...</div>
        </div>
      ) : filteredInventory && filteredInventory.length > 0 ? (
        <div className="space-y-3">
          {filteredInventory.map((item) => {
            const stockStatus = getStockStatus(item.quantity || 0, item.minimumStock || 10);
            const profit = parseFloat(item.sellingPrice) - parseFloat(item.costPrice);
            const profitMargin = ((profit / parseFloat(item.costPrice)) * 100).toFixed(1);

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold truncate">{item.productName}</h3>
                        <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">SKU: {item.skuId}</p>
                      {item.category && (
                        <p className="text-xs text-muted-foreground mb-2">Category: {item.category}</p>
                      )}
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Stock: </span>
                          <span className="font-medium">{item.quantity} {item.unit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Min: </span>
                          <span className="font-medium">{item.minimumStock}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground">Cost Price</p>
                        <p className="font-semibold">₹{parseFloat(item.costPrice).toFixed(2)}</p>
                      </div>
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground">Selling Price</p>
                        <p className="font-semibold">₹{parseFloat(item.sellingPrice).toFixed(2)}</p>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Margin: </span>
                        <span className="font-medium text-green-600">{profitMargin}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 text-center pb-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No inventory items found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
