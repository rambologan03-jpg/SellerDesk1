import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Package, DollarSign, Download } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Mock data for demonstration
  const profitLossData = {
    totalRevenue: 125000,
    totalCost: 75000,
    totalProfit: 50000,
    profitMargin: 40,
    ordersCount: 245,
    averageOrderValue: 510,
  };

  const stateWiseData = [
    { state: "Maharashtra", orders: 65, revenue: 35000, profit: 14000, margin: 40 },
    { state: "Karnataka", orders: 45, revenue: 28000, profit: 11200, margin: 40 },
    { state: "Tamil Nadu", orders: 38, revenue: 22000, profit: 8800, margin: 40 },
    { state: "Telangana", orders: 32, revenue: 20000, profit: 8000, margin: 40 },
    { state: "Gujarat", orders: 28, revenue: 12000, profit: 4800, margin: 40 },
    { state: "Uttar Pradesh", orders: 37, revenue: 8000, profit: 3200, margin: 40 },
  ];

  const categoryWiseData = [
    { category: "Electronics", orders: 120, revenue: 60000, profit: 24000 },
    { category: "Fashion", orders: 85, revenue: 40000, profit: 16000 },
    { category: "Home & Garden", orders: 40, revenue: 25000, profit: 10000 },
  ];

  const handleDownloadReport = () => {
    toast.success("Report downloaded successfully");
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <Button variant="outline" className="gap-2" onClick={handleDownloadReport}>
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={dateRange === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("week")}
            >
              This Week
            </Button>
            <Button
              variant={dateRange === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("month")}
            >
              This Month
            </Button>
            <Button
              variant={dateRange === "quarter" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("quarter")}
            >
              This Quarter
            </Button>
            <Button
              variant={dateRange === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("year")}
            >
              This Year
            </Button>
            <Button
              variant={dateRange === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("custom")}
            >
              Custom
            </Button>
          </div>

          {dateRange === "custom" && (
            <div className="flex gap-2 mt-4">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profit & Loss Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="font-bold">₹{profitLossData.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Package className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Cost</p>
                <p className="font-bold">₹{profitLossData.totalCost.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Profit</p>
                <p className="font-bold">₹{profitLossData.totalProfit.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Profit Margin</p>
                <p className="font-bold">{profitLossData.profitMargin}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="font-bold">{profitLossData.ordersCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Order Value</p>
                <p className="font-bold">₹{profitLossData.averageOrderValue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* State-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle>State-wise Performance</CardTitle>
          <CardDescription>Revenue and profit breakdown by state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stateWiseData.map((state) => (
              <div key={state.state} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{state.state}</h3>
                  <Badge variant="outline">{state.orders} orders</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-medium">₹{state.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Profit</p>
                    <p className="font-medium text-green-600">₹{state.profit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Margin</p>
                    <p className="font-medium">{state.margin}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category-wise Performance</CardTitle>
          <CardDescription>Sales breakdown by product category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryWiseData.map((category) => (
              <div key={category.category} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{category.category}</h3>
                  <Badge variant="outline">{category.orders} orders</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-medium">₹{category.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Profit</p>
                    <p className="font-medium text-green-600">₹{category.profit.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
