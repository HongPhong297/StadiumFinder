"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { format, parse, isValid } from "date-fns";

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate: string | null;
}

interface AvailabilityManagerProps {
  stadiumId: string;
  existingAvailability: AvailabilitySlot[];
}

const daysOfWeek = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function AvailabilityManager({
  stadiumId,
  existingAvailability,
}: AvailabilityManagerProps) {
  const [recurringSlots, setRecurringSlots] = useState<AvailabilitySlot[]>(
    existingAvailability.filter((slot) => slot.isRecurring) || []
  );
  
  const [specificSlots, setSpecificSlots] = useState<AvailabilitySlot[]>(
    existingAvailability.filter((slot) => !slot.isRecurring) || []
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("recurring");

  // Add a new weekly recurring slot
  const addRecurringSlot = (dayOfWeek: number) => {
    setRecurringSlots([
      ...recurringSlots,
      {
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
        isRecurring: true,
        specificDate: null,
      },
    ]);
  };

  // Add a new specific date slot
  const addSpecificDateSlot = () => {
    // Default to tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = format(tomorrow, "yyyy-MM-dd");
    
    setSpecificSlots([
      ...specificSlots,
      {
        dayOfWeek: tomorrow.getDay(),
        startTime: "09:00",
        endTime: "17:00",
        isRecurring: false,
        specificDate: formattedDate,
      },
    ]);
  };

  // Update a recurring slot
  const updateRecurringSlot = (index: number, field: string, value: string | number) => {
    const updatedSlots = [...recurringSlots];
    updatedSlots[index] = {
      ...updatedSlots[index],
      [field]: value,
    };
    setRecurringSlots(updatedSlots);
  };

  // Update a specific date slot
  const updateSpecificSlot = (index: number, field: string, value: string | number) => {
    const updatedSlots = [...specificSlots];
    
    // If updating the date, also update the day of week
    if (field === "specificDate" && typeof value === "string") {
      const date = new Date(value);
      if (isValid(date)) {
        updatedSlots[index] = {
          ...updatedSlots[index],
          [field]: value,
          dayOfWeek: date.getDay(),
        };
      }
    } else {
      updatedSlots[index] = {
        ...updatedSlots[index],
        [field]: value,
      };
    }
    
    setSpecificSlots(updatedSlots);
  };

  // Remove a recurring slot
  const removeRecurringSlot = (index: number) => {
    const updatedSlots = [...recurringSlots];
    updatedSlots.splice(index, 1);
    setRecurringSlots(updatedSlots);
  };

  // Remove a specific date slot
  const removeSpecificSlot = (index: number) => {
    const updatedSlots = [...specificSlots];
    updatedSlots.splice(index, 1);
    setSpecificSlots(updatedSlots);
  };

  // Save all availability settings
  const saveAvailability = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate all slots first
      const allSlots = [...recurringSlots, ...specificSlots];
      
      // Check for empty or invalid times
      const invalidSlots = allSlots.filter(slot => {
        if (!slot.startTime || !slot.endTime) return true;
        
        const startTime = parse(slot.startTime, "HH:mm", new Date());
        const endTime = parse(slot.endTime, "HH:mm", new Date());
        
        return !isValid(startTime) || !isValid(endTime) || startTime >= endTime;
      });
      
      if (invalidSlots.length > 0) {
        toast.error("Some time slots have invalid start or end times");
        setIsSubmitting(false);
        return;
      }
      
      // If specific dates are selected, validate them
      const invalidDates = specificSlots.filter(slot => !slot.specificDate);
      if (invalidDates.length > 0) {
        toast.error("Some specific slots are missing dates");
        setIsSubmitting(false);
        return;
      }
      
      const response = await fetch(`/api/stadiums/${stadiumId}/availability`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recurringSlots,
          specificSlots,
        }),
      });
      
      if (response.ok) {
        toast.success("Availability settings saved successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save availability settings");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("An error occurred while saving availability");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if a day has any recurring slots
  const hasDaySlots = (day: number) => {
    return recurringSlots.some(slot => slot.dayOfWeek === day);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="recurring" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="recurring" className="text-white data-[state=active]:bg-blue-600">
            Weekly Schedule
          </TabsTrigger>
          <TabsTrigger value="specific" className="text-white data-[state=active]:bg-blue-600">
            Specific Dates
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recurring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {daysOfWeek.map((day) => (
              <div key={day.value} className="rounded-lg border border-gray-600 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">{day.label}</h3>
                  {!hasDaySlots(day.value) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addRecurringSlot(day.value)}
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Hours
                    </Button>
                  )}
                </div>
                
                {recurringSlots
                  .filter((slot) => slot.dayOfWeek === day.value)
                  .map((slot, index) => {
                    const slotIndex = recurringSlots.findIndex(s => 
                      s.dayOfWeek === day.value && 
                      s.startTime === slot.startTime && 
                      s.endTime === slot.endTime
                    );
                    
                    return (
                      <div key={`${day.value}-${index}`} className="flex items-center space-x-2 mb-2">
                        <div className="grid grid-cols-2 gap-2 flex-grow">
                          <div>
                            <Label htmlFor={`start-${day.value}-${index}`} className="text-gray-300 text-xs mb-1 block">
                              Start Time
                            </Label>
                            <Input
                              id={`start-${day.value}-${index}`}
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => updateRecurringSlot(slotIndex, "startTime", e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`end-${day.value}-${index}`} className="text-gray-300 text-xs mb-1 block">
                              End Time
                            </Label>
                            <Input
                              id={`end-${day.value}-${index}`}
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => updateRecurringSlot(slotIndex, "endTime", e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRecurringSlot(slotIndex)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 mt-5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                
                {recurringSlots.filter((slot) => slot.dayOfWeek === day.value).length === 0 && (
                  <p className="text-gray-400 text-sm">No hours set for {day.label}</p>
                )}
                
                {hasDaySlots(day.value) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addRecurringSlot(day.value)}
                    className="mt-2 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Another Time Slot
                  </Button>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="specific" className="space-y-6">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={addSpecificDateSlot}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Specific Date
            </Button>
          </div>
          
          {specificSlots.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-600 rounded-lg">
              <p className="text-gray-400">No specific dates added yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Add specific dates for holidays or special events
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {specificSlots.map((slot, index) => (
                <div key={index} className="border border-gray-600 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <Label htmlFor={`date-${index}`} className="text-gray-300 text-xs mb-1 block">
                        Date
                      </Label>
                      <Input
                        id={`date-${index}`}
                        type="date"
                        value={slot.specificDate || ""}
                        onChange={(e) => updateSpecificSlot(index, "specificDate", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`specific-start-${index}`} className="text-gray-300 text-xs mb-1 block">
                        Start Time
                      </Label>
                      <Input
                        id={`specific-start-${index}`}
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSpecificSlot(index, "startTime", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`specific-end-${index}`} className="text-gray-300 text-xs mb-1 block">
                        End Time
                      </Label>
                      <Input
                        id={`specific-end-${index}`}
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSpecificSlot(index, "endTime", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpecificSlot(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="pt-4 border-t border-gray-700">
        <Button 
          onClick={saveAvailability} 
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Availability"
          )}
        </Button>
      </div>
    </div>
  );
} 