"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import AddItemModal from "@/components/shared/AddItemModal";
import api from "@/lib/api";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

// Shadcn UI Component Imports
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Type definition for an item
type Item = {
  id: string;
  title: string;
  item_type: string;
  content: string;
  tags: string[];
};

export default function DashboardPage() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);

  // State for all user controls
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // This effect re-fetches data whenever any control value changes
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const params = new URLSearchParams();
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        if (filterType !== 'all') params.append('type', filterType);
        if (sortBy) params.append('sort', sortBy);
        
        const response = await api.get(`/items/?${params.toString()}`);
        setItems(response.data);
      } catch (error) {
        console.error("Failed to fetch items:", error);
        toast.error("Could not fetch your items. Please try again later.");
      }
    };

    fetchItems();
  }, [debouncedSearchTerm, filterType, sortBy]);

  // Handles UI updates after creating or editing an item
  const handleSuccess = (item: Item) => {
    const itemExists = items.find(i => i.id === item.id);
    if (itemExists) {
      setItems(items.map(i => (i.id === item.id ? item : i)));
    } else {
      setItems(prevItems => [...prevItems, item]);
    }
  };
  
  // Handles deleting an item
  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }
    try {
      await api.delete(`/items/${itemId}`);
      setItems(items.filter((item) => item.id !== itemId));
      toast.success("Item deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete item.");
    }
  };

  // Handles user logout
  const handleLogout = () => {
    logout();
    router.push("/auth/signin");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <AddItemModal 
          onSuccess={handleSuccess}
          triggerButton={<Button>Add New Item</Button>}
        />
      </div>

      {/* Control Bar for Search, Filter, and Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 p-4 border rounded-lg bg-slate-50">
        <Input 
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="filter-type">Filter by Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="filter-type" className="w-full md:w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bookmark">Bookmark</SelectItem>
                <SelectItem value="snippet">Snippet</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="sort-by">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort-by" className="w-full md:w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Date (Newest)</SelectItem>
                <SelectItem value="date_asc">Date (Oldest)</SelectItem>
                <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                <SelectItem value="title_desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Display Area for Items */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">My Items</h2>
        {items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="truncate text-gray-500">{item.content}</p>
                  <div className="mt-2">
                    <span className="text-sm font-medium bg-gray-200 px-2 py-1 rounded-full">
                      {item.item_type}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="space-x-2">
                  <AddItemModal 
                    itemToEdit={item}
                    onSuccess={handleSuccess}
                    triggerButton={<Button variant="outline" size="sm">Edit</Button>}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p>No items found. Add one to get started!</p>
        )}
      </div>
      
      <button
        onClick={handleLogout}
        className="mt-8 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Log Out
      </button>
    </div>
  );
}