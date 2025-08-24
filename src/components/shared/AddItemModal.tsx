"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Type definitions
type Item = {
  id: string;
  title: string;
  item_type: string;
  content: string;
  tags: string[];
};
interface AddItemModalProps {
  itemToEdit?: Item | null;
  onSuccess: (item: Item) => void;
  triggerButton: React.ReactNode;
}
const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  item_type: z.enum(["bookmark", "snippet", "note"]),
  content: z.string().min(1, "Content cannot be empty."),
  tags: z.string().optional(),
});

export default function AddItemModal({ itemToEdit, onSuccess, triggerButton }: AddItemModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEditMode = !!itemToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "", item_type: "bookmark", content: "", tags: "",
    },
  });

  useEffect(() => {
    const defaultVals = {
      title: "", item_type: "bookmark" as const, content: "", tags: "",
    };
    if (isEditMode && itemToEdit) {
      form.reset({
        title: itemToEdit.title,
        item_type: itemToEdit.item_type as "bookmark" | "snippet" | "note",
        content: itemToEdit.content,
        tags: itemToEdit.tags.join(", "),
      });
    } else {
      form.reset(defaultVals);
    }
  }, [itemToEdit, isEditMode, form, isOpen]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const processedValues = {
      ...values,
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
    };
    try {
      let response;
      if (isEditMode && itemToEdit) {
        response = await api.put(`/items/${itemToEdit.id}`, processedValues);
      } else {
        response = await api.post("/items/", processedValues);
      }
      onSuccess(response.data);
      toast.success(`Item ${isEditMode ? 'updated' : 'created'} successfully!`);
      setIsOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "An unexpected error occurred.";
      toast.error(`Error: ${errorMessage}`);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Item" : "Add a New Item"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Fields for Title, Content, and Tags (these are correct) */}
            <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., React Docs" {...field} /></FormControl><FormMessage /></FormItem> )} />
            
            {/* THIS IS THE CORRECTED SELECT FIELD STRUCTURE */}
            <FormField
              control={form.control}
              name="item_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bookmark">Bookmark</SelectItem>
                      <SelectItem value="snippet">Code Snippet</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="content" render={({ field }) => ( <FormItem><FormLabel>Content</FormLabel><FormControl><Input placeholder="e.g., https://react.dev" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="tags" render={({ field }) => ( <FormItem><FormLabel>Tags (comma separated)</FormLabel><FormControl><Input placeholder="e.g., react, javascript, webdev" {...field} /></FormControl><FormMessage /></FormItem> )} />
            
            <Button type="submit">Save Item</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}