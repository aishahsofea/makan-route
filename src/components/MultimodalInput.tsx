"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Button, Textarea } from "@heroui/react";
import { UseChatHelpers } from "@ai-sdk/react";
import { ImageAttachment } from "@/types/message";
import { ImageIcon, X, Send } from "lucide-react";
import { validateImageFile } from "@/lib/file-utils";

type MultimodalInputProps = {
  input: UseChatHelpers["input"];
  isDisabled: boolean;
  setInput: UseChatHelpers["setInput"];
  handleSubmit: (e: FormEvent, images?: ImageAttachment[]) => void;
};

export const MultimodalInput = ({
  input,
  isDisabled,
  setInput,
  handleSubmit,
}: MultimodalInputProps) => {
  const [selectedImages, setSelectedImages] = useState<ImageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInput = (value: string) => {
    setInput(value);
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        continue;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("image_url", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const uploadedImage: ImageAttachment = await response.json();
        setSelectedImages((prev) => [...prev, uploadedImage]);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    }
  };

  const removeImage = (imageId: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const onSubmit = (e: FormEvent) => {
    if ((!input.trim() && selectedImages.length === 0) || isDisabled) {
      e.preventDefault();
      return;
    }

    handleSubmit(e, selectedImages);
    setSelectedImages([]);
  };

  return (
    <div>
      {selectedImages.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedImages.map((image) => (
            <div key={image.id} className="relative">
              <img
                src={image.url}
                alt={image.originalName}
                className="h-20 w-20 object-cover rounded-lg border"
              />
              <button
                onClick={() => removeImage(image.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 cursor-pointer"
              >
                <X size={8} />
              </button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={onSubmit} className="flex gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            isDisabled={isDisabled}
            className="min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl"
            placeholder="Ask about food recommendations or upload a photo of your cravings..."
            value={input}
            onValueChange={handleInput}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSubmit(event);
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
          />

          <Button
            type="button"
            onPress={() => fileInputRef.current?.click()}
            isDisabled={isUploading}
            variant="flat"
            isIconOnly
            size="sm"
          >
            <ImageIcon size={16} />
          </Button>

          <Button
            style={{ background: "var(--secondary)" }}
            variant="flat"
            isIconOnly
            size="sm"
            type="submit"
            isDisabled={
              isDisabled ||
              isUploading ||
              !input.trim() ||
              (!input.trim() && selectedImages.length === 0)
            }
          >
            <Send size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
};
