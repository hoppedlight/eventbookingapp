import React from "react";
import { Calendar as CalendarIcon, DollarSign, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const categories = [
  "All",
  "Music",
  "Sports",
  "Arts",
  "Family",
  "Food & Drink",
  "Business",
  "Technology",
  "Health",
  "Education",
  "Other"
];

export default function FilterSidebar({ filters, setFilters, onApply, onClear, onClose }) {
  return (
    <div className="bg-[#472426] rounded-2xl p-6 space-y-6 h-fit sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-[#ea2a33]/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-[#ea2a33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          Filters
        </h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Category */}
      <div className="space-y-3">
        <Label className="text-white font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#ea2a33] rounded-full"></span>
          Category
        </Label>
        <RadioGroup
          value={filters.category}
          onValueChange={(value) => setFilters({ ...filters, category: value })}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={cat}
                  id={cat}
                  className="border-white/30 text-[#ea2a33]"
                />
                <Label
                  htmlFor={cat}
                  className="text-sm text-white/80 hover:text-white cursor-pointer smooth-transition"
                >
                  {cat}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Date Range */}
      <div className="space-y-3">
        <Label className="text-white font-semibold flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#ea2a33]" />
          Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left bg-[#221112] border-white/10 text-white hover:bg-[#221112] hover:border-[#ea2a33]"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.date ? format(filters.date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#472426] border-white/10">
            <Calendar
              mode="single"
              selected={filters.date}
              onSelect={(date) => setFilters({ ...filters, date })}
              className="text-white"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-white font-semibold flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#ea2a33]" />
          Price Range
        </Label>
        <div className="space-y-4">
          <Slider
            value={[filters.maxPrice]}
            onValueChange={([value]) => setFilters({ ...filters, maxPrice: value })}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">$0</span>
            <span className="text-[#ea2a33] font-semibold">${filters.maxPrice}</span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <Label className="text-white font-semibold flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#ea2a33]" />
          Location
        </Label>
        <Input
          placeholder="Enter city..."
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="bg-[#221112] border-white/10 text-white placeholder:text-white/40 focus-visible:ring-[#ea2a33]"
        />
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <Button
          onClick={onApply}
          className="w-full bg-[#ea2a33] hover:bg-[#ea2a33]/90 text-white font-semibold accent-glow"
        >
          Apply Filters
        </Button>
        <Button
          onClick={onClear}
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-[#221112] hover:text-[#ea2a33]"
        >
          Clear All
        </Button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(234, 42, 51, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(234, 42, 51, 0.8);
        }
      `}</style>
    </div>
  );
}