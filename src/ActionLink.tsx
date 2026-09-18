import type { AnchorHTMLAttributes } from "react";

// The design supplies a telephone number, but no checkout or application URL.
// Replace the two contact destinations here when those services are available.
export const destinations = {
  program: "#program",
  formats: "#formats",
  speakers: "#speakers",
  tickets: "#tickets",
  phone: "tel:+79013404303",
  booking: "tel:+79013404303",
  application: "tel:+79013404303",
};

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  destination: keyof typeof destinations;
};

export function ActionLink({ destination, children, ...props }: Props) {
  return (
    <a href={destinations[destination]} {...props}>
      {children}
    </a>
  );
}
