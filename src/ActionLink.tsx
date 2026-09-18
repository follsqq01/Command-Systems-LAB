import type { AnchorHTMLAttributes } from "react";

const ticketUrl = "https://omega-lab.ticketscloud.org";

export const destinations = {
  program: "#program",
  formats: "#formats",
  speakers: "#speakers",
  tickets: "#tickets",
  phone: "tel:+79013404303",
  booking: ticketUrl,
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
