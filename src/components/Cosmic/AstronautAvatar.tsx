import male from "@/assets/astronaut-male.png";
import female from "@/assets/astronaut-female.png";
import { cn } from "@/lib/utils";

interface Props {
  avatar: string | null | undefined;
  className?: string;
  alt?: string;
}

export function AstronautAvatar({ avatar, className, alt = "Astronaut avatar" }: Props) {
  const src = avatar === "astronaut_female" ? female : male;
  return (
    <img
      src={src}
      alt={alt}
      width={512}
      height={512}
      loading="lazy"
      className={cn("rounded-full border border-border bg-panel object-cover", className)}
    />
  );
}

export const AVATAR_OPTIONS = [
  { id: "astronaut_male", label: "Commander", src: male },
  { id: "astronaut_female", label: "Navigator", src: female },
];
