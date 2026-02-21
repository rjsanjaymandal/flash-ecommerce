"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import Image from "next/image";

interface SortableMediaItemProps {
  id: string;
  url: string;
  isMain: boolean;
  onRemove: (url: string) => void;
  onSetMain: (url: string) => void;
}

function SortableMediaItem({
  id,
  url,
  isMain,
  onRemove,
  onSetMain,
}: SortableMediaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group aspect-square rounded-none overflow-hidden border-2 bg-background transition-all duration-300",
        isDragging && "shadow-2xl ring-2 ring-black opacity-80 scale-105 z-50",
        isMain
          ? "border-black border-4 ring-2 ring-black/10"
          : "border-foreground/10",
      )}
    >
      {url.startsWith("http") ||
      url.startsWith("/") ||
      url.startsWith("data:") ? (
        <Image
          src={url}
          alt="Product gallery"
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 p-4 text-center">
          <span className="text-[10px] font-mono text-zinc-500 uppercase leading-relaxed">
            Invalid Source Path
          </span>
        </div>
      )}

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1 bg-black rounded-none cursor-grab active:cursor-grabbing text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Main Image Indicator/Toggle */}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => onSetMain(url)}
        className={cn(
          "absolute bottom-2 left-2 h-7 w-7 rounded-none bg-white border border-black hover:bg-black hover:text-white shadow-sm transition-opacity",
          isMain
            ? "text-blue-500 opacity-100"
            : "text-gray-400 opacity-0 group-hover:opacity-100",
        )}
        title={isMain ? "Main Image" : "Set as Main Image"}
      >
        <Star className={cn("h-4 w-4", isMain && "fill-current")} />
      </Button>

      {/* Remove Button */}
      <Button
        type="button"
        size="icon"
        variant="destructive"
        onClick={() => onRemove(url)}
        className="absolute top-2 right-2 h-7 w-7 rounded-none bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
      >
        <Trash2 className="h-3 w-3" />
      </Button>

      {isMain && (
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-black text-white text-[9px] font-mono font-bold uppercase rounded-none shadow-sm pointer-events-none z-10">
          Primary
        </div>
      )}
    </div>
  );
}

interface DraggableMediaGridProps {
  urls: string[];
  mainImageUrl: string;
  onUpdate: (newUrls: string[]) => void;
  onSetMain: (url: string) => void;
}

export function DraggableMediaGrid({
  urls,
  mainImageUrl,
  onUpdate,
  onSetMain,
}: DraggableMediaGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = urls.indexOf(active.id as string);
      const newIndex = urls.indexOf(over.id as string);
      const newUrls = arrayMove(urls, oldIndex, newIndex);
      onUpdate(newUrls);

      // If we move something to index 0, it becomes main
      if (newIndex === 0) {
        onSetMain(newUrls[0]);
      } else if (oldIndex === 0) {
        // If we move the main image away from index 0, the new index 0 becomes main
        onSetMain(newUrls[0]);
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={urls} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {urls.map((url, index) => (
            <div
              key={url}
              className={cn(index === 0 && "col-span-2 row-span-2")}
            >
              <SortableMediaItem
                id={url}
                url={url}
                isMain={index === 0}
                onSetMain={(targetUrl) => {
                  // Move to front
                  const current = [...urls];
                  const idx = current.indexOf(targetUrl);
                  if (idx > 0) {
                    const newUrls = [
                      targetUrl,
                      ...current.filter((u) => u !== targetUrl),
                    ];
                    onUpdate(newUrls);
                    onSetMain(targetUrl);
                  }
                }}
                onRemove={async (removedUrl) => {
                  const newUrls = urls.filter((u) => u !== removedUrl);
                  onUpdate(newUrls);
                  if (removedUrl === mainImageUrl && newUrls.length > 0) {
                    onSetMain(newUrls[0]);
                  }

                  // Enterprise Cleanup: Delete from storage
                  if (removedUrl.includes("cloudinary.com")) {
                    const { deleteImage } =
                      await import("@/lib/services/upload-service");
                    const result = await deleteImage(removedUrl);
                    if (result.success) {
                      console.log("Storage cleaned up successfully");
                    }
                  }
                }}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
