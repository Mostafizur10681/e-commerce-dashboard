import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { XIcon } from "lucide-react";

interface ProductImageUploaderProps {
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  setFeatured: (idx: number) => void;
}

export default function ProductImageUploader({ setImages, setFeatured }: ProductImageUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const readers = acceptedFiles.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      );
      Promise.all(readers).then((imgs) => {
        setImages((prev) => [...prev, ...imgs]);
        // if no featured yet, set first as featured
        if (imgs.length) setFeatured(0);
      });
    },
    [setImages, setFeatured]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  // The component expects parent to manage images state and pass callbacks.
  // This UI only provides the dropzone area.
  return (
    <div className="border border-dashed rounded-xl p-6 text-center cursor-pointer" {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-gray-600 dark:text-gray-300">Drop images here ...</p>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">
          Drag &amp; drop images here, or click to browse files (jpg, jpeg, png, webp)
        </p>
      )}
    </div>
  );
}
