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

export default function NewStadiumPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const form = useForm<StadiumFormValues>({
    resolver: zodResolver(stadiumFormSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      pricePerHour: 0,
      sportTypes: [],
      facilities: [],
      rules: "",
      capacity: 0,
      contactPhone: "",
      contactEmail: "",
      images: [],
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
      console.log("Submitting stadium data:", data);
      
      const response = await fetch("/api/stadiums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Stadium creation response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Stadium creation error response:", errorData);
        throw new Error(errorData.message || "Failed to create stadium");
      }

      const stadium = await response.json();
      console.log("Created stadium:", stadium);
      
      toast.success("Stadium has been created successfully.");
      
      router.push(`/stadiums/${stadium.id}`);
    } catch (error) {
      console.error("Stadium creation error:", error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else {
        console.error("Unknown error type:", typeof error);
      }
      
      toast.error(error instanceof Error ? error.message : "An error occurred while creating the stadium");
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">List a New Stadium</h1>
      
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Stadium Details</CardTitle>
          <CardDescription className="text-gray-300">
            Provide detailed information about your stadium to attract potential users.
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
                      <FormLabel className="text-white">Stadium Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter stadium name" className="text-white bg-gray-700 border-gray-600" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pricePerHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Price Per Hour</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="0.00" 
                          className="text-white bg-gray-700 border-gray-600" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your stadium, its features, and what makes it special" 
                        className="min-h-[100px] text-white bg-gray-700 border-gray-600" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" className="text-white bg-gray-700 border-gray-600" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" className="text-white bg-gray-700 border-gray-600" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">State/Province (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="State or province" className="text-white bg-gray-700 border-gray-600" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Postal code" className="text-white bg-gray-700 border-gray-600" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" className="text-white bg-gray-700 border-gray-600" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Capacity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="Number of people" 
                          className="text-white bg-gray-700 border-gray-600" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
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
                      <FormLabel className="text-white">Sport Types</FormLabel>
                      <FormControl>
                        <MultiSelect
                          placeholder="Select sports"
                          options={sportTypes}
                          selected={field.value || []}
                          onChange={field.onChange}
                          className="text-white bg-gray-700 border-gray-600"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Facilities</FormLabel>
                      <FormControl>
                        <MultiSelect
                          placeholder="Select facilities"
                          options={facilityOptions}
                          selected={field.value || []}
                          onChange={field.onChange}
                          className="text-white bg-gray-700 border-gray-600"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Rules & Regulations</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any specific rules or information users should know" 
                        className="min-h-[80px] text-white bg-gray-700 border-gray-600" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Contact Phone (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" className="text-white bg-gray-700 border-gray-600" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Contact Email (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Email address" className="text-white bg-gray-700 border-gray-600" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel className="text-white">Stadium Images</FormLabel>
                <div className="space-y-2">
                  <FormLabel className="text-white">Add Image URL</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="new-image-url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="bg-gray-700 text-white border-gray-600"
                    />
                    <Button 
                      type="button" 
                      onClick={addImageUrl} 
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Add Image
                    </Button>
                  </div>
                </div>

                {imageUrls.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    {imageUrls.map((url) => (
                      <div
                        key={url}
                        className="relative group rounded-lg overflow-hidden h-48 bg-gray-700"
                      >
                        <img
                          src={url}
                          alt="Stadium"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x150?text=Invalid+Image+URL";
                          }}
                        />
        <button 
                          type="button"
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImageUrl(url)}
        >
                          &times;
        </button>
      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-700 rounded-lg text-center text-gray-300 mt-3">
                    No images added yet. Add images to showcase your stadium.
                  </div>
                )}
                <FormDescription className="text-gray-300">
                  Add images of your stadium to showcase its features
                </FormDescription>
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Stadium"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
