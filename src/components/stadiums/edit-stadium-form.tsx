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
        <CardTitle>Edit Stadium</CardTitle>
        <CardDescription>
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
                    <FormLabel>Stadium Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter stadium name" {...field} />
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
                    <FormLabel>Price Per Hour</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your stadium, its features, and what makes it special" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
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
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
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
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
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
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="State or province (optional)" {...field} />
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
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal code" {...field} />
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
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
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
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="Number of people" {...field} />
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
                    <FormLabel>Sport Types</FormLabel>
                    <FormControl>
                      <MultiSelect
                        placeholder="Select sports"
                        options={sportTypes}
                        selected={field.value || []}
                        onChange={field.onChange}
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
                    <FormLabel>Facilities</FormLabel>
                    <FormControl>
                      <MultiSelect
                        placeholder="Select facilities"
                        options={facilityOptions}
                        selected={field.value || []}
                        onChange={field.onChange}
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
                  <FormLabel>Rules & Regulations</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any specific rules or information users should know" 
                      className="min-h-[80px]" 
                      {...field} 
                    />
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
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number (optional)" {...field} />
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
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email address (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Images</FormLabel>
              <div className="space-y-4">
                <div className="flex">
                  <Input
                    placeholder="Enter image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 mr-2"
                  />
                  <Button type="button" onClick={addImageUrl}>
                    Add
                  </Button>
                </div>
                
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={url} 
                          alt={`Stadium image ${index + 1}`} 
                          className="h-32 w-full object-cover rounded-md" 
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                          onClick={() => removeImageUrl(url)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 