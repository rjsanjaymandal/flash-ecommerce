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
        "relative group aspect-square rounded-md overflow-hidden border bg-background",
        isDragging && "shadow-xl ring-2 ring-primary opacity-80",
        isMain && "ring-2 ring-blue-500",
      )}
    >
      <img
        src={url}
        alt="Product gallery"
        className="object-cover w-full h-full"
      />

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1 bg-black/50 rounded-md cursor-grab active:cursor-grabbing text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
          "absolute bottom-2 left-2 h-7 w-7 rounded-full bg-white/90 hover:bg-white shadow-sm transition-opacity",
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
        className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-3 w-3" />
      </Button>

      {isMain && (
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold uppercase rounded-sm shadow-sm pointer-events-none">
          Main
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
      onUpdate(arrayMove(urls, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={urls} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {urls.map((url) => (
            <SortableMediaItem
              key={url}
              id={url}
              url={url}
              isMain={url === mainImageUrl}
              onSetMain={onSetMain}
              onRemove={(removedUrl) => {
                const newUrls = urls.filter((u) => u !== removedUrl);
                onUpdate(newUrls);
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
