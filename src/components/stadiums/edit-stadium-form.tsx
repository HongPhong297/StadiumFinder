"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

const sportTypes = [
  { label: "Football", value: "Football" },
  { label: "Basketball", value: "Basketball" },
  { label: "Tennis", value: "Tennis" },
  { label: "Cricket", value: "Cricket" },
  { label: "Baseball", value: "Baseball" },
  { label: "Volleyball", value: "Volleyball" },
  { label: "Hockey", value: "Hockey" },
  { label: "Rugby", value: "Rugby" },
  { label: "Badminton", value: "Badminton" },
];

const facilityOptions = [
  { label: "Changing Rooms", value: "Changing Rooms" },
  { label: "Showers", value: "Showers" },
  { label: "Parking", value: "Parking" },
  { label: "Lighting", value: "Lighting" },
  { label: "Seating", value: "Seating" },
  { label: "Scoreboard", value: "Scoreboard" },
  { label: "Equipment Rental", value: "Equipment Rental" },
  { label: "Cafe/Restaurant", value: "Cafe/Restaurant" },
  { label: "WiFi", value: "WiFi" },
  { label: "First Aid", value: "First Aid" },
];

const stadiumFormSchema = z.object({
  name: z.string().min(3, "Stadium name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  pricePerHour: z.coerce.number().min(1, "Price per hour must be at least 1"),
  sportTypes: z.array(z.string()).min(1, "At least one sport type is required"),
  facilities: z.array(z.string()).min(1, "At least one facility is required"),
  rules: z.string().optional(),
  capacity: z.coerce.number().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional(),
  images: z.array(z.string()).optional(),
});

type StadiumFormValues = z.infer<typeof stadiumFormSchema>;

interface StadiumWithDetails {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  pricePerHour: number;
  sportTypes: string[];
  facilities: string[];
  rules: string | null;
  capacity: number | null;
  contactPhone: string | null;
  contactEmail: string | null;
  images: { id: string; url: string }[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface EditStadiumFormProps {
  stadium: StadiumWithDetails;
}

export default function EditStadiumForm({ stadium }: EditStadiumFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(
    stadium.images.map((img) => img.url)
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  const form = useForm<StadiumFormValues>({
    resolver: zodResolver(stadiumFormSchema),
    defaultValues: {
      name: stadium.name,
      description: stadium.description || "",
      address: stadium.address,
      city: stadium.city,
      state: stadium.state || "",
      postalCode: stadium.postalCode,
      country: stadium.country,
      latitude: stadium.latitude || undefined,
      longitude: stadium.longitude || undefined,
      pricePerHour: stadium.pricePerHour,
      sportTypes: stadium.sportTypes || [],
      facilities: stadium.facilities || [],
      rules: stadium.rules || "",
      capacity: stadium.capacity || 0,
      contactPhone: stadium.contactPhone || "",
      contactEmail: stadium.contactEmail || "",
      images: stadium.images.map((img) => img.url),
    },
  });

  const addImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl)) {
      const updatedUrls = [...imageUrls, newImageUrl];
      setImageUrls(updatedUrls);
      form.setValue("images", updatedUrls);
      setNewImageUrl("");
    }
  };

  const removeImageUrl = (url: string) => {
    const updatedUrls = imageUrls.filter((i) => i !== url);
    setImageUrls(updatedUrls);
    form.setValue("images", updatedUrls);
  };

  async function onSubmit(data: StadiumFormValues) {
    setIsSubmitting(true);
    
    try {
      console.log("Updating stadium data:", data);
      
      const response = await fetch(`/api/stadiums/${stadium.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Stadium update response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Stadium update error response:", errorData);
        throw new Error(errorData.message || "Failed to update stadium");
      }

      const updatedStadium = await response.json();
      console.log("Updated stadium:", updatedStadium);
      
      toast.success("Stadium has been updated successfully.");
      
      // Redirect to the stadium page or dashboard
      router.push(`/stadiums/${stadium.id}`);
      router.refresh();
    } catch (error) {
      console.error("Stadium update error:", error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else {
        console.error("Unknown error type:", typeof error);
      }
      
      toast.error(error instanceof Error ? error.message : "An error occurred while updating the stadium");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-gray-900">Edit Stadium</CardTitle>
        <CardDescription className="text-gray-600">
          Update the information for {stadium.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Stadium Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter stadium name" {...field} className="bg-white text-black border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Price Per Hour</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} className="bg-white text-black border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your stadium" {...field} className="bg-white text-black border-gray-300" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Stadium address" {...field} className="bg-white text-black border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} className="bg-white text-black border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="State/Province (optional)" {...field} className="bg-white text-black border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal Code" {...field} className="bg-white text-black border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} className="bg-white text-black border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="Stadium capacity (optional)" {...field} className="bg-white text-black border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sportTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Sport Types</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={sportTypes}
                        selected={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select applicable sport types"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Facilities</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={facilityOptions}
                        selected={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select available facilities"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Rules</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter stadium rules (optional)" {...field} className="bg-white text-black border-gray-300" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact phone (optional)" {...field} className="bg-white text-black border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Contact email (optional)" {...field} className="bg-white text-black border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-image-url" className="text-gray-700">Add Image URL</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="new-image-url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-white text-black border-gray-300"
                />
                <Button type="button" onClick={addImageUrl} className="bg-gray-700 text-white hover:bg-gray-600">
                  Add
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {imageUrls.map((url) => (
                <div key={url} className="relative group">
                  <img src={url} alt="Stadium" className="w-full h-32 object-cover rounded-md" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => removeImageUrl(url)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {imageUrls.length === 0 && <p className="text-gray-500 col-span-3">No images added yet.</p>}
            </div>

            <CardFooter className="flex justify-end pt-6">
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 