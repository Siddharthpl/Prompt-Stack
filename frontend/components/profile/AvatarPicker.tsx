import React from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Edit } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const avatarOptions = [
  "/avatars/avatar1.svg",
  "/avatars/avatar2.svg",
  "/avatars/avatar3.svg",
  "/avatars/avatar4.svg",
  "/avatars/avatar5.svg",
  "/avatars/avatar6.svg",
  "/avatars/avatar7.svg",
  "/avatars/avatar8.svg",
  "/avatars/avatar9.svg",
  "/avatars/avatar10.svg",
];

interface AvatarPickerProps {
  selected: string;
  onSelect: (url: string) => void;
  avatarUrl?: string;
}

export default function AvatarPicker({ selected, onSelect, avatarUrl }: AvatarPickerProps) {
  return (
    <div className="space-y-2">
      <Collapsible>
        <CollapsibleTrigger className="flex gap-2 items-center cursor-pointer">
           <Avatar>
                  <AvatarImage
                    src={avatarUrl || selected}
                    alt="Profile"
                  />
                  <AvatarFallback>
                    {""}
                  </AvatarFallback>
          </Avatar> 
          <Edit className="inline h-4 w-4 mr-1" />
        </CollapsibleTrigger>
        <CollapsibleContent className="grid grid-cols-5 gap-4 mt-4">
          {avatarOptions.map((url) => (
            <img
              key={url}
              src={url}
              alt="avatar"
              onClick={() => onSelect(url)}
              className={`w-16 h-16 rounded-full cursor-pointer border-2 transition hover:scale-105 ${
                selected === url ? "border-blue-500" : "border-transparent"
              }`}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
