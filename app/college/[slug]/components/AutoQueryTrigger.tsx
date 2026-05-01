"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AskQueryModal from "./AskQueryModal";

interface Props {
  slug: string;
  collegeName: string;
}

export default function AutoQueryTrigger({ slug, collegeName }: Props) {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("query") === "1") {
      setShow(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("query");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  if (!show) return null;
  return <AskQueryModal slug={slug} collegeName={collegeName} autoOpen />;
}
