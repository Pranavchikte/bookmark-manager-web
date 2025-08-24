"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import AddItemModal from "@/components/shared/AddItemModal";
import api from "@/lib/api";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("/items/");
        setItems(response.data);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      }
    };
    fetchItems();
  }, []);

  const handleSuccess = (item: Item) => {
    const itemExists = items.find(i => i.id === item.id);
    if (itemExists) {
      setItems(items.map(i => (i.id === item.id ? item : i)));
    } else {
      setItems([...items, item]);
    }
  };
  
  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }
    try {
      await api.delete(`/items/${itemId}`);
      setItems(items.filter((item) => item.id !== itemId));
      toast.success("Item deleted successfully.");
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item.");
    }
  };

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
                </CardContent> {/* <-- THIS WAS THE LINE WITH THE TYPO */}
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
          <p>No items yet. Add one to get started!</p>
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