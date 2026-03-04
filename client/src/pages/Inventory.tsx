import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

const inventoryItems = [
    {
        product: "Wireless Mouse",
        sku: "WRLS-MSE-001",
        stock: 120,
        price: "$25.00",
    },
    {
        product: "Mechanical Keyboard",
        sku: "MECH-KBD-002",
        stock: 80,
        price: "$120.00",
    },
    {
        product: "27-inch 4K Monitor",
        sku: "4K-MON-003",
        stock: 50,
        price: "$450.00",
    },
    {
        product: "USB-C Hub",
        sku: "USBC-HUB-004",
        stock: 200,
        price: "$40.00",
    },
    {
        product: "Noise-Cancelling Headphones",
        sku: "NC-HDPN-005",
        stock: 90,
        price: "$250.00",
    },
];

export default function Inventory() {
    return (
        <div className="flex flex-col gap-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search for products..."
                    className="pl-8 sm:w-1/2"
                />
            </div>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventoryItems.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item.product}</TableCell>
                                <TableCell>{item.sku}</TableCell>
                                <TableCell>{item.stock}</TableCell>
                                <TableCell className="text-right">{item.price}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
