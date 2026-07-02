import React, { useState, useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Attribute } from "@/types";

export default function AttributesFields() {
  const { control, register, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "attributes",
  });

  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([]);
  const [selectedAttrId, setSelectedAttrId] = useState<string>("");
  const [customAttrName, setCustomAttrName] = useState<string>("");
  const [attrValue, setAttrValue] = useState<string>("");
  const [selectedAttrValues, setSelectedAttrValues] = useState<string[]>([]);

  useEffect(() => {
    const fetchAttrs = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        const res = await fetch("/api/attributes?limit=1000", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setAvailableAttributes(data.attributes || []);
        }
      } catch (e) {
        console.error("Failed to load attributes", e);
      }
    };
    fetchAttrs();
  }, []);

  const handleAttrChange = (id: string) => {
    setSelectedAttrId(id);
    if (id === "custom") {
      setSelectedAttrValues([]);
      setAttrValue("");
    } else {
      const match = availableAttributes.find((a) => a.id === id);
      if (match) {
        setSelectedAttrValues(match.values || []);
        setAttrValue(match.values?.[0] || "");
      }
    }
  };

  const handleAddAttribute = () => {
    let name = "";
    if (selectedAttrId === "custom") {
      name = customAttrName.trim();
    } else {
      const match = availableAttributes.find((a) => a.id === selectedAttrId);
      name = match ? match.name : "";
    }

    const value = attrValue.trim();
    if (!name || !value) return;

    // Avoid duplicates of the exact same name and value combination
    const currentAttrs = watch("attributes") || [];
    const exists = currentAttrs.some(
      (a: any) => a.name.toLowerCase() === name.toLowerCase() && a.value.toLowerCase() === value.toLowerCase()
    );
    if (exists) return;

    append({ name, value });

    // Reset inputs
    setCustomAttrName("");
    setAttrValue("");
    setSelectedAttrId("");
    setSelectedAttrValues([]);
  };

  return (
    <div className="rounded-2xl shadow-sm p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <h2 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">Product Attributes</h2>
      
      {/* Add New Attribute section */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Select Attribute</Label>
            <Select onValueChange={handleAttrChange} value={selectedAttrId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose an attribute" />
              </SelectTrigger>
              <SelectContent>
                {availableAttributes.map((attr) => (
                  <SelectItem key={attr.id} value={attr.id}>
                    {attr.name}
                  </SelectItem>
                ))}
                <SelectItem value="custom">+ Custom Attribute</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedAttrId === "custom" && (
            <div>
              <Label htmlFor="customAttrName">Attribute Name</Label>
              <Input
                id="customAttrName"
                value={customAttrName}
                onChange={(e) => setCustomAttrName(e.target.value)}
                placeholder="e.g. Weight, Material"
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label>Attribute Value</Label>
            {selectedAttrValues.length > 0 ? (
              <Select onValueChange={setAttrValue} value={attrValue}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent>
                  {selectedAttrValues.map((val) => (
                    <SelectItem key={val} value={val}>
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={attrValue}
                onChange={(e) => setAttrValue(e.target.value)}
                placeholder="e.g. Red, Large, 5kg"
                className="mt-1"
              />
            )}
          </div>
        </div>

        <Button
          type="button"
          onClick={handleAddAttribute}
          className="bg-primary hover:bg-primary-dark text-white rounded-xl flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Attribute
        </Button>
      </div>

      {/* Attributes List */}
      {fields.length > 0 ? (
        <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-55 dark:bg-gray-850/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="p-3">Attribute Name</th>
                <th className="p-3">Value</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {fields.map((field, index) => (
                <tr key={field.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                  <td className="p-3 font-semibold text-gray-900 dark:text-white">
                    {watch(`attributes.${index}.name`)}
                    <input type="hidden" {...register(`attributes.${index}.name`)} />
                  </td>
                  <td className="p-3 text-gray-650 dark:text-gray-300">
                    <Input
                      {...register(`attributes.${index}.value`)}
                      className="h-8 max-w-[200px]"
                    />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No attributes added yet.</p>
      )}
    </div>
  );
}
